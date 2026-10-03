import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

/**
 * Cached storefront catalog fetchers.
 * Public pages serve from Vercel's data cache instead of hitting Supabase on
 * every request. Admin mutations call revalidateTag("catalog") to bust this.
 * Keep revalidate windows short as a safety net for missed invalidations.
 */

const CATALOG_TAG = "catalog";

export const getHeroSlides = unstable_cache(
  () =>
    db.heroSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
  ["hero-slides"],
  { revalidate: 300, tags: [CATALOG_TAG] }
);

export const getCategories = unstable_cache(
  (take?: number) =>
    db.category.findMany({
      orderBy: { name: "asc" },
      ...(take ? { take } : {}),
    }),
  ["categories"],
  { revalidate: 300, tags: [CATALOG_TAG] }
);

export const getCategoryProducts = unstable_cache(
  (categoryId: string, take = 10) =>
    db.product.findMany({
      where: { categoryId },
      take,
      orderBy: { createdAt: "desc" },
    }),
  ["category-products"],
  { revalidate: 120, tags: [CATALOG_TAG] }
);

export const getShopProducts = unstable_cache(
  () =>
    db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true, slug: true } } },
    }),
  ["shop-products"],
  { revalidate: 120, tags: [CATALOG_TAG] }
);

export const getProductBySlug = unstable_cache(
  (slug: string) =>
    db.product.findUnique({
      where: { slug },
      include: { category: true },
    }),
  ["product-by-slug"],
  { revalidate: 120, tags: [CATALOG_TAG] }
);

export const getRelatedProducts = unstable_cache(
  (categoryId: string, excludeId: string) =>
    db.product.findMany({
      where: { categoryId, NOT: { id: excludeId } },
      take: 4,
    }),
  ["related-products"],
  { revalidate: 120, tags: [CATALOG_TAG] }
);

export const getActiveServices = unstable_cache(
  () =>
    db.service.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
  ["active-services"],
  { revalidate: 300, tags: [CATALOG_TAG] }
);
