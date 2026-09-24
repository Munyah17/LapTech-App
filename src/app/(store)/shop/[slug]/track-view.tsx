"use client";

import { useEffect } from "react";

/** Fires a product-view interaction once on mount for recommendations. */
export function TrackView({
  productId,
  categoryId,
}: {
  productId: string;
  categoryId: string;
}) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "VIEW", productId, categoryId }),
    }).catch(() => {});
  }, [productId, categoryId]);

  return null;
}
