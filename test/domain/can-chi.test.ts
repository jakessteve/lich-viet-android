import { describe, it, expect } from 'vitest';
import { getYearCanChi, getMonthCanChi, getDayCanChi, getCanChiPillars, gregorianToJD } from '@lich-viet/core';

describe('Astrology Rules - Can Chi & Pillars', () => {
  it('computes year Can Chi correctly', () => {
    expect(getYearCanChi(2024).name).toBe('Giáp Thìn');
    expect(getYearCanChi(2025).name).toBe('Ất Tỵ');
    expect(getYearCanChi(2026).name).toBe('Bính Ngọ');
    expect(getYearCanChi(2027).name).toBe('Đinh Mùi');
  });

  it('computes month Can Chi correctly', () => {
    // 2026 is Bính Ngọ (Can Bính -> Month 1 is Canh Dần)
    const m1 = getMonthCanChi(2026, 1);
    expect(m1.can).toBe('Canh');
    expect(m1.chi).toBe('Dần');
    expect(m1.name).toBe('Canh Dần');
  });

  it('computes day Can Chi correctly from JD', () => {
    // 2026-02-17 (Tết Bính Ngọ) -> Day Can Chi is Canh Thân
    const jd = gregorianToJD(2026, 2, 17, 12, 0, 0);
    const day = getDayCanChi(jd);
    expect(day.name).toBe('Canh Thân');
    expect(day.napAm).toBe('Thạch Lựu Mộc');
    expect(day.element).toBe('Mộc');
  });

  it('computes 4 pillars comprehensively', () => {
    const pillars = getCanChiPillars(2026, 2, 17, 10, 30);
    expect(pillars.year.name).toBe('Bính Ngọ');
    expect(pillars.day.name).toBe('Canh Thân');
    expect(pillars.hour.chi).toBe('Tỵ'); // 10:30 is Tỵ hour
  });
});
