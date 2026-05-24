import { describe, it, expect } from 'vitest';
import {
  calculateCenterInfo,
  calculateLaiNhanCung,
  calculateNguyenThan,
  formatAmDuongLabel,
  formatLunarDate,
  getPalaceNameByPosition,
  type CenterMetadataChart,
} from '@/services/tuvi/centerMetadata';
import type { TuViPalace, TuViGender, AmDuong } from '@/types/tuvi';
import type { Can, Chi } from '@/types/calendar';
import { CAN, CHI } from '@/utils/constants';

// ── Mock Helpers ────────────────────────────────────────────────

function createMockPalaces(menhPosition: number): TuViPalace[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    chi: CHI[i] as Chi,
    name: getPalaceNameByPosition(i, menhPosition),
    nameHanViet: '命宮',
    can: CAN[i % 10] as Can,
    canChi: `${CAN[i % 10]} ${CHI[i]}`,
    chinhTinh:
      i === 2
        ? [
            {
              name: 'Tử Vi',
              type: 'chinhTinh' as const,
              nguHanh: 'Âm Thổ',
              brightness: 'Miếu' as const,
            },
          ]
        : [],
    phuTinh: [],
    satTinh: [],
    tuHoa: [],
    brightness: {},
    daiHanAgeRange: '1–10',
    isMenh: i === menhPosition,
    isThan: false,
    hasTuan: false,
    hasTriet: false,
  }));
}

function createMockChart(overrides: Partial<CenterMetadataChart> = {}): CenterMetadataChart {
  const menhPosition = overrides.menhPosition ?? 2; // Dần
  return {
    input: {
      name: 'Nguyễn Văn A',
      solarDate: new Date('1990-05-15'),
      birthHour: 4, // Mão
      gender: 'nam' as TuViGender,
      timezone: 'Asia/Ho_Chi_Minh',
    },
    correctedDate: new Date('1990-05-15'),
    lunarDate: { day: 21, month: 4, year: 1990, isLeapMonth: false },
    canChi: {
      year: { can: 'Canh' as Can, chi: 'Ngọ' as Chi },
      month: { can: 'Tân' as Can, chi: 'Tỵ' as Chi },
      day: { can: 'Canh' as Can, chi: 'Thìn' as Chi },
      hour: { can: 'Nhâm' as Can, chi: 'Thìn' as Chi },
    },
    amDuong: 'Dương' as AmDuong,
    thuanNghich: 'Thuận',
    palaces: createMockPalaces(menhPosition),
    menhPosition,
    thanPosition: 5, // Tỵ
    cucName: 'Thủy Nhị Cục',
    cucNumber: 2,
    ...overrides,
  };
}

function createLaiNhanPalaces(): TuViPalace[] {
  return Array.from({ length: 12 }, (_, i) => {
    const can = (i === 0 || i === 2 ? 'Canh' : i === 11 ? 'Quý' : 'Giáp') as Can;
    const name = i === 0 ? 'Tý Palace' : i === 2 ? 'Dần Palace' : i === 11 ? 'Hợi Palace' : `P${i}`;

    return {
      id: i,
      chi: CHI[i] as Chi,
      name,
      nameHanViet: '命宮',
      can,
      canChi: `${can} ${CHI[i]}`,
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
    };
  });
}

// ── calculateCenterInfo ─────────────────────────────────────────

