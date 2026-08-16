/**
 * Foundational Layer — "Hiệp kỷ biện phương thư"
 * Computes base astrological score, thần sát, and directions
 * from Can-Chi interactions at the year/month/day level.
 */

import { CanChi, Can, Chi, StarData } from '../types/calendar';
import thanSatData from '../data/phase_1/than_sat.json';
import {
  CAN,
  CHI,
  TIET_KHI_NAMES,
  CHI_XUNG,
  HY_THAN_MAPPING,
  TAI_THAN_MAPPING,
  HAC_THAN_MAPPING,
  DAY_DEITIES,
  DEITY_START_CHIS,
  HOANG_DAO_DEITY_INDICES,
  SCORING,
  SOLAR_TERM_SEARCH_LIMIT,
} from './constants';

import {
  normalizeDegrees,
  shortestAngleDifference,
  julianDayToUnixMs,
  computeJulianCentury,
  computeDeltaT,
  getJDN,
} from './astroUtils';

// ── Astronomical helpers ──────────────────────────────────────

const sunLongitudeCache = new Map<number, number>();
const SUN_LONGITUDE_CACHE_MAX = 256;

/** Apparent solar longitude with delta-T, nutation, and aberration corrections. */
function getApparentSunLongitude(jd: number): number {
  if (!Number.isFinite(jd)) return 0;

  const cached = sunLongitudeCache.get(jd);
  if (cached !== undefined) {
    return cached;
  }

  const jdTT = jd + computeDeltaT(jd) / 86400;
  const T = computeJulianCentury(jdTT);

  const L0 = normalizeDegrees(280.46646 + T * (36000.76983 + 0.0003032 * T));
  const M = normalizeDegrees(357.52911 + T * (35999.05029 - 0.0001537 * T));
  const Mr = M * (Math.PI / 180);

  const center =
    (1.914602 - T * (0.004817 + 0.000014 * T)) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);

  const omega = (125.04 - 1934.136 * T) * (Math.PI / 180);
  const longitude = normalizeDegrees(L0 + center - 0.00569 - 0.00478 * Math.sin(omega));

  if (sunLongitudeCache.size >= SUN_LONGITUDE_CACHE_MAX) {
    const oldestKey = sunLongitudeCache.keys().next().value;
    if (oldestKey !== undefined) {
      sunLongitudeCache.delete(oldestKey);
    }
  }

  sunLongitudeCache.set(jd, longitude);
  return longitude;
}

function computeSolarLongitudeDerivative(julianDay: number): number {
  const step = 1 / 24;
  const next = getApparentSunLongitude(julianDay + step);
  const previous = getApparentSunLongitude(julianDay - step);
  return shortestAngleDifference(next, previous) / (step * 2);
}

