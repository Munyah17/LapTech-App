import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your LapTech account.",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.role === "ADMIN" ? "/admin" : "/account");

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="text-center mb-6">
        <Image
          src="/logo.png"
          alt="LapTech"
          width={140}
          height={48}
          className="h-11 w-auto mx-auto mb-4"
        />
        <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Sign in to track orders and manage your account.
        </p>
      </div>
      <Card className="p-6">
        <LoginForm />
      </Card>
      <p className="text-[13px] text-muted-foreground text-center mt-5">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
