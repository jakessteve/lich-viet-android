/**
 * Activity Scorer — Composite Auspiciousness Scoring
 * Combines 6 factors to produce a 0-100% score for a specific activity
 * on a given date and optional hour.
 */

import { DayDetailsData, HourInfo } from '../types/calendar';
import { ACTIVITY_CATALOG, ActivityEntry, getActivityById, mapDungSuToActivityIds } from './activityCatalog';
import { CHI_XUNG, LUC_HOP, TAM_HOP, CHI_HINH, CHI_HAI, CHI_PHA } from './constants';
import type { Chi } from '../types/calendar';
import {
  TRUC_SCORING,
  STAR_SCORING,
  DAY_GRADE_SCORING,
  HOUR_SCORING,
  KI_TUOI_SCORING,
  NAP_AM_SCORING,
  QMDJ_SCORING,
  NORMALIZATION,
  OVERRIDES,
  CLASSICAL_AUSPICIOUSNESS,
  BEST_HOURS_SCORING,
  FALLBACK_SCORE,
} from '../config/scoring';
import { generateQmdjChart } from './qmdjEngine';
import { scoreActivityByQmdj } from './qmdjScorer';
import { getScoreLabelFromConfig, FALLBACK_COLOR_CLASS } from '../config/theme';
import { getThaiAtYearChart } from './thaiAtEngine';

// ── Types ─────────────────────────────────────────────────────

export interface ScoreBreakdownItem {
  factor: string;
  label: string;
  value: number; // raw contribution (-50 to +50)
  maxValue: number; // maximum possible contribution
  positive: boolean;
  detail: string;
}

export interface ActivityScoreResult {
  percentage: number; // 0-100
  label: string; // Đại Cát, Tốt, Trung Bình, Không Tốt, Đại Kỵ
  colorClass: string; // Tailwind class for the label color
  breakdown: ScoreBreakdownItem[];
  bestHours: HourScoreEntry[]; // Top 3 best hours
  isBachSuHung: boolean; // Special override flag
}

export interface ActivityScoringOptions {
  /**
   * When enabled, QMDJ and Thái Ất contribute to the activity score.
   * Defaults to `false` so the base trạch nhật percentage stays closer
   * to the classical day-selection layers.
   */
  includeAdvanced?: boolean;
}

export interface HourScoreEntry {
  hourInfo: HourInfo;
  activityScore: number; // 0-100 for this specific activity
}

// ── Label Mapping ─────────────────────────────────────────────

function getScoreLabel(pct: number): { label: string; colorClass: string } {
  return getScoreLabelFromConfig(pct);
}

// ── Alias Matching Helpers ────────────────────────────────────

/** Pre-compute a lowercase Set from a list of strings for O(1)-ish matching. */
function buildLowerSet(list: string[]): Set<string> {
  return new Set(list.map((s) => s.toLowerCase()));
}

/** Check if an activity nameVi or alias appears in a pre-computed lowercase Set. */
function activityInSet(activity: ActivityEntry, lowerSet: Set<string>): boolean {
  const nameLC = activity.nameVi.toLowerCase();
  for (const s of lowerSet) {
    if (s.includes(nameLC)) return true;
  }
  for (const alias of activity.aliases) {
    const aliasLC = alias.toLowerCase();
    for (const s of lowerSet) {
      if (s.includes(aliasLC) || aliasLC.includes(s)) return true;
    }
  }
  return false;
}

/** Count how many stars favor/oppose an activity via their suitable/unsuitable fields. */
function countStarMatches(
  activity: ActivityEntry,
  stars: Array<{ name: string; type?: string; suitable?: string[]; unsuitable?: string[] }>,
): { favorable: number; opposing: number } {
  let favorable = 0;
  let opposing = 0;

  for (const star of stars) {
    if (star.suitable) {
      const suitSet = buildLowerSet(star.suitable);
      if (activityInSet(activity, suitSet)) favorable++;
    }
    if (star.unsuitable) {
      const unsuitSet = buildLowerSet(star.unsuitable);
      if (activityInSet(activity, unsuitSet)) opposing++;
    }
  }

  return { favorable, opposing };
}

// ── Main Scoring Function ─────────────────────────────────────

/**
 * Score a specific activity on a given date/time.
 *
 * @param activityId - ID from the activity catalog
 * @param dayData - Pre-computed DayDetailsData from calendarEngine
 * @param selectedHourChi - Optional hour Chi (Tý, Sửu, ...) for hour-specific scoring
 * @param birthYearChi - Optional user's birth year Chi for Kị Tuổi check
 */
