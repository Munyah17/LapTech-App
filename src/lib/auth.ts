import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "laptech-dev-secret-change-me-in-production"
);

export const SESSION_COOKIE = "laptech_session";
const SESSION_DAYS = 7;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CLIENT";
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(SECRET);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as "ADMIN" | "CLIENT",
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser | null> {
  return getSession();
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export { db };
