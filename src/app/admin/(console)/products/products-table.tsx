"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatUSD } from "@/lib/utils";
import {
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  image: string | null;
  badge: string | null;
  featured: boolean;
  categoryId: string;
  category: { name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  image: "",
  badge: "",
  categoryId: "",
  featured: false,
};

export function ProductsTable({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<"closed" | "create" | "edit">("closed");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q)
    );
  }, [products, query]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    setError("");
    setDialog("create");
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
      stock: String(p.stock),
      image: p.image ?? "",
      badge: p.badge ?? "",
      categoryId: p.categoryId,
      featured: p.featured,
    });
    setError("");
    setDialog("edit");
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      compareAtPrice: form.compareAtPrice
        ? parseFloat(form.compareAtPrice)
        : null,
      stock: parseInt(form.stock) || 0,
      image: form.image || null,
      badge: form.badge || null,
      categoryId: form.categoryId,
      featured: form.featured,
    };

    try {
      const res = await fetch(
        dialog === "edit" ? `/api/admin/products/${editing!.id}` : "/api/admin/products",
        {
          method: dialog === "edit" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setDialog("closed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  const set = (k: keyof typeof emptyForm, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Card>
      {/* Toolbar */}
      <div className="p-4 flex gap-3 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate} size="sm" className="shrink-0">
          <Plus className="size-3.5" aria-hidden />
          Add Product
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          hint="Add your first product to start selling."
          action={
            <Button onClick={openCreate} size="sm">
              <Plus className="size-3.5" aria-hidden /> Add Product
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Product</TH>
                  <TH>Category</TH>
                  <TH className="text-right">Price</TH>
                  <TH className="text-right">Stock</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((p) => (
                  <TR key={p.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          {p.image && (
                            <Image
                              src={p.image}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          {p.featured && (
                            <p className="text-[11px] text-brand-600">Featured</p>
                          )}
                        </div>
                      </div>
                    </TD>
                    <TD>{p.category.name}</TD>
                    <TD numeric className="font-semibold">
                      {formatUSD(p.price)}
                    </TD>
                    <TD numeric>
                      <span
                        className={
                          p.stock === 0
                            ? "text-destructive font-semibold"
                            : p.stock <= 5
                              ? "text-warning font-semibold"
                              : ""
                        }
                      >
                        {p.stock}
                      </span>
                    </TD>
                    <TD>
                      {p.stock === 0 ? (
                        <Badge tone="destructive">Out of stock</Badge>
                      ) : p.stock <= 5 ? (
                        <Badge tone="warning">Low stock</Badge>
                      ) : (
                        <Badge tone="success">In stock</Badge>
                      )}
                    </TD>
                    <TD className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="p-1.5 rounded hover:bg-destructive-soft text-muted-foreground hover:text-destructive"
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="lg:hidden divide-y">
            {filtered.map((p) => (
              <div key={p.id} className="p-4 flex gap-3">
                <div className="relative size-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  {p.image && (
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13.5px] line-clamp-1">
                    {p.name}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {p.category.name} · {formatUSD(p.price)}
                  </p>
                  <p
                    className={`text-[12px] font-medium mt-0.5 tnum ${
                      p.stock === 0
                        ? "text-destructive"
                        : p.stock <= 5
                          ? "text-warning"
                          : "text-success"
                    }`}
                  >
                    {p.stock} in stock
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded hover:bg-destructive-soft text-muted-foreground hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create/Edit dialog */}
      {dialog !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDialog("closed")}
          />
          <div className="relative bg-card w-full sm:max-w-lg sm:rounded-xl border shadow-lg max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b px-5 py-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">
                {dialog === "edit" ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => setDialog("closed")}
                className="p-1.5 rounded hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <Field label="Name" required>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </Field>
              <Field label="Description" required>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  required
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (USD)" required>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Compare-at Price">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.compareAtPrice}
                    onChange={(e) => set("compareAtPrice", e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Stock" required>
                  <Input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => set("stock", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Category" required>
                  <Select
                    value={form.categoryId}
                    onChange={(e) => set("categoryId", e.target.value)}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <ImageUpload
                value={form.image}
                onChange={(image) => set("image", image)}
                hint="Upload an image or paste an existing URL."
              />
              <Field label="Badge" hint='e.g. "New", "Sale", "Best Seller"'>
                <Input
                  value={form.badge}
                  onChange={(e) => set("badge", e.target.value)}
                />
              </Field>
              <label className="flex items-center gap-2.5 text-[13px] font-medium">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="size-4 rounded border-border accent-brand-600"
                />
                Featured on homepage
              </label>
              {error && (
                <p className="text-[12.5px] text-destructive">{error}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setDialog("closed")}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  {dialog === "edit" ? "Save Changes" : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
