/**
 * Flying Star Engine — Huyền Không Phi Tinh
 *
 * Feng Shui spatial analysis using the Xuan Kong Flying Star system.
 * - Period Star (based on construction year → 20-year period)
 * - Mountain Star & Water Star (from facing direction + period)
 * - 24 Mountains compass system
 * - Interpretations & remedies
 *
 * Auto-detects Period 9 (2024-2043), manual override available.
 */

import type { DayDetailsData } from '@/types/calendar';
import type {
  BuildSpatialTemporalPayloadInput,
  BatTrachAlignment,
  BatTrachDirectionRule,
  BatTrachDirectionStar,
  BatTrachHouseGroup,
  BatTrachProfile,
  BatTrachRoomRecommendation,
  BatTrachRoomType,
  FengShuiChartGridCell,
  Mountain24,
  VietnameseSpatialTemporalPayload,
} from '@/types/fengshui';
import type { TuViChart, TuViGender } from '@/types/tuvi';

// ── Types ──────────────────────────────────────────────────────

export type FlyingStar = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface PalaceInfo {
  position: string; // N, NE, E, SE, S, SW, W, NW, Center
  positionVi: string;
  periodStar: FlyingStar;
  mountainStar: FlyingStar;
  waterStar: FlyingStar;
  annualStar?: number | null;
  monthlyStar?: number | null;
  combination: string; // e.g. "Double 8", "Reversed"
  nature: 'cat' | 'hung' | 'trung';
  interpretation: string;
  remedy: string;
}

export interface FlyingStarChart {
  period: number;
  periodRange: string;
  facingDirection: string;
  facingDirectionVi: string;
  facingMountain?: Mountain24;
  sittingMountain?: Mountain24;
  headingDeg?: number;
  trueHeadingDeg?: number | null;
  magneticHeadingDeg?: number | null;
  activeVan?: number;
  annualStar?: {
    centerStar: number;
    starGrid: number[][];
    interpretation: string;
  };
  monthlyStar?: {
    centerStar: number;
    starGrid: number[][];
    interpretation: string;
  };
  payload?: VietnameseSpatialTemporalPayload;
  palaces: PalaceInfo[];
  overallAssessment: string;
  mainRemedies: string[];
}

export interface LouPanChartInput {
  headingDeg: number;
  constructionYear: number;
  selectedDate?: Date;
  manualPeriod?: number;
  trueHeadingDeg?: number | null;
  magneticHeadingDeg?: number | null;
  dayData?: DayDetailsData | null;
  tuViChart?: TuViChart | null;
  batTrachProfile?: BatTrachProfile | null;
}

// ── Constants ──────────────────────────────────────────────────

