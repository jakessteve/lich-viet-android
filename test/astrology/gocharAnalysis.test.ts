import { describe, it, expect } from 'vitest';
import { calculateAntardashaPeriods, calculateVedicGochar } from '@/services/astrology/gocharAnalysis';
import type { VedicChartInput } from '@/types/astrology';

describe('Vedic Gochar & Antardasha Sub-Period Engine', () => {
  describe('calculateAntardashaPeriods', () => {
    it('should subdivide a Mahadasha into 9 exact Antardasha (Bhukti) sub-periods', () => {
      const startYear = 2020;
      const durationYears = 16; // Jupiter Mahadasha (16 years)
      const birthYear = 1990;
      const currentYear = 2026;

      const antardashas = calculateAntardashaPeriods('jupiter', startYear, durationYears, birthYear, currentYear);

      expect(antardashas).toHaveLength(9);

      // First sub-period must be the Mahadasha lord itself (Jupiter-Jupiter)
      expect(antardashas[0].subLord).toBe('jupiter');
      expect(antardashas[0].startYear).toBe(2020);

      // Sum of all sub-period durations in years should equal the Mahadasha duration
      const totalDuration = antardashas.reduce((acc, sub) => acc + sub.durationMonths / 12, 0);
      expect(Math.abs(totalDuration - durationYears)).toBeLessThan(0.1);

      // Exactly one sub-period should be marked current if currentYear falls within the span
      const currentSubs = antardashas.filter((s) => s.isCurrent);
      expect(currentSubs.length).toBe(1);
    });

    it('should handle Saturn Mahadasha with correct Vimshottari proportions', () => {
      const antardashas = calculateAntardashaPeriods('saturn', 2015, 19, 1985, 2026);
      expect(antardashas).toHaveLength(9);
      expect(antardashas[0].subLord).toBe('saturn');
      expect(antardashas[1].subLord).toBe('mercury'); // next in Vimshottari order
      expect(antardashas[8].subLord).toBe('jupiter'); // last in cycle
    });
  });

  describe('calculateVedicGochar (Chandra Gochar)', () => {
    const sampleInput: VedicChartInput = {
      name: 'Vedic Native',
      birthDate: new Date(1995, 4, 15),
      birthHour: 8,
      birthMinute: 30,
      latitude: 21.0285,
      longitude: 105.8542,
      timezone: 7,
      ayanamsa: 'lahiri',
    };

    it('should evaluate Gochar transits relative to natal Moon sign', () => {
      const gochar = calculateVedicGochar(sampleInput, new Date(2026, 7, 16));

      expect(gochar.natalMoonSign).toBeTruthy();
      expect(gochar.natalMoonSignVi).toBeTruthy();
      expect(gochar.natalMoonNakshatra).toBeTruthy();
      expect(gochar.overallScore).toBeGreaterThanOrEqual(1.0);
      expect(gochar.overallScore).toBeLessThanOrEqual(10.0);
      expect(['Đại Cát', 'Khởi Sắc', 'Bình Hòa', 'Thử Thách', 'Gian Nan']).toContain(gochar.luckTier);
      expect(gochar.transits.length).toBeGreaterThanOrEqual(7);

      for (const t of gochar.transits) {
        expect(t.houseFromMoon).toBeGreaterThanOrEqual(1);
        expect(t.houseFromMoon).toBeLessThanOrEqual(12);
        expect(typeof t.isBenefic).toBe('boolean');
        expect(t.tarabalaNameVi).toBeTruthy();
        expect(t.descriptionVi.length).toBeGreaterThan(20);
      }
    });

    it('should generate distinct Gochar reports for different Moon signs (Anti-Generic Guardrail)', () => {
      const nativeA: VedicChartInput = {
        birthDate: new Date(1988, 1, 10),
        birthHour: 4,
        birthMinute: 0,
        latitude: 10.8231,
        longitude: 106.6297,
        timezone: 7,
      };

      const nativeB: VedicChartInput = {
        birthDate: new Date(2000, 9, 20),
        birthHour: 18,
        birthMinute: 45,
        latitude: 21.0285,
        longitude: 105.8542,
        timezone: 7,
      };

      const gocharA = calculateVedicGochar(nativeA, new Date(2026, 7, 16));
      const gocharB = calculateVedicGochar(nativeB, new Date(2026, 7, 16));

      expect(gocharA.natalMoonSign).not.toEqual(gocharB.natalMoonSign);
      expect(gocharA.summaryVi).not.toEqual(gocharB.summaryVi);
    });
  });
});
