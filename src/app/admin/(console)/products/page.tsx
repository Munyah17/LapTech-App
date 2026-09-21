import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { ProductsTable } from "./products-table";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true, slug: true } } },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} product${products.length !== 1 ? "s" : ""} in catalog`}
      />
      <ProductsTable products={products} categories={categories} />
    </>
  );
}
