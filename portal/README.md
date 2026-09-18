# Zad Data Portal

Multi-project data hub. Real Estate and other projects dump structured records into one web UI.

This is **not** Work Mode (repo root) and **not** the Real Estate Match CRM (`crm/`, separate app).

## Run

```bash
cd portal
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seeded demo

On first run SQLite creates `data/portal.db` and seeds two projects:

- **Real Estate** — sample listings and deal notes
- **Vendor Roster** — sample vendor contacts

## MVP

- Projects list and create
- Project detail: records table, add/edit, delete
- CSV import (header row becomes columns)
- Global search across projects

Data stays local in `portal/data/portal.db`. Delete that file to re-seed.
