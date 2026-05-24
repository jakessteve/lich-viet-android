/**
 * Star Placement Engine — Thiên Lương School Tử Vi Đẩu Số
 *
 * This is the core computational module for the Tử Vi chart. It calculates
 * the exact Địa Chi position of every star in the 12 palaces from birth data.
 *
 * All formulas follow the Thiên Lương (天梁) school tradition.
 * Pure TypeScript — zero React dependencies.
 */

import type {
  TuViInput,
  TuViChart,
  TuViHanContext,
  TuViPalace,
  TuViStar,
  TuViTuHoa,
  AmDuong,
  ThuanNghich,
  BrightnessLevel,
  MenhCucRelation,
  TuViSchool,
} from '../../types/tuvi';
import type { Can, Chi } from '../../types/calendar';

import { CAN, CHI } from '../../utils/constants';

import {
  PALACE_NAMES,
  PALACE_NAMES_HAN_VIET,
  CAN_NAMES,
  NGU_HANH_CUC,
  CHINH_TINH_LIST,
  PHU_TINH_LIST,
  getNapAmIndex,
  NAP_AM_NAMES,
  NAP_AM_HANH,
} from './constants';
import { calculateLaiNhanCung } from './centerMetadata';
import { getTuViCatalogSummary } from './catalogLayers';
import { buildTuViBirthContext } from './birthContext';
import starBrightnessData from '../../data/tuvi/starBrightness.json';
import cucSaoTableData from '../../data/tuvi/cucSaoTable.json';
import menhChuTableData from '../../data/tuvi/menhChuTable.json';
import thanChuTableData from '../../data/tuvi/thanChuTable.json';
import { detectCombinations } from './combinationDetection';
import { calculateHuyenKhi } from './huyenKhi';
import { DEFAULT_TU_VI_SCHOOL, resolveTuViSchoolProfile } from './schoolProfiles';
import { formatCivilDateYmd } from './timeNormalization';

// ────────────────────────────────────────────────────────────────
// Lookup Tables
// ────────────────────────────────────────────────────────────────

const CHINH_TINH_BY_NAME = new Map(CHINH_TINH_LIST.map((star) => [star.name, star] as const));
const PHU_TINH_BY_NAME = new Map(PHU_TINH_LIST.map((star) => [star.name, star] as const));

/** Văn Xương position by hour branch (0=Tý .. 11=Hợi). */
const VAN_XUONG_TABLE = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11];

/** Văn Khúc position by hour branch. */
const VAN_KHUC_TABLE = [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3];

/** Thiên Khôi position by year Can index (0=Giáp .. 9=Quý). */
const THIEN_KHOI_TABLE = [1, 0, 11, 11, 1, 0, 1, 6, 3, 3];

/** Thiên Việt position by year Can index. */
const THIEN_VIET_TABLE = [7, 8, 9, 9, 7, 8, 7, 2, 5, 5];

/** Lộc Tồn position by year Can index. */
const LOC_TON_TABLE = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];

/** Địa Không position by hour branch. */
const DIA_KHONG_TABLE = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

/** Thiên Mã position by year Chi index (Tam Hợp rule). */
const THIEN_MA_TABLE = [2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8, 5];

/** Hồng Loan position by year Chi index (Lục Hợp of Đào Hoa). */
const HONG_LOAN_TABLE = [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4];

/** Thiên Hỉ position by year Chi index. */
const THIEN_HI_TABLE = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10];

/** Hỏa Tinh classical start table by Tam Hợp group and hour branch. */
const HOA_TINH_TABLE: Record<number, readonly number[]> = {
  0: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1],
  1: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2],
  2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0],
  3: [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8],
};

