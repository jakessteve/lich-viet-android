import { describe, it, expect } from 'vitest';
import { calculateSynastry, generateUnifiedBirthProfile } from '../../packages/core-logic/src/synastry.js';

describe('Synastry Engine Academic Validation', () => {
  it('computes combined score and structured insights across Eastern, Western, and Vedic pillars', () => {
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

    // Check 3 engine outputs
    expect(result.engines.tuVi).toBeDefined();
    expect(result.engines.tuVi.score).toBeGreaterThanOrEqual(0);
    expect(result.engines.tuVi.insights.length).toBeGreaterThan(0);

    expect(result.engines.western).toBeDefined();
    expect(result.engines.western.score).toBeGreaterThanOrEqual(0);
    expect(result.engines.western.insights.length).toBeGreaterThan(0);

    expect(result.engines.vedic).toBeDefined();
    expect(result.engines.vedic.score).toBeGreaterThanOrEqual(0);
    expect(result.engines.vedic.rawBreakdown).toBeDefined();
  });

  it('correctly evaluates Nap Am and Can Chi compatibility in Eastern pillar', () => {
    // Canh Ngọ (1990 - Lộ Bàng Thổ) and Nhâm Thân (1992 - Kiếm Phong Kim)
    // Thổ sinh Kim -> Tương sinh!
    const profileA = generateUnifiedBirthProfile({
      birthTimestamp: new Date('1990-06-01T10:00:00+07:00').getTime(),
      latitude: 21.0285,
      longitude: 105.8542,
      gender: 'male',
      timezone: 7,
    });

    const profileB = generateUnifiedBirthProfile({
      birthTimestamp: new Date('1992-06-01T10:00:00+07:00').getTime(),
      latitude: 21.0285,
      longitude: 105.8542,
      gender: 'female',
      timezone: 7,
    });

    const result = calculateSynastry(profileA, profileB);
    const hasNapAmInsight = result.engines.tuVi.insights.some((i: string) => i.includes('Nạp Âm'));
    expect(hasNapAmInsight).toBe(true);
  });
});
