import assert from "node:assert/strict";
import test from "node:test";
import { seedBrokers, seedSources } from "./seed-data";

test("seeds six inventory sources with scrape sources marked never", () => {
  assert.equal(seedSources.length, 6);
  const byName = Object.fromEntries(seedSources.map((row) => [row.name, row]));
  assert.equal(byName["NYC PLUTO"].kind, "open");
  assert.equal(byName["NYC PLUTO"].status, "ready");
  assert.match(byName["NYC PLUTO"].notes, /64uk-42ks/);
  assert.equal(byName["OneKey MLS Grid"].kind, "licensed");
  assert.equal(byName["OneKey MLS Grid"].status, "blocked");
  assert.equal(byName["StreetEasy / Zillow / Craigslist / Maps"].kind, "blocked");
  assert.equal(byName["StreetEasy / Zillow / Craigslist / Maps"].status, "never");
});

test("seeds ten active brokers and leaves Michele Denby email blank", () => {
  assert.equal(seedBrokers.length, 10);
  assert.ok(seedBrokers.every((broker) => broker.type === "broker" && broker.status === "active"));
  const denby = seedBrokers.find((broker) => broker.name === "Michele Denby");
  assert.ok(denby);
  assert.equal(denby?.email, "");
  assert.equal(denby?.company, "Elliman FiDi");
  assert.ok(seedBrokers.filter((broker) => broker.notes?.startsWith("http")).length >= 9);
});
