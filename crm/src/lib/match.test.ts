import assert from "node:assert/strict";
import test from "node:test";
import { findMatches, listingFitsClient, scoreListing } from "./match";
import type { Client, Listing } from "./types";

function client(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    name: "Test Client",
    type: "client",
    status: "active",
    company: "",
    phone: "",
    email: "",
    budget_max: 3400,
    beds_min: 1,
    baths_min: 1,
    neighborhoods: ["Williamsburg", "Greenpoint"],
    pets: true,
    move_in_date: "2026-10-01",
    must_haves: ["dishwasher"],
    notes: "",
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

function listing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: 1,
    source: "manual",
    external_id: "x",
    address: "100 Test Street",
    neighborhood: "Williamsburg",
    beds: 1,
    baths: 1,
    price: 3200,
    status: "available",
    url: "",
    pets_allowed: true,
    amenities: ["dishwasher"],
    notes: "",
    pulled_at: "",
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

test("fits when hard criteria match", () => {
  assert.equal(listingFitsClient(client(), listing()), true);
});

test("excludes listings over budget", () => {
  assert.equal(listingFitsClient(client(), listing({ price: 3600 })), false);
});

test("excludes listings with too few beds", () => {
  assert.equal(listingFitsClient(client(), listing({ beds: 0 })), false);
});

test("excludes listings with too few baths", () => {
  assert.equal(listingFitsClient(client(), listing({ baths: 0.5 })), false);
});

test("excludes wrong neighborhoods when client has a list", () => {
  assert.equal(listingFitsClient(client(), listing({ neighborhood: "Astoria" })), false);
});

test("allows any neighborhood when client list is empty", () => {
  assert.equal(listingFitsClient(client({ neighborhoods: [] }), listing({ neighborhood: "Astoria" })), true);
});

test("requires pet-friendly listings when the client has pets", () => {
  assert.equal(listingFitsClient(client({ pets: true }), listing({ pets_allowed: false })), false);
});

test("still shows pet-friendly listings when the client has no pets", () => {
  assert.equal(listingFitsClient(client({ pets: false }), listing({ pets_allowed: true })), true);
});

test("hides rented listings by default", () => {
  assert.equal(listingFitsClient(client(), listing({ status: "rented" })), false);
});

test("studio seekers with beds_min 0 can match studios", () => {
  assert.equal(listingFitsClient(client({ beds_min: 0, neighborhoods: [] }), listing({ beds: 0 })), true);
});

test("ranks a complete match above a listing missing must-haves", () => {
  const results = findMatches(
    client(),
    [
      listing({ id: 1, price: 3200, amenities: ["dishwasher"] }),
      listing({ id: 2, price: 3100, amenities: [] }),
    ],
    []
  );
  assert.equal(results[0].listing.id, 1);
  assert.ok(results[0].score > results[1].score);
  assert.ok(results[1].gaps.some((gap) => /dishwasher/i.test(gap)));
});

test("score mentions pet-friendly and neighborhood", () => {
  const scored = scoreListing(client(), listing());
  assert.ok(scored.reasons.some((reason) => /pet/i.test(reason)));
  assert.ok(scored.reasons.some((reason) => /Williamsburg/.test(reason)));
});

test("marks already saved matches", () => {
  const results = findMatches(client(), [listing({ id: 9 })], [{ listing_id: 9, id: 3, notes: "tour Friday" }]);
  assert.equal(results[0].saved, true);
  assert.equal(results[0].matchId, 3);
  assert.equal(results[0].matchNotes, "tour Friday");
});
