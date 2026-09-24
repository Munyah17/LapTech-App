"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { Building2, Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  businessName: string | null;
  businessContact: string | null;
  businessAddress: string | null;
  notes: string | null;
  interests: string | null;
  createdAt: string | Date;
}

const empty: Omit<Lead, "id" | "createdAt"> = {
  name: "",
  phone: "",
  email: "",
  address: "",
  businessName: "",
  businessContact: "",
  businessAddress: "",
  notes: "",
  interests: "",
};

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Lead | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const body = {
      name: f.get("name"),
      phone: f.get("phone") || null,
      email: f.get("email") || null,
      address: f.get("address") || null,
      businessName: f.get("businessName") || null,
      businessContact: f.get("businessContact") || null,
      businessAddress: f.get("businessAddress") || null,
      notes: f.get("notes") || null,
      interests: f.get("interests") || null,
    };
    try {
      const res = editing
        ? await fetch(`/api/admin/leads/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/admin/leads", {
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

  async function remove(l: Lead) {
    if (!confirm(`Delete lead "${l.name}"?`)) return;
    await fetch(`/api/admin/leads/${l.id}`, { method: "DELETE" });
    router.refresh();
  }

  const form = (l: Lead | typeof empty) => (
    <form onSubmit={save} className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <Field label="Full Name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={l.name} required />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={l.phone ?? ""} placeholder="+263…" />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={l.email ?? ""} />
        </Field>
      </div>
      <Field label="Home / Personal Address" htmlFor="address">
        <Input id="address" name="address" defaultValue={l.address ?? ""} />
      </Field>
      <div className="grid sm:grid-cols-3 gap-3">
        <Field label="Business Name" htmlFor="businessName">
          <Input id="businessName" name="businessName" defaultValue={l.businessName ?? ""} />
        </Field>
        <Field label="Business Contact" htmlFor="businessContact">
          <Input id="businessContact" name="businessContact" defaultValue={l.businessContact ?? ""} />
        </Field>
        <Field label="Business Address" htmlFor="businessAddress">
          <Input id="businessAddress" name="businessAddress" defaultValue={l.businessAddress ?? ""} />
        </Field>
      </div>
      <Field
        label="Interests / What They Like"
        htmlFor="interests"
        hint="e.g. Gaming laptops, MacBooks, accessories — used for recommendations"
      >
        <Input id="interests" name="interests" defaultValue={l.interests ?? ""} />
      </Field>
      <Field label="Notes / Purchases" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          defaultValue={l.notes ?? ""}
          rows={2}
          placeholder="Past purchases, follow-ups, source (walk-in, referral)…"
        />
      </Field>
      {error && <p className="text-[12.5px] text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={saving} size="sm">
          Save Lead
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

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
        >
          <Plus className="size-4" /> Add Lead
        </Button>
      </div>

      {creating && (
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold mb-4">New Lead</h3>
          {form(empty)}
        </Card>
      )}

      {/* Data table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Address</th>
                <th className="px-4 py-3 font-semibold">Business</th>
                <th className="px-4 py-3 font-semibold">Interests</th>
                <th className="px-4 py-3 font-semibold">Added</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <UserRound className="size-4 text-muted-foreground shrink-0" aria-hidden />
                      <div>
                        <p className="font-medium">{l.name}</p>
                        {l.notes && (
                          <p className="text-[11.5px] text-muted-foreground line-clamp-1 max-w-[180px]">
                            {l.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p>{l.phone ?? "—"}</p>
                    {l.email && (
                      <p className="text-[11.5px] text-muted-foreground">{l.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <span className="line-clamp-2">{l.address ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {l.businessName ? (
                      <div className="flex items-start gap-1.5">
                        <Building2 className="size-3.5 text-muted-foreground mt-0.5 shrink-0" aria-hidden />
                        <div>
                          <p className="font-medium">{l.businessName}</p>
                          {l.businessContact && (
                            <p className="text-[11.5px] text-muted-foreground">{l.businessContact}</p>
                          )}
                          {l.businessAddress && (
                            <p className="text-[11.5px] text-muted-foreground line-clamp-1 max-w-[160px]">
                              {l.businessAddress}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    {l.interests ? (
                      <Badge tone="brand" className="whitespace-normal">
                        {l.interests}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(l.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(l);
                          setCreating(false);
                          setError("");
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(l)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No leads captured yet — add walk-in customers and prospects.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inline edit form */}
      {editing && (
        <Card className="p-5 border-brand-300 dark:border-brand-700">
          <h3 className="text-[14px] font-semibold mb-4">Edit Lead — {editing.name}</h3>
          {form(editing)}
        </Card>
      )}
    </div>
  );
}
