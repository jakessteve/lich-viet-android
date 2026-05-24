import { describe, it, expect } from 'vitest';
import {
  generateQmdjChart,
  isDuongDon,
  getYuanForDate,
  calculateTuanKhong,
  interpretQmdjChart,
} from '@/utils/qmdjEngine';

describe('qmdjEngine', () => {
  describe('isDuongDon()', () => {
    it('returns true for Yang Dun terms', () => {
      expect(isDuongDon('Lập xuân')).toBe(true);
      expect(isDuongDon('Vũ thủy')).toBe(true);
      expect(isDuongDon('Kinh trập')).toBe(true);
    });

    it('returns false for Yin Dun terms', () => {
      expect(isDuongDon('Hạ chí')).toBe(false);
      expect(isDuongDon('Tiểu thử')).toBe(false);
      expect(isDuongDon('Đại tuyết')).toBe(false);
    });
  });

  describe('getYuanForDate()', () => {
    it('returns a valid yuan value', () => {
      const date = new Date(2024, 1, 10);
      const yuan = getYuanForDate(date);
      expect(['upper', 'middle', 'lower']).toContain(yuan);
    });
  });

  describe('generateQmdjChart()', () => {
    it('returns a complete chart', () => {
      const date = new Date(2024, 1, 10);
      const chart = generateQmdjChart(date, 'Tý');
      expect(chart).toHaveProperty('date');
      expect(chart).toHaveProperty('hourChi');
      expect(chart).toHaveProperty('hourCan');
      expect(chart).toHaveProperty('isDuongDon');
      expect(chart).toHaveProperty('gameNumber');
      expect(chart).toHaveProperty('solarTerm');
      expect(chart).toHaveProperty('yuan');
      expect(chart).toHaveProperty('palaces');
      expect(chart).toHaveProperty('trucPhuStarId');
      expect(chart).toHaveProperty('trucSuDoorId');
      expect(chart).toHaveProperty('formations');
      expect(chart.palaces.length).toBe(9);
      expect(typeof chart.gameNumber).toBe('number');
    });

    it('normalizes runtime solar-term names before looking up the game table', () => {
      const chart = generateQmdjChart(new Date(2024, 1, 10), 'Tý');

      expect(chart.solarTerm).toBe('Lập Xuân');
      expect(chart.isDuongDon).toBe(true);
      expect(chart.gameNumber).toBe(5);
    });

    it('has 9 palaces with correct structure', () => {
      const date = new Date(2024, 1, 10);
      const chart = generateQmdjChart(date, 'Tý');
      chart.palaces.forEach((palace) => {
        expect(palace).toHaveProperty('number');
        expect(palace).toHaveProperty('direction');
        expect(palace).toHaveProperty('trigram');
        expect(palace).toHaveProperty('element');
        expect(palace.number).toBeGreaterThanOrEqual(1);
        expect(palace.number).toBeLessThanOrEqual(9);
      });
    });
  });

  describe('calculateTuanKhong()', () => {
    it('returns empty branches and affected palaces', () => {
      const result = calculateTuanKhong('Giáp', 'Tý');
      expect(result).toHaveProperty('emptyBranch1');
      expect(result).toHaveProperty('emptyBranch2');
      expect(result).toHaveProperty('affectedPalaces');
      expect(result).toHaveProperty('explanation');
      expect(typeof result.explanation).toBe('string');
      expect(result.affectedPalaces.length).toBeGreaterThan(0);
    });

    it('returns consistent results', () => {
      const r1 = calculateTuanKhong('Giáp', 'Tý');
      const r2 = calculateTuanKhong('Giáp', 'Tý');
      expect(r1.emptyBranch1).toBe(r2.emptyBranch1);
      expect(r1.emptyBranch2).toBe(r2.emptyBranch2);
    });
  });

  describe('interpretQmdjChart()', () => {
    it('returns interpretations for all palaces except center', () => {
      const date = new Date(2024, 1, 10);
      const chart = generateQmdjChart(date, 'Tý');
      const interpretations = interpretQmdjChart(chart);
      expect(Array.isArray(interpretations)).toBe(true);
      // Center palace (5) is skipped
      expect(interpretations.length).toBe(8);
      interpretations.forEach((interp) => {
        expect(interp).toHaveProperty('palaceNumber');
        expect(interp).toHaveProperty('direction');
        expect(interp).toHaveProperty('doorStarCombo');
        expect(interp).toHaveProperty('deityInfluence');
        expect(interp).toHaveProperty('overallAuspiciousness');
        expect(['cat', 'hung', 'trung']).toContain(interp.overallAuspiciousness);
      });
    });
  });
});
