import { describe, it, expect } from 'vitest';
import { calculateMenhCucRelation, getMenhHanh, getCucHanh } from '@/services/tuvi/menhCucRelation';

describe('calculateMenhCucRelation', () => {
  it('returns bình hòa when elements are the same', () => {
    const result = calculateMenhCucRelation('Kim', 'Kim');
    expect(result.relation).toBe('bình hòa');
    expect(result.description).toBe('Mệnh Cục bình hòa');
    expect(result.menhHanh).toBe('Kim');
    expect(result.cucHanh).toBe('Kim');
  });

  it('returns sinh "Cục sinh Mệnh" when Cục generates Mệnh', () => {
    // Thổ sinh Kim
    const result = calculateMenhCucRelation('Kim', 'Thổ');
    expect(result.relation).toBe('sinh');
    expect(result.description).toBe('Cục sinh Mệnh');
  });

  it('returns sinh "Mệnh sinh Cục" when Mệnh generates Cục', () => {
    // Kim sinh Thủy
    const result = calculateMenhCucRelation('Kim', 'Thủy');
    expect(result.relation).toBe('sinh');
    expect(result.description).toBe('Mệnh sinh Cục');
  });

  it('returns khắc "Cục khắc Mệnh" when Cục overcomes Mệnh', () => {
    // Hỏa khắc Kim
    const result = calculateMenhCucRelation('Kim', 'Hỏa');
    expect(result.relation).toBe('khắc');
    expect(result.description).toBe('Cục khắc Mệnh');
  });

  it('returns khắc "Mệnh khắc Cục" when Mệnh overcomes Cục', () => {
    // Kim khắc Mộc
    const result = calculateMenhCucRelation('Kim', 'Mộc');
    expect(result.relation).toBe('khắc');
    expect(result.description).toBe('Mệnh khắc Cục');
  });

  it('returns bình hòa for unrelated elements (should not happen in 5-element cycle)', () => {
    // In a complete 5-element cycle every pair is either sinh or khắc,
    // but we test the fallback for safety.
    const result = calculateMenhCucRelation('Unknown', 'AlsoUnknown');
    expect(result.relation).toBe('bình hòa');
    expect(result.description).toBe('Mệnh Cục bình hòa');
  });

  it('covers all 5-element sinh cases', () => {
    // Thổ → Kim
    expect(calculateMenhCucRelation('Kim', 'Thổ').description).toBe('Cục sinh Mệnh');
    // Kim → Thủy
    expect(calculateMenhCucRelation('Thủy', 'Kim').description).toBe('Cục sinh Mệnh');
    // Thủy → Mộc
    expect(calculateMenhCucRelation('Mộc', 'Thủy').description).toBe('Cục sinh Mệnh');
    // Mộc → Hỏa
    expect(calculateMenhCucRelation('Hỏa', 'Mộc').description).toBe('Cục sinh Mệnh');
    // Hỏa → Thổ
    expect(calculateMenhCucRelation('Thổ', 'Hỏa').description).toBe('Cục sinh Mệnh');
  });

  it('covers all 5-element khắc cases', () => {
    // Kim → Mộc
    expect(calculateMenhCucRelation('Mộc', 'Kim').description).toBe('Cục khắc Mệnh');
    // Mộc → Thổ
    expect(calculateMenhCucRelation('Thổ', 'Mộc').description).toBe('Cục khắc Mệnh');
    // Thổ → Thủy
    expect(calculateMenhCucRelation('Thủy', 'Thổ').description).toBe('Cục khắc Mệnh');
    // Thủy → Hỏa
    expect(calculateMenhCucRelation('Hỏa', 'Thủy').description).toBe('Cục khắc Mệnh');
    // Hỏa → Kim
    expect(calculateMenhCucRelation('Kim', 'Hỏa').description).toBe('Cục khắc Mệnh');
  });
});

describe('getMenhHanh', () => {
  it('returns Kim for Giáp Tý (Hải Trung Kim)', () => {
    // Giáp = canIndex 0, Tý = chiIndex 0
    // napAmIndex = 0 * 6 + floor(0/2) = 0 → Hải Trung Kim → Kim
    expect(getMenhHanh(0, 0)).toBe('Kim');
  });

  it('returns Hỏa for Bính Dần (Lô Trung Hỏa)', () => {
    // Bính = canIndex 2, Dần = chiIndex 2
    expect(getMenhHanh(2, 2)).toBe('Hỏa');
  });

  it('returns Thủy for Giáp Thân (Tuyền Trung Thủy)', () => {
    // Giáp = canIndex 0, Thân = chiIndex 8
    expect(getMenhHanh(8, 0)).toBe('Thủy');
  });

  it('returns Mộc for Mậu Thìn (Đại Lâm Mộc)', () => {
    // Mậu = canIndex 4, Thìn = chiIndex 4
    expect(getMenhHanh(4, 4)).toBe('Mộc');
  });
});

describe('getCucHanh', () => {
  it('returns Thủy for Thủy Nhị Cục', () => {
    expect(getCucHanh('Thủy Nhị Cục')).toBe('Thủy');
  });

  it('returns Mộc for Mộc Tam Cục', () => {
    expect(getCucHanh('Mộc Tam Cục')).toBe('Mộc');
  });

  it('returns Kim for Kim Tứ Cục', () => {
    expect(getCucHanh('Kim Tứ Cục')).toBe('Kim');
  });

  it('returns Thổ for Thổ Ngũ Cục', () => {
    expect(getCucHanh('Thổ Ngũ Cục')).toBe('Thổ');
  });

  it('returns Hỏa for Hỏa Lục Cục', () => {
    expect(getCucHanh('Hỏa Lục Cục')).toBe('Hỏa');
  });

  it('returns empty string for unknown Cục', () => {
    expect(getCucHanh('Unknown Cục')).toBe('');
  });
});
