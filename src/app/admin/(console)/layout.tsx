import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "./admin-shell";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Admin Console",
    template: "%s — LapTech Admin",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/admin/login");

  return <AdminShell user={session}>{children}</AdminShell>;
}
