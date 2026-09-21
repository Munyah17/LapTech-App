"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Bike, Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  zones: string | null;
  notes: string | null;
  active: boolean;
}

const empty = { name: "", phone: "", vehicle: "", zones: "", notes: "" };

export function DriversTable({ drivers }: { drivers: Driver[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Driver | null>(null);
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
      phone: f.get("phone"),
      vehicle: f.get("vehicle"),
      zones: f.get("zones") || null,
      notes: f.get("notes") || null,
    };
    try {
      const res = editing
        ? await fetch(`/api/admin/drivers/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/admin/drivers", {
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

  async function toggle(d: Driver) {
    await fetch(`/api/admin/drivers/${d.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !d.active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this driver?")) return;
    await fetch(`/api/admin/drivers/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const form = (d: typeof empty | Driver) => (
    <form onSubmit={save} className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <Field label="Name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={d.name} required />
        </Field>
        <Field label="Phone" htmlFor="phone" required>
          <Input id="phone" name="phone" defaultValue={d.phone} required placeholder="+263…" />
        </Field>
        <Field label="Vehicle" htmlFor="vehicle" required hint='e.g. "Motorbike" or "Sedan — InDrive"'>
          <Input id="vehicle" name="vehicle" defaultValue={d.vehicle} required />
        </Field>
      </div>
      <Field label="Zones Covered" htmlFor="zones" hint="Comma-separated, e.g. Zone A, Zone B">
        <Input id="zones" name="zones" defaultValue={d.zones ?? ""} />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={d.notes ?? ""} rows={2} placeholder="Agreement details, availability…" />
      </Field>
      {error && <p className="text-[12.5px] text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={saving} size="sm">Save Driver</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setEditing(null); setCreating(false); }}>
          <X className="size-4" /> Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setCreating(true); setEditing(null); }}>
          <Plus className="size-4" /> Add Driver
        </Button>
      </div>

      {creating && (
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold mb-4">New Driver</h3>
          {form(empty)}
        </Card>
      )}

      {drivers.map((d) => (
        <Card key={d.id} className="p-4">
          {editing?.id === d.id ? (
            form(d)
          ) : (
            <div className="flex gap-4 items-start">
              <div className="size-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center shrink-0">
                <Bike className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[14px] font-semibold">{d.name}</h3>
                  <Badge tone="brand">{d.vehicle}</Badge>
                  <Badge tone={d.active ? "success" : "neutral"}>
                    {d.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-[12.5px] text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Phone className="size-3.5" aria-hidden /> {d.phone}
                  {d.zones && <span className="ml-2">· {d.zones}</span>}
                </p>
                {d.notes && (
                  <p className="text-[12px] text-muted-foreground mt-0.5">{d.notes}</p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => toggle(d)}>
                  {d.active ? "Deactivate" : "Activate"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(d); setCreating(false); }}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(d.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
      {drivers.length === 0 && !creating && (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          No drivers yet — add your delivery partners.
        </Card>
      )}
    </div>
  );
}
