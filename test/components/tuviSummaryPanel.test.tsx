import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TuViSummaryPanel } from '../../src/components/TuVi/TuViSummaryPanel';
import type { TuViChart, TuViPalace, TuViCombination } from '../../src/types/tuvi';
import { MemoryRouter } from 'react-router-dom';

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
    rings: {
      truongSinh: 'Trường Sinh',
      bacSi: 'Bác Sỹ',
      thaiTue: 'Thái Tuế',
      tuongTinh: 'Tướng Tinh',
    },
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
      description: 'Cách cục vô cùng mạnh mẽ, đại diện cho sự khai sáng, tiên phong và những biến động lớn trong cuộc đời.',
      category: 'hung',
      sourcePatternId: 'sat-pha-lang',
    },
  ];

  const palaces = Array.from({ length: 12 }, (_, id) =>
    makePalace({
      id,
      name: id === 0 ? 'Mệnh' : id === 8 ? 'Quan Lộc' : `Cung ${id}`,
      daiHanAgeRange: `${id * 10 + 2}–${id * 10 + 11}`,
    }),
  );

  palaces[0] = makePalace({
    id: 0,
    name: 'Mệnh',
    chi: 'Tý',
    isMenh: true,
    daiHanAgeRange: '2–11',
    chinhTinh: [{ name: 'Tử Vi', type: 'chinhTinh', nguHanh: 'Dương Thổ', brightness: 'Miếu' }],
    tuHoa: [{ type: 'Lộc', starName: 'Tử Vi', sourceCan: 'Giáp' }],
  });
  palaces[2] = makePalace({
    id: 2,
    name: 'Tài Bạch',
    chi: 'Dần',
    daiHanAgeRange: '22–31',
    phuTinh: [{ name: 'Văn Xương', type: 'phuTinh', nguHanh: 'Âm Kim', brightness: 'Vượng' }],
  });
  palaces[4] = makePalace({
    id: 4,
    name: 'Quan Lộc',
    chi: 'Thìn',
    daiHanAgeRange: '42–51',
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
    menhCucRelation: {
      relation: 'sinh',
      description: 'Cục sinh Mệnh',
      menhHanh: 'Kim',
      cucHanh: 'Thủy',
    },
    auditWarnings: [],
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TuViSummaryPanel', () => {
  it('shows the overview details with current Đại hạn Tam Tài scoreboard and switches between Simple and Advanced modes', () => {
    render(
      <MemoryRouter>
        <TuViSummaryPanel chart={makeChart()} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Tổng quan cấu trúc và Đại hạn')).toBeTruthy();
    expect(screen.getByText('Bố cục chính tinh')).toBeTruthy();
    expect(screen.getByText('Tứ Hóa hiện diện')).toBeTruthy();
    expect(screen.getByText(/Đại Hạn Hiện Tại:/i)).toBeTruthy();
    expect(screen.getByText('Thiên Thời (Thái Tuế)')).toBeTruthy();
    expect(screen.getByText('Địa Lợi (Cung Chi)')).toBeTruthy();
    expect(screen.getByText('Nhân Hòa (Quý Nhân)')).toBeTruthy();
    expect(screen.getByText('Khí Lực (Trường Sinh)')).toBeTruthy();

    // Switch to Đại hạn tab (defaults to Simple mode)
    fireEvent.click(screen.getByRole('tab', { name: /Đại hạn/ }));

    expect(screen.getByText(/Dòng thời gian 12 Đại Hạn/i)).toBeTruthy();
    expect(screen.getByText('Tổng Quan Dòng Vận 10 Năm')).toBeTruthy();
    expect(screen.getByText('Sự Nghiệp & Tài Lộc')).toBeTruthy();
    expect(screen.getByText('Chiến Lược Hành Động Trọng Tâm')).toBeTruthy();

    // Switch to Chuyên sâu (Advanced) mode
    fireEvent.click(screen.getByRole('tab', { name: /Chuyên sâu/ }));

    expect(screen.getByText('Bố Cục Tọa Thủ & Tam Phương Tứ Chính')).toBeTruthy();
    expect(screen.getByText('Đánh Giá Tam Tài (Thiên Thời – Địa Lợi – Nhân Hòa)')).toBeTruthy();
    expect(screen.getByText(/Cách Cục & Điểm Nhấn Nổi Bật/i)).toBeTruthy();
    expect(screen.getByText('Lộ Trình 10 Năm & Dự Báo Toàn Diện')).toBeTruthy();
    expect(screen.getByText(/Phân kỳ tiến trình 5 năm/i)).toBeTruthy();
  });

  it('allows clicking different Đại Hạn chips in the timeline to update details', () => {
    render(
      <MemoryRouter>
        <TuViSummaryPanel chart={makeChart()} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('tab', { name: /Đại hạn/ }));

    const chips = screen.getAllByRole('button').filter((b) => b.textContent?.includes('2–11t'));
    expect(chips.length).toBeGreaterThan(0);
    fireEvent.click(chips[0]);

    expect(screen.getByRole('heading', { name: /Đại Hạn 2–11 tuổi/i })).toBeTruthy();
  });
});
