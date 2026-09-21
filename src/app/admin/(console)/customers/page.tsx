import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatDate, formatUSD } from "@/lib/utils";
import { Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    include: {
      orders: { select: { total: true, status: true } },
      bookings: { select: { id: true } },
    },
  });

  // Also include guest customers who ordered without an account
  const guestOrders = await db.order.findMany({
    where: { userId: null },
    orderBy: { createdAt: "desc" },
  });
  const guestMap = new Map<
    string,
    { name: string; email: string; phone: string; orders: number; spent: number }
  >();
  for (const o of guestOrders) {
    const g = guestMap.get(o.email) ?? {
      name: o.customerName,
      email: o.email,
      phone: o.phone,
      orders: 0,
      spent: 0,
    };
    g.orders += 1;
    if (o.status !== "CANCELLED") g.spent += o.total;
    guestMap.set(o.email, g);
  }
  const guests = [...guestMap.values()].filter(
    (g) => !customers.some((c) => c.email === g.email)
  );

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${customers.length} registered · ${guests.length} guest${guests.length !== 1 ? "s" : ""}`}
      />

      <Card>
        {customers.length === 0 && guests.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            hint="Registered and guest customers will appear here."
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Customer</TH>
                    <TH>Contact</TH>
                    <TH>Type</TH>
                    <TH className="text-right">Orders</TH>
                    <TH className="text-right">Bookings</TH>
                    <TH className="text-right">Total Spent</TH>
                    <TH>Joined</TH>
                  </TR>
                </THead>
                <TBody>
                  {customers.map((c) => {
                    const spent = c.orders
                      .filter((o) => o.status !== "CANCELLED")
                      .reduce((s, o) => s + o.total, 0);
                    return (
                      <TR key={c.id}>
                        <TD className="font-medium">{c.name}</TD>
                        <TD>
                          <p>{c.email}</p>
                          <p className="text-[11.5px] text-muted-foreground">
                            {c.phone ?? "—"}
                          </p>
                        </TD>
                        <TD>
                          <Badge tone="brand">Registered</Badge>
                        </TD>
                        <TD numeric>{c.orders.length}</TD>
                        <TD numeric>{c.bookings.length}</TD>
                        <TD numeric className="font-semibold">
                          {formatUSD(spent)}
                        </TD>
                        <TD>{formatDate(c.createdAt)}</TD>
                      </TR>
                    );
                  })}
                  {guests.map((g) => (
                    <TR key={g.email}>
                      <TD className="font-medium">{g.name}</TD>
                      <TD>
                        <p>{g.email}</p>
                        <p className="text-[11.5px] text-muted-foreground">
                          {g.phone}
                        </p>
                      </TD>
                      <TD>
                        <Badge tone="neutral">Guest</Badge>
                      </TD>
                      <TD numeric>{g.orders}</TD>
                      <TD numeric>0</TD>
                      <TD numeric className="font-semibold">
                        {formatUSD(g.spent)}
                      </TD>
                      <TD>—</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y">
              {customers.map((c) => {
                const spent = c.orders
                  .filter((o) => o.status !== "CANCELLED")
                  .reduce((s, o) => s + o.total, 0);
                return (
                  <div key={c.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[13.5px]">{c.name}</p>
                        <p className="text-[12px] text-muted-foreground">
                          {c.email}
                        </p>
                      </div>
                      <Badge tone="brand">Registered</Badge>
                    </div>
                    <p className="mt-2 text-[12.5px] text-muted-foreground tnum">
                      {c.orders.length} orders · {formatUSD(spent)} spent
                    </p>
                  </div>
                );
              })}
              {guests.map((g) => (
                <div key={g.email} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[13.5px]">{g.name}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {g.email}
                      </p>
                    </div>
                    <Badge tone="neutral">Guest</Badge>
                  </div>
                  <p className="mt-2 text-[12.5px] text-muted-foreground tnum">
                    {g.orders} orders · {formatUSD(g.spent)} spent
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </>
  );
}
