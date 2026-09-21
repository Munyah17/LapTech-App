import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync } from "fs";
import path from "path";

// On Vercel the deployment filesystem is read-only. Copy the bundled SQLite
// DB to /tmp (writable) once per cold start so writes work for the instance.
// NOTE: data does not persist across instances — migrate to a hosted DB
// (Turso/Postgres) for production.
if (process.env.VERCEL) {
  const src = path.join(process.cwd(), "prisma", "dev.db");
  const dest = "/tmp/dev.db";
  if (!existsSync(dest) && existsSync(src)) {
    copyFileSync(src, dest);
  }
  process.env.DATABASE_URL = `file:${dest}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
