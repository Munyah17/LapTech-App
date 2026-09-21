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

  await db.service.update({
    where: { id },
    data: {
      ...(b.title !== undefined && { title: b.title.trim() }),
      ...(b.description !== undefined && { description: b.description.trim() }),
      ...(b.category !== undefined && { category: b.category.trim() }),
      ...(b.image !== undefined && { image: b.image?.trim() || null }),
      ...(b.order !== undefined && { order: Number(b.order) }),
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
  await db.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