describe('calculateCenterInfo', () => {
  it('returns all required fields', () => {
    const chart = createMockChart();
    const info = calculateCenterInfo(chart);

    expect(info).toHaveProperty('hoTen');
    expect(info).toHaveProperty('gioiTinh');
    expect(info).toHaveProperty('amDuongLabel');
    expect(info).toHaveProperty('duongLich');
    expect(info).toHaveProperty('amLich');
    expect(info).toHaveProperty('canChiYear');
    expect(info).toHaveProperty('canChiMonth');
    expect(info).toHaveProperty('canChiDay');
    expect(info).toHaveProperty('canChiHour');
    expect(info).toHaveProperty('menhNapAm');
    expect(info).toHaveProperty('cuc');
    expect(info).toHaveProperty('cucNumber');
    expect(info).toHaveProperty('saoChuCuc');
    expect(info).toHaveProperty('menhChu');
    expect(info).toHaveProperty('thanChu');
    expect(info).toHaveProperty('laiNhanCung');
    expect(info).toHaveProperty('nguyenThan');
    expect(info).toHaveProperty('menhCung');
    expect(info).toHaveProperty('thanCung');
    expect(info).toHaveProperty('thanCungLabel');
  });

  it('uses input name when provided', () => {
    const chart = createMockChart({ input: { ...createMockChart().input, name: 'Trần Thị B' } });
    const info = calculateCenterInfo(chart);
    expect(info.hoTen).toBe('Trần Thị B');
  });

  it('falls back to "Chưa đặt tên" when name is missing', () => {
    const chart = createMockChart({ input: { ...createMockChart().input, name: undefined } });
    const info = calculateCenterInfo(chart);
    expect(info.hoTen).toBe('Chưa đặt tên');
  });

  it('falls back to "Chưa đặt tên" when name is empty or whitespace', () => {
    const chart1 = createMockChart({ input: { ...createMockChart().input, name: '' } });
    expect(calculateCenterInfo(chart1).hoTen).toBe('Chưa đặt tên');

    const chart2 = createMockChart({ input: { ...createMockChart().input, name: '   ' } });
    expect(calculateCenterInfo(chart2).hoTen).toBe('Chưa đặt tên');
  });

  it('formats gioiTinh correctly for nam', () => {
    const chart = createMockChart({ input: { ...createMockChart().input, gender: 'nam' } });
    expect(calculateCenterInfo(chart).gioiTinh).toBe('Nam');
  });

  it('formats gioiTinh correctly for nữ', () => {
    const chart = createMockChart({ input: { ...createMockChart().input, gender: 'nữ' } });
    expect(calculateCenterInfo(chart).gioiTinh).toBe('Nữ');
  });

  it('formats duongLich as DD/MM/YYYY', () => {
    const chart = createMockChart({ correctedDate: new Date('1990-05-15') });
    expect(calculateCenterInfo(chart).duongLich).toBe('15/05/1990');
  });

  it('formats amLich with Can-Chi and leap marker', () => {
    const chart = createMockChart({
      lunarDate: { day: 15, month: 2, year: 1990, isLeapMonth: true },
    });
    expect(calculateCenterInfo(chart).amLich).toBe('Năm Canh Ngọ, tháng 2 (nhuận), ngày 15');
  });

  it('formats amLich without leap marker when not leap', () => {
    const chart = createMockChart({
      lunarDate: { day: 21, month: 4, year: 1990, isLeapMonth: false },
    });
    expect(calculateCenterInfo(chart).amLich).toBe('Năm Canh Ngọ, tháng 4, ngày 21');
  });

  it('formats canChi fields correctly', () => {
    const chart = createMockChart();
    const info = calculateCenterInfo(chart);
    expect(info.canChiYear).toBe('Canh Ngọ');
    expect(info.canChiMonth).toBe('Tân Tỵ');
    expect(info.canChiDay).toBe('Canh Thìn');
    expect(info.canChiHour).toBe('Nhâm Thìn');
  });

  it('looks up menhNapAm from Mệnh palace Can-Chi', () => {
    // Mệnh at Dần (index 2), Can at Dần in this mock is CAN[2] = 'Bính'
    // Bính Dần → Lô Trung Hỏa
    const chart = createMockChart({ menhPosition: 2 });
    const info = calculateCenterInfo(chart);
    expect(info.menhNapAm).toBe('Lô Trung Hỏa');
  });

  it('sets cuc and cucNumber from chart', () => {
    const chart = createMockChart({ cucName: 'Kim Tứ Cục', cucNumber: 4 });
    const info = calculateCenterInfo(chart);
    expect(info.cuc).toBe('Kim Tứ Cục');
    expect(info.cucNumber).toBe(4);
  });

  it('looks up saoChuCuc from cucSaoTable', () => {
    const chart = createMockChart({ cucName: 'Thủy Nhị Cục' });
    expect(calculateCenterInfo(chart).saoChuCuc).toBe('Thiên Lương');
  });

  it('looks up menhChu from menhChuTable by Mệnh Chi', () => {
    // Mệnh at Dần → Lộc Tồn
    const chart = createMockChart({ menhPosition: 2 });
    expect(calculateCenterInfo(chart).menhChu).toBe('Lộc Tồn');
  });

  it('looks up thanChu from thanChuTable by year Can', () => {
    // Canh → Vũ Khúc
    const chart = createMockChart();
    expect(calculateCenterInfo(chart).thanChu).toBe('Vũ Khúc');
  });

  it('calculates laiNhanCung from the birth year stem', () => {
    const chart = createMockChart({ menhPosition: 2, input: { ...createMockChart().input, birthHour: 4 } });
    expect(calculateCenterInfo(chart).laiNhanCung).toBe('Tài Bạch');
  });

  it('calculates nguyenThan from year Can', () => {
    // Canh = index 6 → (2 + (6 % 5)) % 12 = 3 (Mão)
    // Mock palace at Mão (index 3) has no chinhTinh, so fallback to CHI[3] = 'Mão'
    const chart = createMockChart();
    const info = calculateCenterInfo(chart);
    expect(info.nguyenThan).toBe('Mão');
  });

  it('uses first chinhTinh name for nguyenThan when available', () => {
    // Giáp = index 0 → (2 + 0) % 12 = 2 (Dần)
    // Mock palace at Dần (index 2) has Tử Vi
    const chart = createMockChart({
      canChi: {
        ...createMockChart().canChi,
        year: { can: 'Giáp' as Can, chi: 'Tý' as Chi },
      },
    });
    expect(calculateCenterInfo(chart).nguyenThan).toBe('Tử Vi');
  });

  it('formats menhCung correctly', () => {
    const chart = createMockChart({ menhPosition: 2 });
    expect(calculateCenterInfo(chart).menhCung).toBe('Mệnh cư Dần');
  });

  it('formats thanCung correctly', () => {
    const chart = createMockChart({ thanPosition: 5 });
    expect(calculateCenterInfo(chart).thanCung).toBe('Thân cư Tỵ');
  });

  it('formats thanCungLabel with palace name', () => {
    // thanPosition=5 (Tỵ), menhPosition=2 (Dần)
    // offset = 5 - 2 = 3 → PALACE_NAMES[3] = Tử Tức
    const chart = createMockChart({ menhPosition: 2, thanPosition: 5 });
    expect(calculateCenterInfo(chart).thanCungLabel).toBe('Thân cư Tử Tức');
  });
});

