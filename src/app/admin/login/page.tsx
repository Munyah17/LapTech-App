import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = { title: "Admin Login" };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "ADMIN") redirect("/admin");

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="LapTech"
            width={140}
            height={48}
            className="h-11 w-auto mx-auto mb-4 brightness-0 invert"
          />
          <h1 className="text-xl font-bold text-white tracking-tight">
            Admin Console
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            Sign in with your administrator account
          </p>
        </div>
        <div className="bg-card rounded-2xl border p-6 shadow-xl">
          <AdminLoginForm />
        </div>
        <p className="text-center text-[12px] text-slate-500 mt-6">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
