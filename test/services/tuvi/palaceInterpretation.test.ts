import { describe, it, expect } from 'vitest';
import { interpretPalace } from '@/services/tuvi/palaceInterpretation';
import type { TuViPalace } from '@/types/tuvi';

function makeTestPalace(overrides: Partial<TuViPalace> & { id: number; name: string }): TuViPalace {
  return {
    id: overrides.id,
    chi: 'Tý',
    name: overrides.name,
    nameHanViet: '命宮',
    can: 'Giáp',
    canChi: 'Giáp Tý',
    chinhTinh: [],
    phuTinh: [],
    satTinh: [],
    tuHoa: [],
    brightness: {},
    daiHanAgeRange: '14–23',
    isMenh: overrides.isMenh ?? false,
    isThan: overrides.isThan ?? false,
    hasTuan: overrides.hasTuan ?? false,
    hasTriet: overrides.hasTriet ?? false,
    ...overrides,
  };
}

describe('interpretPalace (Tử Vi 12-Palace SCTE Engine)', () => {
  it('generates rich interpretation for Mệnh palace with major star and Hóa Lộc', () => {
    const allPalaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makeTestPalace({ id: i, name: `Cung ${i}` }));
    const menhPalace = makeTestPalace({
      id: 0,
      name: 'Mệnh',
      isMenh: true,
      chinhTinh: [{ name: 'Tử Vi', type: 'chinhTinh', nguHanh: 'Âm Thổ', brightness: 'Miếu' }],
      tuHoa: [{ type: 'Lộc', starName: 'Tử Vi' }],
      phuTinh: [{ name: 'Tả Phụ', type: 'phuTinh', nguHanh: 'Dương Thổ', brightness: 'Miếu' }],
    });
    allPalaces[0] = menhPalace;

    const result = interpretPalace(menhPalace, allPalaces);

    expect(result.palaceName).toBe('Mệnh');
    expect(result.isMenh).toBe(true);
    expect(result.coreThemeVi).toContain('Bản Mệnh');
    expect(result.majorStarsAnalysisVi).toContain('Tử Vi');
    expect(result.majorStarsAnalysisVi).toContain('Đế tinh');
    expect(result.tuHoaAnalysisVi.length).toBe(1);
    expect(result.tuHoaAnalysisVi[0]).toContain('Hóa Lộc');
    expect(result.auxiliaryAndMaleficVi).toContain('Tả Phụ');
    expect(result.actionableGuidanceVi).toContain('Tử Vi');
  });

  it('handles Cung Vô Chính Diệu (No major stars) by referencing đối cung', () => {
    const allPalaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makeTestPalace({ id: i, name: `Cung ${i}` }));
    // Palace 0 is Vô Chính Diệu, Đối cung is Palace 6 (Thiên Di) with Thái Dương
    allPalaces[0] = makeTestPalace({ id: 0, name: 'Mệnh', isMenh: true, chinhTinh: [] });
    allPalaces[6] = makeTestPalace({
      id: 6,
      name: 'Thiên Di',
      chinhTinh: [{ name: 'Thái Dương', type: 'chinhTinh', nguHanh: 'Dương Hỏa', brightness: 'Miếu' }],
    });

    const result = interpretPalace(allPalaces[0], allPalaces);

    expect(result.majorStarsAnalysisVi).toContain('Vô Chính Diệu');
    expect(result.majorStarsAnalysisVi).toContain('Thiên Di');
    expect(result.majorStarsAnalysisVi).toContain('Thái Dương');
  });

  it('correctly reports Tuần / Triệt influence', () => {
    const allPalaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makeTestPalace({ id: i, name: `Cung ${i}` }));
    const quanPalace = makeTestPalace({
      id: 4,
      name: 'Quan Lộc',
      hasTriet: true,
      chinhTinh: [{ name: 'Thất Sát', type: 'chinhTinh', nguHanh: 'Dương Kim', brightness: 'Miếu' }],
    });
    allPalaces[4] = quanPalace;

    const result = interpretPalace(quanPalace, allPalaces);

    expect(result.tuanTrietAnalysisVi).toBeDefined();
    expect(result.tuanTrietAnalysisVi).toContain('Triệt Không');
    expect(result.tuanTrietAnalysisVi).toContain('30 tuổi');
  });
});
