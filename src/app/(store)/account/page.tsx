import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatUSD } from "@/lib/utils";
import { Package, ShoppingBag, Wrench } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";

export const metadata: Metadata = {
  title: "My Account",
  description: "View your orders, bookings and account details.",
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [orders, bookings] = await Promise.all([
    db.order.findMany({
      where: { OR: [{ userId: session.id }, { email: session.email }] },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    db.booking.findMany({
      where: { OR: [{ userId: session.id }, { email: session.email }] },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hi, {session.name.split(" ")[0]}
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {session.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* Orders */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-brand-600" aria-hidden />
            My Orders
          </CardTitle>
        </CardHeader>
        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            hint="Your orders will appear here once you make a purchase."
          />
        ) : (
          <div className="divide-y">
            {orders.map((o) => (
              <div key={o.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[13.5px] font-semibold tnum">
                      {o.orderNumber}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {formatDate(o.createdAt)} ·{" "}
                      {o.deliveryMethod === "DELIVERY"
                        ? `Delivery — ${o.suburb}`
                        : "Pickup"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={o.status} />
                    <span className="text-[14px] font-bold tnum">
                      {formatUSD(o.total)}
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 text-[12.5px] text-muted-foreground">
                  {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="size-4 text-brand-600" aria-hidden />
            My Service Bookings
          </CardTitle>
        </CardHeader>
        {bookings.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No bookings yet"
            hint="Book a repair or service and track it here."
          />
        ) : (
          <div className="divide-y">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="px-5 py-4 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <p className="text-[13.5px] font-semibold">{b.serviceType}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {b.device} · {formatDate(b.createdAt)}
                    {b.preferredDate ? ` · Pref: ${b.preferredDate}` : ""}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
