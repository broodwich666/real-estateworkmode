import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { seedClients, seedListings } from "./seed-data";
import { parseBool, parseNumber, parseOptionalNumber, splitList } from "./format";
import type { Client, ClientInput, Listing, ListingInput, Match } from "./types";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  budget_max INTEGER,
  beds_min REAL NOT NULL DEFAULT 0,
  baths_min REAL NOT NULL DEFAULT 0,
  neighborhoods TEXT NOT NULL DEFAULT '[]',
  pets INTEGER NOT NULL DEFAULT 0,
  move_in_date TEXT NOT NULL DEFAULT '',
  must_haves TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS listings (
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

CREATE UNIQUE INDEX IF NOT EXISTS listings_source_external
  ON listings(source, external_id)
  WHERE external_id != '';

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  listing_id INTEGER NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  UNIQUE(client_id, listing_id)
);
`;

type SqliteDb = Database.Database;

const globalForDb = globalThis as unknown as { rentalCrmDb?: SqliteDb };

function dbPath(): string {
  return process.env.DATABASE_PATH || path.join(process.cwd(), "data", "crm.db");
}

function jsonList(value: string[] | string | null | undefined): string {
  return JSON.stringify(splitList(value));
}

function readList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    return splitList(value);
  }
  return splitList(value);
}

function mapClient(row: Record<string, unknown>): Client {
  return {
    id: Number(row.id),
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    budget_max: row.budget_max == null ? null : Number(row.budget_max),
    beds_min: Number(row.beds_min ?? 0),
    baths_min: Number(row.baths_min ?? 0),
    neighborhoods: readList(String(row.neighborhoods ?? "")),
    pets: Boolean(row.pets),
    move_in_date: String(row.move_in_date ?? ""),
    must_haves: readList(String(row.must_haves ?? "")),
    notes: String(row.notes ?? ""),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function mapListing(row: Record<string, unknown>): Listing {
  return {
    id: Number(row.id),
    source: String(row.source ?? ""),
    external_id: String(row.external_id ?? ""),
    address: String(row.address ?? ""),
    neighborhood: String(row.neighborhood ?? ""),
    beds: Number(row.beds ?? 0),
    baths: Number(row.baths ?? 0),
    price: row.price == null ? null : Number(row.price),
    status: String(row.status ?? "available"),
    url: String(row.url ?? ""),
    pets_allowed: Boolean(row.pets_allowed),
    amenities: readList(String(row.amenities ?? "")),
    notes: String(row.notes ?? ""),
    pulled_at: String(row.pulled_at ?? ""),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function mapMatch(row: Record<string, unknown>): Match {
  return {
    id: Number(row.id),
    client_id: Number(row.client_id),
    listing_id: Number(row.listing_id),
    notes: String(row.notes ?? ""),
    created_at: String(row.created_at ?? ""),
  };
}

function seed(db: SqliteDb) {
  const clientCount = db.prepare("SELECT COUNT(*) AS n FROM clients").get() as { n: number };
  const listingCount = db.prepare("SELECT COUNT(*) AS n FROM listings").get() as { n: number };
  if (clientCount.n > 0 || listingCount.n > 0) return;

  const insertClient = db.prepare(`
    INSERT INTO clients (name, phone, email, budget_max, beds_min, baths_min, neighborhoods, pets, move_in_date, must_haves, notes)
    VALUES (@name, @phone, @email, @budget_max, @beds_min, @baths_min, @neighborhoods, @pets, @move_in_date, @must_haves, @notes)
  `);
  const insertListing = db.prepare(`
    INSERT INTO listings (source, external_id, address, neighborhood, beds, baths, price, status, url, pets_allowed, amenities, notes, pulled_at)
    VALUES (@source, @external_id, @address, @neighborhood, @beds, @baths, @price, @status, @url, @pets_allowed, @amenities, @notes, @pulled_at)
  `);

  const tx = db.transaction(() => {
    for (const client of seedClients) {
      insertClient.run({
        name: client.name,
        phone: client.phone ?? "",
        email: client.email ?? "",
        budget_max: client.budget_max ?? null,
        beds_min: client.beds_min ?? 0,
        baths_min: client.baths_min ?? 0,
        neighborhoods: jsonList(client.neighborhoods),
        pets: parseBool(client.pets) ? 1 : 0,
        move_in_date: client.move_in_date ?? "",
        must_haves: jsonList(client.must_haves),
        notes: client.notes ?? "",
      });
    }
    for (const listing of seedListings) {
      insertListing.run({
        source: listing.source ?? "manual",
        external_id: listing.external_id ?? "",
        address: listing.address,
        neighborhood: listing.neighborhood ?? "",
        beds: listing.beds ?? 0,
        baths: listing.baths ?? 0,
        price: listing.price ?? null,
        status: listing.status ?? "available",
        url: listing.url ?? "",
        pets_allowed: parseBool(listing.pets_allowed) ? 1 : 0,
        amenities: jsonList(listing.amenities),
        notes: listing.notes ?? "",
        pulled_at: listing.pulled_at ?? "",
      });
    }
  });
  tx();
}

export function getDb(): SqliteDb {
  if (globalForDb.rentalCrmDb) return globalForDb.rentalCrmDb;
  const file = dbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  seed(db);
  globalForDb.rentalCrmDb = db;
  return db;
}

export function resetDatabase() {
  if (globalForDb.rentalCrmDb) {
    globalForDb.rentalCrmDb.close();
    globalForDb.rentalCrmDb = undefined;
  }
  const file = dbPath();
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = `${file}${suffix}`;
    if (fs.existsSync(target)) fs.unlinkSync(target);
  }
  return getDb();
}

export function listClients(query = ""): Client[] {
  const db = getDb();
  const rows = query
    ? db
        .prepare(
          `SELECT * FROM clients
           WHERE name LIKE @q OR email LIKE @q OR phone LIKE @q OR neighborhoods LIKE @q OR notes LIKE @q
           ORDER BY name COLLATE NOCASE`
        )
        .all({ q: `%${query}%` })
    : db.prepare("SELECT * FROM clients ORDER BY name COLLATE NOCASE").all();
  return (rows as Record<string, unknown>[]).map(mapClient);
}

export function getClient(id: number): Client | null {
  const row = getDb().prepare("SELECT * FROM clients WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? mapClient(row) : null;
}

export function createClient(input: ClientInput): Client {
  const result = getDb()
    .prepare(
      `INSERT INTO clients (name, phone, email, budget_max, beds_min, baths_min, neighborhoods, pets, move_in_date, must_haves, notes)
       VALUES (@name, @phone, @email, @budget_max, @beds_min, @baths_min, @neighborhoods, @pets, @move_in_date, @must_haves, @notes)`
    )
    .run({
      name: input.name.trim(),
      phone: input.phone ?? "",
      email: input.email ?? "",
      budget_max: parseOptionalNumber(input.budget_max),
      beds_min: parseNumber(input.beds_min, 0),
      baths_min: parseNumber(input.baths_min, 0),
      neighborhoods: jsonList(input.neighborhoods),
      pets: parseBool(input.pets) ? 1 : 0,
      move_in_date: input.move_in_date ?? "",
      must_haves: jsonList(input.must_haves),
      notes: input.notes ?? "",
    });
  return getClient(Number(result.lastInsertRowid))!;
}

export function updateClient(id: number, input: ClientInput): Client | null {
  getDb()
    .prepare(
      `UPDATE clients SET
        name = @name,
        phone = @phone,
        email = @email,
        budget_max = @budget_max,
        beds_min = @beds_min,
        baths_min = @baths_min,
        neighborhoods = @neighborhoods,
        pets = @pets,
        move_in_date = @move_in_date,
        must_haves = @must_haves,
        notes = @notes,
        updated_at = datetime('now')
      WHERE id = @id`
    )
    .run({
      id,
      name: input.name.trim(),
      phone: input.phone ?? "",
      email: input.email ?? "",
      budget_max: parseOptionalNumber(input.budget_max),
      beds_min: parseNumber(input.beds_min, 0),
      baths_min: parseNumber(input.baths_min, 0),
      neighborhoods: jsonList(input.neighborhoods),
      pets: parseBool(input.pets) ? 1 : 0,
      move_in_date: input.move_in_date ?? "",
      must_haves: jsonList(input.must_haves),
      notes: input.notes ?? "",
    });
  return getClient(id);
}

export function deleteClient(id: number) {
  getDb().prepare("DELETE FROM clients WHERE id = ?").run(id);
}

export function listListings(query = "", status = ""): Listing[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: Record<string, string> = {};
  if (query) {
    clauses.push(
      "(address LIKE @q OR neighborhood LIKE @q OR source LIKE @q OR external_id LIKE @q OR notes LIKE @q OR amenities LIKE @q)"
    );
    params.q = `%${query}%`;
  }
  if (status) {
    clauses.push("status = @status");
    params.status = status;
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM listings ${where} ORDER BY neighborhood COLLATE NOCASE, price ASC`)
    .all(params);
  return (rows as Record<string, unknown>[]).map(mapListing);
}

