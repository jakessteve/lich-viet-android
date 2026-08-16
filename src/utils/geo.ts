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
  const isValidDate = date instanceof Date && Number.isFinite(date.getTime());
  const safeDate = isValidDate ? date : new Date(2000, 0, 1);

  if (!Number.isFinite(offsetHours)) {
    return {
      year: safeDate.getFullYear(),
      month: safeDate.getMonth() + 1,
      day: safeDate.getDate(),
      hour: safeDate.getHours(),
      minute: safeDate.getMinutes(),
      second: safeDate.getSeconds(),
      millisecond: safeDate.getMilliseconds(),
    };
  }

  const safeOffset = Math.max(MIN_TIMEZONE_OFFSET, Math.min(MAX_TIMEZONE_OFFSET, offsetHours));
  const shifted = new Date(safeDate.getTime() + safeOffset * 60 * 60 * 1000);
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
  const isValidDate = date instanceof Date && Number.isFinite(date.getTime());
  if (!isValidDate) {
    return new Date(2000, 0, 1);
  }

  if (!Number.isFinite(offsetHours)) {
    return new Date(date.getTime());
  }
  const parts = getDatePartsInOffset(date, offsetHours);
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, parts.millisecond);
}
