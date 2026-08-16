import { describe, it, expect } from 'vitest';
import { calculateMonthlyTransits } from '@/services/astrology/monthlyTransitTimeline';
import type { WesternChartInput } from '@/types/astrology';

describe('Western Monthly Transit Timeline & Heatmap Engine', () => {
  const sampleInput: WesternChartInput = {
    name: 'Test Chart',
    birthDate: new Date(1992, 7, 18), // August 18, 1992
    birthHour: 14,
    birthMinute: 30,
    latitude: 21.0285,
    longitude: 105.8542,
    timezone: 7,
    gender: 'nam',
    houseSystem: 'placidus',
  };

  it('should calculate 12-month transit timeline for a given year', () => {
    const timeline = calculateMonthlyTransits(sampleInput, 2026);

    expect(timeline.year).toBe(2026);
    expect(timeline.months).toHaveLength(12);
    expect(timeline.overallYearScore).toBeGreaterThanOrEqual(1.0);
    expect(timeline.overallYearScore).toBeLessThanOrEqual(10.0);
    expect(['Đại Cát', 'Khởi Sắc', 'Bình Hòa', 'Thử Thách', 'Gian Nan']).toContain(timeline.overallLuckTier);
    expect(timeline.yearOverviewVi.length).toBeGreaterThan(30);

    // Verify each month structure
    for (let i = 0; i < 12; i++) {
      const month = timeline.months[i];
      expect(month.month).toBe(i + 1);
      expect(month.year).toBe(2026);
      expect(month.score).toBeGreaterThanOrEqual(1.0);
      expect(month.score).toBeLessThanOrEqual(10.0);
      expect(month.summaryVi.length).toBeGreaterThan(20);
      expect(month.careerFinanceAdviceVi.length).toBeGreaterThan(15);
      expect(month.relationshipHealthAdviceVi.length).toBeGreaterThan(15);
      expect(Array.isArray(month.dominantAspects)).toBe(true);
    }
  });

  it('should identify transit aspect details with proper orbs and interpretations', () => {
    const timeline = calculateMonthlyTransits(sampleInput, 2026);
    const monthsWithAspects = timeline.months.filter((m) => m.dominantAspects.length > 0);
    expect(monthsWithAspects.length).toBeGreaterThan(0);

    const firstAspect = monthsWithAspects[0].dominantAspects[0];
    expect(firstAspect.transitBody).toBeTruthy();
    expect(firstAspect.transitBodyVi).toBeTruthy();
    expect(firstAspect.natalBody).toBeTruthy();
    expect(firstAspect.natalBodyVi).toBeTruthy();
    expect(firstAspect.orb).toBeGreaterThanOrEqual(0);
    expect(firstAspect.interpretationVi.length).toBeGreaterThan(20);
    expect(typeof firstAspect.isHarmonious).toBe('boolean');
  });

  it('should capture peak major outer planet transit events', () => {
    const timeline = calculateMonthlyTransits(sampleInput, 2026);
    expect(Array.isArray(timeline.peakEvents)).toBe(true);

    for (const peak of timeline.peakEvents) {
      expect(peak.month).toBeGreaterThanOrEqual(1);
      expect(peak.month).toBeLessThanOrEqual(12);
      expect(['major', 'moderate', 'minor']).toContain(peak.significance);
      expect(peak.titleVi).toBeTruthy();
      expect(peak.descriptionVi.length).toBeGreaterThan(20);
    }
  });

  it('should generate distinct transit patterns for different natal charts (Anti-Generic Guardrail)', () => {
    const inputA: WesternChartInput = {
      birthDate: new Date(1980, 2, 1),
      birthHour: 5,
      birthMinute: 0,
      latitude: 10.8231,
      longitude: 106.6297,
      timezone: 7,
    };

    const inputB: WesternChartInput = {
      birthDate: new Date(2002, 10, 25),
      birthHour: 22,
      birthMinute: 15,
      latitude: 21.0285,
      longitude: 105.8542,
      timezone: 7,
    };

    const timelineA = calculateMonthlyTransits(inputA, 2026);
    const timelineB = calculateMonthlyTransits(inputB, 2026);

    // Monthly score vectors must differ
    const scoresA = timelineA.months.map((m) => m.score);
    const scoresB = timelineB.months.map((m) => m.score);
    expect(scoresA).not.toEqual(scoresB);

    // Narrative overview must differ
    expect(timelineA.yearOverviewVi).not.toEqual(timelineB.yearOverviewVi);
  });
});
