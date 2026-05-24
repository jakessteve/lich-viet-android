import type { SwissEphemeris as BrowserSwissEphemeris } from '@swisseph/browser';
import { CalculationFlag, Planet } from '@swisseph/core';
import { CAN, CHI, TIET_KHI_NAMES } from '../../utils/constants';
import { getVietnamUtcOffset } from '../tuvi/timeNormalization';

export type SwissEphemerisInstance = Pick<
  BrowserSwissEphemeris,
  'calculatePosition' | 'dateToJulianDay' | 'julianDay' | 'version' | 'close'
>;

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
  /** Geographic longitude in decimal degrees */
  longitude: number;
  /** Local UTC offset in hours for the location */
  timezoneOffsetHours: number;
}

const SYNODIC_MONTH = 29.530588853;
const NEW_MOON_EPOCH = 2415021.076998695;
const DEFAULT_WASM_PATH = '/swisseph.wasm';
const DEFAULT_FLAGS = CalculationFlag.MoshierEphemeris | CalculationFlag.Speed;
const BOUNDARY_WARNING_SECONDS = 300;

let swissEphemerisPromise: Promise<BrowserSwissEphemeris> | null = null;
let swissEphemerisInstance: BrowserSwissEphemeris | null = null;
let scheduledInit = false;

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function signedLongitudeDelta(from: number, to: number): number {
  return ((from - to + 540) % 360) - 180;
}

function jdFromDate(day: number, month: number, year: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function getNewMoonDay(swe: SwissEphemerisInstance, k: number, timeZone: number): number {
  const approxJd = NEW_MOON_EPOCH + k * SYNODIC_MONTH;
  return Math.floor(findSwissNewMoon(swe, approxJd) + 0.5 + timeZone / 24);
}

function getSunLongitudeIndex(swe: SwissEphemerisInstance, jdn: number, timeZone: number): number {
  const jd = jdn - 0.5 + (12 - timeZone) / 24;
  return Math.floor(getSwissSunLongitude(swe, jd) / 30);
}

function getLunarMonth11(swe: SwissEphemerisInstance, year: number, timeZone: number): number {
  const off = jdFromDate(31, 12, year) - 2415021;
  const k = Math.floor(off / SYNODIC_MONTH);
  let newMoon = getNewMoonDay(swe, k, timeZone);
  if (getSunLongitudeIndex(swe, newMoon, timeZone) >= 9) {
    newMoon = getNewMoonDay(swe, k - 1, timeZone);
  }
  return newMoon;
}

function getLeapMonthOffset(swe: SwissEphemerisInstance, a11: number, timeZone: number): number {
  const k = Math.floor(0.5 + (a11 - NEW_MOON_EPOCH) / SYNODIC_MONTH);
  let i = 1;
  let arc = getSunLongitudeIndex(swe, getNewMoonDay(swe, k + i, timeZone), timeZone);

  while (i < 14) {
    const last = arc;
    i += 1;
    arc = getSunLongitudeIndex(swe, getNewMoonDay(swe, k + i, timeZone), timeZone);
    if (arc === last) {
      break;
    }
  }

  return i - 1;
}

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

function solarDayToJd(date: Date, timeZone: number): number {
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600 + date.getMilliseconds() / 3600000;
  return jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear()) - 0.5 + (hour - timeZone) / 24;
}

export async function initSwissEphemeris(wasmPath = DEFAULT_WASM_PATH): Promise<BrowserSwissEphemeris> {
  if (!swissEphemerisPromise) {
    swissEphemerisPromise = import('@swisseph/browser').then(async ({ SwissEphemeris }) => {
      const swe = new SwissEphemeris();
      await swe.init(wasmPath);
      swissEphemerisInstance = swe;
      return swe;
    });
  }
  return swissEphemerisPromise;
}

export function scheduleSwissEphemerisInit(): void {
  if (scheduledInit || swissEphemerisPromise) return;
  scheduledInit = true;

  const start = () => {
    void initSwissEphemeris().catch(() => {
      scheduledInit = false;
    });
  };

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 4000 });
    return;
  }

  globalThis.setTimeout(start, 1200);
}

