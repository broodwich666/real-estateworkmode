import assert from "node:assert/strict";
import test from "node:test";
import { parseListingsCsv } from "./csv";

const SAMPLE = `source,external_id,address,neighborhood,beds,baths,price,status,url,pets_allowed,amenities,notes,pulled_at
csv,CSV-1,"200 Test Ave #4, Brooklyn, NY",Park Slope,2,1,4100,available,,yes,"laundry in unit, dishwasher",Quiet block,2026-09-18
csv,CSV-2,"",Williamsburg,1,1,3000,available,,no,elevator,Missing address,2026-09-18
`;

test("parses valid listing rows and skips rows without an address", () => {
  const result = parseListingsCsv(SAMPLE);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].external_id, "CSV-1");
  assert.equal(result.rows[0].neighborhood, "Park Slope");
  assert.equal(result.rows[0].beds, 2);
  assert.equal(result.rows[0].price, 4100);
  assert.equal(result.rows[0].pets_allowed, true);
  assert.deepEqual(result.rows[0].amenities, ["laundry in unit", "dishwasher"]);
  assert.ok(result.errors.some((error) => /missing address/i.test(error)));
});

test("accepts alternate headers and boolean pets values", () => {
  const csv = `id,street,area,bedrooms,bathrooms,rent,pets,features
ALT-9,90 Main Street,Astoria,0,1,2500,true,doorman;elevator`;
  const result = parseListingsCsv(csv);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].external_id, "ALT-9");
  assert.equal(result.rows[0].address, "90 Main Street");
  assert.equal(result.rows[0].neighborhood, "Astoria");
  assert.equal(result.rows[0].beds, 0);
  assert.equal(result.rows[0].pets_allowed, true);
  assert.deepEqual(result.rows[0].amenities, ["doorman", "elevator"]);
});

test("parses optional borough and bbl without requiring them", () => {
  const withLot = parseListingsCsv(
    `address,borough,bbl,beds,price
"720 West End Avenue #5D, New York, NY",Manhattan,1012437505,2,4400`
  );
  assert.equal(withLot.rows[0].borough, "Manhattan");
  assert.equal(withLot.rows[0].bbl, "1012437505");

  const withoutLot = parseListingsCsv(`address,beds,price
"184 N 8th Street #3L, Brooklyn, NY",1,3200`);
  assert.equal(withoutLot.rows[0].borough, undefined);
  assert.equal(withoutLot.rows[0].bbl, undefined);
});
