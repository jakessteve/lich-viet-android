import { describe, it, expect } from 'vitest';
import { interpretPalace } from '@/services/tuvi/palaceInterpretation';
import type { TuViPalace, TuViCenterInfo } from '@/types/tuvi';

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

    // 1. Triệt only
    const quanPalace = makeTestPalace({
      id: 4,
      name: 'Quan Lộc',
      hasTriet: true,
      hasTuan: false,
      chinhTinh: [{ name: 'Thất Sát', type: 'chinhTinh', nguHanh: 'Dương Kim', brightness: 'Miếu' }],
    });
    allPalaces[4] = quanPalace;
    const resultTriet = interpretPalace(quanPalace, allPalaces);
    expect(resultTriet.tuanTrietAnalysisVi).toBeDefined();
    expect(resultTriet.tuanTrietAnalysisVi).toContain('Triệt Không');
    expect(resultTriet.tuanTrietAnalysisVi).not.toContain('Tuần');

    // 2. Tuần only
    const tuanPalace = makeTestPalace({
      id: 2,
      name: 'Phúc Đức',
      hasTuan: true,
      hasTriet: false,
    });
    allPalaces[2] = tuanPalace;
    const resultTuan = interpretPalace(tuanPalace, allPalaces);
    expect(resultTuan.tuanTrietAnalysisVi).toBeDefined();
    expect(resultTuan.tuanTrietAnalysisVi).toContain('Tuần Không');
    expect(resultTuan.tuanTrietAnalysisVi).not.toContain('Triệt');

    // 3. Both Tuần and Triệt
    const bothPalace = makeTestPalace({
      id: 6,
      name: 'Thiên Di',
      hasTuan: true,
      hasTriet: true,
    });
    allPalaces[6] = bothPalace;
    const resultBoth = interpretPalace(bothPalace, allPalaces);
    expect(resultBoth.tuanTrietAnalysisVi).toBeDefined();
    expect(resultBoth.tuanTrietAnalysisVi).toContain('Đồng cung Tuần và Triệt');
  });

  it('generates rich, personalized Tam Phương Tứ Chính analysis including projecting stars and Tứ Hóa', () => {
    const allPalaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makeTestPalace({ id: i, name: `Cung ${i}` }));

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
    const allPalaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makeTestPalace({ id: i, name: `Cung ${i}` }));

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
    expect(
      result.actionableGuidanceVi.includes('Địa Không') || result.actionableGuidanceVi.includes('kỷ luật tài chính'),
    ).toBe(true);
    expect(result.actionableGuidanceVi).toContain('dự phòng');
  });

  it('generates Tràng Sinh phase energy, Nhị Hợp, and Positional Semantics synthesis', () => {
    const allPalaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makeTestPalace({ id: i, name: `Cung ${i}` }));

    const menhPalace = makeTestPalace({
      id: 0,
      name: 'Mệnh',
      isMenh: true,
      isCuongCung: true,
      rings: { truongSinh: 'Đế Vượng' },
      nhiHopPalaceIndex: 1,
      chinhTinh: [{ name: 'Tử Vi', type: 'chinhTinh', nguHanh: 'Thổ', brightness: 'Miếu' }],
    });
    allPalaces[0] = menhPalace;
    allPalaces[1] = makeTestPalace({
      id: 1,
      name: 'Huynh Đệ',
      chinhTinh: [{ name: 'Thiên Cơ', type: 'chinhTinh', nguHanh: 'Mộc', brightness: 'Miếu' }],
    });

    const result = interpretPalace(menhPalace, allPalaces);

    expect(result.coreThemeVi).toContain('Cường Cung');
    expect(result.isCuongCung).toBe(true);
    expect(result.truongSinhAnalysisVi).toContain('Đế Vượng');
    expect(result.truongSinhAnalysisVi).toContain('Đỉnh cao phong độ');
    expect(result.nhiHopAnalysisVi).toContain('Huynh Đệ');
    expect(result.positionalSemanticsVi).toContain('Tọa');
  });

  it('generates rich positional semantics with classical pattern and actionable hint for special palace layouts', () => {
    const allPalaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makeTestPalace({ id: i, name: `Cung ${i}` }));

    // Cung Mệnh (Thiên Tướng)
    const menhPalace = makeTestPalace({
      id: 0,
      name: 'Mệnh',
      chi: 'Tý',
      isMenh: true,
      chinhTinh: [{ name: 'Thiên Tướng', type: 'chinhTinh', nguHanh: 'Thủy', brightness: 'Vượng' }],
    });
    allPalaces[0] = menhPalace;

    // Giáp Left (Phụ Mẫu at 11): Thiên Lương
    allPalaces[11] = makeTestPalace({
      id: 11,
      name: 'Phụ Mẫu',
      chi: 'Hợi',
      chinhTinh: [{ name: 'Thiên Lương', type: 'chinhTinh', nguHanh: 'Mộc', brightness: 'Miếu' }],
    });

    // Giáp Right (Huynh Đệ at 1): Hóa Lộc
    allPalaces[1] = makeTestPalace({
      id: 1,
      name: 'Huynh Đệ',
      chi: 'Sửu',
      tuHoa: [{ type: 'Lộc', starName: 'Vũ Khúc' }],
    });

    const result = interpretPalace(menhPalace, allPalaces);

    expect(result.positionalSemanticsVi).toBeDefined();
    expect(result.positionalSemanticsVi).toContain('Tài Ấm Giáp Ấn');
    expect(result.positionalSemanticsVi).toContain('💡 Gợi ý');
  });

  it('incorporates centerInfo (Âm Dương Thuận/Nghịch lý & Mệnh Cục) into actionable guidance', () => {
    const allPalaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makeTestPalace({ id: i, name: `Cung ${i}` }));
    const menhPalace = makeTestPalace({
      id: 0,
      name: 'Mệnh',
      chi: 'Dần',
      isMenh: true,
      chinhTinh: [{ name: 'Tử Vi', type: 'chinhTinh', nguHanh: 'Thổ', brightness: 'Miếu' }],
    });
    allPalaces[0] = menhPalace;

    const mockCenterInfo: Partial<TuViCenterInfo> = {
      amDuongLabel: 'Dương Nam (Âm Dương Thuận Lý)',
      menhNapAm: 'Đại Hải Thủy',
      cuc: 'Thủy Nhị Cục',
      thanCung: 'Thân cư Quan Lộc',
    };

    const result = interpretPalace(menhPalace, allPalaces, mockCenterInfo as TuViCenterInfo);

    expect(result.actionableGuidanceVi).toContain('Âm Dương Thuận Lý');
    expect(result.actionableGuidanceVi).toContain('Đại Hải Thủy');
    expect(result.actionableGuidanceVi).toContain('Thủy Nhị Cục');
  });

  it('produces identical result when precomputedCombinations is provided vs computed inline', () => {
    const allPalaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makeTestPalace({ id: i, name: `Cung ${i}` }));
    const menhPalace = makeTestPalace({
      id: 0,
      name: 'Mệnh',
      chi: 'Dần',
      isMenh: true,
      chinhTinh: [{ name: 'Tử Vi', type: 'chinhTinh', nguHanh: 'Thổ', brightness: 'Miếu' }],
    });
    allPalaces[0] = menhPalace;

    const inlineResult = interpretPalace(menhPalace, allPalaces);
    const precomputedResult = interpretPalace(menhPalace, allPalaces, undefined, []);

    expect(precomputedResult.palaceId).toBe(inlineResult.palaceId);
    expect(precomputedResult.majorStarsAnalysisVi).toBe(inlineResult.majorStarsAnalysisVi);
    expect(precomputedResult.coreThemeVi).toBe(inlineResult.coreThemeVi);
  });
});
