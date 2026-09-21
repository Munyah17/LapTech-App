"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";

const serviceTypes = [
  "Hardware Repair",
  "Software Troubleshooting",
  "Overheating / Fan Service",
  "Performance Upgrade (RAM/SSD)",
  "Battery Replacement",
  "Data Recovery",
  "Vinyl Wrapping / Customization",
  "Software Installation / Activation",
  "Virus Removal",
  "General Diagnostic",
  "Other",
];

export function BookingForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="size-12 text-success mx-auto mb-4" aria-hidden />
        <h3 className="text-lg font-semibold">Booking Received!</h3>
        <p className="text-[13px] text-muted-foreground mt-2 max-w-sm mx-auto">
          We&apos;ll contact you shortly to confirm your booking and arrange a
          free diagnostic. Thank you for choosing LapTech.
        </p>
        <Button
          variant="secondary"
          className="mt-5"
          onClick={() => setDone(false)}
        >
          Book Another Service
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
      <Field label="Full Name" htmlFor="name" required>
        <Input id="name" name="name" required placeholder="Your name" />
      </Field>
      <Field label="Phone" htmlFor="phone" required>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+263 7XX XXX XXX"
        />
      </Field>
      <Field label="Email (optional)" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Device" htmlFor="device" required>
        <Input
          id="device"
          name="device"
          required
          placeholder="e.g. HP ProBook 450"
        />
      </Field>
      <Field label="Service Type" htmlFor="serviceType" required>
        <Select id="serviceType" name="serviceType" required defaultValue="">
          <option value="" disabled>
            Select a service…
          </option>
          {serviceTypes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Preferred Date" htmlFor="preferredDate">
        <Input id="preferredDate" name="preferredDate" type="date" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Describe the Issue" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            placeholder="Tell us what's wrong with your device…"
          />
        </Field>
      </div>
      {error && (
        <p className="sm:col-span-2 text-[12.5px] text-destructive">{error}</p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Submit Booking
        </Button>
      </div>
    </form>
  );
}
