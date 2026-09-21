"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { whatsappLink } from "@/lib/site";
import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const phone = form.get("phone") as string;
    const msg = form.get("message") as string;
    setMessage(
      `Hi LapTech! I'm ${name} (${phone}). ${msg}`
    );
    setDone(true);
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="size-12 text-success mx-auto mb-4" aria-hidden />
        <h3 className="text-lg font-semibold">Ready to Send!</h3>
        <p className="text-[13px] text-muted-foreground mt-2 max-w-sm mx-auto">
          Tap below to send your message via WhatsApp — the fastest way to reach
          us.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-5">
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-emerald-600 text-white font-medium text-[13px] hover:bg-emerald-700 transition-colors"
          >
            Send via WhatsApp
          </a>
          <Button variant="secondary" onClick={() => setDone(false)}>
            Write Another
          </Button>
        </div>
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
      <div className="sm:col-span-2">
        <Field label="Email (optional)" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Message" htmlFor="message" required>
          <Textarea
            id="message"
            name="message"
            required
            placeholder="How can we help you?"
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" className="w-full">
          Continue
        </Button>
      </div>
    </form>
  );
}