/** 24 Mountains compass directions */
const RAW_COMPASS_DIRECTIONS: Mountain24[] = [
  { id: 'N1', nameVi: 'Nhâm', nameHan: '壬', degreeStart: 337.5, degreeEnd: 352.5, directionGroup: 'Bắc', element: 'Thủy', polarity: 'yang', palace: 'Bắc', oppositeId: 'S3', oppositeNameVi: 'Đinh' },
  { id: 'N2', nameVi: 'Tý', nameHan: '子', degreeStart: 352.5, degreeEnd: 7.5, directionGroup: 'Bắc', element: 'Thủy', polarity: 'yin', palace: 'Bắc', oppositeId: 'S2', oppositeNameVi: 'Ngọ' },
  { id: 'N3', nameVi: 'Quý', nameHan: '癸', degreeStart: 7.5, degreeEnd: 22.5, directionGroup: 'Bắc', element: 'Thủy', polarity: 'yin', palace: 'Bắc', oppositeId: 'S1', oppositeNameVi: 'Bính' },
  { id: 'NE1', nameVi: 'Sửu', nameHan: '丑', degreeStart: 22.5, degreeEnd: 37.5, directionGroup: 'Đông Bắc', element: 'Thổ', polarity: 'yin', palace: 'Đông Bắc', oppositeId: 'SW3', oppositeNameVi: 'Thân' },
  { id: 'NE2', nameVi: 'Cấn', nameHan: '艮', degreeStart: 37.5, degreeEnd: 52.5, directionGroup: 'Đông Bắc', element: 'Thổ', polarity: 'yang', palace: 'Đông Bắc', oppositeId: 'SW2', oppositeNameVi: 'Khôn' },
  { id: 'NE3', nameVi: 'Dần', nameHan: '寅', degreeStart: 52.5, degreeEnd: 67.5, directionGroup: 'Đông Bắc', element: 'Mộc', polarity: 'yang', palace: 'Đông Bắc', oppositeId: 'SW1', oppositeNameVi: 'Mùi' },
  { id: 'E1', nameVi: 'Giáp', nameHan: '甲', degreeStart: 67.5, degreeEnd: 82.5, directionGroup: 'Đông', element: 'Mộc', polarity: 'yang', palace: 'Đông', oppositeId: 'W3', oppositeNameVi: 'Tân' },
  { id: 'E2', nameVi: 'Mão', nameHan: '卯', degreeStart: 82.5, degreeEnd: 97.5, directionGroup: 'Đông', element: 'Mộc', polarity: 'yin', palace: 'Đông', oppositeId: 'W2', oppositeNameVi: 'Dậu' },
  { id: 'E3', nameVi: 'Ất', nameHan: '乙', degreeStart: 97.5, degreeEnd: 112.5, directionGroup: 'Đông', element: 'Mộc', polarity: 'yin', palace: 'Đông', oppositeId: 'W1', oppositeNameVi: 'Canh' },
  { id: 'SE1', nameVi: 'Thìn', nameHan: '辰', degreeStart: 112.5, degreeEnd: 127.5, directionGroup: 'Đông Nam', element: 'Thổ', polarity: 'yin', palace: 'Đông Nam', oppositeId: 'NW3', oppositeNameVi: 'Hợi' },
  { id: 'SE2', nameVi: 'Tốn', nameHan: '巽', degreeStart: 127.5, degreeEnd: 142.5, directionGroup: 'Đông Nam', element: 'Mộc', polarity: 'yang', palace: 'Đông Nam', oppositeId: 'NW2', oppositeNameVi: 'Càn' },
  { id: 'SE3', nameVi: 'Tỵ', nameHan: '巳', degreeStart: 142.5, degreeEnd: 157.5, directionGroup: 'Đông Nam', element: 'Hỏa', polarity: 'yang', palace: 'Đông Nam', oppositeId: 'NW1', oppositeNameVi: 'Tuất' },
  { id: 'S1', nameVi: 'Bính', nameHan: '丙', degreeStart: 157.5, degreeEnd: 172.5, directionGroup: 'Nam', element: 'Hỏa', polarity: 'yang', palace: 'Nam', oppositeId: 'N3', oppositeNameVi: 'Quý' },
  { id: 'S2', nameVi: 'Ngọ', nameHan: '午', degreeStart: 172.5, degreeEnd: 187.5, directionGroup: 'Nam', element: 'Hỏa', polarity: 'yin', palace: 'Nam', oppositeId: 'N2', oppositeNameVi: 'Tý' },
  { id: 'S3', nameVi: 'Đinh', nameHan: '丁', degreeStart: 187.5, degreeEnd: 202.5, directionGroup: 'Nam', element: 'Hỏa', polarity: 'yin', palace: 'Nam', oppositeId: 'N1', oppositeNameVi: 'Nhâm' },
  { id: 'SW1', nameVi: 'Mùi', nameHan: '未', degreeStart: 202.5, degreeEnd: 217.5, directionGroup: 'Tây Nam', element: 'Thổ', polarity: 'yin', palace: 'Tây Nam', oppositeId: 'NE3', oppositeNameVi: 'Dần' },
  { id: 'SW2', nameVi: 'Khôn', nameHan: '坤', degreeStart: 217.5, degreeEnd: 232.5, directionGroup: 'Tây Nam', element: 'Thổ', polarity: 'yang', palace: 'Tây Nam', oppositeId: 'NE2', oppositeNameVi: 'Cấn' },
  { id: 'SW3', nameVi: 'Thân', nameHan: '申', degreeStart: 232.5, degreeEnd: 247.5, directionGroup: 'Tây Nam', element: 'Kim', polarity: 'yang', palace: 'Tây Nam', oppositeId: 'NE1', oppositeNameVi: 'Sửu' },
  { id: 'W1', nameVi: 'Canh', nameHan: '庚', degreeStart: 247.5, degreeEnd: 262.5, directionGroup: 'Tây', element: 'Kim', polarity: 'yang', palace: 'Tây', oppositeId: 'E3', oppositeNameVi: 'Ất' },
  { id: 'W2', nameVi: 'Dậu', nameHan: '酉', degreeStart: 262.5, degreeEnd: 277.5, directionGroup: 'Tây', element: 'Kim', polarity: 'yin', palace: 'Tây', oppositeId: 'E2', oppositeNameVi: 'Mão' },
  { id: 'W3', nameVi: 'Tân', nameHan: '辛', degreeStart: 277.5, degreeEnd: 292.5, directionGroup: 'Tây', element: 'Kim', polarity: 'yin', palace: 'Tây', oppositeId: 'E1', oppositeNameVi: 'Giáp' },
  { id: 'NW1', nameVi: 'Tuất', nameHan: '戌', degreeStart: 292.5, degreeEnd: 307.5, directionGroup: 'Tây Bắc', element: 'Thổ', polarity: 'yin', palace: 'Tây Bắc', oppositeId: 'SE3', oppositeNameVi: 'Tỵ' },
  { id: 'NW2', nameVi: 'Càn', nameHan: '乾', degreeStart: 307.5, degreeEnd: 322.5, directionGroup: 'Tây Bắc', element: 'Kim', polarity: 'yang', palace: 'Tây Bắc', oppositeId: 'SE2', oppositeNameVi: 'Tốn' },
  { id: 'NW3', nameVi: 'Hợi', nameHan: '亥', degreeStart: 322.5, degreeEnd: 337.5, directionGroup: 'Tây Bắc', element: 'Thủy', polarity: 'yang', palace: 'Tây Bắc', oppositeId: 'SE1', oppositeNameVi: 'Thìn' },
];

export const COMPASS_DIRECTIONS: Mountain24[] = RAW_COMPASS_DIRECTIONS.map((mountain) => ({
  ...mountain,
  vi: mountain.nameVi,
  degrees: mountain.degreeStart,
  group: mountain.directionGroup,
}));

export function normalizeHeading(degrees: number): number {
  if (!Number.isFinite(degrees)) return 0;
  return ((degrees % 360) + 360) % 360;
}

export function getMountainById(id: string): Mountain24 | undefined {
  return COMPASS_DIRECTIONS.find((mountain) => mountain.id === id);
}

export function getMountainByName(nameVi: string): Mountain24 | undefined {
  return COMPASS_DIRECTIONS.find((mountain) => mountain.nameVi === nameVi);
}

export function getMountainForHeading(headingDeg: number): Mountain24 {
  const normalized = normalizeHeading(headingDeg);
  return (
    COMPASS_DIRECTIONS.find((mountain) => {
      const { degreeStart, degreeEnd } = mountain;
      return degreeStart < degreeEnd
        ? normalized >= degreeStart && normalized < degreeEnd
        : normalized >= degreeStart || normalized < degreeEnd;
    }) ?? COMPASS_DIRECTIONS[1]
  );
}

export function getSittingMountain(mountain: Mountain24): Mountain24 {
  return getMountainById(mountain.oppositeId) ?? mountain;
}

export function getActiveVanForYear(year: number): number {
  if (year >= 2044) return 1;
  if (year >= 2024) return 9;
  if (year >= 2004) return 8;
  if (year >= 1984) return 7;
  if (year >= 1964) return 6;
  if (year >= 1944) return 5;
  if (year >= 1924) return 4;
  if (year >= 1904) return 3;
  if (year >= 1884) return 2;
  return 1;
}

