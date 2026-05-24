/**
 * Lục Nhâm Types — Đại Lục Nhâm Type Definitions
 */

// ── Branch ──────────────────────────────────────────────────

export type BranchId = 'ti' | 'suu' | 'dan' | 'mao' | 'thin' | 'ty' | 'ngo' | 'mui' | 'than' | 'dau' | 'tuat' | 'hoi';

// ── Thiên Tướng (Celestial General) ─────────────────────────

export interface ThienTuong {
  id: string;
  nameVi: string;
  nameCn: string;
  branch: BranchId;
  element: string;
  nature: 'cat' | 'hung';
  domain: string;
  icon: string;
}

// ── Nguyệt Tướng (Monthly General) ─────────────────────────

export interface NguyetTuong {
  branch: BranchId;
  branchName: string;
  solarLongitudeRange: string;
}

// ── Board Position ──────────────────────────────────────────

export interface BoardPosition {
  diaBan: BranchId; // Fixed Earthly Branch
  tianBan: BranchId; // Rotated Heavenly Branch
  thienTuong: ThienTuong | null; // Celestial General at this position
  diaBanName: string;
  tianBanName: string;
}

// ── Tứ Khóa (Four Lessons) ─────────────────────────────────

export interface TuKhoaLesson {
  index: number; // 1-4
  upperStem: string; // Thượng (top)
  lowerBranch: string; // Hạ (bottom)
  relationship: string; // Ngũ Hành relationship label (Sinh/Khắc/Bị Sinh/Bị Khắc/Tỷ Hòa)
  /** L1: Ngũ Hành element of the upper (Thiên Bàn) branch */
  upperElement?: string;
  /** L1: Ngũ Hành element of the lower (Địa Bàn) branch */
  lowerElement?: string;
  /** L1: Element interaction type */
  elementRelation?: string;
  /** L2: Lục Thân classification relative to Day Stem */
  lucThan?: string;
  /** L2: Vietnamese label for Lục Thân */
  lucThanLabel?: string;
  /** L3: Thần Sát markers affecting this lesson */
  thanSat?: Array<{ id: string; nameVi: string; nature: 'cat' | 'hung'; description: string }>;
}

export interface TuKhoa {
  lessons: TuKhoaLesson[];
}

// ── Tam Truyền (Three Transmissions) ────────────────────────

export interface TamTruyenStep {
  index: number; // 1=Sơ, 2=Trung, 3=Mạt
  label: string; // "Sơ Truyền" / "Trung Truyền" / "Mạt Truyền"
  branch: BranchId;
  branchName: string;
  thienTuong: ThienTuong | null;
  interpretation: string;
}

export interface TamTruyen {
  steps: TamTruyenStep[];
}

// ── Course Type (Khóa Thức) ─────────────────────────────────

export interface KhoaThuc {
  id: string;
  nameVi: string;
  nameCn: string;
  meaning: string;
  nature: 'cat' | 'hung' | 'trung_binh';
  advice: string;
}

// ── Verdict ─────────────────────────────────────────────────

export type VerdictLevel = 'daiCat' | 'cat' | 'trungBinh' | 'hung' | 'daiHung';

export interface Verdict {
  level: VerdictLevel;
  label: string;
  description: string;
  score: number;
}

// ── Full Chart ──────────────────────────────────────────────

export interface LucNhamChart {
  date: Date;
  hourBranch: BranchId;
  hourBranchName: string;
  dayStem: string;
  dayBranch: string;
  nguyetTuong: NguyetTuong;
  board: BoardPosition[]; // 12 positions
  tuKhoa: TuKhoa;
  tamTruyen: TamTruyen;
  khoaThuc: KhoaThuc;
  verdict: Verdict;
  /** L3: Aggregated Thần Sát markers across all lessons */
  thanSat?: Array<{ id: string; nameVi: string; nature: 'cat' | 'hung'; description: string }>;
}

// ── Interpretation ──────────────────────────────────────────

export type InterpretationCategory = 'general' | 'career' | 'love' | 'health' | 'travel' | 'finance';

export interface CategoryInterpretation {
  category: InterpretationCategory;
  label: string;
  icon: string;
  advice: string;
}

export interface FullInterpretation {
  chart: LucNhamChart;
  categoryAdvice: CategoryInterpretation[];
  summary: string;
}
