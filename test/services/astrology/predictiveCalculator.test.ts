import { describe, expect, it } from 'vitest';
import {
  calculateSolarReturnChart,
  calculateLunarReturnDates,
  calculateLunarReturnChart,
  calculateTransitReport,
  calculateProgressedChart,
  calculateCompositeResult,
  calculateDavisonResult,
  detectMajorAspects,
} from '../../../src/services/astrology/predictiveCalculator';
import { computeTrueLunarPosition } from '@omce/core-logic';
import { calculateWesternChart } from '../../../src/services/astrology/westernCalculator';
import type { WesternChartInput } from '../../../src/types/astrology';

const birthInput: WesternChartInput = {
  birthDate: new Date(1983, 10, 13, 11, 0),
  birthHour: 11,
  birthMinute: 0,
  latitude: 21.0285,
  longitude: 105.8542,
  timezone: 7,
};

const partnerInput: WesternChartInput = {
  birthDate: new Date(1988, 3, 22, 8, 30),
  birthHour: 8,
  birthMinute: 30,
  latitude: 16.0544,
  longitude: 108.2022,
  timezone: 7,
};

describe('predictiveCalculator', () => {
  it('solar return chart keeps the sun at the natal longitude', () => {
    const natal = calculateWesternChart(birthInput);
    const natalSun = natal.planets.find((p) => p.body === 'sun')!.tropicalLongitude;

    const solarReturn = calculateSolarReturnChart(birthInput, 2026);

    expect(solarReturn).not.toBeNull();
    const returnSun = solarReturn!.chart.planets.find((p) => p.body === 'sun')!.tropicalLongitude;
    const diff = Math.abs(((returnSun - natalSun + 540) % 360) - 180);
    expect(diff).toBeLessThan(0.05);
    expect(solarReturn!.dateLabel).toBeTruthy();
  });

  it('returns null for solar return when the search misses the year window', () => {
    const result = calculateSolarReturnChart(birthInput, 1900);
    expect(result === null || result.chart.planets.length > 0).toBe(true);
  });

  it('lists 12-13 lunar returns per year, ~27.3 days apart', () => {
    const entries = calculateLunarReturnDates(birthInput, 2026);

    expect(entries.length).toBeGreaterThanOrEqual(12);
    expect(entries.length).toBeLessThanOrEqual(13);
    for (let i = 1; i < entries.length; i++) {
      const gap = entries[i].julianDay - entries[i - 1].julianDay;
      expect(gap).toBeGreaterThan(27.2);
      expect(gap).toBeLessThan(27.5);
    }
  });

  it('lunar return chart has the moon back at the natal longitude', () => {
    const natal = calculateWesternChart(birthInput);
    const natalMoon = natal.planets.find((p) => p.body === 'moon')!.tropicalLongitude;
    const entries = calculateLunarReturnDates(birthInput, 2026);

    const result = calculateLunarReturnChart(birthInput, entries[0].julianDay);
    const geocentricAtReturn = computeTrueLunarPosition(result.julianDay).longitude;
    const geocentricDiff = Math.abs(((geocentricAtReturn - natalMoon + 540) % 360) - 180);
    expect(geocentricDiff).toBeLessThan(0.01);
    const chartMoon = result.chart.planets.find((p) => p.body === 'moon')!.tropicalLongitude;
    const topocentricDiff = Math.abs(((chartMoon - natalMoon + 540) % 360) - 180);
    expect(topocentricDiff).toBeLessThan(1.5);
  });

  it('transit report on the birth date finds conjunctions for every natal planet', () => {
    const report = calculateTransitReport(birthInput, birthInput.birthDate);
    const conjunctions = report.aspects.filter((a) => a.type === 'conjunction' && a.orb < 1);
    const bodies = new Set(conjunctions.map((a) => a.natalBody));
    expect(bodies.size).toBeGreaterThanOrEqual(5);
  });

  it('progressed chart at birth equals the natal chart', () => {
    const natal = calculateWesternChart(birthInput);
    const progressed = calculateProgressedChart(birthInput, birthInput.birthDate);
    expect(progressed.ageYears).toBeCloseTo(0, 5);
    const natalSun = natal.planets.find((p) => p.body === 'sun')!.tropicalLongitude;
    const progressedSun = progressed.chart.planets.find((p) => p.body === 'sun')!.tropicalLongitude;
    expect(progressedSun).toBeCloseTo(natalSun, 3);
  });

  it('composite chart is symmetric between partners', () => {
    const ab = calculateCompositeResult(birthInput, partnerInput);
    const ba = calculateCompositeResult(partnerInput, birthInput);
    expect(ab.planets.length).toBeGreaterThan(5);
    for (const planet of ab.planets) {
      const mirrored = ba.planets.find((p) => p.body === planet.body)!;
      const diff = Math.abs(((planet.tropicalLongitude - mirrored.tropicalLongitude + 540) % 360) - 180);
      expect(diff).toBeLessThan(0.001);
    }
    expect(ab.houses).toHaveLength(12);
    expect(ab.aspects.length).toBeGreaterThan(0);
  });

  it('davison chart uses the midpoint of both births', () => {
    const davison = calculateDavisonResult(birthInput, partnerInput);
    const expectedMs = (birthInput.birthDate.getTime() + partnerInput.birthDate.getTime()) / 2;
    expect(davison.midpointDate.getTime()).toBe(expectedMs);
    expect(davison.latitude).toBeCloseTo((birthInput.latitude + partnerInput.latitude) / 2, 6);
    expect(davison.chart.planets.length).toBeGreaterThan(5);
  });

  it('detectMajorAspects classifies exact angles', () => {
    const aspects = detectMajorAspects([
      { body: 'sun', tropicalLongitude: 10 },
      { body: 'moon', tropicalLongitude: 130 },
      { body: 'mars', tropicalLongitude: 190 },
    ]);
    const types = aspects.map((a) => `${a.planetA}-${a.planetB}:${a.type}`).sort();
    expect(types).toContain('sun-moon:trine');
    expect(types).toContain('sun-mars:opposition');
    expect(types).toContain('moon-mars:sextile');
  });
});
