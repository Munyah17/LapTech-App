"use client";

import { cn } from "@/lib/utils";
import {
  Bell,
  CalendarCheck,
  CreditCard,
  Mail,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const typeIcon: Record<string, typeof ShoppingBag> = {
  ORDER: ShoppingBag,
  BOOKING: CalendarCheck,
  PAYMENT: CreditCard,
  CONTACT: Mail,
};

const typeColor: Record<string, string> = {
  ORDER: "bg-brand-600",
  BOOKING: "bg-cyan-600",
  PAYMENT: "bg-emerald-600",
  CONTACT: "bg-amber-500",
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setUnread(data.unread);
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000); // poll every 30s
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function openItem(n: NotificationItem) {
    if (!n.read) {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      });
      setUnread((u) => Math.max(0, u - 1));
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  async function markAll() {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setUnread(0);
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="size-5 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border rounded-xl shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/50">
            <p className="text-[12.5px] font-semibold">Notifications</p>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-[11.5px] text-brand-600 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-[12.5px] text-muted-foreground">
                No notifications yet
              </p>
            ) : (
              items.map((n) => {
                const Icon = typeIcon[n.type] ?? Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => openItem(n)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex gap-3 hover:bg-muted/60 transition-colors",
                      !n.read && "bg-brand-50/60 dark:bg-brand-950/40"
                    )}
                  >
                    <span
                      className={cn(
                        "size-8 rounded-full flex items-center justify-center shrink-0 text-white",
                        typeColor[n.type] ?? "bg-slate-500"
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold truncate">
                        {n.title}
                      </span>
                      <span className="block text-[11.5px] text-muted-foreground line-clamp-2">
                        {n.body}
                      </span>
                      <span className="block text-[10.5px] text-muted-foreground mt-0.5">
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                    {!n.read && (
                      <span className="size-2 rounded-full bg-brand-600 mt-1.5 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
          <Link
            href="/admin/orders"
            onClick={() => setOpen(false)}
            className="block text-center text-[12px] font-medium text-brand-600 py-2.5 border-t hover:bg-muted/50"
          >
            View orders
          </Link>
        </div>
      )}
    </div>
  );
}
