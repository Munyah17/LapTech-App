import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your LapTech account to shop and track orders.",
};

export default async function RegisterPage() {
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
        <h1 className="text-xl font-bold tracking-tight">Create your account</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Shop faster, track orders and manage bookings.
        </p>
      </div>
      <Card className="p-6">
        <RegisterForm />
      </Card>
      <p className="text-[13px] text-muted-foreground text-center mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
