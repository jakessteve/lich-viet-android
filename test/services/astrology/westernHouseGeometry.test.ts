import { describe, expect, it } from 'vitest';
import { buildTopocentricObserver, computePorphyryCusps, unixMsToJulianDay } from '@omce/core-logic';

describe('Western Porphyry house geometry', () => {
  it('matches the reference chart angles for the printed birth coordinates', () => {
    const observer = buildTopocentricObserver({
      julianDay: unixMsToJulianDay(new Date('1983-11-13T11:00:00Z').getTime()),
      latitude: 16 + 3 / 60 + 16 / 3600,
      longitude: 108 + 12 / 60 + 8 / 3600,
      altitudeMeters: 0,
    });

    const houses = computePorphyryCusps(observer);

    expect(houses.ascendant).toBeCloseTo(63.5131, 3);
    expect(houses.midheaven).toBeCloseTo(322.8517, 3);
    const expectedCusps = [
      63.5131, 89.9593, 116.4055, 142.8517, 176.4055, 209.9593, 243.5131, 269.9593, 296.4055, 322.8517, 356.4055,
      29.9593,
    ];
    houses.cusps.forEach((cusp, index) => {
      expect(cusp).toBeCloseTo(expectedCusps[index], 3);
    });
  });
});
