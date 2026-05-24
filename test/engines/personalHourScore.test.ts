import { describe, it, expect } from 'vitest';
import { calculatePersonalHourModifier } from '@/services/personalization/personalHourScore';
import type { CanChi } from '@/types/calendar';

describe('personalHourScore', () => {
  const mockDate = new Date('2024-06-15');
  const mockDayCanChi: CanChi = { can: 'Tân', chi: 'Hợi' };

  describe('calculatePersonalHourModifier()', () => {
    it('returns null when birthYear is null', () => {
      const result = calculatePersonalHourModifier(null, 6, 15, { can: 'Giáp', chi: 'Tý' }, mockDayCanChi, mockDate);
      expect(result).toBeNull();
    });

    it('returns a modifier with flags for valid inputs', () => {
      const hourCanChi: CanChi = { can: 'Giáp', chi: 'Tý' };
      const result = calculatePersonalHourModifier(1990, 6, 15, hourCanChi, mockDayCanChi, mockDate);
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('totalModifier');
      expect(result).toHaveProperty('flags');
      expect(result).toHaveProperty('breakdowns');
      expect(Array.isArray(result!.flags)).toBe(true);
      expect(Array.isArray(result!.breakdowns)).toBe(true);
    });

    it('produces negative modifier for Lục Xung between birth year Chi and hour Chi', () => {
      // 1990 birth year => Canh Ngọ. Hour Chi 'Tý' clashes with Ngọ (Lục Xung)
      const hourCanChi: CanChi = { can: 'Giáp', chi: 'Tý' };
      const result = calculatePersonalHourModifier(1990, 6, 15, hourCanChi, mockDayCanChi, mockDate);
      expect(result).not.toBeNull();
      expect(result!.totalModifier).toBeLessThan(0);
      expect(result!.flags).toContain('xung_thai_tue');
      expect(result!.breakdowns.some((b) => b.includes('Xung Thái Tuế'))).toBe(true);
    });

    it('produces positive modifier for Quý Nhân hour', () => {
      // 1990-06-15 day pillar => Tân Hợi. Quý Nhân for 'Tân' is Dần or Ngọ.
      const hourCanChi: CanChi = { can: 'Bính', chi: 'Dần' };
      const result = calculatePersonalHourModifier(1990, 6, 15, hourCanChi, mockDayCanChi, mockDate);
      expect(result).not.toBeNull();
      expect(result!.totalModifier).toBeGreaterThan(0);
      expect(result!.flags).toContain('quy_nhan');
      expect(result!.breakdowns.some((b) => b.includes('Quý Nhân'))).toBe(true);
    });
  });
});
