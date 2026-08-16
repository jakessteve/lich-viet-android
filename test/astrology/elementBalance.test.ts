import { describe, expect, it } from 'vitest';
import {
  calculateElementModalityBalance,
  type BalanceCalculationPoint,
} from '../../src/services/astrology/elementBalance';

describe('calculateElementModalityBalance', () => {
  it('correctly classifies fire and earth dominance', () => {
    const points: BalanceCalculationPoint[] = [
      { id: 'planet:sun', nameVi: 'Mặt Trời', symbol: '☉', longitude: 10 }, // Aries (Fire/Cardinal)
      { id: 'planet:moon', nameVi: 'Mặt Trăng', symbol: '☽', longitude: 130 }, // Leo (Fire/Fixed)
      { id: 'planet:mars', nameVi: 'Sao Hỏa', symbol: '♂', longitude: 250 }, // Sag (Fire/Mutable)
      { id: 'planet:venus', nameVi: 'Sao Kim', symbol: '♀', longitude: 40 }, // Taurus (Earth/Fixed)
    ];

    const result = calculateElementModalityBalance(points);
    expect(result.dominantElement).toBe('fire');
    expect(result.elements.fire.points).toBeGreaterThan(result.elements.earth.points);
    expect(result.elements.water.points).toBe(0);
    expect(result.summaryVi).toContain('Lửa');
  });
});
