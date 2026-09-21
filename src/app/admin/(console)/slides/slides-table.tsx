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

interface Slide {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  cta2Label: string | null;
  cta2Href: string | null;
  order: number;
  active: boolean;
}

const empty = {
  title: "",
  subtitle: "",
  image: "",
  ctaLabel: "Shop Now",
  ctaHref: "/shop",
  cta2Label: "",
  cta2Href: "",
  order: 0,
};

export function SlidesTable({ slides }: { slides: Slide[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Slide | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState("");

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const body = {
      title: f.get("title"),
      subtitle: f.get("subtitle"),
      image: f.get("image"),
      ctaLabel: f.get("ctaLabel"),
      ctaHref: f.get("ctaHref"),
      cta2Label: f.get("cta2Label") || null,
      cta2Href: f.get("cta2Href") || null,
      order: Number(f.get("order")) || 0,
    };
    try {
      const res = editing
        ? await fetch(`/api/admin/slides/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/admin/slides", {
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

  async function toggle(s: Slide) {
    await fetch(`/api/admin/slides/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this slide?")) return;
    await fetch(`/api/admin/slides/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const form = (s: typeof empty | Slide) => (
    <form onSubmit={save} className="space-y-3">
      <Field label="Title" htmlFor="title" required>
        <Input id="title" name="title" defaultValue={s.title} required />
      </Field>
      <Field label="Subtitle" htmlFor="subtitle">
        <Textarea id="subtitle" name="subtitle" defaultValue={s.subtitle ?? ""} rows={2} />
      </Field>
      <ImageUpload
        value={image}
        onChange={setImage}
        label="Banner Image URL"
        hint="Displayed at 21:9, with a dark overlay applied automatically."
      />
      <input type="hidden" name="image" value={image} required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Button 1 Label" htmlFor="ctaLabel">
          <Input id="ctaLabel" name="ctaLabel" defaultValue={s.ctaLabel} />
        </Field>
        <Field label="Button 1 Link" htmlFor="ctaHref">
          <Input id="ctaHref" name="ctaHref" defaultValue={s.ctaHref} />
        </Field>
        <Field label="Button 2 Label" htmlFor="cta2Label">
          <Input id="cta2Label" name="cta2Label" defaultValue={s.cta2Label ?? ""} />
        </Field>
        <Field label="Button 2 Link" htmlFor="cta2Href">
          <Input id="cta2Href" name="cta2Href" defaultValue={s.cta2Href ?? ""} />
        </Field>
      </div>
      <Field label="Sort Order" htmlFor="order" hint="Lower numbers show first">
        <Input id="order" name="order" type="number" defaultValue={s.order} />
      </Field>
      {error && <p className="text-[12.5px] text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={saving} size="sm">Save Slide</Button>
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
          <Plus className="size-4" /> Add Slide
        </Button>
      </div>

      {creating && (
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold mb-4">New Slide</h3>
          {form(empty)}
        </Card>
      )}

      {slides.map((s) => (
        <Card key={s.id} className="p-4">
          {editing?.id === s.id ? (
            form(s)
          ) : (
            <div className="flex gap-4 items-start">
              <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-muted shrink-0 hidden sm:block">
                <Image src={s.image} alt={s.title} fill className="object-cover" sizes="160px" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-semibold truncate">{s.title}</h3>
                  <Badge tone={s.active ? "success" : "neutral"}>
                    {s.active ? "Active" : "Hidden"}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground tnum">#{s.order}</span>
                </div>
                {s.subtitle && (
                  <p className="text-[12.5px] text-muted-foreground mt-1 line-clamp-2">{s.subtitle}</p>
                )}
                <p className="text-[11.5px] text-muted-foreground mt-1">
                  {s.ctaLabel} → {s.ctaHref}
                  {s.cta2Label && ` · ${s.cta2Label} → ${s.cta2Href}`}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => toggle(s)}>
                  {s.active ? "Hide" : "Show"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setImage(s.image); setEditing(s); setCreating(false); }}>
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
      {slides.length === 0 && !creating && (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          No slides yet — add your first banner.
        </Card>
      )}
    </div>
  );
}
