import { computeWeightedScore } from "./scoring.js";
import { julianDayToUnixMs, getTransitDayBranchIndex } from "./time.js";
import { getBranchRelationship } from "./tuvi.js";
import { calculateTarabala } from "./vedic.js";
import { calculateWesternTransitAspects } from "./western-enhanced.js";
import { evaluateTamThucScore } from "./tam-thuc.js";
import { calculateTraditionalMaiHoa } from "./mai-hoa.js";
import { getLunarDate } from "./calendar.js";
import { CHI } from "./utils.js";
import {
  deriveDaiLucNhamMonthlyGeneral,
  deriveKyMonChietBoState,
  evaluateVoidOfCourseGuard
} from "./rules.js";
import { normalizeDegrees } from "./astronomy.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function softClamp(value, max) {
  if (value <= max - 5) {
    return Math.max(0, value);
  }
  const threshold = max - 5;
  const excess = value - threshold;
  const softExcess = (5 * excess) / (50 + excess);
  return threshold + softExcess;
}

function average(values) {
  if (!values.length) {
    return 1;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getPlanet(snapshot, body) {
  const normalizedBody = body.toLowerCase();
  return snapshot.find((entry) => entry.body.toLowerCase() === normalizedBody);
}

function angularDistance(a, b) {
  const delta = Math.abs(normalizeDegrees(a) - normalizeDegrees(b));
  return Math.min(delta, 360 - delta);
}

function deriveOverrideWeightModifier(appliedMapping) {
  if (!Array.isArray(appliedMapping) || appliedMapping.length === 0) {
    return 1;
  }

  return average(
    appliedMapping
      .map((row) => row.weight_modifier)
      .filter((value) => Number.isFinite(value))
  );
}

export function evaluateElectionCandidate({
  timestamp,
  astronomy,
  latitudeGuardTriggered = false,
  overrideMapping = [],
  strictMode = true,
  unifiedBirthProfile = null
}) {
  if (!Number.isFinite(timestamp)) {
    throw new TypeError("timestamp must be a finite number");
  }

  if (!astronomy || !Array.isArray(astronomy.planetarySnapshot)) {
    throw new TypeError("astronomy.planetarySnapshot must be available");
  }

  const sun = getPlanet(astronomy.planetarySnapshot, "Sun");
  const moon = getPlanet(astronomy.planetarySnapshot, "Moon");

  if (!sun || !moon) {
    throw new RangeError("astronomy.planetarySnapshot must include Sun and Moon");
  }

  const timezoneOffsetHours = astronomy.timezone.offsetHours;
  const solarTermBoundaryTimestamp = julianDayToUnixMs(astronomy.solarTerm.julianDay);
  const kyMonState = deriveKyMonChietBoState({
    timestamp,
    solarTermBoundaryTimestamp,
    timezoneOffsetHours
  });
  const monthlyGeneral = deriveDaiLucNhamMonthlyGeneral({
    solarLongitude: sun.tropicalLongitude
  });
  const voidOfCourse = evaluateVoidOfCourseGuard({
    planetarySnapshot: astronomy.planetarySnapshot
  });
  const overrideWeightModifier = deriveOverrideWeightModifier(overrideMapping);
  const nearestSolarTerm = Math.round(sun.tropicalLongitude / 15) * 15;
  const solarTermDistance = angularDistance(sun.tropicalLongitude, nearestSolarTerm);
  const sunriseDistanceMinutes =
    Math.min(
      Math.abs(timestamp - astronomy.sunriseSunset.sunriseUnixMs),
      Math.abs(timestamp - astronomy.sunriseSunset.sunsetUnixMs)
    ) / (60 * 1000);
  const forwardSiderealPhase = normalizeDegrees(moon.siderealLongitude - sun.siderealLongitude);
  const forwardTropicalPhase = normalizeDegrees(moon.tropicalLongitude - sun.tropicalLongitude);

  const tithi = Math.floor(forwardTropicalPhase / 12) + 1;
  const karana = Math.floor(forwardSiderealPhase / 6) + 1;
  const yoga = Math.floor(normalizeDegrees(moon.siderealLongitude + sun.siderealLongitude) / (360 / 27)) + 1;
  
  const moonTropicalSign = Math.floor(moon.tropicalLongitude / 30);
  let synastryBonusEastern = 0;
  if (unifiedBirthProfile && unifiedBirthProfile.tuViContext) {
    const transitDayBranch = getTransitDayBranchIndex(timestamp);
    const natalYearBranch = unifiedBirthProfile.tuViContext.yearBranchIndex; 

    if (unifiedBirthProfile.tuViContext.yearBranchIndex !== undefined) {
      const relation = getBranchRelationship(unifiedBirthProfile.tuViContext.yearBranchIndex, transitDayBranch);
      if (relation === "hop_tam") synastryBonusEastern += 6;
      else if (relation === "hop_luc") synastryBonusEastern += 4;
      else if (relation === "xung") synastryBonusEastern -= 6;
      else if (relation === "hinh") synastryBonusEastern -= 4;
      else if (relation === "pha") synastryBonusEastern -= 3;
      else if (relation === "tuyet") synastryBonusEastern -= 5;
      else if (relation === "hai") synastryBonusEastern -= 3;
      else if (relation === "tu_hinh") synastryBonusEastern -= 4;
    }
  }

  const rawEastern =
    86 -
    solarTermDistance * 3.2 +
    monthlyGeneral.weightBonus * 6 +
    (kyMonState.minuteSwitchActive ? 4 : 0) +
    (kyMonState.isPostBoundary ? 1.5 : -1.5) +
    (strictMode ? 0.5 : 0) +
    synastryBonusEastern +
    (overrideWeightModifier - 1) * 8;
  const easternScore = Number(softClamp(rawEastern, 100).toFixed(2));


  let dignityBonus = 0;
  if (moonTropicalSign === 3) dignityBonus = 4; // Cancer (Domicile)
  else if (moonTropicalSign === 1) dignityBonus = 3; // Taurus (Exaltation)
  else if (moonTropicalSign === 9) dignityBonus = -4; // Capricorn (Detriment)
  else if (moonTropicalSign === 7) dignityBonus = -3; // Scorpio (Fall)

  const isWaxing = forwardTropicalPhase > 0 && forwardTropicalPhase < 180;
  const phaseBonus = isWaxing ? 2 : -2;

  let synastryBonusWestern = 0;
  if (unifiedBirthProfile && unifiedBirthProfile.westernContext && Array.isArray(unifiedBirthProfile.westernContext.planets)) {
    synastryBonusWestern = calculateWesternTransitAspects(
      unifiedBirthProfile.westernContext.planets,
      astronomy.planetarySnapshot
    );
  }

  const rawWestern =
    82 +
    dignityBonus +
    phaseBonus -
    (voidOfCourse.closestAspectDelta ?? voidOfCourse.remainingDegreesInSign) * 12 -
    (latitudeGuardTriggered ? 6 : 0) + 
    synastryBonusWestern;
  const westernScore = Number(softClamp(rawWestern, 100).toFixed(2));

  let panchangaBonus = 0;
  if ([4, 9, 14, 19, 24, 29].includes(tithi)) panchangaBonus -= 4; // Rikta Tithis
  else if (tithi === 30) panchangaBonus -= 6; // Amavasya
  else if (tithi === 15) panchangaBonus += 4; // Purnima

  if (yoga === 17 || yoga === 27) panchangaBonus -= 5; // Vyatipata, Vaidhriti

  const isVishti = [8, 15, 22, 29, 36, 43, 50, 57].includes(karana);
  if (isVishti) panchangaBonus -= 4; // Bhadra Karana

  let synastryBonusVedic = 0;
  if (unifiedBirthProfile && unifiedBirthProfile.vedicContext && unifiedBirthProfile.vedicContext.moonNakshatraIndex !== undefined) {
    const transitNakshatraIndex = Math.floor(normalizeDegrees(moon.siderealLongitude) / (360 / 27));
    const { scoreDelta } = calculateTarabala(unifiedBirthProfile.vedicContext.moonNakshatraIndex, transitNakshatraIndex);
    synastryBonusVedic = scoreDelta;
  }

  const rawVedic =
    28 +
    panchangaBonus -
    sunriseDistanceMinutes / 32 +
    synastryBonusVedic +
    (overrideWeightModifier - 1) * 3;
  const vedicScore = Math.round(softClamp(rawVedic, 36));
  const metrics = computeWeightedScore(
    voidOfCourse.isVoidOfCourse
      ? {
          easternScore,
          westernScore: 0,
          vedicScore,
          isShortCircuited: true,
          reason: "void_of_course_guard"
        }
      : {
          easternScore,
          westernScore,
          vedicScore
        }
  );

    const lunarDate = getLunarDate(new Date(timestamp), timezoneOffsetHours);
    const localHour = new Date(timestamp + timezoneOffsetHours * 3600000).getUTCHours();
    const hourBranchIndex = Math.floor(((localHour + 1) % 24) / 2);
    const monthBranchIndex = (lunarDate.month + 1) % 12; // Month 1 starts from Dan (index 2)
    const yearBranchIndex = ((lunarDate.year - 4) % 12 + 12) % 12;
    const transitDayBranch = getTransitDayBranchIndex(timestamp);

    const qmdjScore = evaluateTamThucScore({
      solarTermLongitude: nearestSolarTerm,
      dayChi: CHI[transitDayBranch],
      hourChi: CHI[hourBranchIndex],
      monthChi: CHI[monthBranchIndex]
    });

    const maiHoaResult = calculateTraditionalMaiHoa({
      yearChi: CHI[yearBranchIndex],
      lunarMonth: lunarDate.month,
      lunarDay: lunarDate.day,
      hourChi: CHI[hourBranchIndex]
    });
    
    // In Mai Hoa, if Use (Dụng) generates Body (Thể) or they are the same element, it's auspicious.
    const maiHoaAuspicious = ["sinh_the", "ty_hoa"].includes(maiHoaResult.theDung?.relationship);

    return {
      timestamp,
      metrics,
      ruleSignals: {
        kyMonState,
        monthlyGeneral,
        voidOfCourse,
        overrideWeightModifier: Number(overrideWeightModifier.toFixed(3)),
        sunriseDistanceMinutes: Number(sunriseDistanceMinutes.toFixed(2)),
        solarTermDistance: Number(solarTermDistance.toFixed(3)),
        tithi,
        yoga,
        moonTropicalSign,
        qmdjVerdict: qmdjScore.consensusVerdict,
        maiHoaAuspicious,
        vedicAuspicious: vedicScore >= 50
      }
    };
}
