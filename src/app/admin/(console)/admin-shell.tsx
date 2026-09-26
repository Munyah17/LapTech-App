"use client";

import type { SessionUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bike,
  CalendarCheck,
  ChevronsLeft,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { NotificationBell } from "./notification-bell";

const nav = [
  {
    group: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
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
    group: "People",
    items: [
      { href: "/admin/users", label: "User Management", icon: ShieldCheck },
      { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
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

function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <li ref={ref} className="nav-item relative">
      <button
        className="nav-link flex items-center gap-2"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[12px] font-bold">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="d-none d-md-inline text-[13px] font-medium">
          {user.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-card border rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-[13px] font-semibold truncate">{user.name}</p>
            <p className="text-[11.5px] text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-muted/60 transition-colors"
          >
            <Store className="size-4 text-muted-foreground" aria-hidden />
            View Store
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-destructive hover:bg-muted/60 transition-colors text-left"
          >
            <LogOut className="size-4" aria-hidden />
            Sign Out
          </button>
        </div>
      )}
    </li>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="app-wrapper">
      {/* ===== Navbar ===== */}
      <nav className="app-header navbar navbar-expand bg-body shadow-sm">
        <div className="container-fluid">
          <ul className="navbar-nav">
            <li className="nav-item">
              <button
                className="nav-link"
                data-lte-toggle="sidebar"
                aria-label="Toggle sidebar"
              >
                <ChevronsLeft className="size-5" aria-hidden />
              </button>
            </li>
            <li className="nav-item d-none d-md-block">
              <Link href="/admin" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item d-none d-md-block">
              <Link href="/" className="nav-link">
                Store
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto items-center">
            <li className="nav-item">
              <ThemeToggle />
            </li>
            <li className="nav-item">
              <NotificationBell />
            </li>
            <UserMenu user={user} />
          </ul>
        </div>
      </nav>

      {/* ===== Sidebar ===== */}
      <aside className="app-sidebar laptech-sidebar shadow" data-bs-theme="dark">
        <div className="sidebar-brand">
          <Link href="/admin" className="brand-link gap-2">
            <Image
              src="/logo.png"
              alt="LapTech"
              width={110}
              height={36}
              className="brand-image h-7 w-auto brightness-0 invert"
            />
            <span className="brand-text text-[10px] font-bold uppercase tracking-widest text-brand-200">
              Admin
            </span>
          </Link>
        </div>

        <div className="sidebar-wrapper">
          <nav className="pt-2">
            <ul
              className="nav sidebar-menu flex-column"
              role="navigation"
              aria-label="Admin navigation"
            >
              {nav.map((section) => (
                <Fragment key={section.group}>
                  <li className="nav-header text-[10px] font-bold uppercase tracking-widest">
                    {section.group}
                  </li>
                  {section.items.map((item) => {
                    const active =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);
                    return (
                      <li key={item.href} className="nav-item">
                        <Link
                          href={item.href}
                          className={cn("nav-link", active && "active")}
                        >
                          <item.icon
                            className="nav-icon size-[18px]"
                            aria-hidden
                          />
                          <p>{item.label}</p>
                        </Link>
                      </li>
                    );
                  })}
                </Fragment>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className="app-main">
        <div className="app-content">
          <div className="container-fluid py-3 max-w-content mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="app-footer text-[12.5px]">
        <div className="float-end hidden sm:block">
          LapTech Admin Console
        </div>
        <strong>LapTech (Pvt) Ltd</strong> — Harare, Zimbabwe
      </footer>
    </div>
  );
}
