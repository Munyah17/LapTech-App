"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { formatUSD } from "@/lib/utils";
import {
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const PROTECTED_EMAIL = "munyah777@gmail.com";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "CLIENT";
  createdAt: string | Date;
  wallet: { balance: number } | null;
  _count: { orders: number; bookings: number };
}

const empty = { name: "", email: "", phone: "", password: "", role: "CLIENT" };

export function UsersTable({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [walletFor, setWalletFor] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const isEdit = Boolean(editing);
    const body: Record<string, unknown> = {
      name: f.get("name"),
      phone: f.get("phone") || null,
      role: f.get("role"),
    };
    if (!isEdit) {
      body.email = f.get("email");
      body.password = f.get("password");
    } else {
      const pw = String(f.get("password") ?? "");
      if (pw) body.password = pw;
    }
    try {
      const res = isEdit
        ? await fetch(`/api/admin/users/${editing!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setEditing(null);
      setCreating(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(u: AdminUser) {
    if (u.email === PROTECTED_EMAIL) return;
    if (!confirm(`Delete ${u.name} (${u.email})? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert((await res.json()).error ?? "Delete failed");
      return;
    }
    router.refresh();
  }

  async function submitWallet(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!walletFor) return;
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/admin/users/${walletFor.id}/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(f.get("amount")),
          note: f.get("note") || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setWalletFor(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const form = (u: AdminUser | typeof empty, isEdit: boolean) => {
    const protectedUser = isEdit && (u as AdminUser).email === PROTECTED_EMAIL;
    return (
      <form onSubmit={save} className="space-y-3">
        {protectedUser && (
          <p className="text-[12.5px] rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-3 py-2">
            This is the permanent admin account — only the password can be changed.
          </p>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Full Name" htmlFor="name" required>
            <Input
              id="name"
              name="name"
              defaultValue={u.name}
              required
              disabled={protectedUser}
            />
          </Field>
          <Field label="Email" htmlFor="email" required>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={"email" in u ? u.email : ""}
              required
              disabled={isEdit}
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              defaultValue={"phone" in u ? u.phone ?? "" : ""}
              placeholder="+263…"
              disabled={protectedUser}
            />
          </Field>
          <Field
            label={isEdit ? "New Password" : "Password"}
            htmlFor="password"
            required={!isEdit}
            hint={isEdit ? "Leave blank to keep current password" : "Min 6 characters"}
          >
            <Input
              id="password"
              name="password"
              type="password"
              required={!isEdit}
              minLength={6}
              placeholder={isEdit ? "••••••••" : ""}
            />
          </Field>
          {!protectedUser && (
            <Field label="Role" htmlFor="role" required>
              <Select id="role" name="role" defaultValue={"role" in u ? u.role : "CLIENT"}>
                <option value="CLIENT">Client (buyer)</option>
                <option value="ADMIN">Admin (staff)</option>
              </Select>
            </Field>
          )}
        </div>
        {error && <p className="text-[12.5px] text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" loading={saving} size="sm">
            {isEdit ? "Save Changes" : "Create User"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(null);
              setCreating(false);
              setError("");
            }}
          >
            <X className="size-4" /> Cancel
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setWalletFor(null);
          }}
        >
          <Plus className="size-4" /> Add User
        </Button>
      </div>

      {creating && (
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold mb-4">New User</h3>
          {form(empty, false)}
        </Card>
      )}

      {walletFor && (
        <Card className="p-5 border-brand-300 dark:border-brand-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold flex items-center gap-2">
              <Wallet className="size-4 text-brand-600" />
              Wallet — {walletFor.name}
              <span className="text-muted-foreground font-normal">
                ({formatUSD(walletFor.wallet?.balance ?? 0)})
              </span>
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setWalletFor(null)}>
              <X className="size-4" />
            </Button>
          </div>
          <form onSubmit={submitWallet} className="grid sm:grid-cols-3 gap-3 items-end">
            <Field
              label="Amount (USD)"
              htmlFor="amount"
              required
              hint="Positive to top-up, negative to adjust"
            >
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder="e.g. 50 or -10"
              />
            </Field>
            <Field label="Note" htmlFor="note">
              <Input id="note" name="note" placeholder="Reason / reference" />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" loading={saving} size="sm">
                Apply
              </Button>
            </div>
          </form>
          {error && <p className="text-[12.5px] text-destructive mt-2">{error}</p>}
          <p className="text-[11.5px] text-muted-foreground mt-3">
            Wallet funds can be spent in-store or gifted — they can never be withdrawn.
          </p>
        </Card>
      )}

      {users.map((u) => {
        const protectedUser = u.email === PROTECTED_EMAIL;
        return (
          <Card key={u.id} className="p-4">
            {editing?.id === u.id ? (
              form(u, true)
            ) : (
              <div className="flex gap-4 items-start">
                <div className="size-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center shrink-0">
                  {u.role === "ADMIN" ? (
                    <ShieldCheck className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
                  ) : (
                    <UserIcon className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[14px] font-semibold">{u.name}</h3>
                    <Badge tone={u.role === "ADMIN" ? "brand" : "neutral"}>
                      {u.role}
                    </Badge>
                    {protectedUser && <Badge tone="warning">Permanent</Badge>}
                  </div>
                  <p className="text-[12.5px] text-muted-foreground mt-1">
                    {u.email}
                    {u.phone && <span className="ml-2">· {u.phone}</span>}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {u._count.orders} orders · {u._count.bookings} bookings ·{" "}
                    <span className="font-medium text-foreground">
                      Wallet {formatUSD(u.wallet?.balance ?? 0)}
                    </span>
                  </p>
                </div>
                <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setWalletFor(u);
                      setEditing(null);
                      setCreating(false);
                      setError("");
                    }}
                  >
                    <Wallet className="size-4" /> Wallet
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(u);
                      setCreating(false);
                      setWalletFor(null);
                      setError("");
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  {!protectedUser && (
                    <Button size="sm" variant="ghost" onClick={() => remove(u)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        );
      })}
      {users.length === 0 && !creating && (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          No users yet.
        </Card>
      )}
    </div>
  );
}
