import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

async function main() {
  console.log("Seeding LapTech database…");

  // ---- Admin users ----
  const admins = [
    {
      name: "Munyah Griezmann",
      email: "munyah777@gmail.com",
      phone: "+263773909307",
      password: "griezmann17",
    },
    {
      name: "Oscar Marongwe",
      email: "oscarmarongwe16@gmail.com",
      phone: "+263782800961",
      password: "laptech123#",
    },
    {
      name: "Munashe Sandu",
      email: "munashesandu7@gmail.com",
      phone: "+263778647174",
      password: "laptech123#",
    },
    {
      name: "LapTech Admin",
      email: "admin@laptech.co.zw",
      phone: "+263773909307",
      password: "admin123",
    },
  ];
  for (const a of admins) {
    await db.user.upsert({
      where: { email: a.email },
      update: {},
      create: {
        name: a.name,
        email: a.email,
        phone: a.phone,
        passwordHash: await bcrypt.hash(a.password, 10),
        role: "ADMIN",
      },
    });
  }

  // ---- Categories ----
  const categories = [
    { name: "Laptops", slug: "laptops" },
    { name: "Accessories", slug: "accessories" },
    { name: "Software", slug: "software" },
    { name: "Gadgets", slug: "gadgets" },
    { name: "Components", slug: "components" },
    { name: "Networking", slug: "networking" },
  ];
  for (const c of categories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  const cat = Object.fromEntries(
    (await db.category.findMany()).map((c) => [c.slug, c.id])
  );

  // ---- Products ----
  const products = [
    {
      name: "Dell XPS 13",
      slug: "dell-xps-13",
      description:
        "13-inch laptop with Intel i7, 16GB RAM, 512GB SSD. Perfect for professionals.",
      price: 1299.99,
      stock: 5,
      image: img("photo-1496181133206-80ce9b88a853"),
      badge: "Best Seller",
      featured: true,
      rating: 4.5,
      categoryId: cat["laptops"],
      specs: JSON.stringify({
        CPU: "Intel Core i7",
        RAM: "16GB",
        Storage: "512GB SSD",
        Display: '13.4" FHD+',
        Warranty: "1 year",
      }),
    },
    {
      name: 'Apple MacBook Pro 14"',
      slug: "apple-macbook-pro-14",
      description:
        "M2 Pro chip, 16GB RAM, 512GB SSD. For creative professionals.",
      price: 1999.99,
      stock: 3,
      image: img("photo-1517336714731-489689fd1ca8"),
      badge: "New",
      featured: true,
      rating: 5,
      categoryId: cat["laptops"],
      specs: JSON.stringify({
        Chip: "Apple M2 Pro",
        RAM: "16GB",
        Storage: "512GB SSD",
        Display: '14.2" Liquid Retina XDR',
        Warranty: "1 year",
      }),
    },
    {
      name: "HP Spectre x360",
      slug: "hp-spectre-x360",
      description:
        "Convertible laptop with touchscreen, Intel i7, 16GB RAM, 1TB SSD.",
      price: 1499.99,
      stock: 4,
      image: img("photo-1603302576837-37561b2e2302"),
      badge: "Top Rated",
      featured: true,
      rating: 4.5,
      categoryId: cat["laptops"],
      specs: JSON.stringify({
        CPU: "Intel Core i7",
        RAM: "16GB",
        Storage: "1TB SSD",
        Display: '13.5" OLED Touch',
        Warranty: "1 year",
      }),
    },
    {
      name: "Lenovo ThinkPad T14",
      slug: "lenovo-thinkpad-t14",
      description:
        "Business-grade durability with Ryzen 7, 16GB RAM, 512GB SSD.",
      price: 1099.99,
      stock: 6,
      image: img("photo-1588872657578-7efd1f1555ed"),
      featured: true,
      rating: 4.5,
      categoryId: cat["laptops"],
      specs: JSON.stringify({
        CPU: "AMD Ryzen 7",
        RAM: "16GB",
        Storage: "512GB SSD",
        Display: '14" FHD',
        Warranty: "1 year",
      }),
    },
    {
      name: "Wireless Noise-Cancelling Headphones",
      slug: "wireless-noise-cancelling-headphones",
      description:
        "Premium sound quality with active noise cancellation and 30-hour battery.",
      price: 249.99,
      stock: 12,
      image: img("photo-1583394838336-acd977736f90"),
      badge: "Popular",
      featured: true,
      rating: 5,
      categoryId: cat["accessories"],
    },
    {
      name: "Laptop Backpack Pro",
      slug: "laptop-backpack-pro",
      description:
        "Water-resistant backpack with padded 15.6\" laptop compartment and USB port.",
      price: 59.99,
      stock: 20,
      image: img("photo-1553062407-98eeb64c6a62"),
      rating: 4.5,
      categoryId: cat["accessories"],
    },
    {
      name: "USB-C Docking Station",
      slug: "usb-c-docking-station",
      description:
        "11-in-1 hub: HDMI, Ethernet, USB-A/C, SD card, 100W PD charging.",
      price: 89.99,
      stock: 15,
      image: img("photo-1625723044792-44de16ccb4e9"),
      rating: 4.5,
      categoryId: cat["accessories"],
    },
    {
      name: "Adobe Creative Cloud (1 Year)",
      slug: "adobe-creative-cloud-1-year",
      description:
        "One-year subscription to all Adobe creative applications for professionals.",
      price: 299.99,
      stock: 50,
      image: img("photo-1556656793-08538906a9f8"),
      badge: "Software",
      featured: true,
      rating: 4.5,
      categoryId: cat["software"],
    },
    {
      name: "Microsoft Office 2021 Pro Plus",
      slug: "microsoft-office-2021-pro-plus",
      description:
        "Lifetime license — Word, Excel, PowerPoint, Outlook and more. Includes activation.",
      price: 79.99,
      stock: 50,
      image: img("photo-1516321318423-f06f85e504b3"),
      rating: 5,
      categoryId: cat["software"],
    },
    {
      name: "Windows 11 Pro License",
      slug: "windows-11-pro-license",
      description:
        "Genuine Windows 11 Pro activation with installation assistance included.",
      price: 49.99,
      stock: 50,
      image: img("photo-1629654297299-c8506221ca97"),
      rating: 5,
      categoryId: cat["software"],
    },
    {
      name: "Smart Watch Series 8",
      slug: "smart-watch-series-8",
      description:
        "Fitness tracking, heart rate monitoring, notifications, and more.",
      price: 399.99,
      compareAtPrice: 449.99,
      stock: 8,
      image: img("photo-1546868871-7041f2a55e12"),
      badge: "Sale",
      featured: true,
      rating: 5,
      categoryId: cat["gadgets"],
    },
    {
      name: "Bluetooth Speaker",
      slug: "bluetooth-speaker",
      description:
        "Portable speaker with deep bass, 24-hour battery and IPX7 waterproofing.",
      price: 79.99,
      stock: 18,
      image: img("photo-1608043152269-423dbba4e7e1"),
      rating: 4.5,
      categoryId: cat["gadgets"],
    },
    {
      name: "1TB NVMe SSD",
      slug: "1tb-nvme-ssd",
      description:
        "High-speed NVMe SSD upgrade — up to 3,500MB/s read. Installation available.",
      price: 99.99,
      stock: 25,
      image: img("photo-1591799264318-7e6ef8ddb7ea"),
      rating: 5,
      categoryId: cat["components"],
    },
    {
      name: "16GB DDR4 Laptop RAM",
      slug: "16gb-ddr4-laptop-ram",
      description:
        "DDR4-3200 SODIMM module. Free installation with any service.",
      price: 54.99,
      stock: 30,
      image: img("photo-1562976540-1502c2145186"),
      rating: 5,
      categoryId: cat["components"],
    },
    {
      name: "Wi-Fi 6 Router",
      slug: "wi-fi-6-router",
      description:
        "Dual-band AX1800 router for fast, reliable home and office internet.",
      price: 119.99,
      stock: 10,
      image: img("photo-1606904825846-647eb07f5be2"),
      rating: 4.5,
      categoryId: cat["networking"],
    },
  ];

  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  // ---- Delivery zones (Harare, 40km radius from CBD) ----
  // Fees benchmarked to current local courier/ride-hailing rates.
  const zones = [
    {
      name: "Zone A — City Centre",
      minKm: 0,
      maxKm: 5,
      fee: 3,
      suburbs:
        "CBD, Avenues, Eastlea, Milton Park, Avondale, Belvedere, Kopje, Belgravia, Alexandra Park",
    },
    {
      name: "Zone B — Inner Suburbs",
      minKm: 5,
      maxKm: 10,
      fee: 5,
      suburbs:
        "Highlands, Greendale, Msasa, Hatfield, Waterfalls, Mabelreign, Marlborough, Mbare, Highfield, Southerton, Workington",
    },
    {
      name: "Zone C — Outer Suburbs",
      minKm: 10,
      maxKm: 15,
      fee: 7,
      suburbs:
        "Borrowdale, Mount Pleasant, Chisipite, Glen Lorne, Mufakose, Kambuzuma, Warren Park, Budiriro, Glen View, Dzivarasekwa, Tafara, Mabvuku",
    },
    {
      name: "Zone D — Extended",
      minKm: 15,
      maxKm: 25,
      fee: 10,
      suburbs:
        "Borrowdale Brooke, Hogerty Hill, Glen Forest, Epworth, Ruwa, Zimre Park, Mandara, Greystone Park",
    },
    {
      name: "Zone E — Far Reach",
      minKm: 25,
      maxKm: 40,
      fee: 15,
      suburbs:
        "Chitungwiza, Norton, Seke, Dema, Beatrice, Goromonzi",
    },
  ];
  for (const z of zones) {
    const existing = await db.deliveryZone.findFirst({
      where: { name: z.name },
    });
    if (!existing) await db.deliveryZone.create({ data: z });
  }

  // ---- Hero slides ----
  const slides = [
    {
      title: "Premium Laptops, Delivered Across Harare",
      subtitle:
        "Top brands at unbeatable prices — Dell, HP, Lenovo, Apple and more.",
      image: img("photo-1496181133206-80ce9b88a853"),
      ctaLabel: "Shop Laptops",
      ctaHref: "/shop?category=laptops",
      cta2Label: "Book a Repair",
      cta2Href: "/services#book",
      order: 0,
    },
    {
      title: "Expert Repairs in 24–48 Hours",
      subtitle:
        "Certified technicians fix any laptop issue — screens, boards, batteries and more.",
      image: img("photo-1591799264318-7e6ef8ddb7ea"),
      ctaLabel: "Our Services",
      ctaHref: "/services",
      cta2Label: "Contact Us",
      cta2Href: "/contact",
      order: 1,
    },
    {
      title: "Software & Accessories",
      subtitle:
        "Genuine licenses, upgrades and peripherals — everything your laptop needs.",
      image: img("photo-1553062407-98eeb64c6a62"),
      ctaLabel: "Browse Shop",
      ctaHref: "/shop",
      order: 2,
    },
  ];
  for (const s of slides) {
    const existing = await db.heroSlide.findFirst({ where: { title: s.title } });
    if (!existing) await db.heroSlide.create({ data: s });
  }

  // ---- Services ----
  const services = [
    // Repair & Maintenance
    { title: "Hardware Repairs", description: "Screen replacement, keyboard repair, charging ports, motherboard repairs for all brands.", category: "Laptop Repair & Maintenance", image: img("photo-1591799264318-7e6ef8ddb7ea"), order: 0 },
    { title: "Software Troubleshooting", description: "Virus removal, OS install, driver issues, boot problems and optimization.", category: "Laptop Repair & Maintenance", image: img("photo-1516321318423-f06f85e504b3"), order: 1 },
    { title: "Overheating Solutions", description: "Thermal paste, fan cleaning/replacement and heat sink repair.", category: "Laptop Repair & Maintenance", image: img("photo-1603302576837-37561b2e2302"), order: 2 },
    { title: "Performance Upgrades", description: "RAM upgrades, SSD installation and system optimization.", category: "Laptop Repair & Maintenance", image: img("photo-1562976540-1502c2145186"), order: 3 },
    { title: "Battery Replacement", description: "Diagnostics and replacement with quality compatible batteries.", category: "Laptop Repair & Maintenance", image: img("photo-1588872657578-7efd1f1555ed"), order: 4 },
    { title: "Data Recovery", description: "Recover lost files from damaged drives with advanced tools.", category: "Laptop Repair & Maintenance", image: img("photo-1625723044792-44de16ccb4e9"), order: 5 },
    // Customization
    { title: "Vinyl Wrapping", description: "Custom wraps in various colors, patterns and finishes.", category: "Customization & Aesthetics", image: img("photo-1556656793-08538906a9f8"), order: 6 },
    { title: "Custom Paint Jobs", description: "Professional painting with durable, high-quality finishes.", category: "Customization & Aesthetics", image: img("photo-1608043152269-423dbba4e7e1"), order: 7 },
    { title: "LED Modifications", description: "Custom LED lighting for keyboards and exteriors.", category: "Customization & Aesthetics", image: img("photo-1546868871-7041f2a55e12"), order: 8 },
    { title: "Skin & Decal Application", description: "Precision-cut skins and decals for a clean custom look.", category: "Customization & Aesthetics", image: img("photo-1583394838336-acd977736f90"), order: 9 },
    // Software
    { title: "OS Installation", description: "Windows, macOS and Linux installation with drivers and updates.", category: "Software Solutions", image: img("photo-1629654297299-c8506221ca97"), order: 10 },
    { title: "Software Licensing", description: "Genuine Microsoft Office, Windows and antivirus licenses.", category: "Software Solutions", image: img("photo-1516321318423-f06f85e504b3"), order: 11 },
    { title: "Virus & Malware Removal", description: "Deep cleaning, protection setup and security hardening.", category: "Software Solutions", image: img("photo-1606904825846-647eb07f5be2"), order: 12 },
    { title: "Data Backup & Migration", description: "Secure transfer of files to new devices or cloud storage.", category: "Software Solutions", image: img("photo-1553062407-98eeb64c6a62"), order: 13 },
    // Sales
    { title: "Laptop Sales", description: "New and certified pre-owned laptops from all major brands.", category: "Sales & Accessories", image: img("photo-1496181133206-80ce9b88a853"), order: 14 },
    { title: "Genuine Accessories", description: "Chargers, bags, mice, keyboards and docking stations.", category: "Sales & Accessories", image: img("photo-1625723044792-44de16ccb4e9"), order: 15 },
    { title: "Gaming Setup", description: "Gaming laptops, peripherals and performance tuning.", category: "Sales & Accessories", image: img("photo-1546868871-7041f2a55e12"), order: 16 },
    { title: "Business Solutions", description: "Bulk orders, fleet setup and ongoing IT support for offices.", category: "Sales & Accessories", image: img("photo-1517336714731-489689fd1ca8"), order: 17 },
  ];
  for (const s of services) {
    const existing = await db.service.findFirst({ where: { title: s.title } });
    if (!existing) await db.service.create({ data: s });
  }

  // ---- Drivers / couriers ----
  const drivers = [
    { name: "Tendai M.", phone: "+263771234567", vehicle: "Motorbike", zones: "Zone A, Zone B, Zone C", notes: "InDrive partner — weekdays" },
    { name: "Blessing K.", phone: "+263782345678", vehicle: "Sedan — InDrive", zones: "All zones", notes: "Available weekends" },
  ];
  for (const d of drivers) {
    const existing = await db.driver.findFirst({ where: { phone: d.phone } });
    if (!existing) await db.driver.create({ data: d });
  }

  // ---- Settings ----
  const settings = [
    { key: "store_name", value: "LapTech" },
    { key: "delivery_enabled", value: "true" },
    { key: "pickup_enabled", value: "true" },
    { key: "currency", value: "USD" },
  ];
  for (const s of settings) {
    await db.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log("Seed complete.");
  console.log("Admin logins:");
  console.log("  munyah777@gmail.com / griezmann17");
  console.log("  oscarmarongwe16@gmail.com / laptech123#");
  console.log("  munashesandu7@gmail.com / laptech123#");
  console.log("  admin@laptech.co.zw / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
