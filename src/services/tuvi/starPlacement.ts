import type { TuViInput, TuViChart, TuViHanContext } from '../../types/tuvi';
import { resolveTuViSchoolProfile } from './schoolProfiles';
import { buildTuViBirthContext } from './birthContext';
import {
  createTuViStarChart,
  calculateMenhCungPosition as omceMenhCungPosition,
  calculateThanCungPosition as omceThanCungPosition,
  calculateMenhCanIndex as omceMenhCanIndex,
  calculateTuViCucNumber as omceCucNumber,
  placeTuViStar as omcePlaceTuViStar,
  placeChinhTinh as omcePlaceChinhTinh,
  placePhuTinh as omcePlacePhuTinh,
  calculateDaiHanAgeRanges,
  calculateTieuHanPalaceIndex,
  calculateNguyetHanPalaces,
} from '@omce/core-logic';
import { CAN, CHI } from '../../utils/constants';

export const calculateMenhCungPosition = (lunarMonth: number, birthHour: number): number => {
  return omceMenhCungPosition(lunarMonth, birthHour);
};

export const calculateThanCungPosition = (menhPosition: number, lunarMonth: number, birthHour: number = 0): number => {
  return omceThanCungPosition(menhPosition, lunarMonth, birthHour);
};

export const calculateMenhCan = (yearCanIndex: number, menhPalaceIndex: number): string => {
  const canIndex = omceMenhCanIndex(yearCanIndex, menhPalaceIndex);
  return CAN[canIndex] || CAN[0];
};

export const calculateCuc = (yearCanIndex: number, menhPalaceIndex: number): { name: string; number: number } => {
  const num = omceCucNumber(yearCanIndex, menhPalaceIndex);
  const names: Record<number, string> = {
    2: 'Thủy Nhị Cục',
    3: 'Mộc Tam Cục',
    4: 'Kim Tứ Cục',
    5: 'Thổ Ngũ Cục',
    6: 'Hỏa Lục Cục',
  };
  return { name: names[num] || 'Thủy Nhị Cục', number: num };
};

export const placeTuViStar = (cucNumber: number, lunarDay: number): number => {
  return omcePlaceTuViStar(cucNumber, lunarDay);
};

export const placeChinhTinh = (tuViPosition: number): Record<string, any> => {
  return omcePlaceChinhTinh(tuViPosition);
};

export const placePhuTinh = (
  yearCanIndexOrInput: any,
  yearChiIndex?: number,
  lunarMonth?: number,
  lunarDay?: number,
  birthHour?: number,
  menhPosition?: number,
  thanPosition?: number,
  thuanNghich?: any,
  school?: any,
): Record<string, any> => {
  if (typeof yearCanIndexOrInput === 'object' && yearCanIndexOrInput !== null) {
    return omcePlacePhuTinh(yearCanIndexOrInput);
  }
  return omcePlacePhuTinh({
    yearCanIndex: yearCanIndexOrInput,
    yearChiIndex: yearChiIndex ?? 0,
    lunarMonth: lunarMonth ?? 1,
    lunarDay: lunarDay ?? 1,
    hourBranch: birthHour ?? 0,
    menhPosition: menhPosition ?? 0,
    thanPosition: thanPosition ?? 0,
    ...(school ? { school } : {}),
  } as any);
};

const TU_HOA_TABLE: Record<string, Record<string, string>> = {
  Giáp: { Lộc: 'Liêm Trinh', Quyền: 'Phá Quân', Khoa: 'Vũ Khúc', Kỵ: 'Thái Dương' },
  Ất: { Lộc: 'Thiên Cơ', Quyền: 'Thiên Lương', Khoa: 'Tử Vi', Kỵ: 'Thái Âm' },
  Bính: { Lộc: 'Thiên Đồng', Quyền: 'Thiên Cơ', Khoa: 'Văn Xương', Kỵ: 'Liêm Trinh' },
  Đinh: { Lộc: 'Thái Âm', Quyền: 'Thiên Đồng', Khoa: 'Thiên Cơ', Kỵ: 'Cự Môn' },
  Mậu: { Lộc: 'Tham Lang', Quyền: 'Thái Âm', Khoa: 'Hữu Bật', Kỵ: 'Thiên Cơ' },
  Kỷ: { Lộc: 'Vũ Khúc', Quyền: 'Tham Lang', Khoa: 'Thiên Lương', Kỵ: 'Văn Khúc' },
  Canh: { Lộc: 'Thái Dương', Quyền: 'Vũ Khúc', Khoa: 'Thái Âm', Kỵ: 'Thiên Đồng' },
  Tân: { Lộc: 'Cự Môn', Quyền: 'Thái Dương', Khoa: 'Văn Khúc', Kỵ: 'Văn Xương' },
  Nhâm: { Lộc: 'Thiên Lương', Quyền: 'Tử Vi', Khoa: 'Tả Phụ', Kỵ: 'Vũ Khúc' },
  Quý: { Lộc: 'Phá Quân', Quyền: 'Cự Môn', Khoa: 'Thái Âm', Kỵ: 'Tham Lang' },
};

