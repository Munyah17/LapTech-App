import { BottomTabBar } from "@/components/storefront/bottom-tab-bar";
import { FloatingCart } from "@/components/storefront/floating-cart";
import { StoreFooter } from "@/components/storefront/footer";
import { StoreHeader } from "@/components/storefront/header";
import { PageTracker } from "@/components/storefront/page-tracker";

// No force-dynamic here — the header fetches the session client-side via
// /api/auth/me, so public pages can be statically cached (ISR) on Vercel's
// edge network. Pages that need the session read cookies themselves.

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1 pt-16 pb-24 lg:pb-0">{children}</main>
      <StoreFooter />
      <FloatingCart />
      <BottomTabBar />
      <PageTracker />
    </div>
  );
}
