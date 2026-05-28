import { describe, it, expect } from 'vitest';
import {
  generateFlyingStarChart,
  calculateAnnualStar,
  calculateMonthlyStar,
  COMPASS_DIRECTIONS,
  normalizeHeading,
  getMountainForHeading,
  getActiveVanForYear,
  getBatTrachCungPhiNumber,
  getBatTrachProfileFromTuViChart,
  evaluateBatTrachHeading,
  recommendBatTrachRoomOrientation,
  generateLouPanChart,
} from '@/utils/flyingStarEngine';
import type { TuViChart } from '@/types/tuvi';

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
      expect(result).toHaveProperty('starGrid');
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

  describe('lou pan helpers', () => {
    it('normalizes headings into the 0-360 range', () => {
      expect(normalizeHeading(-10)).toBe(350);
      expect(normalizeHeading(370)).toBe(10);
    });

    it('maps headings to the correct 24-mountain sector', () => {
      expect(getMountainForHeading(0).nameVi).toBe('Tý');
      expect(getMountainForHeading(24).nameVi).toBe('Sửu');
      expect(getMountainForHeading(127.5).nameVi).toBe('Tốn');
    });

    it('returns active vận from construction year', () => {
      expect(getActiveVanForYear(2024)).toBe(9);
      expect(getActiveVanForYear(1990)).toBe(7);
    });

    it('builds a lou pan chart with payload metadata', () => {
      const chart = generateLouPanChart({
        headingDeg: 359,
        constructionYear: 2020,
        selectedDate: new Date(2024, 1, 10),
      });

      expect(chart.facingMountain?.nameVi).toBe('Tý');
      expect(chart.sittingMountain?.nameVi).toBe('Ngọ');
      expect(chart.activeVan).toBe(8);
      expect(chart.payload?.spatialContext.facingMountain).toBe('Tý');
      expect(chart.payload?.spatialContext.sittingMountain).toBe('Ngọ');
    });

    it('derives Bat Trạch profiles from Tử Vi birth data', () => {
      expect(getBatTrachCungPhiNumber(1990, 'nam')).toBe(1);
      expect(getBatTrachCungPhiNumber(1990, 'nữ')).toBe(8);
    });

    it('evaluates headings against Bat Trạch profiles', () => {
      const chart = {
        input: {
          solarDate: new Date(1990, 0, 1),
          birthHour: 0,
          gender: 'nam',
          timezone: 'Asia/Ho_Chi_Minh',
        },
        centerInfo: {
          menhCung: 'Mệnh cư Dần',
          thanCungLabel: 'Thân cư Thiên Di',
        },
      } as unknown as TuViChart;

      const profile = getBatTrachProfileFromTuViChart(chart);
      expect(profile?.houseGroup).toBe('Đông Tứ Mệnh');

      const alignment = profile ? evaluateBatTrachHeading(profile, 135) : null;
      expect(alignment?.direction).toBe('Đông Nam');
      expect(alignment?.star).toBe('Sinh Khí');
      expect(alignment?.isAuspicious).toBe(true);

      const recommendation = profile ? recommendBatTrachRoomOrientation('bed', profile) : null;
      expect(recommendation?.preferredDirections[0].star).toBe('Thiên Y');
    });

    it('includes Bat Trạch data in the spatial-temporal payload when a Tử Vi chart is present', () => {
      const tuViChart = {
        input: {
          solarDate: new Date(1990, 0, 1),
          birthHour: 0,
          gender: 'nam',
          timezone: 'Asia/Ho_Chi_Minh',
        },
        centerInfo: {
          menhCung: 'Mệnh cư Dần',
          thanCungLabel: 'Thân cư Thiên Di',
        },
      } as unknown as TuViChart;

      const chart = generateLouPanChart({
        headingDeg: 135,
        constructionYear: 2020,
        selectedDate: new Date(2024, 1, 10),
        tuViChart,
      });

      expect(chart.payload?.astrologicalMasks.batTrachProfile?.cungName).toBe('Khảm');
      expect(chart.payload?.astrologicalMasks.batTrachAlignment?.star).toBe('Sinh Khí');
      expect(chart.payload?.astrologicalMasks.batTrachRoomRecommendation?.roomType).toBe('house');
    });
  });
});
