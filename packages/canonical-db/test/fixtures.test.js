import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { buildPhase2FixtureBundle } from "../src/fixtures.js";

test("buildPhase2FixtureBundle returns deterministic seed, htzc, and override fixtures", () => {
  const bundle = buildPhase2FixtureBundle();

  assert.equal(bundle.version, 1);
  assert.equal(bundle.summary.canonicalEntityCount, 419);
  assert.equal(bundle.summary.astrologyConceptCount, 147);
  assert.equal(bundle.summary.calculationMethodCount, 18);
  assert.equal(bundle.summary.calculationSourceCount, 13);
  assert.equal(bundle.summary.dungSuEventCount, 95);
  assert.equal(bundle.summary.dungSuScoringProfileCount, 95);
  assert.equal(bundle.htzcFixtures.length, 3);
  assert.equal(bundle.overrideFixtures.auditLog.length, 1);
});

test("phase2-bootstrap fixture file stays in sync with the fixture exporter", () => {
  const expected = `${JSON.stringify(buildPhase2FixtureBundle(), null, 2)}\n`;
  const current = fs.readFileSync(new URL("../fixtures/phase2-bootstrap.json", import.meta.url), "utf8");

  assert.equal(current, expected);
});
