import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  if (!b.title?.trim() || !b.description?.trim() || !b.category?.trim()) {
    return NextResponse.json(
      { error: "Title, description and category are required." },
      { status: 400 }
    );
  }

  const service = await db.service.create({
    data: {
      title: b.title.trim(),
      description: b.description.trim(),
      category: b.category.trim(),
      image: b.image?.trim() || null,
      order: Number(b.order) || 0,
    },
  });
  return NextResponse.json(service);
}
