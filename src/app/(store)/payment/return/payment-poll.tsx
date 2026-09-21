"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PaymentPoll({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    const startedAt = Date.now();
    const poll = async () => {
      if (Date.now() - startedAt >= 120_000) return;
      try {
        const response = await fetch("/api/paynow/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await response.json();
        if (data.paid) {
          router.refresh();
        }
      } catch {
        // Keep polling until the timeout.
      }
    };

    const interval = window.setInterval(poll, 4_000);
    return () => window.clearInterval(interval);
  }, [orderId, router]);

  return (
    <p className="text-[12.5px] text-muted-foreground mt-3">
      We&apos;re checking Paynow for confirmation…
    </p>
  );
}