export async function closeSwissEphemeris(): Promise<void> {
  const swe = await swissEphemerisPromise;
  swe?.close();
  swissEphemerisPromise = null;
  swissEphemerisInstance = null;
}

export function getSwissEphemerisInstance(): BrowserSwissEphemeris | null {
  return swissEphemerisInstance;
}

export function getSwissSunLongitude(swe: SwissEphemerisInstance, julianDay: number): number {
  return normalizeDegrees(swe.calculatePosition(julianDay, Planet.Sun, DEFAULT_FLAGS).longitude);
}

export function findSwissNewMoon(swe: SwissEphemerisInstance, julianDaySearch: number): number {
  let jd = julianDaySearch;
  for (let i = 0; i < 10; i += 1) {
    const sun = swe.calculatePosition(jd, Planet.Sun, DEFAULT_FLAGS);
    const moon = swe.calculatePosition(jd, Planet.Moon, DEFAULT_FLAGS);
    const delta = signedLongitudeDelta(moon.longitude, sun.longitude);
    const speed = (moon.longitudeSpeed || 13.176) - (sun.longitudeSpeed || 0.9856);
    const step = delta / speed;
    jd -= step;
    if (Math.abs(step) < 0.00001) {
      break;
    }
  }
  return jd;
}

export function findSwissSolarTermBoundary(
  swe: SwissEphemerisInstance,
  julianDaySearch: number,
  targetLongitude: number,
): number {
  let jd = julianDaySearch;
  for (let i = 0; i < 10; i += 1) {
    const sun = swe.calculatePosition(jd, Planet.Sun, DEFAULT_FLAGS);
    const delta = signedLongitudeDelta(sun.longitude, targetLongitude);
    const step = delta / (sun.longitudeSpeed || 0.9856);
    jd -= step;
    if (Math.abs(step) < 0.00001) {
      break;
    }
  }
  return jd;
}

export function getSwissSolarTerm(swe: SwissEphemerisInstance, julianDay: number): string {
  const longitude = getSwissSunLongitude(swe, julianDay);
  return TIET_KHI_NAMES[Math.floor(longitude / 15)];
}

export function getSwissTrueSolarTime(swe: SwissEphemerisInstance, utcDate: Date, longitude: number): Date {
  const jd = swe.dateToJulianDay(utcDate);
  const T = (jd - 2451545.0) / 36525;
  const meanLongitude = normalizeDegrees(280.46607 + 36000.7698 * T + 0.0003032 * T * T);
  const sun = swe.calculatePosition(
    jd,
    Planet.Sun,
    CalculationFlag.MoshierEphemeris | CalculationFlag.Equatorial | CalculationFlag.Speed,
  );
  const equationOfTimeHours = signedLongitudeDelta(meanLongitude, sun.longitude) / 15;
  const utcHours =
    utcDate.getUTCHours() +
    utcDate.getUTCMinutes() / 60 +
    utcDate.getUTCSeconds() / 3600 +
    utcDate.getUTCMilliseconds() / 3600000;
  const trueSolarHours = utcHours + longitude / 15 + equationOfTimeHours;
  const result = new Date(utcDate.getTime());
  result.setUTCHours(0, 0, 0, 0);
  result.setTime(result.getTime() + Math.round(trueSolarHours * 3600 * 1000));
  return result;
}

