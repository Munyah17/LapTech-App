import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { db } from "@/lib/db";
import { cn, formatDateTime } from "@/lib/utils";
import {
  Eye,
  FileText,
  Globe,
  MonitorSmartphone,
  Users,
  type LucideIcon,
} from "lucide-react";
import { VisitorsChart, type VisitorPoint } from "../dashboard-charts";

export const metadata = { title: "Visitor Analytics" };

/** SB Admin 2 style stat card (matches dashboard). */
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: "brand" | "emerald" | "cyan" | "amber";
  hint?: string;
}) {
  const accents = {
    brand: "border-l-brand-600 text-brand-600",
    emerald: "border-l-emerald-500 text-emerald-600",
    cyan: "border-l-cyan-500 text-cyan-600",
    amber: "border-l-amber-400 text-amber-500",
  };
  const [border, text] = accents[accent].split(" ");
  return (
    <div
      className={cn(
        "bg-white dark:bg-card rounded-lg shadow-sm border-l-4 p-5 flex items-center justify-between",
        border
      )}
    >
      <div>
        <p className={cn("text-[11px] font-bold uppercase tracking-wider", text)}>
          {label}
        </p>
        <p className="text-xl font-bold text-slate-700 dark:text-foreground tnum mt-1">
          {value}
        </p>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <Icon className="size-8 text-slate-200 dark:text-slate-700" aria-hidden />
    </div>
  );
}

/** Rough device classification from the user-agent string. */
function deviceOf(ua: string | null): string {
  if (!ua) return "Unknown";
  const s = ua.toLowerCase();
  if (/mobile|iphone|android.*mobile|windows phone/.test(s)) return "Mobile";
  if (/ipad|tablet|android(?!.*mobile)/.test(s)) return "Tablet";
  return "Desktop";
}

/** Pull a readable source name out of a referrer URL. */
function sourceOf(ref: string | null): string {
  if (!ref) return "Direct";
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return ref;
  }
}

/** Create the PageView table if it doesn't exist yet (self-healing). */
async function ensurePageViewTable() {
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
}

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  last30: { createdAt: Date; sessionId: string | null; userId: string | null }[];
  topPages: { path: string; _count: { _all: number } }[];
  referrerRows: { referrer: string | null }[];
  deviceRows: { userAgent: string | null }[];
  recentViews: {
    path: string;
    createdAt: Date;
    userAgent: string | null;
    referrer: string | null;
  }[];
}

async function loadAnalytics(
  startToday: Date,
  thirtyDaysAgo: Date
): Promise<AnalyticsData> {
  const [totalViews, todayViews, last30, topPages, referrerRows, deviceRows, recentViews] =
    await Promise.all([
      db.pageView.count(),
      db.pageView.count({ where: { createdAt: { gte: startToday } } }),
      // Last 30 days of raw views for the time-series + unique counts
      db.pageView.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, sessionId: true, userId: true },
      }),
      db.pageView.groupBy({
        by: ["path"],
        _count: { _all: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
      db.pageView.findMany({
        where: { referrer: { not: null } },
        select: { referrer: true },
      }),
      db.pageView.findMany({ select: { userAgent: true } }),
      db.pageView.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { path: true, createdAt: true, userAgent: true, referrer: true },
      }),
    ]);
  return { totalViews, todayViews, last30, topPages, referrerRows, deviceRows, recentViews };
}

const EMPTY: AnalyticsData = {
  totalViews: 0,
  todayViews: 0,
  last30: [],
  topPages: [],
  referrerRows: [],
  deviceRows: [],
  recentViews: [],
};

