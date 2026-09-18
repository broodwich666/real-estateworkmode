# PLUTO field map (stub)

NYC PLUTO (Primary Land Use Tax Lot Output) is an **open** tax-lot dataset. Socrata ID: `64uk-42ks`.

This pass is a field map only. There is **no live PLUTO API pull** and **no scraping**. A later licensed or open-data join can enrich listings that already exist in this CRM.

## PLUTO can enrich later

| Listing / lot field | PLUTO typically has |
| --- | --- |
| BBL | Borough + tax block + lot |
| Address | Official tax-lot address |
| Borough | Borough code / name |
| Units | Residential unit count |
| Year built | Year built |

Other lot facts (building class, zoning, lot area, number of floors) can wait until a real join is designed.

## Stays manual (or a licensed listing feed)

| Field | Why |
| --- | --- |
| Rent / asking price | Not in PLUTO |
| Beds | Not in PLUTO |
| Baths | Not in PLUTO |
| Pets allowed | Not in PLUTO |
| Available / move-in date | Not in PLUTO |
| Listing URL | Not in PLUTO |

Live rental inventory still comes from **manual paste / CSV** or a **future licensed MLS Grid / RLS feed**, never from StreetEasy, Zillow, Craigslist, or Maps scraping.
