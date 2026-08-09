import test from "node:test";
import assert from "node:assert/strict";

import {
  createPersonalizationOverlay,
  createTuViChartReadiness,
  createUserBirthProfileContract
} from "../src/index.js";

const TEST_INPUT = Object.freeze({
  timestamp: Date.UTC(2026, 5, 6, 3, 0, 0), // June 6, 2026 10:00 AM UTC+7
  latitude: 10.8231,
  longitude: 106.6297,
  altitudeMeters: 19,
  birthProfile: {
    profileId: "test-profile-1983",
    birthTimestamp: Date.UTC(1983, 10, 13, 11, 30, 0), // Nov 13, 1983 18:30 UTC+7
    latitude: 10.8231,
    longitude: 106.6297,
    altitudeMeters: 19,
    gender: "male"
  }
});

test("createUserBirthProfileContract sets all readiness engines to ready", () => {
  const contract = createUserBirthProfileContract(TEST_INPUT);

  assert.equal(contract.kind, "user-birth-profile-contract");
  assert.equal(contract.readiness.vietnameseLunarBirthConversion, "ready");
  assert.equal(contract.readiness.tuViBirthContext, "ready");
  assert.equal(contract.readiness.westernNatalContext, "ready");
  assert.equal(contract.readiness.vedicNatalContext, "ready");
});

test("createPersonalizationOverlay computes bounded Vedic Ashtakoot and Western synastry adjustments without overclaiming", () => {
  const overlay = createPersonalizationOverlay(TEST_INPUT);

  assert.equal(overlay.kind, "personalization-overlay");
  assert.deepEqual(overlay.missingSpecialistEngines, []);
  assert.equal(overlay.hardCapUntilComplete, 90);
  assert.ok(overlay.residualRisks.includes("tu_vi_personalized_day_is_branch_relation_proxy"));

  // Validate adjustments exist and have expected fields
  const tuViAdj = overlay.adjustments.find(a => a.id === "tu_vi_personalized_day");
  const vedicAdj = overlay.adjustments.find(a => a.id === "vedic_ashtakoot_personal");
  const westernAdj = overlay.adjustments.find(a => a.id === "western_transit_synastry");

  assert.ok(tuViAdj);
  assert.ok(vedicAdj);
  assert.ok(westernAdj);

  assert.equal(tuViAdj.status, "bounded_branch_relation_ready");
  assert.equal(vedicAdj.status, "bounded_8_koota_ready");
  assert.equal(westernAdj.status, "bounded_ptolemaic_aspect_ready");
  assert.equal(vedicAdj.detail.kind, "vedic-ashtakoot");
  assert.equal(vedicAdj.detail.status, "bounded_8_koota_ready");
  assert.equal(vedicAdj.detail.components.length, 8);
  assert.equal(vedicAdj.detail.maxScore, 36);
  assert.ok(vedicAdj.detail.limitations.length > 0);
  assert.equal(westernAdj.detail.kind, "western-synastry");
  assert.equal(westernAdj.detail.status, "bounded_ptolemaic_aspect_ready");
  assert.ok(westernAdj.detail.aspectCount >= 0);
  assert.ok(westernAdj.detail.limitations.length > 0);

  assert.ok(Number.isFinite(overlay.personalizedScore));
  assert.ok(overlay.personalizedScore >= 0 && overlay.personalizedScore <= 100);
});

test("createTuViChartReadiness returns bounded chart primitives including Cuc and palace ranges", () => {
  const readiness = createTuViChartReadiness(TEST_INPUT);

  assert.equal(readiness.kind, "tu-vi-chart-readiness");
  assert.equal(readiness.chart.status, "bounded_chart_primitives_ready");
  assert.equal(readiness.chart.unavailableEngines.length, 0);
  assert.equal(readiness.chart.starChartStatus, "v1_backed_star_chart_ready");
  assert.equal(readiness.chart.lunarBirthYearCanChi, "Quý Hợi");
  assert.equal(readiness.chart.canChi.year, "Quý Hợi");
  assert.equal(readiness.chart.menhCanIndex, 0);
  assert.equal(readiness.chart.cucNumber, 2);
  assert.ok(Number.isInteger(readiness.chart.cucNumber));
  assert.ok(readiness.chart.cucNumber >= 2 && readiness.chart.cucNumber <= 6);
  assert.ok(Number.isInteger(readiness.chart.menhPalaceIndex));
  assert.ok(readiness.chart.menhPalaceIndex >= 0 && readiness.chart.menhPalaceIndex <= 11);
  assert.ok(Number.isInteger(readiness.chart.thanPalaceIndex));
  assert.ok(readiness.chart.thanPalaceIndex >= 0 && readiness.chart.thanPalaceIndex <= 11);

  assert.equal(readiness.chart.trietPositions.length, 2);
  assert.equal(readiness.chart.tuanPositions.length, 2);
  assert.equal(readiness.chart.daiHanAgeRanges.length, 12);
  assert.ok(Number.isInteger(readiness.chart.tieuHanPalaceIndex));
  assert.equal(readiness.chart.nguyetHanPalaces.length, 12);
  assert.equal(readiness.chart.palaces.length, 12);
  assert.ok(readiness.chart.palaces.some((palace) => palace.chinhTinh.length > 0));
  assert.ok(readiness.chart.palaces.some((palace) => palace.phuTinh.length > 0 || palace.satTinh.length > 0));
  assert.equal(readiness.chart.lineageProfile.synthesisStatus, "bounded_lineage_profile_ready");
});