export default async function AnalyticsPage() {
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let data: AnalyticsData;
  let dbReady = true;
  try {
    data = await loadAnalytics(startToday, thirtyDaysAgo);
  } catch {
    // Table may not exist yet — create it, then retry once.
    try {
      await ensurePageViewTable();
      data = await loadAnalytics(startToday, thirtyDaysAgo);
    } catch {
      data = EMPTY;
      dbReady = false;
    }
  }

  const { totalViews, todayViews, last30, topPages, referrerRows, deviceRows, recentViews } = data;

  // ---- Unique visitors (anon sessionId or userId) ----
  const visitorKey = (v: { sessionId: string | null; userId: string | null }) =>
    v.userId ?? v.sessionId ?? "anon";
  const allVisitors = new Set(last30.map(visitorKey));
  const weekVisitors = new Set(
    last30.filter((v) => new Date(v.createdAt) >= sevenDaysAgo).map(visitorKey)
  );
  const todayVisitors = new Set(
    last30.filter((v) => new Date(v.createdAt) >= startToday).map(visitorKey)
  );

  // ---- 30-day series ----
  const dayKey = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const seriesMap = new Map<string, VisitorPoint & { _v: Set<string> }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    seriesMap.set(dayKey(d), { date: dayKey(d), views: 0, visitors: 0, _v: new Set() });
  }
  for (const v of last30) {
    const pt = seriesMap.get(dayKey(new Date(v.createdAt)));
    if (pt) {
      pt.views += 1;
      pt._v.add(visitorKey(v));
    }
  }
  const visitorSeries: VisitorPoint[] = [...seriesMap.values()].map(
    ({ date, views, _v }) => ({ date, views, visitors: _v.size })
  );

  // ---- Top referrers ----
  const refCount = new Map<string, number>();
  for (const r of referrerRows) {
    const s = sourceOf(r.referrer);
    refCount.set(s, (refCount.get(s) ?? 0) + 1);
  }
  const topReferrers = [...refCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // ---- Device breakdown ----
  const devCount = new Map<string, number>();
  for (const d of deviceRows) {
    const s = deviceOf(d.userAgent);
    devCount.set(s, (devCount.get(s) ?? 0) + 1);
  }
  const devices = [...devCount.entries()].sort((a, b) => b[1] - a[1]);
  const deviceTotal = devices.reduce((s, [, n]) => s + n, 0) || 1;

  return (
    <>
      <PageHeader
        title="Visitor Analytics"
        description="Traffic, unique visitors, top pages and referrers across the storefront."
      />

      {!dbReady && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-[13px] text-amber-800 dark:text-amber-300">
          Analytics storage isn't reachable yet. Once the database connection is
          available, the PageView table is created automatically and visits will
          start recording.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Eye}
          label="Page Views"
          value={totalViews}
          accent="brand"
          hint={`${todayViews} today`}
        />
        <StatCard
          icon={Users}
          label="Visitors (30d)"
          value={allVisitors.size}
          accent="emerald"
          hint={`${weekVisitors.size} this week`}
        />
        <StatCard
          icon={Globe}
          label="Visitors Today"
          value={todayVisitors.size}
          accent="cyan"
          hint={`${todayViews} views today`}
        />
        <StatCard
          icon={MonitorSmartphone}
          label="Top Device"
          value={devices[0]?.[0] ?? "—"}
          accent="amber"
          hint={
            devices[0]
              ? `${Math.round((devices[0][1] / deviceTotal) * 100)}% of visits`
              : undefined
          }
        />
      </div>

      {/* Visitors chart */}
      <div className="mb-6">
        <VisitorsChart data={visitorSeries} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Top pages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4 text-brand-600" aria-hidden />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Path</TH>
                    <TH className="text-right">Views</TH>
                  </TR>
                </THead>
                <TBody>
                  {topPages.length === 0 ? (
                    <TR>
                      <TD colSpan={2} className="text-center text-muted-foreground py-8">
                        No page views recorded yet
                      </TD>
                    </TR>
                  ) : (
                    topPages.map((p) => (
                      <TR key={p.path}>
                        <TD className="font-medium">{p.path}</TD>
                        <TD numeric className="font-semibold">
                          {p._count._all}
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Referrers + devices */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {topReferrers.length === 0 ? (
                <p className="text-[13px] text-muted-foreground px-5 pb-4">
                  No referrer data yet
                </p>
              ) : (
                <div className="divide-y">
                  {topReferrers.map(([src, n]) => (
                    <div
                      key={src}
                      className="px-5 py-2.5 flex items-center justify-between gap-2"
                    >
                      <p className="text-[13px] font-medium truncate">{src}</p>
                      <span className="text-[12px] font-bold tnum text-muted-foreground">
                        {n}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Devices</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {devices.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No data yet</p>
              ) : (
                devices.map(([name, n]) => (
                  <div key={name}>
                    <div className="flex items-center justify-between text-[12.5px] mb-1">
                      <span className="font-medium">{name}</span>
                      <span className="text-muted-foreground tnum">
                        {Math.round((n / deviceTotal) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-600"
                        style={{ width: `${(n / deviceTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent visits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Path</TH>
                  <TH>Source</TH>
                  <TH>Device</TH>
                  <TH className="text-right">Time</TH>
                </TR>
              </THead>
              <TBody>
                {recentViews.length === 0 ? (
                  <TR>
                    <TD colSpan={4} className="text-center text-muted-foreground py-8">
                      No visits recorded yet
                    </TD>
                  </TR>
                ) : (
                  recentViews.map((v, i) => (
                    <TR key={i}>
                      <TD className="font-medium">{v.path}</TD>
                      <TD className="text-muted-foreground">{sourceOf(v.referrer)}</TD>
                      <TD className="text-muted-foreground">{deviceOf(v.userAgent)}</TD>
                      <TD numeric className="text-muted-foreground">
                        {formatDateTime(v.createdAt)}
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
