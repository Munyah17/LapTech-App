import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Image from "next/image";
import { BookingForm } from "./booking-form";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Laptop repairs, customization, software licensing and IT services in Harare.",
};

const steps = [
  { n: 1, title: "Diagnosis", desc: "Comprehensive diagnostic to identify all issues." },
  { n: 2, title: "Quotation", desc: "Transparent pricing before any work begins." },
  { n: 3, title: "Repair", desc: "Certified technicians using genuine parts." },
  { n: 4, title: "Testing", desc: "Thorough testing to ensure everything works." },
  { n: 5, title: "Delivery", desc: "Returned with warranty and ongoing support." },
];

export default async function ServicesPage() {
  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  // Group by category, preserving order
  const categories = services.reduce<
    { name: string; services: typeof services }[]
  >((acc, s) => {
    const cat = acc.find((c) => c.name === s.category);
    if (cat) cat.services.push(s);
    else acc.push({ name: s.category, services: [s] });
    return acc;
  }, []);

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Our Services
        </h1>
        <p className="text-[14px] text-muted-foreground mt-2 max-w-xl mx-auto">
          Comprehensive laptop solutions tailored to your needs — from repairs
          to software, we&apos;ve got you covered.
        </p>
      </div>

      {categories.map((cat) => (
        <section key={cat.name} className="mb-12">
          <h2 className="text-lg font-bold text-brand-600 mb-5 text-center">
            {cat.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cat.services.map((s) => (
              <Card key={s.id} className="overflow-hidden p-0 flex flex-col">
                <div className="relative aspect-[16/10] bg-muted">
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                      {s.title}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-[14px] font-semibold">{s.title}</h3>
                  <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {/* Process */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-center mb-8">
          Our Service Process
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {steps.map((s) => (
            <div key={s.n} className="text-center w-36">
              <div className="size-14 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-3 tnum">
                {s.n}
              </div>
              <h3 className="text-[13.5px] font-semibold">{s.title}</h3>
              <p className="text-[12px] text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking form */}
      <section id="book" className="scroll-mt-24">
        <Card className="max-w-2xl mx-auto p-6 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight text-center">
            Book a Repair or Service
          </h2>
          <p className="text-[13px] text-muted-foreground text-center mt-1.5 mb-6">
            Tell us about your device and we&apos;ll get back to you with a free
            diagnostic and quote.
          </p>
          <BookingForm />
        </Card>
      </section>
    </div>
  );
}
