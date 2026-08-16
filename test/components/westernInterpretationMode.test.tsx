import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WesternSimplifiedExplanation } from '@/components/Astrology/Western/WesternSimplifiedExplanation';
import { createWesternNatalFixture } from '../fixtures/westernNatalFixture';

describe('WesternSimplifiedExplanation Mode Divergence', () => {
  it('renders simple psychological archetypes in simple mode', () => {
    const result = createWesternNatalFixture();
    render(<WesternSimplifiedExplanation result={result} mode="simple" />);

    expect(screen.getByText(/Bức Tranh Tổng Hợp Tam Trụ Bản Mệnh/i)).toBeDefined();
    expect(screen.getByText(/Kim Chỉ Nam Tổng Quát/i)).toBeDefined();
    expect(screen.queryByText(/Cai Quản Cung Địa Bàn/i)).toBeNull();
  });

  it('renders house rulerships and aspect geometry in advanced mode', () => {
    const result = createWesternNatalFixture();
    result.houseRulers = [
      {
        houseNumber: 1,
        cuspSign: 'Aries',
        cuspSignVi: 'Bạch Dương',
        traditionalRulerId: 'planet:sun',
        traditionalRulerName: 'Sun',
        traditionalRulerVi: 'Mặt Trời',
        traditionalRulerSymbol: '☉',
        rulerSignVi: 'Bạch Dương',
        rulerHouse: 1,
      },
    ];
    render(<WesternSimplifiedExplanation result={result} mode="advanced" />);

    expect(screen.getByText(/Bức Tranh Tổng Hợp Tam Trụ Bản Mệnh/i)).toBeDefined();
    expect(screen.getAllByText(/Cai Quản Cung Địa Bàn:/i).length).toBeGreaterThan(0);
  });
});
