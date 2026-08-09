import { normalizeVedicScore } from "./scoring.js";
import { assertFiniteNumber } from "./astronomy.js";

function assertObject(value, fieldName) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${fieldName} must be an object`);
  }
}


function assertEventProfile(profile) {
  assertObject(profile, "eventProfile");

  for (const fieldName of [
    "event_id",
    "category",
    "accuracy_tier",
    "source_ref"
  ]) {
    if (typeof profile[fieldName] !== "string" || profile[fieldName].trim() === "") {
      throw new TypeError(`eventProfile.${fieldName} must be a non-empty string`);
    }
  }

  for (const fieldName of [
    "source_coverage_percent",
    "generic_weight",
    "cross_system_weight",
    "specialist_weight"
  ]) {
    assertFiniteNumber(profile[fieldName], `eventProfile.${fieldName}`);
  }
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}

function clampedPercentRounded(value) {
  return Number(clampPercent(value).toFixed(2));
}

function sourceConfidenceBonus(sourceRef) {
  if (sourceRef === "hkbfs_yiji_puzhu") {
    return 4;
  }

  if (sourceRef === "hkbfs_shilei_zongji") {
    return 2;
  }

  if (sourceRef === "lich_viet_v1_reference") {
    return -4;
  }

  return 0;
}

function categoryAdjustment(category) {
  const adjustments = {
    agri: 1,
    build: -1,
    career: 1.5,
    craft: 0.5,
    family: 0,
    funeral: -2,
    govern: 1,
    life: 0.5,
    market: 1.5,
    medical: -1,
    repair: 0.5,
    rite: 1,
    social: 1,
    travel: 0.5
  };

  return adjustments[category] ?? 0;
}

function computeGenericHkbfsScore({ baseMetrics, eventProfile, ruleSignals }) {
  const kyMonBonus =
    (ruleSignals?.kyMonState?.minuteSwitchActive ? 3 : 0) +
    (ruleSignals?.kyMonState?.isPostBoundary ? 1 : -1);
  const monthlyGeneralBonus = ((ruleSignals?.monthlyGeneral?.weightBonus ?? 1) - 1) * 8;
  const solarTermPenalty = (ruleSignals?.solarTermDistance ?? 0) * 1.5;

  return clampedPercentRounded(
    baseMetrics.easternScore +
      sourceConfidenceBonus(eventProfile.source_ref) +
      categoryAdjustment(eventProfile.category) +
      kyMonBonus +
      monthlyGeneralBonus -
      solarTermPenalty
  );
}

function computeCrossSystemScore(baseMetrics) {
  const vedicPercent = normalizeVedicScore(baseMetrics.vedicScore, 36);

  return clampedPercentRounded(baseMetrics.westernScore * 0.55 + vedicPercent * 0.45);
}

function computeSpecialistScore(eventProfile) {
  if (eventProfile.specialist_weight <= 0) {
    return {
      score: 100,
      missing: false
    };
  }

  if (eventProfile.accuracy_tier === "bounded_specialist_ready") {
    return {
      score: eventProfile.source_coverage_percent,
      missing: false
    };
  }

  return {
    score: 50,
    missing: true
  };
}

export function calculateDungSuEventScore({
  eventProfile,
  baseMetrics,
  ruleSignals = {}
}) {
  assertEventProfile(eventProfile);
  assertObject(baseMetrics, "baseMetrics");

  for (const fieldName of ["totalScore", "easternScore", "westernScore", "vedicScore"]) {
    assertFiniteNumber(baseMetrics[fieldName], `baseMetrics.${fieldName}`);
  }

  const sourceRefs = [eventProfile.source_ref];
  if (eventProfile.specialist_ref) {
    sourceRefs.push(eventProfile.specialist_ref);
  }

  if (baseMetrics.isShortCircuited) {
    return {
      eventId: eventProfile.event_id,
      auspiciousnessPercent: 0,
      accuracyTier: eventProfile.accuracy_tier,
      sourceCoveragePercent: eventProfile.source_coverage_percent,
      componentScores: {
        genericHkbfsScore: 0,
        crossSystemScore: 0,
        specialistScore: 0,
        genericWeight: eventProfile.generic_weight,
        crossSystemWeight: eventProfile.cross_system_weight,
        specialistWeight: eventProfile.specialist_weight
      },
      blockingReasons: [baseMetrics.reason ?? "short_circuited"],
      sourceRefs
    };
  }

  const genericHkbfsScore = computeGenericHkbfsScore({
    baseMetrics,
    eventProfile,
    ruleSignals
  });
  const crossSystemScore = computeCrossSystemScore(baseMetrics);
  const specialist = computeSpecialistScore(eventProfile);
  const rawPercent =
    genericHkbfsScore * eventProfile.generic_weight +
    crossSystemScore * eventProfile.cross_system_weight +
    specialist.score * eventProfile.specialist_weight;
  const blockingReasons = [];
  let finalPercent = rawPercent;

  if (specialist.missing) {
    blockingReasons.push("missing_specialist_module");
    if (Number.isFinite(eventProfile.hard_cap_missing_specialist)) {
      finalPercent = Math.min(finalPercent, eventProfile.hard_cap_missing_specialist);
    }
  }

  // Synergy Bonus for QMDJ and Vedic
  if (ruleSignals.qmdjVerdict === "cat" && ruleSignals.vedicAuspicious) {
    finalPercent = Math.min(100, finalPercent * 1.08); // 8% non-linear multiplier
  }
  // Mai Hoa directional resolution bonus
  if (ruleSignals.maiHoaAuspicious) {
    finalPercent = Math.min(100, finalPercent + 5);
  }

  return {
    eventId: eventProfile.event_id,
    auspiciousnessPercent: clampedPercentRounded(finalPercent),
    accuracyTier: eventProfile.accuracy_tier,
    sourceCoveragePercent: eventProfile.source_coverage_percent,
    componentScores: {
      genericHkbfsScore,
      crossSystemScore,
      specialistScore: clampedPercentRounded(specialist.score),
      genericWeight: eventProfile.generic_weight,
      crossSystemWeight: eventProfile.cross_system_weight,
      specialistWeight: eventProfile.specialist_weight
    },
    blockingReasons,
    sourceRefs
  };
}
