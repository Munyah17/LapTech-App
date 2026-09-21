# LapTech Shop

Online shop for **LapTech (Pvt) Ltd** — laptops, software and IT services in Harare, Zimbabwe.

Built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS + Prisma (SQLite)**. Mobile-first — designed for the ~80% of clients who shop on phones.

## Features

### Storefront
- Home, Shop (search / category / sort), Product detail, Services, About, Contact
- Cart (persistent, localStorage) + Checkout
- **Delivery across Harare (40km radius)** — zone-based fees, or free in-store pickup
- WhatsApp deep-links for quick inquiries
- Mobile bottom tab bar + drawer nav

### Accounts & Roles
- **Clients** — register/login, track orders & service bookings
- **Admins** — full back-office console at `/admin`

### Admin Console (`/admin`)
- Dashboard — revenue, orders, bookings, customers, low-stock alerts
- Orders — search, filter, status pipeline (Pending → Delivered)
- Bookings — repair/service request management
- Customers — registered + guest order history
- Products — full CRUD with images, badges, stock, featured flags
- Delivery Zones — edit fees, suburbs, enable/disable zones
- Settings — business info + admin password change

## Getting Started

```bash
npm install          # install dependencies (also runs prisma generate)
npm run db:setup     # create SQLite DB, push schema, seed data
npm run dev          # start dev server → http://localhost:3000
```

### Default admin login
```
Email:    admin@laptech.co.zw
Password: admin123
```
**Change this immediately** via `/admin/settings`.

## Delivery Fees

Zone-based, editable in `/admin/delivery`. Seeded rates (benchmarked to current Harare courier costs):

| Zone | Distance | Fee |
|------|----------|-----|
| A — City Centre | 0–5 km | $3 |
| B — Inner Suburbs | 5–10 km | $5 |
| C — Outer Suburbs | 10–15 km | $7 |
| D — Extended | 15–25 km | $10 |
| E — Far Reach | 25–40 km | $15 |

## Project Structure

```
src/
  app/
    (store)/          # public storefront (header/footer/tab-bar layout)
    admin/            # back-office console (sidebar layout)
    api/              # REST routes — auth, orders, bookings, admin CRUD
  components/
    ui/               # primitives — Button, Card, Badge, Input, Table, MetricTile…
    storefront/       # header, footer, tab bar, product card
  lib/                # db, auth, delivery, cart store, site config, utils
prisma/
  schema.prisma       # data model
  seed.ts             # categories, products, zones, admin user
```

## Configuration

- Business details (name, phones, address, hours): `src/lib/site.ts`
- Brand colors / design tokens: `src/app/globals.css` + `tailwind.config.ts`
- Session secret: `AUTH_SECRET` in `.env` — **set a strong value in production**
- Database: `DATABASE_URL` in `.env` (SQLite by default; swap for Postgres/MySQL in production)

## Roadmap

- [ ] Payment gateway (EcoCash / Paynow / Stripe)
- [ ] Email/SMS order notifications
- [ ] Product image uploads (currently URL-based)
- [ ] Order status notifications to clients
- [ ] Mobile apps — codebase is structured for reuse with Expo/React Native
