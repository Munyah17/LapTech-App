import { Paynow } from "paynow";

/**
 * Paynow Zimbabwe integration.
 * Credentials come from env — never hardcode keys.
 *   PAYNOW_INTEGRATION_ID=24720
 *   PAYNOW_INTEGRATION_KEY=…
 */
export function getPaynow() {
  const id = process.env.PAYNOW_INTEGRATION_ID;
  const key = process.env.PAYNOW_INTEGRATION_KEY;
  if (!id || !key) {
    throw new Error("Paynow credentials not configured (PAYNOW_INTEGRATION_ID / PAYNOW_INTEGRATION_KEY).");
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const paynow = new Paynow(id, key);
  paynow.resultUrl = `${base}/api/paynow/callback`;
  paynow.returnUrl = `${base}/payment/return`;
  return paynow;
}
