import test from "node:test";
import assert from "node:assert/strict";

import {
  buildTopocentricObserver,
  computeHouseCusps,
  computeTopocentricPlanetarySnapshot,
  computeDeltaT,
  computeDynamicRefraction,
  computeJulianCentury,
  solveSolarTermBoundary
} from "../src/astronomy.js";
import {
  applyTimelineGuardrails,
  evaluateElectionCandidate
} from "../src/index.js";
import { unixMsToJulianDay } from "../src/time.js";

test("Round 3 - Extreme Latitudes: geocentric projection and WholeSign fallback", () => {
  // Extreme North
  const obsNorth = buildTopocentricObserver({
    julianDay: 2460825.5,
    latitude: 89.9,
    longitude: 106.6297,
    altitudeMeters: 10
  });

  const snapNorth = computeTopocentricPlanetarySnapshot(obsNorth);
  assert.equal(snapNorth.length, 7);

  const housesNorth = computeHouseCusps(obsNorth);
  assert.equal(housesNorth.system, "WholeSign");
  assert.equal(housesNorth.cusps.length, 12);

  // Extreme South
  const obsSouth = buildTopocentricObserver({
    julianDay: 2460825.5,
    latitude: -89.9,
    longitude: 106.6297,
    altitudeMeters: 10
  });

  const snapSouth = computeTopocentricPlanetarySnapshot(obsSouth);
  assert.equal(snapSouth.length, 7);

  const housesSouth = computeHouseCusps(obsSouth);
  assert.equal(housesSouth.system, "WholeSign");
  assert.equal(housesSouth.cusps.length, 12);
});

test("Round 3 - Boundary Longitudes", () => {
  const obsEast = buildTopocentricObserver({
    julianDay: 2460825.5,
    latitude: 10.8231,
    longitude: 180.0,
    altitudeMeters: 19
  });
  assert.equal(obsEast.longitude, 180.0);

  const obsWest = buildTopocentricObserver({
    julianDay: 2460825.5,
    latitude: 10.8231,
    longitude: -180.0,
    altitudeMeters: 19
  });
  assert.equal(obsWest.longitude, -180.0);
});

test("Round 3 - High Altitude Observer", () => {
  const obsEverest = buildTopocentricObserver({
    julianDay: 2460825.5,
    latitude: 27.9881,
    longitude: 86.9250,
    altitudeMeters: 8848
  });

  // Snapshot calculation should execute without infinity or division errors
  const snap = computeTopocentricPlanetarySnapshot(obsEverest);
  assert.equal(snap.length, 7);

  const refraction = computeDynamicRefraction({
    elevationMeters: 8848,
    julianDay: 2460825.5,
    latitude: 27.9881
  });

  assert.equal(refraction.pressureMbar > 100, true); // Still has atmospheric pressure
  assert.equal(refraction.pressureMbar < 500, true); // But significantly lower than sea level (~300mbar)
  assert.equal(Number.isFinite(refraction.correctionDegrees), true);
});

test("Round 3 - Extreme Dates and Delta T Branches", () => {
  // Pre-1600 (Year 1000)
  const dt1000 = computeDeltaT(2086307.5);
  assert.equal(Number.isFinite(dt1000), true);

  // Post-2050 (Year 2100)
  const dt2100 = computeDeltaT(2488069.5);
  assert.equal(Number.isFinite(dt2100), true);

  // Modern Era (Year 2026)
  const dt2026 = computeDeltaT(2461071.5);
  assert.equal(dt2026 > 60 && dt2026 < 80, true); // deltaT in 2026 is around ~70 seconds
});

test("Delta T uses the full Espenak-Meeus 1800-1860 polynomial", () => {
  const julianDay1830 = unixMsToJulianDay(Date.parse("1830-01-01T00:00:00Z"));

  assert.equal(Math.abs(computeDeltaT(julianDay1830) - 7.655006233892298) < 1e-9, true);
});

test("Round 3 - Extreme High Altitude (Stratosphere/Mesosphere)", () => {
  const refraction = computeDynamicRefraction({
    elevationMeters: 50000, // 50km
    julianDay: 2460825.5,
    latitude: 10.8231
  });

  // Verify that division by zero was avoided and values are finite numbers
  assert.equal(Number.isFinite(refraction.pressureMbar), true);
  assert.equal(Number.isFinite(refraction.temperatureC), true);
  assert.equal(Number.isFinite(refraction.correctionDegrees), true);
  assert.equal(refraction.temperatureC < -270, true); // temperature should be around -310C without clamping
  assert.equal(refraction.pressureMbar > 0, true); // pressure clamped at 0.2 fraction
});

test("Round 3 - Polar House Cusps (Absolute Poles)", () => {
  const obsNorthPole = buildTopocentricObserver({
    julianDay: 2460825.5,
    latitude: 90.0,
    longitude: 0.0,
    altitudeMeters: 0
  });

  const housesNorth = computeHouseCusps(obsNorthPole);
  assert.equal(housesNorth.system, "WholeSign");
  assert.equal(housesNorth.cusps.length, 12);
  assert.equal(Number.isFinite(housesNorth.ascendant), true);
  assert.equal(Number.isFinite(housesNorth.midheaven), true);

  const obsSouthPole = buildTopocentricObserver({
    julianDay: 2460825.5,
    latitude: -90.0,
    longitude: 0.0,
    altitudeMeters: 0
  });

  const housesSouth = computeHouseCusps(obsSouthPole);
  assert.equal(housesSouth.system, "WholeSign");
  assert.equal(housesSouth.cusps.length, 12);
  assert.equal(Number.isFinite(housesSouth.ascendant), true);
  assert.equal(Number.isFinite(housesSouth.midheaven), true);
});

