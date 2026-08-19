import { describe, it, expect } from 'vitest';
import {
  formatDungSu,
  getSignedModifierTotalBySign,
  getBreakdownToneClass,
  formatXungHop,
  formatNapAm,
} from '@/utils/dungSuFormatters';

describe('dungSuFormatters Utility Suite', () => {
  describe('formatDungSu', () => {
    it('handles empty or undefined items safely', () => {
      expect(formatDungSu(undefined, 'Tốt mọi việc')).toEqual({ focus: false, rest: [] });
      expect(formatDungSu([], 'Tốt mọi việc')).toEqual({ focus: false, rest: [] });
    });

    it('identifies focus word and cleans bracket descriptions', () => {
      const items = ['Tốt mọi việc', 'Cưới hỏi (Thiên đức)', 'Cưới hỏi', 'Động thổ (Hoàng đạo)'];
      const result = formatDungSu(items, 'Tốt mọi việc');
      expect(result.focus).toBe(true);
      expect(result.rest).toEqual(['Cưới hỏi', 'Động thổ']);
    });

    it('handles items without focus word correctly', () => {
      const items = ['Khai trương (Sao tốt)', 'Cầu tài'];
      const result = formatDungSu(items, 'Tốt mọi việc');
      expect(result.focus).toBe(false);
      expect(result.rest).toEqual(['Khai trương', 'Cầu tài']);
    });
  });

  describe('getSignedModifierTotalBySign', () => {
    it('returns null on empty or undefined breakdown list', () => {
      expect(getSignedModifierTotalBySign(undefined, '+')).toBeNull();
      expect(getSignedModifierTotalBySign([], '+')).toBeNull();
    });

    it('sums positive modifiers correctly', () => {
      const breakdowns = [
        'Cá nhân: Tương hợp Tam Hợp (+15%)',
        'Cá nhân: Lục Hợp (+10%)',
        'Cá nhân: Tương xung (-12%)',
      ];
      const positiveTotal = getSignedModifierTotalBySign(breakdowns, '+');
      expect(positiveTotal).toBe(25);
    });

    it('sums negative modifiers correctly', () => {
      const breakdowns = [
        'Cá nhân: Tương hợp Tam Hợp (+15%)',
        'Cá nhân: Tương xung (-12%)',
        'Cá nhân: Tương hình (-8%)',
      ];
      const negativeTotal = getSignedModifierTotalBySign(breakdowns, '-');
      expect(negativeTotal).toBe(-20);
    });
  });

  describe('getBreakdownToneClass', () => {
    it('returns positive tone class for (+XX%)', () => {
      expect(getBreakdownToneClass('Tương hợp (+15%)')).toContain('text-good');
    });

    it('returns negative tone class for (-XX%)', () => {
      expect(getBreakdownToneClass('Tương hại (-10%)')).toContain('text-bad');
    });

    it('returns neutral tone class otherwise', () => {
      expect(getBreakdownToneClass('Bình thường')).toContain('text-text-secondary');
    });
  });

  describe('formatXungHop & formatNapAm', () => {
    it('returns default fallback when empty', () => {
      expect(formatXungHop('')).toBe('Không có xung hợp đặc biệt');
      expect(formatNapAm('')).toBe('Bình hòa');
    });

    it('preserves provided values', () => {
      expect(formatXungHop('Tý Ngọ tương xung')).toBe('Tý Ngọ tương xung');
      expect(formatNapAm('Hải Trung Kim')).toBe('Hải Trung Kim');
    });
  });
});
