"use client";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);

    if (form.get("password") !== form.get("confirm")) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current: form.get("current"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update password");
      setDone(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Current Password" htmlFor="current" required>
        <Input
          id="current"
          name="current"
          type="password"
          required
          autoComplete="current-password"
        />
      </Field>
      <Field label="New Password" htmlFor="password" required hint="At least 6 characters">
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Confirm New Password" htmlFor="confirm" required>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </Field>
      {error && <p className="text-[12.5px] text-destructive">{error}</p>}
      {done && (
        <p className="text-[12.5px] text-success flex items-center gap-1.5">
          <CheckCircle2 className="size-4" aria-hidden />
          Password updated successfully.
        </p>
      )}
      <Button type="submit" loading={loading}>
        Update Password
      </Button>
    </form>
  );
}
