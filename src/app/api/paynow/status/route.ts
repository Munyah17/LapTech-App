import { db } from "@/lib/db";
import { amountMatches, getPaynow, isPaidStatus } from "@/lib/paynow";
import { notifyPaymentReceived } from "@/lib/notify";
import { NextResponse } from "next/server";

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
    const verified =
      poll.paid === true || isPaidStatus(poll.status);
    const paid =
      verified &&
      (poll.amount === undefined || amountMatches(order.total, poll.amount));

    if (verified && !paid) {
      console.warn("paynow status: amount mismatch for", order.orderNumber, {
        expected: order.total,
        received: poll.amount,
      });
      await db.notification.create({
        data: {
          type: "PAYMENT",
          title: `Amount mismatch — ${order.orderNumber}`,
          body: `${order.customerName} · Expected $${order.total.toFixed(2)}, received $${poll.amount ?? "unknown"} via Paynow`,
          link: "/admin/orders",
        },
      });
      return NextResponse.json({
        paid: false,
        status: order.paymentStatus,
      });
    }

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
      const paidOrder = await db.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });
      if (paidOrder) void notifyPaymentReceived(paidOrder).catch(console.error);
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
