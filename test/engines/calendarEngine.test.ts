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

    it('converts solar to lunar correctly for multi-year Tết dates (2020-2028)', () => {
      const tetDates = [
        { solar: new Date(2020, 0, 25), expectedYear: 2020 },
        { solar: new Date(2021, 1, 12), expectedYear: 2021 },
        { solar: new Date(2022, 1, 1), expectedYear: 2022 },
        { solar: new Date(2023, 0, 22), expectedYear: 2023 },
        { solar: new Date(2024, 1, 10), expectedYear: 2024 },
        { solar: new Date(2025, 0, 29), expectedYear: 2025 },
        { solar: new Date(2026, 1, 17), expectedYear: 2026 },
        { solar: new Date(2027, 1, 6), expectedYear: 2027 },
        { solar: new Date(2028, 0, 26), expectedYear: 2028 },
      ];

      for (const { solar, expectedYear } of tetDates) {
        const lunar = getLunarDate(solar);
        expect(lunar.day).toBe(1);
        expect(lunar.month).toBe(1);
        expect(lunar.year).toBe(expectedYear);
        expect(lunar.isLeap).toBe(false);
      }
    });

    it('correctly identifies leap months (e.g. Quý Mão 2023 leap month 2)', () => {
      // Regular month 2: 2023-02-20 is lunar 1/2/2023
      const regularMonth2 = getLunarDate(new Date(2023, 1, 20));
      expect(regularMonth2.month).toBe(2);
      expect(regularMonth2.isLeap).toBe(false);

      // Leap month 2: 2023-03-22 is lunar 1/2/2023 (Leap)
      const leapMonth2 = getLunarDate(new Date(2023, 2, 22));
      expect(leapMonth2.month).toBe(2);
      expect(leapMonth2.isLeap).toBe(true);
      expect(leapMonth2.day).toBe(1);
    });

    it('converts historical dates accurately (1984 Giáp Tý, 2000 Canh Thìn)', () => {
      const tet1984 = getLunarDate(new Date(1984, 1, 2));
      expect(tet1984.day).toBe(1);
      expect(tet1984.month).toBe(1);
      expect(tet1984.year).toBe(1984);

      const tet2000 = getLunarDate(new Date(2000, 1, 5));
      expect(tet2000.day).toBe(1);
      expect(tet2000.month).toBe(1);
      expect(tet2000.year).toBe(2000);
    });

    it('converts solar to lunar correctly for a mid-year date', () => {
      const date = new Date(2024, 5, 15); // 2024-06-15
      const lunar = getLunarDate(date);
      expect(lunar.day).toBe(10);
      expect(lunar.month).toBe(5);
      expect(lunar.year).toBe(2024);
    });
  });

  describe('28 Mansions (Nhị Thập Bát Tú) & Planetary Week Synchronization', () => {
    it('synchronizes 28 Tú strictly with the 7-day planetary week', () => {
      // 2024-02-10 (Saturday) -> Đê
      const sat = getDetailedDayData(new Date(2024, 1, 10));
      expect(sat.tu).toContain('Đê');

      // 2024-02-11 (Sunday) -> Phòng
      const sun = getDetailedDayData(new Date(2024, 1, 11));
      expect(sun.tu).toContain('Phòng');

      // 2024-02-12 (Monday) -> Tâm
      const mon = getDetailedDayData(new Date(2024, 1, 12));
      expect(mon.tu).toContain('Tâm');

      // 2024-02-13 (Tuesday) -> Vĩ
      const tue = getDetailedDayData(new Date(2024, 1, 13));
      expect(tue.tu).toContain('Vĩ');

      // 2024-02-14 (Wednesday) -> Cơ
      const wed = getDetailedDayData(new Date(2024, 1, 14));
      expect(wed.tu).toContain('Cơ');

      // 2024-02-15 (Thursday) -> Đẩu
      const thu = getDetailedDayData(new Date(2024, 1, 15));
      expect(thu.tu).toContain('Đẩu');

      // 2024-02-16 (Friday) -> Ngưu
      const fri = getDetailedDayData(new Date(2024, 1, 16));
      expect(fri.tu).toContain('Ngưu');
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

    it('uses the tiết khí month, not the lunar month, for the day engine month Can-Chi', () => {
      const beforeTet = getDetailedDayData(new Date(2024, 1, 5));

      expect(beforeTet.lunarDate.month).toBe(12);
      expect(beforeTet.canChi.month).toEqual({ can: 'Bính', chi: 'Dần' });
      expect(beforeTet.fiveElements.napAmMonth).toBe('Lô Trung Hỏa');
      expect(beforeTet.modifyingLayer.trucDetail.name).toBe('Thâu');
    });

    it('surfaces the new tiết khí boundary detail on the Âm Lịch day view', () => {
      const data = getDetailedDayData(new Date(2024, 1, 10));

      expect(data.solarTerm).toBe('Lập Xuân');
      expect(data.tietKhiDetail).toContain('Tiết Đại Hàn khởi ngày 20/1/2024');
      expect(data.tietKhiDetail).toContain('Tiết khí Lập Xuân khởi ngày 4/2/2024');
    });
  });
});
