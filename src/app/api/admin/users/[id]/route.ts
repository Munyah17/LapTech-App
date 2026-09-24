import { requireAdmin } from "@/lib/auth";
import { PROTECTED_EMAIL } from "@/lib/constants";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Update a user (name, phone, role, password)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const target = await db.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const b = await req.json();
  const isProtected = target.email === PROTECTED_EMAIL;

  // The protected admin can only change its own password — nothing else.
  if (isProtected) {
    const onlyPassword =
      b.password !== undefined &&
      b.name === undefined &&
      b.phone === undefined &&
      b.role === undefined &&
      b.email === undefined;
    if (!onlyPassword) {
      return NextResponse.json(
        { error: "This account is permanent — only its password can be changed." },
        { status: 403 }
      );
    }
  }

  const data: Record<string, unknown> = {};
  if (b.name !== undefined) data.name = b.name.trim();
  if (b.phone !== undefined) data.phone = b.phone?.trim() || null;
  if (b.role !== undefined && !isProtected) {
    data.role = b.role === "ADMIN" ? "ADMIN" : "CLIENT";
  }
  if (b.password) {
    if (b.password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }
    data.passwordHash = await bcrypt.hash(b.password, 10);
  }

  const user = await db.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json(user);
}

// Delete a user — the protected admin can never be removed
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const target = await db.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (target.email === PROTECTED_EMAIL) {
    return NextResponse.json(
      { error: "This account is permanent and cannot be deleted." },
      { status: 403 }
    );
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
