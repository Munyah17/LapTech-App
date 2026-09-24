import { BottomTabBar } from "@/components/storefront/bottom-tab-bar";
import { FloatingCart } from "@/components/storefront/floating-cart";
import { StoreFooter } from "@/components/storefront/footer";
import { StoreHeader } from "@/components/storefront/header";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader user={session} />
      <main className="flex-1 pt-16 pb-24 lg:pb-0">{children}</main>
      <StoreFooter />
      <FloatingCart />
      <BottomTabBar />
    </div>
  );
}