const BAT_TRACH_DIRECTION_SCORES: Record<BatTrachDirectionStar, number> = {
  'Sinh Khí': 100,
  'Thiên Y': 85,
  'Diên Niên': 75,
  'Phục Vị': 60,
  'Tuyệt Mệnh': -100,
  'Ngũ Quỷ': -85,
  'Lục Sát': -75,
  'Họa Hại': -60,
};

const BAT_TRACH_CUNG_DATA: Record<
  number,
  {
    cungName: string;
    element: string;
    houseGroup: BatTrachHouseGroup;
    favorableDirections: Array<[string, BatTrachDirectionStar]>;
    unfavorableDirections: Array<[string, BatTrachDirectionStar]>;
  }
> = {
  1: {
    cungName: 'Khảm',
    element: 'Thủy',
    houseGroup: 'Đông Tứ Mệnh',
    favorableDirections: [
      ['Đông Nam', 'Sinh Khí'],
      ['Đông', 'Thiên Y'],
      ['Nam', 'Diên Niên'],
      ['Bắc', 'Phục Vị'],
    ],
    unfavorableDirections: [
      ['Tây Bắc', 'Tuyệt Mệnh'],
      ['Tây Nam', 'Ngũ Quỷ'],
      ['Tây', 'Lục Sát'],
      ['Đông Bắc', 'Họa Hại'],
    ],
  },
  2: {
    cungName: 'Khôn',
    element: 'Thổ',
    houseGroup: 'Tây Tứ Mệnh',
    favorableDirections: [
      ['Đông Bắc', 'Sinh Khí'],
      ['Tây', 'Thiên Y'],
      ['Tây Bắc', 'Diên Niên'],
      ['Tây Nam', 'Phục Vị'],
    ],
    unfavorableDirections: [
      ['Đông', 'Tuyệt Mệnh'],
      ['Đông Nam', 'Ngũ Quỷ'],
      ['Bắc', 'Lục Sát'],
      ['Nam', 'Họa Hại'],
    ],
  },
  3: {
    cungName: 'Chấn',
    element: 'Mộc',
    houseGroup: 'Đông Tứ Mệnh',
    favorableDirections: [
      ['Nam', 'Sinh Khí'],
      ['Bắc', 'Thiên Y'],
      ['Đông Nam', 'Diên Niên'],
      ['Đông', 'Phục Vị'],
    ],
    unfavorableDirections: [
      ['Tây', 'Tuyệt Mệnh'],
      ['Đông Bắc', 'Ngũ Quỷ'],
      ['Tây Bắc', 'Lục Sát'],
      ['Tây Nam', 'Họa Hại'],
    ],
  },
  4: {
    cungName: 'Tốn',
    element: 'Mộc',
    houseGroup: 'Đông Tứ Mệnh',
    favorableDirections: [
      ['Bắc', 'Sinh Khí'],
      ['Nam', 'Thiên Y'],
      ['Đông', 'Diên Niên'],
      ['Đông Nam', 'Phục Vị'],
    ],
    unfavorableDirections: [
      ['Tây Nam', 'Tuyệt Mệnh'],
      ['Tây Bắc', 'Ngũ Quỷ'],
      ['Tây', 'Lục Sát'],
      ['Đông Bắc', 'Họa Hại'],
    ],
  },
  6: {
    cungName: 'Càn',
    element: 'Kim',
    houseGroup: 'Tây Tứ Mệnh',
    favorableDirections: [
      ['Tây', 'Sinh Khí'],
      ['Đông Bắc', 'Thiên Y'],
      ['Tây Nam', 'Diên Niên'],
      ['Tây Bắc', 'Phục Vị'],
    ],
    unfavorableDirections: [
      ['Nam', 'Tuyệt Mệnh'],
      ['Đông', 'Ngũ Quỷ'],
      ['Đông Nam', 'Lục Sát'],
      ['Bắc', 'Họa Hại'],
    ],
  },
  7: {
    cungName: 'Đoài',
    element: 'Kim',
    houseGroup: 'Tây Tứ Mệnh',
    favorableDirections: [
      ['Tây Bắc', 'Sinh Khí'],
      ['Tây Nam', 'Thiên Y'],
      ['Đông Bắc', 'Diên Niên'],
      ['Tây', 'Phục Vị'],
    ],
    unfavorableDirections: [
      ['Đông Nam', 'Tuyệt Mệnh'],
      ['Bắc', 'Ngũ Quỷ'],
      ['Nam', 'Lục Sát'],
      ['Đông', 'Họa Hại'],
    ],
  },
  8: {
    cungName: 'Cấn',
    element: 'Thổ',
    houseGroup: 'Tây Tứ Mệnh',
    favorableDirections: [
      ['Tây Nam', 'Sinh Khí'],
      ['Tây Bắc', 'Thiên Y'],
      ['Tây', 'Diên Niên'],
      ['Đông Bắc', 'Phục Vị'],
    ],
    unfavorableDirections: [
      ['Bắc', 'Tuyệt Mệnh'],
      ['Nam', 'Ngũ Quỷ'],
      ['Đông', 'Lục Sát'],
      ['Đông Nam', 'Họa Hại'],
    ],
  },
  9: {
    cungName: 'Ly',
    element: 'Hỏa',
    houseGroup: 'Đông Tứ Mệnh',
    favorableDirections: [
      ['Đông', 'Sinh Khí'],
      ['Đông Nam', 'Thiên Y'],
      ['Bắc', 'Diên Niên'],
      ['Nam', 'Phục Vị'],
    ],
    unfavorableDirections: [
      ['Tây', 'Tuyệt Mệnh'],
      ['Tây Bắc', 'Ngũ Quỷ'],
      ['Tây Nam', 'Lục Sát'],
      ['Đông Bắc', 'Họa Hại'],
    ],
  },
};

