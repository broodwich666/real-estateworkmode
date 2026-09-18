import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import Database from "better-sqlite3";
import { applyPlutoEnrich, createListing, getDb, getListing, updateListing } from "./db";

const file = path.join(os.tmpdir(), `crm-pluto-${process.pid}-${Date.now()}.db`);
process.env.DATABASE_PATH = file;
fs.mkdirSync(path.dirname(file), { recursive: true });

const raw = new Database(file);
raw.exec(`
CREATE TABLE listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  neighborhood TEXT NOT NULL DEFAULT '',
  beds REAL NOT NULL DEFAULT 0,
  baths REAL NOT NULL DEFAULT 0,
  price INTEGER,
  status TEXT NOT NULL DEFAULT 'available',
  url TEXT NOT NULL DEFAULT '',
  pets_allowed INTEGER NOT NULL DEFAULT 0,
  amenities TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  pulled_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO listings (address, neighborhood, beds, baths, price, status, url, pets_allowed, pulled_at)
VALUES (
  '720 West End Avenue #5D, New York, NY',
  'Upper West Side',
  2,
  1,
  4400,
  'available',
  'https://example.com/keep',
  1,
  '2026-09-07'
);
`);
raw.close();

const ENRICH_COLS = [
  "borough",
  "bbl",
  "units_res",
  "year_built",
  "num_floors",
  "bldg_class",
  "zone_dist",
  "latitude",
  "longitude",
  "owner_name",
  "pluto_enriched_at",
];

test("migrates nullable PLUTO columns onto existing listings SQLite", () => {
  const db = getDb();
  const cols = new Set(
    (db.prepare("PRAGMA table_info(listings)").all() as Array<{ name: string }>).map((row) => row.name)
  );
  for (const name of ENRICH_COLS) assert.ok(cols.has(name), `missing column ${name}`);
  const listing = getListing(1);
  assert.equal(listing?.price, 4400);
  assert.equal(listing?.url, "https://example.com/keep");
  assert.equal(listing?.beds, 2);
});

test("applyPlutoEnrich fills lot fields and leaves inventory alone", () => {
  const before = getListing(1)!;
  applyPlutoEnrich(before.id, {
    bbl: "1012437505",
    borough: "MN",
    units_res: 131,
    year_built: 1927,
    num_floors: 15,
    bldg_class: "R4",
    zone_dist: "R10A",
    latitude: 40.7946102,
    longitude: -73.9731407,
    owner_name: "720 WEA VENTURES LLC",
    pluto_address: "720 WEST END AVENUE",
  });
  const after = getListing(before.id)!;
  assert.equal(after.beds, 2);
  assert.equal(after.baths, 1);
  assert.equal(after.price, 4400);
  assert.equal(after.status, "available");
  assert.equal(after.url, "https://example.com/keep");
  assert.equal(after.pets_allowed, true);
  assert.equal(after.pulled_at, "2026-09-07");
  assert.equal(after.address, before.address);
  assert.equal(after.bbl, "1012437505");
  assert.equal(after.borough, "MN");
  assert.equal(after.units_res, 131);
  assert.equal(after.year_built, 1927);
  assert.equal(after.num_floors, 15);
  assert.equal(after.bldg_class, "R4");
  assert.equal(after.zone_dist, "R10A");
  assert.equal(after.owner_name, "720 WEA VENTURES LLC");
  assert.ok(after.pluto_enriched_at);
});

test("listing save without borough/bbl does not clear enrich columns", () => {
  const created = createListing({
    address: "100 Willoughby Street #18K, Brooklyn, NY",
    neighborhood: "Downtown Brooklyn",
    beds: 3,
    baths: 2,
    price: 6500,
    status: "available",
    url: "https://example.com/willoughby",
    pets_allowed: true,
    borough: "Brooklyn",
    bbl: "3000000001",
  });
  applyPlutoEnrich(created.id, {
    bbl: "3000000001",
    borough: "BK",
    units_res: 400,
    year_built: 2015,
    num_floors: 40,
    bldg_class: "D6",
    zone_dist: "C6-4",
    latitude: 40.69,
    longitude: -73.98,
    owner_name: "EXAMPLE OWNER",
    pluto_address: "100 WILLOUGHBY STREET",
  });
  updateListing(created.id, {
    address: created.address,
    neighborhood: created.neighborhood,
    beds: 3,
    baths: 2,
    price: 6500,
    status: "available",
    url: created.url,
    pets_allowed: true,
  });
  const after = getListing(created.id)!;
  assert.equal(after.bbl, "3000000001");
  assert.equal(after.borough, "BK");
  assert.equal(after.units_res, 400);
  assert.equal(after.price, 6500);
  assert.equal(after.url, "https://example.com/willoughby");
});
