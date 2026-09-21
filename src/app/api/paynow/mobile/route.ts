import { db } from "@/lib/db";
import { getPaynow } from "@/lib/paynow";
import { NextResponse } from "next/server";

/**
 * Express mobile checkout — EcoCash / OneMoney.
 * POST { orderId, phone, method: "ecocash" | "onemoney" }
 * Returns instructions to show the customer + pollUrl.
 */
export async function POST(req: Request) {
  try {
    const { orderId, phone, method } = (await req.json()) as {
      orderId?: string;
      phone?: string;
      method?: string;
    };

    if (!orderId || !phone?.trim()) {
      return NextResponse.json(
        { error: "orderId and phone are required." },
        { status: 400 }
      );
    }
    const mm = method === "onemoney" ? "onemoney" : "ecocash";

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
    // Mobile transactions require the payer's email
    const payment = paynow.createPayment(order.orderNumber, order.email);
    for (const item of order.items) {
      payment.add(item.name, item.price * item.qty);
    }
    if (order.deliveryFee > 0) {
      payment.add("Delivery", order.deliveryFee);
    }

    const response = await paynow.sendMobile(payment, phone.trim(), mm);
    if (!response.success) {
      return NextResponse.json(
        { error: response.error ?? "Paynow could not initiate the payment." },
        { status: 502 }
      );
    }

    await db.order.update({
      where: { id: order.id },
      data: { paymentRef: response.pollUrl },
    });

    return NextResponse.json({
      ok: true,
      instructions: response.instructions,
      pollUrl: response.pollUrl,
    });
  } catch (e) {
    console.error("paynow mobile error", e);
    return NextResponse.json(
      { error: "Mobile payment initiation failed." },
      { status: 500 }
    );
  }
}
