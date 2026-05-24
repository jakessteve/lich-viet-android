import { describe, it, expect } from 'vitest';
import {
  ensureHexagramsLoaded,
  getHourChiIndex,
  getYearChiIndex,
  buildTimeBasedInput,
  calculateUpperTrigramFromTime,
  calculateLowerTrigramFromTime,
  calculateMovingLineFromTime,
  performTimeBasedDivination,
  performNumberBasedDivination,
  adjustDateForTyBoundary,
  getTrigramById,
  buildDivinationContext,
} from '@/utils/maiHoaEngine';

describe('maiHoaEngine', () => {
  beforeAll(async () => {
    await ensureHexagramsLoaded();
  });

  describe('getHourChiIndex()', () => {
    it('returns 1 for Tý hour (23:00)', () => {
      expect(getHourChiIndex(23)).toBe(1);
    });

    it('returns 1 for Tý hour (00:00)', () => {
      expect(getHourChiIndex(0)).toBe(1);
    });

    it('returns 2 for Sửu hour (01:00)', () => {
      expect(getHourChiIndex(1)).toBe(2);
    });

    it('returns 12 for Hợi hour (21:00)', () => {
      expect(getHourChiIndex(21)).toBe(12);
    });

    it('returns 12 for Hợi hour (22:00)', () => {
      expect(getHourChiIndex(22)).toBe(12);
    });

    it('throws for invalid hour', () => {
      expect(() => getHourChiIndex(24)).toThrow(RangeError);
      expect(() => getHourChiIndex(-1)).toThrow(RangeError);
    });
  });

  describe('getYearChiIndex()', () => {
    it('returns correct 1-based Chi index for known years', () => {
      // 2024 = Giáp Thìn, Thìn is index 4 in 0-based, so 5 in 1-based
      expect(getYearChiIndex(2024)).toBe(5);
      // 2025 = Ất Tỵ, Tỵ is index 5 in 0-based, so 6 in 1-based
      expect(getYearChiIndex(2025)).toBe(6);
      // 2020 = Canh Tý, Tý is index 0 in 0-based, so 1 in 1-based
      expect(getYearChiIndex(2020)).toBe(1);
    });
  });

  describe('buildTimeBasedInput()', () => {
    it('builds valid input for a date', () => {
      const input = buildTimeBasedInput(2024, 1, 1, 12);
      expect(input.yearChiIndex).toBe(getYearChiIndex(2024));
      expect(input.lunarMonth).toBe(1);
      expect(input.lunarDay).toBe(1);
      expect(input.hourChiIndex).toBe(getHourChiIndex(12));
    });

    it('throws for invalid lunar month', () => {
      expect(() => buildTimeBasedInput(2024, 13, 1, 12)).toThrow(RangeError);
      expect(() => buildTimeBasedInput(2024, 0, 1, 12)).toThrow(RangeError);
    });

    it('throws for invalid lunar day', () => {
      expect(() => buildTimeBasedInput(2024, 1, 31, 12)).toThrow(RangeError);
      expect(() => buildTimeBasedInput(2024, 1, 0, 12)).toThrow(RangeError);
    });
  });

  describe('calculateUpperTrigramFromTime()', () => {
    it('returns a valid trigram', () => {
      const input = buildTimeBasedInput(2024, 1, 1, 12);
      const trigram = calculateUpperTrigramFromTime(input);
      expect(trigram).toBeDefined();
      expect(trigram.id).toBeGreaterThanOrEqual(1);
      expect(trigram.id).toBeLessThanOrEqual(8);
    });
  });

  describe('calculateLowerTrigramFromTime()', () => {
    it('returns a valid trigram', () => {
      const input = buildTimeBasedInput(2024, 1, 1, 12);
      const trigram = calculateLowerTrigramFromTime(input);
      expect(trigram).toBeDefined();
      expect(trigram.id).toBeGreaterThanOrEqual(1);
      expect(trigram.id).toBeLessThanOrEqual(8);
    });
  });

  describe('calculateMovingLineFromTime()', () => {
    it('returns a line between 1 and 6', () => {
      const input = buildTimeBasedInput(2024, 1, 1, 12);
      const line = calculateMovingLineFromTime(input);
      expect(line).toBeGreaterThanOrEqual(1);
      expect(line).toBeLessThanOrEqual(6);
    });
  });

  describe('performTimeBasedDivination()', () => {
    it('returns divination results', () => {
      const input = buildTimeBasedInput(2024, 1, 1, 12);
      const result = performTimeBasedDivination(input);
      expect(result).toHaveProperty('mainHexagram');
      expect(result).toHaveProperty('mutualHexagram');
      expect(result).toHaveProperty('changedHexagram');
      expect(result).toHaveProperty('movingLine');
      expect(result).toHaveProperty('theTrigram');
      expect(result).toHaveProperty('dungTrigram');
      expect(result).toHaveProperty('elements');
      expect(result).toHaveProperty('mainHaoDetails');
      expect(result.movingLine).toBeGreaterThanOrEqual(1);
      expect(result.movingLine).toBeLessThanOrEqual(6);
    });
  });

  describe('performNumberBasedDivination()', () => {
    it('returns divination results from numbers', () => {
      const result = performNumberBasedDivination({ num1: 123, num2: 456 });
      expect(result).toHaveProperty('mainHexagram');
      expect(result).toHaveProperty('mutualHexagram');
      expect(result).toHaveProperty('changedHexagram');
      expect(result).toHaveProperty('movingLine');
      expect(result.movingLine).toBeGreaterThanOrEqual(1);
      expect(result.movingLine).toBeLessThanOrEqual(6);
    });

    it('throws for non-positive numbers', () => {
      expect(() => performNumberBasedDivination({ num1: 0, num2: 1 })).toThrow(RangeError);
      expect(() => performNumberBasedDivination({ num1: 1, num2: 0 })).toThrow(RangeError);
      expect(() => performNumberBasedDivination({ num1: -1, num2: 1 })).toThrow(RangeError);
    });
  });

  describe('adjustDateForTyBoundary()', () => {
    it('advances date when hour >= 23', () => {
      const date = new Date(2024, 1, 10);
      const adjusted = adjustDateForTyBoundary(date, 23);
      expect(adjusted.getDate()).toBe(11);
      expect(adjusted.getMonth()).toBe(1);
    });

    it('returns same date when hour < 23', () => {
      const date = new Date(2024, 1, 10);
      const adjusted = adjustDateForTyBoundary(date, 22);
      expect(adjusted.getDate()).toBe(10);
      expect(adjusted.getMonth()).toBe(1);
    });

    it('does not mutate the original date', () => {
      const date = new Date(2024, 1, 10);
      adjustDateForTyBoundary(date, 23);
      expect(date.getDate()).toBe(10);
    });
  });

  describe('getTrigramById()', () => {
    it('returns valid trigrams for IDs 1-8', () => {
      for (let i = 1; i <= 8; i++) {
        const trigram = getTrigramById(i);
        expect(trigram.id).toBe(i);
        expect(trigram.name).toBeDefined();
      }
    });

    it('throws for invalid ID', () => {
      expect(() => getTrigramById(0)).toThrow(RangeError);
      expect(() => getTrigramById(9)).toThrow(RangeError);
    });
  });

  describe('buildDivinationContext()', () => {
    it('returns a valid context object', () => {
      const date = new Date(2024, 1, 10, 12, 0, 0);
      const context = buildDivinationContext(date, 'lunar', 'Mai Hoa', 'Test query');
      expect(context).toHaveProperty('canChi');
      expect(context).toHaveProperty('tietKhi');
      expect(context).toHaveProperty('nhatThan');
      expect(context).toHaveProperty('nguyetLenh');
      expect(context).toHaveProperty('calendarMode');
      expect(context).toHaveProperty('solarDate');
      expect(context).toHaveProperty('lunarDate');
      expect(context).toHaveProperty('method');
      expect(context).toHaveProperty('query');
      expect(context.query).toBe('Test query');
    });
  });
});
