import type { Client, Listing, MatchResult } from "./types";
import { formatMoney } from "./format";

const AVAILABLE_STATUSES = new Set(["available", "active", "listed"]);

function norm(value: string): string {
  return value.trim().toLowerCase();
}

function amenitySet(listing: Listing): Set<string> {
  return new Set(listing.amenities.map(norm));
}

function neighborhoodMatches(client: Client, listing: Listing): boolean {
  if (!client.neighborhoods.length) return true;
  const wanted = new Set(client.neighborhoods.map(norm));
  return wanted.has(norm(listing.neighborhood));
}

export function listingFitsClient(
  client: Client,
  listing: Listing,
  options: { includeUnavailable?: boolean } = {}
): boolean {
  if (!options.includeUnavailable && !AVAILABLE_STATUSES.has(norm(listing.status || "available"))) {
    return false;
  }
  if (client.budget_max != null && listing.price != null && listing.price > client.budget_max) {
    return false;
  }
  if (listing.beds < client.beds_min) return false;
  if (listing.baths < client.baths_min) return false;
  if (!neighborhoodMatches(client, listing)) return false;
  if (client.pets && !listing.pets_allowed) return false;
  return true;
}

export function scoreListing(client: Client, listing: Listing): { score: number; reasons: string[]; gaps: string[] } {
  const reasons: string[] = [];
  const gaps: string[] = [];
  let score = 40;

  if (listing.price != null && client.budget_max != null && client.budget_max > 0) {
    const ratio = listing.price / client.budget_max;
    if (ratio <= 1) {
      const tightness = 1 - Math.abs(0.88 - ratio);
      score += Math.round(22 * Math.max(0.4, tightness));
      reasons.push(`${formatMoney(listing.price)} is within a ${formatMoney(client.budget_max)} budget`);
    }
  } else if (listing.price != null) {
    score += 8;
    reasons.push(`Priced at ${formatMoney(listing.price)}`);
  }

  if (client.neighborhoods.length) {
    score += 18;
    reasons.push(`In ${listing.neighborhood}`);
  } else if (listing.neighborhood) {
    score += 4;
  }

  if (listing.beds > client.beds_min) {
    score += 6;
    reasons.push("Extra bedroom vs. minimum");
  } else if (listing.beds >= client.beds_min) {
    score += 3;
    reasons.push(client.beds_min <= 0 && listing.beds <= 0 ? "Studio" : "Meets bed count");
  }

  if (listing.baths > client.baths_min) {
    score += 4;
    reasons.push("Extra bath vs. minimum");
  }

  if (client.pets && listing.pets_allowed) {
    score += 8;
    reasons.push("Pet-friendly");
  }

  const amenities = amenitySet(listing);
  for (const need of client.must_haves) {
    if (amenities.has(norm(need))) {
      score += 8;
      reasons.push(`Has ${need}`);
    } else {
      gaps.push(`Missing ${need}`);
      score -= 4;
    }
  }

  return {
    score: Math.max(1, Math.min(100, score)),
    reasons,
    gaps,
  };
}

export function findMatches(
  client: Client,
  listings: Listing[],
  saved: Array<{ listing_id: number; id: number; notes: string }>,
  options: { includeUnavailable?: boolean } = {}
): MatchResult[] {
  const savedByListing = new Map(saved.map((row) => [row.listing_id, row]));
  return listings
    .filter((listing) => listingFitsClient(client, listing, options))
    .map((listing) => {
      const scored = scoreListing(client, listing);
      const existing = savedByListing.get(listing.id);
      return {
        listing,
        score: scored.score,
        reasons: scored.reasons,
        gaps: scored.gaps,
        saved: Boolean(existing),
        matchId: existing?.id ?? null,
        matchNotes: existing?.notes ?? "",
      };
    })
    .sort((a, b) => b.score - a.score || (a.listing.price ?? 0) - (b.listing.price ?? 0));
}
