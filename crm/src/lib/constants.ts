export const NEIGHBORHOODS = [
  "Astoria",
  "Bed-Stuy",
  "Bushwick",
  "Carroll Gardens",
  "Chelsea",
  "Crown Heights",
  "Downtown Brooklyn",
  "East Village",
  "Financial District",
  "Fort Greene",
  "Greenpoint",
  "Harlem",
  "Long Island City",
  "Park Slope",
  "Prospect Heights",
  "Upper East Side",
  "Upper West Side",
  "West Village",
  "Williamsburg",
] as const;

export const MUST_HAVES = [
  "dishwasher",
  "laundry in unit",
  "laundry in building",
  "doorman",
  "elevator",
  "outdoor space",
  "gym",
  "parking",
  "central air",
] as const;

export const LISTING_STATUSES = ["available", "pending", "rented", "off-market"] as const;

export const LISTING_SOURCES = ["manual", "csv", "mls-grid"] as const;

export const PERSON_TYPES = ["client", "broker"] as const;

export const PERSON_STATUSES = ["active", "inactive"] as const;

export const BOROUGHS = [
  { name: "Manhattan", abbr: "MN", code: "1" },
  { name: "Bronx", abbr: "BX", code: "2" },
  { name: "Brooklyn", abbr: "BK", code: "3" },
  { name: "Queens", abbr: "QN", code: "4" },
  { name: "Staten Island", abbr: "SI", code: "5" },
] as const;
