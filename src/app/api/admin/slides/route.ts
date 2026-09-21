import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  if (!b.title?.trim() || !b.image?.trim()) {
    return NextResponse.json(
      { error: "Title and image are required." },
      { status: 400 }
    );
  }

  const slide = await db.heroSlide.create({
    data: {
      title: b.title.trim(),
      subtitle: b.subtitle?.trim() || null,
      image: b.image.trim(),
      ctaLabel: b.ctaLabel?.trim() || "Shop Now",
      ctaHref: b.ctaHref?.trim() || "/shop",
      cta2Label: b.cta2Label?.trim() || null,
      cta2Href: b.cta2Href?.trim() || null,
      order: Number(b.order) || 0,
    },
  });
  return NextResponse.json(slide);
}
