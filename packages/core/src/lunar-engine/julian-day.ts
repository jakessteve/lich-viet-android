/**
 * Julian Day calculations based on Jean Meeus, Astronomical Algorithms, Chapter 7.
 * Pure TypeScript, zero I/O, deterministic.
 */

export function gregorianToJD(
  year: number,
  month: number,
  day: number,
  hour = 0,
  min = 0,
  sec = 0
): number {
  let Y = year;
  let M = month;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }

  const A = Math.floor(Y / 100);
  // Gregorian calendar reform correction
  const B = 2 - A + Math.floor(A / 4);

  const dayFraction = (hour + min / 60 + sec / 3600) / 24;
  const jd =
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    day +
    B -
    1524.5 +
    dayFraction;

  return jd;
}

export function jdToGregorian(jd: number): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const jdShifted = jd + 0.5;
  const Z = Math.floor(jdShifted);
  const F = jdShifted - Z;

  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }

  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const dayWithFraction = B - D - Math.floor(30.6001 * E) + F;
  const day = Math.floor(dayWithFraction);

  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;

  const dayRemainder = (dayWithFraction - day) * 24;
  const hour = Math.floor(dayRemainder);
  const minRemainder = (dayRemainder - hour) * 60;
  const minute = Math.floor(minRemainder);
  const second = Math.round((minRemainder - minute) * 60);

  return { year, month, day, hour, minute, second };
}
