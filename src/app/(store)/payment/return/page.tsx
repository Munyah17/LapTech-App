import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payment Status" };

export default function PaymentReturnPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <Card className="p-8 text-center">
        <CheckCircle2 className="size-14 text-success mx-auto mb-4" aria-hidden />
        <h1 className="text-xl font-bold">Thank You!</h1>
        <p className="text-[13.5px] text-muted-foreground mt-2">
          If your payment went through, your order is confirmed and we&apos;ll
          be in touch shortly. If payment is still processing, we&apos;ll update
          your order automatically once Paynow confirms.
        </p>
        <p className="text-[12.5px] text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
          <Clock className="size-3.5" aria-hidden />
          You can check your order status any time in your account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <ButtonLink href="/account">View My Orders</ButtonLink>
          <ButtonLink href="/shop" variant="secondary">
            Continue Shopping
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
