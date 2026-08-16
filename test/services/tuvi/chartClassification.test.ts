import { describe, it, expect } from 'vitest';
import { generateChart } from '@/services/tuvi/starPlacement';
import { classifyTuViChart } from '@/services/tuvi/chartClassification';
import type { TuViInput } from '@/types/tuvi';

describe('Chart Classification Engine (Cây Phân Loại Lá Số)', () => {
  it('correctly classifies a 1990 Male chart into full tree archetype', () => {
    const input: TuViInput = {
      name: 'Male 1990',
      solarDate: new Date(1990, 4, 15),
      birthHour: 6, // Giờ Ngọ
      gender: 'nam',
      timezone: 'Asia/Ho_Chi_Minh',
    };

    const chart = generateChart(input);
    const classification = classifyTuViChart(chart);

    expect(classification.gender).toBe('nam');
    expect(classification.amDuongNamNu).toBe('Dương Nam');
    expect(classification.cucName).toBe('Thổ Ngũ Cục');
    expect(classification.menhChi).toBe('Hợi');
    expect(classification.thanCuCung).toBe('Thân cư Mệnh');
    expect(classification.classificationPath.length).toBe(5);
    expect(classification.classificationPath[0]).toBe('Dương Nam');
    expect(classification.classificationPath[1]).toBe('Thổ Ngũ Cục');
    expect(classification.patternSummaryVi).toContain('Thổ Ngũ Cục');
    expect(classification.patternSummaryVi).toContain('Thân Mệnh đồng cung');
  });

  it('correctly classifies a 1985 Female chart into tree archetype', () => {
    const input: TuViInput = {
      name: 'Female 1985',
      solarDate: new Date(1985, 0, 1),
      birthHour: 0, // Giờ Tý
      gender: 'nữ',
      timezone: 'Asia/Ho_Chi_Minh',
    };

    const chart = generateChart(input);
    const classification = classifyTuViChart(chart);

    expect(classification.gender).toBe('nữ');
    expect(classification.amDuongNamNu).toBe('Dương Nữ');
    expect(classification.cucName).toBe('Thủy Nhị Cục');
    expect(classification.thanCuCung).toBe('Thân cư Mệnh');
    expect(classification.patternSummaryVi).toContain('Thân Mệnh đồng cung');
  });
});
