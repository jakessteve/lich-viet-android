export interface LunarDate {
  day: number; // 1..30
  month: number; // 1..12
  year: number; // e.g. 2026
  isLeapMonth: boolean; // true if this month is Tháng Nhuận
  leapMonthNumber: number; // Month number that was repeated (or 0)
  jd: number;
}

const DEG2RAD = Math.PI / 180;
const TIMEZONE_OFFSET_HOURS = 7.0;

function INT(d: number): number {
  return Math.floor(d);
}

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
}

function jdToDate(jd: number): { day: number; month: number; year: number } {
  let a = jd;
  if (jd >= 2299161) {
    const alpha = INT((jd - 1867216.25) / 36524.25);
    a = jd + 1 + alpha - INT(alpha / 4);
  }
  const b = a + 1524;
  const c = INT((b - 122.1) / 365.25);
  const d = INT(365.25 * c);
  const e = INT((b - d) / 30.6001);
  const day = b - d - INT(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return { day, month, year };
}

function getNewMoonDay(k: number, timeZone = TIMEZONE_OFFSET_HOURS): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = DEG2RAD;

  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr);
  C1 += 0.0161 * Math.sin(2 * dr * Mpr);
  C1 -= 0.0004 * Math.sin(3 * dr * Mpr);
  C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 -= 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 += 0.001 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);

  let deltat: number;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000078 + 0.000282 * T + 0.0000218 * T2;
  }

  const JdNew = Jd1 + C1 - deltat;
  return INT(JdNew + 0.5 + timeZone / 24.0);
}

function SunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525.0;
  const T2 = T * T;
  const dr = DEG2RAD;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) % 360;
  if (L < 0) L += 360;
  return L;
}

function getSunLongitudeFromDayNumber(dayNumber: number, timeZone = TIMEZONE_OFFSET_HOURS): number {
  return INT(SunLongitude(dayNumber - 0.5 - timeZone / 24.0) / 30);
}

function getLunarMonth11(yy: number, timeZone = TIMEZONE_OFFSET_HOURS): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitudeFromDayNumber(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone = TIMEZONE_OFFSET_HOURS): number {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitudeFromDayNumber(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitudeFromDayNumber(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i < 14 ? i - 1 : 0;
}

/**
 * Pure TypeScript Hồ Ngọc Đức Lunar-Solar conversion algorithm anchored to UTC+7.
 */
export function solarToLunar(year: number, month: number, day: number): LunarDate {
  const dayNumber = jdFromDate(day, month, year);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, TIMEZONE_OFFSET_HOURS);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, TIMEZONE_OFFSET_HOURS);
  }

  let a11: number;
  let b11: number;

  const a11ThisYear = getLunarMonth11(year, TIMEZONE_OFFSET_HOURS);

  if (dayNumber >= a11ThisYear) {
    a11 = a11ThisYear;
    b11 = getLunarMonth11(year + 1, TIMEZONE_OFFSET_HOURS);
  } else {
    a11 = getLunarMonth11(year - 1, TIMEZONE_OFFSET_HOURS);
    b11 = a11ThisYear;
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  const leapMonthDiff = getLeapMonthOffset(a11, TIMEZONE_OFFSET_HOURS);
  let isLeap = 0;
  let lunarMonth = diff + 11;

  if (b11 - a11 > 365) {
    if (diff >= leapMonthDiff && leapMonthDiff > 0) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        isLeap = 1;
      }
    }
  }

  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }

  let lunarYear = year;
  if (lunarMonth >= 11 && month <= 3) {
    lunarYear = year - 1;
  } else if (lunarMonth <= 2 && month >= 11) {
    lunarYear = year + 1;
  }

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeapMonth: isLeap === 1,
    leapMonthNumber: leapMonthDiff > 0 ? ((leapMonthDiff + 9) % 12) + 1 : 0,
    jd: dayNumber,
  };
}

/**
 * Converts a Lunar date back to Solar (Gregorian) date in UTC+7 with O(1) targeted search.
 */
export function lunarToSolar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth = false,
): { year: number; month: number; day: number } {
  // Approximate starting JD for month 11 of previous year to month 11 of following year
  const a11Prev = getLunarMonth11(lunarYear - 1, TIMEZONE_OFFSET_HOURS);
  const kBase = INT((a11Prev - 2415021.076998695) / 29.530588853 + 0.5);

  // Search across the 15 lunar months spanning the lunar year
  for (let offset = 0; offset <= 15; offset++) {
    const nmDay = getNewMoonDay(kBase + offset, TIMEZONE_OFFSET_HOURS);
    const candidateJd = nmDay + lunarDay - 1;
    const date = jdToDate(candidateJd);
    try {
      const l = solarToLunar(date.year, date.month, date.day);
      if (l.year === lunarYear && l.month === lunarMonth && l.day === lunarDay && l.isLeapMonth === isLeapMonth) {
        return date;
      }
    } catch {
      // Continue search
    }
  }

  throw new Error(`Invalid lunar date: ${lunarDay}/${lunarMonth}/${lunarYear} (leap=${isLeapMonth})`);
}
