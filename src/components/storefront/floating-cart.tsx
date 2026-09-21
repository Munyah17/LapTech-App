"use client";

import { cartCount, useCart } from "@/lib/cart-store";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Floating cart button — only visible when the cart has items. */
export function FloatingCart() {
  const items = useCart((s) => s.items);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? cartCount(items) : 0;
  if (count === 0 || pathname === "/cart" || pathname === "/checkout") {
    return null;
  }

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className="fixed bottom-20 lg:bottom-6 right-4 z-40 flex items-center gap-2 rounded-full bg-brand-600 text-white pl-4 pr-5 py-3 shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-colors"
    >
      <ShoppingCart className="size-5" aria-hidden />
      <span className="text-[13px] font-semibold tnum">{count}</span>
    </Link>
  );
}