function getDigitSum(year: number): number {
  const yearDigits = Math.abs(year) % 100;
  return Math.floor(yearDigits / 10) + (yearDigits % 10);
}

function normalizeCungPhi(rawValue: number): number {
  return ((Math.trunc(rawValue) - 1) % 9 + 9) % 9 + 1;
}

function buildBatTrachRules(entries: Array<[string, BatTrachDirectionStar]>): BatTrachDirectionRule[] {
  return entries.map(([direction, star], index) => ({
    direction: direction as BatTrachProfile['favorableDirections'][number]['direction'],
    star,
    score: BAT_TRACH_DIRECTION_SCORES[star] - index * 2,
  }));
}

export function getBatTrachCungPhiNumber(year: number, gender: TuViGender): number {
  const digitSum = getDigitSum(year);
  const isPost2000 = year >= 2000;
  const raw = gender === 'nam'
    ? (isPost2000 ? 9 - digitSum : 10 - digitSum)
    : (isPost2000 ? 6 + digitSum : 5 + digitSum);
  const normalized = normalizeCungPhi(raw);
  if (normalized === 5) {
    return gender === 'nam' ? 2 : 8;
  }
  return normalized;
}

function buildBatTrachProfileFromCungPhi(birthYear: number, gender: TuViGender, cungPhi: number): BatTrachProfile | null {
  const cungData = BAT_TRACH_CUNG_DATA[cungPhi];

  if (!cungData) return null;

  return {
    birthYear,
    gender,
    cungPhi,
    cungName: cungData.cungName,
    element: cungData.element as BatTrachProfile['element'],
    houseGroup: cungData.houseGroup,
    favorableDirections: buildBatTrachRules(cungData.favorableDirections),
    unfavorableDirections: buildBatTrachRules(cungData.unfavorableDirections),
    summary: `${cungData.cungName} cung ${cungPhi} thuộc ${cungData.houseGroup}, ưu tiên các hướng ${cungData.favorableDirections.map(([direction]) => direction).join(' · ')}.`,
  };
}

export function getBatTrachProfileFromBirthYearAndGender(birthYear: number, gender: TuViGender): BatTrachProfile | null {
  const cungPhi = getBatTrachCungPhiNumber(birthYear, gender);
  return buildBatTrachProfileFromCungPhi(birthYear, gender, cungPhi);
}

export function getBatTrachProfileFromTuViChart(chart: TuViChart | null): BatTrachProfile | null {
  if (!chart) return null;

  const birthYear = chart.input.solarDate.getFullYear();
  return getBatTrachProfileFromBirthYearAndGender(birthYear, chart.input.gender);
}

export function evaluateBatTrachHeading(profile: BatTrachProfile, headingDeg: number): BatTrachAlignment {
  const mountain = getMountainForHeading(headingDeg);
  const direction = mountain.directionGroup;
  const favorable = profile.favorableDirections.find((rule) => rule.direction === direction);
  if (favorable) {
    return {
      direction,
      star: favorable.star,
      score: favorable.score,
      isAuspicious: true,
      note: `Hướng ${direction} phù hợp với ${profile.cungName} mệnh.`,
    };
  }

  const unfavorable = profile.unfavorableDirections.find((rule) => rule.direction === direction);
  if (unfavorable) {
    return {
      direction,
      star: unfavorable.star,
      score: unfavorable.score,
      isAuspicious: false,
      note: `Hướng ${direction} đang đi vào nhóm cần hạn chế cho ${profile.cungName} mệnh.`,
    };
  }

  return {
    direction,
    star: 'Phục Vị',
    score: 0,
    isAuspicious: false,
    note: `Chưa đối chiếu được hướng ${direction}.`,
  };
}

export function recommendBatTrachRoomOrientation(roomType: BatTrachRoomType, profile: BatTrachProfile): BatTrachRoomRecommendation {
  const priorityByRoom: Record<BatTrachRoomType, BatTrachDirectionStar[]> = {
    house: ['Sinh Khí', 'Thiên Y', 'Diên Niên', 'Phục Vị'],
    desk: ['Sinh Khí', 'Thiên Y', 'Diên Niên', 'Phục Vị'],
    bed: ['Thiên Y', 'Phục Vị', 'Sinh Khí', 'Diên Niên'],
    door: ['Sinh Khí', 'Diên Niên', 'Thiên Y', 'Phục Vị'],
    altar: ['Phục Vị', 'Thiên Y', 'Diên Niên', 'Sinh Khí'],
    stove: ['Diên Niên', 'Sinh Khí', 'Thiên Y', 'Phục Vị'],
    seat: ['Sinh Khí', 'Thiên Y', 'Phục Vị', 'Diên Niên'],
  };

  const starOrder = priorityByRoom[roomType];
  const preferredDirections = starOrder
    .map((star) => profile.favorableDirections.find((rule) => rule.star === star))
    .filter((rule): rule is BatTrachDirectionRule => Boolean(rule));

  return {
    roomType,
    preferredDirections,
    summary: `${roomType === 'house' ? 'Hướng nhà' : roomType === 'desk' ? 'Bàn làm việc' : roomType === 'bed' ? 'Giường ngủ' : roomType === 'door' ? 'Cửa chính' : roomType === 'altar' ? 'Bàn thờ' : roomType === 'stove' ? 'Bếp' : 'Chỗ ngồi'} nên ưu tiên ${preferredDirections.map((rule) => rule.direction).join(' · ')}.`,
  };
}

function buildLacThuGrid(centerStar: FlyingStar, reverse = false): number[][] {
  const lacThuOrder = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];

  const offset = centerStar - 5;
  return lacThuOrder.map((row) => row.map((cell) => ((cell + (reverse ? -offset : offset) - 1 + 9) % 9) + 1));
}

