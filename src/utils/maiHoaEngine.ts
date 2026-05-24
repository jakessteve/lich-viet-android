// ── Mai Hoa Dịch Số — Hexagram Calculation Engine ──────────────
// Epic 2 (US_MH_01 → US_MH_05): Pure functions for Plum Blossom Numerology.
// All inputs as parameters, all outputs explicit. No side effects.

import type {
  Trigram,
  Hexagram,
  TimeBasedInput,
  NumberBasedInput,
  DivinationResult,
  NguHanh,
  CalendarMode,
  DivinationContext,
} from '../types/maiHoa';

import trigramData from '../data/phase_2/trigrams.json';
import napGiapData from '../data/phase_2/napGiap.json';

// Import Phase 1 calendar utilities for bridging
import {
  getCanChiYear,
  getCanChiMonth,
  getCanChiDay,
  getHourCanChi,
  getLunarDate,
  getJDN,
  getSolarTerm,
  getSolarMonth,
  parseCanChi,
} from './calendarEngine';
import { NGU_HANH_MAPPING, NGU_HANH_SINH, NGU_HANH_KHAC } from './constants';
import type { Chi } from '../types/calendar';

// ── Constants ──────────────────────────────────────────────────

/** Raw trigram data cast to typed array. */
const TRIGRAM_ARRAY: readonly Trigram[] = trigramData as unknown as readonly Trigram[];

/** O(1) trigram lookup by Tiên Thiên Bát Quái ID (1–8). */
const TRIGRAM_BY_ID: ReadonlyMap<number, Trigram> = new Map(TRIGRAM_ARRAY.map((t) => [t.id, t]));

/**
 * O(1) hexagram lookup by "upper:lower" trigram ID pair.
 * Key format: `${upperTrigramId}:${lowerTrigramId}`
 * Lazy-loaded from hexagrams.json (201 KB) on first access.
 */
let HEXAGRAM_BY_KEY: ReadonlyMap<string, Hexagram> | null = null;
let _hexagramLoadPromise: Promise<ReadonlyMap<string, Hexagram>> | null = null;

/**
 * Ensures hexagram data is loaded from the 201 KB JSON file.
 * Uses a singleton pattern — only loads once, subsequent calls return cached map.
 */
export async function ensureHexagramsLoaded(): Promise<ReadonlyMap<string, Hexagram>> {
  if (HEXAGRAM_BY_KEY) return HEXAGRAM_BY_KEY;
  if (!_hexagramLoadPromise) {
    _hexagramLoadPromise = import('../data/phase_2/hexagrams.json').then((mod) => {
      const data = (mod.default ?? mod) as readonly Hexagram[];
      HEXAGRAM_BY_KEY = new Map(data.map((h) => [`${h.upper}:${h.lower}`, h]));
      return HEXAGRAM_BY_KEY;
    });
  }
  return _hexagramLoadPromise;
}

/** Synchronous accessor — throws if hexagrams not yet loaded. */
function getHexagramMap(): ReadonlyMap<string, Hexagram> {
  if (!HEXAGRAM_BY_KEY) {
    throw new Error('Hexagram data not loaded. Call ensureHexagramsLoaded() before performing divination.');
  }
  return HEXAGRAM_BY_KEY;
}

/** Number of trigrams in the Bát Quái. */
const BAT_QUAI_COUNT = 8;

/** Number of lines in a hexagram. */
const HEXAGRAM_LINE_COUNT = 6;

/** Valid range for Mai Hoa Chi indices (1-based: 1=Tý, 12=Hợi). */
const CHI_INDEX_MIN = 1;
const CHI_INDEX_MAX = 12;

/** The solar hour at which the Tý boundary begins (23:00). */
const TY_BOUNDARY_HOUR = 23;

// ── Chi Index Guard ────────────────────────────────────────────

