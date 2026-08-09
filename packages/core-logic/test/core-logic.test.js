import test from "node:test";
import assert from "node:assert/strict";

import {
  applyTimelineGuardrails,
  calculateDungSuEventScore,
  computeWeightedScore,
  createCoarseWindows,
  estimateTimelineTransferBytes,
  expandFineWindow,
  isLatitudeGuardTriggered,
  julianDayToUnixMs,
  normalizeVedicScore,
  unixMsToJulianDay,
  evaluateElectionCandidate
} from "../src/index.js";

test("normalizeVedicScore converts the 36-point scale to 100", () => {
  assert.equal(normalizeVedicScore(18), 50);
});

test("computeWeightedScore follows the TOPSIS-style distance-to-ideal weighting", () => {
  const metrics = computeWeightedScore({
    easternScore: 80,
    westernScore: 60,
    vedicScore: 18
  });

  assert.equal(metrics.totalScore, 66.8);
  assert.equal(metrics.isShortCircuited, false);
});

test("calculateDungSuEventScore returns complete event percentages without specialist caps", () => {
  const score = calculateDungSuEventScore({
    eventProfile: {
      event_id: "ds_kai_shi",
      category: "market",
      accuracy_tier: "complete",
      source_coverage_percent: 100,
      generic_weight: 0.7,
      cross_system_weight: 0.3,
      specialist_weight: 0,
      hard_cap_missing_specialist: null,
      source_ref: "hkbfs_yiji_puzhu",
      specialist_ref: null
    },
    baseMetrics: {
      totalScore: 80,
      easternScore: 84,
      westernScore: 76,
      vedicScore: 28,
      isShortCircuited: false
    },
    ruleSignals: {
      kyMonState: {
        minuteSwitchActive: true,
        isPostBoundary: true
      },
      monthlyGeneral: {
        weightBonus: 1.05
      },
      solarTermDistance: 2
    }
  });

  assert.equal(score.eventId, "ds_kai_shi");
  assert.equal(score.accuracyTier, "complete");
  assert.equal(score.sourceCoveragePercent, 100);
  assert.equal(score.blockingReasons.length, 0);
  assert.equal(score.auspiciousnessPercent > 0, true);
  assert.equal(score.auspiciousnessPercent <= 100, true);
});

test("calculateDungSuEventScore scores bounded specialist domains without missing-module caps", () => {
  const score = calculateDungSuEventScore({
    eventProfile: {
      event_id: "ds_jia_qu",
      category: "family",
      accuracy_tier: "bounded_specialist_ready",
      source_coverage_percent: 60,
      generic_weight: 0.3,
      cross_system_weight: 0.3,
      specialist_weight: 0.4,
      hard_cap_missing_specialist: null,
      source_ref: "hkbfs_yiji_puzhu",
      specialist_ref: "synastry_tuvi_western_vedic"
    },
    baseMetrics: {
      totalScore: 99,
      easternScore: 99,
      westernScore: 99,
      vedicScore: 36,
      isShortCircuited: false
    }
  });

  assert.equal(score.accuracyTier, "bounded_specialist_ready");
  assert.equal(score.componentScores.specialistScore, 60);
  assert.equal(score.auspiciousnessPercent <= 100, true);
  assert.deepEqual(score.blockingReasons, []);
});

test("calculateDungSuEventScore keeps Dụng Sự scores at zero for short-circuited candidates", () => {
  const score = calculateDungSuEventScore({
    eventProfile: {
      event_id: "ds_an_zang",
      category: "funeral",
      accuracy_tier: "specialist_required",
      source_coverage_percent: 55,
      generic_weight: 0.35,
      cross_system_weight: 0.15,
      specialist_weight: 0.5,
      hard_cap_missing_specialist: 70,
      source_ref: "hkbfs_yiji_puzhu",
      specialist_ref: "zangshu_burial_form_school"
    },
    baseMetrics: {
      totalScore: 0,
      easternScore: 0,
      westernScore: 0,
      vedicScore: 0,
      isShortCircuited: true,
      reason: "void_of_course_guard"
    }
  });

  assert.equal(score.auspiciousnessPercent, 0);
  assert.deepEqual(score.blockingReasons, ["void_of_course_guard"]);
});

test("createCoarseWindows builds 30-minute windows", () => {
  const windows = createCoarseWindows({
    startTimestamp: 0,
    endTimestamp: 60 * 60 * 1000,
    stepMinutes: 30
  });

  assert.equal(windows.length, 2);
  assert.deepEqual(windows[0], {
    timestampStart: 0,
    timestampEnd: 30 * 60 * 1000
  });
});