const TRUNG_CHAU_TU_HOA: Record<string, Record<string, string>> = {
  ...TU_HOA_TABLE,
  Mậu: { Lộc: 'Tham Lang', Quyền: 'Thái Âm', Khoa: 'Thái Dương', Kỵ: 'Thiên Cơ' },
};

export const getTuHoaForCan = (canName: string, school?: string) => {
  const table = school === 'bac-phai' ? TRUNG_CHAU_TU_HOA : TU_HOA_TABLE;
  const entry = table[canName] || TU_HOA_TABLE['Giáp'];
  return {
    Loc: { starName: entry['Lộc'], type: 'Lộc' },
    Quyen: { starName: entry['Quyền'], type: 'Quyền' },
    Khoa: { starName: entry['Khoa'], type: 'Khoa' },
    Ky: { starName: entry['Kỵ'], type: 'Kỵ' },
  };
};

export const calculateTuHoa = (yearCanIndex: number, school?: string) => {
  const canName = CAN[((yearCanIndex % 10) + 10) % 10];
  return getTuHoaForCan(canName, school);
};

export const calculatePalaceCans = (yearCanIndex: number): string[] => {
  const cans: string[] = [];
  for (let i = 0; i < 12; i++) {
    const canIdx = (yearCanIndex * 2 + 2 + ((i - 2 + 12) % 12)) % 10;
    cans.push(CAN[canIdx]);
  }
  return cans;
};

export function generateChart(input: TuViInput): TuViChart {
  const schoolProfile = resolveTuViSchoolProfile(input.school);
  const birthContext = buildTuViBirthContext(input, schoolProfile);

  const omceResult = createTuViStarChart({
    yearCanIndex: birthContext.yearCanIndex,
    yearChiIndex: birthContext.yearChiIndex,
    lunarMonth: birthContext.logicalMonth,
    lunarDay: birthContext.lunarDate.day,
    birthHour: birthContext.hourBranchIndex,
    gender: input.gender,
    school: schoolProfile.id,
    menhPalaceIndex: undefined,
    thanPalaceIndex: undefined,
    cucNumber: undefined,
  } as any) as any;

  const centerInfo = {
    hoTen: input.name ?? '',
    gioiTinh: String(input.gender).toLowerCase() === 'nam' ? 'Nam' : 'Nữ',
    amDuongLabel: `${omceResult.amDuong} ${String(input.gender).toLowerCase() === 'nam' ? 'Nam' : 'Nữ'}`,
    duongLich: birthContext.correctedDate.toISOString().split('T')[0],
    noiSinh: input.birthLocation?.locationName,
    schoolLabel: schoolProfile.label,
    amLich: `${birthContext.lunarDate.day}/${birthContext.lunarDate.month}/${birthContext.lunarDate.year}${birthContext.lunarDate.isLeap ? ' (nhuận)' : ''}`,
    canChiYear: `${birthContext.canChi.year.can} ${birthContext.canChi.year.chi}`,
    canChiMonth: `${birthContext.canChi.month.can} ${birthContext.canChi.month.chi}`,
    canChiDay: `${birthContext.canChi.day.can} ${birthContext.canChi.day.chi}`,
    canChiHour: `${birthContext.canChi.hour.can} ${birthContext.canChi.hour.chi}`,
    menhNapAm: omceResult.menhNapAm,
    cuc: ['Unknown', 'Unknown', 'Thủy Nhị Cục', 'Mộc Tam Cục', 'Kim Tứ Cục', 'Thổ Ngũ Cục', 'Hỏa Lục Cục'][omceResult.cucNumber] || '',
    cucNumber: omceResult.cucNumber,
    saoChuCuc: omceResult.saoChuCuc,
    menhChu: omceResult.menhChu,
    thanChu: omceResult.thanChu,
    laiNhanCung: omceResult.laiNhanCung,
    nguyenThan: omceResult.nguyenThan,
    menhCung: `Mệnh cư ${CHI[omceResult.menhPalaceIndex]}`,
    thanCung: `Thân cư ${CHI[omceResult.thanPalaceIndex]}`,
    thanCungLabel: `Thân cư ${CHI[omceResult.thanPalaceIndex]}`,
  };

  const menhCucRelation = {
    relation: 'bình hòa' as any,
    description: 'Mệnh Cục',
    menhHanh: '',
    cucHanh: '',
  };

  return {
    input: {
      ...input,
      school: schoolProfile.id,
      timePolicy: schoolProfile.timePolicy,
    },
    engineMeta: {
      version: 'accuracy-v4',
      schoolLabel: schoolProfile.label,
      leapMonthPolicy: birthContext.leapMonthPolicy,
      timePolicy: birthContext.timePolicy,
      historicalRegion: birthContext.historicalRegion,
      catalog: {} as any,
      warnings: birthContext.warnings,
      sources: ['omce-core-logic'],
    },
    correctedDate: birthContext.correctedDate,
    lunarDate: {
      day: birthContext.lunarDate.day,
      month: birthContext.lunarDate.month,
      year: birthContext.lunarDate.year,
      isLeapMonth: birthContext.lunarDate.isLeap,
    },
    canChi: birthContext.canChi,
    amDuong: omceResult.amDuong as any,
    thuanNghich: omceResult.thuanNghich as any,
    centerInfo,
    palaces: omceResult.palaces as any,
    combinations: omceResult.combinations as any,
    menhCucRelation,
    auditWarnings: birthContext.warnings,
  };
}

