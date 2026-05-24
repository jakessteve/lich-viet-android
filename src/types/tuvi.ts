/**
 * Tử Vi Đẩu Số Type Definitions
 *
 * Comprehensive TypeScript types for the Tử Vi (Purple Star Astrology) engine.
 * Pure types — no UI or runtime imports.
 */

import type { Can, Chi } from './calendar';

// ── Core Enums & Base Types ─────────────────────────────────

/**
 * Brightness level of a star in a palace (Miếu = brightest, Hãm = dimmest).
 * Đắc is kept for legacy inputs; the traditional table uses Địa/Lợi/Bất too.
 */
export type BrightnessLevel = 'Miếu' | 'Vượng' | 'Đắc' | 'Địa' | 'Lợi' | 'Bình' | 'Bất' | 'Hãm';

/** Gender for Tử Vi calculation (affects palace direction and star placement) */
export type TuViGender = 'nam' | 'nữ';

/** Calculation school / phái used for star placement variants */
export type TuViSchool = 'nam-phai' | 'thien-luong' | 'bac-phai';

/** Supported engine generation for compatibility and audit metadata */
export type TuViEngineVersion = 'legacy-v3' | 'accuracy-v4';

/** Date input mode for chart construction */
export type TuViDateType = 'solar' | 'lunar';

/** Time handling policy used during birth normalization */
export type TuViTimePolicy = 'civil' | 'historical-vietnam' | 'true-solar';

/** Leap-month handling policy used by the school profile */
export type TuViLeapMonthPolicy = 'raw' | 'split-15';

/** Historical Vietnam timezone region hint */
export type HistoricalVietnamRegion = 'north' | 'south';

/** Engine audit metadata attached to a generated chart */
export interface TuViEngineMeta {
  /** Engine generation used to create the chart */
  version: TuViEngineVersion;
  /** Calculation school label */
  schoolLabel: string;
  /** Leap month policy applied */
  leapMonthPolicy: TuViLeapMonthPolicy;
  /** Time normalization policy applied */
  timePolicy: TuViTimePolicy;
  /** Historical Vietnam region used for pre-1975 normalization, if any */
  historicalRegion?: HistoricalVietnamRegion;
  /** Source references used to validate this chart */
  sources?: string[];
  /** Layered catalog summary used by the current engine */
  catalog?: TuViCatalogSummary;
  /** Non-fatal audit warnings captured during generation */
  warnings: string[];
}

/** One layer within the Tử Vi star catalog. */
export interface TuViCatalogLayerSummary {
  /** Stable layer identifier */
  id: 'core' | 'classical' | 'extended';
  /** Human-readable layer label */
  label: string;
  /** Number of modeled stars in this layer */
  count: number;
}

/** Summary of the layered star catalog. */
export interface TuViCatalogSummary {
  /** Total modeled stars in the current engine */
  total: number;
  /** Layer breakdown */
  layers: TuViCatalogLayerSummary[];
  /** Academic reference target derived from scholary sources */
  academicTargetTotal: number;
  /** Gap between the current catalog and the academic target */
  academicGap: number;
  /** Short note describing the reference basis */
  academicBasis: string;
}

/** Âm/Dương nature of the birth year (determined by year Can) */
export type AmDuong = 'Dương' | 'Âm';

/** Thuận/Nghịch palace direction based on gender and Âm/Dương */
export type ThuanNghich = 'Thuận' | 'Nghịch';

/** Tứ Hóa transformation types */
export type TuHoaType = 'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ';

/** Star category within a palace */
export type StarType = 'chinhTinh' | 'phuTinh' | 'satTinh' | 'tuHoa' | 'luuDieu';

/** Combination purity level */
export type CombinationPurity = 'thuần' | 'bán' | 'phá';

/** Combination auspiciousness category */
export type CombinationCategory = 'cat' | 'hung' | 'trung';

/** Mệnh-Cục elemental relation */
export type MenhCucRelationType = 'sinh' | 'khắc' | 'bình hòa';

// ── Hạn Context ────────────────────────────────────────────

/**
 * Active hạn view derived from the birth chart plus a selected calendar year/month.
 *
 * This is used for the "xem hạn" controls and for highlighting the palace that
 * corresponds to the currently viewed year.
 */
