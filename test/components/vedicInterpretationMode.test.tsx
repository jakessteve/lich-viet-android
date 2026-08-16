import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { VedicInterpretationPanel } from '@/components/Astrology/Vedic/VedicInterpretationPanel';
import type { WesternChartResult } from '@/services/astrology/westernCalculator';

const mockWesternResult: WesternChartResult = {
  ascendant: 105.4,
  mc: 12.3,
  houses: Array.from({ length: 12 }, (_, i) => ({ index: i + 1, longitude: i * 30, sign: 'Aries' })),
  planets: [
    {
      body: 'sun',
      tropicalLongitude: 120.5,
      siderealLongitude: 96.5,
      speed: 0.98,
      house: 1,
      signIndex: 3,
      isRetrograde: false,
    },
    {
      body: 'moon',
      tropicalLongitude: 210.5,
      siderealLongitude: 186.5,
      speed: 12.5,
      house: 4,
      signIndex: 6,
      nakshatra: 'Chitra',
      pada: 1,
      isRetrograde: false,
    },
  ],
  aspects: [],
};

describe('VedicInterpretationPanel', () => {
  it('renders focused title and clean summary in simple mode', () => {
    render(<VedicInterpretationPanel result={mockWesternResult} mode="simple" />);

    expect(screen.getByText(/Luận Giải Cốt Cách & Bản Mệnh \(Vedic\)/i)).toBeDefined();
    expect(screen.getByText(/Cơ Bản \(Sidereal Lahiri\)/i)).toBeDefined();
    expect(screen.getByText(/Kim Chỉ Nam Vệ Đà/i)).toBeDefined();
  });

  it('renders deep Jyotish synthesis in advanced mode', () => {
    render(<VedicInterpretationPanel result={mockWesternResult} mode="advanced" />);

    expect(screen.getByText(/Diễn Giải Toàn Diện \(Jyotish Synthesis & Kỹ Thuật\)/i)).toBeDefined();
    expect(screen.getByText(/Chuyên Sâu \(Sidereal Lahiri\)/i)).toBeDefined();
  });
});
