"use client";

import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export interface HeroSlideData {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  cta2Label: string | null;
  cta2Href: string | null;
}

const AUTO_MS = 5000;

export function HeroSlider({ slides }: { slides: HeroSlideData[] }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (dir: 1 | -1) =>
      setIndex((i) => (i + dir + slides.length) % slides.length),
    [slides.length]
  );

  // Auto-advance every 5s, reset on manual nav
  useEffect(() => {
    if (slides.length < 2) return;
    timer.current = setInterval(() => go(1), AUTO_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [index, go, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative bg-slate-950 text-white overflow-hidden"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
          {/* 60–80% dark overlay so banner doesn't clash with text */}
          <div className="absolute inset-0 bg-slate-950/70" />
        </div>
      ))}

      <div className="relative max-w-content mx-auto px-4 py-20 sm:py-28 text-center">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "transition-all duration-500",
              i === index
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3 absolute inset-x-4 top-1/2 -translate-y-1/2 pointer-events-none"
            )}
          >
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
              {s.title}
            </h1>
            {s.subtitle && (
              <p className="text-slate-300 text-[15px] sm:text-lg max-w-xl mx-auto mt-5">
                {s.subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <ButtonLink href={s.ctaHref} size="lg" className="w-full sm:w-auto">
                {s.ctaLabel}
              </ButtonLink>
              {s.cta2Label && s.cta2Href && (
                <ButtonLink
                  href={s.cta2Href}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                >
                  {s.cta2Label}
                </ButtonLink>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white transition-colors"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white transition-colors"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
