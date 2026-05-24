import { describe, it, expect } from 'vitest';
import {
  getLunarDate,
  getCanChiYear,
  getCanChiDay,
  getCanChiMonth,
  parseCanChi,
  getDayQuality,
  getAuspiciousHours,
  getDetailedDayData,
} from '@/utils/calendarEngine';

describe('calendarEngine', () => {
  describe('getLunarDate()', () => {
    it('converts solar to lunar correctly for Tết 2024 (known date)', () => {
      // Tết Nguyên Đán 2024: solar 2024-02-10 = lunar 1/1/2024
      const date = new Date(2024, 1, 10);
      const lunar = getLunarDate(date);
      expect(lunar.day).toBe(1);
      expect(lunar.month).toBe(1);
      expect(lunar.year).toBe(2024);
      expect(lunar.isLeap).toBe(false);
    });

    it('converts solar to lunar correctly for Tết 2025', () => {
      // Tết Nguyên Đán 2025: solar 2025-01-29 = lunar 1/1/2025
      const date = new Date(2025, 0, 29);
      const lunar = getLunarDate(date);
      expect(lunar.day).toBe(1);
      expect(lunar.month).toBe(1);
      expect(lunar.year).toBe(2025);
    });

    it('converts solar to lunar correctly for a mid-year date', () => {
      const date = new Date(2024, 5, 15); // 2024-06-15
      const lunar = getLunarDate(date);
      expect(lunar.day).toBe(10);
      expect(lunar.month).toBe(5);
      expect(lunar.year).toBe(2024);
    });
  });

  describe('getCanChiYear()', () => {
    it('returns correct Can Chi for known years', () => {
      expect(getCanChiYear(2024)).toBe('Giáp Thìn');
      expect(getCanChiYear(2025)).toBe('Ất Tỵ');
      expect(getCanChiYear(2026)).toBe('Bính Ngọ');
      expect(getCanChiYear(2000)).toBe('Canh Thìn');
      expect(getCanChiYear(1984)).toBe('Giáp Tý');
    });
  });

  describe('getCanChiDay()', () => {
    it('returns correct Can Chi for known dates', () => {
      // 2024-02-10 (Tết)
      expect(getCanChiDay(new Date(2024, 1, 10))).toBe('Giáp Thìn');
      // 2024-01-01
      expect(getCanChiDay(new Date(2024, 0, 1))).toBe('Giáp Tý');
      // 2025-01-01
      expect(getCanChiDay(new Date(2025, 0, 1))).toBe('Canh Ngọ');
    });
  });

  describe('getCanChiMonth()', () => {
    it('returns correct Can Chi for known months', () => {
      // Lunar month 1, 2024 (Giáp Thìn year)
      expect(getCanChiMonth(1, 2024)).toBe('Bính Dần');
      // Lunar month 2, 2024
      expect(getCanChiMonth(2, 2024)).toBe('Đinh Mão');
      // Lunar month 12, 2024
      expect(getCanChiMonth(12, 2024)).toBe('Đinh Sửu');
    });
  });

  describe('parseCanChi()', () => {
    it('parses Can Chi strings correctly', () => {
      expect(parseCanChi('Giáp Tý')).toEqual({ can: 'Giáp', chi: 'Tý' });
      expect(parseCanChi('Ất Sửu')).toEqual({ can: 'Ất', chi: 'Sửu' });
      expect(parseCanChi('Bính Dần')).toEqual({ can: 'Bính', chi: 'Dần' });
    });
  });

  describe('getDayQuality()', () => {
    it('returns quality assessment for dates', () => {
      const quality = getDayQuality(new Date(2024, 1, 10));
      expect(['Good', 'Bad', 'Neutral']).toContain(quality);
    });
  });

  describe('getAuspiciousHours()', () => {
    it('returns hour data for dates', () => {
      const hours = getAuspiciousHours(new Date(2024, 1, 10));
      expect(Array.isArray(hours)).toBe(true);
      hours.forEach((h) => {
        expect(h.isAuspicious).toBe(true);
        expect(typeof h.score).toBe('number');
        expect(h.canChi).toBeDefined();
      });
    });
  });

  describe('getDetailedDayData()', () => {
    it('returns complete day details', () => {
      const data = getDetailedDayData(new Date(2024, 1, 10));
      expect(data.solarDate).toBe('2024-02-10');
      expect(data.lunarDate).toBeDefined();
      expect(data.canChi).toBeDefined();
      expect(data.canChi.year).toBeDefined();
      expect(data.canChi.month).toBeDefined();
      expect(data.canChi.day).toBeDefined();
      expect(data.allHours).toBeDefined();
      expect(data.allHours.length).toBe(12);
      expect(data.dungSu).toBeDefined();
      expect(data.dungSu.suitable).toBeInstanceOf(Array);
      expect(data.dungSu.unsuitable).toBeInstanceOf(Array);
      expect(data.foundationalLayer).toBeDefined();
      expect(data.modifyingLayer).toBeDefined();
    });
  });
});
