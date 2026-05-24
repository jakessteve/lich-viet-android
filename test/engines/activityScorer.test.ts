import { describe, it, expect } from 'vitest';
import { scoreActivity, scoreAllActivities } from '@/utils/activityScorer';
import { CLASSICAL_AUSPICIOUSNESS } from '@/config/scoring';
import type { DayDetailsData } from '@/types/calendar';

function createMockDayData(): DayDetailsData {
  return {
    solarDate: '2024-02-10',
    dayOfWeek: 'Thứ Bảy',
    lunarDate: { day: 1, month: 1, year: 2024, isLeapMonth: false },
    buddhistYear: 2568,
    canChi: { year: { can: 'Giáp', chi: 'Thìn' }, month: { can: 'Bính', chi: 'Dần' }, day: { can: 'Ất', chi: 'Tỵ' } },
    startHour: { can: 'Ất', chi: 'Tý' },
    solarTerm: 'Lập Xuân',
    fiveElements: { napAm: 'Phúc Đăng Hỏa', napAmMonth: 'Lô Trung Hỏa', napAmYear: 'Phúc Đăng Hỏa', nguHanh: 'Hỏa' },
    truc: 'Kiến (Ngày Kiến)',
    tu: 'Sao (Tú)',
    year: 'Giáp Thìn (Phúc Đăng Hỏa)',
    allHours: [
      {
        name: 'Tý',
        timeRange: '23:00 - 01:00',
        canChi: { can: 'Giáp', chi: 'Tý' },
        isAuspicious: true,
        score: 70,
        nghi: [],
        ky: [],
      },
      {
        name: 'Sửu',
        timeRange: '01:00 - 03:00',
        canChi: { can: 'Ất', chi: 'Sửu' },
        isAuspicious: true,
        score: 65,
        nghi: [],
        ky: [],
      },
      {
        name: 'Dần',
        timeRange: '03:00 - 05:00',
        canChi: { can: 'Bính', chi: 'Dần' },
        isAuspicious: false,
        score: 40,
        nghi: [],
        ky: [],
      },
    ],
    auspiciousHours: [],
    inauspiciousHours: [],
    goodStars: ['Thanh Long', 'Minh Đường'],
    badStars: ['Bạch Hổ'],
    dayGrade: 'Tốt',
    deityStatus: 'Ngày Hoàng Đạo',
    nguHanhGrade: 'Chuyên nhật',
    canChiInteractions: [],
    nguHanhInteraction: 'Ngày cát',
    napAmInteraction: 'Nạp Âm tương sinh',
    canChiXungHop: 'Ngày Tỵ lục hợp Thân',
    tietKhiDetail: 'Tiết Lập Xuân',
    thangAmThieuDu: 'Tháng 1 đủ',
    advancedIndicators: [],
    foundationalLayer: {
      baseScore: 10,
      thanSat: [],
      auspiciousDirections: { hyThan: 'Đông Bắc', taiThan: 'Đông Nam', hacThan: 'Tây Bắc' },
    },
    modifyingLayer: {
      stars: [],
      trucDetail: { name: 'Kiến', quality: 'Good', description: 'Ngày Kiến' },
      tuDetail: { name: 'Tú 1', quality: 'Good', description: 'Tú 1' },
    },
    dungSu: { suitable: ['Khai trương', 'Cưới hỏi'], unsuitable: ['Chôn cất'] },
    banhTo: { can: '', chi: '' },
    fengShuiDirections: { hyThan: 'Đông Bắc', taiThan: 'Đông Nam', hacThan: 'Tây Bắc' },
    yearlyStars: [],
    napAmCompatibility: 'Hợp với ngũ hành của năm (Phúc Đăng Hỏa)',
  };
}

describe('activityScorer', () => {
  describe('scoreActivity()', () => {
    it('returns scores for activities', () => {
      const dayData = createMockDayData();
      const result = scoreActivity('khai-truong', dayData);
      expect(result).toHaveProperty('percentage');
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('colorClass');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('bestHours');
      expect(typeof result.percentage).toBe('number');
      expect(result.percentage).toBeGreaterThanOrEqual(0);
      expect(result.percentage).toBeLessThanOrEqual(100);
    });

    it('returns fallback for unknown activity', () => {
      const dayData = createMockDayData();
      const result = scoreActivity('unknown-activity', dayData);
      expect(result.percentage).toBe(50);
      expect(result.label).toBe('Trung Bình');
    });

    it('includes breakdown items', () => {
      const dayData = createMockDayData();
      const result = scoreActivity('khai-truong', dayData);
      expect(result.breakdown.length).toBeGreaterThan(0);
      const factors = result.breakdown.map((b) => b.factor);
      expect(factors).toContain('truc');
    });

    it('keeps advanced overlays off by default', () => {
      const dayData = createMockDayData();
      const result = scoreActivity('khai-truong', dayData);
      const qmdj = result.breakdown.find((b) => b.factor === 'qmdj');
      const thaiAt = result.breakdown.find((b) => b.factor === 'thaiAt');
      expect(qmdj?.value).toBe(0);
      expect(thaiAt?.value).toBe(0);
    });

    it('floors explicit day support even when other factors are modest', () => {
      const dayData = createMockDayData();
      const result = scoreActivity('khai-truong', dayData);
      expect(result.percentage).toBeGreaterThanOrEqual(CLASSICAL_AUSPICIOUSNESS.preferredFloor);
    });

    it('caps severe explicit prohibitions', () => {
      const dayData = createMockDayData();
      dayData.dungSu.suitable = [];
      dayData.dungSu.unsuitable = ['Khai trương, mở hàng'];
      dayData.dayGrade = 'Đại Kỵ';
      dayData.deityStatus = 'Ngày Hắc Đạo';

      const result = scoreActivity('khai-truong', dayData);
      expect(result.percentage).toBeLessThanOrEqual(CLASSICAL_AUSPICIOUSNESS.severeCap);
    });

    it('respects Bách Sự Hung override', () => {
      const dayData = createMockDayData();
      dayData.dungSu.unsuitable.push('Cực kỳ xấu cho mọi việc (Bách sự hung)');
      const result = scoreActivity('khai-truong', dayData);
      expect(result.isBachSuHung).toBe(true);
    });
  });

  describe('scoreAllActivities()', () => {
    it('returns all activity scores', () => {
      const dayData = createMockDayData();
      const results = scoreAllActivities(dayData);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => {
        expect(r).toHaveProperty('activity');
        expect(r).toHaveProperty('percentage');
        expect(r).toHaveProperty('label');
        expect(r).toHaveProperty('colorClass');
      });
    });

    it('sorts results by percentage descending', () => {
      const dayData = createMockDayData();
      const results = scoreAllActivities(dayData);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].percentage).toBeGreaterThanOrEqual(results[i].percentage);
      }
    });
  });
});
