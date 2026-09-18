import assert from "node:assert/strict";
import test from "node:test";
import { mapPlutoRecord, normalizeBbl, plutoWhere, resolveBorough, streetLine } from "./pluto";

test("normalizes BBL to 10 digits from PLUTO float form", () => {
  assert.equal(normalizeBbl("1012437505.00000000"), "1012437505");
  assert.equal(normalizeBbl("1-012437-505"), "1012437505");
});

test("maps borough names and Researchy codes MN=1 BK=3", () => {
  assert.deepEqual(resolveBorough({ borough: "Manhattan" }), { abbr: "MN", code: "1", name: "Manhattan" });
  assert.equal(resolveBorough({ borough: "3" })?.abbr, "BK");
  assert.equal(resolveBorough({ neighborhood: "Williamsburg" })?.name, "Brooklyn");
  assert.equal(resolveBorough({ address: "100 Willoughby Street, Brooklyn, NY" })?.abbr, "BK");
});

test("strips unit and city from a listing address for PLUTO street match", () => {
  assert.equal(streetLine("720 West End Avenue #5D, New York, NY"), "720 WEST END AVENUE");
  assert.equal(streetLine("201 W 109th Street #4B, New York, NY"), "201 WEST 109 STREET");
});

test("builds a BBL $where before address lookup", () => {
  const byBbl = plutoWhere({ bbl: "1012437505", address: "720 West End Avenue", borough: "Manhattan" });
  assert.ok(!("error" in byBbl));
  if ("error" in byBbl) return;
  assert.equal(byBbl.method, "bbl");
  assert.equal(byBbl.where, "bbl = 1012437505");

  const byAddress = plutoWhere({ address: "720 West End Avenue #5D, New York, NY", borough: "MN" });
  assert.ok(!("error" in byAddress));
  if ("error" in byAddress) return;
  assert.equal(byAddress.method, "address");
  assert.match(byAddress.where, /720 WEST END AVENUE/);
  assert.match(byAddress.where, /borough = 'MN'/);
});

test("maps SODA row onto enrich columns only", () => {
  const lot = mapPlutoRecord({
    bbl: "1012437505.00000000",
    address: "720 WEST END AVENUE",
    borough: "MN",
    borocode: "1",
    unitsres: "131",
    yearbuilt: "1927",
    numfloors: "15.0000000",
    bldgclass: "R4",
    zonedist1: "R10A",
    latitude: "40.7946102",
    longitude: "-73.9731407",
    ownername: "720 WEA VENTURES LLC",
  });
  assert.equal(lot.bbl, "1012437505");
  assert.equal(lot.units_res, 131);
  assert.equal(lot.year_built, 1927);
  assert.equal(lot.bldg_class, "R4");
  assert.equal(lot.zone_dist, "R10A");
  assert.equal("beds" in lot, false);
  assert.equal("price" in lot, false);
  assert.equal("status" in lot, false);
  assert.equal("url" in lot, false);
});

test("rejects lookup without BBL or address+borough", () => {
  const missing = plutoWhere({ address: "720 West End Avenue" });
  assert.ok("error" in missing);
  if (!("error" in missing)) return;
  assert.match(missing.error, /BBL|borough/i);
});
