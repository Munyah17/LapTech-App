import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateWallet } from "@/lib/wallet";
import { NextResponse } from "next/server";

// Current user's wallet balance + recent transactions
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wallet = await getOrCreateWallet(session.id);
  const transactions = await db.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ balance: wallet.balance, transactions });
}
