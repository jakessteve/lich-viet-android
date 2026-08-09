import test from "node:test";
import assert from "node:assert/strict";

import {
  buildTopocentricObserver,
  computeDynamicRefraction,
  computeLahiriAyanamsa,
  computeSolarLongitude,
  computeSunriseSunsetApprox,
  computeTopocentricPlanetarySnapshot,
  convertTropicalToSidereal,
  solveSolarTermBoundary
} from "../src/astronomy.js";

test("computeSolarLongitude returns a normalized longitude", () => {
  const longitude = computeSolarLongitude(2460825.5);

  assert.equal(longitude >= 0 && longitude < 360, true);
});

test("computeSolarLongitude includes apparent solar aberration and nutation corrections", () => {
  const longitude = computeSolarLongitude(2451545.0);

  assert.equal(Math.abs(longitude - 280.37330838998093) < 1e-9, true);
});

test("solveSolarTermBoundary converges near the requested solar term", () => {
  const result = solveSolarTermBoundary({
    targetLongitude: 60,
    startJulianDay: 2460790
  });

  assert.equal(Math.abs(result.longitude - 60) < 0.01, true);
  assert.equal(result.iterations > 0, true);
});

test("computeDynamicRefraction scales pressure and temperature by altitude", () => {
  const seaLevel = computeDynamicRefraction({ elevationMeters: 0 });
  const highAltitude = computeDynamicRefraction({ elevationMeters: 1500 });

  assert.equal(highAltitude.pressureMbar < seaLevel.pressureMbar, true);
  assert.equal(highAltitude.correctionArcMinutes < seaLevel.correctionArcMinutes, true);
});

test("sidereal conversion subtracts the Lahiri ayanamsa", () => {
  const julianDay = 2460825.5;
  const tropical = 120;
  const sidereal = convertTropicalToSidereal(tropical, julianDay);

  assert.equal(Math.abs(sidereal - (120 - computeLahiriAyanamsa(julianDay) + 360) % 360) < 0.001, true);
});

test("computeTopocentricPlanetarySnapshot returns classical bodies", () => {
  const observer = buildTopocentricObserver({
    julianDay: 2460825.5,
    latitude: 10.8231,
    longitude: 106.6297,
    altitudeMeters: 19
  });
  const snapshot = computeTopocentricPlanetarySnapshot(observer);

  assert.equal(snapshot.length, 7);
  assert.equal(snapshot[0].body, "sun");
});

test("computeSunriseSunsetApprox returns sunrise before sunset", () => {
  const observer = buildTopocentricObserver({
    julianDay: 2460825.5,
    latitude: 10.8231,
    longitude: 106.6297,
    altitudeMeters: 19
  });
  const result = computeSunriseSunsetApprox(observer);

  assert.equal(result.sunriseUnixMs < result.sunsetUnixMs, true);
});

test("buildTopocentricObserver rejects out-of-range coordinates", () => {
  assert.throws(
    () =>
      buildTopocentricObserver({
        julianDay: 2460825.5,
        latitude: 120,
        longitude: 106.6297,
        altitudeMeters: 19
      }),
    /latitude must be between -90 and 90 degrees/
  );

  assert.throws(
    () =>
      buildTopocentricObserver({
        julianDay: 2460825.5,
        latitude: 10.8231,
        longitude: 400,
        altitudeMeters: 19
      }),
    /longitude must be between -180 and 180 degrees/
  );
});
