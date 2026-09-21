import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { current, password } = await req.json();
  if (!current || !password || password.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { id: admin.id } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 }
    );
  }

  await db.user.update({
    where: { id: admin.id },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });

  return NextResponse.json({ ok: true });
}
