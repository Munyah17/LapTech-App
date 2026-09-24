"use client";

import type { SessionUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User as UserIcon,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Right-side auth control for the storefront header.
 * Logged out  → "Login / Sign Up" button.
 * Logged in   → avatar with dropdown (Notifications, My Profile, Settings, Logout).
 */
export function HeaderAuth({ user }: { user: SessionUser | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setOpen(false);
      router.refresh();
      router.push("/");
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 h-9 px-3.5 sm:px-4 rounded-lg bg-brand-600 text-white text-[12.5px] sm:text-[13px] font-semibold hover:bg-brand-700 transition-colors whitespace-nowrap"
      >
        <UserRound className="size-4" aria-hidden />
        <span className="hidden xs:inline">Login / Sign Up</span>
        <span className="xs:hidden">Login</span>
      </Link>
    );
  }

  const items = [
    { href: "/account", label: "Notifications", icon: Bell },
    { href: "/account", label: "My Profile", icon: UserIcon },
    { href: "/account", label: "Settings", icon: Settings },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <span className="size-9 rounded-full bg-brand-600 text-white flex items-center justify-center text-[12px] font-bold select-none">
          {initials(user.name)}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition-transform hidden sm:block",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 rounded-xl border bg-card shadow-lg shadow-black/10 dark:shadow-black/40 py-1.5 z-50"
        >
          <div className="px-3.5 py-2.5 border-b">
            <p className="text-[13px] font-semibold truncate">{user.name}</p>
            <p className="text-[11.5px] text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
            >
              <item.icon className="size-4 text-muted-foreground" aria-hidden />
              {item.label}
            </Link>
          ))}
          <div className="border-t mt-1 pt-1">
            <button
              role="menuitem"
              onClick={logout}
              disabled={busy}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <LogOut className="size-4" aria-hidden />
              {busy ? "Logging out…" : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
