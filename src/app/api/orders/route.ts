import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getZoneForSuburb } from "@/lib/delivery";
import { notifyOrderPlaced } from "@/lib/notify";
import { after, NextResponse } from "next/server";

interface OrderItemInput {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      email,
      phone,
      deliveryMethod,
      address,
      suburb,
      city,
      paymentMethod,
      notes,
      items,
    } = body as {
      customerName: string;
      email: string;
      phone: string;
      deliveryMethod: "PICKUP" | "DELIVERY" | "COUNTRYWIDE";
      address?: string;
      suburb?: string;
      city?: string;
      paymentMethod: string;
      notes?: string;
      items: OrderItemInput[];
    };

    if (!customerName?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Name, email and phone are required." },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    // Verify prices server-side against the DB — never trust client prices
    const productIds = items.map((i) => i.productId);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds } },
    });
    const priceMap = new Map(dbProducts.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = items.map((i) => {
      const dbp = priceMap.get(i.productId);
      const price = dbp ? dbp.price : i.price;
      const name = dbp ? dbp.name : i.name;
      subtotal += price * i.qty;
      return { productId: i.productId, name, price, qty: i.qty };
    });

    // Delivery fee — computed server-side from zone table
    let deliveryFee = 0;
    let zoneName: string | null = null;
    if (deliveryMethod === "DELIVERY") {
      if (!suburb || !address?.trim()) {
        return NextResponse.json(
          { error: "Suburb and address are required for delivery." },
          { status: 400 }
        );
      }
      const zone = await getZoneForSuburb(suburb);
      if (!zone) {
        return NextResponse.json(
          { error: "Sorry, that suburb is outside our delivery area." },
          { status: 400 }
        );
      }
      deliveryFee = zone.fee;
      zoneName = zone.name;
    }
    if (deliveryMethod === "COUNTRYWIDE") {
      if (!city?.trim() || !address?.trim()) {
        return NextResponse.json(
          { error: "Town/city and collection point are required for countrywide delivery." },
          { status: 400 }
        );
      }
      // FedEx pay-forward — no delivery fee charged by us
      deliveryFee = 0;
      zoneName = `FedEx — ${city.trim()}`;
    }

    const session = await getSession();
    const orderNumber = `LT-${Date.now().toString(36).toUpperCase()}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: session?.id ?? null,
        customerName: customerName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        deliveryMethod,
        address: address?.trim() || null,
        suburb: suburb || null,
        city: city?.trim() || null,
        zoneName,
        paymentMethod:
          (paymentMethod as
            | "CASH_ON_DELIVERY"
            | "ECOCASH"
            | "BANK_TRANSFER"
            | "IN_STORE"
            | "PAYNOW") || "CASH_ON_DELIVERY",
        paymentStatus: paymentMethod === "PAYNOW" ? "AWAITING" : "UNPAID",
        notes: notes?.trim() || null,
        items: { create: orderItems },
      },
    });

    // Decrement stock
    for (const i of items) {
      await db.product.updateMany({
        where: { id: i.productId },
        data: { stock: { decrement: i.qty } },
      });
    }

    // Admin notification
    await db.notification.create({
      data: {
        type: "ORDER",
        title: `New order ${order.orderNumber}`,
        body: `${order.customerName} — ${items.length} item(s), $${order.total.toFixed(2)} (${order.deliveryMethod})`,
        link: "/admin/orders",
      },
    });

    after(async () => {
      const orderForEmail = await db.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });
      if (orderForEmail) await notifyOrderPlaced(orderForEmail).catch(console.error);
    });

    return NextResponse.json({
      ok: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  } catch (e) {
    console.error("order error", e);
    return NextResponse.json(
      { error: "Failed to place order." },
      { status: 500 }
    );
  }
}
