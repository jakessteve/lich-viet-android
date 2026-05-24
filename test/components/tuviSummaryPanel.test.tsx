import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TuViSummaryPanel } from '../../src/components/TuVi/TuViSummaryPanel';
import type { TuViChart, TuViPalace, TuViCombination } from '../../src/types/tuvi';

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

function makeChart(): TuViChart {
  const combinations: TuViCombination[] = [
    {
      id: 'sat-pha-lang',
      name: 'Sát Phá Lang',
      nameHanViet: '殺破狼',
      rarity: 3,
      involvedStars: ['Thất Sát', 'Phá Quân', 'Tham Lang'],
      involvedCung: ['Mệnh', 'Tài Bạch', 'Quan Lộc'],
      detectionReason: 'Tam hợp',
      purity: 'thuần',
      strength: 7,
      note: '',
      category: 'hung',
      sourcePatternId: 'sat-pha-lang',
    },
  ];

  const palaces = Array.from({ length: 12 }, (_, id) => makePalace({ id, name: `Cung ${id}` }));
  palaces[0] = makePalace({
    id: 0,
    name: 'Mệnh',
    chi: 'Tý',
    isMenh: true,
    chinhTinh: [{ name: 'Tử Vi', type: 'chinhTinh', nguHanh: 'Âm Thổ', brightness: 'Miếu' }],
    tuHoa: [{ type: 'Lộc', starName: 'Tử Vi', sourceCan: 'Giáp' }],
  });
  palaces[2] = makePalace({
    id: 2,
    name: 'Tài Bạch',
    chi: 'Dần',
    phuTinh: [{ name: 'Văn Xương', type: 'phuTinh', nguHanh: 'Âm Kim', brightness: 'Vượng' }],
  });
  palaces[4] = makePalace({
    id: 4,
    name: 'Quan Lộc',
    chi: 'Thìn',
    phuTinh: [{ name: 'Tả Phụ', type: 'phuTinh', nguHanh: 'Dương Thổ', brightness: 'Đắc' }],
  });

  return {
    input: {
      name: 'Test Person',
      solarDate: new Date(1990, 0, 1),
      birthHour: 0,
      gender: 'nam',
      timezone: 'Asia/Ho_Chi_Minh',
    },
    correctedDate: new Date(1990, 0, 1),
    lunarDate: { day: 1, month: 1, year: 1990, isLeapMonth: false },
    canChi: {
      year: { can: 'Giáp', chi: 'Tý' },
      month: { can: 'Ất', chi: 'Sửu' },
      day: { can: 'Bính', chi: 'Dần' },
      hour: { can: 'Đinh', chi: 'Mão' },
    },
    amDuong: 'Dương',
    thuanNghich: 'Thuận',
    centerInfo: {
      hoTen: 'Test Person',
      gioiTinh: 'Nam',
      amDuongLabel: 'Dương Nam',
      duongLich: '1990-01-01',
      schoolLabel: 'Thiên Lương',
      amLich: '1/1/1990',
      canChiYear: 'Giáp Tý',
      canChiMonth: 'Ất Sửu',
      canChiDay: 'Bính Dần',
      canChiHour: 'Đinh Mão',
      menhNapAm: 'Hải Trung Kim',
      cuc: 'Thủy Nhị Cục',
      cucNumber: 2,
      saoChuCuc: 'Lộc Tồn',
      menhChu: 'Tử Vi',
      thanChu: 'Thiên Phủ',
      laiNhanCung: 'Quan Lộc',
      nguyenThan: 'Tử Vi',
      menhCung: 'Mệnh cư Tý',
      thanCung: 'Thân cư Dần',
      thanCungLabel: 'Thân cư Tài Bạch',
    },
    palaces,
    combinations,
    huyenKhi: {
      totalScore: 18.7,
      palaceScores: Object.fromEntries(palaces.map((palace) => [palace.name, 0])),
      grade: 'Trung Cách',
    },
    menhCucRelation: {
      relation: 'sinh',
      description: 'Cục sinh Mệnh',
      menhHanh: 'Kim',
      cucHanh: 'Thủy',
    },
    auditWarnings: [],
  };
}

describe('TuViSummaryPanel', () => {
  it('shows overview facts and switches to combinations', () => {
    render(<TuViSummaryPanel chart={makeChart()} />);

    expect(screen.getByText('Tổng quan cấu trúc và Cách cục')).toBeTruthy();
    expect(screen.getByText('Thiên Lương')).toBeTruthy();
    expect(screen.getByText('Thủy Nhị Cục • Cục sinh Mệnh')).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: /Cách cục/ }));

    expect(screen.getByText('Sát Phá Lang')).toBeTruthy();
    expect(screen.getByText('Hung')).toBeTruthy();
    expect(screen.getByText('7/10')).toBeTruthy();
  });
});
