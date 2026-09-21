"use client";

import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      if (data.role !== "ADMIN") {
        throw new Error("This account does not have admin access.");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group mb-3">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@laptech.co.zw"
          className="form-control"
        />
        <span className="input-group-text">
          <Mail className="size-4" aria-hidden />
        </span>
      </div>
      <div className="input-group mb-3">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          className="form-control"
        />
        <span className="input-group-text">
          <Lock className="size-4" aria-hidden />
        </span>
      </div>
      {error && (
        <p className="text-[12.5px] text-destructive mb-3">{error}</p>
      )}
      <div className="d-grid">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </div>
    </form>
  );
}