// ── calculateLaiNhanCung ────────────────────────────────────────

describe('calculateLaiNhanCung', () => {
  it('returns the palace name for a unique year stem match', () => {
    expect(calculateLaiNhanCung(CAN.indexOf('Quý'), createLaiNhanPalaces())).toBe('Hợi Palace');
  });

  it('prefers the later matching palace when a year stem appears twice', () => {
    expect(calculateLaiNhanCung(CAN.indexOf('Canh'), createLaiNhanPalaces())).toBe('Dần Palace');
  });
});

// ── calculateNguyenThan ─────────────────────────────────────────

describe('calculateNguyenThan', () => {
  it('Giáp (0) → Dần (2)', () => {
    expect(calculateNguyenThan(0)).toBe(2);
  });

  it('Kỷ (5) → Dần (2)', () => {
    expect(calculateNguyenThan(5)).toBe(2);
  });

  it('Ất (1) → Mão (3)', () => {
    expect(calculateNguyenThan(1)).toBe(3);
  });

  it('Canh (6) → Mão (3)', () => {
    expect(calculateNguyenThan(6)).toBe(3);
  });

  it('Bính (2) → Thìn (4)', () => {
    expect(calculateNguyenThan(2)).toBe(4);
  });

  it('Tân (7) → Thìn (4)', () => {
    expect(calculateNguyenThan(7)).toBe(4);
  });

  it('Đinh (3) → Tỵ (5)', () => {
    expect(calculateNguyenThan(3)).toBe(5);
  });

  it('Nhâm (8) → Tỵ (5)', () => {
    expect(calculateNguyenThan(8)).toBe(5);
  });

  it('Mậu (4) → Ngọ (6)', () => {
    expect(calculateNguyenThan(4)).toBe(6);
  });

  it('Quý (9) → Ngọ (6)', () => {
    expect(calculateNguyenThan(9)).toBe(6);
  });
});

