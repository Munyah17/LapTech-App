import { db } from "@/lib/db";
import type { WalletTxType } from "@prisma/client";

/** Fetch a user's wallet, creating it on first access. */
export async function getOrCreateWallet(userId: string) {
  const existing = await db.wallet.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.wallet.create({ data: { userId, balance: 0 } });
}

export async function getBalance(userId: string): Promise<number> {
  const w = await db.wallet.findUnique({ where: { userId } });
  return w?.balance ?? 0;
}

/**
 * Credit (positive amount) or debit (negative amount) a wallet atomically.
 * Throws if a debit would take the balance below zero.
 * Money can never be withdrawn — debits only happen for purchases/gifts.
 */
export async function transact(
  userId: string,
  amount: number,
  type: WalletTxType,
  opts: { note?: string; ref?: string } = {}
) {
  if (!Number.isFinite(amount) || amount === 0) {
    throw new Error("Amount must be a non-zero number.");
  }
  const wallet = await getOrCreateWallet(userId);

  return db.$transaction(async (tx) => {
    const fresh = await tx.wallet.findUnique({ where: { id: wallet.id } });
    const balance = fresh?.balance ?? 0;
    const next = balance + amount;
    if (next < 0) {
      throw new Error("Insufficient wallet balance.");
    }
    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: next },
    });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type,
        amount,
        note: opts.note ?? null,
        ref: opts.ref ?? null,
      },
    });
    return updated;
  });
}

/** Admin top-up / adjustment. amount may be + or -. */
export async function adminCredit(
  userId: string,
  amount: number,
  note?: string
) {
  return transact(userId, amount, amount >= 0 ? "TOPUP" : "ADJUSTMENT", {
    note: note ?? (amount >= 0 ? "Admin top-up" : "Admin adjustment"),
  });
}

/** Gift wallet balance from one user to another (by recipient email). */
export async function gift(
  fromUserId: string,
  toEmail: string,
  amount: number,
  note?: string
) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Gift amount must be greater than zero.");
  }
  const recipient = await db.user.findUnique({
    where: { email: toEmail.trim().toLowerCase() },
  });
  if (!recipient) throw new Error("No account found with that email.");
  if (recipient.id === fromUserId) {
    throw new Error("You cannot gift to yourself.");
  }

  const senderWallet = await getOrCreateWallet(fromUserId);
  const recipientWallet = await getOrCreateWallet(recipient.id);

  return db.$transaction(async (tx) => {
    const fresh = await tx.wallet.findUnique({ where: { id: senderWallet.id } });
    const balance = fresh?.balance ?? 0;
    if (balance < amount) throw new Error("Insufficient wallet balance.");

    await tx.wallet.update({
      where: { id: senderWallet.id },
      data: { balance: balance - amount },
    });
    await tx.walletTransaction.create({
      data: {
        walletId: senderWallet.id,
        type: "GIFT_OUT",
        amount: -amount,
        note: note ?? `Gift to ${recipient.email}`,
        ref: recipient.email,
      },
    });

    const recipFresh = await tx.wallet.findUnique({
      where: { id: recipientWallet.id },
    });
    await tx.wallet.update({
      where: { id: recipientWallet.id },
      data: { balance: (recipFresh?.balance ?? 0) + amount },
    });
    await tx.walletTransaction.create({
      data: {
        walletId: recipientWallet.id,
        type: "GIFT_IN",
        amount,
        note: note ?? "Gift received",
        ref: recipient.email,
      },
    });
  });
}
