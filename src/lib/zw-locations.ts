/**
 * Zimbabwe delivery locations for suggestive address search at checkout.
 * harare: suburbs/areas inside the 40km delivery radius (zone-matched).
 * cities: towns/cities for countrywide FedEx pay-forward delivery.
 */

export interface ZWLocation {
  name: string;
  type: "suburb" | "city" | "town" | "street";
  /** Harare delivery zone name if within 40km radius */
  zone?: string;
}

export const HARARE_SUBURBS: ZWLocation[] = [
  // Zone A — City Centre (0–5km)
  { name: "CBD", type: "suburb", zone: "Zone A — City Centre" },
  { name: "Avenues", type: "suburb", zone: "Zone A — City Centre" },
  { name: "Eastlea", type: "suburb", zone: "Zone A — City Centre" },
  { name: "Milton Park", type: "suburb", zone: "Zone A — City Centre" },
  { name: "Avondale", type: "suburb", zone: "Zone A — City Centre" },
  { name: "Belvedere", type: "suburb", zone: "Zone A — City Centre" },
  { name: "Kopje", type: "suburb", zone: "Zone A — City Centre" },
  { name: "Belgravia", type: "suburb", zone: "Zone A — City Centre" },
  { name: "Alexandra Park", type: "suburb", zone: "Zone A — City Centre" },
  // Zone B — Inner Suburbs (5–10km)
  { name: "Highlands", type: "suburb", zone: "Zone B — Inner Suburbs" },
  { name: "Greendale", type: "suburb", zone: "Zone B — Inner Suburbs" },
  { name: "Msasa", type: "suburb", zone: "Zone B — Inner Suburbs" },
  { name: "Hatfield", type: "suburb", zone: "Zone B — Inner Suburbs" },
  { name: "Waterfalls", type: "suburb", zone: "Zone B — Inner Suburbs" },
  { name: "Mabelreign", type: "suburb", zone: "Zone B — Inner Suburbs" },
  { name: "Marlborough", type: "suburb", zone: "Zone B — Inner Suburbs" },
  { name: "Mbare", type: "suburb", zone: "Zone B — Inner Suburbs" },
  { name: "Highfield", type: "suburb", zone: "Zone B — Inner Suburbs" },
  { name: "Southerton", type: "suburb", zone: "Zone B — Inner Suburbs" },
  { name: "Workington", type: "suburb", zone: "Zone B — Inner Suburbs" },
  // Zone C — Outer Suburbs (10–15km)
  { name: "Borrowdale", type: "suburb", zone: "Zone C — Outer Suburbs" },
  { name: "Mount Pleasant", type: "suburb", zone: "Zone C — Outer Suburbs" },
  { name: "Chisipite", type: "suburb", zone: "Zone C — Outer Suburbs" },
  { name: "Glen Lorne", type: "suburb", zone: "Zone C — Outer Suburbs" },
  { name: "Mufakose", type: "suburb", zone: "Zone C — Outer Suburbs" },
  { name: "Kambuzuma", type: "suburb", zone: "Zone C — Outer Suburbs" },
  { name: "Warren Park", type: "suburb", zone: "Zone C — Outer Suburbs" },
  { name: "Budiriro", type: "suburb", zone: "Zone C — Outer Suburbs" },
  { name: "Glen View", type: "suburb", zone: "Zone C — Outer Suburbs" },
  { name: "Dzivarasekwa", type: "suburb", zone: "Zone C — Outer Suburbs" },
  { name: "Tafara", type: "suburb", zone: "Zone C — Outer Suburbs" },
  { name: "Mabvuku", type: "suburb", zone: "Zone C — Outer Suburbs" },
  // Zone D — Extended (15–25km)
  { name: "Borrowdale Brooke", type: "suburb", zone: "Zone D — Extended" },
  { name: "Hogerty Hill", type: "suburb", zone: "Zone D — Extended" },
  { name: "Glen Forest", type: "suburb", zone: "Zone D — Extended" },
  { name: "Epworth", type: "suburb", zone: "Zone D — Extended" },
  { name: "Ruwa", type: "town", zone: "Zone D — Extended" },
  { name: "Zimre Park", type: "suburb", zone: "Zone D — Extended" },
  { name: "Mandara", type: "suburb", zone: "Zone D — Extended" },
  { name: "Greystone Park", type: "suburb", zone: "Zone D — Extended" },
  // Zone E — Far Reach (25–40km)
  { name: "Chitungwiza", type: "city", zone: "Zone E — Far Reach" },
  { name: "Norton", type: "town", zone: "Zone E — Far Reach" },
  { name: "Seke", type: "suburb", zone: "Zone E — Far Reach" },
  { name: "Dema", type: "suburb", zone: "Zone E — Far Reach" },
  { name: "Beatrice", type: "town", zone: "Zone E — Far Reach" },
  { name: "Goromonzi", type: "town", zone: "Zone E — Far Reach" },
];

