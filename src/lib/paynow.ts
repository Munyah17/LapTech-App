import { Paynow } from "paynow";

export const PAID_STATUSES = new Set(["paid", "awaiting delivery"]);

export function isPaidStatus(status?: string): boolean {
  return PAID_STATUSES.has(status?.toLowerCase() ?? "");
}

export function amountMatches(
  expected: number,
  received?: number | string | null
): boolean {
  if (received === undefined || received === null) return false;
  return Math.abs(Number(received) - expected) < 0.01;
}

/**
 * Paynow Zimbabwe integration.
 * Credentials come from env — never hardcode keys.
 *   PAYNOW_INTEGRATION_ID=24720
 *   PAYNOW_INTEGRATION_KEY=…
 */
export function getPaynow(orderId?: string) {
  const id = process.env.PAYNOW_INTEGRATION_ID;
  const key = process.env.PAYNOW_INTEGRATION_KEY;
  if (!id || !key) {
    throw new Error("Paynow credentials not configured (PAYNOW_INTEGRATION_ID / PAYNOW_INTEGRATION_KEY).");
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const paynow = new Paynow(id, key);
  paynow.resultUrl = `${base}/api/paynow/callback`;
  paynow.returnUrl = `${base}/payment/return${orderId ? `?order=${encodeURIComponent(orderId)}` : ""}`;
  return paynow;
}
