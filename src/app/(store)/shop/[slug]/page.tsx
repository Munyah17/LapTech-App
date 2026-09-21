import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/storefront/product-card";
import { db } from "@/lib/db";
import { formatUSD } from "@/lib/utils";
import { whatsappLink } from "@/lib/site";
import { CheckCircle2, MessageCircle, Star, Truck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCart } from "./add-to-cart";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product) notFound();

  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4,
  });

  const specs: Record<string, string> | null = product.specs
    ? JSON.parse(product.specs)
    : null;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-[12.5px] text-muted-foreground mb-6">
        <a href="/" className="hover:text-foreground">Home</a>
        <span className="mx-1.5">/</span>
        <a href="/shop" className="hover:text-foreground">Shop</a>
        <span className="mx-1.5">/</span>
        <a href={`/shop?category=${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </a>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {product.badge && (
            <div className="absolute top-4 left-4">
              <Badge tone="brand">{product.badge}</Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-[12px] font-medium text-brand-600 uppercase tracking-wide">
            {product.category.name}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
            {product.name}
          </h1>

          <div className="flex items-center gap-1.5 mt-3 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-4 ${i < Math.round(product.rating) ? "fill-current" : "text-muted"}`}
                aria-hidden
              />
            ))}
            <span className="text-[12.5px] text-muted-foreground ml-1 tnum">
              {product.rating.toFixed(1)} rating
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold text-brand-600 tnum">
              {formatUSD(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-[15px] text-muted-foreground line-through tnum">
                {formatUSD(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="text-[14px] text-muted-foreground leading-relaxed mt-4">
            {product.description}
          </p>

          <div className="flex items-center gap-2 mt-4 text-[13px]">
            {product.stock > 0 ? (
              <>
                <CheckCircle2 className="size-4 text-success" aria-hidden />
                <span className="text-success font-medium">
                  In stock ({product.stock} available)
                </span>
              </>
            ) : (
              <span className="text-destructive font-medium">Out of stock</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <AddToCart
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
              }}
              disabled={product.stock === 0}
            />
            <a
              href={whatsappLink(`Hi LapTech! I'm interested in the ${product.name} (${formatUSD(product.price)}).`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg border font-medium text-[13px] hover:bg-muted transition-colors"
            >
              <MessageCircle className="size-4 text-emerald-500" aria-hidden />
              Ask on WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="flex items-center gap-2.5 text-[12.5px] text-muted-foreground">
              <Truck className="size-4 text-brand-600 shrink-0" aria-hidden />
              Delivery across Harare
            </div>
            <div className="flex items-center gap-2.5 text-[12.5px] text-muted-foreground">
              <ShieldCheck className="size-4 text-brand-600 shrink-0" aria-hidden />
              Warranty included
            </div>
          </div>

          {/* Specs */}
          {specs && (
            <div className="mt-8">
              <h2 className="text-[15px] font-semibold mb-3">Specifications</h2>
              <dl className="rounded-xl border divide-y text-[13px]">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="flex px-4 py-2.5">
                    <dt className="w-32 shrink-0 text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight mb-5">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
