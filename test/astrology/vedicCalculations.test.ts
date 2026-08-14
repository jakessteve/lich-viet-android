import { describe, expect, it } from 'vitest';
import { calculateVedicDashaTimeline } from '../../src/services/astrology/vedicDasha';
import { detectVedicYogasAndDoshas, type VedicPlanetPosition } from '../../src/services/astrology/vedicYogas';
import { getDetailedAshtakoot } from '../../src/services/astrology/ashtakootDetails';

describe('Vedic Astrology Calculations', () => {
  it('calculates Vimshottari Dasha timeline with active period', () => {
    // Moon in Ashwini (0° Aries) -> Ketu Dasha first
    const dasha = calculateVedicDashaTimeline(5, 1995, 2026);
    expect(dasha.periods).toHaveLength(9);
    expect(dasha.periods[0].lord).toBe('ketu');
    expect(dasha.currentPeriod).toBeDefined();
    expect(dasha.currentPeriod?.isCurrent).toBe(true);
  });

  it('detects Gaja Kesari Yoga and Budhaditya Yoga', () => {
    const planets: VedicPlanetPosition[] = [
      { body: 'sun', siderealLongitude: 30, house: 1, signIndex: 1 },
      { body: 'mercury', siderealLongitude: 35, house: 1, signIndex: 1 }, // Sun + Mercury in same sign -> Budhaditya
      { body: 'moon', siderealLongitude: 60, house: 2, signIndex: 2 },
      { body: 'jupiter', siderealLongitude: 150, house: 5, signIndex: 5 }, // Jupiter in house 5 from lagna, houseDiff from Moon (house 2) = 4 -> Kendra from Moon!
      { body: 'mars', siderealLongitude: 200, house: 7, signIndex: 6 }, // Mars in house 7 -> Manglik Dosha
    ];

    const yogas = detectVedicYogasAndDoshas(planets, 30);
    expect(yogas.some((y) => y.id === 'budhaditya_yoga')).toBe(true);
    expect(yogas.some((y) => y.id === 'gaja_kesari_yoga')).toBe(true);
    expect(yogas.some((y) => y.id === 'manglik_dosha')).toBe(true);
  });

  it('calculates detailed 8-koota Ashtakoota compatibility', () => {
    const res = getDetailedAshtakoot(30, 60);
    expect(res.items).toHaveLength(8);
    expect(res.totalScore).toBeGreaterThanOrEqual(0);
    expect(res.totalScore).toBeLessThanOrEqual(36);
    expect(res.overallVerdictVi).toBeDefined();
  });
});
