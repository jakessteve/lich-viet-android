import { resolveVietnamHistoricalTimezone } from "@omce/canonical-db";
import { computeSolarLongitude, computeTrueLunarPosition, normalizeDegrees } from "./astronomy.js";

const PI = Math.PI;
const SYNODIC_MONTH = 29.530588853;
const NEW_MOON_EPOCH = 2415021.076998695;

function int(value) {
  return Math.floor(value);
}

function jdFromDate(dd, mm, yy) {
  const a = int((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  return dd + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - int(y / 100) + int(y / 400) - 32045;
}

function sunLongitudeIndex(jdn, timeZone) {
  const jdUT = jdn - timeZone / 24;
  const lon = computeSolarLongitude(jdUT);
  return int(lon / 30);
}

function approximateNewMoon(nmIndex) {
  const T = nmIndex / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const drVal = Math.PI / 180;

  let Jd1 = 2415020.75933 + SYNODIC_MONTH * nmIndex + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * drVal);

  const M = 359.2242 + 29.10535608 * nmIndex - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * nmIndex + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * nmIndex - 0.0016528 * T2 - 0.00000239 * T3;

  const Mr = M * drVal;
  const Mprr = Mpr * drVal;
  const Fr = F * drVal;

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

  let deltaT;
  if (T < -11) {
    deltaT = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltaT = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }

  return Jd1 + C1 - deltaT;
}


function exactNewMoon(nmIndex) {
  // Use the approximate new moon as the initial guess
  const initialGuess = approximateNewMoon(nmIndex);
  
  // Phase angle: Lunar Longitude - Solar Longitude
  // We want to find when phase angle crosses 0.
  let currentJd = initialGuess;
  
  for (let i = 0; i < 10; i++) {
    const sunLon = computeSolarLongitude(currentJd);
    const moonLon = computeTrueLunarPosition(currentJd).longitude;
    
    // delta = phase angle in [-180, 180]
    let delta = normalizeDegrees(moonLon - sunLon);
    if (delta > 180) delta -= 360;
    
    if (Math.abs(delta) < 0.0001) {
      break;
    }
    
    // Moon moves ~13.17 deg/day, Sun moves ~0.98 deg/day. Net rate ~12.19 deg/day
    // Use the approximation to step closer
    currentJd -= delta / 12.190749;
  }
  
  return currentJd;
}

function newMoon(nmIndex) {
  return exactNewMoon(nmIndex);
}

function getNewMoonDay(nmIndex, timeZone) {
  return int(newMoon(nmIndex) + 0.5 + timeZone / 24);
}

function getLunarMonth11(year, timeZone) {
  const off = jdFromDate(31, 12, year) - 2415021;
  const nmIndex = int(off / SYNODIC_MONTH);
  let nm = getNewMoonDay(nmIndex, timeZone);
  const sunLong = sunLongitudeIndex(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(nmIndex - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11, timeZone) {
  const nmIndex = int(0.5 + (a11 - NEW_MOON_EPOCH) / SYNODIC_MONTH);
  let last = 0;
  let i = 1;
  let arc = sunLongitudeIndex(getNewMoonDay(nmIndex + i, timeZone), timeZone);

  do {
    last = arc;
    i += 1;
    arc = sunLongitudeIndex(getNewMoonDay(nmIndex + i, timeZone), timeZone);
  } while (arc !== last && i < 14);

  return i - 1;
}

export function getLunarDate(date, location = null, fallbackTimezoneOffset = 7.0) {
  let timezoneOffsetHours = fallbackTimezoneOffset;
  if (location && (location.latitude !== undefined || location.countryCode)) {
    try {
      const htzc = resolveVietnamHistoricalTimezone(date, location);
      timezoneOffsetHours = htzc.offsetHours;
    } catch (err) {
      if (typeof location.timezone === "number") {
        timezoneOffsetHours = location.timezone;
      }
    }
  } else if (location && typeof location.timezone === "number") {
    timezoneOffsetHours = location.timezone;
  }

  const yy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  const dayNumber = jdFromDate(dd, mm, yy);
  const nmIndex = int((dayNumber - NEW_MOON_EPOCH) / SYNODIC_MONTH);
  let monthStart = getNewMoonDay(nmIndex + 1, timezoneOffsetHours);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(nmIndex, timezoneOffsetHours);
  }

  let a11 = getLunarMonth11(yy, timezoneOffsetHours);
  let b11 = a11;
  let lunarYear;

  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timezoneOffsetHours);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timezoneOffsetHours);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = int((monthStart - a11) / 29);
  let lunarLeap = 0;
  let lunarMonth = diff + 11;

  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timezoneOffsetHours);
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

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeapMonth: lunarLeap === 1
  };
}

export { sunLongitudeIndex, jdFromDate };

