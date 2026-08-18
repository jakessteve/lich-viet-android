import { describe, it, expect } from 'vitest';
import {
  solarToLunar,
  lunarToSolar,
  getYearCanChi,
  getDayCanChi,
  getAuspiciousHoursForDay,
  gregorianToJD,
} from '@lich-viet/core';

describe('Bit-Parity Daily Stress Test Suite (2024-01-01 through 2026-12-31, 1096 Days)', () => {
  it('guarantees 100% mathematical reversibility and valid domain rules for every consecutive day in 2024-2026', () => {
    const startDate = new Date(2024, 0, 1);
    const totalDays = 1096; // 3 full years including leap year 2024

    for (let offset = 0; offset < totalDays; offset++) {
      const current = new Date(startDate.getTime() + offset * 86400000);
      const sYear = current.getFullYear();
      const sMonth = current.getMonth() + 1;
      const sDay = current.getDate();

      // 1. Solar to Lunar
      const lunar = solarToLunar(sYear, sMonth, sDay);
      expect(lunar.day).toBeGreaterThanOrEqual(1);
      expect(lunar.day).toBeLessThanOrEqual(30);
      expect(lunar.month).toBeGreaterThanOrEqual(1);
      expect(lunar.month).toBeLessThanOrEqual(12);

      // 2. Exact Reversibility: lunarToSolar(solarToLunar(d)) === d
      const reversed = lunarToSolar(lunar.year, lunar.month, lunar.day, lunar.isLeapMonth);
      expect(reversed.year, `Reversibility year fail for ${sYear}-${sMonth}-${sDay}`).toBe(sYear);
      expect(reversed.month, `Reversibility month fail for ${sYear}-${sMonth}-${sDay}`).toBe(sMonth);
      expect(reversed.day, `Reversibility day fail for ${sYear}-${sMonth}-${sDay}`).toBe(sDay);

      // 3. Can Chi validity
      const yearCanChi = getYearCanChi(lunar.year);
      expect(yearCanChi.name.length).toBeGreaterThan(0);

      const jd = gregorianToJD(sYear, sMonth, sDay, 12, 0, 0);
      const dayCanChi = getDayCanChi(jd);
      expect(dayCanChi.name.length).toBeGreaterThan(0);

      // 4. Auspicious hours balance (6 Hoang Dao, 6 Hac Dao)
      const hours = getAuspiciousHoursForDay(dayCanChi.chi);
      expect(hours.filter((h) => h.isHoangDao).length).toBe(6);
      expect(hours.filter((h) => !h.isHoangDao).length).toBe(6);
    }
  });
});
