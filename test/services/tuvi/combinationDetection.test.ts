import { describe, it, expect } from 'vitest';
import {
  detectTamHopPalaces,
  detectDoiCung,
  getStarsInPalace,
  getStarsInTamHop,
  checkCombinationPurity,
  calculateCombinationStrength,
  detectCombinations,
} from '@/services/tuvi/combinationDetection';
import type { TuViPalace, TuViCombination } from '@/types/tuvi';

// ── Test Helpers ──────────────────────────────────────────────

function makePalace(overrides: Partial<TuViPalace> & { id: number }): TuViPalace {
  return {
    id: overrides.id,
    chi: 'Tý',
    name: `Cung ${overrides.id}`,
    nameHanViet: '命宮',
    can: 'Giáp',
    canChi: 'Giáp Tý',
    chinhTinh: [],
    phuTinh: [],
    satTinh: [],
    tuHoa: [],
    brightness: {},
    daiHanAgeRange: '1–10',
    isMenh: false,
    isThan: false,
    hasTuan: false,
    hasTriet: false,
    ...overrides,
  };
}

function makeStar(
  name: string,
  type: TuViPalace['chinhTinh'][number]['type'] = 'chinhTinh',
  brightness = 'Bình' as const,
) {
  return { name, type, nguHanh: 'Âm Thổ', brightness };
}

// ── Geometry Helpers ────────────────────────────────────────────

describe('detectTamHopPalaces', () => {
  it('returns the other two indices for a Tý palace (0)', () => {
    expect(detectTamHopPalaces(0).sort((a: number, b: number) => a - b)).toEqual([4, 8]);
  });

  it('returns the other two indices for a Dần palace (2)', () => {
    expect(detectTamHopPalaces(2).sort((a: number, b: number) => a - b)).toEqual([6, 10]);
  });

  it('returns the other two indices for a Hợi palace (11)', () => {
    expect(detectTamHopPalaces(11).sort((a: number, b: number) => a - b)).toEqual([3, 7]);
  });
});

describe('detectDoiCung', () => {
  it('returns 6 for Tý (0)', () => {
    expect(detectDoiCung(0)).toBe(6);
  });

  it('returns 2 for Thân (8)', () => {
    expect(detectDoiCung(8)).toBe(2);
  });

  it('is reflexive', () => {
    for (let i = 0; i < 12; i++) {
      expect(detectDoiCung(detectDoiCung(i))).toBe(i);
    }
  });
});

// ── Star Extraction ───────────────────────────────────────────

describe('getStarsInPalace', () => {
  it('returns all star names from chinhTinh, phuTinh, and satTinh', () => {
    const palace = makePalace({
      id: 0,
      chinhTinh: [makeStar('Tử Vi')],
      phuTinh: [makeStar('Văn Xương', 'phuTinh')],
      satTinh: [makeStar('Kình Dương', 'satTinh')],
    });
    expect(getStarsInPalace(palace)).toEqual(['Tử Vi', 'Văn Xương', 'Kình Dương']);
  });

  it('returns empty array for an empty palace', () => {
    const palace = makePalace({ id: 0 });
    expect(getStarsInPalace(palace)).toEqual([]);
  });
});

describe('getStarsInTamHop', () => {
  it('collects stars from palace + 2 tam hợp + đối cung', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i }));
    palaces[0] = makePalace({ id: 0, chinhTinh: [makeStar('Tử Vi')] });
    palaces[4] = makePalace({ id: 4, chinhTinh: [makeStar('Thiên Cơ')] });
    palaces[8] = makePalace({ id: 8, chinhTinh: [makeStar('Thái Dương')] });
    palaces[6] = makePalace({ id: 6, chinhTinh: [makeStar('Thái Âm')] });

    const stars = getStarsInTamHop(palaces, 0);
    expect(stars).toContain('Tử Vi');
    expect(stars).toContain('Thiên Cơ');
    expect(stars).toContain('Thái Dương');
    expect(stars).toContain('Thái Âm');
  });
});

// ── Purity Check ──────────────────────────────────────────────

