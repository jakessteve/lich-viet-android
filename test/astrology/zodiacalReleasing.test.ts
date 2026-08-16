import { describe, it, expect } from 'vitest';
import { calculateZodiacalReleasing } from '@omce/core-logic';

describe('Hellenistic Zodiacal Releasing Engine', () => {
  it('generates Level 1 and Level 2 periods with correct planetary durations', () => {
    const birth = new Date(1990, 4, 15);
    // Start at Aries (15 years), Lot of Fortune at Cancer (25 years)
    const periods = calculateZodiacalReleasing('Aries', birth, 'Cancer', 60);

    expect(periods.length).toBeGreaterThan(0);
    expect(periods[0].sign).toBe('Aries');
    expect(periods[0].durationYears).toBe(15);
    expect(periods[0].startYear).toBe(1990);
    expect(periods[0].endYear).toBe(2005);

    // Check Sub-periods
    expect(periods[0].subPeriods.length).toBeGreaterThan(0);
    expect(periods[0].subPeriods[0].sign).toBe('Aries');

    // Check Peak Period detection for Cancer (Lot of Fortune sign)
    const cancerPeriod = periods.find((p) => p.sign === 'Cancer');
    expect(cancerPeriod?.isPeak).toBe(true);
  });
});
