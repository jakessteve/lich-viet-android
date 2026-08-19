import { describe, it, expect } from 'vitest';
import { executeElectionScan } from '@/services/election/electionEngine';
import { scoreWesternElection } from '@/services/election/westernElectionScorer';
import { scoreVedicElection } from '@/services/election/vedicElectionScorer';

describe('Election Engine Ephemeris Scoring Suite (F-01 & DIR-05)', () => {
  it('correctly scores Western astrology using true Moon/Sun coordinates', () => {
    // Sun at 0 (Aries), Moon at 120 (Leo) -> Waxing Trine (Auspicious)
    const result = scoreWesternElection(0, 120, false);
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.isWaxing).toBe(true);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('penalizes Void-of-Course and Moon Fall in Western scoring', () => {
    // Moon in Scorpio (Fall) + Void of Course
    const result = scoreWesternElection(0, 220, true);
    expect(result.score).toBeLessThanOrEqual(65);
    expect(result.notes.some((n) => n.includes('Void of Course') || n.includes('Bọ Cạp'))).toBe(true);
  });

  it('correctly calculates Vedic Panchanga Tithi and identifies Rikta Tithis', () => {
    // Elongation = 40 degrees -> Tithi 4 (Chaturthi = Rikta)
    const result = scoreVedicElection(0, 40, 3);
    expect(result.isRikta).toBe(true);
    expect(result.score).toBeLessThanOrEqual(60);
  });

  it('executes full election scan across dates with ephemeris_v1 metadata', async () => {
    const scanResult = await executeElectionScan({
      startDate: new Date(2025, 5, 1),
      endDate: new Date(2025, 5, 5),
      activityType: 'cuoi-hoi',
      location: { lat: 21.0285, lng: 105.8542, timezone: 7 },
    });

    expect(scanResult.length).toBe(5);
    for (const candidate of scanResult) {
      expect(candidate.scoringMethod).toBe('ephemeris_v1');
      expect(candidate.westernScore).toBeGreaterThanOrEqual(15);
      expect(candidate.westernScore).toBeLessThanOrEqual(98);
      expect(candidate.vedicScore).toBeGreaterThanOrEqual(15);
      expect(candidate.vedicScore).toBeLessThanOrEqual(96);
      expect(candidate.totalScore).toBeGreaterThan(0);
    }
  });
});
