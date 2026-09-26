// One-off: create the PageView table via the app's runtime client (DATABASE_URL).
// Used because `prisma db push` needs directUrl (5432) which is unreachable.
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PageView" (
      "id"        TEXT NOT NULL,
      "path"      TEXT NOT NULL,
      "sessionId" TEXT,
      "userId"    TEXT,
      "referrer"  TEXT,
      "userAgent" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
    );
  `);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PageView_sessionId_idx" ON "PageView"("sessionId");`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PageView_userId_idx" ON "PageView"("userId");`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PageView_path_idx" ON "PageView"("path");`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PageView_createdAt_idx" ON "PageView"("createdAt");`);
  const n = await db.pageView.count();
  console.log("PageView table ready. Row count:", n);
}

main()
  .catch((e) => { console.error("ERR:", e.message); process.exit(1); })
  .finally(() => db.$disconnect());