/**
 * Asserts that a Chi index is in the Phase 2 (Mai Hoa) 1-based range [1..12].
 *
 * **Why this exists:** Phase 1 calendar functions use 0-based Chi indices
 * (0=Tý, 11=Hợi), but Phase 2 divination uses 1-based (1=Tý, 12=Hợi).
 * If someone accidentally passes a Phase 1 index, the off-by-1 error
 * is silent and produces wrong hexagrams. This guard catches it.
 *
 * @throws {RangeError} if value is outside [1..12]
 */
export function assertMaiHoaChiIndex(value: number, label: string): void {
  if (!Number.isInteger(value) || value < CHI_INDEX_MIN || value > CHI_INDEX_MAX) {
    throw new RangeError(
      `${label} must be a 1-based Mai Hoa Chi index (${CHI_INDEX_MIN}–${CHI_INDEX_MAX}), got: ${value}. ` +
        `If you have a Phase 1 (0-based) index, add 1 before passing it here.`,
    );
  }
}

// ── Tý Boundary Helper ────────────────────────────────────────

/**
 * Adjusts a solar date for the Midnight Tý Boundary.
 *
 * In Vietnamese time-keeping, the Tý hour (23:00–01:00) belongs to the
 * **next** calendar day's Chi cycle. When the solar clock reads 23:00+,
 * a divination should use **tomorrow's** lunar date, not today's.
 *
 * This function returns a new Date advanced by +1 day if `hour >= 23`,
 * otherwise returns a clone of the original date (no mutation).
 *
 * @param date - The current solar date
 * @param hour - The solar hour (0–23)
 * @returns A Date representing the correct divination day
 */
export function adjustDateForTyBoundary(date: Date, hour: number): Date {
  const adjusted = new Date(date);
  if (hour >= TY_BOUNDARY_HOUR) {
    adjusted.setDate(adjusted.getDate() + 1);
  }
  return adjusted;
}

// ── Lookup Helpers ─────────────────────────────────────────────

/**
 * Returns the Trigram with the given Tiên Thiên ID (1–8).
 * Throws if the ID is out of range.
 */
export function getTrigramById(id: number): Trigram {
  const trigram = TRIGRAM_BY_ID.get(id);
  if (!trigram) {
    throw new RangeError(`Invalid trigram ID: ${id}. Must be 1–${BAT_QUAI_COUNT}.`);
  }
  return trigram;
}

/**
 * Returns the Hexagram whose upper & lower trigram IDs match.
 * Throws if no match is found.
 */
export function findHexagram(upperTrigramId: number, lowerTrigramId: number): Hexagram {
  const key = `${upperTrigramId}:${lowerTrigramId}`;
  const hex = getHexagramMap().get(key);
  if (!hex) {
    throw new RangeError(`No hexagram found for upper=${upperTrigramId}, lower=${lowerTrigramId}.`);
  }
  return hex;
}

// ── US_MH_01: Time-based Setup ─────────────────────────────────

/**
 * Computes the Chi index (1–12) for the current hour of the day.
 *
 * Vietnamese Chi hours:
 *   Tý = 23:00–01:00 (index 1)
 *   Sửu = 01:00–03:00 (index 2)
 *   ...
 *   Hợi = 21:00–23:00 (index 12)
 *
 * Formula: floor((hour + 1) / 2) % 12, then 0 → 12.
 */
export function getHourChiIndex(hour: number): number {
  if (hour < 0 || hour > 23) {
    throw new RangeError(`Invalid hour: ${hour}. Must be 0–23.`);
  }
  // Tý(1)=23-01, Sửu(2)=01-03, ... Hợi(12)=21-23
  // floor((hour+1)/2) % 12 gives 0-based; +1 converts to 1-based.
  return (Math.floor((hour + 1) / 2) % 12) + 1;
}

/**
 * Computes the Chi index (1–12) for a lunar year.
 *
 * Traditional mapping: (lunarYear + 8) % 12 gives CHI array index (0-based).
 * We convert to 1-based: 0 → 12.
 *
 * **Convention Note (Phase 1 ↔ Phase 2):**
 * Phase 1's `canchiHelper.ts` uses **0-based** Chi indices (0=Tý, 11=Hợi).
 * Phase 2 (Mai Hoa) uses **1-based** (1=Tý, 12=Hợi) because the Tiên Thiên
 * Bát Quái numbering requires modular arithmetic where 0 maps to the last
 * item (8 or 12), not the first. When bridging Phase 1 calendar data to
 * Phase 2 divination, add 1 to Phase 1's Chi index: `phase1Chi + 1`.
 */
