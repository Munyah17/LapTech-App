import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "laptech-dev-secret-change-me-in-production"
);

async function getRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("laptech_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await getRole(req);

  // Admin area — admins only (except the admin login page itself)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (role !== "ADMIN") {
      const url = new URL("/admin/login", req.url);
      return NextResponse.redirect(url);
    }
  }

  // Account area — any logged-in user
  if (pathname.startsWith("/account")) {
    if (!role) {
      const url = new URL("/login", req.url);
      return NextResponse.redirect(url);
    }
  }

  // Admin API — admins only
  if (pathname.startsWith("/api/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/api/admin/:path*"],
};
