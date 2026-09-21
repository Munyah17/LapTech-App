import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { ZonesTable } from "./zones-table";

export const metadata: Metadata = { title: "Delivery Zones" };

export default async function AdminDeliveryPage() {
  const zones = await db.deliveryZone.findMany({
    orderBy: { minKm: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Delivery Zones"
        description="Manage Harare delivery coverage and fees (40km radius from CBD)."
      />
      <ZonesTable zones={zones} />
    </>
  );
}
