"use client";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    if (form.get("password") !== form.get("confirm")) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Full Name" htmlFor="name" required>
        <Input id="name" name="name" required placeholder="Your name" autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Field>
      <Field label="Phone" htmlFor="phone" required>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+263 7XX XXX XXX"
          autoComplete="tel"
        />
      </Field>
      <Field label="Password" htmlFor="password" required hint="At least 6 characters">
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </Field>
      <Field label="Confirm Password" htmlFor="confirm" required>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </Field>
      {error && <p className="text-[12.5px] text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Create Account
      </Button>
    </form>
  );
}
