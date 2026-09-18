import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import type { Project, RecordRow, SearchHit } from "./types";
import { parseCsv } from "./csv";

type ProjectRow = {
  id: number;
  name: string;
  description: string;
  fields: string;
  created_at: string;
  record_count: number;
};

type StoredRecord = {
  id: number;
  project_id: number;
  data: string;
  created_at: string;
  updated_at: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "portal.db");

let db: Database.Database | null = null;

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    fields: JSON.parse(row.fields) as string[],
    created_at: row.created_at,
    record_count: row.record_count,
  };
}

function mapRecord(row: StoredRecord): RecordRow {
  return {
    id: row.id,
    project_id: row.project_id,
    data: JSON.parse(row.data) as Record<string, string>,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mergeFields(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing);
  const next = [...existing];
  for (const field of incoming) {
    const name = field.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    next.push(name);
  }
  return next;
}

function seed(database: Database.Database) {
  const count = database.prepare("SELECT COUNT(*) AS n FROM projects").get() as { n: number };
  if (count.n > 0) return;

  const insertProject = database.prepare(
    "INSERT INTO projects (name, description, fields) VALUES (?, ?, ?)",
  );
  const insertRecord = database.prepare(
    "INSERT INTO records (project_id, data) VALUES (?, ?)",
  );

  const seedNow = database.transaction(() => {
    const realEstate = insertProject.run(
      "Real Estate",
      "Listings, deals, and property notes dumped from the field.",
      JSON.stringify(["Address", "Type", "Status", "Price", "Neighborhood", "Notes"]),
    );

    const vendors = insertProject.run(
      "Vendor Roster",
      "Preferred vendors and ops contacts for jobs outside the matcher CRM.",
      JSON.stringify(["Vendor", "Category", "Contact", "Phone", "Status", "Notes"]),
    );

    const listings = [
      {
        Address: "1842 Maple Ave",
        Type: "Rental",
        Status: "Available",
        Price: "$2,150",
        Neighborhood: "Midtown",
        Notes: "2bd / 1ba. Available May 1. Pets negotiable.",
      },
      {
        Address: "77 Harbor Court #4B",
        Type: "Sale",
        Status: "Under contract",
        Price: "$489,000",
        Neighborhood: "Harbor District",
        Notes: "Buyer financing contingency through Friday.",
      },
      {
        Address: "310 Pine Street",
        Type: "Rental",
        Status: "Application",
        Price: "$1,875",
        Neighborhood: "East End",
        Notes: "Credit check pending. Owner wants 12-month lease.",
      },
      {
        Address: "9 Willow Lane",
        Type: "Sale",
        Status: "Active",
        Price: "$625,000",
        Neighborhood: "Oak Hills",
        Notes: "Open house Saturday 1–3pm.",
      },
    ];

    const vendorRows = [
      {
        Vendor: "Apex Inspection Co",
        Category: "Inspections",
        Contact: "Dana Ruiz",
        Phone: "555-0142",
        Status: "Preferred",
        Notes: "48-hour turnaround on occupied units.",
      },
      {
        Vendor: "Northline Photography",
        Category: "Media",
        Contact: "Sam Chen",
        Phone: "555-0198",
        Status: "Active",
        Notes: "Twilight shots billed separately.",
      },
      {
        Vendor: "Harbor Legal",
        Category: "Closing",
        Contact: "Priya Shah",
        Phone: "555-0110",
        Status: "Preferred",
        Notes: "Title questions only. No tenant disputes.",
      },
      {
        Vendor: "Swift Movers",
        Category: "Logistics",
        Contact: "Lee Ortiz",
        Phone: "555-0166",
        Status: "On call",
        Notes: "Studio and 1-bed moves only.",
      },
    ];

    for (const row of listings) {
      insertRecord.run(realEstate.lastInsertRowid, JSON.stringify(row));
    }
    for (const row of vendorRows) {
      insertRecord.run(vendors.lastInsertRowid, JSON.stringify(row));
    }
  });

  seedNow();
}

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      fields TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      data TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_records_project ON records(project_id);
  `);
}

export function getDb() {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seed(db);
  return db;
}

export function listProjects(): Project[] {
  const rows = getDb()
    .prepare(
      `SELECT p.*, (
         SELECT COUNT(*) FROM records r WHERE r.project_id = p.id
       ) AS record_count
       FROM projects p
       ORDER BY p.id ASC`,
    )
    .all() as ProjectRow[];
  return rows.map(mapProject);
}

export function getProject(id: number): Project | null {
  const row = getDb()
    .prepare(
      `SELECT p.*, (
         SELECT COUNT(*) FROM records r WHERE r.project_id = p.id
       ) AS record_count
       FROM projects p
       WHERE p.id = ?`,
    )
    .get(id) as ProjectRow | undefined;
  return row ? mapProject(row) : null;
}

export function createProject(input: {
  name: string;
  description?: string;
  fields?: string[];
}): Project {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Project name is required.");
  }

  const fields = mergeFields([], input.fields ?? []);
  const result = getDb()
    .prepare("INSERT INTO projects (name, description, fields) VALUES (?, ?, ?)")
    .run(name, (input.description ?? "").trim(), JSON.stringify(fields));

  const created = getProject(Number(result.lastInsertRowid));
  if (!created) {
    throw new Error("Failed to create project.");
  }
  return created;
}

export function updateProject(
  id: number,
  input: { name?: string; description?: string; fields?: string[] },
): Project {
  const existing = getProject(id);
  if (!existing) {
    throw new Error("Project not found.");
  }

  const name = input.name !== undefined ? input.name.trim() : existing.name;
  if (!name) {
    throw new Error("Project name is required.");
  }

  const description = input.description !== undefined ? input.description.trim() : existing.description;
  const fields = input.fields !== undefined ? mergeFields([], input.fields) : existing.fields;

  getDb()
    .prepare("UPDATE projects SET name = ?, description = ?, fields = ? WHERE id = ?")
    .run(name, description, JSON.stringify(fields), id);

  const updated = getProject(id);
  if (!updated) {
    throw new Error("Failed to update project.");
  }
  return updated;
}

export function deleteProject(id: number) {
  const result = getDb().prepare("DELETE FROM projects WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw new Error("Project not found.");
  }
}

export function listRecords(projectId: number): RecordRow[] {
  const rows = getDb()
    .prepare("SELECT * FROM records WHERE project_id = ? ORDER BY id DESC")
    .all(projectId) as StoredRecord[];
  return rows.map(mapRecord);
}

export function getRecord(id: number): RecordRow | null {
  const row = getDb().prepare("SELECT * FROM records WHERE id = ?").get(id) as StoredRecord | undefined;
  return row ? mapRecord(row) : null;
}

export function createRecord(projectId: number, data: Record<string, string>): RecordRow {
  const project = getProject(projectId);
  if (!project) {
    throw new Error("Project not found.");
  }

  const fields = mergeFields(project.fields, Object.keys(data));
  if (fields.join("\0") !== project.fields.join("\0")) {
    getDb()
      .prepare("UPDATE projects SET fields = ? WHERE id = ?")
      .run(JSON.stringify(fields), projectId);
  }

  const result = getDb()
    .prepare("INSERT INTO records (project_id, data) VALUES (?, ?)")
    .run(projectId, JSON.stringify(data));

  const created = getRecord(Number(result.lastInsertRowid));
  if (!created) {
    throw new Error("Failed to create record.");
  }
  return created;
}

export function updateRecord(id: number, data: Record<string, string>): RecordRow {
  const existing = getRecord(id);
  if (!existing) {
    throw new Error("Record not found.");
  }

  const project = getProject(existing.project_id);
  if (project) {
    const fields = mergeFields(project.fields, Object.keys(data));
    if (fields.join("\0") !== project.fields.join("\0")) {
      getDb()
        .prepare("UPDATE projects SET fields = ? WHERE id = ?")
        .run(JSON.stringify(fields), existing.project_id);
    }
  }

  getDb()
    .prepare("UPDATE records SET data = ?, updated_at = datetime('now') WHERE id = ?")
    .run(JSON.stringify(data), id);

  const updated = getRecord(id);
  if (!updated) {
    throw new Error("Failed to update record.");
  }
  return updated;
}

export function deleteRecord(id: number) {
  const result = getDb().prepare("DELETE FROM records WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw new Error("Record not found.");
  }
}

export function searchRecords(query: string): SearchHit[] {
  const needle = query.trim();
  if (!needle) return [];

  const like = `%${needle}%`;
  const rows = getDb()
    .prepare(
      `SELECT r.*, p.name AS project_name
       FROM records r
       JOIN projects p ON p.id = r.project_id
       WHERE r.data LIKE ? OR p.name LIKE ?
       ORDER BY r.updated_at DESC, r.id DESC
       LIMIT 80`,
    )
    .all(like, like) as Array<StoredRecord & { project_name: string }>;

  return rows.map((row) => ({
    ...mapRecord(row),
    project_name: row.project_name,
  }));
}

export function importCsv(projectId: number, csvText: string): { imported: number; fields: string[] } {
  const project = getProject(projectId);
  if (!project) {
    throw new Error("Project not found.");
  }

  const parsed = parseCsv(csvText);
  if (parsed.headers.length === 0) {
    throw new Error("CSV needs a header row.");
  }
  if (parsed.rows.length === 0) {
    throw new Error("CSV has no data rows.");
  }

  const fields = mergeFields(project.fields, parsed.headers);
  const insert = getDb().prepare("INSERT INTO records (project_id, data) VALUES (?, ?)");

  const runImport = getDb().transaction(() => {
    getDb()
      .prepare("UPDATE projects SET fields = ? WHERE id = ?")
      .run(JSON.stringify(fields), projectId);
    for (const row of parsed.rows) {
      insert.run(projectId, JSON.stringify(row));
    }
  });

  runImport();
  return { imported: parsed.rows.length, fields };
}
