import { ButtonLink } from "@/components/ui/button";
import { HeroSlider } from "@/components/storefront/hero-slider";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { db } from "@/lib/db";
import { SITE, whatsappLink } from "@/lib/site";
import {
  ArrowRight,
  Database,
  KeyRound,
  Laptop,
  Microchip,
  Monitor,
  Palette,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";

const services = [
  { icon: Wrench, title: "Laptop Repairs", desc: "Hardware & software troubleshooting, component replacement, and optimization for all brands." },
  { icon: Palette, title: "Customization", desc: "Vinyl wrapping, hardware upgrades and personalized modifications to match your style." },
  { icon: ShoppingBag, title: "Sales & Accessories", desc: "New and refurbished laptops, phones, speakers, chargers and gadgets at great prices." },
  { icon: KeyRound, title: "Software Solutions", desc: "Microsoft activation, Adobe Suite, Corel Draw, Autodesk and other professional licenses." },
  { icon: Microchip, title: "Hardware Upgrades", desc: "RAM upgrades, SSD installs, battery replacements and display enhancements." },
  { icon: Database, title: "Data Recovery", desc: "Professional recovery for crashed drives, corrupted files and accidental deletions." },
  { icon: Monitor, title: "Screen Replacements", desc: "Genuine displays for all major brands — fitted same day in most cases." },
  { icon: Truck, title: "Delivery & Pickup", desc: "Harare delivery within 40km, plus countrywide courier via FedEx." },
];

const features = [
  { icon: Wrench, title: "Expert Repairs", desc: "Certified technicians fix any laptop issue with precision and care." },
  { icon: ShieldCheck, title: "Warranty & Support", desc: "All repairs and products come with warranty and ongoing support." },
  { icon: Zap, title: "Fast Service", desc: "Most repairs completed within 24–48 hours." },
  { icon: Truck, title: "Harare Delivery", desc: `Fast delivery within ${SITE.deliveryRadiusKm}km of the city centre.` },
];

const testimonials = [
  {
    text: "My laptop had serious overheating issues that other shops couldn't fix. LapTech diagnosed and repaired it in just 2 days. Excellent service!",
    name: "Tinashe Kota",
    role: "Administrator",
    rating: 5,
  },
  {
    text: "I needed Adobe software installed properly. LapTech provided genuine licenses and setup in under an hour. Highly recommended!",
    name: "Paula Daison",
    role: "Fashion Designer",
    rating: 4.5,
  },
  {
    text: "My business depends on our computers. When our server crashed, LapTech had us back online the same day. Their professional service saved our business.",
    name: "Tanaka Ziso",
    role: "Civil Engineer",
    rating: 5,
  },
];

export default async function HomePage() {
  const [slides, categories] = await Promise.all([
    db.heroSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    db.category.findMany({ take: 6, orderBy: { name: "asc" } }),
  ]);

  // 4 category-based product sections (skip empty categories at render)
  const productSections = await Promise.all(
    categories.slice(0, 4).map(async (c) => ({
      title: c.name,
      slug: c.slug,
      products: await db.product.findMany({
        where: { categoryId: c.id },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    }))
  );

  return (
    <>
      {/* ===== HERO SLIDER ===== */}
      <HeroSlider slides={slides} />

      {/* ===== PRODUCT SECTIONS BY CATEGORY (right under hero) ===== */}
      {productSections.map((sec, i) =>
        sec.products.length === 0 ? null : (
          <div key={sec.slug} className={i % 2 === 0 ? "bg-muted-soft" : ""}>
            <ProductCarousel
              title={sec.title}
              seeAllHref={`/shop?category=${sec.slug}`}
              products={sec.products}
            />
          </div>
        )
      )}

      {/* ===== FEATURES STRIP ===== */}
      <section className="max-w-content mx-auto px-4 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card rounded-xl border shadow-xs p-4 flex items-start gap-3"
            >
              <div className="size-9 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center shrink-0">
                <f.icon className="size-4.5 text-brand-600 dark:text-brand-300" aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold">{f.title}</h3>
                <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CORE SERVICES ===== */}
      <section className="max-w-content mx-auto px-4 pb-14">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Our Core Services
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1 max-w-lg mx-auto">
            Comprehensive solutions tailored to your laptop needs with quality
            and precision.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="bg-card rounded-xl border p-5 hover:border-brand-300 transition-colors h-full"
            >
              <div className="size-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center mb-3">
                <s.icon className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
              </div>
              <h3 className="text-[14px] font-semibold">{s.title}</h3>
              <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <ButtonLink href="/services" variant="secondary">
            View All Services
          </ButtonLink>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="max-w-content mx-auto px-4 pb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Shop by Category
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1">
              Laptops, accessories, software and more
            </p>
          </div>
          <Link
            href="/shop"
            className="text-[13px] font-medium text-brand-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="bg-card rounded-xl border p-4 text-center hover:border-brand-300 hover:shadow-xs transition-all group"
            >
              <div className="size-10 rounded-lg bg-brand-50 dark:bg-brand-950 mx-auto flex items-center justify-center mb-2.5 group-hover:bg-brand-100 transition-colors">
                <Laptop className="size-5 text-brand-600" aria-hidden />
              </div>
              <span className="text-[13px] font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-muted-soft py-14">
        <div className="max-w-content mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              What Our Clients Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card rounded-xl border p-5">
                <div className="flex gap-0.5 text-amber-400 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < Math.round(t.rating) ? "fill-current" : "text-muted"}`}
                      aria-hidden
                    />
                  ))}
                </div>
                <p className="text-[13.5px] leading-relaxed italic text-card-foreground">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-[13.5px] font-semibold">{t.name}</p>
                  <p className="text-[12px] text-brand-600">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-brand-700 text-white">
        <div className="max-w-content mx-auto px-4 py-14 text-center">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Need Help With Your Laptop?
          </h2>
          <p className="text-brand-100 text-[14px] max-w-lg mx-auto mt-3">
            Chat with us on WhatsApp for a free diagnostic and quote, or visit
            our shop in Harare CBD.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">
            <a
              href={whatsappLink("Hi LapTech! I need help with my laptop.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-white text-brand-700 font-semibold text-sm hover:bg-brand-50 transition-colors w-full sm:w-auto justify-center"
            >
              <WhatsAppIcon className="size-4" />
              WhatsApp Us
            </a>
            <ButtonLink
              href="/contact"
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 w-full sm:w-auto"
            >
              Contact Us
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
