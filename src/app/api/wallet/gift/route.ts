import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyWalletGift } from "@/lib/notify";
import { gift } from "@/lib/wallet";
import { after, NextResponse } from "next/server";

// Gift wallet balance to another user by email
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  const amount = Number(b.amount);
  const toEmail = typeof b.toEmail === "string" ? b.toEmail : "";
  const note = typeof b.note === "string" ? b.note.trim() : undefined;

  if (!toEmail.trim()) {
    return NextResponse.json(
      { error: "Recipient email is required." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Enter a valid amount greater than zero." },
      { status: 400 }
    );
  }

  try {
    await gift(session.id, toEmail, amount, note);
    const recipient = await db.user.findUnique({
      where: { email: toEmail.trim().toLowerCase() },
      select: { name: true, email: true },
    });
    if (recipient) {
      after(() =>
        notifyWalletGift({
          fromName: session.name,
          fromEmail: session.email,
          toName: recipient.name,
          toEmail: recipient.email,
          amount,
          note,
        }).catch(console.error)
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gift failed." },
      { status: 400 }
    );
  }
}
