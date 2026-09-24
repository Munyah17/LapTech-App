import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { LeadsTable } from "./leads-table";

export const metadata: Metadata = { title: "Marketing" };

export default async function AdminMarketingPage() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader
        title="Marketing — Leads"
        description="Capture walk-in customers and prospects for outreach and product recommendations."
      />
      <LeadsTable leads={leads} />
    </>
  );
}
