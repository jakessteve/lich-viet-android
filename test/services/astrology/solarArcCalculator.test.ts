import { describe, it, expect } from 'vitest';
import { calculateSolarArcDirections } from '@/services/astrology/solarArcCalculator';
import type { WesternChartInput } from '@/types/astrology';

describe('solarArcCalculator', () => {
  const sampleInput: WesternChartInput = {
    name: 'Test Solar Arc Subject',
    birthDate: new Date('1990-05-15T08:30:00.000Z'),
    latitude: 21.0285,
    longitude: 105.8542,
    houseSystem: 'Placidus',
  };

  it('calculates solar arc directions for a given target year', () => {
    const targetYear = 2025;
    const result = calculateSolarArcDirections(sampleInput, targetYear);

    expect(result).toBeDefined();
    expect(result.targetYear).toBe(2025);
    expect(result.ageYears).toBe(35);
    expect(result.solarArcDegree).toBeGreaterThan(0);
    expect(result.directedPlanets.length).toBeGreaterThanOrEqual(7);

    // Each directed planet should have directedLongitude and natalLongitude
    for (const planet of result.directedPlanets) {
      expect(planet.directedLongitude).toBeGreaterThanOrEqual(0);
      expect(planet.directedLongitude).toBeLessThan(360);
      expect(planet.natalLongitude).toBeGreaterThanOrEqual(0);
      expect(planet.natalLongitude).toBeLessThan(360);
    }
  });

  it('correctly shifts planets by approximately ~1 degree per year', () => {
    const age30 = calculateSolarArcDirections(sampleInput, 2020);
    const age40 = calculateSolarArcDirections(sampleInput, 2030);

    // In 10 years, solar arc progression should be roughly ~9.85 degrees
    const arcDiff = (age40.solarArcDegree - age30.solarArcDegree + 360) % 360;
    expect(arcDiff).toBeGreaterThan(8.5);
    expect(arcDiff).toBeLessThan(11.5);
  });

  it('detects active solar arc hard aspects with non-empty list or valid structure', () => {
    const result = calculateSolarArcDirections(sampleInput, 2025);
    expect(Array.isArray(result.activeAspects)).toBe(true);

    for (const aspect of result.activeAspects) {
      expect(aspect.directedPlanet).toBeTruthy();
      expect(aspect.natalPlanet).toBeTruthy();
      expect(aspect.aspectType).toBeTruthy();
      expect(aspect.orb).toBeGreaterThanOrEqual(0);
      expect(aspect.orb).toBeLessThanOrEqual(1.0);
      expect(typeof aspect.exactHitAge).toBe('number');
      expect(aspect.description).toContain('khai vận');
    }
  });
});
