"use client";

import { ProductCard, type ProductCardData } from "./product-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

/**
 * Horizontal product carousel with "peek" effect — half a card visible on
 * each edge so users see there's more. Scrolls one card-width per click;
 * swipe works natively via touch scroll.
 *
 * Card widths: mobile ~62vw (1 full + 2 halves), tablet ~31%, desktop ~23.5%.
 */
export function ProductCarousel({
  title,
  subtitle,
  seeAllHref,
  products,
}: {
  title: string;
  subtitle?: string;
  seeAllHref: string;
  products: ProductCardData[];
}) {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const w = card ? card.offsetWidth + 16 : el.clientWidth * 0.6;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-10">
      <div className="max-w-content mx-auto px-4">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[13px] text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={seeAllHref}
              className="text-[13px] font-medium text-brand-600 hover:underline"
            >
              See All
            </Link>
            <div className="hidden sm:flex gap-1.5">
              <button
                onClick={() => scroll(-1)}
                aria-label="Scroll left"
                className="p-2 rounded-full border bg-card hover:bg-muted transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => scroll(1)}
                aria-label="Scroll right"
                className="p-2 rounded-full border bg-card hover:bg-muted transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Track — padded so first/last cards can peek at edges */}
      <div
        ref={track}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-[8vw] sm:px-[6vw] lg:px-[calc((100vw-1400px)/2+2rem)] scroll-smooth"
      >
        {products.map((p) => (
          <div
            key={p.id}
            data-card
            className="snap-center shrink-0 w-[62vw] sm:w-[31%] lg:w-[23.5%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Mobile arrows */}
      <div className="flex sm:hidden justify-center gap-2 mt-4">
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="p-2 rounded-full border bg-card"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="p-2 rounded-full border bg-card"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
