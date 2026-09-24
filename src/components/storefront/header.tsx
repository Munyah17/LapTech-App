"use client";

import type { SessionUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderAuth } from "./header-auth";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function StoreHeader({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-card/95 backdrop-blur border-b">
      <div className="max-w-content mx-auto px-4 h-16 flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          className="lg:hidden -ml-1 p-2 rounded-lg hover:bg-muted"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {/* Logo — desktop only (keeps the mobile bar clean) */}
        <Link href="/" className="hidden lg:flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="LapTech"
            width={120}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-auto">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors",
                pathname === item.href
                  ? "text-brand-600 bg-brand-50 dark:bg-brand-950"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side — theme toggle (desktop) + auth */}
        <div className="flex items-center gap-1.5 ml-auto lg:ml-2">
          <span className="hidden lg:block">
            <ThemeToggle />
          </span>
          <HeaderAuth user={user} />
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="lg:hidden border-t bg-card px-4 py-3 space-y-1">
          <Link href="/" className="flex items-center gap-2 px-1 py-2 mb-1">
            <Image
              src="/logo.png"
              alt="LapTech"
              width={110}
              height={36}
              className="h-8 w-auto"
            />
          </Link>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-2.5 rounded-lg text-sm font-medium",
                pathname === item.href
                  ? "text-brand-600 bg-brand-50 dark:bg-brand-950"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/services#book"
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-brand-600"
          >
            Book a Repair
          </Link>
          <div className="flex items-center justify-between px-3 py-2.5 border-t mt-2 pt-3">
            <span className="text-sm font-medium text-muted-foreground">
              Theme
            </span>
            <ThemeToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
