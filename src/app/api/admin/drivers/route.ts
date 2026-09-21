import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  if (!b.name?.trim() || !b.phone?.trim() || !b.vehicle?.trim()) {
    return NextResponse.json(
      { error: "Name, phone and vehicle are required." },
      { status: 400 }
    );
  }

  const driver = await db.driver.create({
    data: {
      name: b.name.trim(),
      phone: b.phone.trim(),
      vehicle: b.vehicle.trim(),
      zones: b.zones?.trim() || null,
      notes: b.notes?.trim() || null,
    },
  });
  return NextResponse.json(driver);
}