export function scoreActivity(
  activityId: string,
  dayData: DayDetailsData,
  selectedHourChi?: Chi,
  birthYearChi?: Chi,
  options: ActivityScoringOptions = {},
): ActivityScoreResult {
  const activity = getActivityById(activityId);
  if (!activity) {
    return {
      percentage: FALLBACK_SCORE.percentage,
      label: FALLBACK_SCORE.label,
      colorClass: FALLBACK_COLOR_CLASS,
      breakdown: [],
      bestHours: [],
      isBachSuHung: false,
    };
  }

  const breakdown: ScoreBreakdownItem[] = [];
  let totalScore = 0;
  const includeAdvanced = options.includeAdvanced ?? false;

  // Pre-compute lowercase Sets for dụng sự lists (used by Factors 1 & 2)
  const nghiSet = buildLowerSet(dayData.dungSu.suitable);
  const kySet = buildLowerSet(dayData.dungSu.unsuitable);
  const { suitableIds, unsuitableIds } = mapDungSuToActivityIds(dayData.dungSu.suitable, dayData.dungSu.unsuitable);
  const {
    suitableIds: oracleSuitableIds,
    unsuitableIds: oracleUnsuitableIds,
  } = mapDungSuToActivityIds(dayData.dungSu.oracleSuitable || [], dayData.dungSu.oracleUnsuitable || []);
  const hasOracleSupport = oracleSuitableIds.has(activityId);
  const hasOracleBlock = oracleUnsuitableIds.has(activityId);
  const hasOracleSignal = hasOracleSupport || hasOracleBlock;
  const directSuitableOnly = suitableIds.has(activityId) && !unsuitableIds.has(activityId);
  const directUnsuitableOnly = unsuitableIds.has(activityId) && !suitableIds.has(activityId);
  const directMixed = suitableIds.has(activityId) && unsuitableIds.has(activityId);

  // ── Check Bách Sự Hung override ──
  const isBachSuHung = dayData.dungSu.unsuitable.some(
    (s) => s.toLowerCase().includes('bách sự hung') || s.toLowerCase().includes('cực kỳ xấu cho mọi việc'),
  );
  const isOracleGlobalVeto = dayData.dungSu.oracleGlobalVeto ?? false;
  const isSevereDay = dayData.dayGrade === 'Đại Kỵ';
  const isDirectSupport = hasOracleSupport || (!hasOracleSignal && directSuitableOnly);
  const isDirectBlock = hasOracleBlock || (!hasOracleSignal && (directUnsuitableOnly || directMixed));
  const isMixedSignal = hasOracleSignal ? false : directMixed;
  const isBachSuHungVeto = isBachSuHung && !isDirectSupport;

  // ── Factor 1: Trực Match ──
  const inNghi = isDirectSupport || (!isDirectBlock && activityInSet(activity, nghiSet));
  const inKy = isDirectBlock || (!isDirectSupport && activityInSet(activity, kySet));
  let trucScore: number;
  let trucDetail: string;
  if (inNghi && !inKy) {
    trucScore = TRUC_SCORING.nghi;
    trucDetail = `${dayData.modifyingLayer.trucDetail.name}: Nên làm ✅`;
  } else if (inKy && !inNghi) {
    trucScore = TRUC_SCORING.ky;
    trucDetail = `${dayData.modifyingLayer.trucDetail.name}: Kiêng cữ ❌`;
  } else if (inNghi && inKy) {
    trucScore = TRUC_SCORING.both;
    trucDetail = `${dayData.modifyingLayer.trucDetail.name}: Nên làm nhưng có hạn chế ⚠️`;
  } else {
    trucScore = TRUC_SCORING.neutral;
    trucDetail = `${dayData.modifyingLayer.trucDetail.name}: Không ảnh hưởng`;
  }
  breakdown.push({
    factor: 'truc',
    label: 'Trực ngày',
    value: trucScore,
    maxValue: TRUC_SCORING.max,
    positive: trucScore > 0,
    detail: trucDetail,
  });
  totalScore += trucScore;

  // ── Factor 2: Star Alignment ──
  const allStars = dayData.modifyingLayer.stars;
  const { favorable, opposing } = countStarMatches(activity, allStars);
  const starScore = Math.min(
    STAR_SCORING.max,
    favorable * STAR_SCORING.favorableWeight + opposing * STAR_SCORING.opposingWeight,
  );
  const starDetail = `${favorable} sao tốt, ${opposing} sao xấu ảnh hưởng`;
  breakdown.push({
    factor: 'stars',
    label: 'Sao chiếu',
    value: starScore,
    maxValue: STAR_SCORING.max,
    positive: starScore > 0,
    detail: starDetail,
  });
  totalScore += starScore;

  // ── Factor 3: Day Grade ──
  let dayGradeScore = 0;
  let dayGradeDetail: string;
  const isHoangDao = dayData.deityStatus?.includes('Hoàng');
  if (isHoangDao) {
    dayGradeScore += DAY_GRADE_SCORING.hoangDaoBonus;
  }
  // Ngũ Hành grade bonus
  const grade = dayData.nguHanhGrade;
  if (grade === 'Chuyên nhật' || grade === 'Nghĩa nhật') {
    dayGradeScore += DAY_GRADE_SCORING.chuyenNghiaNhatBonus;
    dayGradeDetail = `${isHoangDao ? 'Hoàng Đạo' : 'Hắc Đạo'} + ${grade}`;
  } else if (grade === 'Bảo nhật') {
    dayGradeScore += DAY_GRADE_SCORING.baoNhatBonus;
    dayGradeDetail = `${isHoangDao ? 'Hoàng Đạo' : 'Hắc Đạo'} + ${grade}`;
  } else if (grade === 'Phạt nhật') {
    dayGradeScore += DAY_GRADE_SCORING.phatNhatPenalty;
    dayGradeDetail = `${isHoangDao ? 'Hoàng Đạo' : 'Hắc Đạo'} + ${grade} ⚠️`;
  } else {
    dayGradeDetail = `${isHoangDao ? 'Hoàng Đạo' : 'Hắc Đạo'}${grade ? ' + ' + grade : ''}`;
  }
  breakdown.push({
    factor: 'dayGrade',
    label: 'Chất lượng ngày',
    value: dayGradeScore,
    maxValue: DAY_GRADE_SCORING.max,
    positive: dayGradeScore > 0,
    detail: dayGradeDetail,
  });
  totalScore += dayGradeScore;

  // ── Factor 4: Hour Quality ──
  let hourScore = 0;
  let hourDetail = 'Chưa chọn giờ';
  if (selectedHourChi) {
    const hourInfo = dayData.allHours.find((h) => h.canChi.chi === selectedHourChi);
    if (hourInfo) {
      // Normalize hour score (0-100) to our scale
      hourScore = Math.round(((hourInfo.score - HOUR_SCORING.normBase) / HOUR_SCORING.normScale) * HOUR_SCORING.max);
      hourScore = Math.max(-HOUR_SCORING.max, Math.min(HOUR_SCORING.max, hourScore));
      const hourLabel = hourInfo.isAuspicious ? 'Hoàng Đạo' : 'Hắc Đạo';
      hourDetail = `Giờ ${hourInfo.canChi.can} ${hourInfo.canChi.chi} (${hourLabel}, ${hourInfo.score}%)`;
    }
  }
  breakdown.push({
    factor: 'hour',
    label: 'Giờ',
    value: hourScore,
    maxValue: HOUR_SCORING.max,
    positive: hourScore > 0,
    detail: hourDetail,
  });
  totalScore += hourScore;

  // ── Factor 5: Kị Tuổi ──
  // Enriched: checks Lục Hợp, Tam Hợp, neutral, Tam Hình, Lục Hại, Phá, and Xung
  let kiTuoiScore = 0;
  let kiTuoiDetail = 'Chưa nhập tuổi';
  if (birthYearChi) {
    const dayChi = dayData.canChi.day.chi;
    // Check from best to worst
    if (LUC_HOP[dayChi as Chi] === birthYearChi) {
      kiTuoiScore = KI_TUOI_SCORING.lucHop;
      kiTuoiDetail = `Tuổi ${birthYearChi} lục hợp ngày ${dayChi} — Rất tốt ✨`;
    } else if (TAM_HOP[dayChi as Chi]?.includes(birthYearChi)) {
      kiTuoiScore = KI_TUOI_SCORING.tamHop;
      kiTuoiDetail = `Tuổi ${birthYearChi} tam hợp ngày ${dayChi} — Tốt ✅`;
    } else if (CHI_XUNG[dayChi as Chi] === birthYearChi) {
      kiTuoiScore = KI_TUOI_SCORING.xung;
      kiTuoiDetail = `Tuổi ${birthYearChi} xung ngày ${dayChi} — Rất xấu ❌`;
    } else if (CHI_HAI[dayChi as Chi] === birthYearChi) {
      kiTuoiScore = KI_TUOI_SCORING.hai;
      kiTuoiDetail = `Tuổi ${birthYearChi} lục hại ngày ${dayChi} — Xấu ⚠️`;
    } else if (CHI_HINH[dayChi as Chi]?.includes(birthYearChi)) {
      kiTuoiScore = KI_TUOI_SCORING.hinh;
      kiTuoiDetail = `Tuổi ${birthYearChi} hình ngày ${dayChi} — Không tốt ⚠️`;
    } else if (CHI_PHA[dayChi as Chi] === birthYearChi) {
      kiTuoiScore = KI_TUOI_SCORING.pha;
      kiTuoiDetail = `Tuổi ${birthYearChi} phá ngày ${dayChi} — Không tốt ⚠️`;
    } else {
      kiTuoiScore = KI_TUOI_SCORING.neutral;
      kiTuoiDetail = `Tuổi ${birthYearChi} bình hòa với ngày ${dayChi}`;
    }
  }
  breakdown.push({
    factor: 'kiTuoi',
    label: 'Kị tuổi',
    value: kiTuoiScore,
    maxValue: KI_TUOI_SCORING.max,
    positive: kiTuoiScore >= 0,
    detail: kiTuoiDetail,
  });
  totalScore += kiTuoiScore;

  // ── Factor 6: Nạp Âm Compatibility ──
  let napAmScore: number;
  let napAmDetail: string;
  const napAmCompat = dayData.napAmCompatibility || '';
  if (napAmCompat.includes('Hợp')) {
    napAmScore = NAP_AM_SCORING.hop;
    napAmDetail = 'Nạp Âm ngày hợp năm ✅';
  } else if (napAmCompat.includes('Khắc')) {
    napAmScore = NAP_AM_SCORING.khac;
    napAmDetail = 'Nạp Âm ngày khắc năm ❌';
  } else {
    napAmScore = NAP_AM_SCORING.neutral;
    napAmDetail = 'Nạp Âm bình hòa';
  }
  breakdown.push({
    factor: 'napAm',
    label: 'Nạp Âm',
    value: napAmScore,
    maxValue: NAP_AM_SCORING.max,
    positive: napAmScore >= 0,
    detail: napAmDetail,
  });
  totalScore += napAmScore;

  // ── Factor 7: QMDJ (Kỳ Môn Độn Giáp) ──
  let qmdjScore = 0;
  let qmdjDetail: string;
  if (includeAdvanced) {
    try {
      const qmdjHourChi = selectedHourChi || 'Tý';
      const dateObj = new Date(dayData.solarDate);
      const chart = generateQmdjChart(dateObj, qmdjHourChi);
      const qmdjResult = scoreActivityByQmdj(activityId, chart);
      qmdjScore = Math.max(
        -QMDJ_SCORING.max,
        Math.min(QMDJ_SCORING.max, Math.round(qmdjResult.score * QMDJ_SCORING.weight)),
      );
      qmdjDetail = qmdjResult.detail;
    } catch {
      qmdjDetail = 'Chưa tính Kỳ Môn';
    }
  } else {
    qmdjDetail = 'Tắt chế độ nâng cao';
  }
  breakdown.push({
    factor: 'qmdj',
    label: 'Kỳ Môn Độn Giáp',
    value: qmdjScore,
    maxValue: QMDJ_SCORING.max,
    positive: qmdjScore > 0,
    detail: qmdjDetail,
  });
  totalScore += qmdjScore;

  // ── Factor 8: Thái Ất Macro Backdrop (informational, ±3) ──
  let thaiAtScore = 0;
  let thaiAtDetail: string;
  if (includeAdvanced) {
    try {
      const dateObj = new Date(dayData.solarDate);
      const lunarYear = dayData.lunarDate?.year || dateObj.getFullYear();
      const chart = getThaiAtYearChart(lunarYear);
      // Base: dominance alignment
      if (chart.hostGuest.dominance === 'hostDominant') {
        thaiAtScore = 1; // Stable years favor most activities
        thaiAtDetail = `${chart.hostGuest.dominanceLabel}: Năm ổn định, thuận cho hoạt động thường nhật`;
      } else if (chart.hostGuest.dominance === 'guestDominant') {
        thaiAtScore = -1; // Dynamic years have more uncertainty
        thaiAtDetail = `${chart.hostGuest.dominanceLabel}: Năm biến động, cần linh hoạt`;
      } else {
        thaiAtDetail = `${chart.hostGuest.dominanceLabel}: Cân bằng âm dương`;
      }
      // Tone boost
      if (chart.forecastTone === 'optimistic') thaiAtScore += 2;
      else if (chart.forecastTone === 'cautious') thaiAtScore -= 2;
      thaiAtScore = Math.max(-3, Math.min(3, thaiAtScore));
    } catch {
      thaiAtDetail = 'Chưa tính Thái Ất';
    }
  } else {
    thaiAtDetail = 'Tắt chế độ nâng cao';
  }
  breakdown.push({
    factor: 'thaiAt',
    label: 'Vận Khí Năm (Thái Ất)',
    value: thaiAtScore,
    maxValue: 3,
    positive: thaiAtScore >= 0,
    detail: thaiAtDetail,
  });
  totalScore += thaiAtScore;

  // ── Normalize to 0-100% ──
  let percentage = Math.round(
    ((totalScore - NORMALIZATION.minTheoretical) / NORMALIZATION.range) * NORMALIZATION.percentScale,
  );
  percentage = Math.max(NORMALIZATION.percentMin, Math.min(NORMALIZATION.percentMax, percentage));

  if (isBachSuHungVeto) {
    percentage = Math.min(percentage, CLASSICAL_AUSPICIOUSNESS.hardVetoCap);
  } else if (isOracleGlobalVeto && !isDirectSupport) {
    percentage = Math.min(percentage, CLASSICAL_AUSPICIOUSNESS.severeCap);
  } else if (isMixedSignal) {
    percentage = Math.min(
      Math.max(percentage, CLASSICAL_AUSPICIOUSNESS.mixedFloor),
      CLASSICAL_AUSPICIOUSNESS.preferredFloor,
    );
  } else if (isDirectSupport) {
    percentage = Math.max(percentage, CLASSICAL_AUSPICIOUSNESS.preferredFloor);
  } else if (isDirectBlock) {
    percentage = Math.min(
      percentage,
      isSevereDay ? CLASSICAL_AUSPICIOUSNESS.severeCap : CLASSICAL_AUSPICIOUSNESS.forbiddenCap,
    );
  }

  // Bách Sự Hung override
  if (isBachSuHungVeto) {
    percentage = Math.min(percentage, OVERRIDES.bachSuHungCap);
  }

  // ── Best Hours for This Activity ──
  const bestHours = computeBestHours(activity, dayData);

  const { label, colorClass } = getScoreLabel(percentage);

  return {
    percentage,
    label,
    colorClass,
    breakdown,
    bestHours,
    isBachSuHung,
  };
}

