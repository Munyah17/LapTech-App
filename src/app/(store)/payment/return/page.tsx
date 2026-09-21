import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatUSD } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { PaymentPoll } from "./payment-poll";

export const metadata: Metadata = { title: "Payment Status" };

interface Props {
  searchParams: Promise<{ order?: string | string[] }>;
}

export default async function PaymentReturnPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderId = Array.isArray(params.order) ? params.order[0] : params.order;
  const order = orderId
    ? await db.order.findUnique({ where: { id: orderId } })
    : null;

  if (order) {
    const paid = order.paymentStatus === "PAID";
    const awaiting = order.paymentStatus === "AWAITING";
    const failed = order.paymentStatus === "FAILED";

    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <Card className="p-8 text-center">
          {failed ? (
            <XCircle className="size-14 text-destructive mx-auto mb-4" aria-hidden />
          ) : (
            <CheckCircle2 className="size-14 text-success mx-auto mb-4" aria-hidden />
          )}
          <h1 className="text-xl font-bold">Payment Status</h1>
          <p className="text-[13.5px] text-muted-foreground mt-2">
            Order <span className="font-semibold text-foreground tnum">{order.orderNumber}</span>
          </p>
          <p className="text-lg font-bold tnum mt-2">{formatUSD(order.total)}</p>
          <div className="mt-4">
            <Badge tone={paid ? "success" : awaiting ? "warning" : "destructive"}>
              {paid
                ? "Payment confirmed"
                : awaiting
                  ? "Awaiting confirmation"
                  : "Payment failed"}
            </Badge>
          </div>
          {awaiting && <PaymentPoll orderId={order.id} />}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            {failed ? (
              <ButtonLink href="/checkout">Retry</ButtonLink>
            ) : (
              <ButtonLink href="/account">View My Orders</ButtonLink>
            )}
            <ButtonLink href="/shop" variant="secondary">
              Continue Shopping
            </ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

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
