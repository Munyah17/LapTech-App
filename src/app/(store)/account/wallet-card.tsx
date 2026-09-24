"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { formatDate, formatUSD } from "@/lib/utils";
import { Gift, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface Tx {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  ref: string | null;
  createdAt: string | Date;
}

const txLabel: Record<string, string> = {
  TOPUP: "Top-up",
  PURCHASE: "Purchase",
  GIFT_OUT: "Gift sent",
  GIFT_IN: "Gift received",
  ADJUSTMENT: "Adjustment",
};

export function WalletCard({
  balance,
  transactions,
}: {
  balance: number;
  transactions: Tx[];
}) {
  const router = useRouter();
  const [gifting, setGifting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function sendGift(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/wallet/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: f.get("toEmail"),
          amount: Number(f.get("amount")),
          note: f.get("note") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gift failed");
      setMsg({ ok: true, text: "Gift sent successfully." });
      setGifting(false);
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Gift failed" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader
        action={
          <Button size="sm" variant="secondary" onClick={() => setGifting((g) => !g)}>
            <Gift className="size-4" /> Gift
          </Button>
        }
      >
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-4 text-brand-600" aria-hidden />
          My Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold tnum">{formatUSD(balance)}</span>
          <span className="text-[12.5px] text-muted-foreground">available balance</span>
        </div>
        <p className="text-[12px] text-muted-foreground mb-4">
          Use your balance at checkout or gift it to another LapTech account. Wallet
          funds cannot be withdrawn.
        </p>

        {gifting && (
          <form
            onSubmit={sendGift}
            className="mb-4 rounded-lg border border-border p-4 grid sm:grid-cols-3 gap-3 items-end"
          >
            <Field label="Recipient Email" htmlFor="toEmail" required>
              <Input id="toEmail" name="toEmail" type="email" required placeholder="friend@email.com" />
            </Field>
            <Field label="Amount (USD)" htmlFor="amount" required>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" loading={saving} size="sm">
                Send Gift
              </Button>
            </div>
            <div className="sm:col-span-3">
              <Field label="Note (optional)" htmlFor="note">
                <Input id="note" name="note" placeholder="e.g. Happy birthday!" />
              </Field>
            </div>
          </form>
        )}
        {msg && (
          <p className={`text-[12.5px] mb-3 ${msg.ok ? "text-success" : "text-destructive"}`}>
            {msg.text}
          </p>
        )}

        {transactions.length > 0 && (
          <div className="divide-y border-t border-border">
            {transactions.slice(0, 12).map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={t.amount >= 0 ? "success" : "neutral"}>
                      {txLabel[t.type] ?? t.type}
                    </Badge>
                    <span className="text-[12px] text-muted-foreground truncate">
                      {t.note ?? t.ref ?? ""}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDate(t.createdAt)}
                  </p>
                </div>
                <span
                  className={`text-[13.5px] font-semibold tnum shrink-0 ${
                    t.amount >= 0 ? "text-success" : "text-foreground"
                  }`}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {formatUSD(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
