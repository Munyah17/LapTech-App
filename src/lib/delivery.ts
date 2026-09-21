import { db } from "./db";

/**
 * Delivery fee model for Harare (40km radius from CBD).
 * Fees are zone-based and admin-editable via the DeliveryZone table.
 * Rates are benchmarked against current local ride-hailing courier costs.
 */

export interface DeliveryZoneInfo {
  id: string;
  name: string;
  minKm: number;
  maxKm: number;
  fee: number;
  suburbs: string[];
}

export async function getDeliveryZones(): Promise<DeliveryZoneInfo[]> {
  const zones = await db.deliveryZone.findMany({
    where: { active: true },
    orderBy: { minKm: "asc" },
  });
  return zones.map((z) => ({
    id: z.id,
    name: z.name,
    minKm: z.minKm,
    maxKm: z.maxKm,
    fee: z.fee,
    suburbs: z.suburbs.split(",").map((s) => s.trim()),
  }));
}

/** Find the zone that covers a given suburb name (case-insensitive). */
export async function getZoneForSuburb(
  suburb: string
): Promise<DeliveryZoneInfo | null> {
  const zones = await getDeliveryZones();
  const needle = suburb.trim().toLowerCase();
  for (const zone of zones) {
    if (zone.suburbs.some((s) => s.toLowerCase() === needle)) return zone;
  }
  // partial match fallback
  for (const zone of zones) {
    if (
      zone.suburbs.some(
        (s) =>
          s.toLowerCase().includes(needle) || needle.includes(s.toLowerCase())
      )
    )
      return zone;
  }
  return null;
}

/** Quote a delivery fee for a suburb. Returns null if outside coverage. */
export async function quoteDelivery(suburb: string) {
  const zone = await getZoneForSuburb(suburb);
  if (!zone) return { covered: false as const, fee: 0, zone: null };
  return { covered: true as const, fee: zone.fee, zone };
}
