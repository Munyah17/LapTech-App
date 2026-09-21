import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [items, unread] = await Promise.all([
    db.notification.findMany({ take: 15, orderBy: { createdAt: "desc" } }),
    db.notification.count({ where: { read: false } }),
  ]);
  return NextResponse.json({ items, unread });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, all } = (await req.json()) as { id?: string; all?: boolean };
  if (all) {
    await db.notification.updateMany({ data: { read: true } });
  } else if (id) {
    await db.notification.update({ where: { id }, data: { read: true } });
  }
  return NextResponse.json({ ok: true });
}
