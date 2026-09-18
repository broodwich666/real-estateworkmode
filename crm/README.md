# Rental Match CRM

A small NYC rental CRM for agents: keep clients and listings in one database, cross-search by criteria, and save the best matches.

This app lives in `crm/` and is **additive**. Work Mode (the REFLASHAPP PWA) stays at the repository root.

Inventory comes from **manual entry**, **CSV import**, or a **future licensed MLS Grid feed**. This app does not scrape OneKey, Craigslist, StreetEasy, Zillow, Google Maps, or any other listing site.

## Run locally (one command)

From the repository root:

```bash
cd crm && npm install && npm run dev
```

Or from this folder:

```bash
npm install && npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

The first launch creates `data/crm.db` (SQLite) and seeds sample clients and listings. To reset demo data:

```bash
npm run seed
```

## Demo flow

1. Open **Clients** and pick **Maya Chen** (or add a new client).
2. The client page runs **Find matches** against available listings: budget, beds, baths, neighborhoods, and pets are hard filters; must-haves affect ranking.
3. Save a match with optional notes.
4. On **Listings**, add a unit by hand or **Import CSV**. A sample file is at `data/sample-listings.csv`.

## Data model

- **clients**: name, phone, email, budget_max, beds_min, baths_min, neighborhoods, pets, move_in_date, must_haves, notes
- **listings**: source, external_id, address, neighborhood, beds, baths, price, status, url, pets_allowed, amenities, notes, pulled_at
- **matches**: client_id, listing_id, notes, created_at

CSV columns match the listing fields. Rows with the same `source` + `external_id` update the existing listing. `pets_allowed` accepts `yes` / `true` / `1`. Amenities can be comma-separated (quoted) or semicolon-separated.

## Scripts

| Command | What it does |
| --- | --- |
| `npm install && npm run dev` | Install and run the app (from `crm/`) |
| `npm test` | Matching + CSV unit tests |
| `npm run seed` | Recreate the SQLite database from sample data |
| `npm run build && npm start` | Production server |

No API keys or secrets are required. Do not commit `.env` files with credentials.