export interface TuViHanContext {
  /** Gregorian year currently being viewed */
  viewYear: number;
  /** Gregorian month currently being viewed, 1–12 */
  viewMonth: number;
  /** Nominal age used for the current view */
  viewAge: number;
  /** Palace index that contains the active Đại Hạn, if any */
  daiHanPalaceIndex: number | null;
  /** Palace label for the active Đại Hạn */
  daiHanPalaceName: string;
  /** Age range string for the active Đại Hạn */
  daiHanAgeRange: string;
  /** Palace index that contains the selected year's Tiểu Hạn */
  tieuHanPalaceIndex: number | null;
  /** Month number displayed in each palace for the selected year's Nguyệt Hạn map */
  nguyetHanMonthByPalace: Record<number, number>;
  /** Palace index that contains the selected month in the Nguyệt Hạn map */
  nguyetHanPalaceIndex: number | null;
}

// ── Input ───────────────────────────────────────────────────

export interface TuViBirthLocation {
  /** Human-readable location name from the picker */
  locationName: string;
  /** Latitude in decimal degrees */
  lat: number;
  /** Longitude in decimal degrees */
  lng: number;
  /** Estimated UTC offset for the birth location */
  timezone: number;
  /** ISO 3166-1 alpha-2 country code, when available */
  countryCode?: string;
  /** Human-readable country name, when available */
  countryName?: string;
  /** Optional historical region hint for Vietnam pre-1975 charts */
  historicalRegion?: HistoricalVietnamRegion;
}

/**
 * Birth data input for Tử Vi chart calculation.
 *
 * The `birthHour` uses the 12 Địa Chi indices:
 * 0 = Tý (23:00–01:00), 1 = Sửu (01:00–03:00), …, 11 = Hợi (21:00–23:00).
 */
export interface TuViInput {
  /** Optional name of the person */
  name?: string;
  /** Optional engine generation requested by the caller */
  engineVersion?: TuViEngineVersion;
  /** Input date mode used by a future lunar-input flow */
  dateType?: TuViDateType;
  /** Solar (Gregorian) birth date */
  solarDate: Date;
  /** Birth hour index: 0–11 (Tý through Hợi) */
  birthHour: number;
  /** Civil clock hour 0–23, used by the form/profile prefill before conversion to Chi hour */
  birthClockHour?: number;
  /** Civil birth minute 0–59 */
  birthMinute?: number;
  /** Gender — affects palace direction and some star placements */
  gender: TuViGender;
  /** IANA timezone identifier (default: 'Asia/Ho_Chi_Minh') */
  timezone: string;
  /** Optional birthplace used for display/export and later true-solar-time correction */
  birthLocation?: TuViBirthLocation;
  /** Leap month flag for lunar-input flows */
  isLeapMonth?: boolean;
  /** Time handling policy override */
  timePolicy?: TuViTimePolicy;
  /** Leap month handling policy override */
  leapMonthPolicy?: TuViLeapMonthPolicy;
  /** Calculation school variant for disputed placement and Tứ Hóa rules */
  school?: TuViSchool;
}

// ── Stars ───────────────────────────────────────────────────

/**
 * A single star placed inside a palace.
 *
 * `brightness` indicates how strongly the star expresses its nature
 * in this particular palace (Miếu = full power, Hãm = reversed).
 */
export interface TuViStar {
  /** Hán Việt name, e.g. "Tử Vi", "Thiên Cơ", "Vũ Khúc" */
  name: string;
  /** Category of the star */
  type: StarType;
  /** Ngũ Hành element, e.g. "Âm Thổ", "Dương Kim" */
  nguHanh: string;
  /** Brightness level in this palace */
  brightness: BrightnessLevel;
  /** If this star is a Tứ Hóa transformation, which type */
  tuHoaType?: TuHoaType;
}

/**
 * A Tứ Hóa (Four Transformation) entry.
 *
 * Tứ Hóa are derived from the year Can and indicate
 * dynamic changes (Lộc = wealth, Quyền = power, Khoa = fame, Kỵ = obstacle).
 */
export interface TuViTuHoa {
  /** Transformation type */
  type: TuHoaType;
  /** Name of the star that receives this transformation */
  starName: string;
  /** The year Thiên Can that triggered this Tứ Hóa */
  sourceCan: Can;
}

// ── Palace ──────────────────────────────────────────────────

/**
 * A single palace (Cung) in the 12-palace Tử Vi chart.
 *
 * The 12 palaces are arranged in a fixed Chi order counter-clockwise
 * starting from the palace containing Mệnh. Each palace holds
 * major stars (chính tinh), auxiliary stars (phụ tinh), malefic stars (sát tinh),
 * and Tứ Hóa markers.
 */