// ── Best Hours Computation ────────────────────────────────────

function computeBestHours(activity: ActivityEntry, dayData: DayDetailsData): HourScoreEntry[] {
  const hourScores: HourScoreEntry[] = dayData.allHours.map((h) => {
    // Simple per-hour activity score: combine hour score with activity nghi/ky match
    let score = h.score; // base: 0-100

    // Bonus if the hour's nghi list mentions this activity
    const hourNghiStr = (h.nghi || []).join(' ').toLowerCase();
    const hourKyStr = (h.ky || []).join(' ').toLowerCase();

    if (
      activity.aliases.some((a) => hourNghiStr.includes(a.toLowerCase())) ||
      hourNghiStr.includes(activity.nameVi.toLowerCase())
    ) {
      score += BEST_HOURS_SCORING.nghiBonus;
    }
    if (
      activity.aliases.some((a) => hourKyStr.includes(a.toLowerCase())) ||
      hourKyStr.includes(activity.nameVi.toLowerCase())
    ) {
      score += BEST_HOURS_SCORING.kyPenalty;
    }

    return { hourInfo: h, activityScore: Math.max(0, Math.min(100, score)) };
  });

  return hourScores.sort((a, b) => b.activityScore - a.activityScore).slice(0, BEST_HOURS_SCORING.topCount);
}

// ── Convenience: Score all activities for a day ───────────────

export interface ActivityDaySummary {
  activity: ActivityEntry;
  percentage: number;
  label: string;
  colorClass: string;
}

/** Score all catalog activities for a given day (no hour, no birth year). */
export function scoreAllActivities(dayData: DayDetailsData): ActivityDaySummary[] {
  return ACTIVITY_CATALOG.map((activity) => {
    const result = scoreActivity(activity.id, dayData);
    return {
      activity,
      percentage: result.percentage,
      label: result.label,
      colorClass: result.colorClass,
    };
  }).sort((a, b) => b.percentage - a.percentage);
}
