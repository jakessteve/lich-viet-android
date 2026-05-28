import type { DayDetailsData } from './calendar';
import type { TuViChart, TuViGender } from './tuvi';

export type CompassPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';
export type CompassCalibrationState = 'ok' | 'low-accuracy' | 'interference' | 'unknown';
export type CompassHeadingSource = 'manual' | 'browser' | 'capacitor-motion' | 'native';

export type FengShuiDirectionGroup = 'Bắc' | 'Đông Bắc' | 'Đông' | 'Đông Nam' | 'Nam' | 'Tây Nam' | 'Tây' | 'Tây Bắc';
export type FengShuiPolarity = 'yin' | 'yang';
export type FengShuiElement = 'Thủy' | 'Mộc' | 'Hỏa' | 'Thổ' | 'Kim';
export type BatTrachHouseGroup = 'Đông Tứ Mệnh' | 'Tây Tứ Mệnh';
export type BatTrachDirectionStar = 'Sinh Khí' | 'Thiên Y' | 'Diên Niên' | 'Phục Vị' | 'Tuyệt Mệnh' | 'Ngũ Quỷ' | 'Lục Sát' | 'Họa Hại';
export type BatTrachRoomType = 'house' | 'desk' | 'bed' | 'door' | 'altar' | 'stove' | 'seat';

export interface BatTrachDirectionRule {
  direction: FengShuiDirectionGroup;
  star: BatTrachDirectionStar;
  score: number;
}

export interface BatTrachProfile {
  birthYear: number;
  gender: TuViGender;
  cungPhi: number;
  cungName: string;
  element: FengShuiElement;
  houseGroup: BatTrachHouseGroup;
  favorableDirections: BatTrachDirectionRule[];
  unfavorableDirections: BatTrachDirectionRule[];
  summary: string;
}

export interface BatTrachAlignment {
  direction: FengShuiDirectionGroup;
  star: BatTrachDirectionStar;
  score: number;
  isAuspicious: boolean;
  note: string;
}

export interface BatTrachRoomRecommendation {
  roomType: BatTrachRoomType;
  preferredDirections: BatTrachDirectionRule[];
  summary: string;
}

export interface CompassHeadingState {
  headingDeg: number | null;
  trueHeadingDeg: number | null;
  magneticHeadingDeg: number | null;
  declinationDeg: number | null;
  accuracyDeg: number | null;
  source: CompassHeadingSource;
  permissionState: CompassPermissionState;
  calibrationState: CompassCalibrationState;
  supported: boolean;
  locked: boolean;
  message?: string;
}

export interface Mountain24 {
  id: string;
  nameVi: string;
  nameHan: string;
  vi?: string;
  degreeStart: number;
  degreeEnd: number;
  degrees?: number;
  directionGroup: FengShuiDirectionGroup;
  group?: FengShuiDirectionGroup;
  element: FengShuiElement;
  polarity: FengShuiPolarity;
  palace: string;
  oppositeId: string;
  oppositeNameVi: string;
}

export interface FengShuiChartGridCell {
  sectorId: string;
  position: string;
  positionVi: string;
  baseStar: number;
  mountainStar: number;
  waterStar: number;
  annualStar: number | null;
  monthlyStar: number | null;
}

export interface TimestampContext {
  solarDateTime: string;
  lunarCanChi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  activeVan: number;
}

export interface SpatialContext {
  headingDeg: number;
  trueHeadingDeg: number | null;
  magneticHeadingDeg: number | null;
  facingMountain: string;
  sittingMountain: string;
  xuanKongGrid: FengShuiChartGridCell[];
}

export interface AstrologicalMasks {
  tuViMenhCung: string | null;
  tuViThanCung: string | null;
  batTrachPhiCung: string | null;
  batTrachProfile: BatTrachProfile | null;
  batTrachAlignment: BatTrachAlignment | null;
  batTrachRoomRecommendation: BatTrachRoomRecommendation | null;
  auspiciousSectors: string[];
}

export interface VietnameseSpatialTemporalPayload {
  timestampContext: TimestampContext;
  spatialContext: SpatialContext;
  astrologicalMasks: AstrologicalMasks;
}

export interface BuildSpatialTemporalPayloadInput {
  selectedDate: Date;
  dayData?: DayDetailsData | null;
  headingDeg: number | null;
  trueHeadingDeg?: number | null;
  magneticHeadingDeg?: number | null;
  activeVan: number;
  chartGrid?: FengShuiChartGridCell[];
  tuViChart?: TuViChart | null;
  batTrachProfile?: BatTrachProfile | null;
}