export const ZW_CITIES: ZWLocation[] = [
  { name: "Bulawayo", type: "city" },
  { name: "Gweru", type: "city" },
  { name: "Mutare", type: "city" },
  { name: "Masvingo", type: "city" },
  { name: "Kwekwe", type: "city" },
  { name: "Kadoma", type: "city" },
  { name: "Chinhoyi", type: "city" },
  { name: "Victoria Falls", type: "city" },
  { name: "Hwange", type: "town" },
  { name: "Marondera", type: "town" },
  { name: "Bindura", type: "town" },
  { name: "Chegutu", type: "town" },
  { name: "Rusape", type: "town" },
  { name: "Chipinge", type: "town" },
  { name: "Karoi", type: "town" },
  { name: "Kariba", type: "town" },
  { name: "Zvishavane", type: "town" },
  { name: "Beitbridge", type: "town" },
  { name: "Plumtree", type: "town" },
  { name: "Gwanda", type: "town" },
  { name: "Lupane", type: "town" },
  { name: "Shurugwi", type: "town" },
  { name: "Redcliff", type: "town" },
  { name: "Chiredzi", type: "town" },
  { name: "Triangle", type: "town" },
  { name: "Nyanga", type: "town" },
  { name: "Mutoko", type: "town" },
  { name: "Murewa", type: "town" },
  { name: "Shamva", type: "town" },
  { name: "Concession", type: "town" },
  { name: "Banket", type: "town" },
  { name: "Mvurwi", type: "town" },
  { name: "Glendale", type: "town" },
  { name: "Mazowe", type: "town" },
  { name: "Gokwe", type: "town" },
  { name: "Norton", type: "town" },
  { name: "Chitungwiza", type: "city" },
  { name: "Ruwa", type: "town" },
  { name: "Epworth", type: "town" },
];

/** Well-known Harare streets/landmarks for finer address suggestions. */
export const HARARE_STREETS: ZWLocation[] = [
  { name: "Samora Machel Avenue", type: "street", zone: "Zone A — City Centre" },
  { name: "Jason Moyo Avenue", type: "street", zone: "Zone A — City Centre" },
  { name: "Speke Avenue", type: "street", zone: "Zone A — City Centre" },
  { name: "Mbuya Nehanda Street", type: "street", zone: "Zone A — City Centre" },
  { name: "First Street", type: "street", zone: "Zone A — City Centre" },
  { name: "Borrowdale Road", type: "street", zone: "Zone C — Outer Suburbs" },
  { name: "Enterprise Road", type: "street", zone: "Zone B — Inner Suburbs" },
  { name: "Chiremba Road", type: "street", zone: "Zone B — Inner Suburbs" },
  { name: "Seke Road", type: "street", zone: "Zone B — Inner Suburbs" },
  { name: "High Glen Road", type: "street", zone: "Zone B — Inner Suburbs" },
  { name: "Sam Nujoma Street", type: "street", zone: "Zone A — City Centre" },
  { name: "Rotten Row", type: "street", zone: "Zone A — City Centre" },
  { name: "Cameron Street", type: "street", zone: "Zone A — City Centre" },
  { name: "Kwame Nkrumah Avenue", type: "street", zone: "Zone A — City Centre" },
  { name: "Leopold Takawira Street", type: "street", zone: "Zone A — City Centre" },
];

export const ALL_LOCATIONS: ZWLocation[] = [
  ...HARARE_SUBURBS,
  ...HARARE_STREETS,
  ...ZW_CITIES,
];

/** Suggestive search — matches on name prefix first, then substring. */
export function searchLocations(query: string, limit = 8): ZWLocation[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const starts = ALL_LOCATIONS.filter((l) =>
    l.name.toLowerCase().startsWith(q)
  );
  const contains = ALL_LOCATIONS.filter(
    (l) => !l.name.toLowerCase().startsWith(q) && l.name.toLowerCase().includes(q)
  );
  return [...starts, ...contains].slice(0, limit);
}
