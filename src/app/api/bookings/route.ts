import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyBookingCreated } from "@/lib/notify";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, device, serviceType, description, preferredDate } =
      body;

    if (!name?.trim() || !phone?.trim() || !device?.trim() || !serviceType) {
      return NextResponse.json(
        { error: "Name, phone, device and service type are required." },
        { status: 400 }
      );
    }

    const session = await getSession();
    const booking = await db.booking.create({
      data: {
        userId: session?.id ?? null,
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        device: device.trim(),
        serviceType,
        description: description?.trim() || null,
        preferredDate: preferredDate || null,
      },
    });

    // Admin notification
    await db.notification.create({
      data: {
        type: "BOOKING",
        title: `New ${serviceType} booking`,
        body: `${booking.name} — ${booking.device}${booking.preferredDate ? ` · ${booking.preferredDate}` : ""}`,
        link: "/admin/bookings",
      },
    });

    void notifyBookingCreated(booking).catch(console.error);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("booking error", e);
    return NextResponse.json(
      { error: "Failed to submit booking." },
      { status: 500 }
    );
  }
}
