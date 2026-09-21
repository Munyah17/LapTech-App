"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface AddToCartProps {
  product: {
    productId: string;
    slug: string;
    name: string;
    price: number;
    image: string | null;
  };
  disabled?: boolean;
}

export function AddToCart({ product, disabled }: AddToCartProps) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
  };

  if (added) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <ButtonLink href="/cart" size="lg" className="flex-1">
          <ShoppingCart className="size-4" aria-hidden />
          View Cart
        </ButtonLink>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => setAdded(false)}
        >
          Add More
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-3 flex-1">
      <div className="flex items-center border rounded-lg h-11">
        <button
          className="px-3 h-full hover:bg-muted rounded-l-lg disabled:opacity-40"
          onClick={() => setQty(Math.max(1, qty - 1))}
          disabled={qty <= 1}
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <span className="w-8 text-center text-sm font-semibold tnum">{qty}</span>
        <button
          className="px-3 h-full hover:bg-muted rounded-r-lg"
          onClick={() => setQty(qty + 1)}
          aria-label="Increase quantity"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
      <Button
        size="lg"
        className="flex-1"
        onClick={handleAdd}
        disabled={disabled}
      >
        <ShoppingCart className="size-4" aria-hidden />
        Add to Cart
      </Button>
    </div>
  );
}
