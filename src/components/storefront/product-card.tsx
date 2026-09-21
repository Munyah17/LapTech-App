"use client";

import { formatUSD } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  badge: string | null;
  rating: number;
  stock: number;
}

const badgeTone = (badge: string | null) => {
  if (!badge) return "brand" as const;
  const b = badge.toLowerCase();
  if (b.includes("sale")) return "destructive" as const;
  if (b.includes("new")) return "success" as const;
  if (b.includes("popular") || b.includes("best")) return "warning" as const;
  return "brand" as const;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleBuyNow = () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    router.push("/checkout");
  };

  return (
    <div className="bg-card rounded-xl border shadow-xs overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <Link href={`/shop/${product.slug}`} className="relative block aspect-[4/3] bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge tone={badgeTone(product.badge)}>{product.badge}</Badge>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-amber-400 mb-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-3.5 ${i < Math.round(product.rating) ? "fill-current" : "text-muted"}`}
              aria-hidden
            />
          ))}
          <span className="text-[11px] text-muted-foreground ml-1 tnum">
            ({product.rating.toFixed(1)})
          </span>
        </div>

        <Link
          href={`/shop/${product.slug}`}
          className="font-semibold text-[14px] leading-snug hover:text-brand-600 line-clamp-1"
        >
          {product.name}
        </Link>
        <p className="text-[12.5px] text-muted-foreground mt-1 line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-[17px] font-bold text-brand-600 tnum">
            {formatUSD(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-[12px] text-muted-foreground line-through tnum">
              {formatUSD(product.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleBuyNow}
            disabled={product.stock === 0}
          >
            <Zap className="size-3.5" aria-hidden />
            Buy Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="size-3.5" aria-hidden />
            {added ? "Added!" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
