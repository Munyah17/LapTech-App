"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string | null;
  category: string;
  order: number;
  active: boolean;
}

const empty = { title: "", description: "", image: "", category: "", order: 0 };

export function ServicesTable({ services }: { services: Service[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState("");

  const categories = [...new Set(services.map((s) => s.category))];

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const body = {
      title: f.get("title"),
      description: f.get("description"),
      category: f.get("category"),
      image: f.get("image") || null,
      order: Number(f.get("order")) || 0,
    };
    try {
      const res = editing
        ? await fetch(`/api/admin/services/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/admin/services", {
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

  async function toggle(s: Service) {
    await fetch(`/api/admin/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this service?")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const form = (s: typeof empty | Service) => (
    <form onSubmit={save} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Title" htmlFor="title" required>
          <Input id="title" name="title" defaultValue={s.title} required />
        </Field>
        <Field label="Category" htmlFor="category" required hint={categories.length ? `Existing: ${categories.join(", ")}` : undefined}>
          <Input id="category" name="category" defaultValue={s.category} required list="svc-cats" />
          <datalist id="svc-cats">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Field>
      </div>
      <Field label="Description" htmlFor="description" required>
        <Textarea id="description" name="description" defaultValue={s.description} rows={2} required />
      </Field>
      <ImageUpload
        value={image}
        onChange={setImage}
        label="Image URL"
        hint="Illustration shown on the service card."
      />
      <input type="hidden" name="image" value={image} />
      <Field label="Sort Order" htmlFor="order">
        <Input id="order" name="order" type="number" defaultValue={s.order} />
      </Field>
      {error && <p className="text-[12.5px] text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={saving} size="sm">Save Service</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setEditing(null); setCreating(false); }}>
          <X className="size-4" /> Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setImage(empty.image); setCreating(true); setEditing(null); }}>
          <Plus className="size-4" /> Add Service
        </Button>
      </div>

      {creating && (
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold mb-4">New Service</h3>
          {form(empty)}
        </Card>
      )}

      {services.map((s) => (
        <Card key={s.id} className="p-4">
          {editing?.id === s.id ? (
            form(s)
          ) : (
            <div className="flex gap-4 items-start">
              {s.image && (
                <div className="relative w-28 aspect-[16/10] rounded-lg overflow-hidden bg-muted shrink-0 hidden sm:block">
                  <Image src={s.image} alt={s.title} fill className="object-cover" sizes="112px" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[14px] font-semibold">{s.title}</h3>
                  <Badge tone="brand">{s.category}</Badge>
                  <Badge tone={s.active ? "success" : "neutral"}>
                    {s.active ? "Active" : "Hidden"}
                  </Badge>
                </div>
                <p className="text-[12.5px] text-muted-foreground mt-1 line-clamp-2">
                  {s.description}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => toggle(s)}>
                  {s.active ? "Hide" : "Show"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setImage(s.image ?? ""); setEditing(s); setCreating(false); }}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
      {services.length === 0 && !creating && (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          No services yet — add your first one.
        </Card>
      )}
    </div>
  );
}