function buildChartGrid(
  palaces: PalaceInfo[],
  annualGrid?: number[][],
  monthlyGrid?: number[][],
): FengShuiChartGridCell[] {
  return palaces.map((palace, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return {
      sectorId: palace.position,
      position: palace.position,
      positionVi: palace.positionVi,
      baseStar: palace.periodStar,
      mountainStar: palace.mountainStar,
      waterStar: palace.waterStar,
      annualStar: annualGrid?.[row]?.[col] ?? null,
      monthlyStar: monthlyGrid?.[row]?.[col] ?? null,
    };
  });
}

export function buildSpatialTemporalPayload(input: BuildSpatialTemporalPayloadInput): VietnameseSpatialTemporalPayload {
  const headingDeg = input.headingDeg ?? 0;
  const facingMountain = getMountainForHeading(headingDeg);
  const sittingMountain = getSittingMountain(facingMountain);
  const grid = input.chartGrid ?? [];
  const lunar = input.dayData?.lunarDate;
  const canChi = input.dayData?.canChi;
  const hourLabel = input.dayData?.startHour ? `${input.dayData.startHour.can} ${input.dayData.startHour.chi}` : '';
  const batTrachProfile = input.batTrachProfile ?? getBatTrachProfileFromTuViChart(input.tuViChart ?? null);
  const batTrachAlignment = batTrachProfile ? evaluateBatTrachHeading(batTrachProfile, headingDeg) : null;
  const batTrachRoomRecommendation = batTrachProfile
    ? recommendBatTrachRoomOrientation('house', batTrachProfile)
    : null;

  return {
    timestampContext: {
      solarDateTime: input.selectedDate.toISOString(),
      lunarCanChi: {
        year: canChi?.year ? `${canChi.year.can} ${canChi.year.chi}` : lunar ? `${lunar.year}` : '',
        month: canChi?.month ? `${canChi.month.can} ${canChi.month.chi}` : lunar ? `${lunar.month}` : '',
        day: canChi?.day ? `${canChi.day.can} ${canChi.day.chi}` : lunar ? `${lunar.day}` : '',
        hour: hourLabel,
      },
      activeVan: input.activeVan,
    },
    spatialContext: {
      headingDeg,
      trueHeadingDeg: input.trueHeadingDeg ?? null,
      magneticHeadingDeg: input.magneticHeadingDeg ?? null,
      facingMountain: facingMountain.nameVi,
      sittingMountain: sittingMountain.nameVi,
      xuanKongGrid: grid,
    },
    astrologicalMasks: {
      tuViMenhCung: input.tuViChart?.centerInfo?.menhCung ?? null,
      tuViThanCung: input.tuViChart?.centerInfo?.thanCungLabel ?? null,
      batTrachPhiCung: input.tuViChart
        ? `${input.tuViChart.centerInfo.menhCung} · ${input.tuViChart.centerInfo.thanCungLabel}`
        : batTrachProfile
          ? `${batTrachProfile.cungName} · ${batTrachProfile.houseGroup}`
          : null,
      batTrachProfile,
      batTrachAlignment,
      batTrachRoomRecommendation,
      auspiciousSectors: grid
        .filter((cell) => [1, 6, 8].includes(cell.baseStar) || [1, 6, 8].includes(cell.mountainStar) || [1, 6, 8].includes(cell.waterStar))
        .map((cell) => cell.positionVi),
    },
  };
}

/** Period determination from construction year */
function getPeriod(constructionYear: number): { period: number; range: string } {
  if (constructionYear >= 2044) return { period: 1, range: '2044-2063' };
  if (constructionYear >= 2024) return { period: 9, range: '2024-2043' };
  if (constructionYear >= 2004) return { period: 8, range: '2004-2023' };
  if (constructionYear >= 1984) return { period: 7, range: '1984-2003' };
  if (constructionYear >= 1964) return { period: 6, range: '1964-1983' };
  if (constructionYear >= 1944) return { period: 5, range: '1944-1963' };
  if (constructionYear >= 1924) return { period: 4, range: '1924-1943' };
  if (constructionYear >= 1904) return { period: 3, range: '1904-1923' };
  if (constructionYear >= 1884) return { period: 2, range: '1884-1903' };
  return { period: 1, range: '1864-1883' };
}

/**
 * Flying star path through 9 palaces (Luo Shu flight path)
 * standard 1-9 Luo Shu indices:
 * 5=Center, 6=NW, 7=W, 8=NE, 9=S, 1=N, 2=SW, 3=E, 4=SE
 */
const FLIGHT_PATH = [5, 6, 7, 8, 9, 1, 2, 3, 4];

/** Map Luoshu palace number (1-9) to grid position [row, col] */
// standard mapping: S is top (row 0), N is bottom (row 2)
// 4 (SE) | 9 (S) | 2 (SW)  row 0
// 3 (E)  | 5 (C) | 7 (W)   row 1
// 8 (NE) | 1 (N) | 6 (NW)  row 2
const LUOSHU_TO_GRID: Record<number, [number, number]> = {
  1: [2, 1], // N
  2: [0, 2], // SW
  3: [1, 0], // E
  4: [0, 0], // SE
  5: [1, 1], // Center
  6: [2, 2], // NW
  7: [1, 2], // W
  8: [2, 0], // NE
  9: [0, 1], // S
};

/** Map Direction groups to Luoshu Palace Numbers */
const DIR_TO_LUOSHU: Record<string, number> = {
  Bắc: 1,
  'Đông Bắc': 8,
  Đông: 3,
  'Đông Nam': 4,
  Nam: 9,
  'Tây Nam': 2,
  Tây: 7,
  'Tây Bắc': 6,
  'Trung Tâm': 5,
};

/**
 * Generate a flying star grid for a given center star value.
 * Stars fly through the Luo Shu path.
 */