export function getListing(id: number): Listing | null {
  const row = getDb().prepare("SELECT * FROM listings WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? mapListing(row) : null;
}

function listingWriteParams(input: ListingInput) {
  return {
    source: (input.source || "manual").trim() || "manual",
    external_id: (input.external_id || "").trim(),
    address: input.address.trim(),
    neighborhood: (input.neighborhood || "").trim(),
    beds: parseNumber(input.beds, 0),
    baths: parseNumber(input.baths, 0),
    price: parseOptionalNumber(input.price),
    status: (input.status || "available").trim().toLowerCase() || "available",
    url: input.url ?? "",
    pets_allowed: parseBool(input.pets_allowed) ? 1 : 0,
    amenities: jsonList(input.amenities),
    notes: input.notes ?? "",
    pulled_at: input.pulled_at || new Date().toISOString().slice(0, 10),
  };
}

export function createListing(input: ListingInput): Listing {
  const params = listingWriteParams(input);
  if (params.source && params.external_id) {
    const existing = getDb()
      .prepare("SELECT id FROM listings WHERE source = ? AND external_id = ?")
      .get(params.source, params.external_id) as { id: number } | undefined;
    if (existing) {
      return updateListing(existing.id, input)!;
    }
  }
  const result = getDb()
    .prepare(
      `INSERT INTO listings (source, external_id, address, neighborhood, beds, baths, price, status, url, pets_allowed, amenities, notes, pulled_at)
       VALUES (@source, @external_id, @address, @neighborhood, @beds, @baths, @price, @status, @url, @pets_allowed, @amenities, @notes, @pulled_at)`
    )
    .run(params);
  return getListing(Number(result.lastInsertRowid))!;
}

export function updateListing(id: number, input: ListingInput): Listing | null {
  getDb()
    .prepare(
      `UPDATE listings SET
        source = @source,
        external_id = @external_id,
        address = @address,
        neighborhood = @neighborhood,
        beds = @beds,
        baths = @baths,
        price = @price,
        status = @status,
        url = @url,
        pets_allowed = @pets_allowed,
        amenities = @amenities,
        notes = @notes,
        pulled_at = @pulled_at,
        updated_at = datetime('now')
      WHERE id = @id`
    )
    .run({ id, ...listingWriteParams(input) });
  return getListing(id);
}

export function deleteListing(id: number) {
  getDb().prepare("DELETE FROM listings WHERE id = ?").run(id);
}

export function importListings(rows: ListingInput[]): { created: number; updated: number } {
  let created = 0;
  let updated = 0;
  const db = getDb();
  const tx = db.transaction(() => {
    for (const row of rows) {
      const params = listingWriteParams(row);
      const existing =
        params.source && params.external_id
          ? (db
              .prepare("SELECT id FROM listings WHERE source = ? AND external_id = ?")
              .get(params.source, params.external_id) as { id: number } | undefined)
          : undefined;
      if (existing) {
        updateListing(existing.id, row);
        updated += 1;
      } else {
        createListing(row);
        created += 1;
      }
    }
  });
  tx();
  return { created, updated };
}

export function listMatchesForClient(clientId: number): Array<Match & { listing: Listing }> {
  const rows = getDb()
    .prepare(
      `SELECT matches.*, listings.id AS listing_row_id
       FROM matches
       JOIN listings ON listings.id = matches.listing_id
       WHERE matches.client_id = ?
       ORDER BY matches.created_at DESC`
    )
    .all(clientId) as Record<string, unknown>[];
  return rows.map((row) => ({
    ...mapMatch(row),
    listing: getListing(Number(row.listing_id))!,
  }));
}

export function saveMatch(clientId: number, listingId: number, notes = ""): Match {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM matches WHERE client_id = ? AND listing_id = ?")
    .get(clientId, listingId) as Record<string, unknown> | undefined;
  if (existing) {
    if (notes) {
      db.prepare("UPDATE matches SET notes = ? WHERE id = ?").run(notes, existing.id);
      return mapMatch({ ...existing, notes });
    }
    return mapMatch(existing);
  }
  const result = db
    .prepare("INSERT INTO matches (client_id, listing_id, notes) VALUES (?, ?, ?)")
    .run(clientId, listingId, notes);
  return mapMatch({
    id: Number(result.lastInsertRowid),
    client_id: clientId,
    listing_id: listingId,
    notes,
    created_at: new Date().toISOString(),
  });
}

export function updateMatchNotes(id: number, notes: string) {
  getDb().prepare("UPDATE matches SET notes = ? WHERE id = ?").run(notes, id);
}

export function deleteMatch(id: number) {
  getDb().prepare("DELETE FROM matches WHERE id = ?").run(id);
}

export function stats() {
  const db = getDb();
  const clients = (db.prepare("SELECT COUNT(*) AS n FROM clients").get() as { n: number }).n;
  const listings = (db.prepare("SELECT COUNT(*) AS n FROM listings").get() as { n: number }).n;
  const available = (
    db.prepare("SELECT COUNT(*) AS n FROM listings WHERE status = 'available'").get() as { n: number }
  ).n;
  const matches = (db.prepare("SELECT COUNT(*) AS n FROM matches").get() as { n: number }).n;
  return { clients, listings, available, matches };
}
