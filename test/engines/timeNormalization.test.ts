import { describe, it, expect } from 'vitest';
import {
  normalizeBirthTime,
  normalizeBirthTimeWithPolicy,
  getVietnamUtcOffset,
  getHourBranch,
  getHourCan,
  formatCanChi,
} from '@/services/tuvi/timeNormalization';

describe('timeNormalization', () => {
  describe('getVietnamUtcOffset()', () => {
    it('returns +7 for modern unified Vietnam (1975-05-01)', () => {
      const date = new Date('1975-05-01T12:00:00');
      expect(getVietnamUtcOffset(date)).toBe(7);
    });

    it('returns +7 for modern unified Vietnam (2024-01-01)', () => {
      const date = new Date('2024-01-01T00:00:00');
      expect(getVietnamUtcOffset(date)).toBe(7);
    });

    it('defaults to +8 for South Vietnam during divergence (1960)', () => {
      const date = new Date('1960-06-15T10:00:00');
      expect(getVietnamUtcOffset(date)).toBe(8);
    });

    it('returns +7 for North Vietnam during divergence when hinted', () => {
      const date = new Date('1960-06-15T10:00:00');
      expect(getVietnamUtcOffset(date, 'north')).toBe(7);
    });

    it('returns +8 for South Vietnam during divergence when hinted', () => {
      const date = new Date('1960-06-15T10:00:00');
      expect(getVietnamUtcOffset(date, 'south')).toBe(8);
    });

    it('returns +7 for French Indochina standard time (1920)', () => {
      const date = new Date('1920-01-01T00:00:00');
      expect(getVietnamUtcOffset(date)).toBe(7);
    });

    it('returns ~+7.1083 for Phủ Liễn observatory time (1908)', () => {
      const date = new Date('1908-06-01T00:00:00');
      expect(getVietnamUtcOffset(date)).toBeCloseTo(7 + 6.5 / 60, 5);
    });

    it('returns +8 for Japanese occupation (1945-06-01)', () => {
      const date = new Date('1945-06-01T00:00:00');
      expect(getVietnamUtcOffset(date)).toBe(8);
    });

    it('returns +7 for post-WWII return to ICT (1946)', () => {
      const date = new Date('1946-01-01T00:00:00');
      expect(getVietnamUtcOffset(date)).toBe(7);
    });

    it('returns +8 for Vietnam DST period (1950)', () => {
      const date = new Date('1950-01-01T00:00:00');
      expect(getVietnamUtcOffset(date)).toBe(8);
    });

    it('uses the civil local date instead of UTC when resolving historical periods', () => {
      const date = new Date(1945, 2, 14, 0, 30);
      expect(getVietnamUtcOffset(date)).toBe(8);
    });
  });

  describe('normalizeBirthTime()', () => {
    it('returns same date for modern births (no correction)', () => {
      const date = new Date('2000-06-15T14:30:00');
      const normalized = normalizeBirthTime(date);
      expect(normalized.getTime()).toBe(date.getTime());
    });

    it('shifts South Vietnam birth (+8) to ICT (+7) by subtracting 1 hour', () => {
      const date = new Date('1965-03-10T12:00:00');
      const normalized = normalizeBirthTime(date);
      expect(normalized.getTime()).toBe(date.getTime() - 60 * 60 * 1000);
    });

    it('does not shift North Vietnam birth when hinted north', () => {
      const date = new Date('1965-03-10T12:00:00');
      const normalized = normalizeBirthTime(date, 'north');
      expect(normalized.getTime()).toBe(date.getTime());
    });

    it('shifts Japanese occupation birth (+8) to ICT (+7)', () => {
      const date = new Date('1945-07-01T10:00:00');
      const normalized = normalizeBirthTime(date);
      expect(normalized.getTime()).toBe(date.getTime() - 60 * 60 * 1000);
    });

    it('does not shift French Indochina standard time birth (+7)', () => {
      const date = new Date('1930-01-01T08:00:00');
      const normalized = normalizeBirthTime(date);
      expect(normalized.getTime()).toBe(date.getTime());
    });

    it('skips Vietnam historical correction for clearly non-Vietnam births', () => {
      const date = new Date('1968-06-01T12:00:00');
      const normalized = normalizeBirthTimeWithPolicy(date, {
        locationName: 'Bangkok, Thailand',
        lat: 13.7563,
        lng: 100.5018,
        timezone: 7,
        countryCode: 'TH',
        countryName: 'Thailand',
      });

      expect(normalized.correctedDate.getTime()).toBe(date.getTime());
      expect(normalized.offsetHours).toBe(7);
      expect(normalized.historicalRegion).toBeUndefined();
    });
  });

  describe('getHourBranch()', () => {
    it('returns 0 (Tý) for hour 23', () => {
      expect(getHourBranch(23)).toBe(0);
    });

    it('returns 0 (Tý) for hour 0 (midnight)', () => {
      expect(getHourBranch(0)).toBe(0);
    });

    it('returns 1 (Sửu) for hour 1', () => {
      expect(getHourBranch(1)).toBe(1);
    });

    it('returns 1 (Sửu) for hour 2', () => {
      expect(getHourBranch(2)).toBe(1);
    });

    it('returns 2 (Dần) for hour 3', () => {
      expect(getHourBranch(3)).toBe(2);
    });

    it('returns 6 (Ngọ) for hour 11', () => {
      expect(getHourBranch(11)).toBe(6);
    });

    it('returns 6 (Ngọ) for hour 12', () => {
      expect(getHourBranch(12)).toBe(6);
    });

    it('returns 11 (Hợi) for hour 21', () => {
      expect(getHourBranch(21)).toBe(11);
    });

    it('returns 11 (Hợi) for hour 22', () => {
      expect(getHourBranch(22)).toBe(11);
    });

    it('handles negative hours by wrapping', () => {
      expect(getHourBranch(-1)).toBe(0); // 23 -> Tý
    });

    it('handles hours > 23 by wrapping', () => {
      expect(getHourBranch(24)).toBe(0); // 0 -> Tý
      expect(getHourBranch(25)).toBe(1); // 1 -> Sửu
    });
  });

  describe('getHourCan()', () => {
    it('Giáp day (0): Tý hour branch → Giáp (0)', () => {
      expect(getHourCan(0, 0)).toBe(0); // Giáp Tý
    });

    it('Giáp day (0): Sửu hour branch → Ất (1)', () => {
      expect(getHourCan(0, 1)).toBe(1); // Ất Sửu
    });

    it('Giáp day (0): Ngọ hour branch → Canh (6)', () => {
      expect(getHourCan(0, 6)).toBe(6); // Canh Ngọ
    });

    it('Kỷ day (5): Tý hour branch → Giáp (0)', () => {
      expect(getHourCan(5, 0)).toBe(0); // Giáp Tý
    });

    it('Ất day (1): Tý hour branch → Bính (2)', () => {
      expect(getHourCan(1, 0)).toBe(2); // Bính Tý
    });

    it('Canh day (6): Tý hour branch → Bính (2)', () => {
      expect(getHourCan(6, 0)).toBe(2); // Bính Tý
    });

    it('Bính day (2): Tý hour branch → Mậu (4)', () => {
      expect(getHourCan(2, 0)).toBe(4); // Mậu Tý
    });

    it('Tân day (7): Tý hour branch → Mậu (4)', () => {
      expect(getHourCan(7, 0)).toBe(4); // Mậu Tý
    });

    it('Đinh day (3): Tý hour branch → Canh (6)', () => {
      expect(getHourCan(3, 0)).toBe(6); // Canh Tý
    });

    it('Nhâm day (8): Tý hour branch → Canh (6)', () => {
      expect(getHourCan(8, 0)).toBe(6); // Canh Tý
    });

    it('Mậu day (4): Tý hour branch → Nhâm (8)', () => {
      expect(getHourCan(4, 0)).toBe(8); // Nhâm Tý
    });

    it('Quý day (9): Tý hour branch → Nhâm (8)', () => {
      expect(getHourCan(9, 0)).toBe(8); // Nhâm Tý
    });

    it('wraps correctly after 10 branches', () => {
      // Giáp day, Dậu branch (9) → should be Kỷ (9)
      expect(getHourCan(0, 9)).toBe(9); // Kỷ Dậu
    });
  });

  describe('formatCanChi()', () => {
    it('formats Giáp Tý correctly', () => {
      expect(formatCanChi(0, 0)).toBe('Giáp Tý');
    });

    it('formats Ất Sửu correctly', () => {
      expect(formatCanChi(1, 1)).toBe('Ất Sửu');
    });

    it('formats Nhâm Tuất correctly', () => {
      expect(formatCanChi(8, 10)).toBe('Nhâm Tuất');
    });

    it('formats Quý Hợi correctly', () => {
      expect(formatCanChi(9, 11)).toBe('Quý Hợi');
    });

    it('throws for invalid canIndex', () => {
      expect(() => formatCanChi(10, 0)).toThrow('Invalid Can-Chi indices');
    });

    it('throws for invalid chiIndex', () => {
      expect(() => formatCanChi(0, 12)).toThrow('Invalid Can-Chi indices');
    });
  });
});
