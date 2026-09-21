import { db } from "@/lib/db";
import { getPaynow } from "@/lib/paynow";
import { NextResponse } from "next/server";

const PAID_STATUSES = new Set(["paid", "awaiting delivery"]);

/**
 * Poll a transaction's status — used by the checkout page after a mobile
 * express checkout to update the UI when the customer pays.
 * POST { orderId }
 */
export async function POST(req: Request) {
  try {
    const { orderId } = (await req.json()) as { orderId?: string };
    if (!orderId) {
      return NextResponse.json({ error: "orderId required." }, { status: 400 });
    }

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ paid: true, status: "PAID" });
    }
    if (!order.paymentRef) {
      return NextResponse.json({ paid: false, status: order.paymentStatus });
    }

    const paynow = getPaynow();
    const poll = await paynow.pollTransaction(order.paymentRef);
    const paid =
      poll.paid === true || PAID_STATUSES.has(poll.status?.toLowerCase() ?? "");

    if (paid) {
      await db.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID", status: "CONFIRMED" },
      });
      await db.notification.create({
        data: {
          type: "PAYMENT",
          title: `Payment received — ${order.orderNumber}`,
          body: `${order.customerName} · $${order.total.toFixed(2)} via Paynow (mobile)`,
          link: "/admin/orders",
        },
      });
    }

    return NextResponse.json({
      paid,
      status: paid ? "PAID" : order.paymentStatus,
    });
  } catch (e) {
    console.error("paynow status error", e);
    return NextResponse.json({ error: "Status check failed." }, { status: 500 });
  }
}