function generateStarGrid(centerStar: FlyingStar, reverse = false): FlyingStar[][] {
  const grid: FlyingStar[][] = Array.from({ length: 3 }, () => [1, 1, 1] as FlyingStar[]);

  for (let i = 0; i < 9; i++) {
    const luoshuBase = FLIGHT_PATH[i]; // 5, 6, 7...
    let star: number;
    if (reverse) {
      star = ((centerStar - 1 - i + 9) % 9) + 1;
    } else {
      star = ((centerStar - 1 + i) % 9) + 1;
    }
    const [row, col] = LUOSHU_TO_GRID[luoshuBase];
    grid[row][col] = star as FlyingStar;
  }
  return grid;
}

// ── Yin/Yang for 24 Mountains (Academic Standard) ────────────

/**
 * Trigrams and their 3 mountains (Thiên, Địa, Nhân).
 * Determines polarity for forward/reverse flight.
 */
const LUOSHU_MOUNTAIN_POLARITIES: Record<number, { mountains: string[]; polarities: ('yang' | 'yin')[] }> = {
  1: { mountains: ['Nhâm', 'Tý', 'Quý'], polarities: ['yang', 'yin', 'yin'] },
  2: { mountains: ['Mùi', 'Khôn', 'Thân'], polarities: ['yin', 'yang', 'yang'] },
  3: { mountains: ['Giáp', 'Mão', 'Ất'], polarities: ['yang', 'yin', 'yin'] },
  4: { mountains: ['Thìn', 'Tốn', 'Tỵ'], polarities: ['yin', 'yang', 'yang'] },
  6: { mountains: ['Tuất', 'Càn', 'Hợi'], polarities: ['yin', 'yang', 'yang'] },
  7: { mountains: ['Canh', 'Dậu', 'Tân'], polarities: ['yang', 'yin', 'yin'] },
  8: { mountains: ['Sửu', 'Cấn', 'Dần'], polarities: ['yin', 'yang', 'yang'] },
  9: { mountains: ['Bính', 'Ngọ', 'Đinh'], polarities: ['yang', 'yin', 'yin'] },
};

/**
 * Determine if stars should fly forward or reverse.
 *
 * Rule:
 * 1. The original house sits/faces a specific mountain (e.g., Mùi).
 * 2. This mountain is one of 3 types: Địa (0), Thiên (1), or Nhân (2) Nguyên Long.
 * 3. Find the same Nguyên Long type on the Trigram of the `centerStar` entering the center.
 * 4. Use the Yin/Yang of THAT target mountain.
 * 5. If Center Star is 5, it uses the original house palace's Yin/Yang directly.
 */
function shouldFlyReverse(centerStar: FlyingStar, originalHouseLuoshu: number, subDirection: string): boolean {
  if (!subDirection) return false;

  // Find which Yuan (Earth=0, Heaven=1, Man=2) the house belongs to
  const originalHouseData = LUOSHU_MOUNTAIN_POLARITIES[originalHouseLuoshu];
  if (!originalHouseData) return false;

  const yuanIndex = originalHouseData.mountains.indexOf(subDirection);
  if (yuanIndex === -1) return false; // Shouldn't happen

  // Star 5 has no trigram, it borrows the original house's polarity
  const targetLuoshu = centerStar === 5 ? originalHouseLuoshu : centerStar;
  const targetData = LUOSHU_MOUNTAIN_POLARITIES[targetLuoshu];
  if (!targetData) return false;

  const polarity = targetData.polarities[yuanIndex];
  return polarity === 'yin'; // Yin = Reverse (Nghịch), Yang = Forward (Thuận)
}

function getGridStarForDirection(grid: FlyingStar[][], directionGroup: string): FlyingStar {
  const luoshu = DIR_TO_LUOSHU[directionGroup];
  if (!luoshu) return 5 as FlyingStar;
  const [row, col] = LUOSHU_TO_GRID[luoshu];
  return grid[row][col];
}

function getStarInterpretation(
  periodStar: FlyingStar,
  mountainStar: FlyingStar,
  waterStar: FlyingStar,
  period: number,
): {
  combination: string;
  nature: PalaceInfo['nature'];
  interpretation: string;
  remedy: string;
} {
  const timely = [period as FlyingStar, (period === 9 ? 1 : period + 1) as FlyingStar];
  const isTimelyMt = timely.includes(mountainStar);
  const isTimelyWt = timely.includes(waterStar);

  if (mountainStar === waterStar && timely.includes(mountainStar)) {
    return {
      combination: `Song Tinh ${mountainStar} — Đại Cát`,
      nature: 'cat',
      interpretation: `Cung gặp Song Tinh ${mountainStar}, rất tốt cho cả sức khỏe (Sơn) và tài lộc (Thủy). Nên tận dụng tối đa.`,
      remedy: 'Kích hoạt cung này bằng nước chảy và cây xanh.',
    };
  }

  if ((mountainStar === 2 && waterStar === 5) || (mountainStar === 5 && waterStar === 2)) {
    return {
      combination: 'Nhị Ngũ Giao Gia — Hung',
      nature: 'hung',
      interpretation: 'Sao 2-5 kết hợp gây bệnh tật nặng và tai nạn. Cung này rất nguy hiểm.',
      remedy: 'Treo chuông gió 6 ống đồng, nước muối, và tránh hoạt động ở vùng này.',
    };
  }

  if (mountainStar === 5 || waterStar === 5) {
    return {
      combination: 'Ngũ Hoàng — Đại Hung',
      nature: 'hung',
      interpretation: 'Sao 5 Hoàng (Ngũ Hoàng Đại Sát) mang năng lượng cực hung, cần hóa giải nghiêm ngặt.',
      remedy: 'Đặt chuông gió kim loại 6 ống hoặc vật phẩm Ngũ Đế Tiền ở cung này. Tuyệt đối không khuấy động.',
    };
  }

  if (isTimelyMt && isTimelyWt) {
    return {
      combination: `Sơn Thủy Đương Vận (${mountainStar}-${waterStar})`,
      nature: 'cat',
      interpretation: `Cả Sơn tinh (${mountainStar}) và Thủy tinh (${waterStar}) đều đương vận, rất tốt.`,
      remedy: 'Duy trì không gian sạch sẽ và thoáng khí.',
    };
  }

  if (isTimelyMt || isTimelyWt) {
    return {
      combination: `${isTimelyMt ? 'Sơn' : 'Thủy'} Đương Vận (${isTimelyMt ? mountainStar : waterStar})`,
      nature: 'trung',
      interpretation: `${isTimelyMt ? 'Sơn tinh đương vận, tốt cho sức khỏe.' : 'Thủy tinh đương vận, tốt cho tài lộc.'} Cung ở mức trung bình.`,
      remedy: isTimelyMt ? 'Thêm núi đá hoặc vật nặng hỗ trợ.' : 'Thêm nước chảy hoặc bể cá kích hoạt.',
    };
  }

  return {
    combination: `Thất Vận (${mountainStar}-${waterStar})`,
    nature: 'hung',
    interpretation: `Sơn (${mountainStar}) và Thủy (${waterStar}) đều thất vận, cung này kém may mắn.`,
    remedy: 'Hạn chế sử dụng vùng này, giữ yên tĩnh và sạch sẽ.',
  };
}

