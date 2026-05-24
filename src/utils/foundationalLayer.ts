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

const sunLongitudeCache = new Map<number, number>();

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

/** Apparent solar longitude with nutation and aberration corrections. */
function getApparentSunLongitude(jd: number): number {
  const cached = sunLongitudeCache.get(jd);
  if (cached !== undefined) {
    return cached;
  }

  const T = (jd - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;

  const L0 = normalizeDegrees(280.46645 + 36000.76983 * T + 0.0003032 * T2);
  const M = normalizeDegrees(357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T3);
  const Mr = (M * Math.PI) / 180;

  const center =
    (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.00029 * Math.sin(3 * Mr);

  const omega = ((125.04 - 1934.136 * T) * Math.PI) / 180;
  const longitude = normalizeDegrees(L0 + center - 0.00569 - 0.00478 * Math.sin(omega));
  sunLongitudeCache.set(jd, longitude);
  return longitude;
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
  const term = getSolarTerm(getJDN(temp.getDate(), temp.getMonth() + 1, temp.getFullYear()));
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
