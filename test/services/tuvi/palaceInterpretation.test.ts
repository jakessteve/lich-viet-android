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

  it('generates rich, personalized Tam Phương Tứ Chính analysis including projecting stars and Tứ Hóa', () => {
    const allPalaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) =>
      makeTestPalace({ id: i, name: `Cung ${i}` })
    );

    // Mệnh at palace 0 (Tý)
    const menhPalace = makeTestPalace({
      id: 0,
      name: 'Mệnh',
      chi: 'Tý',
      isMenh: true,
      chinhTinh: [{ name: 'Tử Vi', type: 'chinhTinh', nguHanh: 'Âm Thổ', brightness: 'Miếu' }],
    });
    allPalaces[0] = menhPalace;

    // Tam Hợp: Quan Lộc at 4 (Thìn), Tài Bạch at 8 (Thân)
    allPalaces[4] = makeTestPalace({
      id: 4,
      name: 'Quan Lộc',
      chi: 'Thìn',
      chinhTinh: [{ name: 'Liêm Trinh', type: 'chinhTinh', nguHanh: 'Hỏa', brightness: 'Vượng' }],
      tuHoa: [{ type: 'Quyền', starName: 'Liêm Trinh', sourceCan: 'Giáp' }],
    });
    allPalaces[8] = makeTestPalace({
      id: 8,
      name: 'Tài Bạch',
      chi: 'Thân',
      chinhTinh: [{ name: 'Vũ Khúc', type: 'chinhTinh', nguHanh: 'Kim', brightness: 'Miếu' }],
      tuHoa: [{ type: 'Lộc', starName: 'Vũ Khúc', sourceCan: 'Giáp' }],
    });

    // Đối cung: Thiên Di at 6 (Ngọ)
    allPalaces[6] = makeTestPalace({
      id: 6,
      name: 'Thiên Di',
      chi: 'Ngọ',
      chinhTinh: [{ name: 'Tham Lang', type: 'chinhTinh', nguHanh: 'Thủy', brightness: 'Hãm' }],
      satTinh: [{ name: 'Kình Dương', type: 'satTinh', nguHanh: 'Kim', brightness: 'Hãm' }],
    });

    const result = interpretPalace(menhPalace, allPalaces);

    // Tam Phương Tứ Chính analysis checks
    expect(result.tamPhuongTuChinhVi).toContain('Quan Lộc');
    expect(result.tamPhuongTuChinhVi).toContain('Tài Bạch');
    expect(result.tamPhuongTuChinhVi).toContain('Thiên Di');
    expect(result.tamPhuongTuChinhVi).toContain('Liêm Trinh');
    expect(result.tamPhuongTuChinhVi).toContain('Vũ Khúc');
    expect(result.tamPhuongTuChinhVi).toContain('Hóa Lộc');
    expect(result.tamPhuongTuChinhVi).toContain('Hóa Quyền');

    // Actionable guidance checks
    expect(result.actionableGuidanceVi).toContain('lãnh đạo');
  });

  it('generates personalized actionable guidance with risk mitigation when sát tinh are present', () => {
    const allPalaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) =>
      makeTestPalace({ id: i, name: `Cung ${i}` })
    );

    const taiBachPalace = makeTestPalace({
      id: 8,
      name: 'Tài Bạch',
      chi: 'Thân',
      chinhTinh: [{ name: 'Vũ Khúc', type: 'chinhTinh', nguHanh: 'Kim', brightness: 'Miếu' }],
      satTinh: [{ name: 'Địa Không', type: 'satTinh', nguHanh: 'Hỏa', brightness: 'Hãm' }],
      tuHoa: [{ type: 'Lộc', starName: 'Vũ Khúc', sourceCan: 'Giáp' }],
    });
    allPalaces[8] = taiBachPalace;

    const result = interpretPalace(taiBachPalace, allPalaces);

    expect(result.actionableGuidanceVi).toContain('tài lộc');
    expect(result.actionableGuidanceVi).toContain('Địa Không' || 'kỷ luật tài chính');
    expect(result.actionableGuidanceVi).toContain('dự phòng');
  });
});