function solveSolarTermBoundary({
  targetLongitude,
  startJulianDay,
  toleranceDegrees = 1e-9,
  maxIterations = 24,
}: {
  targetLongitude: number;
  startJulianDay: number;
  toleranceDegrees?: number;
  maxIterations?: number;
}) {
  if (!Number.isFinite(targetLongitude)) {
    throw new TypeError('targetLongitude must be a finite number');
  }
  if (!Number.isFinite(startJulianDay)) {
    throw new TypeError('startJulianDay must be a finite number');
  }

  let currentJulianDay = startJulianDay;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const currentLongitude = getApparentSunLongitude(currentJulianDay);
    const delta = shortestAngleDifference(targetLongitude, currentLongitude);

    if (Math.abs(delta) <= toleranceDegrees) {
      return {
        julianDay: currentJulianDay,
        longitude: currentLongitude,
        iterations: iteration + 1,
      };
    }

    const derivative = computeSolarLongitudeDerivative(currentJulianDay);
    if (!Number.isFinite(derivative) || Math.abs(derivative) < 1e-9) {
      break;
    }

    currentJulianDay += delta / derivative;
  }

  let lower = startJulianDay - 10;
  let upper = startJulianDay + 10;
  let found = false;

  for (const width of [10, 20, 30]) {
    lower = startJulianDay - width;
    upper = startJulianDay + width;
    let lowerDiff = shortestAngleDifference(targetLongitude, getApparentSunLongitude(lower));

    for (let cursor = lower + 0.25; cursor <= upper; cursor += 0.25) {
      const currentDiff = shortestAngleDifference(targetLongitude, getApparentSunLongitude(cursor));
      if ((lowerDiff <= 0 && currentDiff >= 0) || (lowerDiff >= 0 && currentDiff <= 0)) {
        lower = cursor - 0.25;
        upper = cursor;
        found = true;
        break;
      }
      lowerDiff = currentDiff;
    }
    if (found) {
      break;
    }
  }

  for (let iteration = 0; iteration < maxIterations * 2; iteration += 1) {
    const midpoint = (lower + upper) / 2;
    const midpointLongitude = getApparentSunLongitude(midpoint);
    const midpointDiff = shortestAngleDifference(targetLongitude, midpointLongitude);

    if (Math.abs(midpointDiff) <= toleranceDegrees) {
      return {
        julianDay: midpoint,
        longitude: midpointLongitude,
        iterations: maxIterations + iteration + 1,
      };
    }

    const lowerBoundaryDiff = shortestAngleDifference(targetLongitude, getApparentSunLongitude(lower));
    if ((lowerBoundaryDiff <= 0 && midpointDiff >= 0) || (lowerBoundaryDiff >= 0 && midpointDiff <= 0)) {
      upper = midpoint;
    } else {
      lower = midpoint;
    }
  }

  const finalJulianDay = (lower + upper) / 2;
  return {
    julianDay: finalJulianDay,
    longitude: getApparentSunLongitude(finalJulianDay),
    iterations: maxIterations * 3,
  };
}

export { getJDN } from './astroUtils';

export function getSunLongitude(jd: number): number {
  return getApparentSunLongitude(jd);
}

export function getSolarTerm(jd: number): string {
  const longitude = getSunLongitude(jd);
  const termIndex = Math.floor(longitude / 15);
  return TIET_KHI_NAMES[termIndex];
}

export function getSolarMonth(jd: number): number {
  const longitude = getSunLongitude(jd);
  // Month 1 (Dần) starts at 315 (Lập Xuân)
  // 315-345: Month 1, 345-15: Month 2, ...
  const adjusted = (longitude - 315 + 360) % 360;
  return Math.floor(adjusted / 30) + 1;
}

// ── Foundational Layer Calculation ────────────────────────────

