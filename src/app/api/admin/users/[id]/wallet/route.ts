import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminCredit, getOrCreateWallet } from "@/lib/wallet";
import { NextResponse } from "next/server";

// Get a user's wallet + recent transactions
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const wallet = await getOrCreateWallet(id);
  const transactions = await db.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ balance: wallet.balance, transactions });
}

// Top-up / adjust a user's wallet (admin only). amount may be + or -.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const b = await req.json();
  const amount = Number(b.amount);
  const note = typeof b.note === "string" ? b.note.trim() : undefined;

  if (!Number.isFinite(amount) || amount === 0) {
    return NextResponse.json(
      { error: "Enter a valid non-zero amount." },
      { status: 400 }
    );
  }

  try {
    const wallet = await adminCredit(id, amount, note);
    return NextResponse.json({ ok: true, balance: wallet.balance });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Wallet update failed." },
      { status: 400 }
    );
  }
}