test("Round 3 - Extreme Historical and Future Dates", () => {
  // Year -4000 (Julian day approx 263653.5)
  const dtAncient = computeDeltaT(263653.5);
  assert.equal(Number.isFinite(dtAncient), true);

  // Year 4000 (Julian day approx 3182054.5)
  const dtFuture = computeDeltaT(3182054.5);
  assert.equal(Number.isFinite(dtFuture), true);
});

test("Architect - LTTB Peak Score Preservation", () => {
  const entries = [
    { timestampStart: 1000, timestampEnd: 2000, metrics: { totalScore: 10 } },
    { timestampStart: 2000, timestampEnd: 3000, metrics: { totalScore: 12 } },
    { timestampStart: 3000, timestampEnd: 4000, metrics: { totalScore: 99 } }, // The narrow peak
    { timestampStart: 4000, timestampEnd: 5000, metrics: { totalScore: 15 } },
    { timestampStart: 5000, timestampEnd: 6000, metrics: { totalScore: 11 } }
  ];

  // Request downsampling to 3 entries. Standard LTTB might discard the peak (timestampStart 3000).
  const guarded = applyTimelineGuardrails(entries, { maxEntries: 3 });

  assert.equal(guarded.entries.length, 3);
  // Verify that the absolute peak entry (timestampStart 3000) was preserved in the output!
  const hasPeak = guarded.entries.some((e) => e.timestampStart === 3000);
  assert.equal(hasPeak, true);
});

test("Architect - Keplerian Extrapolation Safety Clamps", () => {
  // Test T clamping in computeJulianCentury for extreme JD
  const extremeJD = 99999999;
  const T = computeJulianCentury(extremeJD);
  assert.equal(T, 100); // Clamped at 100 centuries

  // Test that computeTopocentricPlanetarySnapshot runs fine for extreme future
  const obs = buildTopocentricObserver({
    julianDay: extremeJD,
    latitude: 10,
    longitude: 106,
    altitudeMeters: 10
  });
  const snap = computeTopocentricPlanetarySnapshot(obs);
  assert.equal(snap.length, 7);
  for (const body of snap) {
    assert.equal(Number.isFinite(body.tropicalLongitude), true);
  }
});

test("Architect - Polar Latitude Clamping", () => {
  const obsNorth = buildTopocentricObserver({
    julianDay: 2460825.5,
    latitude: 90.0, // Absolute pole
    longitude: 106.6297,
    altitudeMeters: 10
  });

  // Verify that the latitude is clamped to 89.99
  assert.equal(obsNorth.latitude, 89.99);

  const obsSouth = buildTopocentricObserver({
    julianDay: 2460825.5,
    latitude: -90.0, // Absolute pole
    longitude: 106.6297,
    altitudeMeters: 10
  });

  // Verify that the latitude is clamped to -89.99
  assert.equal(obsSouth.latitude, -89.99);
});

test("Architect - Dynamic Root Bracketing in Solar Term Solver", () => {
  // Test that solveSolarTermBoundary converges even when startJulianDay is far off (e.g. 15 days off)
  // Solar longitude of 60 is crossed around Julian Day 2460815.5
  // We start 15 days earlier at 2460800.5
  const result = solveSolarTermBoundary({
    targetLongitude: 60,
    startJulianDay: 2460800.5
  });

  assert.equal(Math.abs(result.longitude - 60) < 0.01, true);
  assert.equal(result.iterations > 0, true);
});

test("Architect - TOPSIS Score Override Variance", () => {
  const baseInput = {
    timestamp: Date.parse("2026-05-30T00:00:00Z"),
    astronomy: {
      timezone: { offsetHours: 7, ruleId: "test", ambiguous: false, shiftedTimestamp: 0 },
      solarTerm: { julianDay: 2461071.5, longitude: 60, iterations: 3 },
      sunriseSunset: { sunriseUnixMs: 0, sunsetUnixMs: 0, refraction: { pressureMbar: 1013, temperatureC: 15, correctionArcMinutes: 34, correctionDegrees: 0.5 } },
      planetarySnapshot: [
        { body: "sun", tropicalLongitude: 65, siderealLongitude: 42 },
        { body: "moon", tropicalLongitude: 120, siderealLongitude: 97 },
        { body: "mars", tropicalLongitude: 180, siderealLongitude: 157 }
      ]
    }
  };

  // Evaluate candidate with a very large weight modifier
  const resultWithOverride = evaluateElectionCandidate({
    ...baseInput,
    overrideMapping: [
      { weight_modifier: 10.0 } // Large override
    ]
  });

  // Evaluate another candidate with a slightly different solarTermDistance or other minor factors
  const resultWithOverrideAndDiff = evaluateElectionCandidate({
    ...baseInput,
    astronomy: {
      ...baseInput.astronomy,
      planetarySnapshot: [
        { body: "sun", tropicalLongitude: 65.1, siderealLongitude: 42 },
        { body: "moon", tropicalLongitude: 120, siderealLongitude: 97 },
        { body: "mars", tropicalLongitude: 180, siderealLongitude: 157 }
      ]
    },
    overrideMapping: [
      { weight_modifier: 10.0 }
    ]
  });

  // Verify that the soft clamp prevented both from flat-clapping to exactly 100.00
  // and that their scores are distinct, preserving variance!
  assert.equal(resultWithOverride.metrics.easternScore < 100.0, true);
  assert.equal(resultWithOverrideAndDiff.metrics.easternScore < 100.0, true);
  assert.notEqual(resultWithOverride.metrics.easternScore, resultWithOverrideAndDiff.metrics.easternScore);
});
