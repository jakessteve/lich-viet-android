/**
 * Thái Ất Engine — Thái Ất Thần Số Chart Construction
 *
 * Implements the cosmic weather engine for yearly/monthly analysis
 * based on the 360-year Superior Epoch cycle.
 */

import type {
  ThaiAtChart,
  ThaiAtPalace,
  ThaiAtDeityPosition,
  HostGuestResult,
  ThaiAtMonthOverlay,
  CosmicForecast,
} from '../types/thaiAt';
import { getCanChiYear } from './calendarEngine';
import palacesData from '../data/thaiAt/thaiAtPalaces.json';
import deitiesData from '../data/thaiAt/thaiAtDeities.json';
import hexagramsData from '../data/thaiAt/thaiAtHexagrams.json';

// ── Constants ──────────────────────────────────────────────────

const PALACES = palacesData.palaces as ThaiAtPalace[];
const EPOCH_CONFIG = deitiesData.epochConfig;
const DEITIES = deitiesData.deities;
const PALACE_FORECASTS = hexagramsData.palaceForecasts as Record<
  string,
  { element: string; forecast: string; tone: string; detailedForecast?: string; monthlyHighlights?: string }
>;
const DOMINANCE_INTERP = hexagramsData.dominanceInterpretations;
const MONTHLY_MODS = hexagramsData.monthlyModifiers as Record<string, { shift: number; note: string }>;

// ── Ngũ Hành Palace Element Interactions ─────────────────────

type NguHanh = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
type ElementRelation = 'sinh' | 'khac' | 'bi_sinh' | 'bi_khac' | 'ty_hoa';

const NGU_HANH_SINH: Record<NguHanh, NguHanh> = {
  Mộc: 'Hỏa',
  Hỏa: 'Thổ',
  Thổ: 'Kim',
  Kim: 'Thủy',
  Thủy: 'Mộc',
};
const NGU_HANH_KHAC: Record<NguHanh, NguHanh> = {
  Mộc: 'Thổ',
  Thổ: 'Thủy',
  Thủy: 'Hỏa',
  Hỏa: 'Kim',
  Kim: 'Mộc',
};

function getElementRelation(source: NguHanh, target: NguHanh): ElementRelation {
  if (source === target) return 'ty_hoa';
  if (NGU_HANH_SINH[source] === target) return 'sinh';
  if (NGU_HANH_SINH[target] === source) return 'bi_sinh';
  if (NGU_HANH_KHAC[source] === target) return 'khac';
  return 'bi_khac';
}

const ELEMENT_RELATION_LABELS: Record<ElementRelation, string> = {
  sinh: 'Sinh (tương sinh)',
  khac: 'Khắc (tương khắc)',
  bi_sinh: 'Bị Sinh (được sinh)',
  bi_khac: 'Bị Khắc (bị khắc chế)',
  ty_hoa: 'Tỷ Hòa (cùng hành)',
};

