import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const b = await req.json();

  await db.driver.update({
    where: { id },
    data: {
      ...(b.name !== undefined && { name: b.name.trim() }),
      ...(b.phone !== undefined && { phone: b.phone.trim() }),
      ...(b.vehicle !== undefined && { vehicle: b.vehicle.trim() }),
      ...(b.zones !== undefined && { zones: b.zones?.trim() || null }),
      ...(b.notes !== undefined && { notes: b.notes?.trim() || null }),
      ...(b.active !== undefined && { active: Boolean(b.active) }),
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.driver.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
