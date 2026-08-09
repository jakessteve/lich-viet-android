// ── Time Normalization for Vietnamese Historical Timezones ─────
// Refactored to use @omce/canonical-db for historical timezone rules.

import { resolveVietnamHistoricalTimezone } from '@omce/canonical-db';
import type { HistoricalVietnamRegion, TuViBirthLocation } from '../../types/tuvi';
import { CHI_NAMES } from './constants';

export const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export function formatCivilDateYmd(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
  if (!birthLocation) return true;

  const countryCode = birthLocation.countryCode?.trim().toUpperCase();
  if (countryCode) return countryCode === 'VN';

  const countryName = birthLocation.countryName?.trim().toLowerCase();
  if (countryName) return countryName.includes('vietnam') || countryName.includes('việt nam');

  const locationName = birthLocation.locationName.trim().toLowerCase();
  if (locationName.includes('vietnam') || locationName.includes('việt nam')) return true;

  if (typeof birthLocation.lat === 'number' && typeof birthLocation.lng === 'number') {
    return birthLocation.lat >= 8.0 && birthLocation.lat <= 24.0 && birthLocation.lng >= 102.0 && birthLocation.lng <= 110.8;
  }

  return true;
}

export function getVietnamUtcOffset(date: Date, timezone: HistoricalVietnamRegion = 'south'): number {
  // Use a fallback latitude to simulate north/south for OMCE
  let lat = 10.76; // Ho Chi Minh (south)
  if (timezone === 'north') {
    lat = 21.02; // Hanoi (north)
  }
  
  const tzRule = resolveVietnamHistoricalTimezone({
    timestamp: date.getTime(),
    latitude: lat,
  });
  
  return tzRule.offsetHours;
}

export function normalizeBirthTime(date: Date, timezone?: HistoricalVietnamRegion): Date {
  const iso = formatCivilDateYmd(date);
  if (iso >= '1975-06-13') {
    return new Date(date.getTime());
  }

  const historicalOffset = getVietnamUtcOffset(date, timezone);
  const targetOffset = 7; // ICT
  const diffHours = targetOffset - historicalOffset;
  const diffMs = diffHours * 60 * 60 * 1000;

  return new Date(date.getTime() + diffMs);
}

export function normalizeBirthTimeWithPolicy(
  date: Date,
  birthLocation?: TuViBirthLocation,
): BirthTimeNormalizationResult {
  const warnings: string[] = [];
  const isVietnam = isVietnamBirthLocation(birthLocation);

  const iso = formatCivilDateYmd(date);
  if (iso >= '1975-06-13') {
    return {
      correctedDate: new Date(date.getTime()),
      offsetHours: 7,
      historicalRegion: undefined,
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

  const historicalRegion = inferHistoricalRegion(date, birthLocation);
  if (iso >= '1955-07-01' && iso <= '1975-04-30' && !historicalRegion) {
    warnings.push('Không xác định được Bắc/Nam Việt Nam cho giai đoạn 1955-1975; mặc định theo miền Nam.');
  }

  const resolvedRegion = historicalRegion ?? 'south';
  const offsetHours = getVietnamUtcOffset(date, resolvedRegion);
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

export function convertHourToBranch(date: Date): {
  branchIndex: number;
  branchName: string;
  isNextDay: boolean;
} {
  const h = date.getHours();
  if (h === 23) {
    return { branchIndex: 0, branchName: CHI_NAMES[0], isNextDay: true };
  }
  const branchIndex = Math.floor((h + 1) / 2) % 12;
  return { branchIndex, branchName: CHI_NAMES[branchIndex], isNextDay: false };
}

export function branchToNumber(branchName: string): number {
  return CHI_NAMES.indexOf(branchName as any) + 1;
}
