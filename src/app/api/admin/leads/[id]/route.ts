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

  const lead = await db.lead.update({
    where: { id },
    data: {
      ...(b.name !== undefined && { name: b.name.trim() }),
      ...(b.phone !== undefined && { phone: b.phone?.trim() || null }),
      ...(b.email !== undefined && { email: b.email?.trim() || null }),
      ...(b.address !== undefined && { address: b.address?.trim() || null }),
      ...(b.businessName !== undefined && {
        businessName: b.businessName?.trim() || null,
      }),
      ...(b.businessContact !== undefined && {
        businessContact: b.businessContact?.trim() || null,
      }),
      ...(b.businessAddress !== undefined && {
        businessAddress: b.businessAddress?.trim() || null,
      }),
      ...(b.notes !== undefined && { notes: b.notes?.trim() || null }),
      ...(b.interests !== undefined && { interests: b.interests?.trim() || null }),
    },
  });
  return NextResponse.json(lead);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
