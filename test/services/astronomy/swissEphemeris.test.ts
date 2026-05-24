import { describe, expect, it } from 'vitest';
import { Planet } from '@swisseph/core';
import {
  findSwissNewMoon,
  findSwissSolarTermBoundary,
  getSwissSolarTerm,
  getSwissSunLongitude,
  getSwissTrueSolarCivilTime,
  getSwissTrueSolarCivilTimeForLocation,
  type SwissEphemerisInstance,
} from '@/services/astronomy/swissEphemeris';

const fakeSwe: SwissEphemerisInstance = {
  calculatePosition(jd, body) {
    if (body === Planet.Sun) {
      return {
        longitude: jd,
        latitude: 0,
        distance: 0,
        longitudeSpeed: 1,
        latitudeSpeed: 0,
        distanceSpeed: 0,
      };
    }
    return {
      longitude: 13 * jd,
      latitude: 0,
      distance: 0,
      longitudeSpeed: 13,
      latitudeSpeed: 0,
      distanceSpeed: 0,
    };
  },
  dateToJulianDay(date) {
    return date.getTime() / 86400000;
  },
  julianDay(year, month, day, hour = 0) {
    return Date.UTC(year, month - 1, day, Math.floor(hour)) / 86400000;
  },
  version() {
    return 'fake';
  },
  close() {},
};

const zeroEquationSwe: SwissEphemerisInstance = {
  calculatePosition() {
    return {
      longitude: 280.46607,
      latitude: 0,
      distance: 0,
      longitudeSpeed: 1,
      latitudeSpeed: 0,
      distanceSpeed: 0,
    };
  },
  dateToJulianDay() {
    return 2451545.0;
  },
  julianDay: fakeSwe.julianDay,
  version: fakeSwe.version,
  close: fakeSwe.close,
};

describe('swissEphemeris sidecar', () => {
  it('normalizes Swiss sun longitude results', () => {
    expect(getSwissSunLongitude(fakeSwe, 361)).toBe(1);
    expect(getSwissSunLongitude(fakeSwe, -1)).toBe(359);
  });

  it('maps solar longitude to the existing Tiết Khí order', () => {
    expect(getSwissSolarTerm(fakeSwe, 315)).toBe('Lập Xuân');
    expect(getSwissSolarTerm(fakeSwe, 0)).toBe('Xuân Phân');
  });

  it('solves solar term boundaries from longitude and speed', () => {
    const boundary = findSwissSolarTermBoundary(fakeSwe, 316, 315);
    expect(boundary).toBeCloseTo(315, 6);
  });

  it('solves new moon conjunctions from sun/moon longitude delta', () => {
    const newMoon = findSwissNewMoon(fakeSwe, 1);
    expect(newMoon).toBeCloseTo(0, 6);
  });

  it('keeps true-solar correction as civil clock time for Tu Vi inputs', () => {
    const corrected = getSwissTrueSolarCivilTime(zeroEquationSwe, new Date(1983, 10, 13, 18, 30), 106.5, 7);

    expect(corrected.getFullYear()).toBe(1983);
    expect(corrected.getMonth()).toBe(10);
    expect(corrected.getDate()).toBe(13);
    expect(corrected.getHours()).toBe(18);
    expect(corrected.getMinutes()).toBe(36);
  });

  it('supports location-aware true-solar correction for geolocation inputs', () => {
    const corrected = getSwissTrueSolarCivilTimeForLocation(zeroEquationSwe, new Date(1983, 10, 13, 18, 30), {
      longitude: 106.5,
      timezoneOffsetHours: 7,
    });

    expect(corrected.getFullYear()).toBe(1983);
    expect(corrected.getMonth()).toBe(10);
    expect(corrected.getDate()).toBe(13);
    expect(corrected.getHours()).toBe(18);
    expect(corrected.getMinutes()).toBe(36);
  });
});
