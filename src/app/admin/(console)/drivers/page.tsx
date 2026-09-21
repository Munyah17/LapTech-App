import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { DriversTable } from "./drivers-table";

export const metadata: Metadata = { title: "Drivers" };

export default async function AdminDriversPage() {
  const drivers = await db.driver.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader
        title="Delivery Drivers"
        description="Bikers and InDrive drivers LapTech has delivery agreements with."
      />
      <DriversTable drivers={drivers} />
    </>
  );
}
