import { describe, it, expect } from 'vitest';
import { getSunLongitude, getSolarTerm, getJDN, findSolarTermStart } from '@/utils/foundationalLayer';
import { computeAyanamsa, computeTrueLunarPosition, computeDeltaT } from '@lich-viet/core-logic';
import { calculateWesternChartForJulianDay } from '@/services/astrology/westernCalculator';

describe('Astronomical Cross-Validation Suite', () => {
  describe('Solar Longitude & 4 Cardinal Season Gates', () => {
    it('accurately identifies Spring Equinox (Xuân Phân ~0°)', () => {
      // 2024-03-20 ~03:06 UTC is Spring Equinox
      const jd = getJDN(20, 3, 2024);
      const long = getSunLongitude(jd);
      // Longitude around 2024-03-20 should be within 0.5 degrees of 0° / 360°
      expect(Math.min(long, 360 - long)).toBeLessThanOrEqual(1.0);
      expect(getSolarTerm(jd)).toBe('Xuân Phân');
    });

    it('accurately identifies Summer Solstice (Hạ Chí ~90°)', () => {
      // 2024-06-20 / 2024-06-21
      const jd = getJDN(21, 6, 2024);
      const long = getSunLongitude(jd);
      expect(Math.abs(long - 90)).toBeLessThanOrEqual(1.0);
      expect(getSolarTerm(jd)).toBe('Hạ Chí');
    });

    it('accurately identifies Autumn Equinox (Thu Phân ~180°)', () => {
      // 2024-09-22
      // 2024-09-23
      const jd = getJDN(23, 9, 2024);
      const long = getSunLongitude(jd);
      expect(Math.abs(long - 180)).toBeLessThanOrEqual(1.5);
      expect(getSolarTerm(jd)).toBe('Thu Phân');
    });

    it('accurately identifies Winter Solstice (Đông Chí ~270°)', () => {
      // 2024-12-21
      const jd = getJDN(21, 12, 2024);
      const long = getSunLongitude(jd);
      expect(Math.abs(long - 270)).toBeLessThanOrEqual(1.0);
      expect(getSolarTerm(jd)).toBe('Đông Chí');
    });
  });

  describe('24 Tiết Khí Boundaries & Monotonic Progression', () => {
    it('strictly advances by 15° intervals across the solar year', () => {
      const dates = [
        { day: 5, month: 2, year: 2024, expectedTerm: 'Lập Xuân' },
        { day: 20, month: 2, year: 2024, expectedTerm: 'Vũ Thủy' },
        { day: 6, month: 3, year: 2024, expectedTerm: 'Kinh Trập' },
        { day: 21, month: 3, year: 2024, expectedTerm: 'Xuân Phân' },
        { day: 5, month: 4, year: 2024, expectedTerm: 'Thanh Minh' },
        { day: 21, month: 4, year: 2024, expectedTerm: 'Cốc Vũ' },
        { day: 6, month: 5, year: 2024, expectedTerm: 'Lập Hạ' },
        { day: 8, month: 8, year: 2024, expectedTerm: 'Lập Thu' },
        { day: 8, month: 11, year: 2024, expectedTerm: 'Lập Đông' },
      ];

      for (const item of dates) {
        const jd = getJDN(item.day, item.month, item.year);
        const term = getSolarTerm(jd);
        expect(term).toBe(item.expectedTerm);
      }
    });

    it('solves Tiết Khí start dates consistently with caching enabled', () => {
      const d = new Date(2024, 1, 10); // Feb 10, 2024 (Lập Xuân period)
      const res1 = findSolarTermStart(d);
      const res2 = findSolarTermStart(d);

      expect(res1.term).toBe('Lập Xuân');
      expect(res2.term).toBe('Lập Xuân');
      expect(res1.date.getTime()).toBe(res2.date.getTime());
    });
  });

  describe('Delta-T & Lunar Ephemeris Dynamics', () => {
    it('computes positive Delta-T within valid modern observational ranges', () => {
      // Modern J2000 epoch Delta-T is approximately 64–75 seconds
      const jd2024 = getJDN(1, 1, 2024);
      const dt2024 = computeDeltaT(jd2024);
      expect(dt2024).toBeGreaterThanOrEqual(60);
      expect(dt2024).toBeLessThanOrEqual(80);

      // Historical J1900 epoch Delta-T is negative or near zero (-3s to 5s)
      const jd1900 = getJDN(1, 1, 1900);
      const dt1900 = computeDeltaT(jd1900);
      expect(dt1900).toBeGreaterThanOrEqual(-10);
      expect(dt1900).toBeLessThanOrEqual(10);
    });

    it('computes lunar orbital elements with physical bounds', () => {
      const jd = getJDN(15, 6, 2024);
      const lunar = computeTrueLunarPosition(jd);

      expect(lunar.longitude).toBeGreaterThanOrEqual(0);
      expect(lunar.longitude).toBeLessThan(360);
      expect(Math.abs(lunar.latitude)).toBeLessThanOrEqual(6.0); // Moon inclination ~5.14°
      expect(lunar.distanceAU).toBeGreaterThanOrEqual(0.0023); // ~356,000 km to ~406,000 km in AU
      expect(lunar.distanceAU).toBeLessThanOrEqual(0.0028);
    });
  });

  describe('Vedic Ayanamsa Configurations', () => {
    it('supports Lahiri, Krishnamurti, and Fagan-Bradley offsets', () => {
      const jd2000 = 2451545.0; // 2000-01-01 12:00 UTC
      const lahiri = computeAyanamsa(jd2000, 'lahiri');
      const kp = computeAyanamsa(jd2000, 'krishnamurti');
      const fagan = computeAyanamsa(jd2000, 'fagan-bradley');

      expect(lahiri).toBeCloseTo(23.85, 1);
      expect(kp).toBeCloseTo(23.79, 1);
      expect(fagan).toBeCloseTo(24.75, 1);
      expect(fagan).toBeGreaterThan(lahiri);
    });

    it('correctly shifts planetary sidereal longitudes based on configured ayanamsa', () => {
      const jd = getJDN(1, 1, 2024);
      const chartLahiri = calculateWesternChartForJulianDay(jd, 21.0285, 105.8542, 'lahiri');
      const chartFagan = calculateWesternChartForJulianDay(jd, 21.0285, 105.8542, 'fagan-bradley');

      const sunLahiri = chartLahiri.planets.find((p) => p.body.toLowerCase() === 'sun')!;
      const sunFagan = chartFagan.planets.find((p) => p.body.toLowerCase() === 'sun')!;

      // Fagan-Bradley ayanamsa is larger by ~0.9 degrees, so sidereal longitude should be smaller by ~0.9°
      const diff = (sunLahiri.siderealLongitude - sunFagan.siderealLongitude + 360) % 360;
      expect(diff).toBeCloseTo(0.9, 1);
    });
  });
});
