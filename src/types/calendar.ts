export type Can = 'Giáp' | 'Ất' | 'Bính' | 'Đinh' | 'Mậu' | 'Kỷ' | 'Canh' | 'Tân' | 'Nhâm' | 'Quý';
export type Chi = 'Tý' | 'Sửu' | 'Dần' | 'Mão' | 'Thìn' | 'Tỵ' | 'Ngọ' | 'Mùi' | 'Thân' | 'Dậu' | 'Tuất' | 'Hợi';

export interface CanChi {
  can: Can;
  chi: Chi;
}

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeapMonth: boolean;
}

export type DayQuality = 'Good' | 'Bad' | 'Neutral';

export interface HourInfo {
  name: string;
  timeRange: string;
  canChi: CanChi;
  isAuspicious: boolean;
  score: number;
  khacDay?: string;
  nghi: string[];
  ky: string[];
  advancedInfo?: string[];
}

export interface DayCellData {
  solarDate: number;
  lunarDate: number | string;
  dayQuality: DayQuality;
  fullDate: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayChi?: Chi;
  personalScore?: PersonalDayScore;
}

export interface DayDetailsData {
  solarDate: string;
  dayOfWeek: string;
  lunarDate: LunarDate;
  buddhistYear: number;
  canChi: {
    year: CanChi;
    month: CanChi;
    day: CanChi;
  };
  startHour: CanChi;
  solarTerm: string;
  fiveElements: {
    napAm: string;
    napAmMonth: string;
    napAmYear: string;
    nguHanh: string;
  };
  truc: string;
  tu: string;
  year?: string;
  allHours: HourInfo[];
  auspiciousHours: HourInfo[];
  inauspiciousHours: HourInfo[];
  goodStars: string[];
  badStars: string[];
  fengShuiDirections: {
    hyThan: string;
    taiThan: string;
    hacThan: string;
  };
  dayGrade: string;
  deityStatus?: string;
  nguHanhGrade?: string;
  canChiInteractions: string[];
  nguHanhInteraction?: string;
  napAmInteraction?: string;
  canChiXungHop?: string;
  tietKhiDetail?: string;
  thangAmThieuDu?: string;
  advancedIndicators: string[];
  // New Hierarchical Engine Fields
  foundationalLayer: {
    baseScore: number;
    thanSat: StarData[];
    auspiciousDirections: { hyThan: string; taiThan: string; hacThan: string };
  };
  modifyingLayer: {
    stars: StarData[];
    trucDetail: { name: string; quality: string; description: string };
    tuDetail: { name: string; quality: string; description: string };
  };
  dungSu: {
    suitable: string[];
    unsuitable: string[];
    oracleSuitable?: string[];
    oracleUnsuitable?: string[];
    oracleGlobalVeto?: boolean;
  };
  banhTo: {
    can: string;
    chi: string;
  };
  yearlyStars?: Array<{ name: string; direction: string; directionDetail?: string; description: string; type: string }>;
  napAmCompatibility?: string;
  dayScore?: number;
  personalScore?: PersonalDayScore;
}

export interface StarCriteria {
  day_hour_chi?: Partial<Record<Chi, Chi>>;
  day_can?: Partial<Record<Can, Chi[] | Chi>>;
  month_can_chi?: Can[];
  day_chi_clash_year_chi?: boolean;
  day_chi_clash_month_chi?: boolean;
  year_chi?: Partial<Record<Chi, Chi>>;
  tuan_khong?: boolean;
  lunar_days?: number[];
  month_day_chi?: Record<string, Chi[] | Chi>;
  month_day_can?: Record<string, Can>;
  day_can_chi?: string[];
  season_day_can_chi?: Record<string, string>;
  month_can?: Record<string, Can[] | Can>;
  season_day_can?: Record<string, Can[] | Can>;
  season_day_chi?: Record<string, Chi[] | Chi>;
  sequence_days?: string[];
  solar_terms_eve?: string[];
  day_truc?: string[];
  month_group_day_chi?: Record<string, Chi>;
  lunar_month_day?: Record<string, number[] | number>;
  solar_terms_before?: string[];
}

export interface StarData {
  name: string;
  type?: 'Good' | 'Bad';
  description?: string;
  base_score?: number;
  weight?: number;
  criteria?: StarCriteria;
  suitable?: string[];
  unsuitable?: string[];
}

export interface ThoiThanData {
  hourly_stars: StarData[];
  deity_start_indices: Record<string, number>;
  path_deities: string[];
  hoang_dao_indices: number[];
  path_deity_meanings: Record<string, string>;
}

export interface DungSuData {
  truc_rules: Record<string, { nghi?: string[]; ky?: string[] }>;
  bach_ky_list: string[];
  sat_su_unsuitable: string[];
  major_hung_unsuitable: string[];
}

export interface StarWeight {
  name: string;
  weight: number;
}

export interface ActionWeight {
  [action: string]: {
    baseWeight: number;
    starMultipliers: { cat: number; hung: number };
  };
}

export interface NullifyRule {
  goodStar: string;
  badStar: string;
  ratio: number;
}

export interface ModifyingLayerResult {
  stars: StarData[];
  trucDetail: { name: string; quality: string; description: string };
  tuDetail: { name: string; quality: string; description: string };
}

export interface PersonalDayScore {
  actionScore: number;
  label: string;
  description: string;
  isThaiTue: boolean;
  isTamHop: boolean;
  isLucHop: boolean;
  isTuongXung: boolean;
  isTuongHai: boolean;
  isTuongHinh: boolean;
  isTuongPha: boolean;
}
