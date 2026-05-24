// ── Time Normalization for Vietnamese Historical Timezones ─────
// Pure TypeScript — zero React dependencies.
// Handles birth-time correction for Vietnam's complex timezone history,
// including the North/South divergence (1955–1975).

import timezoneData from '../../data/tuvi/vietnamTimezone.json';
import type { HistoricalVietnamRegion, TuViBirthLocation } from '../../types/tuvi';
import { CAN_NAMES, CHI_NAMES } from './constants';

// ── Types ───────────────────────────────────────────────────────

interface TimezonePeriod {
  from: string;
  to: string;
  utcOffset?: string;
  utcOffsetNorth?: string;
  utcOffsetSouth?: string;
  note: string;
}

interface TimezoneData {
  description: string;
  periods: TimezonePeriod[];
}

const { periods } = timezoneData as TimezoneData;
export const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Parse an offset string like "+07:00", "+08:00", or "+07:06:30"
 * into a float number of hours.
 */
function parseOffset(offsetStr: string): number {
  const sign = offsetStr.startsWith('-') ? -1 : 1;
  const clean = offsetStr.replace(/^[+-]/, '');
  const parts = clean.split(':').map(Number);
  const hours = parts[0];
  const minutes = parts[1] ?? 0;
  const seconds = parts[2] ?? 0;
  return sign * (hours + minutes / 60 + seconds / 3600);
}

/**
 * Compare two ISO date strings (YYYY-MM-DD) chronologically.
 */
function compareIsoDates(a: string, b: string): number {
  return a.localeCompare(b);
}

/**
 * Format a Date using its civil/local calendar fields.
 *
 * This intentionally avoids UTC serialization, because Tu Vi inputs and
 * historical offsets are evaluated as local civil dates.
 */
export function formatCivilDateYmd(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Read date parts in a specific IANA timezone and project them into a civil Date.
 *
 * This is used when we need the wall-clock values for a given timezone without
 * depending on locale-specific string parsing.
 */
export function getDatePartsInTimeZone(date: Date, timeZone: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') {
      parts[part.type] = part.value;
    }
  }

  return {
    year: Number(parts.year ?? date.getFullYear()),
    month: Number(parts.month ?? date.getMonth() + 1),
    day: Number(parts.day ?? date.getDate()),
    hour: Number(parts.hour ?? date.getHours()),
    minute: Number(parts.minute ?? date.getMinutes()),
    second: Number(parts.second ?? date.getSeconds()),
    millisecond: date.getMilliseconds(),
  };
}

/**
 * Find the timezone period that contains the given date.
 * Returns `null` if no period matches (e.g. gap 1912–1944 is covered).
 */
function findPeriod(date: Date): TimezonePeriod | null {
  const iso = formatCivilDateYmd(date);
  for (const period of periods) {
    if (compareIsoDates(iso, period.from) >= 0 && (period.to === 'present' || compareIsoDates(iso, period.to) <= 0)) {
      return period;
    }
  }
  return null;
}

/** Policy metadata returned when correcting a birth timestamp. */
export interface BirthTimeNormalizationResult {
  correctedDate: Date;
  offsetHours: number;
  historicalRegion?: HistoricalVietnamRegion;
  warnings: string[];
}

function inferHistoricalRegion(date: Date, birthLocation?: TuViBirthLocation): HistoricalVietnamRegion | undefined {
  const iso = formatCivilDateYmd(date);
  if (iso < '1955-07-01' || iso > '1975-04-30') {
    return undefined;
  }

  const hint = birthLocation?.historicalRegion;
  if (hint) {
    return hint;
  }

  if (typeof birthLocation?.lat === 'number') {
    if (birthLocation.lat >= 17.5) return 'north';
    if (birthLocation.lat <= 16) return 'south';
  }

  return undefined;
}

