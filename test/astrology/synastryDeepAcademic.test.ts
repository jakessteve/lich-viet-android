import { describe, it, expect } from 'vitest';
import {
  calculateSynastry,
  generateUnifiedBirthProfile,
  computeCungPhi,
  computeManglikDosha,
} from '../../packages/core-logic/src/index.js';

describe('Deep Academic Synastry Engine & Multi-Dimensional Verification', () => {
  it('computes complete 5-dimensional vectors and constructive advice alongside 3 pillars', () => {
    const profileA = generateUnifiedBirthProfile({
      birthTimestamp: new Date('1990-05-15T08:30:00+07:00').getTime(),
      latitude: 21.0285,
      longitude: 105.8542,
      gender: 'male',
      timezone: 7,
    });

    const profileB = generateUnifiedBirthProfile({
      birthTimestamp: new Date('1992-09-20T14:15:00+07:00').getTime(),
      latitude: 21.0285,
      longitude: 105.8542,
      gender: 'female',
      timezone: 7,
    });

    const result = calculateSynastry(profileA, profileB);

    expect(result).toBeDefined();
    expect(result.combinedScore).toBeGreaterThanOrEqual(0);
    expect(result.combinedScore).toBeLessThanOrEqual(100);

    // 5 Relational Dimensions
    expect(result.dimensions).toBeDefined();
    expect(result.dimensions.emotional.score).toBeGreaterThanOrEqual(0);
    expect(result.dimensions.chemistry.score).toBeGreaterThanOrEqual(0);
    expect(result.dimensions.intellect.score).toBeGreaterThanOrEqual(0);
    expect(result.dimensions.stability.score).toBeGreaterThanOrEqual(0);
    expect(result.dimensions.complement.score).toBeGreaterThanOrEqual(0);

    // Constructive Advice
    expect(result.advice).toBeDefined();
    expect(result.advice.length).toBeGreaterThan(0);

    // Eastern (Bát Tự & Cung Phi)
    expect(result.engines.tuVi.score).toBeGreaterThanOrEqual(0);
    expect(result.engines.tuVi.batTrach).toBeDefined();
    expect(profileA.tuViContext.cungPhi).toBeDefined();
    expect(profileB.tuViContext.cungPhi).toBeDefined();

    // Western (Aspects & House Overlays)
    expect(result.engines.western.score).toBeGreaterThanOrEqual(0);
    expect(result.engines.western.houseOverlays).toBeDefined();

    // Vedic (Ashtakoot, Pariharas & Manglik)
    expect(result.engines.vedic.score).toBeGreaterThanOrEqual(0);
    expect(result.engines.vedic.rawBreakdown).toBeDefined();
    expect(result.engines.vedic.manglik).toBeDefined();
  });

  it('correctly calculates Cung Phi (Quái Mệnh) for male and female according to classical formulas', () => {
    // 1990 (Canh Ngọ)
    // Male 1990 -> 11 - (1990 % 9) = 11 - 1 = 10 % 9 = 1 (Khảm)
    // Female 1990 -> 4 + (1990 % 9) = 4 + 1 = 5 -> Cấn (8)
    const male1990 = computeCungPhi(1990, 'male');
    const female1990 = computeCungPhi(1990, 'female');

    expect(male1990.name).toBe('Khảm');
    expect(female1990.name).toBe('Cấn');

    // 1992 (Nhâm Thân)
    // 1992 % 9 = 3
    // Male: 11 - 3 = 8 (Cấn)
    // Female: 4 + 3 = 7 (Đoài)
    const male1992 = computeCungPhi(1992, 'male');
    const female1992 = computeCungPhi(1992, 'female');

    expect(male1992.name).toBe('Cấn');
    expect(female1992.name).toBe('Đoài');
  });

  it('evaluates Manglik Dosha (Kuja Dosha) and applies classical cancellations', () => {
    // Mars in Aries (0 deg sidereal) -> Own sign, cancelled
    const resAries = computeManglikDosha({
      marsSiderealLon: 15,
      ascSiderealLon: 15,
      moonSiderealLon: 120,
      venusSiderealLon: 180,
      age: 25,
    });
    expect(resAries.cancellations.length).toBeGreaterThan(0);
    expect(resAries.status).toBe('cancelled');

    // Mars afflicted in house 7 with no cancellations (under 28, in Taurus 45 deg)
    const resAfflicted = computeManglikDosha({
      marsSiderealLon: 45, // Taurus
      ascSiderealLon: 225, // Scorpio (Mars in 7th from Ascendant)
      moonSiderealLon: 150,
      venusSiderealLon: 150,
      age: 22,
    });
    expect(resAfflicted.afflictions.length).toBeGreaterThan(0);
    expect(resAfflicted.isManglik).toBe(true);
  });
});
