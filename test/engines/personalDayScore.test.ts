import { describe, it, expect } from 'vitest';
import {
  getYearChi,
  isTamHop,
  calculatePersonalDayScore,
  getYearThaiTueType,
} from '@/services/personalization/personalDayScore';

describe('personalDayScore', () => {
  describe('getYearChi()', () => {
    it('returns correct Chi for known years', () => {
      expect(getYearChi(2024)).toBe('Thìn');
      expect(getYearChi(1990)).toBe('Ngọ');
      expect(getYearChi(1992)).toBe('Thân');
    });
  });

  describe('isTamHop()', () => {
    it('returns true for Tam Hợp pair Dần-Ngọ', () => {
      expect(isTamHop('Dần', 'Ngọ')).toBe(true);
    });

    it('returns false for non-Tam Hợp pair Tý-Sửu', () => {
      expect(isTamHop('Tý', 'Sửu')).toBe(false);
    });
  });

  describe('calculatePersonalDayScore()', () => {
    it('returns a PersonalDayScore with correct actionScore for birth year 1990 and day Chi Ngọ', () => {
      const result = calculatePersonalDayScore(1990, 'Ngọ');
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('actionScore');
      expect(result!.actionScore).toBe(0); // Tam Hợp +3, Thái Tuế -1, Tương Hình -2
      expect(result!.label).toBe('Bình Hòa');
      expect(result!.isTamHop).toBe(true);
      expect(result!.isThaiTue).toBe(true);
    });

    it('returns null when birthYear is null', () => {
      const result = calculatePersonalDayScore(null, 'Ngọ');
      expect(result).toBeNull();
    });

    it('returns Đại Cát for Tam Hợp (Thân-Tý-Thìn)', () => {
      // 1992 is Nhâm Thân; Tý is in the same Tam Hợp group
      const result = calculatePersonalDayScore(1992, 'Tý');
      expect(result).not.toBeNull();
      expect(result!.actionScore).toBe(3);
      expect(result!.label).toBe('Đại Cát');
      expect(result!.isTamHop).toBe(true);
    });

    it('returns negative score for Lục Xung (Dần-Thân)', () => {
      // 1992 is Nhâm Thân; Dần clashes with Thân (Lục Xung)
      const result = calculatePersonalDayScore(1992, 'Dần');
      expect(result).not.toBeNull();
      expect(result!.actionScore).toBeLessThan(0);
      expect(result!.label).toBe('Đại Hung');
      expect(result!.isTuongXung).toBe(true);
    });
  });

  describe('getYearThaiTueType()', () => {
    it('returns correct Thái Tuế type for birth year vs target year', () => {
      // 1990 is Ngọ, 2024 is Thìn — no special relationship
      const result = getYearThaiTueType(1990, 2024);
      expect(result).toBeNull();
    });

    it('returns Xung Thái Tuế when years clash', () => {
      // 1990 is Ngọ, 2008 is Tý — Tý xung Ngọ
      const result = getYearThaiTueType(1990, 2008);
      expect(result).toBe('Xung Thái Tuế');
    });

    it('returns Trị Thái Tuế when years share the same Chi', () => {
      // 1990 is Ngọ, 2002 is Ngọ
      const result = getYearThaiTueType(1990, 2002);
      expect(result).toBe('Trị Thái Tuế (Năm bản mệnh)');
    });
  });
});