test("expandFineWindow creates one-minute candidate timestamps", () => {
  const timestamps = expandFineWindow({
    centerTimestamp: 0,
    radiusMinutes: 1,
    stepMinutes: 1
  });

  assert.deepEqual(timestamps, [-60000, 0, 60000]);
});

test("createCoarseWindows rejects non-positive step sizes", () => {
  assert.throws(
    () =>
      createCoarseWindows({
        startTimestamp: 0,
        endTimestamp: 60 * 60 * 1000,
        stepMinutes: 0
      }),
    /stepMinutes must be a positive finite number/
  );
});

test("expandFineWindow rejects non-positive step sizes", () => {
  assert.throws(
    () =>
      expandFineWindow({
        centerTimestamp: 0,
        radiusMinutes: 1,
        stepMinutes: 0
      }),
    /stepMinutes must be a positive finite number/
  );
});

test("latitude guard triggers at extreme latitudes", () => {
  assert.equal(isLatitudeGuardTriggered(60), true);
  assert.equal(isLatitudeGuardTriggered(59.99), false);
});

test("timeline guardrails downsample entries and estimate transfer bytes", () => {
  const guarded = applyTimelineGuardrails(
    Array.from({ length: 9 }, (_, index) => ({ index })),
    {
      maxEntries: 4,
      maxTransferBytes: 1000
    }
  );

  assert.equal(guarded.diagnostics.timelineDownsampled, true);
  assert.equal(guarded.diagnostics.originalTimelineCount, 9);
  assert.equal(guarded.diagnostics.finalTimelineCount, 4);
  assert.deepEqual(
    guarded.entries.map((entry) => entry.index),
    [0, 3, 5, 8]
  );
  assert.equal(guarded.diagnostics.estimatedTransferBytes, estimateTimelineTransferBytes(4));
});

test("timeline guardrails use timeline-aware downsampling when timestamps are available", () => {
  const guarded = applyTimelineGuardrails(
    [
      { timestampStart: 0, timestampEnd: 1, metrics: { totalScore: 0 } },
      { timestampStart: 1, timestampEnd: 2, metrics: { totalScore: 10 } },
      { timestampStart: 2, timestampEnd: 3, metrics: { totalScore: 100 } },
      { timestampStart: 3, timestampEnd: 4, metrics: { totalScore: 10 } },
      { timestampStart: 4, timestampEnd: 5, metrics: { totalScore: 0 } },
      { timestampStart: 5, timestampEnd: 6, metrics: { totalScore: 0 } }
    ],
    {
      maxEntries: 3
    }
  );

  assert.equal(guarded.entries.length, 3);
  assert.deepEqual(
    guarded.entries.map((entry) => entry.timestampStart),
    [0, 2, 5]
  );
});

test("timeline guardrails short-circuit when transfer budget is too small", () => {
  const guarded = applyTimelineGuardrails(
    [{ index: 0 }, { index: 1 }],
    {
      maxEntries: 2,
      maxTransferBytes: 10
    }
  );

  assert.equal(guarded.entries.length, 0);
  assert.equal(guarded.diagnostics.shortCircuited, true);
  assert.equal(guarded.diagnostics.reason, "memory_guard_budget_exceeded");
});

test("julian day conversions round-trip through unix milliseconds", () => {
  const unixMs = Date.parse("2026-05-30T00:00:00Z");
  const julianDay = unixMsToJulianDay(unixMs);

  assert.equal(julianDayToUnixMs(julianDay), unixMs);
});

test("evaluateElectionCandidate applies accurate Panchanga and Western dignity scoring", () => {
  const deterministicAstronomyFixture = {
    planetarySnapshot: [
      { body: "Sun", tropicalLongitude: 0, siderealLongitude: 0 },
      { body: "Moon", tropicalLongitude: 90, siderealLongitude: 90 } // 90 degrees forward (Waxing, Cancer)
    ],
    timezone: { offsetHours: 7 },
    solarTerm: { julianDay: 2461000 },
    sunriseSunset: { sunriseUnixMs: 0, sunsetUnixMs: 12 * 3600000 }
  };

  const result = evaluateElectionCandidate({
    timestamp: 0,
    astronomy: deterministicAstronomyFixture
  });

  // Tithi = floor(90 / 12) + 1 = 8.
  assert.equal(result.ruleSignals.tithi, 8);
  // Moon Tropical = 90 -> Math.floor(90/30) = 3 (Cancer).
  assert.equal(result.ruleSignals.moonTropicalSign, 3);
});