export function calculateFoundationalLayer(
  date: Date,
  lunar: { day: number; month: number; year: number; isLeap: boolean },
  dayCanChi: CanChi,
  getCanChiMonth: (month: number, year: number) => string,
  getCanChiYear: (year: number) => string,
) {
  const jd = getJDN(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const solarMonth = getSolarMonth(jd);

  const thanSat: StarData[] = [];
  let baseScore = 0;

  const data = (thanSatData.than_sat as StarData[]) || [];

  // Hoàng/Hắc đạo day deities follow the solar-term month, not the lunar month.
  const monthChi = CHI[(solarMonth + 1) % 12] as Chi;
  const yearChiStr = getCanChiYear(lunar.year);
  const yearChi = yearChiStr.split(' ')[1] as Chi;
  const yearCan = yearChiStr.split(' ')[0] as Can;

  data.forEach((s) => {
    let matches = false;
    const c = s.criteria;
    if (!c) return;

    if (c.month_can_chi && c.month_can_chi[solarMonth - 1] === dayCanChi.can) matches = true;
    const cDayCan = c.day_can?.[dayCanChi.can];
    if (cDayCan && (Array.isArray(cDayCan) ? cDayCan.includes(dayCanChi.chi) : cDayCan === dayCanChi.chi))
      matches = true;

    // Clash checks
    if (c.day_chi_clash_year_chi && CHI_XUNG[dayCanChi.chi] === yearChi) matches = true;
    if (c.day_chi_clash_month_chi && CHI_XUNG[dayCanChi.chi] === monthChi) matches = true;
    if (c.year_chi && c.year_chi[yearChi] === dayCanChi.chi) matches = true;

    if (c.tuan_khong) {
      const yearCanIdx = CAN.indexOf(yearCan);
      const yearChiIdx = CHI.indexOf(yearChi);
      const dayChiIdx = CHI.indexOf(dayCanChi.chi);
      if (yearCanIdx >= 0 && yearChiIdx >= 0 && dayChiIdx >= 0) {
        const kv1 = (yearChiIdx - yearCanIdx + 10) % 12;
        const kv2 = (yearChiIdx - yearCanIdx + 11) % 12;
        if (dayChiIdx === kv1 || dayChiIdx === kv2) matches = true;
      }
    }

    if (matches && !c.day_hour_chi) {
      thanSat.push(s);
      baseScore += s.base_score || 0;
    }
  });

  // Day Deity (One of 12 Path Deities)
  const mChi = CHI[(solarMonth + 1) % 12];
  const startChi = DEITY_START_CHIS[mChi] || 'Tý';
  const startChiIdx = CHI.indexOf(startChi);
  const dayChiIdx = CHI.indexOf(dayCanChi.chi);
  const deityIdx = (dayChiIdx - startChiIdx + 12) % 12;
  const deityName = DAY_DEITIES[deityIdx];
  const isAuspicious = HOANG_DAO_DEITY_INDICES.includes(deityIdx);

  thanSat.push({
    name: deityName + (isAuspicious ? ' (Hoàng Đạo)' : ' (Hắc Đạo)'),
    type: isAuspicious ? 'Good' : 'Bad',
    description: isAuspicious ? 'Ngày tốt' : 'Ngày xấu',
  });
  baseScore += isAuspicious ? SCORING.DEITY_AUSPICIOUS_SCORE : SCORING.DEITY_INAUSPICIOUS_SCORE;

  // Directions
  const auspiciousDirections = {
    hyThan: HY_THAN_MAPPING[dayCanChi.can] || 'Chưa rõ',
    taiThan: TAI_THAN_MAPPING[dayCanChi.can] || 'Chưa rõ',
    hacThan: HAC_THAN_MAPPING[dayCanChi.can] || 'Chưa rõ',
  };

  return { baseScore, thanSat, auspiciousDirections, solarMonth, isAuspiciousDay: isAuspicious };
}

// ── Tiết Khí start-date finder ────────────────────────────────

const solarTermStartCache = new Map<string, { term: string; date: Date }>();
const SOLAR_TERM_CACHE_LIMIT = 256;

export function findSolarTermStart(d: Date): { term: string; date: Date } {
  const cacheKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const cached = solarTermStartCache.get(cacheKey);
  if (cached) {
    return { term: cached.term, date: new Date(cached.date) };
  }

  const temp = new Date(d);
  temp.setHours(12, 0, 0, 0);
  const jd = getJDN(temp.getDate(), temp.getMonth() + 1, temp.getFullYear());
  const term = getSolarTerm(jd);
  const targetLongitude = Math.floor(getSunLongitude(jd) / 15) * 15;

  let result: { term: string; date: Date };

  try {
    const boundary = solveSolarTermBoundary({
      targetLongitude,
      startJulianDay: jd,
    });
    result = { term, date: new Date(julianDayToUnixMs(boundary.julianDay)) };
  } catch {
    // Fall back to the original day-by-day scan if the boundary solver
    // cannot converge for an outlier date.
    let fallbackDate = d;
    for (let i = 0; i < SOLAR_TERM_SEARCH_LIMIT; i++) {
      temp.setDate(temp.getDate() - 1);
      const prevTerm = getSolarTerm(getJDN(temp.getDate(), temp.getMonth() + 1, temp.getFullYear()));
      if (prevTerm !== term) {
        temp.setDate(temp.getDate() + 1);
        fallbackDate = new Date(temp);
        break;
      }
    }
    result = { term, date: fallbackDate };
  }

  if (solarTermStartCache.size >= SOLAR_TERM_CACHE_LIMIT) {
    const firstKey = solarTermStartCache.keys().next().value;
    if (firstKey) solarTermStartCache.delete(firstKey);
  }
  solarTermStartCache.set(cacheKey, { term: result.term, date: new Date(result.date) });
  return result;
}
