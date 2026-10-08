"use client";

import type { SessionUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BarChart3,
  Bike,
  CalendarCheck,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Settings,
  ShieldCheck,
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

function SidebarUserPanel({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="px-3 pt-3 pb-4 border-t border-white/10 mt-2">
      <div className="flex items-center gap-3">
        {/* Avatar slot — initials fallback until a photo exists on the account */}
        <span className="size-10 shrink-0 rounded-full bg-brand-600 text-white flex items-center justify-center text-[15px] font-bold ring-2 ring-white/20">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-white truncate">
            {user.name}
          </p>
          <p className="text-[11px] text-white/50 truncate">{user.email}</p>
        </div>
      </div>
      <div className="mt-2.5 flex gap-1.5">
        <Link
          href="/admin/settings"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5 text-[11.5px] font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Settings className="size-3.5" aria-hidden />
          Settings
        </Link>
        <button
          onClick={logout}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5 text-[11.5px] font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors disabled:opacity-50"
        >
          <LogOut className="size-3.5" aria-hidden />
          {busy ? "…" : "Logout"}
        </button>
      </div>
    </div>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Drive AdminLTE's built-in responsive state: body.sidebar-open slides the
  // fixed sidebar in over the content (<992px) — content is never pushed.
  // On lg+ the sidebar is static and always visible.
  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Auto-close the mobile drawer on navigation and Escape.
  useEffect(() => setSidebarOpen(false), [pathname]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app-wrapper">
      {/* ===== Navbar ===== */}
      <nav className="app-header navbar navbar-expand bg-body shadow-sm">
        <div className="container-fluid">
          <ul className="navbar-nav">
            <li className="nav-item">
              {/* Hamburger — mobile only (d-lg-none); desktop sidebar is static */}
              <button
                className="nav-link d-lg-none"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                aria-expanded={sidebarOpen}
              >
                <Menu className="size-5" aria-hidden />
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
          {/* X — retracts the overlay sidebar on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="d-lg-none ms-auto me-1 inline-flex size-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="size-5" aria-hidden />
          </button>
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

          {/* Back to storefront — session stays logged in */}
          <div className="px-3 pt-3 pb-4 border-t border-white/10 mt-2">
            <Link
              href="/"
              className="nav-link flex items-center gap-2 rounded-lg text-brand-200 hover:text-white"
            >
              <ArrowLeft className="nav-icon size-[18px]" aria-hidden />
              <p className="font-medium">Back to Website</p>
            </Link>
          </div>

          {/* User panel — avatar, name, email, settings, logout */}
          <SidebarUserPanel user={user} />
        </div>
      </aside>

      {/* Backdrop — tapping outside the drawer retracts it (mobile only) */}
      <div
        className="sidebar-overlay d-lg-none"
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

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