export interface TuViPalace {
  /** Palace index 0–11 (fixed Chi order: 0=Tý, 1=Sửu, …, 11=Hợi) */
  id: number;
  /** Địa Chi of this palace position */
  chi: Chi;
  /** Palace name, e.g. "Mệnh", "Huynh Đệ", "Phu Thê" */
  name: string;
  /** Hán tự name, e.g. "命宮", "兄弟宮" */
  nameHanViet: string;
  /** Thiên Can of this palace (derived from Mệnh palace Can) */
  can: Can;
  /** Combined Can-Chi string, e.g. "Giáp Dần" */
  canChi: string;
  /** Major stars (Chính Tinh) placed in this palace */
  chinhTinh: TuViStar[];
  /** Auxiliary stars (Phụ Tinh) placed in this palace */
  phuTinh: TuViStar[];
  /** Malefic stars (Sát Tinh) placed in this palace */
  satTinh: TuViStar[];
  /** Tứ Hóa transformations active in this palace */
  tuHoa: TuViTuHoa[];
  /** Formal 12-ring labels displayed in the palace footer */
  rings?: {
    truongSinh?: string;
    bacSi?: string;
    thaiTue?: string;
    tuongTinh?: string;
  };
  /** Brightness mapping for every star in this palace (star name → level) */
  brightness: Record<string, BrightnessLevel>;
  /** Đại Hạn age range, e.g. "22–31" */
  daiHanAgeRange: string;
  /** Whether this palace is the Mệnh palace */
  isMenh: boolean;
  /** Whether this palace is the Thân palace */
  isThan: boolean;
  /** Whether this palace falls under Tuần Không (旬空) */
  hasTuan: boolean;
  /** Whether this palace falls under Triệt Không (截空) */
  hasTriet: boolean;
}

// ── Combinations ────────────────────────────────────────────

/**
 * A detected named pattern (Cách/Cục) in the chart.
 *
 * Combinations are formed when specific stars appear together
 * in specific palaces, creating auspicious or inauspicious effects.
 */
export interface TuViCombination {
  /** Stable library identifier for the detected pattern */
  id?: string;
  /** Vietnamese name, e.g. "Sát Phá Lang", "Cơ Nguyệt Đồng Lương" */
  name: string;
  /** Hán tự name, e.g. "殺破狼", "機月同梁" */
  nameHanViet: string;
  /** Rarity score from 1 (common) to 5 (very rare) */
  rarity?: number;
  /** Star names involved in this combination */
  involvedStars: string[];
  /** Palace names involved in this combination */
  involvedCung: string[];
  /** Human-readable explanation of why this combination was detected */
  detectionReason: string;
  /** Purity: thuần (pure), bán (mixed), phá (broken) */
  purity: CombinationPurity;
  /** Strength score 1–10 */
  strength: number;
  /** Additional interpretive note */
  note: string;
  /** Auspiciousness category */
  category: CombinationCategory;
  /** Optional source key when the pattern is mirrored from a larger library */
  sourcePatternId?: string;
}

// ── Huyền Khí ───────────────────────────────────────────────

/**
 * Huyền Khí (Mysterious Energy) scoring for the entire chart.
 *
 * Each palace receives a score based on the brightness and
 * auspiciousness of its stars. The total determines the
 * overall grade of the chart.
 */
export interface TuViHuyenKhi {
  /** Total score across all 12 palaces */
  totalScore: number;
  /** Per-palace score (palace name → score) */
  palaceScores: Record<string, number>;
  /** Overall grade: "Thượng" (high), "Trung" (middle), "Hạ" (low) */
  grade: string;
}

// ── Mệnh-Cục Relation ─────────────────────────────────────

/**
 * Elemental relationship between Mệnh (Life) and Cục (Bureau).
 *
 * Mệnh is derived from the month and hour; Cục is derived from
 * the Mệnh palace's Can-Chi Nạp Âm. Their Ngũ Hành interaction
 * (sinh/khắc/bình hòa) is a key interpretive factor.
 */
export interface MenhCucRelation {
  /** Relation type */
  relation: MenhCucRelationType;
  /** Human-readable description, e.g. "Cục sinh Mệnh" */
  description: string;
  /** Ngũ Hành element of Mệnh */
  menhHanh: string;
  /** Ngũ Hành element of Cục */
  cucHanh: string;
}

