import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatUSD } from "@/lib/utils";
import { getOrCreateWallet } from "@/lib/wallet";
import {
  CalendarCheck,
  Package,
  ShoppingBag,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { WalletCard } from "./wallet-card";

export const metadata: Metadata = {
  title: "My Account",
  description: "View your orders, bookings and account details.",
};

interface StatTile {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: string;
  iconBg: string;
}

function StatTileCard({ icon: Icon, label, value, tone, iconBg }: StatTile) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card px-3.5 py-3 sm:px-5 sm:py-4 flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <span
        className={`size-8 sm:size-9 shrink-0 rounded-xl flex items-center justify-center ${iconBg}`}
        aria-hidden
      >
        <Icon className={`size-4 ${tone}`} />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] sm:text-lg font-semibold tnum leading-tight truncate">
          {value}
        </p>
        <p className="text-[10.5px] sm:text-[11px] text-muted-foreground leading-tight">
          {label}
        </p>
      </div>
    </div>
  );
}

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [orders, bookings, wallet] = await Promise.all([
    db.order.findMany({
      where: { OR: [{ userId: session.id }, { email: session.email }] },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    db.booking.findMany({
      where: { OR: [{ userId: session.id }, { email: session.email }] },
      orderBy: { createdAt: "desc" },
    }),
    getOrCreateWallet(session.id),
  ]);
  const transactions = await db.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const activeBookings = bookings.filter(
    (b) => !["COMPLETED", "CANCELLED"].includes(b.status)
  ).length;

  const tiles: StatTile[] = [
    {
      icon: Wallet,
      label: "Wallet balance",
      value: formatUSD(wallet.balance),
      tone: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      icon: ShoppingBag,
      label: "Orders",
      value: String(orders.length),
      tone: "text-brand-600 dark:text-brand-300",
      iconBg: "bg-brand-500/10",
    },
    {
      icon: CalendarCheck,
      label: "Active bookings",
      value: String(activeBookings),
      tone: "text-cyan-600 dark:text-cyan-400",
      iconBg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="max-w-content mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-start justify-between mb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Hi, {session.name.split(" ")[0]}
          </h1>
          <p className="text-[12.5px] text-muted-foreground mt-0.5 truncate">
            {session.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        {tiles.map((t) => (
          <StatTileCard key={t.label} {...t} />
        ))}
      </div>

      {/* Wallet */}
      <WalletCard balance={wallet.balance} transactions={transactions} />

      {/* Orders */}
      <Card className="mb-5 rounded-2xl">
        <CardHeader className="px-4 sm:px-5 pt-4 pb-2.5">
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
              <div key={o.id} className="px-4 sm:px-5 py-3.5">
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
      <Card className="rounded-2xl">
        <CardHeader className="px-4 sm:px-5 pt-4 pb-2.5">
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
                className="px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-2"
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
