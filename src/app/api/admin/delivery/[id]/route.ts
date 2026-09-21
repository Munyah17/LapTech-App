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
  const { name, fee, suburbs, active } = body;

  await db.deliveryZone.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(fee !== undefined && { fee: Number(fee) }),
      ...(suburbs !== undefined && { suburbs: suburbs.trim() }),
      ...(active !== undefined && { active: Boolean(active) }),
    },
  });

  return NextResponse.json({ ok: true });
}
