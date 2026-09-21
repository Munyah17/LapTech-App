import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { ServicesTable } from "./services-table";

export const metadata: Metadata = { title: "Services" };

export default async function AdminServicesPage() {
  const services = await db.service.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <PageHeader
        title="Services"
        description="Service cards shown on the storefront — upload an image URL, title and description for each."
      />
      <ServicesTable services={services} />
    </>
  );
}
