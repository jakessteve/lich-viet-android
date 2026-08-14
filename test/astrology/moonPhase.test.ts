import { describe, expect, it } from 'vitest';
import { calculateBirthMoonPhase } from '../../src/services/astrology/moonPhase';

describe('calculateBirthMoonPhase', () => {
  it('correctly calculates New Moon (0 deg separation)', () => {
    const phase = calculateBirthMoonPhase(50, 55); // 5 deg ahead -> New Moon
    expect(phase.key).toBe('new_moon');
    expect(phase.symbol).toBe('🌑');
    expect(phase.nameVi).toContain('Trăng Non');
  });

  it('correctly calculates Full Moon (180 deg separation)', () => {
    const phase = calculateBirthMoonPhase(0, 185); // 185 deg -> Full Moon
    expect(phase.key).toBe('full_moon');
    expect(phase.symbol).toBe('🌕');
    expect(phase.nameVi).toContain('Trăng Tròn');
    expect(phase.illuminationPercentage).toBeGreaterThanOrEqual(95);
  });

  it('correctly calculates First Quarter (90 deg separation)', () => {
    const phase = calculateBirthMoonPhase(0, 95); // 95 deg -> First Quarter
    expect(phase.key).toBe('first_quarter');
    expect(phase.symbol).toBe('🌓');
    expect(phase.nameVi).toContain('Trăng Bán Nguyệt');
  });
});