/** Nạp Âm element by Heavenly Stem + Earthly Branch pair index. Authentic 30-pair mapping (Lục Thập Hoa Giáp). */
const NAP_AM_ELEMENTS: NguHanh[] = [
  'Kim', // 1. Giáp Tý - Ất Sửu (Hải Trung Kim)
  'Hỏa', // 2. Bính Dần - Đinh Mão (Lư Trung Hỏa)
  'Mộc', // 3. Mậu Thìn - Kỷ Tỵ (Đại Lâm Mộc)
  'Thổ', // 4. Canh Ngọ - Tân Mùi (Lộ Bàng Thổ)
  'Kim', // 5. Nhâm Thân - Quý Dậu (Kiếm Phong Kim)
  'Hỏa', // 6. Giáp Tuất - Ất Hợi (Sơn Đầu Hỏa)
  'Thủy', // 7. Bính Tý - Đinh Sửu (Giản Hạ Thủy)
  'Thổ', // 8. Mậu Dần - Kỷ Mão (Thành Đầu Thổ)
  'Kim', // 9. Canh Thìn - Tân Tỵ (Bạch Lạp Kim)
  'Mộc', // 10. Nhâm Ngọ - Quý Mùi (Dương Liễu Mộc)
  'Thủy', // 11. Giáp Thân - Ất Dậu (Tuyền Trung Thủy)
  'Thổ', // 12. Bính Tuất - Đinh Hợi (Ốc Thượng Thổ)
  'Hỏa', // 13. Mậu Tý - Kỷ Sửu (Tích Lịch Hỏa)
  'Mộc', // 14. Canh Dần - Tân Mão (Tùng Bách Mộc)
  'Thủy', // 15. Nhâm Thìn - Quý Tỵ (Trường Lưu Thủy)
  'Kim', // 16. Giáp Ngọ - Ất Mùi (Sa Trung Kim)
  'Hỏa', // 17. Bính Thân - Đinh Dậu (Sơn Hạ Hỏa)
  'Mộc', // 18. Mậu Tuất - Kỷ Hợi (Bình Địa Mộc)
  'Thổ', // 19. Canh Tý - Tân Sửu (Bích Thượng Thổ)
  'Kim', // 20. Nhâm Dần - Quý Mão (Kim Bạch Kim)
  'Hỏa', // 21. Giáp Thìn - Ất Tỵ (Phúc Đăng Hỏa)
  'Thủy', // 22. Bính Ngọ - Đinh Mùi (Thiên Hà Thủy)
  'Thổ', // 23. Mậu Thân - Kỷ Dậu (Đại Trạch Thổ)
  'Kim', // 24. Canh Tuất - Tân Hợi (Thoa Xuyến Kim)
  'Mộc', // 25. Nhâm Tý - Quý Sửu (Tang Đố Mộc)
  'Thủy', // 26. Giáp Dần - Ất Mão (Đại Khê Thủy)
  'Thổ', // 27. Bính Thìn - Đinh Tỵ (Sa Trung Thổ)
  'Hỏa', // 28. Mậu Ngọ - Kỷ Mùi (Thiên Thượng Hỏa)
  'Mộc', // 29. Canh Thân - Tân Dậu (Thạch Lựu Mộc)
  'Thủy', // 30. Nhâm Tuất - Quý Hợi (Đại Hải Thủy)
];

function getYearNapAmElement(lunarYear: number): NguHanh {
  const idx = (((lunarYear - 4) % 60) + 60) % 60;
  return NAP_AM_ELEMENTS[Math.floor(idx / 2)];
}

export interface PalaceElementAnalysis {
  palaceElement: string;
  yearElement: string;
  relation: ElementRelation;
  relationLabel: string;
  score: number; // -2 to +2
  interpretation: string;
}

function analyzePalaceElement(palaceElement: string, lunarYear: number): PalaceElementAnalysis {
  const yearElement = getYearNapAmElement(lunarYear);
  const relation = getElementRelation(palaceElement as NguHanh, yearElement);
  const score =
    relation === 'sinh' ? 2 : relation === 'bi_sinh' ? 1 : relation === 'ty_hoa' ? 0 : relation === 'bi_khac' ? -1 : -2;

  const interpretations: Record<ElementRelation, string> = {
    sinh: `Cung (${palaceElement}) sinh năm (${yearElement}) — Năng lượng vũ trụ hỗ trợ, thuận lợi cho phát triển.`,
    bi_sinh: `Năm (${yearElement}) sinh Cung (${palaceElement}) — Năm cung cấp tài nguyên, thời cơ tự đến.`,
    ty_hoa: `Cung (${palaceElement}) hòa năm (${yearElement}) — Cân bằng, ổn định. Duy trì hiện trạng tốt.`,
    khac: `Cung (${palaceElement}) khắc năm (${yearElement}) — Áp lực biến đổi, cần nỗ lực vượt qua thử thách.`,
    bi_khac: `Năm (${yearElement}) khắc Cung (${palaceElement}) — Bị kiềm chế từ bên ngoài, cẩn thận hành động.`,
  };

  return {
    palaceElement,
    yearElement,
    relation,
    relationLabel: ELEMENT_RELATION_LABELS[relation],
    score,
    interpretation: interpretations[relation],
  };
}

// ── Epoch Calculations ─────────────────────────────────────────

/**
 * Calculate position within the 360-year Superior Epoch.
 */
