import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { OrdersTable } from "./orders-table";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${orders.length} order${orders.length !== 1 ? "s" : ""} total`}
      />
      <OrdersTable orders={orders} />
    </>
  );
}