// ── Palace grid positions mapping ──────────────────────────────

const GRID_TO_PALACE: string[] = [
  'SE',
  'S',
  'SW', // row 0: [0,0]=SE, [0,1]=S, [0,2]=SW
  'E',
  'Center',
  'W', // row 1
  'NE',
  'N',
  'NW', // row 2
];

const PALACE_VI: Record<string, string> = {
  N: 'Bắc',
  NE: 'Đông Bắc',
  E: 'Đông',
  SE: 'Đông Nam',
  S: 'Nam',
  SW: 'Tây Nam',
  W: 'Tây',
  NW: 'Tây Bắc',
  Center: 'Trung Tâm',
};

// ── Main Public API ────────────────────────────────────────────

/**
 * Generate a Flying Star chart.
 *
 * @param constructionYear Year of construction (or manual period override)
 * @param facingDirection Compass direction group the building faces (e.g., 'Nam', 'Đông Bắc')
 * @param manualPeriod Optional manual period override (1-9)
 */
export function generateFlyingStarChart(
  constructionYear: number,
  facingDirection: string,
  manualPeriod?: number,
  subDirection?: string,
): FlyingStarChart {
  const { period: autoPeriod, range } = getPeriod(constructionYear);
  const period = manualPeriod || autoPeriod;
  const periodRange = manualPeriod ? `Vận ${manualPeriod} (thủ công)` : `Vận ${autoPeriod} (${range})`;

  // Generate star grids — Step 1: Period Grid
  const periodGrid = generateStarGrid(period as FlyingStar);

  // Step 2: Determine Facing (Water) and Sitting (Mountain) Center Stars
  const facingMountain = subDirection ? getMountainByName(subDirection) : COMPASS_DIRECTIONS.find((d) => d.directionGroup === facingDirection);
  const sittingMountain = facingMountain ? getSittingMountain(facingMountain) : undefined;
  const sittingDirection = sittingMountain?.directionGroup || 'Nam';

  const waterCenter = getGridStarForDirection(periodGrid, facingDirection);
  const mountainCenter = getGridStarForDirection(periodGrid, sittingDirection);

  // Determine facing/sitting sub-directions (for reverse check)
  const facingSubDir = subDirection || facingMountain?.nameVi;
  const sittingSubDir = sittingMountain?.nameVi;

  const originalFacingLuoshu = DIR_TO_LUOSHU[facingDirection] || 9;
  const originalSittingLuoshu = DIR_TO_LUOSHU[sittingDirection] || 1;

  // Validate forward/reverse flight path using the Trigram mountains rule
  const reverseWater = shouldFlyReverse(waterCenter, originalFacingLuoshu, facingSubDir || 'Bính');
  const reverseMountain = shouldFlyReverse(mountainCenter, originalSittingLuoshu, sittingSubDir || 'Nhâm');

  const waterGrid = generateStarGrid(waterCenter, reverseWater);
  const mountainGrid = generateStarGrid(mountainCenter, reverseMountain);

  // Build palace info
  const palaces: PalaceInfo[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const position = GRID_TO_PALACE[idx];
      const ps = periodGrid[r][c] as FlyingStar;
      const ms = mountainGrid[r][c] as FlyingStar;
      const ws = waterGrid[r][c] as FlyingStar;

      const interp = getStarInterpretation(ps, ms, ws, period);

      palaces.push({
        position,
        positionVi: PALACE_VI[position],
        periodStar: ps,
        mountainStar: ms,
        waterStar: ws,
        ...interp,
      });
    }
  }

  // Overall assessment
  const catCount = palaces.filter((p) => p.nature === 'cat').length;
  const hungCount = palaces.filter((p) => p.nature === 'hung').length;

  let overallAssessment: string;
  if (catCount >= 5) {
    overallAssessment = 'Nhà ở vận thế rất tốt, nhiều cung cát lợi. Phong thủy tổng thể thuận lợi cho gia chủ.';
  } else if (hungCount >= 5) {
    overallAssessment = 'Nhà ở cần hóa giải nhiều cung hung. Nên tham khảo chuyên gia phong thủy để bố trí lại.';
  } else {
    overallAssessment = 'Phong thủy tổng thể ở mức trung bình. Một số cung tốt, một số cần hóa giải.';
  }

  // Main remedies
  const mainRemedies: string[] = [];
  const hungPalaces = palaces.filter((p) => p.nature === 'hung');
  if (hungPalaces.length > 0) {
    mainRemedies.push(`Hóa giải ${hungPalaces.length} cung hung: ${hungPalaces.map((p) => p.positionVi).join(', ')}`);
  }
  const star5Palaces = palaces.filter((p) => p.mountainStar === 5 || p.waterStar === 5);
  if (star5Palaces.length > 0) {
    mainRemedies.push('Đặt chuông gió kim loại 6 ống ở các cung có sao 5 Hoàng');
  }
  const catPalaces = palaces.filter((p) => p.nature === 'cat');
  if (catPalaces.length > 0) {
    mainRemedies.push(`Kích hoạt ${catPalaces.length} cung cát: ${catPalaces.map((p) => p.positionVi).join(', ')}`);
  }

  return {
    period,
    periodRange,
    facingDirection,
    facingDirectionVi: facingDirection,
    facingMountain,
    sittingMountain,
    palaces,
    overallAssessment,
    mainRemedies,
  };
}

