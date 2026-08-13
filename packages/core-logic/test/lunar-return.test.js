import test from "node:test";
import assert from "node:assert/strict";

import { computeLunarReturn, computeSolarReturn } from "../src/western-enhanced.js";
import { computeTrueLunarPosition } from "../src/astronomy.js";

test("computeLunarReturn converges on the natal moon longitude", () => {
  const birthMoonLongitude = 123.456;
  const startJulianDay = 2461000.5;

  const result = computeLunarReturn(birthMoonLongitude, startJulianDay);

  assert.ok(result, "expected a lunar return to be found");
  assert.ok(result.lunarReturnJulianDay > startJulianDay);
  assert.ok(result.lunarReturnJulianDay <= startJulianDay + 31);
  const actual = computeTrueLunarPosition(result.lunarReturnJulianDay).longitude;
  assert.ok(Math.abs(actual - birthMoonLongitude) < 0.001, `expected moon at ${birthMoonLongitude}, got ${actual}`);
});

test("consecutive lunar returns are one sidereal month apart", () => {
  const first = computeLunarReturn(200, 2461000.5);
  const second = computeLunarReturn(200, first.lunarReturnJulianDay + 1);
  const gap = second.lunarReturnJulianDay - first.lunarReturnJulianDay;
  assert.ok(gap > 27.2 && gap < 27.5, `unexpected gap ${gap}`);
});

test("computeSolarReturn still finds the crossing within a year", () => {
  const result = computeSolarReturn(230, 2026, 2461000.5);
  assert.ok(result, "expected a solar return to be found");
  assert.ok(Math.abs(result.solarReturnLongitude - 230) < 0.01);
});
