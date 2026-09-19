export const BOROUGH_BY_CODE: Record<string, string> = {
  "1": "MN",
  "2": "BX",
  "3": "BK",
  "4": "QN",
  "5": "SI",
};

export const BOROUGH_META: Record<string, { abbr: string; code: string; name: string }> = {
  mn: { abbr: "MN", code: "1", name: "Manhattan" },
  manhattan: { abbr: "MN", code: "1", name: "Manhattan" },
  "1": { abbr: "MN", code: "1", name: "Manhattan" },
  bx: { abbr: "BX", code: "2", name: "Bronx" },
  bronx: { abbr: "BX", code: "2", name: "Bronx" },
  "2": { abbr: "BX", code: "2", name: "Bronx" },
  bk: { abbr: "BK", code: "3", name: "Brooklyn" },
  brooklyn: { abbr: "BK", code: "3", name: "Brooklyn" },
  "3": { abbr: "BK", code: "3", name: "Brooklyn" },
  qn: { abbr: "QN", code: "4", name: "Queens" },
  queens: { abbr: "QN", code: "4", name: "Queens" },
  "4": { abbr: "QN", code: "4", name: "Queens" },
  si: { abbr: "SI", code: "5", name: "Staten Island" },
  "staten island": { abbr: "SI", code: "5", name: "Staten Island" },
  "5": { abbr: "SI", code: "5", name: "Staten Island" },
};

export const NEIGHBORHOOD_BOROUGH: Record<string, string> = {
  Astoria: "Queens",
  "Long Island City": "Queens",
  "Bed-Stuy": "Brooklyn",
  Bushwick: "Brooklyn",
  "Carroll Gardens": "Brooklyn",
  "Crown Heights": "Brooklyn",
  "Downtown Brooklyn": "Brooklyn",
  "Fort Greene": "Brooklyn",
  Greenpoint: "Brooklyn",
  "Park Slope": "Brooklyn",
  "Prospect Heights": "Brooklyn",
  Williamsburg: "Brooklyn",
  Chelsea: "Manhattan",
  "East Village": "Manhattan",
  "Financial District": "Manhattan",
  Harlem: "Manhattan",
  "Upper East Side": "Manhattan",
  "Upper West Side": "Manhattan",
  "West Village": "Manhattan",
};

const STREET_SUFFIX: Record<string, string> = {
  ST: "STREET",
  STREET: "STREET",
  AVE: "AVENUE",
  AV: "AVENUE",
  AVENUE: "AVENUE",
  BLVD: "BOULEVARD",
  BOULEVARD: "BOULEVARD",
  RD: "ROAD",
  ROAD: "ROAD",
  PL: "PLACE",
  PLACE: "PLACE",
  DR: "DRIVE",
  DRIVE: "DRIVE",
  LN: "LANE",
  LANE: "LANE",
  CT: "COURT",
  COURT: "COURT",
  PKWY: "PARKWAY",
  PARKWAY: "PARKWAY",
  TER: "TERRACE",
  TERRACE: "TERRACE",
};

const DIRECTION: Record<string, string> = {
  N: "NORTH",
  S: "SOUTH",
  E: "EAST",
  W: "WEST",
};

export type PlutoLot = {
  bbl: string;
  borough: string;
  units_res: number | null;
  year_built: number | null;
  num_floors: number | null;
  bldg_class: string;
  zone_dist: string;
  latitude: number | null;
  longitude: number | null;
  owner_name: string;
  pluto_address: string;
};

export type PlutoLookup = {
  bbl?: string;
  address?: string;
  borough?: string;
  neighborhood?: string;
};

export type PlutoResult = { ok: true; lot: PlutoLot } | { ok: false; error: string };

const PLUTO_URL = "https://data.cityofnewyork.us/resource/64uk-42ks.json";
const SELECT =
  "bbl,address,borough,borocode,unitsres,yearbuilt,numfloors,bldgclass,zonedist1,latitude,longitude,ownername";

export function normalizeBbl(value: string | null | undefined): string {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(0, 10);
  return digits;
}

