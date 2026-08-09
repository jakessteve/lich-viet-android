import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveWasmTopocentricSnapshot,
  executeWasmAstronomyPipeline
} from "../src/index.js";

test("executeWasmAstronomyPipeline returns the phase 1 astronomy surfaces", () => {
  const result = executeWasmAstronomyPipeline({
    julianDay: 2460826.5,
    latitude: 10.8231,
    longitude: 106.6297,
    altitudeMeters: 19,
    civilTimestamp: Date.parse("2026-05-30T00:00:00Z"),
    targetSolarLongitude: 75
  });

  assert.equal(result.planetarySnapshot.length, 7);
  assert.equal(result.solarTerm.targetLongitude, 75);
  assert.equal(result.sunriseSunset.sunriseUnixMs < result.sunriseSunset.sunsetUnixMs, true);
});

test("deriveWasmTopocentricSnapshot returns deterministic positions", () => {
  const snapshot = deriveWasmTopocentricSnapshot({
    julianDay: 2460826.5,
    latitude: 10.8231,
    longitude: 106.6297,
    altitudeMeters: 19
  });

  assert.equal(snapshot[0].body, "sun");
  assert.equal(snapshot.every((item) => item.tropicalLongitude >= 0 && item.tropicalLongitude < 360), true);
});