function getEpochPosition(lunarYear: number) {
  const yearsSinceRef = lunarYear - EPOCH_CONFIG.referenceEpochStart;
  const superiorEpochYear =
    (((yearsSinceRef % EPOCH_CONFIG.superiorEpochYears) + EPOCH_CONFIG.superiorEpochYears) %
      EPOCH_CONFIG.superiorEpochYears) +
    1;
  const cycleNumber = Math.floor((superiorEpochYear - 1) / EPOCH_CONFIG.cycleYears) + 1;
  const cycleYear = ((superiorEpochYear - 1) % EPOCH_CONFIG.cycleYears) + 1;
  const subCycleYear = ((cycleYear - 1) % EPOCH_CONFIG.subCycleYears) + 1;

  return { superiorEpochYear, cycleNumber, cycleYear, subCycleYear };
}

/**
 * Heuristic palace mapping for the current Thái Ất board.
 * The current data set exposes forecasts and deity placement, but not a
 * canonical classical palace table.
 */
function getThaiAtPalaceNumberHeuristic(epochPosition: ReturnType<typeof getEpochPosition>): number {
  const palaceIndex = (epochPosition.cycleYear - 1) % 16;
  return palaceIndex + 1;
}

// ── Host / Guest / Fixed ─────────────────────────────────────

/**
 * Derive Host Count (Chủ Toán), Guest Count (Khách Toán), and Fixed Count (Định Toán).
 * This remains a modular heuristic model, separate from the table-driven
 * palace/forecast data used elsewhere in the engine.
 */
function calculateHostGuestHeuristic(lunarYear: number, palaceNumber: number): HostGuestResult {
  const branchIndex = (((lunarYear - 4) % 12) + 12) % 12;
  const stemIndex = (((lunarYear - 4) % 10) + 10) % 10;
  const sexagenaryIndex = (((lunarYear - 4) % 60) + 60) % 60;

  // Host Count (Chủ Toán): branch-based with palace modulation
  const hostBase = (branchIndex + 1) * 4 + palaceNumber;
  const hostCount = hostBase + (lunarYear % 7);

  // Guest Count (Khách Toán): stem-based with inverse palace factor
  const guestBase = (stemIndex + 1) * 3 + (16 - palaceNumber);
  const guestCount = guestBase + (lunarYear % 5);

  // Fixed Count (Định Toán): sexagenary cycle midpoint with palace modulus
  const fixedCount = Math.floor(sexagenaryIndex / 4) + palaceNumber + (lunarYear % 3);

  // Dominance from Host vs Guest differential
  const differential = hostCount - guestCount;
  let dominance: HostGuestResult['dominance'];
  if (differential > 5) {
    dominance = 'hostDominant';
  } else if (differential < -5) {
    dominance = 'guestDominant';
  } else {
    dominance = 'balanced';
  }

  const interp = DOMINANCE_INTERP[dominance];

  return {
    hostCount,
    guestCount,
    fixedCount,
    dominance,
    dominanceLabel: interp.label,
    dominanceSummary: interp.summary,
    dominanceAdvice: interp.advice,
    detailedAnalysis: interp.detailedAnalysis,
    careerAdvice: interp.careerAdvice,
    personalAdvice: interp.personalAdvice,
    disclaimer: 'Chủ/Khách/Định Toán là mô hình heuristic, chưa phải bản đối chiếu cổ điển hoàn chỉnh.',
  };
}

// ── Deity Placement ────────────────────────────────────────────

function placeDeities(thaiAtPalace: number): ThaiAtDeityPosition[] {
  return DEITIES.map((deity) => {
    let palace: number;

    switch (deity.id) {
      case 'thaiAt':
        palace = thaiAtPalace;
        break;
      case 'vanXuong':
        palace = ((thaiAtPalace - 1 + 2) % 16) + 1;
        break;
      case 'thiKich':
        palace = ((thaiAtPalace - 1 + 8) % 16) + 1; // Opposite
        break;
      case 'keThan':
        palace = ((thaiAtPalace - 1 + 11) % 16) + 1;
        break;
      case 'thaiAm':
        palace = ((thaiAtPalace - 1 + 3) % 16) + 1;
        break;
      default:
        palace = thaiAtPalace;
    }

    return {
      id: deity.id,
      nameVi: deity.nameVi,
      palace,
      nature: deity.nature as ThaiAtDeityPosition['nature'],
      role: deity.role,
      personality: deity.personality,
      influenceWhenStrong: deity.influenceWhenStrong,
      influenceWhenWeak: deity.influenceWhenWeak,
    };
  });
}