export function resolveBorough(input: {
  borough?: string;
  address?: string;
  neighborhood?: string;
}): { abbr: string; code: string; name: string } | null {
  const direct = lookupBorough(input.borough || "");
  if (direct) return direct;

  const address = (input.address || "").toLowerCase();
  for (const key of ["staten island", "manhattan", "brooklyn", "queens", "bronx"]) {
    if (address.includes(key)) return lookupBorough(key);
  }

  return lookupBorough(NEIGHBORHOOD_BOROUGH[input.neighborhood || ""] || "");
}

function lookupBorough(value: string) {
  const key = value.trim().toLowerCase();
  return BOROUGH_META[key] || null;
}

export function streetLine(address: string): string {
  let line = (address || "").split(",")[0].trim().toUpperCase();
  line = line.replace(/\./g, "");
  line = line.replace(/\s+(#|APT|APARTMENT|UNIT|STE|SUITE|FL|FLOOR|PH)\s*\S+$/i, "");
  const parts = line.split(/\s+/).filter(Boolean);
  return parts
    .map((part, index) => {
      if (index > 0 && DIRECTION[part]) return DIRECTION[part];
      const ordinal = part.match(/^(\d+)(ST|ND|RD|TH)$/);
      if (ordinal) return ordinal[1];
      if (index === parts.length - 1 && STREET_SUFFIX[part]) return STREET_SUFFIX[part];
      return part;
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapPlutoRecord(row: Record<string, unknown>): PlutoLot {
  const borocode = String(row.borocode ?? "");
  const borough = String(row.borough || BOROUGH_BY_CODE[borocode] || "").toUpperCase();
  return {
    bbl: normalizeBbl(String(row.bbl ?? "")),
    borough,
    units_res: toNum(row.unitsres),
    year_built: toNum(row.yearbuilt),
    num_floors: toNum(row.numfloors),
    bldg_class: String(row.bldgclass ?? "").trim(),
    zone_dist: String(row.zonedist1 ?? "").trim(),
    latitude: toNum(row.latitude),
    longitude: toNum(row.longitude),
    owner_name: String(row.ownername ?? "").trim(),
    pluto_address: String(row.address ?? "").trim(),
  };
}

function toNum(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function soqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export function plutoWhere(lookup: PlutoLookup): { where: string; method: "bbl" | "address" } | { error: string } {
  const bbl = normalizeBbl(lookup.bbl);
  if (bbl.length === 10) {
    // SODA types `bbl` as a number; starts_with() rejects it.
    return { where: `bbl = ${bbl}`, method: "bbl" };
  }
  const street = streetLine(lookup.address || "");
  const borough = resolveBorough(lookup);
  if (!street || !borough) {
    return {
      error: "Need a 10-digit BBL, or an address plus borough (MN=1, BX=2, BK=3, QN=4, SI=5).",
    };
  }
  return {
    where: `upper(address) = ${soqlString(street)} AND borough = ${soqlString(borough.abbr)}`,
    method: "address",
  };
}

export async function fetchPlutoLot(lookup: PlutoLookup): Promise<PlutoResult> {
  const built = plutoWhere(lookup);
  if ("error" in built) return { ok: false, error: built.error };

  try {
    const url = new URL(PLUTO_URL);
    url.searchParams.set("$limit", "1");
    url.searchParams.set("$select", SELECT);
    url.searchParams.set("$where", built.where);
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) {
      return { ok: false, error: `PLUTO request failed (${response.status}). Try again in a moment.` };
    }
    const rows = (await response.json()) as Record<string, unknown>[];
    if (!Array.isArray(rows) || !rows.length) {
      return {
        ok: false,
        error:
          built.method === "bbl"
            ? "No PLUTO tax lot matched that BBL."
            : "No PLUTO tax lot matched that address and borough. Add a BBL and try again.",
      };
    }
    return { ok: true, lot: mapPlutoRecord(rows[0]) };
  } catch {
    return { ok: false, error: "Could not reach NYC Open Data. Check the network and retry." };
  }
}