export function getYearChiIndex(lunarYear: number): number {
  // (lunarYear + 8) % 12 gives 0-based CHI index (0=Tý).
  // +1 converts to Mai Hoa 1-based (1=Tý, 12=Hợi).
  return ((lunarYear + 8) % 12) + 1;
}

/**
 * Builds a `DivinationContext` consolidating all temporal metadata.
 * Optionally resolves Tiết Khí vs Lunar Month depending on mode.
 *
 * @param date - The exact JS Date for the reading (should be adjusted for Tý boundary)
 * @param calendarMode - Enum: 'lunar' | 'tietKhi'
 * @param method - 'Mai Hoa' | 'Nhập Số'
 * @param query - Optional user query string
 */
export function buildDivinationContext(
  date: Date,
  calendarMode: CalendarMode,
  method: 'Mai Hoa' | 'Nhập Số',
  query?: string,
): DivinationContext {
  const jd = getJDN(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const lunar = getLunarDate(date);

  const tkMonth = getSolarMonth(jd);

  // Bazi Year Adjustment: Bazi/Solar year changes at Lập Xuân (solarMonth 1), not Tet.
  let baziYear = date.getFullYear();
  if (tkMonth >= 11 && date.getMonth() < 2) {
    baziYear -= 1;
  }

  const tkMonthCanChi = getCanChiMonth(tkMonth, baziYear);
  const tkYearCanChi = getCanChiYear(baziYear);

  const yearCanChi = calendarMode === 'tietKhi' ? tkYearCanChi : getCanChiYear(lunar.year);
  const originalMonthCanChi = getCanChiMonth(lunar.month, lunar.year);
  const dayCanChi = getCanChiDay(date);

  const pd = parseCanChi(dayCanChi);
  const hourCanChiObj = getHourCanChi(pd.can, pd.chi);
  const hourCanChiStr = `${hourCanChiObj.can} ${hourCanChiObj.chi}`;

  const effectiveMonth = calendarMode === 'tietKhi' ? tkMonth : lunar.month;
  const effectiveMonthCanChi = calendarMode === 'tietKhi' ? tkMonthCanChi : originalMonthCanChi;

  const pm = parseCanChi(effectiveMonthCanChi);
  const nguyetLenhElement = NGU_HANH_MAPPING[pm.chi as Chi];
  const nhatThanElement = NGU_HANH_MAPPING[pd.chi as Chi];

  // Format UI strings
  const pad = (n: number) => String(n).padStart(2, '0');
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  // Note: getLunarDate returns {day, month, year, isLeap}, but we don't have Chi for the year as part of this string easily. Next lines format dates:
  const solarStr = `${hh}:${mm}:${ss} — ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  const lunarStr = `${lunar.day}/${lunar.month}/${lunar.year}${lunar.isLeap ? ' (Nhuận)' : ''}`;

  const tietKhi = getSolarTerm(jd);

  return {
    canChi: {
      year: yearCanChi,
      month: effectiveMonthCanChi,
      day: dayCanChi,
      hour: hourCanChiStr,
    },
    tietKhi,
    nhatThan: `${pd.chi}-${nhatThanElement}`,
    nguyetLenh: `${pm.chi}-${nguyetLenhElement}`,
    calendarMode,
    effectiveMonth,
    solarDate: solarStr,
    lunarDate: lunarStr,
    method,
    query,
  };
}

/**
 * Builds a `TimeBasedInput` from lunar calendar values.
 * This function does NOT perform the lunar date lookup — the caller
 * must provide the lunar day/month/year and the current hour.
 *
 * **Leap Month Convention:** Lunar leap months (tháng nhuận) re-use
 * the same month number as the regular month they follow. For example,
 * leap month 4 should be passed as `lunarMonth = 4`. The divination
 * formula treats the numeric value identically — the seasonal influence
 * is the same whether the month is leap or not.
 *
 * @param lunarYear - The lunar calendar year (e.g. 2026)
 * @param lunarMonth - The lunar month (1–12; leap months use the same number)
 * @param lunarDay - The lunar day (1–30)
 * @param currentHour - Solar hour of the day (0–23)
 */
export function buildTimeBasedInput(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  currentHour: number,
): TimeBasedInput {
  if (lunarMonth < 1 || lunarMonth > 12) {
    throw new RangeError(`Invalid lunar month: ${lunarMonth}. Must be 1–12.`);
  }
  if (lunarDay < 1 || lunarDay > 30) {
    throw new RangeError(`Invalid lunar day: ${lunarDay}. Must be 1–30.`);
  }
  return {
    yearChiIndex: getYearChiIndex(lunarYear),
    lunarMonth,
    lunarDay,
    hourChiIndex: getHourChiIndex(currentHour),
  };
}

// ── US_MH_02: Trigram Calculation ──────────────────────────────

/**
 * Maps a modulo-8 remainder to a Tiên Thiên Bát Quái ID.
 * Remainder 0 maps to 8 (Khôn), all others map directly.
 */
function mod8ToTrigramId(remainder: number): number {
  return remainder === 0 ? BAT_QUAI_COUNT : remainder;
}

/**
 * Computes the Upper Trigram (Ngoại Quái) from time-based input.
 *
 * Formula: (yearChiIndex + lunarMonth + lunarDay) mod 8
 */
export function calculateUpperTrigramFromTime(input: TimeBasedInput): Trigram {
  const sum = input.yearChiIndex + input.lunarMonth + input.lunarDay;
  const id = mod8ToTrigramId(sum % BAT_QUAI_COUNT);
  return getTrigramById(id);
}

/**
 * Computes the Lower Trigram (Nội Quái) from time-based input.
 *
 * Formula: (yearChiIndex + lunarMonth + lunarDay + hourChiIndex) mod 8
 */
export function calculateLowerTrigramFromTime(input: TimeBasedInput): Trigram {
  const sum = input.yearChiIndex + input.lunarMonth + input.lunarDay + input.hourChiIndex;
  const id = mod8ToTrigramId(sum % BAT_QUAI_COUNT);
  return getTrigramById(id);
}

/**
 * Computes the Upper Trigram from number-based input.
 *
 * Formula: num1 mod 8
 */
export function calculateUpperTrigramFromNumbers(input: NumberBasedInput): Trigram {
  const id = mod8ToTrigramId(input.num1 % BAT_QUAI_COUNT);
  return getTrigramById(id);
}

/**
 * Computes the Lower Trigram from number-based input.
 *
 * Formula: num2 mod 8
 */
export function calculateLowerTrigramFromNumbers(input: NumberBasedInput): Trigram {
  const id = mod8ToTrigramId(input.num2 % BAT_QUAI_COUNT);
  return getTrigramById(id);
}

// ── US_MH_03: Moving Line Calculation ──────────────────────────

/**
 * Calculates the Moving Line (Hào Động) from time-based input.
 *
 * Formula: (yearChiIndex + lunarMonth + lunarDay + hourChiIndex) mod 6
 * Remainder 0 maps to line 6 (top).
 * Returns 1–6 (1=bottom line).
 */
export function calculateMovingLineFromTime(input: TimeBasedInput): number {
  const sum = input.yearChiIndex + input.lunarMonth + input.lunarDay + input.hourChiIndex;
  const remainder = sum % HEXAGRAM_LINE_COUNT;
  return remainder === 0 ? HEXAGRAM_LINE_COUNT : remainder;
}

/**
 * Calculates the Moving Line from number-based input.
 *
 * Formula: (num1 + num2) mod 6
 */
export function calculateMovingLineFromNumbers(input: NumberBasedInput): number {
  const sum = input.num1 + input.num2;
  const remainder = sum % HEXAGRAM_LINE_COUNT;
  return remainder === 0 ? HEXAGRAM_LINE_COUNT : remainder;
}

// ── US_MH_04: Hexagram Generation ──────────────────────────────

/**
 * Returns the Main Hexagram (Quẻ Chủ) by looking up upper + lower trigrams.
 */
export function getMainHexagram(upper: Trigram, lower: Trigram): Hexagram {
  return findHexagram(upper.id, lower.id);
}

/**
 * Expands a hexagram into its 6 individual lines (boolean[6]).
 *
 * Index 0 = line 1 (bottom), Index 5 = line 6 (top).
 * Lines 1–3 come from the lower trigram, lines 4–6 from the upper trigram.
 *
 * @param upperTrigramId - ID of the upper (outer) trigram
 * @param lowerTrigramId - ID of the lower (inner) trigram
 */
export function expandHexagramLines(upperTrigramId: number, lowerTrigramId: number): readonly boolean[] {
  const lower = getTrigramById(lowerTrigramId);
  const upper = getTrigramById(upperTrigramId);
  // lines[0..2] = lower trigram (bottom to top within lower)
  // lines[3..5] = upper trigram (bottom to top within upper)
  return [...lower.lines, ...upper.lines];
}

/**
 * Builds a trigram from 3 boolean lines by searching the trigram database.
 */
function trigramFromLines(lines: readonly [boolean, boolean, boolean]): Trigram {
  const match = TRIGRAM_ARRAY.find(
    (t) => t.lines[0] === lines[0] && t.lines[1] === lines[1] && t.lines[2] === lines[2],
  );
  if (!match) {
    throw new Error(`No trigram matches lines [${lines.join(', ')}].`);
  }
  return match;
}

/**
 * Computes the Mutual Hexagram (Quẻ Hỗ).
 *
 * The Quẻ Hổ's upper trigram is formed from lines 3, 4, 5 of the main hexagram.
 * The Quẻ Hổ's lower trigram is formed from lines 2, 3, 4 of the main hexagram.
 * (Lines are 1-indexed; array is 0-indexed.)
 */
export function getMutualHexagram(mainHexagram: Hexagram): Hexagram {
  const lines = expandHexagramLines(mainHexagram.upper, mainHexagram.lower);
  // Lower trigram of Hổ: lines 2, 3, 4 → indices 1, 2, 3
  const hoLower = trigramFromLines([lines[1], lines[2], lines[3]] as [boolean, boolean, boolean]);
  // Upper trigram of Hổ: lines 3, 4, 5 → indices 2, 3, 4
  const hoUpper = trigramFromLines([lines[2], lines[3], lines[4]] as [boolean, boolean, boolean]);
  return findHexagram(hoUpper.id, hoLower.id);
}

/**
 * Computes the Changed Hexagram (Quẻ Biến) by inverting the Moving Line.
 *
 * @param mainHexagram - The Main Hexagram
 * @param movingLine - The moving line position (1–6, 1=bottom)
 */
export function getChangedHexagram(mainHexagram: Hexagram, movingLine: number): Hexagram {
  if (movingLine < 1 || movingLine > HEXAGRAM_LINE_COUNT) {
    throw new RangeError(`Invalid moving line: ${movingLine}. Must be 1–${HEXAGRAM_LINE_COUNT}.`);
  }
  const lines = [...expandHexagramLines(mainHexagram.upper, mainHexagram.lower)];
  // Invert the moving line (0-indexed: movingLine - 1)
  const lineIndex = movingLine - 1;
  lines[lineIndex] = !lines[lineIndex];
  // Reconstruct trigrams
  const newLower = trigramFromLines([lines[0], lines[1], lines[2]] as [boolean, boolean, boolean]);
  const newUpper = trigramFromLines([lines[3], lines[4], lines[5]] as [boolean, boolean, boolean]);
  return findHexagram(newUpper.id, newLower.id);
}

// ── US_MH_05: Thể and Dụng Determination ──────────────────────

/**
 * Determines which trigram is Thể (Body) and which is Dụng (Application).
 *
 * Rule:
 * - Moving line at position 1–3 (lower trigram has the change) →
 *   Lower is Dụng, Upper is Thể.
 * - Moving line at position 4–6 (upper trigram has the change) →
 *   Upper is Dụng, Lower is Thể.
 */
export function determineTheDung(movingLine: number): {
  theTrigram: 'upper' | 'lower';
  dungTrigram: 'upper' | 'lower';
} {
  if (movingLine < 1 || movingLine > HEXAGRAM_LINE_COUNT) {
    throw new RangeError(`Invalid moving line: ${movingLine}. Must be 1–${HEXAGRAM_LINE_COUNT}.`);
  }
  // Lines 1–3 belong to the lower trigram
  const LOWER_LINE_BOUNDARY = 3;
  if (movingLine <= LOWER_LINE_BOUNDARY) {
    return { theTrigram: 'upper', dungTrigram: 'lower' };
  }
  return { theTrigram: 'lower', dungTrigram: 'upper' };
}

// ── Phase 3A: Lục Thân & Nạp Giáp Derivation ───────────────────

/**
 * Resolves the Bát Cung (Family) and Thế/Ứng positions of a hexagram.
 * Implements the deterministic Kinh Dịch transformation rule:
 * Thuần -> Nhất -> Nhị -> Tam -> Tứ -> Ngũ -> Du Hồn -> Quy Hồn.
 */
export function resolveCungAndThe(hexagram: Hexagram): { cungTrigram: Trigram; the: number; ung: number } {
  const lines = expandHexagramLines(hexagram.upper, hexagram.lower);
  const l1 = lines[0],
    l2 = lines[1],
    l3 = lines[2];
  const u1 = lines[3],
    u2 = lines[4],
    u3 = lines[5];

  const m1 = l1 === u1;
  const m2 = l2 === u2;
  const m3 = l3 === u3;

  let cungLines: [boolean, boolean, boolean];
  let the: number;
  let ung: number;

  if (m1 && m2 && m3) {
    // Thuần (T, T, T)
    cungLines = [u1, u2, u3];
    the = 6;
    ung = 3;
  } else if (!m1 && m2 && m3) {
    // Nhất thế (F, T, T)
    cungLines = [u1, u2, u3];
    the = 1;
    ung = 4;
  } else if (!m1 && !m2 && m3) {
    // Nhị thế (F, F, T)
    cungLines = [u1, u2, u3];
    the = 2;
    ung = 5;
  } else if (!m1 && !m2 && !m3) {
    // Tam thế (F, F, F)
    cungLines = [u1, u2, u3];
    the = 3;
    ung = 6;
  } else if (m1 && !m2 && !m3) {
    // Tứ thế (T, F, F)
    cungLines = [!u1, u2, u3];
    the = 4;
    ung = 1;
  } else if (m1 && m2 && !m3) {
    // Ngũ thế (T, T, F)
    cungLines = [!u1, !u2, u3];
    the = 5;
    ung = 2;
  } else if (!m1 && m2 && !m3) {
    // Du hồn (F, T, F)
    cungLines = [u1, !u2, u3];
    the = 4;
    ung = 1;
  } else if (m1 && !m2 && m3) {
    // Quy hồn (T, F, T)
    cungLines = [l1, l2, l3];
    the = 3;
    ung = 6;
  } else {
    throw new Error('Invalid hexagram state for Cung derivation.');
  }

  return {
    cungTrigram: trigramFromLines(cungLines),
    the,
    ung,
  };
}

/**
 * Derives the Lục Thân relationship between the Hexagram's Cung and a specific hào.
 */
export function deriveLucThan(cungElement: NguHanh, haoElement: NguHanh): import('../types/maiHoa').LucThan {
  if (cungElement === haoElement) return 'Huynh Đệ';

  // Check generative (Sinh) relations
  const sinhCung = NGU_HANH_SINH[cungElement] as NguHanh; // What Cung produces
  if (haoElement === sinhCung) return 'Tử Tôn'; // Cung sinh Hào

  const sinhHao = NGU_HANH_SINH[haoElement] as NguHanh; // What Hào produces
  if (cungElement === sinhHao) return 'Phụ Mẫu'; // Hào sinh Cung

  // Check controlling (Khắc) relations
  const khacCung = NGU_HANH_KHAC[cungElement] as NguHanh; // What Cung controls
  if (haoElement === khacCung) return 'Thê Tài'; // Cung khắc Hào

  const khacHao = NGU_HANH_KHAC[haoElement] as NguHanh; // What Hào controls
  if (cungElement === khacHao) return 'Quan Quỷ'; // Hào khắc Cung

  throw new Error(`Failed to derive Lục Thân for Cung: ${cungElement}, Hào: ${haoElement}`);
}

/**
 * Resolves full per-hào metadata (Nạp Giáp, Lục Thân, Thế/Ứng) for a hexagram.
 */
export function resolveHaoDetails(hexagram: Hexagram, movingLine?: number): import('../types/maiHoa').HaoDetail[] {
  const { cungTrigram, the, ung } = resolveCungAndThe(hexagram);
  const cungElement = cungTrigram.element;
  const lines = expandHexagramLines(hexagram.upper, hexagram.lower);

  const napGiapMap = napGiapData.nap_giap as Record<string, { inner: string[]; outer: string[] }>;
  const napGiapRec = napGiapMap[String(hexagram.lower)];
  const lowerNap = napGiapRec?.inner || []; // lengths 3 (hào 1-3)
  const upperNapGiapRec = napGiapMap[String(hexagram.upper)];
  const upperNap = upperNapGiapRec?.outer || []; // lengths 3 (hào 4-6)

  const combinedNap = [...lowerNap, ...upperNap];

  return lines.map((isSolid, index) => {
    const pos = index + 1;
    const canChiStr = combinedNap[index];
    const { chi } = parseCanChi(canChiStr);
    const haoElement = NGU_HANH_MAPPING[chi as Chi] as NguHanh;
    const lucThan = deriveLucThan(cungElement, haoElement);

    return {
      position: pos,
      isSolid,
      can: canChiStr.split(' ')[0],
      chi,
      element: haoElement,
      lucThan,
      isTh: pos === the,
      isUng: pos === ung,
      isMoving: pos === movingLine,
    };
  });
}

// ── Orchestrator ───────────────────────────────────────────────

/**
 * Resolves the Ngũ Hành element of a trigram given its position in a hexagram.
 */
function getTrigramElement(hexagram: Hexagram, position: 'upper' | 'lower'): NguHanh {
  const trigramId = position === 'upper' ? hexagram.upper : hexagram.lower;
  return getTrigramById(trigramId).element;
}

/**
 * Validates that a number is a positive integer.
 */
function validatePositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive integer, got: ${value}`);
  }
}