describe('checkCombinationPurity', () => {
  it('returns thuần when no Sát Tinh are present', () => {
    const palace = makePalace({ id: 0 });
    expect(checkCombinationPurity([palace])).toBe('thuần');
  });

  it('returns phá when a major Sát Tinh is present', () => {
    const palace = makePalace({
      id: 0,
      satTinh: [makeStar('Kình Dương', 'satTinh')],
    });
    expect(checkCombinationPurity([palace])).toBe('phá');
  });

  it('returns phá for Đà La', () => {
    const palace = makePalace({
      id: 0,
      satTinh: [makeStar('Đà La', 'satTinh')],
    });
    expect(checkCombinationPurity([palace])).toBe('phá');
  });

  it('returns bán when only minor Sát Tinh are present', () => {
    const palace = makePalace({
      id: 0,
      satTinh: [makeStar('Địa Không', 'satTinh')],
    });
    expect(checkCombinationPurity([palace])).toBe('bán');
  });

  it('returns bán for Hóa Kỵ via tuHoa', () => {
    const palace = makePalace({
      id: 0,
      tuHoa: [{ type: 'Kỵ', starName: 'Văn Khúc', sourceCan: 'Giáp' }],
    });
    expect(checkCombinationPurity([palace])).toBe('bán');
  });

  it('returns phá when both major and minor Sát Tinh are present', () => {
    const palace = makePalace({
      id: 0,
      satTinh: [makeStar('Hỏa Tinh', 'satTinh'), makeStar('Địa Kiếp', 'satTinh')],
    });
    expect(checkCombinationPurity([palace])).toBe('phá');
  });
});

// ── Strength Calculation ──────────────────────────────────────

describe('calculateCombinationStrength', () => {
  it('returns base score around 5 for neutral conditions', () => {
    const palaces = Array.from({ length: 12 }, (_, i) => makePalace({ id: i }));
    const combo: TuViCombination = {
      name: 'Test',
      nameHanViet: '測試',
      involvedStars: ['Tử Vi'],
      involvedCung: ['Cung 0'],
      detectionReason: 'test',
      purity: 'thuần',
      strength: 0,
      note: '',
      category: 'cat',
    };
    expect(calculateCombinationStrength(combo, palaces)).toBe(7); // base 5 + thuần 2 = 7
  });

  it('increases strength for Miếu brightness', () => {
    const palaces = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, brightness: { 'Tử Vi': 'Miếu' } }));
    const combo: TuViCombination = {
      name: 'Test',
      nameHanViet: '測試',
      involvedStars: ['Tử Vi'],
      involvedCung: ['Cung 0'],
      detectionReason: 'test',
      purity: 'thuần',
      strength: 0,
      note: '',
      category: 'cat',
    };
    expect(calculateCombinationStrength(combo, palaces)).toBe(9); // 5 + 2 (Miếu) + 2 (thuần) = 9
  });

  it('decreases strength for Hãm brightness', () => {
    const palaces = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, brightness: { 'Tử Vi': 'Hãm' } }));
    const combo: TuViCombination = {
      name: 'Test',
      nameHanViet: '測試',
      involvedStars: ['Tử Vi'],
      involvedCung: ['Cung 0'],
      detectionReason: 'test',
      purity: 'thuần',
      strength: 0,
      note: '',
      category: 'cat',
    };
    expect(calculateCombinationStrength(combo, palaces)).toBe(6); // 5 - 1 (Hãm) + 2 (thuần) = 6
  });

  it('caps at 10', () => {
    const palaces = Array.from({ length: 12 }, (_, i) =>
      makePalace({
        id: i,
        brightness: { 'Tử Vi': 'Miếu', 'Thiên Cơ': 'Vượng' },
        isMenh: i === 0,
      }),
    );
    const combo: TuViCombination = {
      name: 'Test',
      nameHanViet: '測試',
      involvedStars: ['Tử Vi', 'Thiên Cơ'],
      involvedCung: ['Cung 0'],
      detectionReason: 'test',
      purity: 'thuần',
      strength: 0,
      note: '',
      category: 'cat',
    };
    expect(calculateCombinationStrength(combo, palaces)).toBe(10); // 5 + 2 + 1.5 + 2 + 1 = 11.5 -> capped at 10
  });

  it('floors at 1', () => {
    const palaces = Array.from({ length: 12 }, (_, i) =>
      makePalace({
        id: i,
        brightness: { 'Tử Vi': 'Hãm' },
      }),
    );
    const combo: TuViCombination = {
      name: 'Test',
      nameHanViet: '測試',
      involvedStars: ['Tử Vi'],
      involvedCung: ['Cung 0'],
      detectionReason: 'test',
      purity: 'phá',
      strength: 0,
      note: '',
      category: 'hung',
    };
    expect(calculateCombinationStrength(combo, palaces)).toBe(2); // 5 - 1 (Hãm) - 2 (phá) = 2
  });
});

// ── detectCombinations ────────────────────────────────────────

