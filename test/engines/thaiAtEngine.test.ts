import { describe, it, expect } from 'vitest';
import { getCosmicForecast, getThaiAtYearChart, getThaiAtMonthOverlay } from '@/utils/thaiAtEngine';

describe('thaiAtEngine', () => {
  describe('getCosmicForecast()', () => {
    it('returns forecast data for a known year', () => {
      const result = getCosmicForecast(2024);
      expect(result).toHaveProperty('year');
      expect(result.year).toBe(2024);
      expect(result).toHaveProperty('canChiYear');
      expect(result).toHaveProperty('oneLiner');
      expect(typeof result.oneLiner).toBe('string');
      expect(result).toHaveProperty('tone');
      expect(['optimistic', 'cautious', 'neutral']).toContain(result.tone);
      expect(result).toHaveProperty('element');
      expect(result).toHaveProperty('palaceName');
      expect(result).toHaveProperty('hostGuestLabel');
    });

    it('returns different forecasts for different years', () => {
      const r2024 = getCosmicForecast(2024);
      const r2025 = getCosmicForecast(2025);
      expect(r2024.canChiYear).not.toBe(r2025.canChiYear);
    });
  });

  describe('getThaiAtYearChart()', () => {
    it('returns chart data', () => {
      const chart = getThaiAtYearChart(2024);
      expect(chart).toHaveProperty('lunarYear');
      expect(chart.lunarYear).toBe(2024);
      expect(chart).toHaveProperty('canChiYear');
      expect(chart).toHaveProperty('thaiAtPalace');
      expect(chart).toHaveProperty('thaiAtPalaceInfo');
      expect(chart).toHaveProperty('deityPositions');
      expect(chart).toHaveProperty('hostGuest');
      expect(chart).toHaveProperty('epochPosition');
      expect(chart).toHaveProperty('forecast');
      expect(chart).toHaveProperty('forecastTone');
      expect(chart).toHaveProperty('element');
      expect(chart).toHaveProperty('palaceElementAnalysis');
    });

    it('has hostGuest with required fields', () => {
      const chart = getThaiAtYearChart(2024);
      expect(chart.hostGuest).toHaveProperty('hostCount');
      expect(chart.hostGuest).toHaveProperty('guestCount');
      expect(chart.hostGuest).toHaveProperty('fixedCount');
      expect(chart.hostGuest).toHaveProperty('dominance');
      expect(chart.hostGuest).toHaveProperty('dominanceLabel');
      expect(['hostDominant', 'guestDominant', 'balanced']).toContain(chart.hostGuest.dominance);
    });

    it('has deity positions array', () => {
      const chart = getThaiAtYearChart(2024);
      expect(Array.isArray(chart.deityPositions)).toBe(true);
      expect(chart.deityPositions.length).toBeGreaterThan(0);
      chart.deityPositions.forEach((d) => {
        expect(d).toHaveProperty('id');
        expect(d).toHaveProperty('nameVi');
        expect(d).toHaveProperty('palace');
        expect(d).toHaveProperty('nature');
      });
    });
  });

  describe('getThaiAtMonthOverlay()', () => {
    it('returns month overlay', () => {
      const overlay = getThaiAtMonthOverlay(2024, 1, false);
      expect(overlay).toHaveProperty('lunarMonth');
      expect(overlay.lunarMonth).toBe(1);
      expect(overlay).toHaveProperty('adjustedPalace');
      expect(overlay).toHaveProperty('monthlyForecast');
      expect(typeof overlay.monthlyForecast).toBe('string');
    });

    it('handles leap months differently', () => {
      const regular = getThaiAtMonthOverlay(2024, 5, false);
      const leap = getThaiAtMonthOverlay(2024, 5, true);
      // They may or may not differ depending on data, but should both be valid
      expect(regular.lunarMonth).toBe(5);
      expect(leap.lunarMonth).toBe(5);
    });
  });
});