export function getSwissTrueSolarCivilTime(
  swe: SwissEphemerisInstance,
  civilDate: Date,
  longitude: number,
  timezoneOffsetHours: number,
): Date {
  // Tu Vi charting consumes Date fields as civil clock time; keep the Swiss UTC math
  // isolated so true-solar correction does not roll the chart into another local day.
  const civilUtcMillis =
    Date.UTC(
      civilDate.getFullYear(),
      civilDate.getMonth(),
      civilDate.getDate(),
      civilDate.getHours(),
      civilDate.getMinutes(),
      civilDate.getSeconds(),
      civilDate.getMilliseconds(),
    ) -
    Math.round(timezoneOffsetHours * 60) * 60_000;
  const trueSolarUtcEncoded = getSwissTrueSolarTime(swe, new Date(civilUtcMillis), longitude);

  return new Date(
    trueSolarUtcEncoded.getUTCFullYear(),
    trueSolarUtcEncoded.getUTCMonth(),
    trueSolarUtcEncoded.getUTCDate(),
    trueSolarUtcEncoded.getUTCHours(),
    trueSolarUtcEncoded.getUTCMinutes(),
    trueSolarUtcEncoded.getUTCSeconds(),
    trueSolarUtcEncoded.getUTCMilliseconds(),
  );
}

/**
 * Convenience wrapper for location-aware true solar conversion.
 */
export function getSwissTrueSolarCivilTimeForLocation(
  swe: SwissEphemerisInstance,
  civilDate: Date,
  location: SwissGeoLocation,
): Date {
  return getSwissTrueSolarCivilTime(swe, civilDate, location.longitude, location.timezoneOffsetHours);
}

export async function getSwissLunarDate(
  date: Date,
  region: 'north' | 'south' = 'south',
  swe?: SwissEphemerisInstance,
  location?: SwissGeoLocation,
): Promise<SwissLunarDate> {
  const engine = swe ?? (await initSwissEphemeris());
  return buildSwissLunarDate(engine, date, region, location);
}

export function getSwissLunarDateIfReady(
  date: Date,
  region: 'north' | 'south' = 'south',
  swe?: SwissEphemerisInstance,
  location?: SwissGeoLocation,
): SwissLunarDate | null {
  const engine = swe ?? swissEphemerisInstance;
  if (!engine) return null;
  return buildSwissLunarDate(engine, date, region, location);
}

function buildSwissLunarDate(
  engine: SwissEphemerisInstance,
  date: Date,
  region: 'north' | 'south',
  location?: SwissGeoLocation,
): SwissLunarDate {
  const timeZone = location?.timezoneOffsetHours ?? getVietnamUtcOffset(date, region);
  const dayNumber = jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const k = Math.floor((dayNumber - NEW_MOON_EPOCH) / SYNODIC_MONTH);
  let monthStart = getNewMoonDay(engine, k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(engine, k, timeZone);
  }

  let a11 = getLunarMonth11(engine, date.getFullYear(), timeZone);
  let b11 = a11;
  let lunarYear: number;

  if (a11 >= monthStart) {
    lunarYear = date.getFullYear();
    a11 = getLunarMonth11(engine, date.getFullYear() - 1, timeZone);
  } else {
    lunarYear = date.getFullYear() + 1;
    b11 = getLunarMonth11(engine, date.getFullYear() + 1, timeZone);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = 0;
  let lunarMonth = diff + 11;

  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(engine, a11, timeZone);
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

  const jd = solarDayToJd(date, timeZone);
  const sunLongitude = getSwissSunLongitude(engine, jd);
  const solarTerm = TIET_KHI_NAMES[Math.floor(sunLongitude / 15)];
  const nearestTermLongitude = normalizeDegrees(Math.round(sunLongitude / 15) * 15);
  const boundaryJd = findSwissSolarTermBoundary(engine, jd, nearestTermLongitude);
  const boundaryDiffSeconds = Math.abs(jd - boundaryJd) * 86400;
  const boundaryWarnings =
    boundaryDiffSeconds <= BOUNDARY_WARNING_SECONDS
      ? [
          `Thời điểm cách ranh giới Tiết Khí ${TIET_KHI_NAMES[Math.round(nearestTermLongitude / 15) % 24]} khoảng ${Math.round(boundaryDiffSeconds)} giây.`,
        ]
      : [];

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeap: lunarLeap === 1,
    canChiDay: getCanChiDayFromJd(dayNumber),
    canChiMonth: getCanChiMonth(lunarMonth, lunarYear),
    canChiYear: getCanChiYear(lunarYear),
    solarTerm,
    boundaryWarnings,
  };
}
