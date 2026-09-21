"use client";

import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { CalendarCheck, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  device: string;
  serviceType: string;
  description: string | null;
  preferredDate: string | null;
  status: string;
  createdAt: Date;
}

const statuses = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = bookings;
    if (statusFilter !== "all")
      list = list.filter((b) => b.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.phone.includes(q) ||
          b.device.toLowerCase().includes(q) ||
          b.serviceType.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, query, statusFilter]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    router.refresh();
  }

  return (
    <Card>
      <div className="p-4 flex flex-col sm:flex-row gap-3 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, device, service…"
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
          icon={CalendarCheck}
          title="No bookings found"
          hint="Service bookings will appear here."
        />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Device</TH>
                  <TH>Service</TH>
                  <TH>Preferred</TH>
                  <TH>Booked</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((b) => (
                  <TR key={b.id}>
                    <TD>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-[11.5px] text-muted-foreground">
                        {b.phone}
                      </p>
                    </TD>
                    <TD>{b.device}</TD>
                    <TD>
                      <p>{b.serviceType}</p>
                      {b.description && (
                        <p className="text-[11.5px] text-muted-foreground line-clamp-1 max-w-56">
                          {b.description}
                        </p>
                      )}
                    </TD>
                    <TD>{b.preferredDate ?? "—"}</TD>
                    <TD>{formatDate(b.createdAt)}</TD>
                    <TD>
                      <Select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        disabled={updating === b.id}
                        className="h-7 w-36 text-[12px]"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </Select>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="lg:hidden divide-y">
            {filtered.map((b) => (
              <div key={b.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[13.5px]">{b.serviceType}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {b.name} · {b.device}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                {b.description && (
                  <p className="mt-2 text-[12.5px] text-muted-foreground">
                    {b.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[12px] text-muted-foreground">
                    {b.phone}
                  </span>
                  <Select
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                    disabled={updating === b.id}
                    className="h-8 w-36 text-[12px]"
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