/**
 * Assembles a complete DivinationResult from pre-computed trigrams and moving line.
 * Shared by both time-based and number-based orchestrators.
 */
function assembleDivinationResult(upper: Trigram, lower: Trigram, movingLine: number): DivinationResult {
  const mainHexagram = getMainHexagram(upper, lower);
  const mutualHexagram = getMutualHexagram(mainHexagram);
  const changedHexagram = getChangedHexagram(mainHexagram, movingLine);
  const { theTrigram, dungTrigram } = determineTheDung(movingLine);

  const mainHaoDetails = resolveHaoDetails(mainHexagram, movingLine);
  const mutualHaoDetails = resolveHaoDetails(mutualHexagram);
  const changedHaoDetails = resolveHaoDetails(changedHexagram);

  return {
    mainHexagram,
    mutualHexagram,
    changedHexagram,
    movingLine,
    theTrigram,
    dungTrigram,
    elements: {
      theElement: getTrigramElement(mainHexagram, theTrigram),
      dungElement: getTrigramElement(mainHexagram, dungTrigram),
    },
    mainHaoDetails,
    mutualHaoDetails,
    changedHaoDetails,
  };
}

/**
 * Performs a complete Mai Hoa divination from time-based input.
 *
 * Orchestrates US_MH_01 through US_MH_05 into a single `DivinationResult`.
 * Validates that Chi indices are 1-based (Phase 2 convention).
 */
