import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ANON_COOKIE = "laptech_anon";

// Record a browsing interaction (product view / cart add) for recommendations,
// or a page view for visitor analytics.
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const type = typeof b.type === "string" ? b.type : "VIEW";
  if (!["VIEW", "CART_ADD", "PURCHASE", "PAGE_VIEW"].includes(type)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const session = await getSession();
  const jar = await cookies();

  // Anonymous visitors get a stable session id so we can still recommend/track.
  let sessionId = jar.get(ANON_COOKIE)?.value;
  if (!session && !sessionId) {
    sessionId = crypto.randomUUID();
    jar.set(ANON_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  if (type === "PAGE_VIEW") {
    const path = typeof b.path === "string" && b.path ? b.path.slice(0, 255) : "/";
    // Best-effort: never let analytics tracking break the storefront.
    await db.pageView
      .create({
        data: {
          path,
          userId: session?.id ?? null,
          sessionId: session ? null : sessionId ?? null,
          referrer: typeof b.referrer === "string" ? b.referrer.slice(0, 500) : null,
          userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
        },
      })
      .catch(() => {});
    return NextResponse.json({ ok: true });
  }

  await db.interaction.create({
    data: {
      userId: session?.id ?? null,
      sessionId: session ? null : sessionId ?? null,
      productId: b.productId ?? null,
      categoryId: b.categoryId ?? null,
      type,
    },
  });
  return NextResponse.json({ ok: true });
}
