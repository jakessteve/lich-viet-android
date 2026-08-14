import { describe, expect, it } from 'vitest';
import { detectAspectPatterns, type AspectPatternPlanet } from '../../src/services/astrology/aspectPatterns';

describe('detectAspectPatterns', () => {
  it('detects a Grand Trine in Fire (Aries, Leo, Sagittarius)', () => {
    const planets: AspectPatternPlanet[] = [
      { id: 'planet:sun', name: 'Sun', nameVi: 'Mặt Trời', symbol: '☉', longitude: 10, signVi: 'Bạch Dương' }, // 10° Aries (Fire)
      { id: 'planet:mars', name: 'Mars', nameVi: 'Sao Hỏa', symbol: '♂', longitude: 130, signVi: 'Sư Tử' }, // 10° Leo (Fire)
      { id: 'planet:jupiter', name: 'Jupiter', nameVi: 'Sao Mộc', symbol: '♃', longitude: 250, signVi: 'Nhân Mã' }, // 10° Sagittarius (Fire)
    ];

    const patterns = detectAspectPatterns(planets);
    expect(patterns.some((p) => p.type === 'grand_trine')).toBe(true);
    const gt = patterns.find((p) => p.type === 'grand_trine')!;
    expect(gt.nameVi).toContain('Tam Hợp Lớn');
    expect(gt.planets).toHaveLength(3);
  });

  it('detects a T-Square (Opposition + 2 Squares)', () => {
    const planets: AspectPatternPlanet[] = [
      { id: 'planet:sun', name: 'Sun', nameVi: 'Mặt Trời', symbol: '☉', longitude: 0, signVi: 'Bạch Dương' }, // 0° Aries
      { id: 'planet:moon', name: 'Moon', nameVi: 'Mặt Trăng', symbol: '☽', longitude: 180, signVi: 'Thiên Bình' }, // 180° Libra (Opposite Sun)
      { id: 'planet:mars', name: 'Mars', nameVi: 'Sao Hỏa', symbol: '♂', longitude: 90, signVi: 'Cự Giải' }, // 90° Cancer (Squaring Sun & Moon)
    ];

    const patterns = detectAspectPatterns(planets);
    expect(patterns.some((p) => p.type === 't_square')).toBe(true);
    const ts = patterns.find((p) => p.type === 't_square')!;
    expect(ts.nameVi).toContain('Chữ T Vuông');
    expect(ts.apexPlanet?.id).toBe('planet:mars');
  });

  it('detects a Stellium of 3+ planets in same sign', () => {
    const planets: AspectPatternPlanet[] = [
      { id: 'planet:sun', name: 'Sun', nameVi: 'Mặt Trời', symbol: '☉', longitude: 35, signVi: 'Kim Ngưu' },
      { id: 'planet:mercury', name: 'Mercury', nameVi: 'Sao Thủy', symbol: '☿', longitude: 42, signVi: 'Kim Ngưu' },
      { id: 'planet:venus', name: 'Venus', nameVi: 'Sao Kim', symbol: '♀', longitude: 50, signVi: 'Kim Ngưu' },
    ];

    const patterns = detectAspectPatterns(planets);
    expect(patterns.some((p) => p.type === 'stellium')).toBe(true);
    const st = patterns.find((p) => p.type === 'stellium')!;
    expect(st.nameVi).toContain('Cụm Tinh Tú');
  });

  it('detects a Yod (Finger of God: Sextile + 2 Quincunxes)', () => {
    const planets: AspectPatternPlanet[] = [
      { id: 'planet:venus', name: 'Venus', nameVi: 'Sao Kim', symbol: '♀', longitude: 60, signVi: 'Song Tử' }, // 0° Gemini (60°)
      { id: 'planet:mars', name: 'Mars', nameVi: 'Sao Hỏa', symbol: '♂', longitude: 120, signVi: 'Sư Tử' }, // 0° Leo (120°) -> 60° apart (Sextile)
      { id: 'planet:saturn', name: 'Saturn', nameVi: 'Sao Thổ', symbol: '♄', longitude: 270, signVi: 'Ma Kết' }, // 0° Capricorn (270°) -> 150° from Venus (60°) and 150° from Mars (120°)
    ];

    const patterns = detectAspectPatterns(planets);
    expect(patterns.some((p) => p.type === 'yod')).toBe(true);
    const yod = patterns.find((p) => p.type === 'yod')!;
    expect(yod.nameVi).toContain('Ngón Tay Thượng Đế');
    expect(yod.apexPlanet?.id).toBe('planet:saturn');
  });
});
