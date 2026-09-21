/** LapTech (Pvt) Ltd — business constants. */

export const SITE = {
  name: "LapTech",
  legalName: "LapTech (Pvt) Ltd",
  tagline: "Consult | Repair | Service | Sales | Buying | Accessories",
  description:
    "Professional laptop solutions in Harare, Zimbabwe — repairs, sales, software, upgrades and IT consulting.",
  email: "info@laptech.co.zw",
  phones: ["+263 773 909 307", "+263 71 782 1904", "+263 782 800 961"],
  whatsapp: "263773909307",
  address: {
    line1: "Shop C3, 2nd Floor, Cyrus (Ojayz) Building",
    line2: "Corner Mbuya Nehanda & Speke Avenue",
    city: "Harare, Zimbabwe",
  },
  hours: "Mon–Sun: 8am–6pm",
  deliveryRadiusKm: 40,
} as const;

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
