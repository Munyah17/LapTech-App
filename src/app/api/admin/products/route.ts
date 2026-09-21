import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
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

    if (!name?.trim() || !description?.trim() || !price || !categoryId) {
      return NextResponse.json(
        { error: "Name, description, price and category are required." },
        { status: 400 }
      );
    }

    let slug = slugify(name);
    // Ensure unique slug
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const product = await db.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description.trim(),
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        stock: Number(stock) || 0,
        image: image || null,
        badge: badge || null,
        categoryId,
        featured: Boolean(featured),
      },
    });

    return NextResponse.json({ ok: true, id: product.id });
  } catch (e) {
    console.error("create product error", e);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