export function calculateHanContext(chart: TuViChart, viewYear: number, viewMonth: number): TuViHanContext {
  const birthYear = chart.lunarDate.year;
  const viewAge = viewYear - birthYear + 1; // Tuổi mụ

  const birthYearChi = chart.canChi.year.chi;
  const gender = chart.input.gender;
  const cucNumber = chart.centerInfo.cucNumber || 2;
  const yearCan = chart.canChi.year.can;
  const menhPalaceIndex = chart.palaces.findIndex((p) => p.name === 'Mệnh');

  const daiHanRanges = calculateDaiHanAgeRanges({
    cucNumber,
    gender,
    yearCan,
    menhPalaceIndex: menhPalaceIndex >= 0 ? menhPalaceIndex : 0,
  });

  let daiHanPalaceIndex: number | null = null;
  let daiHanPalaceName = '';
  let daiHanAgeRange = '';

  for (let i = 0; i < 12; i++) {
    if (viewAge >= daiHanRanges[i].startAge && viewAge <= daiHanRanges[i].endAge) {
      daiHanPalaceIndex = i;
      daiHanPalaceName = chart.palaces[i]?.name || '';
      daiHanAgeRange = daiHanRanges[i].rangeString;
      break;
    }
  }

  const tieuHanPalaceIndex = calculateTieuHanPalaceIndex({
    birthYearChi,
    gender,
    viewYear,
  });

  const birthMonth = chart.lunarDate.month;
  const birthHour = chart.input.birthHour ?? 0;
  const nguyetHanPalaces = calculateNguyetHanPalaces({
    tieuHanPalaceIndex,
    birthMonth,
    birthHour,
  });

  const nguyetHanMonthByPalace: Record<number, number> = {};
  nguyetHanPalaces.forEach((palaceIdx, monthIndex) => {
    nguyetHanMonthByPalace[palaceIdx] = monthIndex + 1;
  });

  const nguyetHanPalaceIndex = nguyetHanPalaces[(viewMonth - 1) % 12] ?? null;

  // -- Lưu Diệu Calculation --
  const viewYearCanIndex = ((viewYear - 4) % 10 + 10) % 10;
  const viewYearChiIndex = ((viewYear - 4) % 12 + 12) % 12;

  const locTonPositions = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0]; // Giáp to Quý
  const luuLocTonPos = locTonPositions[viewYearCanIndex];
  const luuKinhDuongPos = (luuLocTonPos + 1) % 12;
  const luuDaLaPos = (luuLocTonPos + 11) % 12;
  const luuThaiTuePos = viewYearChiIndex;

  const luuDieuByPalace: Record<number, any[]> = {};
  for (let i = 0; i < 12; i++) {
    luuDieuByPalace[i] = [];
  }

  const addLuuDieu = (pos: number, name: string, type: string = 'luuDieu', nguHanh: string = 'Hỏa', brightness: string = 'Miếu') => {
    luuDieuByPalace[pos].push({ name, type, nguHanh, brightness });
  };

  addLuuDieu(luuThaiTuePos, 'Lưu Thái Tuế');
  addLuuDieu(luuLocTonPos, 'Lưu Lộc Tồn', 'luuDieu', 'Thổ');
  addLuuDieu(luuKinhDuongPos, 'Lưu Kình Dương', 'luuDieu', 'Kim');
  addLuuDieu(luuDaLaPos, 'Lưu Đà La', 'luuDieu', 'Kim');

  return {
    viewYear,
    viewMonth,
    viewAge,
    daiHanPalaceIndex,
    daiHanPalaceName,
    daiHanAgeRange,
    tieuHanPalaceIndex,
    nguyetHanMonthByPalace,
    nguyetHanPalaceIndex,
    luuDieuByPalace,
  };
}
