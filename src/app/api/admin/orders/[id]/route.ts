import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyOrderStatus } from "@/lib/notify";
import { after, NextResponse } from "next/server";

const validStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
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

  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const changed = existing.status !== status;
  await db.order.update({ where: { id }, data: { status } });
  if (changed) {
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (order) after(() => notifyOrderStatus(order).catch(console.error));
  }
  return NextResponse.json({ ok: true });
}
