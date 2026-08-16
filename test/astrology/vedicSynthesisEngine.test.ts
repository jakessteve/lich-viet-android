import { describe, it, expect } from 'vitest';
import { synthesizeVedicReading } from '@/services/astrology/vedicSynthesisEngine';
import type { WesternChartResult } from '@/services/astrology/westernCalculator';

describe('Vedic Jyotish Synthesis Engine', () => {
  const mockVedicResult: WesternChartResult = {
    planets: [
      {
        body: 'sun',
        sign: 'Bạch Dương',
        degreeInSign: 10.5,
        house: 10,
        speed: 1.0,
        retrograde: false,
        latitude: 0,
        distance: 1,
        tropicalLongitude: 34.5,
        siderealLongitude: 10.5,
        nakshatra: 'Ashwini',
        pada: 3,
      },
      {
        body: 'moon',
        sign: 'Kim Ngưu',
        degreeInSign: 15.0,
        house: 11,
        speed: 13.2,
        retrograde: false,
        latitude: 3.0,
        distance: 0.0025,
        tropicalLongitude: 69.0,
        siderealLongitude: 45.0,
        nakshatra: 'Rohini',
        pada: 1,
      },
      {
        body: 'jupiter',
        sign: 'Cự Giải',
        degreeInSign: 28.0,
        house: 1,
        speed: 0.2,
        retrograde: false,
        latitude: 0.5,
        distance: 5.2,
        tropicalLongitude: 122.0,
        siderealLongitude: 98.0,
        nakshatra: 'Pushya',
        pada: 4,
      },
    ],
    houses: [
      { house: 1, sign: 'Cự Giải', degree: 15, minutes: 0 },
      { house: 10, sign: 'Bạch Dương', degree: 10, minutes: 0 },
    ],
    ascendant: 105.0, // Cancer Lagna
    midheaven: 10.0,
    vertex: 180.0,
    partOfFortune: { sign: 'Sư Tử', degree: 20 },
    aspects: [],
  };

  it('synthesizes Lagna, Moon Nakshatra & Pada correctly', () => {
    const reading = synthesizeVedicReading(mockVedicResult);
    expect(reading.lagnaReadingVi).toContain('Lagna');
    expect(reading.moonNakshatraReadingVi).toContain('Rohini');
    expect(reading.moonNakshatraReadingVi).toContain('Pada 2'); // 1-indexed for display
  });

  it('identifies Atmakaraka with highest degree', () => {
    const reading = synthesizeVedicReading(mockVedicResult);
    expect(reading.atmakarakaReadingVi).toContain('Sao Mộc');
    expect(reading.atmakarakaReadingVi).toContain('28.0°');
  });

  it('synthesizes active Dasha and Bhava distribution', () => {
    const reading = synthesizeVedicReading(mockVedicResult, new Date('1995-05-15'));
    expect(reading.activeDashaReadingVi).toContain('Đại vận Vimshottari');
    expect(reading.bhavaMatrixReadingVi).toContain('Cung Kendra');
  });
});