function isVietnamBirthLocation(birthLocation?: TuViBirthLocation): boolean {
  if (!birthLocation) {
    return true;
  }

  const countryCode = birthLocation.countryCode?.trim().toUpperCase();
  if (countryCode) {
    return countryCode === 'VN';
  }

  const countryName = birthLocation.countryName?.trim().toLowerCase();
  if (countryName) {
    return countryName.includes('vietnam') || countryName.includes('việt nam');
  }

  const locationName = birthLocation.locationName.trim().toLowerCase();
  if (locationName.includes('vietnam') || locationName.includes('việt nam')) {
    return true;
  }

  if (typeof birthLocation.lat === 'number' && typeof birthLocation.lng === 'number') {
    const inVietnamBounds =
      birthLocation.lat >= 8.0 &&
      birthLocation.lat <= 24.0 &&
      birthLocation.lng >= 102.0 &&
      birthLocation.lng <= 110.8;
    return inVietnamBounds;
  }

  return true;
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Returns the UTC offset in hours for the given date based on Vietnam's
 * historical timezone changes.
 *
 * - 1975-05-01 onward: +7 (ICT)
 * - 1955-07-01 … 1975-04-30: defaults to South (+8) unless overridden.
 * - Earlier periods: follows French Indochina / occupation rules.
 *
 * @param date      The local birth date.
 * @param timezone  Optional hint for the divergence period:
 *                  `'north'` → GMT+7, `'south'` → GMT+8 (default).
 * @returns Offset in hours (e.g. 7, 8, 7.1083…).
 */
export function getVietnamUtcOffset(date: Date, timezone: HistoricalVietnamRegion = 'south'): number {
  const period = findPeriod(date);
  if (!period) {
    // Fallback for uncovered gaps (e.g. 1912–1944 is actually covered
    // by the 1911-12-01 … 1944-12-31 block, so this is defensive only).
    return 7;
  }

  if (period.utcOffsetNorth && period.utcOffsetSouth) {
    const offsetStr = timezone === 'north' ? period.utcOffsetNorth : period.utcOffsetSouth;
    return parseOffset(offsetStr);
  }

  return parseOffset(period.utcOffset!);
}

/**
 * Normalizes a birth date to UTC+7 (modern Vietnam time ICT).
 *
 * - For births **1975-05-01 onward**: no correction needed.
 * - For births **before 1975**: applies the historical correction
 *   based on the period's UTC offset.
 *
 * The optional `timezone` parameter lets callers force the North/South
 * divergence (1955–1975) interpretation.
 *
 * @param date      The birth date as recorded (assumed local).
 * @param timezone  Optional hint: `'north'` or `'south'`.
 * @returns A new `Date` corrected to ICT.
 */
export function normalizeBirthTime(date: Date, timezone?: HistoricalVietnamRegion): Date {
  const period = findPeriod(date);

  // No period found or unified ICT period → return as-is
  if (!period || period.to === 'present') {
    return new Date(date.getTime());
  }

  const historicalOffset = getVietnamUtcOffset(date, timezone);
  const targetOffset = 7; // ICT
  const diffHours = targetOffset - historicalOffset;
  const diffMs = diffHours * 60 * 60 * 1000;

  return new Date(date.getTime() + diffMs);
}

/**
 * Normalizes a birth date while preserving audit metadata.
 *
 * - Applies Vietnam historical time corrections when relevant.
 * - Keeps modern dates unchanged.
 * - Emits a warning when the North/South split is ambiguous and no region hint was available.
 */
export function normalizeBirthTimeWithPolicy(
  date: Date,
  birthLocation?: TuViBirthLocation,
): BirthTimeNormalizationResult {
  const period = findPeriod(date);
  const warnings: string[] = [];
  const historicalRegion = inferHistoricalRegion(date, birthLocation);
  const isVietnam = isVietnamBirthLocation(birthLocation);

  if (!period || period.to === 'present') {
    return {
      correctedDate: new Date(date.getTime()),
      offsetHours: 7,
      historicalRegion,
      warnings,
    };
  }

  if (!isVietnam) {
    return {
      correctedDate: new Date(date.getTime()),
      offsetHours: birthLocation?.timezone ?? 7,
      historicalRegion: undefined,
      warnings,
    };
  }

  if (period.utcOffsetNorth && period.utcOffsetSouth && !historicalRegion) {
    warnings.push('Không xác định được Bắc/Nam Việt Nam cho giai đoạn 1955-1975; mặc định theo miền Nam.');
  }

  const resolvedRegion = historicalRegion ?? (period.utcOffsetNorth && period.utcOffsetSouth ? 'south' : undefined);
  const offsetHours = getVietnamUtcOffset(date, resolvedRegion ?? 'south');
  const targetOffset = 7;
  const diffHours = targetOffset - offsetHours;
  const diffMs = diffHours * 60 * 60 * 1000;

  return {
    correctedDate: new Date(date.getTime() + diffMs),
    offsetHours,
    historicalRegion: resolvedRegion,
    warnings,
  };
}

/**
 * Converts a 24-hour clock hour to the Địa Chi index.
 *
 * Branch boundaries (each branch spans 2 hours):
 * | Branch | Hours       |
 * |--------|-------------|
 * | Tý     | 23, 0       |
 * | Sửu    | 1, 2        |
 * | Dần    | 3, 4        |
 * | Mão    | 5, 6        |
 * | Thìn   | 7, 8        |
 * | Tỵ     | 9, 10       |
 * | Ngọ    | 11, 12      |
 * | Mùi    | 13, 14      |
 * | Thân   | 15, 16      |
 * | Dậu    | 17, 18      |
 * | Tuất   | 19, 20      |
 * | Hợi    | 21, 22      |
 *
 * @param hour  Hour in 24-hour format (0–23).
 * @returns Địa Chi index (0=Tý … 11=Hợi).
 */
export function getHourBranch(hour: number): number {
  // Wrap hour into 0–23, then map to branch index.
  const h = ((hour % 24) + 24) % 24;
  return Math.floor(((h + 1) % 24) / 2);
}

/**
 * Calculates the Thiên Can of the hour based on the day's Thiên Can
 * and the hour's Địa Chi.
 *
 * Rule: the hour Can sequence starts from a different Can depending on
 * the day Can:
 *
 * | Day Can          | Hour Tý starts with |
 * |------------------|---------------------|
 * | Giáp (0), Kỷ (5) | Giáp (0)            |
 * | Ất (1), Canh (6) | Bính (2)            |
 * | Bính (2), Tân (7)| Mậu (4)             |
 * | Đinh (3), Nhâm(8)| Canh (6)            |
 * | Mậu (4), Quý (9) | Nhâm (8)            |
 *
 * @param dayCan     The day's Thiên Can index (0=Giáp … 9=Quý).
 * @param hourBranch The hour's Địa Chi index (0=Tý … 11=Hợi).
 * @returns Thiên Can index for the hour.
 */
export function getHourCan(dayCan: number, hourBranch: number): number {
  // Determine base Can for Tý based on day Can group.
  // Groups: (Giáp/Kỷ)=0, (Ất/Canh)=2, (Bính/Tân)=4, (Đinh/Nhâm)=6, (Mậu/Quý)=8
  const baseCan = (dayCan % 5) * 2;
  return (baseCan + hourBranch) % 10;
}

/**
 * Formats a Can-Chi pair as a human-readable string.
 *
 * @param canIndex  Thiên Can index (0=Giáp … 9=Quý).
 * @param chiIndex  Địa Chi index (0=Tý … 11=Hợi).
 * @returns Formatted string, e.g. `"Giáp Tý"`.
 */
export function formatCanChi(canIndex: number, chiIndex: number): string {
  const can = CAN_NAMES[canIndex];
  const chi = CHI_NAMES[chiIndex];
  if (!can || !chi) {
    throw new Error(`Invalid Can-Chi indices: canIndex=${canIndex}, chiIndex=${chiIndex}`);
  }
  return `${can} ${chi}`;
}
