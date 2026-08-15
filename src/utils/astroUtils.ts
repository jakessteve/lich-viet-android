/**
 * Astronomical Utilities & Constants
 * High-precision algorithms based on Jean Meeus ("Astronomical Algorithms", 2nd ed.)
 * and Espenak & Meeus (NASA "Five Millennium Canon of Solar Eclipses: -1999 to +3000").
 */

export const JULIAN_DAY_UNIX_EPOCH = 2440587.5;
export const DAY_IN_MS = 24 * 60 * 60 * 1000;
export const PI = Math.PI;
export const DR = PI / 180;

/**
 * Normalizes an angle in degrees into [0, 360).
 */
export function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

/**
 * Calculates the shortest angular difference (target - current) in degrees, bounded to (-180, 180].
 */
export function shortestAngleDifference(target: number, current: number): number {
  const normalized = normalizeDegrees(target) - normalizeDegrees(current);
  if (normalized > 180) {
    return normalized - 360;
  }
  if (normalized < -180) {
    return normalized + 360;
  }
  return normalized;
}

/**
 * Converts Julian Day Number to Unix Milliseconds.
 */
export function julianDayToUnixMs(julianDay: number): number {
  if (!Number.isFinite(julianDay)) {
    throw new TypeError('julianDay must be a finite number');
  }
  return Math.round((julianDay - JULIAN_DAY_UNIX_EPOCH) * DAY_IN_MS);
}

/**
 * Converts date components to Julian Day Number (JDN).
 * Supports Gregorian and Julian calendars (pre-1582 transition).
 */
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

/**
 * Computes Julian Century from J2000.0 (JD 2451545.0).
 */
export function computeJulianCentury(julianDay: number): number {
  if (!Number.isFinite(julianDay)) {
    throw new TypeError('julianDay must be a finite number');
  }
  const T = (julianDay - 2451545) / 36525;
  return Math.max(-100, Math.min(100, T));
}

/**
 * Computes Delta T (TT - UT) in seconds.
 * 10-segment polynomial model from Espenak & Meeus (2006).
 */
export function computeDeltaT(julianDay: number): number {
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

/**
 * Computes Delta T in fractions of a day (seconds / 86400).
 */
export function computeDeltaTDays(julianDay: number): number {
  return computeDeltaT(julianDay) / 86400;
}
