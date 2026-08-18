import { describe, it, expect } from 'vitest';
import {
  gregorianToJD,
  jdToGregorian,
  getSunLongitude,
  solarToLunar,
  lunarToSolar,
  getTietKhi,
  findTietKhiTransition,
} from '@lich-viet/core';

describe('Lunar Engine - Core Computations', () => {
  it('calculates standard J2000 epoch JD correctly', () => {
    const jd = gregorianToJD(2000, 1, 1, 12, 0, 0);
    expect(jd).toBeCloseTo(2451545.0, 4);

    const g = jdToGregorian(2451545.0);
    expect(g.year).toBe(2000);
    expect(g.month).toBe(1);
    expect(g.day).toBe(1);
    expect(g.hour).toBe(12);
  });

  it('calculates apparent solar longitude within 0-360 degrees', () => {
    const jd = gregorianToJD(2026, 3, 20, 12, 0, 0);
    const long = getSunLongitude(jd);
    expect(long).toBeGreaterThanOrEqual(0);
    expect(long).toBeLessThan(360);
  });

  it('converts Tết Bính Ngọ 2026 correctly (2026-02-17 is 1/1/2026 Lunar)', () => {
    const lunar = solarToLunar(2026, 2, 17);
    expect(lunar.year).toBe(2026);
    expect(lunar.month).toBe(1);
    expect(lunar.day).toBe(1);
    expect(lunar.isLeapMonth).toBe(false);

    const solar = lunarToSolar(2026, 1, 1);
    expect(solar.year).toBe(2026);
    expect(solar.month).toBe(2);
    expect(solar.day).toBe(17);
  });

  it('handles leap month conversion and fast reverse lookup', () => {
    const lunar = solarToLunar(2025, 7, 25);
    expect(lunar.year).toBe(2025);
    expect(lunar.month).toBe(6);
    expect(lunar.isLeapMonth).toBe(true);

    const solar = lunarToSolar(2025, 6, lunar.day, true);
    expect(solar.year).toBe(2025);
    expect(solar.month).toBe(7);
    expect(solar.day).toBe(25);
  });

  it('computes 24 solar terms accurately', () => {
    const jd = gregorianToJD(2026, 2, 4, 12, 0, 0); // Near Lập Xuân
    const tietKhi = getTietKhi(jd);
    expect(tietKhi.nameVi).toBe('Lập Xuân');

    const transition = findTietKhiTransition(2026, 21); // Lập Xuân is term 21
    expect(transition.isoUtc7).toContain('2026-02-04');
  });
});
