import { getLunarDate, sunLongitudeIndex, jdFromDate } from '@omce/core-logic';
import { resolveVietnamHistoricalTimezone } from '@omce/canonical-db';
import { CAN, CHI, TIET_KHI_NAMES } from '../../utils/constants';

// We no longer need the actual WASM binary, as OMCE's core-logic
// provides deterministic astronomy parity via pure math/JS.
export type SwissEphemerisInstance = any;

export interface SwissLunarDate {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
  canChiDay: string;
  canChiMonth: string;
  canChiYear: string;
  solarTerm: string;
  boundaryWarnings: string[];
}

export interface SwissGeoLocation {
  longitude: number;
  timezoneOffsetHours: number;
}

let swissEphemerisPromise: Promise<any> | null = null;
let scheduledInit = false;

function getCanChiDayFromJd(jd: number): string {
  return `${CAN[(jd + 9) % 10]} ${CHI[(jd + 1) % 12]}`;
}

function getCanChiMonth(lunarMonth: number, lunarYear: number): string {
  const yearCanIndex = (lunarYear + 6) % 10;
  const monthCanIndex = (yearCanIndex * 2 + 2 + (lunarMonth - 1)) % 10;
  const monthChiIndex = (lunarMonth + 1) % 12;
  return `${CAN[monthCanIndex]} ${CHI[monthChiIndex]}`;
}

function getCanChiYear(lunarYear: number): string {
  return `${CAN[(lunarYear + 6) % 10]} ${CHI[(lunarYear + 8) % 12]}`;
}

export async function initSwissEphemeris(wasmPath = ''): Promise<any> {
  if (!swissEphemerisPromise) {
    swissEphemerisPromise = Promise.resolve({});
  }
  return swissEphemerisPromise;
}

export function scheduleSwissEphemerisInit(): void {
  if (scheduledInit || swissEphemerisPromise) return;
  scheduledInit = true;
  swissEphemerisPromise = Promise.resolve({});
}

export async function closeSwissEphemeris(): Promise<void> {
  swissEphemerisPromise = null;
}

export function getSwissEphemerisInstance(): any {
  return {};
}

/**
 * Replace the old JD-based lunar math with OMCE's getLunarDate
 */
export async function getAccurateLunarDate(
  date: Date,
  location?: SwissGeoLocation,
): Promise<SwissLunarDate> {
  // Extract timezone safely
  const tzRule = resolveVietnamHistoricalTimezone({
    timestamp: date.getTime(),
    latitude: 21.0285, // Fallback Hanoi
  });

  const timeZone = location?.timezoneOffsetHours ?? tzRule.offsetHours;
  
  // Use OMCE's core-logic for precise lunar conversion
  const lunar = getLunarDate(date, { timezone: timeZone });
  
  const jd = Math.floor(date.getTime() / 86400000 + 2440587.5);
  
  // Convert solar term index to name
  const yy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  const jdn = jdFromDate(dd, mm, yy);
  const termIdx = sunLongitudeIndex(jdn, timeZone);
  const solarTermName = TIET_KHI_NAMES[termIdx % 24];

  return {
    day: lunar.day,
    month: lunar.month,
    year: lunar.year,
    isLeap: lunar.isLeapMonth,
    canChiDay: getCanChiDayFromJd(jd),
    canChiMonth: getCanChiMonth(lunar.month, lunar.year),
    canChiYear: getCanChiYear(lunar.year),
    solarTerm: solarTermName,
    boundaryWarnings: [],
  };
}

export function solarDayToJd(date: Date, timeZone: number): number {
  return Math.floor(date.getTime() / 86400000 + 2440587.5) - 0.5 + (date.getHours() - timeZone) / 24;
}
