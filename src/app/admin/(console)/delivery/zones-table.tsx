"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatUSD } from "@/lib/utils";
import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface Zone {
  id: string;
  name: string;
  minKm: number;
  maxKm: number;
  fee: number;
  suburbs: string;
  active: boolean;
}

export function ZonesTable({ zones }: { zones: Zone[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Zone | null>(null);
  const [form, setForm] = useState({ name: "", fee: "", suburbs: "" });
  const [saving, setSaving] = useState(false);

  function openEdit(z: Zone) {
    setEditing(z);
    setForm({ name: z.name, fee: String(z.fee), suburbs: z.suburbs });
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    await fetch(`/api/admin/delivery/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        fee: parseFloat(form.fee),
        suburbs: form.suburbs,
      }),
    });
    setSaving(false);
    setEditing(null);
    router.refresh();
  }

  async function toggleActive(z: Zone) {
    await fetch(`/api/admin/delivery/${z.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !z.active }),
    });
    router.refresh();
  }

  return (
    <Card>
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <THead>
            <TR>
              <TH>Zone</TH>
              <TH>Distance</TH>
              <TH className="text-right">Fee</TH>
              <TH>Suburbs Covered</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {zones.map((z) => (
              <TR key={z.id}>
                <TD className="font-medium">{z.name}</TD>
                <TD className="tnum">
                  {z.minKm}–{z.maxKm} km
                </TD>
                <TD numeric className="font-semibold">
                  {formatUSD(z.fee)}
                </TD>
                <TD>
                  <p className="text-[12px] text-muted-foreground line-clamp-2 max-w-sm">
                    {z.suburbs}
                  </p>
                </TD>
                <TD>
                  {z.active ? (
                    <Badge tone="success">Active</Badge>
                  ) : (
                    <Badge tone="neutral">Disabled</Badge>
                  )}
                </TD>
                <TD className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(z)}>
                      <Pencil className="size-3.5" aria-hidden /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(z)}
                    >
                      {z.active ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="lg:hidden divide-y">
        {zones.map((z) => (
          <div key={z.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-[13.5px]">{z.name}</p>
                <p className="text-[12px] text-muted-foreground tnum">
                  {z.minKm}–{z.maxKm} km · {formatUSD(z.fee)}
                </p>
              </div>
              {z.active ? (
                <Badge tone="success">Active</Badge>
              ) : (
                <Badge tone="neutral">Disabled</Badge>
              )}
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground line-clamp-2">
              {z.suburbs}
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => openEdit(z)}>
                <Pencil className="size-3.5" aria-hidden /> Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleActive(z)}>
                {z.active ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit dialog */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditing(null)}
          />
          <div className="relative bg-card w-full sm:max-w-md sm:rounded-xl border shadow-lg">
            <div className="border-b px-5 py-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Edit Zone</h2>
              <button
                onClick={() => setEditing(null)}
                className="p-1.5 rounded hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <Field label="Zone Name" required>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Field>
              <Field label="Delivery Fee (USD)" required>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  required
                />
              </Field>
              <Field
                label="Suburbs"
                hint="Comma-separated list of suburbs in this zone"
                required
              >
                <Input
                  value={form.suburbs}
                  onChange={(e) => setForm({ ...form, suburbs: e.target.value })}
                  required
                />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