// ── Main Chart Generation ──────────────────────────────────────

/**
 * Generate a full Thái Ất chart for a given lunar year.
 */
export function getThaiAtYearChart(lunarYear: number): ThaiAtChart {
  const epochPosition = getEpochPosition(lunarYear);
  const thaiAtPalace = getThaiAtPalaceNumberHeuristic(epochPosition);
  const thaiAtPalaceInfo = PALACES.find((p) => p.number === thaiAtPalace) || PALACES[0];
  const deityPositions = placeDeities(thaiAtPalace);
  const hostGuest = calculateHostGuestHeuristic(lunarYear, thaiAtPalace);

  const palaceForecast = PALACE_FORECASTS[thaiAtPalace.toString()];
  const canChiYear = getCanChiYear(lunarYear);

  // Palace element interaction analysis
  const activeElement = palaceForecast?.element || thaiAtPalaceInfo.element;
  const palaceElementAnalysis = analyzePalaceElement(activeElement, lunarYear);

  return {
    lunarYear,
    canChiYear,
    thaiAtPalace,
    thaiAtPalaceInfo,
    deityPositions,
    hostGuest,
    epochPosition,
    forecast: palaceForecast?.forecast || 'Không có dữ liệu dự báo',
    forecastTone: (palaceForecast?.tone || 'neutral') as ThaiAtChart['forecastTone'],
    element: activeElement,
    detailedForecast: palaceForecast?.detailedForecast,
    monthlyHighlights: palaceForecast?.monthlyHighlights,
    palaceElementAnalysis,
  };
}

/**
 * Get monthly overlay within the year.
 * @param lunarYear  - Lunar year from getLunarDate
 * @param lunarMonth - Lunar month (1–12), distinct from Tiết Khí solar month
 * @param isLeap     - Whether this is a leap month; leap months use a different
 *                    modifier key so they get distinct overlays from their parent month
 */
export function getThaiAtMonthOverlay(lunarYear: number, lunarMonth: number, isLeap?: boolean): ThaiAtMonthOverlay {
  const yearChart = getThaiAtYearChart(lunarYear);
  // Leap months are keyed with a "L" suffix so they remain distinct from
  // their regular counterpart in MONTHLY_MODS (e.g. "5L" for leap month 5).
  const monthKey = isLeap ? `${lunarMonth}L` : lunarMonth.toString();
  const monthMod = MONTHLY_MODS[monthKey] ?? MONTHLY_MODS[lunarMonth.toString()];

  const adjustedPalace = Math.max(
    1,
    Math.min(16, ((yearChart.thaiAtPalace - 1 + (monthMod?.shift || 0) + 16) % 16) + 1),
  );

  const adjustedForecast = PALACE_FORECASTS[adjustedPalace.toString()];

  return {
    lunarMonth,
    adjustedPalace,
    shiftNote: monthMod?.note || '',
    monthlyForecast: adjustedForecast?.forecast || yearChart.forecast,
    monthNote: monthMod?.note,
  };
}

/**
 * Get a one-line cosmic forecast for the Landing Page widget.
 */
export function getCosmicForecast(lunarYear: number): CosmicForecast {
  const chart = getThaiAtYearChart(lunarYear);
  const canChiYear = chart.canChiYear;

  // Build a compact one-liner
  const elementLabel = chart.element;
  const toneEmoji = chart.forecastTone === 'optimistic' ? '🌟' : chart.forecastTone === 'cautious' ? '⚠️' : '☯️';
  const oneLiner = `${toneEmoji} Năm ${canChiYear} (${lunarYear}): ${elementLabel} — ${chart.forecast}`;

  return {
    year: lunarYear,
    canChiYear,
    oneLiner,
    tone: chart.forecastTone,
    element: chart.element,
    palaceName: chart.thaiAtPalaceInfo.nameVi,
    hostGuestLabel: chart.hostGuest.dominanceLabel,
  };
}