export function performTimeBasedDivination(input: TimeBasedInput): DivinationResult {
  assertMaiHoaChiIndex(input.yearChiIndex, 'yearChiIndex');
  assertMaiHoaChiIndex(input.hourChiIndex, 'hourChiIndex');
  const upper = calculateUpperTrigramFromTime(input);
  const lower = calculateLowerTrigramFromTime(input);
  const movingLine = calculateMovingLineFromTime(input);
  return assembleDivinationResult(upper, lower, movingLine);
}

/**
 * Performs a complete Mai Hoa divination from number-based input.
 */
export function performNumberBasedDivination(input: NumberBasedInput): DivinationResult {
  validatePositiveInteger(input.num1, 'num1');
  validatePositiveInteger(input.num2, 'num2');
  const upper = calculateUpperTrigramFromNumbers(input);
  const lower = calculateLowerTrigramFromNumbers(input);
  const movingLine = calculateMovingLineFromNumbers(input);
  return assembleDivinationResult(upper, lower, movingLine);
}

// ── P3.2: Seasonal Element Strength Scoring ────────────────────

type SeasonalStrength = 'vượng' | 'tướng' | 'hưu' | 'tù' | 'tử';

/**
 * P3.2: Calculate the seasonal strength (Nguyệt Lệnh) of an element.
 *
 * In the Five Elements cycle, the ruling season determines which elements
 * are strong (vượng), growing (tướng), resting (hưu), imprisoned (tù), or dead (tử).
 *
 * Cycle: vượng → tướng → hưu → tù → tử follows the generation order.
 *
 * @param element - The element to evaluate
 * @param lunarMonth - Lunar month (1-12) to determine the ruling season
 * @returns Strength level and description
 */
