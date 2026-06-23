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

// ── Astronomical helpers ──────────────────────────────────────

const JULIAN_DAY_UNIX_EPOCH = 2440587.5;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const sunLongitudeCache = new Map<number, number>();

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function julianDayToUnixMs(julianDay: number): number {
  if (!Number.isFinite(julianDay)) {
    throw new TypeError('julianDay must be a finite number');
  }

  return Math.round((julianDay - JULIAN_DAY_UNIX_EPOCH) * DAY_IN_MS);
}

function computeDeltaT(julianDay: number): number {
  if (!Number.isFinite(julianDay)) {
    throw new TypeError('julianDay must be a finite number');
  }

  const unixMs = julianDayToUnixMs(julianDay);
  const date = new Date(unixMs);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const y = year + (month - 0.5) / 12;

  if (y < 1600) {
    const u = (y - 1000) / 100;
    return (
      1574.2 -
      556.01 * u +
      71.23472 * u * u +
      0.319781 * u * u * u -
      0.8503463 * u * u * u * u -
      0.005050998 * u * u * u * u * u +
      0.0083572073 * u * u * u * u * u * u
    );
  }

  if (y < 1700) {
    const t = y - 1600;
    return 120 - 0.9808 * t - 0.01532 * t * t + (t * t * t) / 7129;
  }

  if (y < 1800) {
    const t = y - 1700;
    return 8.83 + 0.1603 * t - 0.0059285 * t * t + 0.00013336 * t * t * t - (t * t * t * t) / 1174000;
  }

  if (y < 1860) {
    const t = y - 1800;
    return (
      13.72 -
      0.332447 * t +
      0.0068612 * t * t +
      0.0041116 * t * t * t -
      0.00037436 * t * t * t * t +
      0.0000121272 * t * t * t * t * t -
      0.0000001699 * t * t * t * t * t * t +
      0.000000000875 * t * t * t * t * t * t * t
    );
  }

  if (y < 1900) {
    const t = y - 1860;
    return 7.62 + 0.5737 * t - 0.251754 * t * t + 0.01680668 * t * t * t + (t * t * t * t * t) / 233174;
  }

  if (y < 1920) {
    const t = y - 1900;
    return -2.7249 + 1.01453 * t - 0.0223507 * t * t + 0.0009039 * t * t * t;
  }

  if (y < 1941) {
    const t = y - 1920;
    return 21.2 + 0.84493 * t - 0.0761 * t * t + 0.0020936 * t * t * t;
  }

  if (y < 1961) {
    const t = y - 1950;
    return 29.07 + 0.407 * t - (t * t) / 233 + (t * t * t) / 2547;
  }

  if (y < 1986) {
    const t = y - 1975;
    return 45.45 + 1.067 * t - (t * t) / 260 - (t * t * t) / 718;
  }

  if (y < 2005) {
    const t = y - 2000;
    return (
      63.86 +
      0.3345 * t -
      0.060374 * t * t +
      0.0017275 * t * t * t +
      0.000651814 * t * t * t * t +
      0.00002373599 * t * t * t * t * t
    );
  }

  if (y < 2050) {
    const t = y - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t * t;
  }

  const u = (y - 1820) / 100;
  return -20 + 32 * u * u - 0.5628 * (y - 2150);
}

function computeJulianCentury(julianDay: number): number {
  if (!Number.isFinite(julianDay)) {
    throw new TypeError('julianDay must be a finite number');
  }

  const T = (julianDay - 2451545) / 36525;
  return Math.max(-100, Math.min(100, T));
}

/** Apparent solar longitude with delta-T, nutation, and aberration corrections. */
function getApparentSunLongitude(jd: number): number {
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
  sunLongitudeCache.set(jd, longitude);
  return longitude;
}

function shortestAngleDifference(target: number, current: number): number {
  const normalized = normalizeDegrees(target) - normalizeDegrees(current);
  if (normalized > 180) {
    return normalized - 360;
  }
  if (normalized < -180) {
    return normalized + 360;
  }
  return normalized;
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

export function getJDN(day: number, month: number, year: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  if (year < 1582 || (year === 1582 && month < 10) || (year === 1582 && month === 10 && day <= 4)) {
    jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

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

export function findSolarTermStart(d: Date): { term: string; date: Date } {
  const temp = new Date(d);
  temp.setHours(12, 0, 0, 0);
  const jd = getJDN(temp.getDate(), temp.getMonth() + 1, temp.getFullYear());
  const term = getSolarTerm(jd);
  const targetLongitude = Math.floor(getSunLongitude(jd) / 15) * 15;

  try {
    const boundary = solveSolarTermBoundary({
      targetLongitude,
      startJulianDay: jd,
    });
    return { term, date: new Date(julianDayToUnixMs(boundary.julianDay)) };
  } catch {
    // Fall back to the original day-by-day scan if the boundary solver
    // cannot converge for an outlier date.
  }

  for (let i = 0; i < SOLAR_TERM_SEARCH_LIMIT; i++) {
    temp.setDate(temp.getDate() - 1);
    const prevTerm = getSolarTerm(getJDN(temp.getDate(), temp.getMonth() + 1, temp.getFullYear()));
    if (prevTerm !== term) {
      temp.setDate(temp.getDate() + 1);
      return { term, date: new Date(temp) };
    }
  }
  return { term, date: d };
}
