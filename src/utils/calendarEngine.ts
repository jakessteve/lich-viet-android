/**
 * Vietnamese Lunar Calendar Engine — Orchestrator
 * Re-exports all public APIs from the decomposed sub-modules.
 */

import { DayCellData, DayQuality, DayDetailsData, CanChi, HourInfo, Can, Chi } from '../types/calendar';

// Sub-module imports
import { getJDN, getSolarTerm, calculateFoundationalLayer, findSolarTermStart } from './foundationalLayer';
import { calculateModifyingLayer } from './modifyingLayer';
import { generateDungSu } from './dungSuEngine';
import {
  getHourCanChi,
  getAllHours as _getAllHours,
  getAuspiciousHours as _getAuspiciousHours,
  getInauspiciousHours as _getInauspiciousHours,
} from './hourEngine';
import { StarData } from '../types/calendar';

// Data imports
import catThanData from '../data/phase_1/cat_than.json';
import hungThanData from '../data/phase_1/hung_than.json';
import banhToData from '../data/phase_1/banh_to_bach_ky.json';
import { getNapAmIndex, checkNapAmCompatibility, getNapAmExceptionComment } from './canchiHelper';
import { getYearlyStars } from './yearlyEngine';
import { getExtraStars } from './extraStars';
import { getSwissEphemerisInstance, getSwissLunarDateIfReady } from '../services/astronomy/swissEphemeris';
import type { SwissGeoLocation } from '../services/astronomy/swissEphemeris';
import { getCivilDateForOffset } from './geo';
import {
  CAN,
  CHI,
  NGU_HANH_MAPPING,
  NAP_AM_MAPPING,
  LUC_HOP,
  TAM_HOP,
  CHI_XUNG,
  CHI_HINH,
  CHI_HAI,
  CHI_PHA,
  CHI_TUYET,
  TAM_HOP_CUC,
  TAM_SAT,
  KHONG_SO_KHAC,
  NGU_HANH_SINH,
  NGU_HANH_KHAC,
  CAN_KHAC_MAP,
  SCORING,
  BUDDHIST_YEAR_OFFSET,
  VESAK_MONTH,
  VESAK_DAY,
  DAY_OF_WEEK_NAMES,
  CALENDAR_GRID_CELLS,
  BACH_SU_HUNG_FALLBACK,
} from './constants';

// ── Re-export sub-module APIs ─────────────────────────────────

export { getHourCanChi } from './hourEngine';
export { getJDN, getSolarTerm, getSunLongitude, getSolarMonth, findSolarTermStart } from './foundationalLayer';

// ── Solar / Lunar Conversion Helpers ──────────────────────────

const PI = Math.PI;
const DR = PI / 180;
const VIETNAM_TIMEZONE = 7;
const SYNODIC_MONTH = 29.530588853;
const NEW_MOON_EPOCH = 2415021.076998695;
const LUNAR_DATE_CACHE_LIMIT = 512;
const lunarDateCache = new Map<string, { day: number; month: number; year: number; isLeap: boolean }>();
const DETAIL_DATE_CACHE_LIMIT = 128;
const detailedDayDataCache = new Map<string, DayDetailsData>();

function int(value: number) {
  return Math.floor(value);
}

