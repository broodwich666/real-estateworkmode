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
