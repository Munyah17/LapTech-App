import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { db } from "@/lib/db";
import { cn, formatDate, formatUSD } from "@/lib/utils";
import {
  CalendarCheck,
  ClipboardList,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

/** SB Admin 2 style stat card — colored left accent, uppercase label, faded icon */
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: "brand" | "emerald" | "cyan" | "amber";
  hint?: string;
}) {
  const accents = {
    brand: "border-l-brand-600 text-brand-600",
    emerald: "border-l-emerald-500 text-emerald-600",
    cyan: "border-l-cyan-500 text-cyan-600",
    amber: "border-l-amber-400 text-amber-500",
  };
  const [border, text] = accents[accent].split(" ");
  return (
    <div
      className={cn(
        "bg-white dark:bg-card rounded-lg shadow-sm border-l-4 p-5 flex items-center justify-between",
        border
      )}
    >
      <div>
        <p
          className={cn(
            "text-[11px] font-bold uppercase tracking-wider",
            text
          )}
        >
          {label}
        </p>
        <p className="text-xl font-bold text-slate-700 dark:text-foreground tnum mt-1">
          {value}
        </p>
        {hint && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
        )}
      </div>
      <Icon className="size-8 text-slate-200 dark:text-slate-700" aria-hidden />
    </div>
  );
}

export default async function AdminDashboard() {
  const [
    orderCount,
    pendingOrders,
    bookingCount,
    pendingBookings,
    productCount,
    customerCount,
    revenueAgg,
    recentOrders,
    recentBookings,
    lowStock,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.booking.count(),
    db.booking.count({ where: { status: "PENDING" } }),
    db.product.count(),
    db.user.count({ where: { role: "CLIENT" } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    db.booking.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    db.product.findMany({
      where: { stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
    }),
  ]);

  const revenue = revenueAgg._sum.total ?? 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your shop's performance and activity."
      />

      {/* Stat cards — SB Admin 2 style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={formatUSD(revenue)}
          accent="brand"
        />
        <StatCard
          icon={ShoppingBag}
          label="Orders"
          value={orderCount}
          accent="emerald"
          hint={pendingOrders > 0 ? `${pendingOrders} pending` : undefined}
        />
        <StatCard
          icon={CalendarCheck}
          label="Bookings"
          value={bookingCount}
          accent="cyan"
          hint={pendingBookings > 0 ? `${pendingBookings} pending` : undefined}
        />
        <StatCard
          icon={ClipboardList}
          label="Pending Tasks"
          value={pendingOrders + pendingBookings}
          accent="amber"
          hint={`${customerCount} customers · ${productCount} products`}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <Card className="lg:col-span-2">
          <CardHeader
            action={
              <Link
                href="/admin/orders"
                className="text-[12.5px] font-medium text-brand-600 hover:underline"
              >
                View all
              </Link>
            }
          >
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Order</TH>
                    <TH>Customer</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Total</TH>
                  </TR>
                </THead>
                <TBody>
                  {recentOrders.length === 0 ? (
                    <TR>
                      <TD colSpan={4} className="text-center text-muted-foreground py-8">
                        No orders yet
                      </TD>
                    </TR>
                  ) : (
                    recentOrders.map((o) => (
                      <TR key={o.id}>
                        <TD>
                          <p className="font-medium tnum">{o.orderNumber}</p>
                          <p className="text-[11.5px] text-muted-foreground">
                            {formatDate(o.createdAt)}
                          </p>
                        </TD>
                        <TD>
                          <p className="font-medium">{o.customerName}</p>
                          <p className="text-[11.5px] text-muted-foreground">
                            {o.items.length} item{o.items.length !== 1 && "s"}
                          </p>
                        </TD>
                        <TD>
                          <StatusBadge status={o.status} />
                        </TD>
                        <TD numeric className="font-semibold">
                          {formatUSD(o.total)}
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Side column */}
        <div className="space-y-4">
          {/* Pending bookings */}
          <Card>
            <CardHeader
              action={
                <Link
                  href="/admin/bookings"
                  className="text-[12.5px] font-medium text-brand-600 hover:underline"
                >
                  View all
                </Link>
              }
            >
              <CardTitle>Latest Bookings</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {recentBookings.length === 0 ? (
                <p className="text-[13px] text-muted-foreground px-5 pb-4">
                  No bookings yet
                </p>
              ) : (
                <div className="divide-y">
                  {recentBookings.map((b) => (
                    <div key={b.id} className="px-5 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-medium truncate">
                          {b.serviceType}
                        </p>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-[11.5px] text-muted-foreground mt-0.5">
                        {b.name} · {b.device}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low stock */}
          <Card>
            <CardHeader
              action={
                <Link
                  href="/admin/products"
                  className="text-[12.5px] font-medium text-brand-600 hover:underline"
                >
                  Manage
                </Link>
              }
            >
              <CardTitle className="flex items-center gap-2">
                <Package className="size-4 text-warning" aria-hidden />
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {lowStock.length === 0 ? (
                <p className="text-[13px] text-muted-foreground px-5 pb-4">
                  All products well stocked
                </p>
              ) : (
                <div className="divide-y">
                  {lowStock.map((p) => (
                    <div
                      key={p.id}
                      className="px-5 py-2.5 flex items-center justify-between gap-2"
                    >
                      <p className="text-[13px] font-medium truncate">
                        {p.name}
                      </p>
                      <span
                        className={`text-[12px] font-bold tnum ${p.stock === 0 ? "text-destructive" : "text-warning"}`}
                      >
                        {p.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