function normalizeDate(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function dateCacheKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

function locationCacheKey(location?: SwissGeoLocation): string {
  if (!location) return 'default';
  return `geo:${location.longitude.toFixed(4)}:${location.timezoneOffsetHours}`;
}

function calendarCacheKey(value: Date, location?: SwissGeoLocation) {
  const source = getSwissEphemerisInstance() ? 'swiss' : 'fallback';
  return `${dateCacheKey(value)}:${source}:${locationCacheKey(location)}`;
}

function rememberLunarDate(key: string, value: { day: number; month: number; year: number; isLeap: boolean }) {
  if (lunarDateCache.size >= LUNAR_DATE_CACHE_LIMIT) {
    const oldestKey = lunarDateCache.keys().next().value;
    if (oldestKey) {
      lunarDateCache.delete(oldestKey);
    }
  }
  lunarDateCache.set(key, value);
  return { ...value };
}

function jdFromDate(dd: number, mm: number, yy: number) {
  const a = int((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  return dd + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - int(y / 100) + int(y / 400) - 32045;
}

function sunLongitudeRadians(jdn: number, timeZone: number) {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const T3 = T2 * T;

  let L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  L0 = ((L0 % 360) + 360) % 360;

  let M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T3;
  M = ((M % 360) + 360) % 360;

  const Mr = M * DR;
  const DL =
    (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.00029 * Math.sin(3 * Mr);

  const omega = (125.04 - 1934.136 * T) * DR;
  const lambda = (L0 + DL - 0.00569 - 0.00478 * Math.sin(omega)) * DR;
  return ((lambda % (2 * PI)) + 2 * PI) % (2 * PI);
}

function sunLongitudeIndex(jdn: number, timeZone: number) {
  return int((sunLongitudeRadians(jdn, timeZone) / PI) * 6);
}

function newMoon(k: number) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = DR;

  let Jd1 = 2415020.75933 + SYNODIC_MONTH * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

  const Mr = M * dr;
  const Mprr = Mpr * dr;
  const Fr = F * dr;

  const C1 =
    (0.1734 - 0.000393 * T) * Math.sin(Mr) +
    0.0021 * Math.sin(2 * Mr) +
    -0.4068 * Math.sin(Mprr) +
    0.0161 * Math.sin(2 * Mprr) +
    -0.0004 * Math.sin(3 * Mprr) +
    0.0104 * Math.sin(2 * Fr) +
    -0.0051 * Math.sin(Mr + Mprr) +
    -0.0074 * Math.sin(Mr - Mprr) +
    0.0004 * Math.sin(2 * Fr + Mr) +
    -0.0004 * Math.sin(2 * Fr - Mr) +
    -0.0006 * Math.sin(2 * Fr + Mprr) +
    0.001 * Math.sin(2 * Fr - Mprr) +
    0.0005 * Math.sin(Mr + 2 * Mprr);

  let deltaT: number;
  if (T < -11) {
    deltaT = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltaT = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }

  return Jd1 + C1 - deltaT;
}

function getNewMoonDay(k: number, timeZone: number) {
  return int(newMoon(k) + 0.5 + timeZone / 24);
}

function getLunarMonth11(year: number, timeZone: number) {
  const off = jdFromDate(31, 12, year) - 2415021;
  const k = int(off / SYNODIC_MONTH);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = sunLongitudeIndex(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number) {
  const k = int(0.5 + (a11 - NEW_MOON_EPOCH) / SYNODIC_MONTH);
  let last = 0;
  let i = 1;
  let arc = sunLongitudeIndex(getNewMoonDay(k + i, timeZone), timeZone);

  do {
    last = arc;
    i += 1;
    arc = sunLongitudeIndex(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);

  return i - 1;
}

function dayStemIndex(jd: number) {
  return (jd + 9) % 10;
}

function dayBranchIndex(jd: number) {
  return (jd + 1) % 12;
}

// ── Kị Tuổi Helper ────────────────────────────────────────────

function getKiTuoi(dayCan: Can, dayChi: Chi): string[] {
  const chiKhac = CHI_XUNG[dayChi];
  if (!CAN_KHAC_MAP[dayCan] || !chiKhac) return [];
  return CAN_KHAC_MAP[dayCan].map((c) => `${c} ${chiKhac}`);
}

// ── Core Calendar Functions ───────────────────────────────────

export function getLunarDate(
  date: Date,
  location?: SwissGeoLocation,
): { day: number; month: number; year: number; isLeap: boolean } {
  const normalized = normalizeDate(date);
  const cacheKey = calendarCacheKey(normalized, location);
  const cached = lunarDateCache.get(cacheKey);
  if (cached) {
    return { ...cached };
  }

  const swissLunarDate = getSwissLunarDateIfReady(normalized, 'south', undefined, location);
  if (swissLunarDate) {
    const precise = {
      day: swissLunarDate.day,
      month: swissLunarDate.month,
      year: swissLunarDate.year,
      isLeap: swissLunarDate.isLeap,
    };
    rememberLunarDate(cacheKey, precise);
    return precise;
  }

  const dd = normalized.getDate();
  const mm = normalized.getMonth() + 1;
  const yy = normalized.getFullYear();
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = int((dayNumber - NEW_MOON_EPOCH) / SYNODIC_MONTH);
  const timeZone = location?.timezoneOffsetHours ?? VIETNAM_TIMEZONE;
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }

  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;

  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = int((monthStart - a11) / 29);
  let lunarLeap = 0;
  let lunarMonth = diff + 11;

  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = 1;
      }
    }
  }

  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }

  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }

  return rememberLunarDate(cacheKey, {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeap: lunarLeap === 1,
  });
}

