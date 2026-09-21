import { db } from "@/lib/db";
import { amountMatches, getPaynow, isPaidStatus } from "@/lib/paynow";
import { notifyPaymentReceived } from "@/lib/notify";
import { createHash } from "crypto";
import { after, NextResponse } from "next/server";

/**
 * Paynow posts the transaction result here (resultUrl).
 * Body is urlencoded: reference, paynowreference, amount, status, pollurl, hash…
 *
 * Hash verification (per Paynow docs):
 *   concat all values EXCEPT hash (in posted order, URL-decoded) + integration key
 *   → SHA512 → uppercase hex → must equal posted hash.
 */
function verifyHash(params: [string, string][], postedHash: string): boolean {
  const key = process.env.PAYNOW_INTEGRATION_KEY;
  if (!key || !postedHash) return false;
  const concat = params
    .filter(([k]) => k.toLowerCase() !== "hash")
    .map(([, v]) => v)
    .join("");
  const hash = createHash("sha512")
    .update(concat + key, "utf8")
    .digest("hex")
    .toUpperCase();
  return hash === postedHash.toUpperCase();
}

export async function POST(req: Request) {
  try {
    const text = await req.text();

    // Preserve posted order & URL-decode values for hash verification
    const pairs: [string, string][] = text
      .split("&")
      .filter(Boolean)
      .map((kv) => {
        const i = kv.indexOf("=");
        const k = kv.slice(0, i);
        const v = kv.slice(i + 1);
        return [decodeURIComponent(k), decodeURIComponent(v.replace(/\+/g, " "))];
      });
    const params = Object.fromEntries(pairs);

    const reference = params.reference; // our orderNumber
    const status = params.status?.toLowerCase();
    const postedHash = params.hash ?? "";

    if (!reference) {
      return NextResponse.json({ error: "Missing reference." }, { status: 400 });
    }

    // Reject spoofed updates
    if (!verifyHash(pairs, postedHash)) {
      console.warn("paynow callback: hash mismatch for", reference);
      return NextResponse.json({ error: "Invalid hash." }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { orderNumber: reference },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ ok: true });
    }

    // Confirm with Paynow via poll URL when we have one
    let verified = isPaidStatus(status);
    if (order.paymentRef) {
      try {
        const paynow = getPaynow(order.id);
        const poll = await paynow.pollTransaction(order.paymentRef);
        verified = poll.paid === true || isPaidStatus(poll.status);
      } catch {
        // fall back to verified posted status
      }
    }

    const paid = verified && amountMatches(order.total, params.amount);
    if (verified && !paid) {
      console.warn("paynow callback: amount mismatch for", reference, {
        expected: order.total,
        received: params.amount,
      });
      await db.notification.create({
        data: {
          type: "PAYMENT",
          title: `Amount mismatch — ${order.orderNumber}`,
          body: `${order.customerName} · Expected $${order.total.toFixed(2)}, received $${params.amount ?? "unknown"} via Paynow`,
          link: "/admin/orders",
        },
      });
      return NextResponse.json({ ok: true });
    }

    const newStatus = paid
      ? "PAID"
      : status === "failed" || status === "cancelled"
        ? "FAILED"
        : "AWAITING";

    await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: newStatus,
        ...(paid && { status: "CONFIRMED" }),
      },
    });

    await db.notification.create({
      data: {
        type: "PAYMENT",
        title: paid
          ? `Payment received — ${order.orderNumber}`
          : `Payment ${status ?? "update"} — ${order.orderNumber}`,
        body: `${order.customerName} · $${order.total.toFixed(2)} via Paynow (${params.paynowreference ?? "ref n/a"})`,
        link: "/admin/orders",
      },
    });

    if (paid) {
      after(async () => {
        const paidOrder = await db.order.findUnique({
          where: { id: order.id },
          include: { items: true },
        });
        if (paidOrder) await notifyPaymentReceived(paidOrder).catch(console.error);
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("paynow callback error", e);
    return NextResponse.json({ error: "Callback failed." }, { status: 500 });
  }
}
