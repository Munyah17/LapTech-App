import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { BookingsTable } from "./bookings-table";

export const metadata: Metadata = { title: "Bookings" };

export default async function AdminBookingsPage() {
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Service Bookings"
        description={`${bookings.length} booking${bookings.length !== 1 ? "s" : ""} total`}
      />
      <BookingsTable bookings={bookings} />
    </>
  );
}