export function getDayQuality(date: Date, location?: SwissGeoLocation): DayQuality {
  const detailed = getDetailedDayData(date, location);

  if (
    detailed.nguHanhGrade === 'Chuyên nhật' ||
    detailed.nguHanhGrade === 'Nghĩa nhật' ||
    detailed.nguHanhGrade === 'Bảo nhật'
  ) {
    return 'Good';
  }
  if (detailed.nguHanhGrade === 'Phạt nhật') {
    return 'Bad';
  }
  return 'Neutral';
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export function getMonthDays(year: number, month: number, location?: SwissGeoLocation): DayCellData[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const today = location ? getCivilDateForOffset(new Date(), location.timezoneOffsetHours) : new Date();

  const days: DayCellData[] = [];

  let firstDayOfWeek = firstDayOfMonth.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    const lunar = getLunarDate(d, location);
    days.push({
      solarDate: d.getDate(),
      lunarDate: lunar.day === 1 ? `${lunar.day}/${lunar.month}` : lunar.day,
      dayQuality: getDayQuality(d, location),
      fullDate: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      dayChi: getCanChiDay(d).split(' ')[1] as Chi,
    });
  }

  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i);
    const lunar = getLunarDate(d, location);
    days.push({
      solarDate: i,
      lunarDate: lunar.day === 1 ? `${lunar.day}/${lunar.month}` : lunar.day,
      dayQuality: getDayQuality(d, location),
      fullDate: d,
      isCurrentMonth: true,
      isToday: isSameDay(d, today),
      dayChi: getCanChiDay(d).split(' ')[1] as Chi,
    });
  }

  const remaining = CALENDAR_GRID_CELLS - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    const lunar = getLunarDate(d, location);
    days.push({
      solarDate: i,
      lunarDate: lunar.day === 1 ? `${lunar.day}/${lunar.month}` : lunar.day,
      dayQuality: getDayQuality(d, location),
      fullDate: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      dayChi: getCanChiDay(d).split(' ')[1] as Chi,
    });
  }

  return days;
}

// ── Can-Chi Parsing ───────────────────────────────────────────

export function getCanChiYear(lunarYear: number): string {
  const canIndex = (lunarYear + 6) % 10;
  const chiIndex = (lunarYear + 8) % 12;
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}

export function getCanChiMonth(lunarMonth: number, lunarYear: number): string {
  const yearCanIndex = (lunarYear + 6) % 10;
  const monthCanIndex = (yearCanIndex * 2 + 2 + (lunarMonth - 1)) % 10;
  const monthChiIndex = (lunarMonth + 1) % 12;
  return `${CAN[monthCanIndex]} ${CHI[monthChiIndex]}`;
}

