"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatUSD } from "@/lib/utils";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, setQty, remove, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="h-8 w-40 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const subtotal = cartSubtotal(items);

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            hint="Browse our shop for laptops, accessories and software."
            action={<ButtonLink href="/shop">Start Shopping</ButtonLink>}
          />
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <Card key={item.productId} className="p-4 flex gap-4">
                <Link
                  href={`/shop/${item.slug}`}
                  className="relative size-20 sm:size-24 rounded-lg overflow-hidden bg-muted shrink-0"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
                      No image
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="font-semibold text-[14px] hover:text-brand-600 line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-brand-600 font-bold text-[15px] mt-1 tnum">
                    {formatUSD(item.price)}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-lg h-8">
                      <button
                        className="px-2.5 h-full hover:bg-muted rounded-l-lg"
                        onClick={() => setQty(item.productId, item.qty - 1)}
                        aria-label="Decrease"
                      >
                        <Minus className="size-3.5" aria-hidden />
                      </button>
                      <span className="w-8 text-center text-[13px] font-semibold tnum">
                        {item.qty}
                      </span>
                      <button
                        className="px-2.5 h-full hover:bg-muted rounded-r-lg"
                        onClick={() => setQty(item.productId, item.qty + 1)}
                        aria-label="Increase"
                      >
                        <Plus className="size-3.5" aria-hidden />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(item.productId)}
                      className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive-soft transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>

                <div className="hidden sm:block text-right shrink-0">
                  <p className="text-[15px] font-bold tnum">
                    {formatUSD(item.price * item.qty)}
                  </p>
                </div>
              </Card>
            ))}

            <button
              onClick={clear}
              className="text-[12.5px] text-muted-foreground hover:text-destructive"
            >
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <Card className="p-5 h-fit lg:sticky lg:top-20">
            <h2 className="text-[15px] font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-[13.5px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tnum">{formatUSD(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-muted-foreground text-[12.5px]">
                  Calculated at checkout
                </span>
              </div>
              <div className="border-t pt-2.5 flex justify-between font-bold text-[15px]">
                <span>Total</span>
                <span className="tnum">{formatUSD(subtotal)}</span>
              </div>
            </div>
            <ButtonLink href="/checkout" size="lg" className="w-full mt-5">
              Proceed to Checkout
            </ButtonLink>
            <ButtonLink
              href="/shop"
              variant="ghost"
              size="sm"
              className="w-full mt-2"
            >
              Continue Shopping
            </ButtonLink>
          </Card>
        </div>
      )}
    </div>
  );
}
