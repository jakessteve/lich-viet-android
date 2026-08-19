import test from "node:test";
import assert from "node:assert/strict";

import {
  createDungSuCatalog,
  createDungSuScoreDetail,
  createFrontendErrorCatalog,
  createFrontendReadinessBundle,
  createMaiHoaReading,
  createPanchangMuhurat,
  createTamThucReading,
  createTuViChartReadiness,
  createWesternChart
} from "../src/index.js";

const FIXTURE_INPUT = Object.freeze({
  timestamp: Date.UTC(2026, 4, 31, 5, 0, 0),
  latitude: 10.8231,
  longitude: 106.6297,
  altitudeMeters: 19,
  eventId: "ds_jia_qu",
  birthProfile: {
    profileId: "frontend-fixture",
    birthTimestamp: Date.UTC(1992, 7, 12, 2, 30, 0),
    latitude: 21.0278,
    longitude: 105.8342,
    altitudeMeters: 12,
    gender: "female"
  },
  personA: {
    profileId: "person-a",
    birthTimestamp: Date.UTC(1990, 2, 10, 6, 0, 0),
    latitude: 21.0278,
    longitude: 105.8342,
    altitudeMeters: 12,
    gender: "male"
  },
  personB: {
    profileId: "person-b",
    birthTimestamp: Date.UTC(1992, 7, 12, 2, 30, 0),
    latitude: 10.8231,
    longitude: 106.6297,
    altitudeMeters: 19,
    gender: "female"
  }
});

test("frontend readiness bundle exposes all backend surfaces needed by the future UI", () => {
  const bundle = createFrontendReadinessBundle(FIXTURE_INPUT);

  assert.equal(bundle.kind, "frontend-readiness-bundle");
  assert.equal(bundle.generatedAt, new Date(FIXTURE_INPUT.timestamp).toISOString());
  assert.equal(bundle.calendarDay.kind, "calendar-day-detail");
  assert.equal(bundle.dungSuCatalog.kind, "dung-su-catalog");
  assert.equal(bundle.dungSuScoreDetail.kind, "dung-su-score-detail");
  assert.equal(bundle.userBirthProfile.kind, "user-birth-profile-contract");
  assert.equal(bundle.personalizationOverlay.kind, "personalization-overlay");
  assert.equal(bundle.tuViChart.kind, "tu-vi-chart-readiness");
  assert.equal(bundle.westernChart.kind, "western-chart");
  assert.equal(bundle.vedicKundli.kind, "vedic-kundli");
  assert.equal(bundle.panchangMuhurat.kind, "panchang-muhurat");
  assert.equal(bundle.synastryReadiness.kind, "synastry-readiness");
  assert.equal(bundle.maiHoaReading.kind, "mai-hoa-reading");
  assert.equal(bundle.tamThucReading.kind, "tam-thuc-reading");
  assert.equal(bundle.errorCatalog.kind, "frontend-error-catalog");
  assert.ok(bundle.sourceCatalog.sources.length > 0);
  assert.equal(bundle.westernChart.date.unixMs, FIXTURE_INPUT.birthProfile.birthTimestamp);
  assert.equal(bundle.vedicKundli.date.unixMs, FIXTURE_INPUT.birthProfile.birthTimestamp);
  assert.equal(bundle.westernChart.location.latitude, FIXTURE_INPUT.birthProfile.latitude);
  assert.equal(bundle.vedicKundli.location.longitude, FIXTURE_INPUT.birthProfile.longitude);
  assert.equal(bundle.maiHoaReading.natalContext.status, "natal_context_applied");
  assert.equal(bundle.tamThucReading.natalContext.profileId, FIXTURE_INPUT.birthProfile.profileId);
  assert.equal(bundle.synastryReadiness.status, "bounded_specialist_ready");
  assert.equal(bundle.synastryReadiness.hardCapUntilComplete, 85);
  assert.deepEqual(bundle.synastryReadiness.blockingReasons, []);
  assert.ok(bundle.synastryReadiness.residualRisks.includes("tu_vi_synastry_is_branch_palace_proxy_not_full_sao_pair_synthesis"));
  assert.equal(bundle.synastryReadiness.tuViSynastry.status, "bounded_branch_palace_ready");
  assert.equal(bundle.synastryReadiness.vedicAshtakoot.components.length, 8);
  assert.equal(bundle.synastryReadiness.vedicAshtakoot.status, "bounded_8_koota_ready");
  assert.equal(bundle.synastryReadiness.westernSynastry.kind, "western-synastry");
  assert.equal(bundle.synastryReadiness.westernSynastry.status, "bounded_ptolemaic_aspect_ready");
});

