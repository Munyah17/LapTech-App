import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// List all users (admins + clients) with wallet balance
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      wallet: { select: { balance: true } },
      _count: { select: { orders: true, bookings: true } },
    },
  });
  return NextResponse.json(users);
}

// Create a new user (admin or client)
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  const { name, email, phone, password, role } = b as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: "ADMIN" | "CLIENT";
  };

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json(
      { error: "Name, email and password are required." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const normalized = email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email: normalized } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const user = await db.user.create({
    data: {
      name: name.trim(),
      email: normalized,
      phone: phone?.trim() || null,
      passwordHash: await bcrypt.hash(password, 10),
      role: role === "ADMIN" ? "ADMIN" : "CLIENT",
      // Every account gets a wallet from the start (matches registration).
      wallet: { create: { balance: 0 } },
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user, { status: 201 });
}
