import Papa from "papaparse";
import type { ListingInput } from "./types";
import { parseBool, parseNumber, parseOptionalNumber, splitList } from "./format";

export const CSV_COLUMNS = [
  "source",
  "external_id",
  "address",
  "neighborhood",
  "beds",
  "baths",
  "price",
  "status",
  "url",
  "pets_allowed",
  "amenities",
  "notes",
  "pulled_at",
] as const;

export type CsvImportResult = {
  rows: ListingInput[];
  errors: string[];
};

function firstValue(row: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    const match = Object.keys(row).find((k) => k.trim().toLowerCase() === key);
    if (match && row[match] != null && String(row[match]).trim() !== "") {
      return String(row[match]).trim();
    }
  }
  return "";
}

export function parseListingsCsv(text: string): CsvImportResult {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  const errors: string[] = parsed.errors.map(
    (err) => `CSV ${err.row != null ? `row ${err.row + 1}` : ""}: ${err.message}`.trim()
  );
  const rows: ListingInput[] = [];

  parsed.data.forEach((row, index) => {
    const address = firstValue(row, ["address", "street", "location"]);
    if (!address) {
      errors.push(`Row ${index + 2}: missing address`);
      return;
    }

    rows.push({
      source: firstValue(row, ["source"]) || "csv",
      external_id: firstValue(row, ["external_id", "id", "listing_id"]),
      address,
      neighborhood: firstValue(row, ["neighborhood", "area", "hood"]),
      beds: parseNumber(firstValue(row, ["beds", "bedrooms", "br"]), 0),
      baths: parseNumber(firstValue(row, ["baths", "bathrooms", "ba"]), 0),
      price: parseOptionalNumber(firstValue(row, ["price", "rent", "monthly_rent"])),
      status: (firstValue(row, ["status"]) || "available").toLowerCase(),
      url: firstValue(row, ["url", "link"]),
      pets_allowed: parseBool(firstValue(row, ["pets_allowed", "pets", "pet_friendly"])),
      amenities: splitList(firstValue(row, ["amenities", "features"])),
      notes: firstValue(row, ["notes", "comments"]),
      pulled_at: firstValue(row, ["pulled_at", "listed_at", "updated_at"]),
    });
  });

  return { rows, errors };
}
