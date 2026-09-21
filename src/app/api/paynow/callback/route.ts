import { db } from "@/lib/db";
import { getPaynow } from "@/lib/paynow";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

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

const PAID_STATUSES = new Set(["paid", "awaiting delivery"]);

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

    // Confirm with Paynow via poll URL when we have one
    let verified = PAID_STATUSES.has(status ?? "");
    if (order.paymentRef) {
      try {
        const paynow = getPaynow();
        const poll = await paynow.pollTransaction(order.paymentRef);
        verified = poll.paid === true || PAID_STATUSES.has(poll.status?.toLowerCase() ?? "");
      } catch {
        // fall back to verified posted status
      }
    }

    const newStatus = verified
      ? "PAID"
      : status === "failed" || status === "cancelled"
        ? "FAILED"
        : "AWAITING";

    await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: newStatus,
        ...(verified && { status: "CONFIRMED" }),
      },
    });

    await db.notification.create({
      data: {
        type: "PAYMENT",
        title: verified
          ? `Payment received — ${order.orderNumber}`
          : `Payment ${status ?? "update"} — ${order.orderNumber}`,
        body: `${order.customerName} · $${order.total.toFixed(2)} via Paynow (${params.paynowreference ?? "ref n/a"})`,
        link: "/admin/orders",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("paynow callback error", e);
    return NextResponse.json({ error: "Callback failed." }, { status: 500 });
  }
}
