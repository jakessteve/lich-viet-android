/**
 * Tử Vi Center Metadata Calculator
 *
 * Calculates all center panel metadata fields for a Tử Vi chart.
 * Pure TypeScript — zero React dependencies.
 */

import type { TuViInput, TuViCenterInfo, TuViPalace, AmDuong, ThuanNghich, TuViGender } from '../../types/tuvi';
import type { Can, Chi } from '../../types/calendar';

import { CAN, CHI } from '../../utils/constants';
import { getNapAmIndex } from '../../utils/canchiHelper';
import { PALACE_NAMES, NAP_AM_NAMES } from './constants';
import { resolveTuViSchoolProfile } from './schoolProfiles';

import cucSaoTableData from '../../data/tuvi/cucSaoTable.json';
import menhChuTableData from '../../data/tuvi/menhChuTable.json';
import thanChuTableData from '../../data/tuvi/thanChuTable.json';

// ── Types ───────────────────────────────────────────────────────

/** Minimal chart shape required for center-info calculation. */
export interface CenterMetadataChart {
  input: TuViInput;
  correctedDate: Date;
  lunarDate: {
    day: number;
    month: number;
    year: number;
    isLeapMonth: boolean;
  };
  canChi: {
    year: { can: Can; chi: Chi };
    month: { can: Can; chi: Chi };
    day: { can: Can; chi: Chi };
    hour: { can: Can; chi: Chi };
  };
  amDuong: AmDuong;
  thuanNghich: ThuanNghich;
  palaces: TuViPalace[];
  menhPosition: number;
  thanPosition: number;
  cucName: string;
  cucNumber: number;
}

// ── Helpers ─────────────────────────────────────────────────────

/** Safe modulo for 12-position cycles. */
function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

// ── Exported Core Functions ─────────────────────────────────────

/**
 * Calculates all center panel metadata fields from the chart data.
 */
export function calculateCenterInfo(chart: CenterMetadataChart): TuViCenterInfo {
  const { input, correctedDate, lunarDate, canChi, palaces, menhPosition, thanPosition, cucName, cucNumber } = chart;

  const hoTen = input.name?.trim() || 'Chưa đặt tên';
  const gioiTinh = input.gender === 'nam' ? 'Nam' : 'Nữ';
  const amDuongLabel = formatAmDuongLabel(chart.amDuong, input.gender);

  const duongLich = `${String(correctedDate.getDate()).padStart(2, '0')}/${String(
    correctedDate.getMonth() + 1,
  ).padStart(2, '0')}/${correctedDate.getFullYear()}`;

  const amLich = formatLunarDate(lunarDate, canChi.year);

  const canChiYear = `${canChi.year.can} ${canChi.year.chi}`;
  const canChiMonth = `${canChi.month.can} ${canChi.month.chi}`;
  const canChiDay = `${canChi.day.can} ${canChi.day.chi}`;
  const canChiHour = `${canChi.hour.can} ${canChi.hour.chi}`;
  const yearCanIndex = CAN.indexOf(canChi.year.can);

  // Mệnh palace Nạp Âm
  const menhPalace = palaces[menhPosition];
  const napAmIdx = getNapAmIndex(menhPalace.can, menhPalace.chi);
  const menhNapAm = NAP_AM_NAMES[napAmIdx] ?? '';

  // Cục
  const cuc = cucName;

  // Sao Chủ Cục
  const saoChuCuc = (cucSaoTableData.table as Record<string, string>)[cucName] ?? '';

  // Mệnh Chủ (from Chi of Mệnh palace)
  const menhChu = (menhChuTableData.table as Record<string, string>)[menhPalace.chi] ?? '';

  // Thân Chủ (from year Can)
  const thanChu = (thanChuTableData.table as Record<string, string>)[canChi.year.can] ?? '';

  // Lai Nhân Cung
  const laiNhanCung = calculateLaiNhanCung(yearCanIndex, palaces);

  // Nguyên Thần (star name from the palace at nguyên thần position)
  const nguyenThanPos = calculateNguyenThan(yearCanIndex);
  const nguyenThanPalace = palaces[nguyenThanPos];
  const nguyenThan = nguyenThanPalace?.chinhTinh[0]?.name ?? CHI[nguyenThanPos];

  // Mệnh Cung & Thân Cung
  const menhCung = `Mệnh cư ${menhPalace.chi}`;
  const thanCung = `Thân cư ${CHI[thanPosition]}`;
  const thanCungLabel = `Thân cư ${getPalaceNameByPosition(thanPosition, menhPosition)}`;

  return {
    hoTen,
    gioiTinh,
    amDuongLabel,
    duongLich,
    schoolLabel: resolveTuViSchoolProfile(input.school).label,
    amLich,
    canChiYear,
    canChiMonth,
    canChiDay,
    canChiHour,
    menhNapAm,
    cuc,
    cucNumber,
    saoChuCuc,
    menhChu,
    thanChu,
    laiNhanCung,
    nguyenThan,
    menhCung,
    thanCung,
    thanCungLabel,
  };
}

