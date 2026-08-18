import { describe, it, expect } from 'vitest';
import { calculateHuberAgePoint, detectHuberAspectFigures } from '@lich-viet/core-logic';

describe('Huber Psychological Astrology & 72-Year Life Clock Engine', () => {
  it('correctly calculates Huber Age Point across houses (6 years per house)', () => {
    // 12 Equal houses starting at 0° (0°, 30°, 60°, ...)
    const houseCusps = Array.from({ length: 12 }, (_, i) => i * 30);
    const planets = [
      { body: 'Mặt Trời', tropicalLongitude: 15 }, // at 15°
    ];

    // Age 3.0 -> middle of House 1 (3 / 6 = 50% through House 1 -> 15° Aries)
    const ap3 = calculateHuberAgePoint(3.0, houseCusps, planets);
    expect(ap3.houseNumber).toBe(1);
    expect(ap3.progressPercent).toBe(50);
    expect(ap3.apLongitude).toBeCloseTo(15, 1);
    expect(ap3.activeAspects.length).toBeGreaterThan(0);
    expect(ap3.activeAspects[0].aspect).toContain('Conjunction');

    // Age 18.0 -> exactly at cusp of House 4 (0% through House 4 -> 90° Cancer)
    const ap18 = calculateHuberAgePoint(18.0, houseCusps, planets);
    expect(ap18.houseNumber).toBe(4);
    expect(ap18.progressPercent).toBe(0);
    expect(ap18.apLongitude).toBeCloseTo(90, 1);
  });

  it('detects Huber Aspect Figures (Talent Triangle, T-Square, Learning Triangle)', () => {
    const planets = [
      { body: 'Sun', tropicalLongitude: 0 },
      { body: 'Moon', tropicalLongitude: 120 },
      { body: 'Jupiter', tropicalLongitude: 60 },
    ];
    const aspects = [
      { id: 'trine', planetA: 'Sun', planetB: 'Moon', type: 'trine' },
      { id: 'sextile', planetA: 'Sun', planetB: 'Jupiter', type: 'sextile' },
      { id: 'sextile', planetA: 'Moon', planetB: 'Jupiter', type: 'sextile' },
    ];

    const figures = detectHuberAspectFigures(planets, aspects);
    expect(figures.length).toBeGreaterThan(0);
    expect(figures.some((f) => f.id === 'huber_talent_triangle')).toBe(true);
  });
});
