"use client";

import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDate, formatUSD } from "@/lib/utils";
import { ChevronDown, ChevronUp, Search, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: string;
  address: string | null;
  suburb: string | null;
  zoneName: string | null;
  paymentMethod: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  items: OrderItem[];
}

const statuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const paymentLabel: Record<string, string> = {
  CASH_ON_DELIVERY: "Cash",
  ECOCASH: "EcoCash",
  BANK_TRANSFER: "Bank Transfer",
  IN_STORE: "In Store",
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, query, statusFilter]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    router.refresh();
  }

  return (
    <Card>
      {/* Toolbar */}
      <div className="p-4 flex flex-col sm:flex-row gap-3 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order #, name, phone…"
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-44"
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          hint="Orders will appear here when customers check out."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Customer</TH>
                  <TH>Delivery</TH>
                  <TH>Payment</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Total</TH>
                  <TH />
                </TR>
              </THead>
              <TBody>
                {filtered.map((o) => (
                  <>
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
                          {o.phone}
                        </p>
                      </TD>
                      <TD>
                        {o.deliveryMethod === "DELIVERY" ? (
                          <>
                            <p>{o.suburb}</p>
                            <p className="text-[11.5px] text-muted-foreground">
                              {o.zoneName}
                            </p>
                          </>
                        ) : (
                          "Pickup"
                        )}
                      </TD>
                      <TD>{paymentLabel[o.paymentMethod] ?? o.paymentMethod}</TD>
                      <TD>
                        <Select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          disabled={updating === o.id}
                          className="h-7 w-40 text-[12px]"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </option>
                          ))}
                        </Select>
                      </TD>
                      <TD numeric className="font-semibold">
                        {formatUSD(o.total)}
                      </TD>
                      <TD>
                        <button
                          onClick={() =>
                            setExpanded(expanded === o.id ? null : o.id)
                          }
                          className="p-1.5 rounded hover:bg-muted"
                          aria-label="Toggle details"
                        >
                          {expanded === o.id ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </button>
                      </TD>
                    </TR>
                    {expanded === o.id && (
                      <TR key={`${o.id}-detail`} className="hover:bg-transparent">
                        <TD colSpan={7} className="bg-muted-soft">
                          <div className="py-2 space-y-1.5 text-[12.5px]">
                            {o.items.map((i) => (
                              <div key={i.id} className="flex justify-between max-w-md">
                                <span>
                                  {i.qty}× {i.name}
                                </span>
                                <span className="tnum">{formatUSD(i.price * i.qty)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between max-w-md text-muted-foreground pt-1 border-t">
                              <span>Delivery fee</span>
                              <span className="tnum">{formatUSD(o.deliveryFee)}</span>
                            </div>
                            {o.address && (
                              <p className="text-muted-foreground pt-1">
                                📍 {o.address}, {o.suburb}
                              </p>
                            )}
                            {o.notes && (
                              <p className="text-muted-foreground">
                                Note: {o.notes}
                              </p>
                            )}
                          </div>
                        </TD>
                      </TR>
                    )}
                  </>
                ))}
              </TBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y">
            {filtered.map((o) => (
              <div key={o.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[13.5px] tnum">
                      {o.orderNumber}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {o.customerName} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-2 text-[12.5px] text-muted-foreground">
                  {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="font-bold text-[14px] tnum">
                    {formatUSD(o.total)}
                  </span>
                  <Select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    disabled={updating === o.id}
                    className="h-8 w-40 text-[12px]"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
