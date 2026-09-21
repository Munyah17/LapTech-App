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
  const body = await req.json();
  const {
    name,
    description,
    price,
    compareAtPrice,
    stock,
    image,
    badge,
    categoryId,
    featured,
  } = body;

  await db.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(price !== undefined && { price: Number(price) }),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      ...(stock !== undefined && { stock: Number(stock) }),
      image: image || null,
      badge: badge || null,
      ...(categoryId !== undefined && { categoryId }),
      ...(featured !== undefined && { featured: Boolean(featured) }),
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
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
