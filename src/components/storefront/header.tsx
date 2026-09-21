"use client";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function StoreHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-card/95 backdrop-blur border-b">
      <div className="max-w-content mx-auto px-4 h-16 flex items-center gap-3">
        <button
          className="lg:hidden -ml-1 p-2 rounded-lg hover:bg-muted"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="LapTech"
            width={120}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>

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

        <div className="flex items-center gap-1 ml-2 lg:ml-0">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="lg:hidden border-t bg-card px-4 py-3 space-y-1">
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
        </nav>
      )}
    </header>
  );
}
