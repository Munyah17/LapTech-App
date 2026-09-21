import { Card } from "@/components/ui/card";
import { SITE } from "@/lib/site";
import { Award, Clock, Heart, Phone, ShieldCheck, Target, Users, Wrench, Zap } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${SITE.legalName} — professional laptop solutions in Harare, Zimbabwe.`,
};

const values = [
  { icon: Award, title: "Quality First", desc: "Genuine parts and professional workmanship on every job." },
  { icon: Heart, title: "Customer Care", desc: "We treat every device like our own and every client like family." },
  { icon: Zap, title: "Fast Turnaround", desc: "Most repairs completed within 24–48 hours." },
  { icon: ShieldCheck, title: "Trust & Warranty", desc: "All work backed by warranty and honest advice." },
];

const stats = [
  { value: "5+", label: "Years in Business" },
  { value: "2,000+", label: "Devices Repaired" },
  { value: "1,500+", label: "Happy Clients" },
  { value: "24–48h", label: "Avg. Turnaround" },
];

const team = [
  {
    name: "Munyah Griezmann",
    role: "Social Media and Software Specialist",
    phone: "+263 773 909 307",
    image: "/munyah.png",
    bio: "Munyah holds a Google Certificate in Data Analytics. He is our software expert, specializing in OS installations, software licensing, web development, digital marketing, programming and custom software solutions.",
  },
  {
    name: "Munashe Sandu",
    role: "Hardware & Software Engineer",
    phone: "+263 71 782 1904",
    image: "/Sandu.png",
    bio: "Munashe holds an upper second class Bachelor of Science in Information Technology (Bsc IT) and has acquired extensive experience in laptop diagnosis, components, level repairs, refurbishments, restores, upgrades, and performance optimization for all major brands.",
  },
  {
    name: "Oscar Marongwe",
    role: "Hardware and Software Specialist",
    phone: "+263 782 800 961",
    image: "/Oscar.png",
    bio: "With over half a decade experience, Oscar specialises with hardware and software problems with an exclusive expertise in Laptop LCDs, covers, refurbishment, motherboard repairs and several other laptop related issues.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          About {SITE.name}
        </h1>
        <p className="text-[14px] text-muted-foreground mt-2 max-w-xl mx-auto">
          {SITE.tagline}
        </p>
      </div>

      {/* Story */}
      <div className="grid lg:grid-cols-2 gap-8 items-center mb-14">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4">Our Story</h2>
          <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed">
            <p>
              {SITE.legalName} is a professional laptop solutions company based
              in the heart of Harare, Zimbabwe. From our shop at the Cyrus
              (Ojayz) Building on Corner Mbuya Nehanda &amp; Speke Avenue, we
              serve individuals, students, professionals and businesses across
              the city.
            </p>
            <p>
              What started as a small repair desk has grown into a full-service
              tech partner — offering expert repairs, genuine software
              licensing, hardware upgrades, custom modifications, and a curated
              shop of laptops and accessories.
            </p>
            <p>
              Our certified technicians combine deep technical expertise with a
              commitment to honest, transparent service. Whether your laptop
              needs a new screen, a speed boost, or a complete makeover — we
              bring your tech back to life.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <Card key={s.label} className="p-5 text-center">
              <p className="text-2xl font-bold text-brand-600 tnum">{s.value}</p>
              <p className="text-[12px] text-muted-foreground mt-1">{s.label}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Values */}
      <section className="mb-14">
        <h2 className="text-xl font-bold tracking-tight text-center mb-8">
          What We Stand For
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((v) => (
            <Card key={v.title} className="p-5 text-center">
              <div className="size-11 rounded-lg bg-brand-100 dark:bg-brand-900 mx-auto flex items-center justify-center mb-3">
                <v.icon className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
              </div>
              <h3 className="text-[14px] font-semibold">{v.title}</h3>
              <p className="text-[12.5px] text-muted-foreground mt-1.5">
                {v.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Mission / Vision */}
      <div className="grid sm:grid-cols-2 gap-4 mb-14">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
              <Target className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
            </div>
            <h3 className="text-[16px] font-semibold">Our Mission</h3>
          </div>
          <p className="text-[13.5px] text-muted-foreground leading-relaxed">
            To provide accessible, reliable and affordable laptop solutions that
            keep Zimbabwe&apos;s students, professionals and businesses
            connected and productive.
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
              <Users className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
            </div>
            <h3 className="text-[16px] font-semibold">Our Vision</h3>
          </div>
          <p className="text-[13.5px] text-muted-foreground leading-relaxed">
            To be Zimbabwe&apos;s most trusted technology partner — known for
            expertise, integrity and exceptional customer experience.
          </p>
        </Card>
      </div>

      {/* Our Team */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold tracking-tight">Our Team</h2>
          <p className="text-[13.5px] text-muted-foreground mt-2 max-w-xl mx-auto">
            Meet our team of certified technicians, each with specialized
            expertise to handle all your laptop needs with precision and care.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((m) => (
            <Card key={m.name} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  className="object-cover object-top"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div className="p-5">
                <h3 className="text-[15px] font-semibold">{m.name}</h3>
                <p className="text-[12px] font-medium text-brand-600 mt-0.5">
                  {m.role}
                </p>
                <a
                  href={`tel:${m.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-brand-600 mt-1.5 transition-colors"
                >
                  <Phone className="size-3.5" aria-hidden />
                  {m.phone}
                </a>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-3">
                  {m.bio}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Visit us */}
      <Card className="p-6 sm:p-8 text-center bg-brand-50 dark:bg-brand-950 border-brand-200 dark:border-brand-800">
        <Clock className="size-8 text-brand-600 mx-auto mb-3" aria-hidden />
        <h2 className="text-lg font-bold">Visit Our Shop</h2>
        <p className="text-[13.5px] text-muted-foreground mt-2 max-w-md mx-auto">
          {SITE.address.line1}, {SITE.address.line2}, {SITE.address.city}
          <br />
          {SITE.hours}
        </p>
        <p className="text-[13.5px] mt-3">
          <a href={`tel:${SITE.phones[0].replace(/\s/g, "")}`} className="text-brand-600 font-medium hover:underline">
            {SITE.phones[0]}
          </a>
          {" · "}
          <a href={`mailto:${SITE.email}`} className="text-brand-600 font-medium hover:underline">
            {SITE.email}
          </a>
        </p>
      </Card>
    </div>
  );
}
