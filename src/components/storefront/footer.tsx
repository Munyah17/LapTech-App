import { SITE, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 mt-16">
      <div className="max-w-content mx-auto px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src="/logo.png"
            alt="LapTech"
            width={130}
            height={44}
            className="h-10 w-auto mb-4 brightness-0 invert"
          />
          <p className="text-[13px] text-white leading-relaxed">
            Your trusted partner for all laptop solutions in Zimbabwe. Repairs,
            sales, customization and software services with a commitment to
            quality.
          </p>
          <a
            href={whatsappLink("Hi LapTech! I have a question.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-[13px] font-medium text-emerald-400 hover:text-emerald-300"
          >
            <WhatsAppIcon className="size-4" />
            Chat on WhatsApp
          </a>
        </div>

        <div>
          <h3 className="text-white text-[15px] font-semibold mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2.5 text-[13px]">
            {[
              ["Home", "/"],
              ["Shop", "/shop"],
              ["Services", "/services"],
              ["Book a Repair", "/services#book"],
              ["About Us", "/about"],
              ["Contact", "/contact"],
              ["My Account", "/account"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white text-[15px] font-semibold mb-4">Shop</h3>
          <ul className="space-y-2.5 text-[13px]">
            {[
              ["Laptops", "/shop?category=laptops"],
              ["Accessories", "/shop?category=accessories"],
              ["Software", "/shop?category=software"],
              ["Gadgets", "/shop?category=gadgets"],
              ["Components", "/shop?category=components"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white text-[15px] font-semibold mb-4">
            Contact Us
          </h3>
          <ul className="space-y-3 text-[13px] text-white">
            <li className="flex gap-2.5">
              <MapPin className="size-4 text-brand-400 shrink-0 mt-0.5" aria-hidden />
              <span>
                {SITE.address.line1}
                <br />
                {SITE.address.line2}
                <br />
                {SITE.address.city}
              </span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="size-4 text-brand-400 shrink-0 mt-0.5" aria-hidden />
              <span>
                {SITE.phones.map((p) => (
                  <span key={p} className="block">{p}</span>
                ))}
              </span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="size-4 text-brand-400 shrink-0 mt-0.5" aria-hidden />
              <a href={`mailto:${SITE.email}`} className="hover:text-white">
                {SITE.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="size-4 text-brand-400 shrink-0 mt-0.5" aria-hidden />
              <span>{SITE.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-content mx-auto px-4 py-5 text-center text-[12px] text-slate-500">
          &copy; {new Date().getFullYear()} {SITE.legalName}. All rights
          reserved.{" "}
          <a
            href="https://globalspaceweb.co.zw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 font-medium hover:text-brand-300 transition-colors"
          >
            Developed &amp; Powered By Global Space Web
          </a>
        </div>
      </div>
    </footer>
  );
}
