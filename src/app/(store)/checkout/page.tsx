import { getDeliveryZones } from "@/lib/delivery";
import { getSession } from "@/lib/auth";
import { getBalance } from "@/lib/wallet";
import { CheckoutForm } from "./checkout-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order — pickup in store or delivery across Harare.",
};

export default async function CheckoutPage() {
  const [zones, session] = await Promise.all([
    getDeliveryZones(),
    getSession(),
  ]);
  const walletBalance = session ? await getBalance(session.id) : null;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Checkout</h1>
      <CheckoutForm
        zones={zones}
        defaultName={session?.name ?? ""}
        defaultEmail={session?.email ?? ""}
        walletBalance={walletBalance}
      />
    </div>
  );
}