// ── formatAmDuongLabel ──────────────────────────────────────────

describe('formatAmDuongLabel', () => {
  it('returns "Dương Nam" for Dương + nam', () => {
    expect(formatAmDuongLabel('Dương', 'nam')).toBe('Dương Nam');
  });

  it('returns "Dương Nữ" for Dương + nữ', () => {
    expect(formatAmDuongLabel('Dương', 'nữ')).toBe('Dương Nữ');
  });

  it('returns "Âm Nam" for Âm + nam', () => {
    expect(formatAmDuongLabel('Âm', 'nam')).toBe('Âm Nam');
  });

  it('returns "Âm Nữ" for Âm + nữ', () => {
    expect(formatAmDuongLabel('Âm', 'nữ')).toBe('Âm Nữ');
  });
});

// ── formatLunarDate ─────────────────────────────────────────────

describe('formatLunarDate', () => {
  it('formats basic lunar date', () => {
    const result = formatLunarDate(
      { day: 15, month: 2, year: 1990, isLeapMonth: false },
      { can: 'Canh' as Can, chi: 'Ngọ' as Chi },
    );
    expect(result).toBe('Năm Canh Ngọ, tháng 2, ngày 15');
  });

  it('includes leap month suffix', () => {
    const result = formatLunarDate(
      { day: 1, month: 7, year: 2023, isLeapMonth: true },
      { can: 'Quý' as Can, chi: 'Mão' as Chi },
    );
    expect(result).toBe('Năm Quý Mão, tháng 7 (nhuận), ngày 1');
  });

  it('handles day 30', () => {
    const result = formatLunarDate(
      { day: 30, month: 12, year: 2000, isLeapMonth: false },
      { can: 'Canh' as Can, chi: 'Thìn' as Chi },
    );
    expect(result).toBe('Năm Canh Thìn, tháng 12, ngày 30');
  });
});

// ── getPalaceNameByPosition ─────────────────────────────────────

describe('getPalaceNameByPosition', () => {
  it('returns "Mệnh" for the menhPosition itself', () => {
    expect(getPalaceNameByPosition(5, 5)).toBe('Mệnh');
  });

  it('returns correct palace names counter-clockwise from Mệnh', () => {
    const menh = 2; // Dần
    expect(getPalaceNameByPosition(menh + 0, menh)).toBe('Mệnh');
    expect(getPalaceNameByPosition(menh + 1, menh)).toBe('Huynh Đệ');
    expect(getPalaceNameByPosition(menh + 2, menh)).toBe('Phu Thê');
    expect(getPalaceNameByPosition(menh + 3, menh)).toBe('Tử Tức');
    expect(getPalaceNameByPosition(menh + 4, menh)).toBe('Tài Bạch');
    expect(getPalaceNameByPosition(menh + 5, menh)).toBe('Tật Ách');
    expect(getPalaceNameByPosition(menh + 6, menh)).toBe('Thiên Di');
    expect(getPalaceNameByPosition(menh + 7, menh)).toBe('Nô Bộc');
    expect(getPalaceNameByPosition(menh + 8, menh)).toBe('Quan Lộc');
    expect(getPalaceNameByPosition(menh + 9, menh)).toBe('Điền Trạch');
    expect(getPalaceNameByPosition(menh + 10, menh)).toBe('Phúc Đức');
    expect(getPalaceNameByPosition(menh + 11, menh)).toBe('Phụ Mẫu');
  });

  it('wraps around correctly past index 11', () => {
    expect(getPalaceNameByPosition(1, 11)).toBe('Phu Thê'); // (1 - 11 + 12) % 12 = 2
  });

  it('handles negative position offsets safely', () => {
    expect(getPalaceNameByPosition(-1, 0)).toBe('Phụ Mẫu'); // (-1 + 12) % 12 = 11
  });
});
