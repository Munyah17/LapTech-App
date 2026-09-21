import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyBookingStatus } from "@/lib/notify";
import { NextResponse } from "next/server";

const validStatuses = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await db.booking.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  const changed = existing.status !== status;
  await db.booking.update({ where: { id }, data: { status } });
  if (changed) {
    const booking = await db.booking.findUnique({ where: { id } });
    if (booking) void notifyBookingStatus(booking).catch(console.error);
  }
  return NextResponse.json({ ok: true });
}
