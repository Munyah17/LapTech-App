import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { UsersTable } from "./users-table";

export const metadata: Metadata = { title: "User Management" };

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      wallet: { select: { balance: true } },
      _count: { select: { orders: true, bookings: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="User Management"
        description="Manage admin staff and client accounts, roles and wallets."
      />
      <UsersTable users={users} />
    </>
  );
}
