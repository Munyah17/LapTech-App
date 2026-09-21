"use client";

import type { SessionUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Bike,
  CalendarCheck,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationBell } from "./notification-bell";

const nav = [
  {
    group: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    group: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/services", label: "Services", icon: Wrench },
      { href: "/admin/slides", label: "Hero Slides", icon: ImageIcon },
    ],
  },
  {
    group: "Operations",
    items: [
      { href: "/admin/delivery", label: "Delivery Zones", icon: Truck },
      { href: "/admin/drivers", label: "Drivers", icon: Bike },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const sidebar = (
    /* SB Admin 2 style — brand gradient sidebar */
    <div className="flex flex-col h-full bg-gradient-to-b from-brand-700 via-brand-800 to-brand-950 text-brand-100">
      {/* Brand */}
      <Link
        href="/admin"
        className="h-16 flex items-center justify-center gap-2.5 border-b border-white/10"
      >
        <Image
          src="/logo.png"
          alt="LapTech"
          width={110}
          height={36}
          className="h-8 w-auto brightness-0 invert"
        />
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-200 mt-1">
          Admin
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {nav.map((section) => (
          <div key={section.group}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-300/80">
              {section.group}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all",
                        active
                          ? "bg-white/15 text-white shadow-sm"
                          : "text-brand-100/80 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-brand-100/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Store className="size-4" aria-hidden />
          View Store
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-brand-100/80 hover:bg-white/10 hover:text-white transition-colors text-left"
        >
          <LogOut className="size-4" aria-hidden />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 z-40">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 z-50">
            <button
              className="absolute top-4 right-3 p-1.5 text-brand-200 hover:text-white z-10"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </>
      )}

      {/* Main */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        {/* Topbar — SB Admin 2 white bar with shadow */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-card shadow-sm flex items-center gap-3 px-4 sm:px-6">
          <button
            className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-muted"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="w-px h-8 bg-border mx-1 hidden sm:block" />
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-semibold leading-tight text-slate-700 dark:text-foreground">
                {user.name}
              </p>
              <p className="text-[11px] text-muted-foreground">Administrator</p>
            </div>
            <div className="size-9 rounded-full bg-brand-600 text-white flex items-center justify-center text-[13px] font-bold shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-content w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
