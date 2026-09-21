import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { SlidesTable } from "./slides-table";

export const metadata: Metadata = { title: "Hero Slides" };

export default async function AdminSlidesPage() {
  const slides = await db.heroSlide.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <PageHeader
        title="Hero Slides"
        description="Banners shown in the homepage hero slider. Images are displayed at a standard 21:9 ratio."
      />
      <SlidesTable slides={slides} />
    </>
  );
}
