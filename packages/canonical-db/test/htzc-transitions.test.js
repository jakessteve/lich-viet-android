import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveVietnamHistoricalTimezone
} from "../src/index.js";
import {
  computeAyanamsa,
  computeLahiriAyanamsa,
  convertTropicalToSidereal
} from "@omce/core-logic";

test("Round 4 - War Timezone Splits and Transitions", () => {
  // 1948 occupied vs resistance split
  const occupied1948 = resolveVietnamHistoricalTimezone({
    timestamp: Date.parse("1948-06-15T12:00:00Z"),
    controlZone: "occupied"
  });
  assert.equal(occupied1948.offsetHours, 8);
  assert.equal(occupied1948.ruleId, "1947-04-01-1955-07-01-occupied");

  const resistance1948 = resolveVietnamHistoricalTimezone({
    timestamp: Date.parse("1948-06-15T12:00:00Z"),
    controlZone: "resistance"
  });
  assert.equal(resistance1948.offsetHours, 7);
  assert.equal(resistance1948.ruleId, "1947-04-01-1955-07-01-resistance");

  // 1975 reunification transition boundary
  // 12 June 1975 22:59:59 UTC is under old South Vietnam offset 8
  const justBeforeReunification = resolveVietnamHistoricalTimezone({
    timestamp: Date.parse("1975-06-12T22:59:59Z")
  });
  assert.equal(justBeforeReunification.offsetHours, 8);
  assert.equal(justBeforeReunification.ruleId, "1960-01-01-1975-06-13");

  // 12 June 1975 23:00:00 UTC is unified under UTC+7
  const justAfterReunification = resolveVietnamHistoricalTimezone({
    timestamp: Date.parse("1975-06-12T23:00:00Z")
  });
  assert.equal(justAfterReunification.offsetHours, 7);
  assert.equal(justAfterReunification.ruleId, "1975-06-13-plus");
});

test("Round 4 - Custom Astrological Ayanamsa Calculations", () => {
  const julianDay = 2460825.5; // J2025 epoch approx

  const lahiriVal = computeLahiriAyanamsa(julianDay);
  const faganVal = computeAyanamsa(julianDay, "fagan-bradley");
  const ramanVal = computeAyanamsa(julianDay, "raman");
  const kpVal = computeAyanamsa(julianDay, "krishnamurti");

  // Verify that all returned values are valid numbers and have correct mathematical offsets
  assert.equal(Number.isFinite(lahiriVal), true);
  assert.equal(Number.isFinite(faganVal), true);
  assert.equal(Number.isFinite(ramanVal), true);
  assert.equal(Number.isFinite(kpVal), true);

  // Fagan-Bradley should be slightly larger than Lahiri (~0.9 degrees larger)
  assert.equal(faganVal > lahiriVal, true);
  assert.equal(Math.abs((faganVal - lahiriVal) - 0.903986) < 1e-4, true);

  // Raman should be slightly smaller than Lahiri (~1.45 degrees smaller)
  assert.equal(ramanVal < lahiriVal, true);
  assert.equal(Math.abs((lahiriVal - ramanVal) - 1.448834) < 1e-4, true);

  // KP should be slightly smaller than Lahiri (~0.061 degrees smaller)
  assert.equal(kpVal < lahiriVal, true);
  assert.equal(Math.abs((lahiriVal - kpVal) - 0.061389) < 1e-4, true);

  // Verify that sidereal conversions subtract the selected ayanamsa correctly
  const tropicalLong = 150.0;
  const siderealRaman = convertTropicalToSidereal(tropicalLong, julianDay, "raman");
  assert.equal(Math.abs(siderealRaman - (tropicalLong - ramanVal + 360) % 360) < 1e-6, true);
});
