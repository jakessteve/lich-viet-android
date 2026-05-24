import { describe, it, expect } from 'vitest';
import {
  generateFlyingStarChart,
  calculateAnnualStar,
  calculateMonthlyStar,
  COMPASS_DIRECTIONS,
} from '@/utils/flyingStarEngine';

describe('flyingStarEngine', () => {
  describe('generateFlyingStarChart()', () => {
    it('returns chart data for a modern house facing Nam', () => {
      const chart = generateFlyingStarChart(2020, 'Nam');
      expect(chart).toHaveProperty('period');
      expect(chart).toHaveProperty('periodRange');
      expect(chart).toHaveProperty('facingDirection');
      expect(chart).toHaveProperty('facingDirectionVi');
      expect(chart).toHaveProperty('palaces');
      expect(chart).toHaveProperty('overallAssessment');
      expect(chart).toHaveProperty('mainRemedies');
      expect(chart.palaces.length).toBe(9);
    });

    it('returns chart data for a house facing Đông', () => {
      const chart = generateFlyingStarChart(2010, 'Đông');
      expect(chart.period).toBeGreaterThanOrEqual(1);
      expect(chart.period).toBeLessThanOrEqual(9);
      expect(chart.facingDirection).toBe('Đông');
    });

    it('each palace has required fields', () => {
      const chart = generateFlyingStarChart(2020, 'Tây Nam');
      chart.palaces.forEach((palace) => {
        expect(palace).toHaveProperty('position');
        expect(palace).toHaveProperty('positionVi');
        expect(palace).toHaveProperty('periodStar');
        expect(palace).toHaveProperty('mountainStar');
        expect(palace).toHaveProperty('waterStar');
        expect(palace).toHaveProperty('combination');
        expect(palace).toHaveProperty('nature');
        expect(palace).toHaveProperty('interpretation');
        expect(palace).toHaveProperty('remedy');
        expect(['cat', 'hung', 'trung']).toContain(palace.nature);
      });
    });

    it('accepts manual period override', () => {
      const chart = generateFlyingStarChart(1990, 'Bắc', 8);
      expect(chart.period).toBe(8);
      expect(chart.periodRange).toContain('thủ công');
    });
  });

  describe('calculateAnnualStar()', () => {
    it('returns correct annual stars for known years', () => {
      const result2024 = calculateAnnualStar(2024);
      expect(result2024).toHaveProperty('centerStar');
      expect(result2024).toHaveProperty('starGrid');
      expect(result2024).toHaveProperty('interpretation');
      expect(result2024.centerStar).toBeGreaterThanOrEqual(1);
      expect(result2024.centerStar).toBeLessThanOrEqual(9);
      expect(result2024.starGrid.length).toBe(3);
      expect(result2024.starGrid[0].length).toBe(3);
    });

    it('returns different stars for different years', () => {
      const r2024 = calculateAnnualStar(2024);
      const r2025 = calculateAnnualStar(2025);
      // Most years should have different center stars
      expect(r2024.centerStar).not.toBe(r2025.centerStar);
    });

    it('star grid sums to 45', () => {
      const result = calculateAnnualStar(2024);
      const sum = result.starGrid.flat().reduce((a, b) => a + b, 0);
      expect(sum).toBe(45);
    });
  });

  describe('calculateMonthlyStar()', () => {
    it('returns monthly star for a given month', () => {
      const result = calculateMonthlyStar(2024, 1);
      expect(result).toHaveProperty('centerStar');
      expect(result).toHaveProperty('interpretation');
      expect(result.centerStar).toBeGreaterThanOrEqual(1);
      expect(result.centerStar).toBeLessThanOrEqual(9);
    });

    it('returns different stars for different months', () => {
      const r1 = calculateMonthlyStar(2024, 1);
      const r6 = calculateMonthlyStar(2024, 6);
      expect(r1.centerStar).not.toBe(r6.centerStar);
    });
  });

  describe('COMPASS_DIRECTIONS', () => {
    it('has 24 mountains', () => {
      expect(COMPASS_DIRECTIONS.length).toBe(24);
    });

    it('each direction has required fields', () => {
      COMPASS_DIRECTIONS.forEach((dir) => {
        expect(dir).toHaveProperty('id');
        expect(dir).toHaveProperty('vi');
        expect(dir).toHaveProperty('degrees');
        expect(dir).toHaveProperty('group');
      });
    });
  });
});