test("Dung Su catalog and score detail carry canonical event coverage and bounded specialist scores", () => {
  const catalog = createDungSuCatalog();
  const allEvents = catalog.categories.flatMap((category) => category.events);
  const marriageIntent = catalog.intents.find((intent) => intent.intentId === "chon-ngay-cuoi");
  const scoreDetail = createDungSuScoreDetail(FIXTURE_INPUT);

  assert.ok(allEvents.length >= 90);
  assert.ok(marriageIntent.eventIds.includes("ds_jia_qu"));
  assert.equal(scoreDetail.eventId, "ds_jia_qu");
  assert.equal(scoreDetail.score.accuracyTier, "bounded_specialist_ready");
  assert.ok(scoreDetail.score.auspiciousnessPercent <= 100);
  assert.deepEqual(scoreDetail.score.blockingReasons, []);
  assert.ok(scoreDetail.score.sourceRefs.includes("synastry_tuvi_western_vedic"));
  assert.equal(scoreDetail.bestHours.length, 3);
});

test("Western and Indian astrology surfaces expose bounded primitives without claiming specialist completion", () => {
  const westernChart = createWesternChart(FIXTURE_INPUT);
  const panchangMuhurat = createPanchangMuhurat(FIXTURE_INPUT);

  assert.ok(westernChart.planets.length >= 5);
  assert.equal(westernChart.houses.cusps.length, 12);
  assert.equal(westernChart.interpretationStatus, "enhanced_full_chart_ready");
  assert.ok(panchangMuhurat.panchang.tithi.index >= 1);
  assert.ok(panchangMuhurat.panchang.nakshatra.index >= 1);
  assert.ok(panchangMuhurat.rahuKaal.endUnixMs > panchangMuhurat.rahuKaal.startUnixMs);
});

test("Mai Hoa, Tam Thuc, Tu Vi, and error contracts expose bounded specialist readiness", () => {
  const maiHoa = createMaiHoaReading(FIXTURE_INPUT);
  const tamThuc = createTamThucReading(FIXTURE_INPUT);
  const tuVi = createTuViChartReadiness(FIXTURE_INPUT);
  const errorCatalog = createFrontendErrorCatalog();

  assert.equal(maiHoa.status, "specialist_layer_ready");
  assert.ok(maiHoa.mainHexagram.id >= 1 && maiHoa.mainHexagram.id <= 64);
  assert.ok(maiHoa.residualRisks.includes("lineage_specific_trigram_strength_and_seasonal_yong_shen_weighting_not_claimed"));
  assert.deepEqual(maiHoa.sourceRefs, ["mai_hoa_dich_so"]);
  assert.equal(maiHoa.natalContext.status, "natal_context_applied");
  assert.equal(tamThuc.methods.qmdj.status, "specialist_layer_ready");
  assert.equal(tamThuc.methods.thaiAt.status, "specialist_layer_ready");
  assert.ok(tamThuc.residualRisks.includes("qmdj_uses_bounded_palace_calculation"));
  assert.equal(tamThuc.natalContext.status, "natal_context_applied");
  assert.equal(tuVi.chart.status, "bounded_chart_primitives_ready");
  assert.equal(tuVi.chart.unavailableEngines.length, 0);
  assert.equal(tuVi.chart.palaces.length, 12);
  assert.equal(tuVi.chart.starChartStatus, "v1_backed_star_chart_ready");
  assert.equal(tuVi.chart.lineageProfile.synthesisStatus, "bounded_lineage_profile_ready");
  assert.ok(tuVi.calculationGuards.includes("gender_direction_rules_must_match_canonical_tu_vi"));
  assert.ok(errorCatalog.errors.some((error) => error.code === "specialist_module_unavailable"));
});
