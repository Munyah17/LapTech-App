import { db } from "@/lib/db";
import { getPaynow } from "@/lib/paynow";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { orderId } = (await req.json()) as { orderId?: string };
    if (!orderId) {
      return NextResponse.json({ error: "orderId required." }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Order already paid." }, { status: 400 });
    }

    const paynow = getPaynow();
    const payment = paynow.createPayment(order.orderNumber, order.email);
    for (const item of order.items) {
      payment.add(item.name, item.price * item.qty);
    }
    if (order.deliveryFee > 0) {
      payment.add("Delivery", order.deliveryFee);
    }

    const response = await paynow.send(payment);
    if (!response.success) {
      return NextResponse.json(
        { error: "Paynow could not initiate the payment." },
        { status: 502 }
      );
    }

    // Store poll URL so we can check status later
    await db.order.update({
      where: { id: order.id },
      data: { paymentRef: response.pollUrl },
    });

    return NextResponse.json({
      ok: true,
      redirectUrl: response.redirectUrl,
      pollUrl: response.pollUrl,
    });
  } catch (e) {
    console.error("paynow initiate error", e);
    return NextResponse.json(
      { error: "Payment initiation failed." },
      { status: 500 }
    );
  }
}