export function calculateSeasonalStrength(
  element: NguHanh,
  lunarMonth: number,
): { strength: SeasonalStrength; label: string; score: number; description: string } {
  // Season determined by month: 1-3 Xuân(Mộc), 4-6 Hạ(Hỏa), 7-9 Thu(Kim), 10-12 Đông(Thủy)
  const seasonElements: NguHanh[] = ['Mộc', 'Hỏa', 'Kim', 'Thủy'];
  const seasonIdx = Math.max(0, Math.min(3, Math.floor((lunarMonth - 1) / 3)));
  const rulingElement = seasonElements[seasonIdx];

  // Generation cycle order (for relative position)
  const genOrder: NguHanh[] = ['Mộc', 'Hỏa', 'Thổ', 'Kim', 'Thủy'];
  const rulingIdx = genOrder.indexOf(rulingElement);
  const elementIdx = genOrder.indexOf(element);

  // Distance in the generation cycle from the ruling element
  const distance = (elementIdx - rulingIdx + 5) % 5;

  const levels: { strength: SeasonalStrength; label: string; score: number }[] = [
    { strength: 'vượng', label: 'Vượng (Thịnh)', score: 10 },
    { strength: 'tướng', label: 'Tướng (Phát triển)', score: 8 },
    { strength: 'hưu', label: 'Hưu (Nghỉ ngơi)', score: 5 },
    { strength: 'tù', label: 'Tù (Bị giam)', score: 3 },
    { strength: 'tử', label: 'Tử (Suy kiệt)', score: 1 },
  ];

  const level = levels[distance];
  const seasonNames = ['Xuân', 'Hạ', 'Thu', 'Đông'];

  return {
    ...level,
    description: `Hành ${element} trong mùa ${seasonNames[seasonIdx]} (${rulingElement} vượng): ${level.label}. ${
      distance === 0
        ? 'Đang ở đỉnh cao sức mạnh.'
        : distance === 1
          ? 'Được mùa sinh trợ, đang phát triển.'
          : distance === 2
            ? 'Mùa đã qua, sức yếu dần.'
            : distance === 3
              ? 'Bị mùa khắc chế, lực bị giam.'
              : 'Bị mùa hoàn toàn áp chế, lực cạn kiệt.'
    }`,
  };
}
