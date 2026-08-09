import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveDaiLucNhamMonthlyGeneral,
  deriveKyMonChietBoState,
  evaluateElectionCandidate,
  evaluateVoidOfCourseGuard,
  resolveStrictModeOverrides,
  unixMsToJulianDay
} from "../src/index.js";

test("resolveStrictModeOverrides blocks sensitive star overrides in strict mode", () => {
  const result = resolveStrictModeOverrides({
    strictMode: true,
    overrides: [
      {
        school_id: "tu_vi",
        entity_id: "tu_hoa_canh",
        custom_weight: 1.1
      },
      {
        school_id: "ky_mon",
        entity_id: "void_of_course_guard",
        custom_weight: 0.95
      }
    ]
  });

  assert.equal(result.allowedOverrides.length, 1);
  assert.equal(result.blockedOverrides.length, 1);
  assert.equal(result.blockedOverrides[0].reason, "strict_mode_locked_entity");
});

test("deriveKyMonChietBoState flips phase immediately at the boundary minute", () => {
  const boundary = Date.parse("2026-05-30T08:15:00Z");
  const before = deriveKyMonChietBoState({
    timestamp: boundary - 60 * 1000,
    solarTermBoundaryTimestamp: boundary
  });
  const atBoundary = deriveKyMonChietBoState({
    timestamp: boundary,
    solarTermBoundaryTimestamp: boundary
  });

  assert.equal(before.phase, "previous_cycle");
  assert.equal(atBoundary.phase, "new_cycle");
  assert.equal(atBoundary.minuteSwitchActive, true);
});

test("deriveDaiLucNhamMonthlyGeneral maps solar longitude into a 12-branch cycle", () => {
  const result = deriveDaiLucNhamMonthlyGeneral({
    solarLongitude: 95
  });

  assert.equal(result.monthIndex, 3);
  assert.equal(result.branch, "Mui");
});

test("evaluateVoidOfCourseGuard detects when the Moon has no major aspect before leaving the sign", () => {
  const guarded = evaluateVoidOfCourseGuard({
    planetarySnapshot: [
      { body: "moon", tropicalLongitude: 25, siderealLongitude: 12 },
      { body: "sun", tropicalLongitude: 190, siderealLongitude: 177 },
      { body: "mars", tropicalLongitude: 249, siderealLongitude: 236 }
    ]
  });
  const viable = evaluateVoidOfCourseGuard({
    planetarySnapshot: [
      { body: "moon", tropicalLongitude: 15, siderealLongitude: 2 },
      { body: "sun", tropicalLongitude: 80, siderealLongitude: 67 },
      { body: "mars", tropicalLongitude: 249, siderealLongitude: 236 }
    ]
  });

  assert.equal(guarded.isVoidOfCourse, true);
  assert.equal(viable.isVoidOfCourse, false);
  assert.equal(viable.closestAspect, 60);
});

test("evaluateElectionCandidate short-circuits a void-of-course candidate", () => {
  const timestamp = Date.parse("2026-05-30T00:00:00Z");
  const result = evaluateElectionCandidate({
    timestamp,
    astronomy: {
      timezone: {
        ruleId: "test",
        offsetHours: 7,
        ambiguous: false,
        shiftedTimestamp: timestamp + 7 * 60 * 60 * 1000
      },
      solarTerm: {
        targetLongitude: 90,
        julianDay: unixMsToJulianDay(timestamp),
        longitude: 90,
        iterations: 4
      },
      sunriseSunset: {
        sunriseUnixMs: timestamp + 6 * 60 * 60 * 1000,
        sunsetUnixMs: timestamp + 18 * 60 * 60 * 1000,
        refraction: {
          pressureMbar: 1013.25,
          temperatureC: 15,
          correctionArcMinutes: 34,
          correctionDegrees: 34 / 60
        }
      },
      planetarySnapshot: [
        { body: "sun", tropicalLongitude: 190, siderealLongitude: 166 },
        { body: "moon", tropicalLongitude: 25, siderealLongitude: 1 },
        { body: "mars", tropicalLongitude: 249, siderealLongitude: 225 }
      ]
    }
  });

  assert.equal(result.metrics.isShortCircuited, true);
  assert.equal(result.metrics.reason, "void_of_course_guard");
});
