"use client";

import { cn } from "@/lib/utils";
import { Home, Phone, Store, User, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/services#book", label: "Repair", icon: Wrench },
  { href: "/contact", label: "Contact", icon: Phone },
  { href: "/account", label: "Account", icon: User },
];

/** Floating tray-style bottom tab bar for mobile — 5 primary destinations. */
export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-3 inset-x-3 z-50">
      <div className="grid grid-cols-5 bg-card/95 backdrop-blur border rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/40 pb-safe">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href.split("#")[0]) &&
                tab.href.split("#")[0] !== "/";
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-medium transition-colors",
                active ? "text-brand-600" : "text-muted-foreground"
              )}
            >
              <tab.icon className="size-5" aria-hidden />
              {tab.label}
              {active && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-brand-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