export function getCanChiDay(date: Date): string {
  const jd = getJDN(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const canIndex = dayStemIndex(jd);
  const chiIndex = dayBranchIndex(jd);
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}

export function parseCanChi(canChiStr: string): CanChi {
  const parts = canChiStr.split(' ');
  return {
    can: parts[0] as Can,
    chi: parts[1] as Chi,
  };
}

// ── Hour Wrappers (preserving public API) ─────────────────────

export function getAllHours(date: Date): HourInfo[] {
  return _getAllHours(date, parseCanChi, getCanChiDay);
}

export function getAuspiciousHours(date: Date): HourInfo[] {
  return _getAuspiciousHours(date, parseCanChi, getCanChiDay);
}

export function getInauspiciousHours(date: Date): HourInfo[] {
  return _getInauspiciousHours(date, parseCanChi, getCanChiDay);
}

// ── Day-of-Week Helper ────────────────────────────────────────

function getDayOfWeekName(date: Date): string {
  return DAY_OF_WEEK_NAMES[date.getDay()];
}

// ── Sub-function: Integrate Extra Stars ───────────────────────

interface ExtraStarIntegrationParams {
  modifyingStars: StarData[];
  extraGoodStars: string[];
  extraBadStars: string[];
  masterCat: StarData[];
  masterHung: StarData[];
}

/**
 * Merges extra star results into the modifying layer's star list.
 * Looks up each extra star name from the master catalogs for metadata.
 */
export function integrateExtraStars(params: ExtraStarIntegrationParams): StarData[] {
  const { modifyingStars, extraGoodStars, extraBadStars, masterCat, masterHung } = params;
  const result = [...modifyingStars];
  const existingNames = new Set(modifyingStars.map((s) => s.name));

  extraGoodStars.forEach((sName) => {
    if (existingNames.has(sName)) return;
    const master = masterCat.find((m) => m.name === sName);
    result.push({
      name: sName,
      type: 'Good',
      weight: SCORING.DEFAULT_GOOD_STAR_WEIGHT,
      description: master?.description || '',
      suitable: master?.suitable || [],
      unsuitable: master?.unsuitable || [],
    });
    existingNames.add(sName);
  });

  extraBadStars.forEach((sName) => {
    if (existingNames.has(sName)) return;
    const master = masterHung.find((m) => m.name === sName);
    result.push({
      name: sName,
      type: 'Bad',
      weight: SCORING.DEFAULT_BAD_STAR_WEIGHT,
      description: master?.description || '',
      suitable: master?.suitable || [],
      unsuitable: master?.unsuitable || (sName === 'Cửu Khổ Bát Cùng' ? [BACH_SU_HUNG_FALLBACK] : []),
    });
    existingNames.add(sName);
  });

  return result;
}

// ── Sub-function: Ngũ Hành Interaction ────────────────────────

interface NguHanhResult {
  interactionStr: string;
  nguHanhGrade: string;
  nguHanhScore: number;
  nguHanhInteraction: string;
}

/**
 * Determines the Ngũ Hành interaction between the day's Can and Chi.
 * Returns the grade (Chuyên/Nghĩa/Bảo/Chế/Phạt nhật) and score delta.
 *
 * Traditional hierarchy: 比和(chuyên) > 生我(nghĩa) > 我生(bảo) > 我克(chế) > 克我(phạt)
 */
export function calculateNguHanhInteraction(dayCanChi: CanChi): NguHanhResult {
  const dayCanNguHanh = NGU_HANH_MAPPING[dayCanChi.can as Can];
  const dayChiNguHanh = NGU_HANH_MAPPING[dayCanChi.chi];

  let interactionStr = '';
  let nguHanhGrade = '';
  let nguHanhScore = 0;

  if (dayCanNguHanh === dayChiNguHanh) {
    interactionStr = 'là ngày cát (chuyên nhật)';
    nguHanhGrade = 'Chuyên nhật';
    nguHanhScore = SCORING.NGU_HANH_CHUYEN_NHAT;
  } else if (NGU_HANH_SINH[dayChiNguHanh] === dayCanNguHanh) {
    interactionStr = `tức Chi sinh Can (${dayChiNguHanh}, ${dayCanNguHanh}), là ngày cát (nghĩa nhật)`;
    nguHanhGrade = 'Nghĩa nhật';
    nguHanhScore = SCORING.NGU_HANH_NGHIA_NHAT;
  } else if (NGU_HANH_SINH[dayCanNguHanh] === dayChiNguHanh) {
    interactionStr = `tức Can sinh Chi (${dayCanNguHanh}, ${dayChiNguHanh}), là ngày cát (bảo nhật)`;
    nguHanhGrade = 'Bảo nhật';
    nguHanhScore = SCORING.NGU_HANH_BAO_NHAT;
  } else if (NGU_HANH_KHAC[dayCanNguHanh] === dayChiNguHanh) {
    interactionStr = `tức Can khắc Chi (${dayCanNguHanh}, ${dayChiNguHanh}), là ngày cát trung bình (chế nhật)`;
    nguHanhGrade = 'Chế nhật';
    nguHanhScore = SCORING.NGU_HANH_CHE_NHAT;
  } else if (NGU_HANH_KHAC[dayChiNguHanh] === dayCanNguHanh) {
    interactionStr = `tức Chi khắc Can (${dayChiNguHanh}, ${dayCanNguHanh}), là ngày đại hung (phạt nhật)`;
    nguHanhGrade = 'Phạt nhật';
    nguHanhScore = SCORING.NGU_HANH_PHAT_NHAT;
  }

  const nguHanhInteraction = `Ngày: ${dayCanChi.can} ${dayCanChi.chi}; ${interactionStr}.`;
  return { interactionStr, nguHanhGrade, nguHanhScore, nguHanhInteraction };
}

// ── Sub-function: Final Score & Grade ─────────────────────────

interface FinalScoreResult {
  finalScore: number;
  dayGrade: string;
}

/**
 * Aggregates base score, star weights, Truc/Tu quality, and Ngũ Hành score
 * into a final score and day grade.
 */
export function calculateFinalScore(
  baseScore: number,
  stars: StarData[],
  trucQuality: string,
  tuQuality: string,
  nguHanhScore: number,
): FinalScoreResult {
  let finalScore = baseScore;
  stars.forEach((s) => (finalScore += s.weight || 0));

  if (trucQuality === 'Good') finalScore += SCORING.TRUC_TU_QUALITY_DELTA;
  if (trucQuality === 'Bad') finalScore -= SCORING.TRUC_TU_QUALITY_DELTA;
  if (tuQuality === 'Good') finalScore += SCORING.TRUC_TU_QUALITY_DELTA;
  if (tuQuality === 'Bad') finalScore -= SCORING.TRUC_TU_QUALITY_DELTA;

  finalScore += nguHanhScore;

  let dayGrade = 'Trung Bình';
  if (finalScore >= SCORING.DAY_GRADE_GOOD_THRESHOLD) dayGrade = 'Tốt';
  if (finalScore <= SCORING.DAY_GRADE_BAD_THRESHOLD) dayGrade = 'Đại Kỵ';

  return { finalScore, dayGrade };
}

// ── Sub-function: Nạp Âm Interaction Text ─────────────────────

/**
 * Builds the Nạp Âm interaction description string,
 * including kị tuổi and exception comments.
 */
export function buildNapAmInteraction(dayCanChi: CanChi): string {
  const dayCanNguHanh = NGU_HANH_MAPPING[dayCanChi.can as Can];
  const napAmDay = NAP_AM_MAPPING[`${dayCanChi.can} ${dayCanChi.chi}`] || 'Chưa rõ';
  const kiTuoi = getKiTuoi(dayCanChi.can, dayCanChi.chi);

  const dayNaIdxForComment = getNapAmIndex(dayCanChi.can, dayCanChi.chi);
  const napAmExceptionSet = new Set<string>();
  for (let i = 0; i < 30; i++) {
    const comment = getNapAmExceptionComment(dayNaIdxForComment, i);
    if (comment) napAmExceptionSet.add(comment);
  }
  const napAmExceptions = Array.from(napAmExceptionSet);
  const napAmExceptionText = napAmExceptions.length > 0 ? `, ${napAmExceptions.join('; ')}` : '';

  return `Nạp Âm: ${napAmDay} kị tuổi: ${kiTuoi.join(', ')}.\nNgày thuộc hành ${dayCanNguHanh} khắc hành ${KHONG_SO_KHAC[dayCanNguHanh] || ''}${napAmExceptionText}.`;
}

// ── Sub-function: Can Chi Xung/Hợp Text ──────────────────────

/**
 * Builds the Can Chi relationship summary: Lục Hợp, Tam Hợp, Xung, Hình, Hại, Phá, Tuyệt, Tam Sát.
 */
export function buildCanChiXungHop(dayChi: Chi): string {
  const tamHopCuc = TAM_HOP_CUC[dayChi] ? ` thành ${TAM_HOP_CUC[dayChi]} cục` : '';
  const tamSatText = TAM_SAT[dayChi] ? ` Tam Sát kị mệnh tuổi ${TAM_SAT[dayChi]}.` : '';
  return `Ngày ${dayChi} lục hợp ${LUC_HOP[dayChi]}, tam hợp ${TAM_HOP[dayChi]}${tamHopCuc}; xung ${CHI_XUNG[dayChi]}, hình ${CHI_HINH[dayChi]}, hại ${CHI_HAI[dayChi]}, phá ${CHI_PHA[dayChi]}, tuyệt ${CHI_TUYET[dayChi]}.${tamSatText}`;
}

// ── Sub-function: Collect Star Lists ──────────────────────────

interface StarLists {
  goodStars: string[];
  badStars: string[];
}

/**
 * Collects and deduplicates good/bad star name lists from
 * foundational thanSat, modifying stars, and Truc/Tu quality.
 */
export function collectStarLists(
  thanSat: StarData[],
  modifyingStars: StarData[],
  trucDetail: { name: string; quality: string },
  tuDetail: { name: string; quality: string },
): StarLists {
  const goodList = [
    ...thanSat.filter((s) => s.type === 'Good' && !s.criteria?.day_hour_chi).map((s) => s.name),
    ...modifyingStars.filter((s) => s.type === 'Good').map((s) => s.name),
    ...(trucDetail.quality === 'Good' ? [`Trực ${trucDetail.name}`] : []),
    ...(tuDetail.quality === 'Good' ? [`Sao ${tuDetail.name}`] : []),
  ];

  const badList = [
    ...thanSat.filter((s) => s.type === 'Bad' && !s.criteria?.day_hour_chi).map((s) => s.name),
    ...modifyingStars.filter((s) => s.type === 'Bad').map((s) => s.name),
    ...(trucDetail.quality === 'Bad' ? [`Trực ${trucDetail.name}`] : []),
    ...(tuDetail.quality === 'Bad' ? [`Sao ${tuDetail.name}`] : []),
  ];

  return {
    goodStars: Array.from(new Set(goodList)).sort(),
    badStars: Array.from(new Set(badList)).sort(),
  };
}

// ── Main Orchestrator ─────────────────────────────────────────

export function getDetailedDayData(date: Date, location?: SwissGeoLocation): DayDetailsData {
  const normalized = normalizeDate(date);
  const detailKey = calendarCacheKey(normalized, location);
  const cached = detailedDayDataCache.get(detailKey);
  if (cached) return cached;

  // 1. Parse core identifiers
  const lunar = getLunarDate(normalized, location);
  const yearCanChi = parseCanChi(getCanChiYear(normalized.getFullYear()));
  const monthCanChi = parseCanChi(getCanChiMonth(lunar.month, lunar.year));
  const dayCanChi = parseCanChi(getCanChiDay(normalized));

  // 2. Foundational Layer
  const foundational = calculateFoundationalLayer(normalized, lunar, dayCanChi, getCanChiMonth, getCanChiYear);

  // 3. Moon Phase (Tháng đủ/thiếu)
  const tempDate = new Date(normalized);
  tempDate.setDate(tempDate.getDate() + (30 - lunar.day));
  const tempLunar = getLunarDate(tempDate, location);
  const isDu = tempLunar.day === 30;
  const thangAmThieuDu = `Tháng ${lunar.month} ${isDu ? 'đủ' : 'thiếu'} kiên ${monthCanChi.can} ${monthCanChi.chi}`;

  // 4. Modifying Layer + Extra Stars integration
  const modifying = calculateModifyingLayer(normalized, lunar, dayCanChi, foundational.solarMonth);
  const extra = getExtraStars(
    lunar.month,
    lunar.day,
    dayCanChi.can,
    dayCanChi.chi,
    modifying.trucDetail.name,
    isDu,
    yearCanChi.can,
  );
  const masterCat = (catThanData as unknown as { stars: StarData[] }).stars || [];
  const masterHung = (hungThanData as unknown as { stars: StarData[] }).stars || [];
  modifying.stars = integrateExtraStars({
    modifyingStars: modifying.stars,
    extraGoodStars: extra.goodStars,
    extraBadStars: extra.badStars,
    masterCat,
    masterHung,
  });

  // 5. Dụng Sự
  const dayCanNguHanh = NGU_HANH_MAPPING[dayCanChi.can as Can];
  const dungSu = generateDungSu(modifying, dayCanNguHanh, normalized);

  // 6. Ngũ Hành Interaction
  const nguHanh = calculateNguHanhInteraction(dayCanChi);

  // 7. Final Score & Grade
  const { finalScore, dayGrade } = calculateFinalScore(
    foundational.baseScore,
    modifying.stars,
    modifying.trucDetail.quality,
    modifying.tuDetail.quality,
    nguHanh.nguHanhScore,
  );

  // 8. Formatting helpers
  const yyyy = normalized.getFullYear();
  const mm = String(normalized.getMonth() + 1).padStart(2, '0');
  const dd = String(normalized.getDate()).padStart(2, '0');
  const solarDateStr = `${yyyy}-${mm}-${dd}`;

  const jd = getJDN(normalized.getDate(), normalized.getMonth() + 1, normalized.getFullYear());

  // 9. Buddhist year
  let buddhistYear = normalized.getFullYear() + BUDDHIST_YEAR_OFFSET;
  if (lunar.month < VESAK_MONTH || (lunar.month === VESAK_MONTH && lunar.day < VESAK_DAY)) {
    buddhistYear -= 1;
  }

  // 10. Tiết Khí detail
  const currentStart = findSolarTermStart(normalized);
  const prevTempDate = new Date(currentStart.date);
  prevTempDate.setDate(prevTempDate.getDate() - 1);
  const prevStart = findSolarTermStart(prevTempDate);
  const tietKhiDetail = `Tiết ${prevStart.term} khởi ngày ${prevStart.date.getDate()}/${prevStart.date.getMonth() + 1}/${prevStart.date.getFullYear()}; Tiết khí ${currentStart.term} khởi ngày ${currentStart.date.getDate()}/${currentStart.date.getMonth() + 1}/${currentStart.date.getFullYear()}`;

  // 11. Nạp Âm & Can Chi interaction texts
  const napAmInteraction = buildNapAmInteraction(dayCanChi);
  const canChiXungHop = buildCanChiXungHop(dayCanChi.chi);

  // 12. Star lists
  const starLists = collectStarLists(foundational.thanSat, modifying.stars, modifying.trucDetail, modifying.tuDetail);

  // 13. Assemble result
  const result: DayDetailsData = {
    solarDate: solarDateStr,
    dayOfWeek: getDayOfWeekName(normalized),
    lunarDate: {
      day: lunar.day,
      month: lunar.month,
      year: lunar.year,
      isLeapMonth: lunar.isLeap,
    },
    buddhistYear,
    canChi: {
      year: yearCanChi,
      month: monthCanChi,
      day: dayCanChi,
    },
    startHour: getHourCanChi(dayCanChi.can, 'Tý'),
    solarTerm: getSolarTerm(jd),
    fiveElements: {
      napAm: NAP_AM_MAPPING[`${dayCanChi.can} ${dayCanChi.chi}`] || '',
      napAmMonth: NAP_AM_MAPPING[`${monthCanChi.can} ${monthCanChi.chi}`] || '',
      napAmYear: NAP_AM_MAPPING[`${yearCanChi.can} ${yearCanChi.chi}`] || '',
      nguHanh: dayCanNguHanh,
    },
    truc: `${modifying.trucDetail.name} (${modifying.trucDetail.description})`,
    tu: `${modifying.tuDetail.name} (${modifying.tuDetail.description})`,
    year: `${yearCanChi.can} ${yearCanChi.chi} (${NAP_AM_MAPPING[`${yearCanChi.can} ${yearCanChi.chi}`] || ''})`,
    allHours: getAllHours(normalized),
    auspiciousHours: getAuspiciousHours(normalized),
    inauspiciousHours: getInauspiciousHours(normalized),
    goodStars: starLists.goodStars,
    badStars: starLists.badStars,
    dayGrade,
    deityStatus: foundational.isAuspiciousDay ? 'Ngày Hoàng Đạo' : 'Ngày Hắc Đạo',
    nguHanhGrade: nguHanh.nguHanhGrade || undefined,
    dayScore: finalScore,
    fengShuiDirections: foundational.auspiciousDirections,
    canChiInteractions: [],
    nguHanhInteraction: nguHanh.nguHanhInteraction,
    napAmInteraction,
    canChiXungHop,
    tietKhiDetail,
    thangAmThieuDu,
    advancedIndicators: [],
    foundationalLayer: {
      baseScore: foundational.baseScore,
      thanSat: foundational.thanSat,
      auspiciousDirections: foundational.auspiciousDirections,
    },
    modifyingLayer: modifying,
    dungSu,
    banhTo: {
      can: (banhToData.can as Record<string, string>)[dayCanChi.can] || '',
      chi: (banhToData.chi as Record<string, string>)[dayCanChi.chi] || '',
    },
    yearlyStars: getYearlyStars(yearCanChi.chi, lunar.year),
    napAmCompatibility: (() => {
      const dayNaIdx = getNapAmIndex(dayCanChi.can, dayCanChi.chi);
      const yearNaIdx = getNapAmIndex(yearCanChi.can, yearCanChi.chi);
      const comp = checkNapAmCompatibility(dayNaIdx, yearNaIdx);
      if (comp === 1) return `Hợp với ngũ hành của năm (${NAP_AM_MAPPING[`${yearCanChi.can} ${yearCanChi.chi}`]})`;
      if (comp === -1) return `Khắc với ngũ hành của năm (${NAP_AM_MAPPING[`${yearCanChi.can} ${yearCanChi.chi}`]})`;
      return 'Bình hòa với ngũ hành của năm';
    })(),
  };

  if (detailedDayDataCache.size >= DETAIL_DATE_CACHE_LIMIT) {
    const oldestKey = detailedDayDataCache.keys().next().value;
    if (oldestKey) detailedDayDataCache.delete(oldestKey);
  }
  detailedDayDataCache.set(detailKey, result);
  return result;
}