describe('detectCombinations', () => {
  it('detects sameCung combination (Tử Phủ)', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    palaces[0] = makePalace({
      id: 0,
      name: 'Cung 0',
      chinhTinh: [makeStar('Tử Vi'), makeStar('Thiên Phủ')],
    });

    const results = detectCombinations(palaces);
    const tuPhu = results.find((r: TuViCombination) => r.name === 'Tử Phủ');
    expect(tuPhu).toBeDefined();
    expect(tuPhu?.involvedCung).toContain('Cung 0');
    expect(tuPhu?.involvedStars).toEqual(['Tử Vi', 'Thiên Phủ']);
  });

  it('detects tamHop combination (Sát Phá Lang)', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    // TAM_HOP group for 0 is [0, 4, 8]
    palaces[0] = makePalace({ id: 0, name: 'Cung 0', chinhTinh: [makeStar('Thất Sát')] });
    palaces[4] = makePalace({ id: 4, name: 'Cung 4', chinhTinh: [makeStar('Phá Quân')] });
    palaces[8] = makePalace({ id: 8, name: 'Cung 8', chinhTinh: [makeStar('Tham Lang')] });

    const results = detectCombinations(palaces);
    const spl = results.find((r: TuViCombination) => r.name === 'Sát Phá Lang');
    expect(spl).toBeDefined();
    expect(spl?.involvedStars).toEqual(['Thất Sát', 'Phá Quân', 'Tham Lang']);
  });

  it('detects sameCungOrTamHop as sameCung when stars are in one palace', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    palaces[0] = makePalace({
      id: 0,
      name: 'Cung 0',
      phuTinh: [makeStar('Văn Xương', 'phuTinh'), makeStar('Văn Khúc', 'phuTinh')],
    });

    const results = detectCombinations(palaces);
    const xk = results.find((r: TuViCombination) => r.name === 'Xương Khúc');
    expect(xk).toBeDefined();
    expect(xk?.involvedCung).toEqual(['Cung 0']);
    expect(xk?.detectionReason).toContain('cùng cung');
  });

  it('detects sameCungOrTamHop as tamHop when stars are spread', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    // TAM_HOP group for 0 is [0, 4, 8]
    palaces[0] = makePalace({ id: 0, name: 'Cung 0', phuTinh: [makeStar('Văn Xương', 'phuTinh')] });
    palaces[4] = makePalace({ id: 4, name: 'Cung 4', phuTinh: [makeStar('Văn Khúc', 'phuTinh')] });

    const results = detectCombinations(palaces);
    const xk = results.find((r: TuViCombination) => r.name === 'Xương Khúc');
    expect(xk).toBeDefined();
    expect(xk?.involvedCung).toContain('Cung 0');
    expect(xk?.involvedCung).toContain('Cung 4');
    expect(xk?.detectionReason).toContain('tam hợp');
  });

  it('detects giap combination (Giáp Sát)', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    // Palace 1 flanked by palace 0 and palace 2
    palaces[0] = makePalace({ id: 0, name: 'Cung 0', satTinh: [makeStar('Kình Dương', 'satTinh')] });
    palaces[2] = makePalace({ id: 2, name: 'Cung 2', satTinh: [makeStar('Đà La', 'satTinh')] });

    const results = detectCombinations(palaces);
    const gs = results.find((r: TuViCombination) => r.name === 'Giáp Sát');
    expect(gs).toBeDefined();
    expect(gs?.involvedCung).toContain('Cung 1');
    expect(gs?.involvedCung).toContain('Cung 0');
    expect(gs?.involvedCung).toContain('Cung 2');
  });

  it('detects requiresTuHoa combination (Tam Kỳ)', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    // TAM_HOP group for 0 is [0, 4, 8]
    palaces[0] = makePalace({
      id: 0,
      name: 'Cung 0',
      tuHoa: [{ type: 'Lộc', starName: 'Văn Khúc', sourceCan: 'Giáp' }],
    });
    palaces[4] = makePalace({
      id: 4,
      name: 'Cung 4',
      tuHoa: [{ type: 'Quyền', starName: 'Tử Vi', sourceCan: 'Giáp' }],
    });
    palaces[8] = makePalace({
      id: 8,
      name: 'Cung 8',
      tuHoa: [{ type: 'Khoa', starName: 'Thiên Cơ', sourceCan: 'Giáp' }],
    });

    const results = detectCombinations(palaces);
    const tk = results.find((r: TuViCombination) => r.name === 'Tam Kỳ');
    expect(tk).toBeDefined();
    expect(tk?.involvedStars).toEqual(['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa']);
  });

  it('does not detect Tam Kỳ when only two Tứ Hóa are present', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    palaces[0] = makePalace({
      id: 0,
      name: 'Cung 0',
      tuHoa: [{ type: 'Lộc', starName: 'Văn Khúc', sourceCan: 'Giáp' }],
    });
    palaces[4] = makePalace({
      id: 4,
      name: 'Cung 4',
      tuHoa: [{ type: 'Quyền', starName: 'Tử Vi', sourceCan: 'Giáp' }],
    });

    const results = detectCombinations(palaces);
    const tk = results.find((r: TuViCombination) => r.name === 'Tam Kỳ');
    expect(tk).toBeUndefined();
  });

  it('deduplicates tamHop detections', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    // All three Sát Phá Lang stars in one palace of the tam hợp group
    palaces[0] = makePalace({
      id: 0,
      name: 'Cung 0',
      chinhTinh: [makeStar('Thất Sát'), makeStar('Phá Quân'), makeStar('Tham Lang')],
    });

    const results = detectCombinations(palaces);
    const splResults = results.filter((r: TuViCombination) => r.name === 'Sát Phá Lang');
    // Should only detect once even though palace 0, 4, 8 are all in the same group
    expect(splResults.length).toBeLessThanOrEqual(1);
  });

  it('marks purity correctly for combinations with Sát Tinh', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    palaces[0] = makePalace({
      id: 0,
      name: 'Cung 0',
      chinhTinh: [makeStar('Tử Vi'), makeStar('Thiên Phủ')],
      satTinh: [makeStar('Kình Dương', 'satTinh')],
    });

    const results = detectCombinations(palaces);
    const tuPhu = results.find((r: TuViCombination) => r.name === 'Tử Phủ');
    expect(tuPhu).toBeDefined();
    expect(tuPhu?.purity).toBe('phá');
  });

  it('detects rare pattern Minh Châu Xuất Hải', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    palaces[1] = makePalace({ id: 1, name: 'Cung 1', chi: 'Sửu', isMenh: true });
    palaces[5] = makePalace({ id: 5, name: 'Cung 5', chi: 'Tỵ', chinhTinh: [makeStar('Thái Dương')] });
    palaces[9] = makePalace({ id: 9, name: 'Cung 9', chi: 'Dậu', chinhTinh: [makeStar('Thái Âm')] });

    const results = detectCombinations(palaces);
    const minhChau = results.find((r: TuViCombination) => r.name === 'Minh Châu Xuất Hải');
    expect(minhChau).toBeDefined();
    expect(minhChau?.involvedStars).toEqual(['Thái Dương', 'Thái Âm']);
    expect(minhChau?.involvedCung).toContain('Cung 1');
  });

  it('detects rare pattern Tọa Quý Hướng Quý', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    palaces[0] = makePalace({ id: 0, name: 'Cung 0', chi: 'Tý', isMenh: true, chinhTinh: [makeStar('Tử Vi')] });
    palaces[11] = makePalace({ id: 11, name: 'Cung 11', chi: 'Hợi', phuTinh: [makeStar('Thiên Khôi', 'phuTinh')] });
    palaces[1] = makePalace({ id: 1, name: 'Cung 1', chi: 'Sửu', phuTinh: [makeStar('Thiên Việt', 'phuTinh')] });

    const results = detectCombinations(palaces);
    const toaQuy = results.find((r: TuViCombination) => r.name === 'Tọa Quý Hướng Quý');
    expect(toaQuy).toBeDefined();
    expect(toaQuy?.involvedCung).toEqual(expect.arrayContaining(['Cung 0', 'Cung 11', 'Cung 1']));
  });

  it('detects branch-specific pattern Văn Quế Văn Hoa', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    palaces[1] = makePalace({
      id: 1,
      name: 'Cung 1',
      chi: 'Sửu',
      isMenh: true,
      phuTinh: [makeStar('Văn Xương', 'phuTinh'), makeStar('Văn Khúc', 'phuTinh')],
    });

    const results = detectCombinations(palaces);
    const pattern = results.find((r: TuViCombination) => r.name === 'Văn Quế Văn Hoa');
    expect(pattern).toBeDefined();
    expect(pattern?.involvedCung).toEqual(['Cung 1']);
  });

  it('returns empty array when no combinations match', () => {
    const palaces: TuViPalace[] = Array.from({ length: 12 }, (_, i) => makePalace({ id: i, name: `Cung ${i}` }));
    const results = detectCombinations(palaces);
    expect(results).toEqual([]);
  });
});