/** Linh Tinh classical start table by Tam Hợp group and hour branch. */
const LINH_TINH_TABLE: Record<number, readonly number[]> = {
  0: [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  1: [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  2: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2],
  3: [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
};

/** Triệt Không positions by year Can index. */
const TRIET_KHONG_TABLE: Record<number, [number, number]> = {
  0: [8, 9], // Giáp
  1: [6, 7], // Ất
  2: [4, 5], // Bính
  3: [2, 3], // Đinh
  4: [0, 1], // Mậu
  5: [8, 9], // Kỷ
  6: [6, 7], // Canh
  7: [4, 5], // Tân
  8: [2, 3], // Nhâm
  9: [0, 1], // Quý
};

const THAI_TUE_12 = [
  'Thái Tuế',
  'Thiếu Dương',
  'Tang Môn',
  'Thiếu Âm',
  'Quan Phù',
  'Tử Phù',
  'Tuế Phá',
  'Long Đức',
  'Bạch Hổ',
  'Phúc Đức',
  'Điếu Khách',
  'Trực Phù',
] as const;

const BAC_PHAI_THAI_TUE_12 = [
  'Thái Tuế',
  'Hối Khí',
  'Tang Môn',
  'Quán Sách',
  'Quan Phù',
  'Tiểu Hao',
  'Tuế Phá',
  'Long Đức',
  'Bạch Hổ',
  'Thiên Đức',
  'Điếu Khách',
  'Bệnh Phù',
] as const;

const BAC_SI_12 = [
  'Bác Sỹ',
  'Lực Sỹ',
  'Thanh Long',
  'Tiểu Hao',
  'Tướng Quân',
  'Tấu Thư',
  'Phi Liêm',
  'Hỷ Thần',
  'Bệnh Phù',
  'Đại Hao',
  'Phục Binh',
  'Quan Phủ',
] as const;

const TUONG_TINH_12 = [
  'Tướng Tinh',
  'Phan Án',
  'Tuế Dịch',
  'Tức Thần',
  'Hoa Cái',
  'Kiếp Sát',
  'Tai Sát',
  'Thiên Sát',
  'Chỉ Bối',
  'Hàm Trì',
  'Nguyệt Sát',
  'Vong Thần',
] as const;

const TRUONG_SINH_12 = [
  'Trường Sinh',
  'Mục Dục',
  'Quan Đới',
  'Lâm Quan',
  'Đế Vượng',
  'Suy',
  'Bệnh',
  'Tử',
  'Mộ',
  'Tuyệt',
  'Thai',
  'Dưỡng',
] as const;

// ────────────────────────────────────────────────────────────────
// Private Helpers
// ────────────────────────────────────────────────────────────────

/** Wrap an index into the 0–11 range (circular). */
function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

/** Wrap an index into the 0–9 range (circular). */
function mod10(n: number): number {
  return ((n % 10) + 10) % 10;
}

/** Wrap an index into the 0–59 range (circular). */
function mod60(n: number): number {
  return ((n % 60) + 60) % 60;
}

/** Determine the Tam Hợp group (0–3) from a year Chi index. */
function getTamHopGroup(chiIndex: number): number {
  if ([0, 4, 8].includes(chiIndex)) return 0; // Tý-Thìn-Thân
  if ([1, 5, 9].includes(chiIndex)) return 1; // Sửu-Tỵ-Dậu
  if ([2, 6, 10].includes(chiIndex)) return 2; // Dần-Ngọ-Tuất
  return 3; // Mão-Mùi-Hợi
}

/** Tuần Không positions by 60-year cycle decade block. */
const TUAN_KHONG_TABLE: Record<number, [number, number]> = {
  0: [10, 11], // Tuất, Hợi
  1: [8, 9], // Thân, Dậu
  2: [6, 7], // Ngọ, Mùi
  3: [4, 5], // Thìn, Tỵ
  4: [2, 3], // Dần, Mão
  5: [0, 1], // Tý, Sửu
};

function getPalaceNameByChi(position: number, menhPosition: number): string {
  return PALACE_NAMES[mod12(menhPosition - position)];
}

function calculateNguyenThanName(yearCanIndex: number, palaces: TuViPalace[]): string {
  const nguyenThanPosition = mod12(2 + (yearCanIndex % 5));
  const palace = palaces[nguyenThanPosition];
  return palace?.chinhTinh[0]?.name ?? CHI[nguyenThanPosition];
}

function getHoaCaiDaoHoa(yearChiIndex: number): { hoaCai: number; daoHoa: number } {
  const group = getTamHopGroup(yearChiIndex);
  if (group === 0) return { hoaCai: 4, daoHoa: 9 };
  if (group === 1) return { hoaCai: 1, daoHoa: 6 };
  if (group === 2) return { hoaCai: 10, daoHoa: 3 };
  return { hoaCai: 7, daoHoa: 0 };
}

function getCoThanQuaTu(yearChiIndex: number): { coThan: number; quaTu: number } {
  if ([2, 3, 4].includes(yearChiIndex)) return { coThan: 5, quaTu: 1 };
  if ([5, 6, 7].includes(yearChiIndex)) return { coThan: 8, quaTu: 4 };
  if ([8, 9, 10].includes(yearChiIndex)) return { coThan: 11, quaTu: 7 };
  return { coThan: 2, quaTu: 10 };
}

function getTuongTinhStart(yearChiIndex: number): number {
  const group = getTamHopGroup(yearChiIndex);
  if (group === 0) return 0;
  if (group === 1) return 9;
  if (group === 2) return 6;
  return 3;
}

function addRingStars(
  result: Record<string, number>,
  names: readonly string[],
  startIndex: number,
  direction = 1,
): void {
  names.forEach((name, index) => {
    result[name] = mod12(startIndex + direction * index);
  });
}

function createRingLookup(names: readonly string[], startIndex: number, direction = 1): Record<number, string> {
  const result: Record<number, string> = {};
  names.forEach((name, index) => {
    result[mod12(startIndex + direction * index)] = name;
  });
  return result;
}

function getTruongSinhStart(cucNumber: number): number {
  switch (cucNumber) {
    case 2:
    case 5:
      return 8; // Thủy/Thổ cục: Trường Sinh tại Thân
    case 3:
      return 11; // Mộc cục: Trường Sinh tại Hợi
    case 4:
      return 5; // Kim cục: Trường Sinh tại Tỵ
    case 6:
      return 2; // Hỏa cục: Trường Sinh tại Dần
    default:
      return 8;
  }
}

function getYearlySupportStars(
  yearCanIndex: number,
  yearChiIndex: number,
  menhPosition: number,
  thanPosition: number,
): Record<string, number> {
  const { hoaCai, daoHoa } = getHoaCaiDaoHoa(yearChiIndex);
  const { coThan, quaTu } = getCoThanQuaTu(yearChiIndex);
  const thienQuan = [7, 4, 5, 2, 3, 9, 11, 9, 10, 6][mod10(yearCanIndex)];
  const thienPhuc = [9, 8, 0, 11, 3, 2, 6, 5, 6, 5][mod10(yearCanIndex)];

  return {
    'Hoa Cái': hoaCai,
    'Đào Hoa': daoHoa,
    'Cô Thần': coThan,
    'Quả Tú': quaTu,
    'Thiên Tài': mod12(menhPosition + yearChiIndex),
    'Thiên Thọ': mod12(thanPosition + yearChiIndex),
    'Thiên Trù': [5, 6, 0, 5, 6, 8, 2, 6, 9, 11][mod10(yearCanIndex)],
    'Phá Toái': [5, 1, 9][yearChiIndex % 3],
    'Phi Liêm': [8, 9, 10, 5, 6, 7, 2, 3, 4, 11, 0, 1][yearChiIndex],
    'Long Trì': mod12(4 + yearChiIndex),
    'Phượng Các': mod12(10 - yearChiIndex),
    'Thiên Khốc': mod12(6 - yearChiIndex),
    'Thiên Hư': mod12(6 + yearChiIndex),
    'Thiên Quan': thienQuan,
    'Thiên Phúc': thienPhuc,
    'Thiên Đức': mod12(9 + yearChiIndex),
    'Nguyệt Đức': mod12(5 + yearChiIndex),
    'Thiên Không': mod12(yearChiIndex + 1),
    'Thiên Thương': mod12(menhPosition + 5),
    'Thiên Sứ': mod12(menhPosition + 7),
    'Kiếp Sát': [5, 2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8][yearChiIndex],
    'Giải Thần': [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11][yearChiIndex],
    'Lưu Hà': [9, 10, 11, 0, 1, 2, 3, 4, 5, 6][mod10(yearCanIndex)],
    'Thiên La': 4,
    'Địa Võng': 10,
  };
}

function getMonthlySupportStars(lunarMonth: number): Record<string, number> {
  const m = lunarMonth - 1;
  return {
    'Giải Thần': [8, 8, 10, 10, 0, 0, 2, 2, 4, 4, 6, 6][m],
    'Thiên Diêu': mod12(1 + m),
    'Thiên Hình': mod12(9 + m),
    'Âm Sát': [2, 0, 10, 8, 6, 4][m % 6],
    'Thiên Nguyệt': [10, 5, 4, 2, 7, 3, 11, 7, 2, 6, 10, 2][m],
    'Thiên Vu': [5, 8, 2, 11][m % 4],
    'Thiên Giải': mod12(8 + m),
  };
}

/** Resolve the Độ sáng of a star at a given palace. */
function getBrightness(starName: string, chiIndex: number): BrightnessLevel {
  const map = starBrightnessData.brightness as Record<string, BrightnessLevel[]>;
  return map[starName]?.[chiIndex] ?? 'Bình';
}

function parseAgeRange(range: string): { start: number; end: number } | null {
  const match = range.match(/^(\d+)\s*[–-]\s*(\d+)$/);
  if (!match) return null;
  return {
    start: Number(match[1]),
    end: Number(match[2]),
  };
}

function getTieuHanBirthAnchor(yearChiIndex: number): number {
  const group = getTamHopGroup(yearChiIndex);
  if (group === 2) return 4; // Dần/Ngọ/Tuất đặt năm sinh tại Thìn
  if (group === 0) return 10; // Thân/Tý/Thìn đặt năm sinh tại Tuất
  if (group === 1) return 7; // Tỵ/Dậu/Sửu đặt năm sinh tại Mùi
  return 1; // Hợi/Mão/Mùi đặt năm sinh tại Sửu
}

function calculateTieuHanPalaceIndex(chart: TuViChart, viewYear: number): number {
  const birthYearChiIndex = CHI.indexOf(chart.canChi.year.chi);
  const viewYearChiIndex = mod12(viewYear - 4);
  const anchor = getTieuHanBirthAnchor(birthYearChiIndex);
  const direction = chart.input.gender === 'nam' ? 1 : -1;
  const offset = mod12(viewYearChiIndex - birthYearChiIndex);
  return mod12(anchor + direction * offset);
}

function calculateNguyetHanMonthMap(chart: TuViChart, tieuHanPalaceIndex: number): Record<number, number> {
  const monthOnePalace = mod12(tieuHanPalaceIndex - (chart.lunarDate.month - 1) + chart.input.birthHour);
  const result: Record<number, number> = {};
  for (let month = 1; month <= 12; month++) {
    result[mod12(monthOnePalace + month - 1)] = month;
  }
  return result;
}

// ────────────────────────────────────────────────────────────────
// Exported Core Functions
// ────────────────────────────────────────────────────────────────

/**
 * Calculates the Cung Mệnh (Life Palace) position.
 *
 * Rule: start from Dần (index 2), count forward by birth month,
 * then backward by birth hour.
 *
 * @param lunarMonth    — lunar birth month (1–12)
 * @param birthHourBranch — hour Địa Chi index (0=Tý … 11=Hợi)
 * @returns palace index 0–11 where Mệnh resides
 */
export function calculateMenhCungPosition(lunarMonth: number, birthHourBranch: number): number {
  const menhPosition = mod12(2 + (lunarMonth - 1) - birthHourBranch);
  return menhPosition;
}

/**
 * Calculates the Cung Thân (Body Palace) position.
 *
 * Rule: start from Mệnh position, count forward by birth month.
 *
 * @param menhPosition — palace index of Mệnh
 * @param birthMonth   — lunar birth month (1–12)
 * @returns palace index 0–11 where Thân resides
 */
export function calculateThanCungPosition(menhPosition: number, birthMonth: number, birthHourBranch = 0): number {
  const danBasedMenh = mod12(menhPosition - (birthMonth - 1) + birthHourBranch);
  return mod12(danBasedMenh + (birthMonth - 1) + birthHourBranch);
}

/**
 * Determines the Ngũ Hành Cục (Five-Element Fate Bureau).
 *
 * Uses the CUC_LOOKUP_TABLE indexed by Can group and Chi pair.
 *
 * @param menhCanIndex — Thiên Can index of Mệnh palace
 * @param menhChiIndex — Địa Chi index of Mệnh palace
 * @returns Cục metadata: name, number, and element
 */
export function calculateCuc(
  menhCanIndex: number,
  menhChiIndex: number,
): { name: string; number: number; hanh: string } {
  const stemNumber = Math.floor(mod10(menhCanIndex) / 2) + 1;
  const branchNumber = Math.floor((mod12(menhChiIndex) % 6) / 2) + 1;
  let classIndex = stemNumber + branchNumber;
  while (classIndex > 5) classIndex -= 5;

  const cucNumberByClassIndex = [3, 4, 2, 6, 5] as const;
  const cucNumber = cucNumberByClassIndex[classIndex - 1];
  const cucName = Object.entries(NGU_HANH_CUC).find(([, meta]) => meta.number === cucNumber)?.[0];
  if (!cucName) {
    throw new Error(`Invalid Cục lookup: classIndex=${classIndex}, cucNumber=${cucNumber}`);
  }
  const cucMeta = NGU_HANH_CUC[cucName];
  if (!cucMeta) {
    throw new Error(`Cục name "${cucName}" not found in NGU_HANH_CUC`);
  }
  return { name: cucName, number: cucMeta.number, hanh: cucMeta.hanh };
}

/**
 * Determines the Thiên Can of Cung Mệnh.
 *
 * The 12 palace Cans are derived from the Dần palace Can, which depends
 * on the year Can group. Dần and Tý share the same Can; Mão and Sửu
 * share the same Can, and so on.
 *
 * @param yearCanIndex  — Thiên Can index of birth year
 * @param menhChiIndex  — Địa Chi index of Mệnh palace
 * @returns Thiên Can index (0–9) of Mệnh palace
 */
export function calculateMenhCan(yearCanIndex: number, menhChiIndex: number): number {
  const danCan = mod10((yearCanIndex % 5) * 2 + 2);
  const offset = mod12(menhChiIndex - 2);
  return mod10(danCan + offset);
}

/**
 * Places the Tử Vi (Emperor) star.
 *
 * Formula: `position = (2 + floor((lunarDay - 1) / cucNumber)) % 12`
 *
 * @param cucNumber — Cục number (2–6)
 * @param lunarDay  — lunar birth day (1–30)
 * @returns Địa Chi index where Tử Vi resides
 */
export function placeTuViStar(cucNumber: number, lunarDay: number): number {
  let offset = 0;
  while ((lunarDay + offset) % cucNumber !== 0) {
    offset++;
  }

  let ziweiIndex = Math.floor((lunarDay + offset) / cucNumber) - 1;
  ziweiIndex += offset % 2 === 0 ? offset : -offset;
  return mod12(ziweiIndex + 2);
}

/**
 * Places all 14 Chính Tinh (Major Stars) based on Tử Vi position.
 *
 * The Tử Vi group and Thiên Phủ group are mirror-symmetric across the
 * Dần–Thân axis.
 *
 * @param tuViPosition — Địa Chi index of Tử Vi
 * @returns Map of star name → array of palace indices
 */
export function placeChinhTinh(tuViPosition: number): Record<string, number[]> {
  const p = mod12(tuViPosition);

  // Thiên Phủ mirrors Tử Vi across the Dần-Thân axis in the Thiên Lương table.
  const thienPhu = mod12(16 - p);

  return {
    // Tử Vi group (Bắc Đẩu)
    'Tử Vi': [p],
    'Thiên Cơ': [mod12(p + 11)],
    'Thái Dương': [mod12(p + 9)],
    'Vũ Khúc': [mod12(p + 8)],
    'Thiên Đồng': [mod12(p + 7)],
    'Liêm Trinh': [mod12(p + 4)],

    // Thiên Phủ group (Nam Đẩu)
    'Thiên Phủ': [thienPhu],
    'Thái Âm': [mod12(thienPhu + 1)],
    'Tham Lang': [mod12(thienPhu + 2)],
    'Cự Môn': [mod12(thienPhu + 3)],
    'Thiên Tướng': [mod12(thienPhu + 4)],
    'Thiên Lương': [mod12(thienPhu + 5)],
    'Thất Sát': [mod12(thienPhu + 6)],
    'Phá Quân': [mod12(thienPhu + 10)],
  };
}

/**
 * Places Phụ Tinh (Auxiliary / Malefic Stars).
 *
 * @param yearCanIndex  — Thiên Can index of birth year
 * @param yearChiIndex  — Địa Chi index of birth year
 * @param lunarMonth    — lunar birth month (1–12)
 * @param hourBranch    — hour Địa Chi index (0–11)
 * @returns Map of star name → palace index
 */
export function placePhuTinh(
  yearCanIndex: number,
  yearChiIndex: number,
  lunarMonth: number,
  lunarDay: number,
  hourBranch: number,
  menhPosition: number,
  thanPosition: number,
  thuanNghich: ThuanNghich,
  school: TuViSchool = DEFAULT_TU_VI_SCHOOL,
): Record<string, number> {
  const schoolProfile = resolveTuViSchoolProfile(school);
  const locTon = LOC_TON_TABLE[mod10(yearCanIndex)];
  const diaKhong = DIA_KHONG_TABLE[mod12(hourBranch)];
  const diaKiep = mod12(11 + hourBranch);
  const group = getTamHopGroup(yearChiIndex);
  const monthOffset = lunarMonth - 1;
  const taPhu = mod12(4 + monthOffset);
  const huuBat = mod12(10 - monthOffset);
  const vanXuong = VAN_XUONG_TABLE[mod12(hourBranch)];
  const vanKhuc = VAN_KHUC_TABLE[mod12(hourBranch)];
  const dayOffset = lunarDay - 1;

  const locTonDirection = schoolProfile.kinhDaRule === 'thuan-nghich' && thuanNghich === 'Nghịch' ? -1 : 1;

  const khoiViet =
    schoolProfile.khoiVietRule === 'standard'
      ? {
          khoi: THIEN_KHOI_TABLE[mod10(yearCanIndex)],
          viet: THIEN_VIET_TABLE[mod10(yearCanIndex)],
        }
      : {
          khoi: [1, 0, 11, 11, 1, 0, 6, 6, 3, 3][mod10(yearCanIndex)],
          viet: [7, 8, 9, 9, 7, 8, 2, 2, 5, 5][mod10(yearCanIndex)],
        };

  const result: Record<string, number> = {
    // Lục Cát
    'Văn Xương': vanXuong,
    'Văn Khúc': vanKhuc,
    'Tả Phụ': taPhu,
    'Hữu Bật': huuBat,
    'Thiên Khôi': khoiViet.khoi,
    'Thiên Việt': khoiViet.viet,

    // Lộc Tồn & attendants
    'Lộc Tồn': locTon,
    'Kình Dương': mod12(locTon + locTonDirection),
    'Đà La': mod12(locTon - locTonDirection),

    // Sát Tinh
    'Địa Không': diaKhong,
    'Địa Kiếp': diaKiep,
    'Hỏa Tinh': HOA_TINH_TABLE[group][mod12(hourBranch)],
    'Linh Tinh': LINH_TINH_TABLE[group][mod12(hourBranch)],

    // Other important stars
    'Thiên Mã': THIEN_MA_TABLE[mod12(yearChiIndex)],
    'Hồng Loan': HONG_LOAN_TABLE[mod12(yearChiIndex)],
    'Thiên Hỉ': THIEN_HI_TABLE[mod12(yearChiIndex)],
    'Tam Thai': mod12(taPhu + dayOffset),
    'Bát Tọa': mod12(huuBat - dayOffset),
    'Ân Quang': mod12(vanXuong + dayOffset - 1),
    'Thiên Quý': mod12(vanKhuc - dayOffset + 1),
    'Đài Phụ': mod12(6 + hourBranch),
    'Phong Cáo': mod12(2 + hourBranch),
    'Đẩu Quân': mod12(yearChiIndex - monthOffset + hourBranch),
    'Thiên Y': mod12(lunarMonth),
    'Đường Phù': mod12(locTon + 7),
    'Quốc Ấn': mod12(locTon + 8),
    ...getYearlySupportStars(yearCanIndex, yearChiIndex, menhPosition, thanPosition),
    ...getMonthlySupportStars(lunarMonth),
  };
  const bacSiDirection = thuanNghich === 'Thuận' ? 1 : -1;
  addRingStars(result, schoolProfile.thaiTueRingRule === 'bac-phai' ? BAC_PHAI_THAI_TUE_12 : THAI_TUE_12, yearChiIndex);
  addRingStars(result, BAC_SI_12, locTon, bacSiDirection);
  addRingStars(result, TUONG_TINH_12, getTuongTinhStart(yearChiIndex));

  return result;
}

/**
 * Calculates the 4 Tứ Hóa (Four Transformations) stars.
 *
 * The actual palace position of each Tứ Hóa must be resolved by the caller
 * against the already-placed star map.
 *
 * @param yearCanIndex — Thiên Can index of birth year
 * @returns Map of transformation type → { starName, position }
 */
export function calculateTuHoa(
  yearCanIndex: number,
  school: TuViSchool = DEFAULT_TU_VI_SCHOOL,
): Record<string, { starName: string; position: number }> {
  const canName = CAN_NAMES[mod10(yearCanIndex)];
  const entry = resolveTuViSchoolProfile(school).tuHoaTable[canName as Can];
  if (!entry) {
    throw new Error(`Tứ Hóa table missing for Can: ${canName}`);
  }
  return {
    Lộc: { starName: entry['Lộc'], position: -1 },
    Quyền: { starName: entry['Quyền'], position: -1 },
    Khoa: { starName: entry['Khoa'], position: -1 },
    Kỵ: { starName: entry['Kỵ'], position: -1 },
  };
}

/**
 * Calculates the Thiên Can for all 12 palaces.
 *
 * Dần palace Can is determined by the year Can group. Cans then advance
 * sequentially around the 12 Chi positions (Tý and Dần share the same Can).
 *
 * @param yearCanIndex — Thiên Can index of birth year
 * @returns Array of 12 Can indices (0–9) in Chi order 0–11
 */
export function calculatePalaceCans(yearCanIndex: number): number[] {
  const danCan = mod10((yearCanIndex % 5) * 2 + 2);
  return Array.from({ length: 12 }, (_, chi) => mod10(danCan + mod12(chi - 2)));
}

// ────────────────────────────────────────────────────────────────
// Chart Orchestrator
// ────────────────────────────────────────────────────────────────

/**
 * Generates the complete Tử Vi chart from birth data.
 *
 * This is the main orchestrator that calls all placement functions,
 * builds the 12 palaces, and populates centre metadata.
 *
 * @param input — birth data (`TuViInput`)
 * @returns complete `TuViChart`
 */
export function generateChart(input: TuViInput): TuViChart {
  const schoolProfile = resolveTuViSchoolProfile(input.school);
  const birthContext = buildTuViBirthContext(input, schoolProfile);
  const correctedDate = birthContext.correctedDate;
  const lunar = birthContext.lunarDate;
  const yearCanIndex = birthContext.yearCanIndex;
  const yearChiIndex = birthContext.yearChiIndex;
  const yearCan = birthContext.canChi.year.can;
  const yearChi = birthContext.canChi.year.chi;
  const monthCan = birthContext.canChi.month.can;
  const monthChi = birthContext.canChi.month.chi;
  const dayCan = birthContext.canChi.day.can;
  const dayChi = birthContext.canChi.day.chi;
  const hourChiIndex = birthContext.hourBranchIndex;
  const hourChi = birthContext.canChi.hour.chi;
  const hourCan = birthContext.canChi.hour.can;
  const logicalMonth = birthContext.logicalMonth;
  const amDuong: AmDuong = birthContext.amDuong;
  const thuanNghich: ThuanNghich = birthContext.thuanNghich;

  // ── 1. Mệnh palace ───────────────────────────────────────────
  const menhPosition = calculateMenhCungPosition(logicalMonth, hourChiIndex);
  const menhChiName = CHI[menhPosition] as Chi;
  const menhChiIdx = menhPosition;

  // ── 2. Mệnh Can ──────────────────────────────────────────────
  const menhCanIndex = calculateMenhCan(yearCanIndex, menhChiIdx);
  const _menhCanName = CAN[menhCanIndex];

  // ── 3. Thân palace ───────────────────────────────────────────
  const thanPosition = calculateThanCungPosition(menhPosition, logicalMonth, hourChiIndex);

  // ── 4. Ngũ Hành Cục ──────────────────────────────────────────
  const cuc = calculateCuc(menhCanIndex, menhChiIdx);

  // ── 5. Tử Vi position ───────────────────────────────────────
  const tuViPosition = placeTuViStar(cuc.number, lunar.day);

  // ── 6. Chính Tinh ───────────────────────────────────────────
  const chinhTinhMap = placeChinhTinh(tuViPosition);

  // ── 7. Phụ Tinh ─────────────────────────────────────────────
  const phuTinhMap = placePhuTinh(
    yearCanIndex,
    yearChiIndex,
    logicalMonth,
    lunar.day,
    hourChiIndex,
    menhPosition,
    thanPosition,
    thuanNghich,
    schoolProfile.id,
  );
  const ringDirection = thuanNghich === 'Thuận' ? 1 : -1;
  const bacSiDirection = thuanNghich === 'Thuận' ? 1 : -1;
  const rings = {
    truongSinh: createRingLookup(TRUONG_SINH_12, getTruongSinhStart(cuc.number), ringDirection),
    bacSi: createRingLookup(BAC_SI_12, LOC_TON_TABLE[mod10(yearCanIndex)], bacSiDirection),
    thaiTue: createRingLookup(
      schoolProfile.thaiTueRingRule === 'bac-phai' ? BAC_PHAI_THAI_TUE_12 : THAI_TUE_12,
      yearChiIndex,
    ),
    tuongTinh: createRingLookup(TUONG_TINH_12, getTuongTinhStart(yearChiIndex)),
  };

  // ── 8. Palace Cans ──────────────────────────────────────────
  const palaceCans = calculatePalaceCans(yearCanIndex);

  // ── 9. Tứ Hóa ───────────────────────────────────────────────
  const tuHoaRaw = calculateTuHoa(yearCanIndex, schoolProfile.id);
  const allStarPositions: Record<string, number> = {};
  for (const [name, positions] of Object.entries(chinhTinhMap)) {
    allStarPositions[name] = positions[0];
  }
  Object.assign(allStarPositions, phuTinhMap);

  const tuHoaResolved: Record<string, { starName: string; position: number }> = {};
  for (const [type, entry] of Object.entries(tuHoaRaw)) {
    tuHoaResolved[type] = {
      starName: entry.starName,
      position: allStarPositions[entry.starName] ?? -1,
    };
  }

  // ── 10. Tuần / Triệt Không ───────────────────────────────────
  const sexagenaryYearIndex = mod60(lunar.year - 4);
  const tuanKhong = TUAN_KHONG_TABLE[Math.floor(sexagenaryYearIndex / 10)] ?? [0, 1];
  const trietKhong = TRIET_KHONG_TABLE[yearCanIndex] ?? [0, 1];

  // ── 11. Build 12 palaces ─────────────────────────────────────
  const palaces: TuViPalace[] = [];
  for (let chiIdx = 0; chiIdx < 12; chiIdx++) {
    const palaceNameIndex = mod12(menhPosition - chiIdx);
    const palaceName = PALACE_NAMES[palaceNameIndex];
    const palaceCanIdx = palaceCans[chiIdx];

    const chinhTinh: TuViStar[] = [];
    const phuTinh: TuViStar[] = [];
    const satTinh: TuViStar[] = [];
    const tuHoaList: TuViTuHoa[] = [];
    const brightness: Record<string, BrightnessLevel> = {};

    // Chính Tinh in this palace
    for (const [starName, positions] of Object.entries(chinhTinhMap)) {
      if (positions.includes(chiIdx)) {
        const info = CHINH_TINH_BY_NAME.get(starName);
        if (info) {
          const b = getBrightness(starName, chiIdx);
          chinhTinh.push({
            name: starName,
            type: 'chinhTinh',
            nguHanh: info.nguHanh,
            brightness: b,
          });
          brightness[starName] = b;
        }
      }
    }

    // Phụ Tinh / Sát Tinh in this palace
    for (const [starName, pos] of Object.entries(phuTinhMap)) {
      if (pos === chiIdx) {
        const info = PHU_TINH_BY_NAME.get(starName);
        const b = getBrightness(starName, chiIdx);
        const star: TuViStar = {
          name: starName,
          type: info?.type === 'sat' ? 'satTinh' : 'phuTinh',
          nguHanh: info?.nguHanh ?? 'Âm Thổ',
          brightness: b,
        };
        if (info?.type === 'sat') {
          satTinh.push(star);
        } else {
          phuTinh.push(star);
        }
        brightness[starName] = b;
      }
    }

    // Tứ Hóa markers
    for (const [type, entry] of Object.entries(tuHoaResolved)) {
      if (entry.position === chiIdx) {
        tuHoaList.push({
          type: type as 'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ',
          starName: entry.starName,
          sourceCan: yearCan,
        });
      }
    }

    // Đại Hạn age range
    const isClockwise = thuanNghich === 'Thuận';
    const step = isClockwise ? 1 : -1;
    const genderStart = menhPosition;
    const palaceOrderFromStart = mod12(step * (chiIdx - genderStart));
    const startAge = cuc.number + palaceOrderFromStart * 10;
    const endAge = startAge + 9;
    const daiHanAgeRange = `${startAge}–${endAge}`;

    palaces.push({
      id: chiIdx,
      chi: CHI[chiIdx] as Chi,
      name: palaceName,
      nameHanViet: PALACE_NAMES_HAN_VIET[palaceNameIndex],
      can: CAN[palaceCanIdx] as Can,
      canChi: `${CAN[palaceCanIdx]} ${CHI[chiIdx]}`,
      chinhTinh,
      phuTinh,
      satTinh,
      tuHoa: tuHoaList,
      rings: {
        truongSinh: rings.truongSinh[chiIdx],
        bacSi: rings.bacSi[chiIdx],
        thaiTue: rings.thaiTue[chiIdx],
        tuongTinh: rings.tuongTinh[chiIdx],
      },
      brightness,
      daiHanAgeRange,
      isMenh: chiIdx === menhPosition,
      isThan: chiIdx === thanPosition,
      hasTuan: tuanKhong.includes(chiIdx),
      hasTriet: trietKhong.includes(chiIdx),
    });
  }

  // ── 12. Centre metadata ──────────────────────────────────────
  const napAmIdx = getNapAmIndex(yearCanIndex, yearChiIndex);
  const menhNapAm = NAP_AM_NAMES[napAmIdx] ?? '';
  const menhNapAmHanh = NAP_AM_HANH[menhNapAm] ?? '';

  // Mệnh–Cục relation
  const cucHanh = cuc.hanh;
  let menhCucRelation: MenhCucRelation = {
    relation: 'bình hòa',
    description: 'Mệnh Cục bình hòa',
    menhHanh: menhNapAmHanh,
    cucHanh,
  };
  if (cucHanh === menhNapAmHanh) {
    menhCucRelation = {
      relation: 'bình hòa' as const,
      description: 'Mệnh Cục đồng hành',
      menhHanh: menhNapAmHanh,
      cucHanh,
    };
  } else if (
    (cucHanh === 'Thủy' && menhNapAmHanh === 'Mộc') ||
    (cucHanh === 'Mộc' && menhNapAmHanh === 'Hỏa') ||
    (cucHanh === 'Hỏa' && menhNapAmHanh === 'Thổ') ||
    (cucHanh === 'Thổ' && menhNapAmHanh === 'Kim') ||
    (cucHanh === 'Kim' && menhNapAmHanh === 'Thủy')
  ) {
    menhCucRelation = { relation: 'sinh' as const, description: 'Cục sinh Mệnh', menhHanh: menhNapAmHanh, cucHanh };
  } else if (
    (menhNapAmHanh === 'Thủy' && cucHanh === 'Mộc') ||
    (menhNapAmHanh === 'Mộc' && cucHanh === 'Hỏa') ||
    (menhNapAmHanh === 'Hỏa' && cucHanh === 'Thổ') ||
    (menhNapAmHanh === 'Thổ' && cucHanh === 'Kim') ||
    (menhNapAmHanh === 'Kim' && cucHanh === 'Thủy')
  ) {
    menhCucRelation = { relation: 'sinh' as const, description: 'Mệnh sinh Cục', menhHanh: menhNapAmHanh, cucHanh };
  } else if (
    (cucHanh === 'Kim' && menhNapAmHanh === 'Mộc') ||
    (cucHanh === 'Mộc' && menhNapAmHanh === 'Thổ') ||
    (cucHanh === 'Thổ' && menhNapAmHanh === 'Thủy') ||
    (cucHanh === 'Thủy' && menhNapAmHanh === 'Hỏa') ||
    (cucHanh === 'Hỏa' && menhNapAmHanh === 'Kim')
  ) {
    menhCucRelation = { relation: 'khắc' as const, description: 'Cục khắc Mệnh', menhHanh: menhNapAmHanh, cucHanh };
  } else if (
    (menhNapAmHanh === 'Kim' && cucHanh === 'Mộc') ||
    (menhNapAmHanh === 'Mộc' && cucHanh === 'Thổ') ||
    (menhNapAmHanh === 'Thổ' && cucHanh === 'Thủy') ||
    (menhNapAmHanh === 'Thủy' && cucHanh === 'Hỏa') ||
    (menhNapAmHanh === 'Hỏa' && cucHanh === 'Kim')
  ) {
    menhCucRelation = { relation: 'khắc' as const, description: 'Mệnh khắc Cục', menhHanh: menhNapAmHanh, cucHanh };
  }

  const combinations = detectCombinations(palaces);
  const huyenKhi = calculateHuyenKhi(palaces, []);

  const centerInfo = {
    hoTen: input.name ?? '',
    gioiTinh: input.gender === 'nam' ? 'Nam' : 'Nữ',
    amDuongLabel: `${amDuong} ${input.gender === 'nam' ? 'Nam' : 'Nữ'}`,
    duongLich: formatCivilDateYmd(correctedDate),
    noiSinh: input.birthLocation?.locationName,
    schoolLabel: schoolProfile.label,
    amLich: `${lunar.day}/${lunar.month}/${lunar.year}${lunar.isLeap ? ' (nhuận)' : ''}`,
    canChiYear: `${yearCan} ${yearChi}`,
    canChiMonth: `${monthCan} ${monthChi}`,
    canChiDay: `${dayCan} ${dayChi}`,
    canChiHour: `${hourCan} ${hourChi}`,
    menhNapAm,
    cuc: cuc.name,
    cucNumber: cuc.number,
    saoChuCuc: (cucSaoTableData.table as Record<string, string>)[cuc.name] ?? '',
    menhChu: (menhChuTableData.table as Record<string, string>)[menhChiName] ?? '',
    thanChu: (thanChuTableData.table as Record<string, string>)[yearCan] ?? '',
    laiNhanCung: calculateLaiNhanCung(yearCanIndex, palaces),
    nguyenThan: calculateNguyenThanName(yearCanIndex, palaces),
    menhCung: `Mệnh cư ${menhChiName}`,
    thanCung: `Thân cư ${CHI[thanPosition]}`,
    thanCungLabel: `Thân cư ${getPalaceNameByChi(thanPosition, menhPosition)}`,
  };

  return {
    input: {
      ...input,
      school: schoolProfile.id,
      timePolicy: schoolProfile.timePolicy,
    },
    engineMeta: {
      version: input.engineVersion ?? 'legacy-v3',
      schoolLabel: schoolProfile.label,
      leapMonthPolicy: birthContext.leapMonthPolicy,
      timePolicy: birthContext.timePolicy,
      historicalRegion: birthContext.historicalRegion,
      catalog: getTuViCatalogSummary(),
      warnings: birthContext.warnings,
      sources: ['current-engine', 'iztro', 'fortel-ziweidoushu', 'lunar-javascript', '@dqcai/vn-lunar'],
    },
    correctedDate,
    lunarDate: {
      day: lunar.day,
      month: lunar.month,
      year: lunar.year,
      isLeapMonth: lunar.isLeap,
    },
    canChi: {
      year: { can: yearCan as Can, chi: yearChi as Chi },
      month: { can: monthCan as Can, chi: monthChi as Chi },
      day: { can: dayCan as Can, chi: dayChi as Chi },
      hour: { can: hourCan as Can, chi: hourChi as Chi },
    },
    amDuong,
    thuanNghich,
    centerInfo,
    palaces,
    combinations,
    huyenKhi,
    menhCucRelation,
    auditWarnings: birthContext.warnings,
  };
}

/**
 * Calculates the active hạn context for a selected year/month view.
 */
export function calculateHanContext(chart: TuViChart, viewYear: number, viewMonth: number): TuViHanContext {
  const birthYear = chart.lunarDate.year;
  const normalizedMonth = Math.min(12, Math.max(1, Math.floor(viewMonth) || 1));
  const viewAge = Math.max(1, viewYear - birthYear + 1);

  const activePalace = chart.palaces.find((palace) => {
    const range = parseAgeRange(palace.daiHanAgeRange);
    return range ? viewAge >= range.start && viewAge <= range.end : false;
  });
  const tieuHanPalaceIndex = calculateTieuHanPalaceIndex(chart, viewYear);
  const nguyetHanMonthByPalace = calculateNguyetHanMonthMap(chart, tieuHanPalaceIndex);
  const nguyetHanPalaceIndex =
    Object.entries(nguyetHanMonthByPalace).find(([, month]) => month === normalizedMonth)?.[0] ?? null;

  return {
    viewYear,
    viewMonth: normalizedMonth,
    viewAge,
    daiHanPalaceIndex: activePalace?.id ?? null,
    daiHanPalaceName: activePalace?.name ?? '',
    daiHanAgeRange: activePalace?.daiHanAgeRange ?? '',
    tieuHanPalaceIndex,
    nguyetHanMonthByPalace,
    nguyetHanPalaceIndex: nguyetHanPalaceIndex === null ? null : Number(nguyetHanPalaceIndex),
  };
}