/**
 * Returns the Lai Nhân Cung label.
 *
 * Rule: locate the palace whose heavenly stem matches the birth year stem.
 * If the matching stem falls on a Tý/Sửu-equivalent palace in a chart variant,
 * the later matching palace is preferred.
 */
export function calculateLaiNhanCung(yearCanIndex: number, palaces: TuViPalace[]): string {
  const yearCan = CAN[yearCanIndex];

  for (let i = palaces.length - 1; i >= 0; i--) {
    if (palaces[i]?.can === yearCan) {
      return palaces[i]?.name ?? CHI[i];
    }
  }

  return '';
}

/**
 * Returns the Địa Chi index of the Nguyên Thần palace.
 *
 * Rule: Giáp/Kỷ→Dần(2), Ất/Canh→Mão(3), Bính/Tân→Thìn(4), Đinh/Nhâm→Tỵ(5), Mậu/Quý→Ngọ(6)
 *
 * Uses the canonical grouping `(yearCanIndex % 5)` so that paired Cans
 * (Giáp/Kỷ, Ất/Canh, …) map to the same palace.
 */
export function calculateNguyenThan(yearCanIndex: number): number {
  return (2 + (yearCanIndex % 5)) % 12;
}

/**
 * Returns the combined Âm/Dương + Gender label.
 *
 * Examples: "Dương Nam", "Âm Nữ", "Âm Nam", "Dương Nữ"
 */
export function formatAmDuongLabel(amDuong: AmDuong, gender: TuViGender): string {
  const genderLabel = gender === 'nam' ? 'Nam' : 'Nữ';
  return `${amDuong} ${genderLabel}`;
}

/**
 * Formats a lunar date as a human-readable string with the year Can-Chi.
 *
 * Format: "Năm Can Chi, tháng X, ngày Y"
 */
export function formatLunarDate(
  lunarDate: { day: number; month: number; year: number; isLeapMonth: boolean },
  canChiYear: { can: Can; chi: Chi },
): string {
  const leapSuffix = lunarDate.isLeapMonth ? ' (nhuận)' : '';
  return `Năm ${canChiYear.can} ${canChiYear.chi}, tháng ${lunarDate.month}${leapSuffix}, ngày ${lunarDate.day}`;
}

/**
 * Given a Chi position and the Mệnh position, returns the palace name.
 *
 * Palace names are assigned counter-clockwise starting from Mệnh:
 * - Mệnh position → "Mệnh"
 * - (menhPosition + 1) % 12 → "Huynh Đệ"
 * - (menhPosition + 2) % 12 → "Phu Thê"
 * - …and so on.
 */
export function getPalaceNameByPosition(position: number, menhPosition: number): string {
  const idx = mod12(position - menhPosition);
  return PALACE_NAMES[idx];
}
