import { describe, it, expect } from 'vitest';
import {
  getAuspiciousHoursForDay,
  getDayHoangDao,
  getTruc,
  getMansion28,
  getDungSu,
  VAN_KHAN_CATALOG,
  LUNAR_FESTIVALS,
} from '@lich-viet/core';

describe('Astrology Rules - Hoang Dao, Dung Su, Prayers', () => {
  it('computes 12 hours with exactly 6 Hoang Dao and 6 Hac Dao hours', () => {
    const hours = getAuspiciousHoursForDay('Tý');
    expect(hours.length).toBe(12);
    const hoangDaoCount = hours.filter((h) => h.isHoangDao).length;
    expect(hoangDaoCount).toBe(6);
    const hacDaoCount = hours.filter((h) => !h.isHoangDao).length;
    expect(hacDaoCount).toBe(6);
  });

  it('determines Day Hoang Dao correctly', () => {
    // Lunar month 1, day Tý -> Thanh Long (Hoàng Đạo)
    const dayResult = getDayHoangDao(1, 'Tý');
    expect(dayResult.isHoangDao).toBe(true);
    expect(dayResult.starName).toBe('Thanh Long');
  });

  it('computes 12 Truc and 28 Mansions', () => {
    // Month 1, day Dần -> Kiến
    const truc = getTruc(1, 'Dần');
    expect(truc.name).toBe('Kiến');

    const mansion = getMansion28(2461089);
    expect(mansion.name).toBeDefined();
  });

  it('generates Dung Su recommendation and auspicious score', () => {
    const res = getDungSu(1, 'Dần', 2461089);
    expect(res.truc).toBe('Kiến');
    expect(res.auspiciousScore).toBeGreaterThanOrEqual(10);
    expect(res.auspiciousScore).toBeLessThanOrEqual(95);
    expect(res.nenActivities.length).toBeGreaterThan(0);
  });

  it('contains comprehensive Van Khan prayers and Lunar festivals', () => {
    expect(VAN_KHAN_CATALOG.length).toBeGreaterThanOrEqual(5);
    const tet = LUNAR_FESTIVALS.find((f) => f.id === 'tet_nguyen_dan');
    expect(tet).toBeDefined();
    expect(tet?.lunarDay).toBe(1);
    expect(tet?.lunarMonth).toBe(1);
  });
});