// ── Center Info ─────────────────────────────────────────────

/**
 * Metadata displayed in the center panel of a Tử Vi chart.
 *
 * This is a summary of all fixed (non-palace) information
 * derived from the birth data.
 */
export interface TuViCenterInfo {
  /** Full name */
  hoTen: string;
  /** Gender label, e.g. "Nam" or "Nữ" */
  gioiTinh: string;
  /** Combined Âm/Dương + Gender label, e.g. "Dương Nam", "Âm Nữ" */
  amDuongLabel: string;
  /** Corrected solar date string (after timezone normalization) */
  duongLich: string;
  /** Birthplace used for the chart, if supplied */
  noiSinh?: string;
  /** Calculation school label used by this chart */
  schoolLabel: string;
  /** Lunar date string */
  amLich: string;
  /** Year Can-Chi string, e.g. "Giáp Thìn" */
  canChiYear: string;
  /** Month Can-Chi string, e.g. "Bính Dần" */
  canChiMonth: string;
  /** Day Can-Chi string, e.g. "Mậu Ngọ" */
  canChiDay: string;
  /** Hour Can-Chi string, e.g. "Canh Thìn" */
  canChiHour: string;
  /** Nạp Âm of the birth year, e.g. "Đại Hải Thủy" */
  menhNapAm: string;
  /** Cục name, e.g. "Thủy Nhị Cục" */
  cuc: string;
  /** Cục number 2–6 (derived from Nạp Âm element) */
  cucNumber: number;
  /** Sao Chủ Cục (star that governs the bureau) */
  saoChuCuc: string;
  /** Mệnh Chủ (Life Lord) */
  menhChu: string;
  /** Thân Chủ (Body Lord) */
  thanChu: string;
  /** Lai Nhân Cung (palace of origin/karma) */
  laiNhanCung: string;
  /** Nguyên Thần (original spirit) */
  nguyenThan: string;
  /** Which palace Mệnh resides in, e.g. "Mệnh cư Dần" */
  menhCung: string;
  /** Which palace Thân resides in, e.g. "Thân cư Thìn" */
  thanCung: string;
  /** Full Thân Cung label, e.g. "Thân cư Thiên Di" */
  thanCungLabel: string;
}

// ── Chart ───────────────────────────────────────────────────

/**
 * The complete Tử Vi chart output.
 *
 * This is the top-level result of a Tử Vi calculation,
 * containing all palaces, center metadata, combinations,
 * Huyền Khí scoring, and Mệnh-Cục relation.
 */
export interface TuViChart {
  /** Original input data */
  input: TuViInput;
  /** Audit metadata describing the engine and policies used */
  engineMeta?: TuViEngineMeta;
  /** Solar date after timezone normalization */
  correctedDate: Date;
  /** Lunar date breakdown */
  lunarDate: {
    day: number;
    month: number;
    year: number;
    isLeapMonth: boolean;
  };
  /** Can-Chi for year, month, day, and hour */
  canChi: {
    year: { can: Can; chi: Chi };
    month: { can: Can; chi: Chi };
    day: { can: Can; chi: Chi };
    hour: { can: Can; chi: Chi };
  };
  /** Âm/Dương nature of the birth year */
  amDuong: AmDuong;
  /** Palace direction: Thuận (clockwise) or Nghịch (counter-clockwise) */
  thuanNghich: ThuanNghich;
  /** Center panel metadata */
  centerInfo: TuViCenterInfo;
  /** All 12 palaces (fixed Chi order 0–11) */
  palaces: TuViPalace[];
  /** Detected named combinations */
  combinations: TuViCombination[];
  /** Huyền Khí scoring */
  huyenKhi: TuViHuyenKhi;
  /** Mệnh-Cục elemental relation */
  menhCucRelation: MenhCucRelation;
  /** Non-fatal generation warnings */
  auditWarnings?: string[];
  /** Active year/month hạn view */
  hanContext?: TuViHanContext;
}

// ── Export Options ──────────────────────────────────────────

/**
 * Options for exporting a Tử Vi chart to Markdown.
 */
export interface TuViMarkdownOptions {
  /** Include combination analysis (default: true) */
  includeCombinations: boolean;
  /** Include Huyền Khí scoring (default: true) */
  includeHuyenKhi: boolean;
  /** Include star brightness annotations (default: true) */
  includeBrightness: boolean;
  /** Optional header text prepended to the output */
  promptHeader: string;
}
