# PLUTO field map

NYC PLUTO (Primary Land Use Tax Lot Output) is the official tax-lot dataset on NYC Open Data.

- Dataset: [Primary Land Use Tax Lot Output (PLUTO)](https://data.cityofnewyork.us/City-Government/Primary-Land-Use-Tax-Lot-Output-PLUTO-/64uk-42ks)
- SODA resource: `https://data.cityofnewyork.us/resource/64uk-42ks.json`
- CRM action: listing detail **Enrich from PLUTO**, or auto-enrich on listing save when a 10-digit BBL is present
- Request: `$limit=1` and `$where` on BBL **or** street address + borough. One lot only.

This is **open data**, not a listing scrape. StreetEasy, Zillow, Craigslist, Maps, and OneKey are still never pulled.

## Borough codes (Researchy / PLUTO)

| Name | Abbr (`borough`) | Code (`borocode`) |
| --- | --- | --- |
| Manhattan | MN | 1 |
| Bronx | BX | 2 |
| Brooklyn | BK | 3 |
| Queens | QN | 4 |
| Staten Island | SI | 5 |

Lookups accept the name, abbreviation, or numeric code. SODA address matches use `borough = 'MN'` (etc.).

## Live CRM columns

| CRM listing column | PLUTO / SODA field | Notes |
| --- | --- | --- |
| `bbl` | `bbl` | 10-digit borough+block+lot. SODA returns it as a float-like string (`1012437505.00000000`); CRM stores 10 digits. Lookup is numeric `bbl = 1012437505`. |
| `borough` | `borough` / `borocode` | Stored as PLUTO abbr after enrich (`MN`). Form/CSV may start with a name. |
| `units_res` | `unitsres` | Residential units on the **lot**, not the listing unit. |
| `year_built` | `yearbuilt` | Lot year built. |
| `num_floors` | `numfloors` | Lot floor count. |
| `bldg_class` | `bldgclass` | Building class (e.g. R4). |
| `zone_dist` | `zonedist1` | Primary zoning district. |
| `latitude` | `latitude` | Lot centroid. |
| `longitude` | `longitude` | Lot centroid. |
| `owner_name` | `ownername` | Tax-lot owner, not the listing agent. |
| `pluto_enriched_at` | (CRM) | SQLite `datetime('now')` when enrich last succeeded. |

`$select` used by the CRM:

```
bbl,address,borough,borocode,unitsres,yearbuilt,numfloors,bldgclass,zonedist1,latitude,longitude,ownername
```

Existing SQLite files pick up these nullable columns on startup via `ALTER TABLE listings ADD COLUMN`.

## Lookup

1. If the listing has a 10-digit `bbl`, query `$where=bbl = <digits>` (SODA types `bbl` as a number; `starts_with` is rejected).
2. Else need a street address **and** borough (from `borough`, the address text, or neighborhood → borough). Query `$where=upper(address) = '<STREET>' AND borough = '<MN|BX|BK|QN|SI>'`.
3. Unit / apartment suffixes (`#5D`, `Apt 4B`) are stripped before the street match.
4. No row → soft error: *No PLUTO tax lot matched that BBL* (or address + borough). Listing inventory fields are left alone.

Demo seed: `720 West End Avenue #5D` / `UWS-720-5D` / BBL `1012437505` (Manhattan).

## Never overwritten by enrich

PLUTO is a tax-lot file. It does not describe a rental unit.

| CRM field | Why it stays put |
| --- | --- |
| `price` | Asking rent is not in PLUTO |
| `beds` | Unit layout is not in PLUTO |
| `baths` | Unit layout is not in PLUTO |
| `status` | Listing status is not in PLUTO |
| `url` | Listing URL is not in PLUTO |
| `pets_allowed` | Pets policy is not in PLUTO |
| `pulled_at` / available date | Availability is not in PLUTO (CRM has no `available_date` column; keep it in notes/status/`pulled_at`) |
| `address` | Listing unit address stays as entered; PLUTO’s lot address is not copied over |

Form save and CSV import update inventory plus optional `borough` / `bbl` lookup keys. They do **not** write `units_res`, `year_built`, `num_floors`, `bldg_class`, `zone_dist`, `latitude`, `longitude`, `owner_name`, or `pluto_enriched_at`. CSV rows that omit `borough`/`bbl` do not clear values already stored.

Live rental inventory still comes from **manual paste / CSV** or a **future licensed MLS Grid / RLS feed**.
