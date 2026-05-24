import { describe, it, expect } from 'vitest';
import { getPersonalDungSu } from '@/services/personalization/personalDungSu';

describe('personalDungSu', () => {
  describe('getPersonalDungSu()', () => {
    it('returns empty result when birthYear is null', () => {
      const result = getPersonalDungSu(null, 'Ngọ', ['Khai trương', 'Động thổ']);
      expect(result).toEqual({
        recommended: [],
        warned: [],
        regular: [],
      });
    });

    it('returns categorized activities for valid birth year and day Chi', () => {
      const result = getPersonalDungSu(1990, 'Ngọ', ['Khai trương', 'Động thổ']);
      expect(result).toHaveProperty('recommended');
      expect(result).toHaveProperty('warned');
      expect(result).toHaveProperty('regular');
      expect(Array.isArray(result.recommended)).toBe(true);
      expect(Array.isArray(result.warned)).toBe(true);
      expect(Array.isArray(result.regular)).toBe(true);
      // 1990 (Ngọ) vs Ngọ day => Bình Hòa, no boost/warning
      expect(result.regular.length).toBeGreaterThan(0);
    });

    it('boosts activities when day score is Đại Cát', () => {
      // 1992 is Thân; Tý day => Tam Hợp => Đại Cát
      const result = getPersonalDungSu(1992, 'Tý', ['Khai trương', 'Động thổ']);
      expect(result.recommended.length).toBeGreaterThan(0);
      result.recommended.forEach((act) => {
        expect(act.isBoosted).toBe(true);
        expect(act.score).toBeGreaterThanOrEqual(15);
      });
    });

    it('warns activities when day score is Đại Hung', () => {
      // 1992 is Thân; Dần day => Lục Xung => Đại Hung
      const result = getPersonalDungSu(1992, 'Dần', ['Khai trương', 'Động thổ']);
      expect(result.warned.length).toBeGreaterThan(0);
      result.warned.forEach((act) => {
        expect(act.isWarned).toBe(true);
        expect(act.score).toBeLessThan(5);
      });
    });
  });
});
