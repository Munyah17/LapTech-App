import { Card } from "@/components/ui/card";
import { SITE, whatsappLink } from "@/lib/site";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${SITE.name} — laptop repairs, sales and IT services in Harare.`,
};

export default function ContactPage() {
  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Contact Us
        </h1>
        <p className="text-[14px] text-muted-foreground mt-2 max-w-lg mx-auto">
          Questions, quotes or bookings — we&apos;re here to help. Reach out and
          we&apos;ll respond quickly.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Contact info */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center shrink-0">
                <MapPin className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold">Visit Us</h3>
                <p className="text-[13px] text-muted-foreground mt-1">
                  {SITE.address.line1}
                  <br />
                  {SITE.address.line2}
                  <br />
                  {SITE.address.city}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center shrink-0">
                <Phone className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold">Call Us</h3>
                <div className="text-[13px] text-muted-foreground mt-1 space-y-0.5">
                  {SITE.phones.map((p) => (
                    <a
                      key={p}
                      href={`tel:${p.replace(/\s/g, "")}`}
                      className="block hover:text-brand-600"
                    >
                      {p}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center shrink-0">
                <Mail className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold">Email Us</h3>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-[13px] text-muted-foreground hover:text-brand-600 mt-1 block"
                >
                  {SITE.email}
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center shrink-0">
                <Clock className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold">Opening Hours</h3>
                <p className="text-[13px] text-muted-foreground mt-1">
                  {SITE.hours}
                </p>
              </div>
            </div>
          </Card>

          <a
            href={whatsappLink("Hi LapTech! I have a question.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-11 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle className="size-4" aria-hidden />
            Chat on WhatsApp
          </a>
        </div>

        {/* Form */}
        <Card className="lg:col-span-3 p-6 sm:p-8">
          <h2 className="text-lg font-bold tracking-tight mb-1">
            Send Us a Message
          </h2>
          <p className="text-[13px] text-muted-foreground mb-6">
            Fill in the form and we&apos;ll get back to you as soon as possible.
          </p>
          <ContactForm />
        </Card>
      </div>
    </div>
  );
}
