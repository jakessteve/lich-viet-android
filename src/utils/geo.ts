import type { SwissGeoLocation } from '@/services/astronomy/swissEphemeris';

const MIN_TIMEZONE_OFFSET = -12;
const MAX_TIMEZONE_OFFSET = 14;

export function estimateTimezoneOffsetHours(longitude: number): number {
  if (!Number.isFinite(longitude)) {
    return 7;
  }
  return Math.max(MIN_TIMEZONE_OFFSET, Math.min(MAX_TIMEZONE_OFFSET, Math.round(longitude / 15)));
}

export function buildSwissGeoLocation(longitude: number): SwissGeoLocation {
  const safeLongitude = Number.isFinite(longitude) ? longitude : 0;
  return {
    longitude: safeLongitude,
    timezoneOffsetHours: estimateTimezoneOffsetHours(safeLongitude),
  };
}

export function getDatePartsInOffset(date: Date, offsetHours: number) {
  if (!Number.isFinite(offsetHours)) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds(),
    };
  }

  const shifted = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    millisecond: shifted.getUTCMilliseconds(),
  };
}

export function getCivilDateForOffset(date: Date, offsetHours: number): Date {
  if (!Number.isFinite(offsetHours)) {
    return new Date(date.getTime());
  }
  const parts = getDatePartsInOffset(date, offsetHours);
  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );
}
