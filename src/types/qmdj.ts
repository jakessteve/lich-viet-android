/**
 * QMDJ Types — Kỳ Môn Độn Giáp Type Definitions
 */

import type { Can, Chi } from './calendar';

// ── Palace ──────────────────────────────────────────────────

export interface QmdjPalace {
  number: number; // 1-9 (Lạc Thư number)
  direction: string; // 'Bắc', 'Đông Bắc', etc.
  trigram: string; // 'Khảm', 'Cấn', 'Chấn', etc.
  element: string; // 'Thủy', 'Thổ', 'Mộc', etc.
  earthStem: Can | null; // Three Nobles / Six Nghi placed here
  heavenlyStem: Can | null; // Heaven plate stem at this palace
  star: QmdjStarInfo | null;
  door: QmdjDoorInfo | null;
  deity: QmdjDeityInfo | null;
}

// ── Components ──────────────────────────────────────────────

export interface QmdjDoorInfo {
  id: string;
  nameVi: string;
  element: string;
  auspiciousness: 'dai_cat' | 'cat' | 'trung_binh' | 'hung' | 'dai_hung';
  description: string;
}

export interface QmdjStarInfo {
  id: string;
  nameVi: string;
  element: string;
  auspiciousness: 'cat' | 'trung_binh' | 'hung';
  description: string;
}

export interface QmdjDeityInfo {
  id: string;
  nameVi: string;
  auspiciousness: 'dai_cat' | 'cat' | 'hung';
  description: string;
}

// ── Chart ───────────────────────────────────────────────────

export interface QmdjChart {
  date: string; // ISO date string
  hourChi: Chi; // Which 2-hour block
  hourCan: Can; // Hour's Heavenly Stem
  isDuongDon: boolean; // Yang (true) or Yin (false) Dun
  gameNumber: number; // Cục Số (1-9)
  solarTerm: string; // Current solar term
  yuan: 'upper' | 'middle' | 'lower';
  palaces: QmdjPalace[]; // 9 palaces (index 0 = palace 1, etc.)
  trucPhuStarId: string; // Which star is Trực Phù
  trucSuDoorId: string; // Which door is Trực Sử
  formations: QmdjFormationMatch[];
}

// ── Formations ──────────────────────────────────────────────

export interface QmdjFormationMatch {
  id: string;
  nameVi: string;
  nameCn: string;
  effect: 'dai_cat' | 'cat' | 'hung' | 'dai_hung';
  description: string;
  palaceNumber: number; // Which palace it was detected in
}

// ── Scoring ─────────────────────────────────────────────────

export interface QmdjActivityScore {
  score: number; // Raw score contribution
  detail: string; // Human-readable explanation
  doorName: string; // Which door governs this activity
  doorAuspiciousness: string;
  starBonus: number;
  deityBonus: number;
  formationBonus: number;
  bestDirection: string; // Direction advice
}
