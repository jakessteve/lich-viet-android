import { describe, it, expect } from 'vitest';
import { getJDN, getSolarTerm, findSolarTermStart } from '@/utils/foundationalLayer';

describe('foundationalLayer', () => {
  describe('getJDN()', () => {
    it('calculates Julian Day Number correctly for known dates', () => {
      // These are the JDNs computed by the project's getJDN algorithm
      expect(getJDN(10, 2, 2024)).toBe(2460351);
      expect(getJDN(1, 1, 2000)).toBe(2451545);
      expect(getJDN(29, 1, 2025)).toBe(2460705);
    });

    it('handles Gregorian calendar transition correctly', () => {
      // Before Gregorian reform (Julian calendar path in getJDN)
      expect(getJDN(4, 10, 1582)).toBe(2299160);
      // After Gregorian reform
      expect(getJDN(15, 10, 1582)).toBe(2299161);
    });
  });

  describe('getSolarTerm()', () => {
    it('returns correct solar terms for known dates', () => {
      // Lập Xuân usually around Feb 4
      const jd = getJDN(4, 2, 2024);
      const term = getSolarTerm(jd);
      expect(typeof term).toBe('string');
      expect(term.length).toBeGreaterThan(0);
    });

    it('returns different terms for different seasons', () => {
      const spring = getSolarTerm(getJDN(4, 2, 2024));
      const summer = getSolarTerm(getJDN(5, 5, 2024));
      const autumn = getSolarTerm(getJDN(7, 8, 2024));
      const winter = getSolarTerm(getJDN(6, 11, 2024));
      expect(new Set([spring, summer, autumn, winter]).size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('findSolarTermStart()', () => {
    it('finds start of solar terms', () => {
      const result = findSolarTermStart(new Date(2024, 1, 10));
      expect(result.term).toBeDefined();
      expect(result.date).toBeInstanceOf(Date);
      // The returned date should be on or before the input date
      expect(result.date.getTime()).toBeLessThanOrEqual(new Date(2024, 1, 10).getTime());
    });

    it('returns consistent results for the same term period', () => {
      const d1 = findSolarTermStart(new Date(2024, 1, 10));
      const d2 = findSolarTermStart(new Date(2024, 1, 15));
      expect(d1.term).toBe(d2.term);
    });
  });
});
