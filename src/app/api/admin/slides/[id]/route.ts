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

  await db.heroSlide.update({
    where: { id },
    data: {
      ...(b.title !== undefined && { title: b.title.trim() }),
      ...(b.subtitle !== undefined && { subtitle: b.subtitle?.trim() || null }),
      ...(b.image !== undefined && { image: b.image.trim() }),
      ...(b.ctaLabel !== undefined && { ctaLabel: b.ctaLabel.trim() }),
      ...(b.ctaHref !== undefined && { ctaHref: b.ctaHref.trim() }),
      ...(b.cta2Label !== undefined && { cta2Label: b.cta2Label?.trim() || null }),
      ...(b.cta2Href !== undefined && { cta2Href: b.cta2Href?.trim() || null }),
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
  await db.heroSlide.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
