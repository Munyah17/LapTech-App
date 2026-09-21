import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = { title: "Admin Login" };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "ADMIN") redirect("/admin");

  return (
    <div className="login-box">
      <div className="login-logo mb-2">
        <Link href="/" className="inline-flex flex-col items-center gap-2">
          <Image
            src="/logo.png"
            alt="LapTech"
            width={140}
            height={48}
            className="h-11 w-auto"
            priority
          />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Admin Console
          </span>
        </Link>
      </div>
      <div className="card shadow">
        <div className="card-body login-card-body">
          <p className="login-box-msg">
            Sign in with your administrator account
          </p>
          <AdminLoginForm />
        </div>
      </div>
      <p className="text-center text-[12px] text-muted-foreground mt-4">
        Authorized personnel only
      </p>
    </div>
  );
}
