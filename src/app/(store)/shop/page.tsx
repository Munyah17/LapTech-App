import { getCategories, getShopProducts } from "@/lib/catalog";
import { ShopCatalog } from "./shop-catalog";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse laptops, accessories, software and gadgets at LapTech Harare.",
};

export const revalidate = 60;

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getShopProducts(),
    getCategories(),
  ]);

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Shop</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Laptops, accessories, software and gadgets — delivered across Harare.
        </p>
      </div>
      <Suspense fallback={<div className="h-64 bg-muted rounded-xl animate-pulse" />}>
        <ShopCatalog products={products} categories={categories} />
      </Suspense>
    </div>
  );
}