// ── P2.7: Annual & Monthly Star Overlays ───────────────────────

/**
 * P2.7: Calculate the annual Flying Star center number.
 * Uses the standard Lạc Thư reverse formula:
 * For years in the current Upper Period: center = (11 - (year - 1864) % 9) % 9 || 9
 * This determines which star occupies the center palace for the year.
 */
export function calculateAnnualStar(year: number): {
  centerStar: number;
  starGrid: number[][];
  interpretation: string;
} {
  // Standard formula: reverse Lạc Thư cycle, anchored to known reference
  const raw = (11 - ((year - 1864) % 9)) % 9 || 9;
  const centerStar = raw > 0 ? raw : 9;

  // Generate the 3x3 grid from the center star using Lạc Thư ordering
  const starGrid = buildLacThuGrid(centerStar as FlyingStar);

  const starNames: Record<number, string> = {
    1: 'Nhất Bạch (Thủy)',
    2: 'Nhị Hắc (Thổ)',
    3: 'Tam Bích (Mộc)',
    4: 'Tứ Lục (Mộc)',
    5: 'Ngũ Hoàng (Thổ)',
    6: 'Lục Bạch (Kim)',
    7: 'Thất Xích (Kim)',
    8: 'Bát Bạch (Thổ)',
    9: 'Cửu Tử (Hỏa)',
  };

  return {
    centerStar,
    starGrid,
    interpretation: `Năm ${centerStar}: Sao ${starNames[centerStar] || ''} nhập trung cung. ${
      [1, 6, 8].includes(centerStar)
        ? 'Năm tài lộc, may mắn.'
        : [2, 5].includes(centerStar)
          ? 'Năm cần cẩn trọng sức khỏe, đặt hóa giải tại trung cung.'
          : centerStar === 9
            ? 'Năm phát triển, danh tiếng.'
            : 'Năm bình thường, giữ ổn định.'
    }`,
  };
}

/**
 * P2.7: Calculate monthly Flying Star center number.
 * Each month shifts the annual center star by a fixed offset.
 */
export function calculateMonthlyStar(
  year: number,
  lunarMonth: number,
): {
  centerStar: number;
  starGrid: number[][];
  interpretation: string;
} {
  // Monthly offset: based on which "group" the year belongs to
  const yearGroup = (year - 1864) % 3; // 0, 1, 2
  const monthBase = [2, 5, 8][yearGroup]; // Starting month center for each group
  const centerStar = ((monthBase + lunarMonth - 1 - 1 + 9) % 9) + 1;

  const starNames: Record<number, string> = {
    1: 'Nhất Bạch',
    2: 'Nhị Hắc',
    3: 'Tam Bích',
    4: 'Tứ Lục',
    5: 'Ngũ Hoàng',
    6: 'Lục Bạch',
    7: 'Thất Xích',
    8: 'Bát Bạch',
    9: 'Cửu Tử',
  };

  return {
    centerStar,
    starGrid: buildLacThuGrid(centerStar as FlyingStar),
    interpretation: `Tháng ${lunarMonth}: Sao ${starNames[centerStar] || ''} nhập trung. ${
      [2, 5].includes(centerStar)
        ? 'Tháng cần hóa giải.'
        : [1, 6, 8].includes(centerStar)
          ? 'Tháng thuận lợi.'
          : 'Tháng bình thường.'
    }`,
  };
}

export function generateLouPanChart(input: LouPanChartInput): FlyingStarChart {
  const facingMountain = getMountainForHeading(input.headingDeg);
  const selectedDate = input.selectedDate ?? new Date(input.constructionYear, 0, 1);
  const activeVan = input.manualPeriod ?? getActiveVanForYear(input.constructionYear);
  const chart = generateFlyingStarChart(
    input.constructionYear,
    facingMountain.directionGroup,
    input.manualPeriod,
    facingMountain.nameVi,
  );
  const annualStar = calculateAnnualStar(selectedDate.getFullYear());
  const lunarMonth = input.dayData?.lunarDate.month ?? selectedDate.getMonth() + 1;
  const monthlyStar = calculateMonthlyStar(selectedDate.getFullYear(), lunarMonth);
  const sittingMountain = getSittingMountain(facingMountain);
  const palaces = chart.palaces.map((palace, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return {
      ...palace,
      annualStar: annualStar.starGrid[row]?.[col] ?? null,
      monthlyStar: monthlyStar.starGrid[row]?.[col] ?? null,
    };
  });

  const payload = buildSpatialTemporalPayload({
    selectedDate,
    dayData: input.dayData ?? null,
    headingDeg: input.headingDeg,
    trueHeadingDeg: input.trueHeadingDeg ?? null,
    magneticHeadingDeg: input.magneticHeadingDeg ?? input.headingDeg,
    activeVan,
    chartGrid: buildChartGrid(palaces, annualStar.starGrid, monthlyStar.starGrid),
    tuViChart: input.tuViChart ?? null,
    batTrachProfile: input.batTrachProfile ?? null,
  });

  return {
    ...chart,
    headingDeg: input.headingDeg,
    trueHeadingDeg: input.trueHeadingDeg ?? null,
    magneticHeadingDeg: input.magneticHeadingDeg ?? null,
    activeVan,
    annualStar,
    monthlyStar,
    facingMountain,
    sittingMountain,
    palaces,
    payload,
  };
}
