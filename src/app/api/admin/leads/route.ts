import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// List all marketing leads
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(leads);
}

// Create a lead (walk-in / prospect capture)
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  if (!b.name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const lead = await db.lead.create({
    data: {
      name: b.name.trim(),
      phone: b.phone?.trim() || null,
      email: b.email?.trim() || null,
      address: b.address?.trim() || null,
      businessName: b.businessName?.trim() || null,
      businessContact: b.businessContact?.trim() || null,
      businessAddress: b.businessAddress?.trim() || null,
      notes: b.notes?.trim() || null,
      interests: b.interests?.trim() || null,
    },
  });
  return NextResponse.json(lead, { status: 201 });
}
