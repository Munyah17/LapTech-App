"use client";

import { ProductCard, type ProductCardData } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PackageSearch, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

interface Product extends ProductCardData {
  category: { name: string; slug: string };
}

interface ShopCatalogProps {
  products: Product[];
  categories: { id: string; name: string; slug: string }[];
}

type Sort = "newest" | "price-asc" | "price-desc" | "name";

export function ShopCatalog({ products, categories }: ShopCatalogProps) {
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [sort, setSort] = useState<Sort>("newest");

  const filtered = useMemo(() => {
    let list = products;
    if (category !== "all") {
      list = list.filter((p) => p.category.slug === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "name":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [products, category, query, sort]);

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category chips — horizontally scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 -mx-4 px-4">
            {[{ slug: "all", name: "All" }, ...categories].map((c) => (
              <button
                key={c.slug}
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "shrink-0 h-8 px-3.5 rounded-full text-[12.5px] font-medium border transition-colors",
                  category === c.slug
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="w-[130px] shrink-0 h-8 text-[12.5px]"
            aria-label="Sort"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name">Name A–Z</option>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No products found"
          hint="Try a different search or category."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
