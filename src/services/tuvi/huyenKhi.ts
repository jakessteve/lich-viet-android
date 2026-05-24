/**
 * Huyền Khí (Mysterious Energy) Scoring Engine
 *
 * Pure TypeScript module for calculating Huyền Khí scores
 * across the 12 palaces of a Tử Vi chart.
 *
 * Zero React dependencies.
 */

import type { TuViPalace, TuViCombination, TuViHuyenKhi } from '../../types/tuvi';
import { DOI_CUNG_MAP, TAM_HOP_GROUPS } from './constants';
import huyenKhiScoring from '../../data/tuvi/huyenKhiScoring.json';

// ── Typed scoring data ──────────────────────────────────────────

interface HuyenKhiScoringData {
  starScores: {
    chinhTinh: Record<string, number>;
    phuTinh: Record<string, number>;
    satTinh: Record<string, number>;
  };
  tuHoaBonus: Record<string, number>;
  combinationBonus: Record<string, number>;
  gradeThresholds: Record<string, number>;
  gradeLabels: Record<string, string>;
}

const scoring = huyenKhiScoring as HuyenKhiScoringData;

type RelationSector = 'menh' | 'doiCung' | 'tamHop' | 'nhiHop';

const RELATION_SECTOR_WEIGHTS: Record<RelationSector, number> = {
  menh: 1.25,
  doiCung: 1,
  tamHop: 0.9,
  nhiHop: 0.75,
};

const RELATION_STAR_SCORES: HuyenKhiScoringData['starScores'] = {
  chinhTinh: {
    Miếu: 2.2,
    Vượng: 1.8,
    Đắc: 1.4,
    Địa: 1.2,
    Lợi: 0.9,
    Bình: 0.5,
    Bất: 0.1,
    Hãm: -1.1,
  },
  phuTinh: {
    Miếu: 1.2,
    Vượng: 1,
    Đắc: 0.8,
    Địa: 0.7,
    Lợi: 0.4,
    Bình: 0.1,
    Bất: -0.2,
    Hãm: -0.7,
  },
  satTinh: {
    Miếu: 0.8,
    Vượng: 0.4,
    Đắc: 0.2,
    Địa: 0.1,
    Lợi: 0,
    Bình: -0.2,
    Bất: -0.8,
    Hãm: -1.4,
  },
};

const RELATION_TU_HOA_BONUS: Record<string, number> = {
  Lộc: 0.8,
  Quyền: 0.6,
  Khoa: 0.4,
  Kỵ: -0.9,
};

const RELATION_COMBINATION_BONUS: Record<string, number> = {
  cat: 0.75,
  trung: 0,
  hung: -0.75,
};

// Curved calibration against public Cổ Học reference pages.
// A simple linear rescale was too flat: it could match one chart family,
// but not both the high-positive and low-negative reference pages.
const HUYEN_KHI_TOTAL_A = -0.02211675080968492;
const HUYEN_KHI_TOTAL_B = 3.4856766414849436;
const HUYEN_KHI_TOTAL_C = -105.48478843248964;
const HUYEN_KHI_COMBINATION_WEIGHT = 0.8;

function roundToSingleDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function scoreStarCollection(
  stars: Array<{ brightness: string }>,
  table: Record<string, number>,
): number {
  let score = 0;
  for (const star of stars) {
    score += table[star.brightness] ?? 0;
  }
  return score;
}

function getRelationSectorMap(centerId: number): Map<number, RelationSector> {
  const relationByIndex = new Map<number, RelationSector>();
  relationByIndex.set(centerId, 'menh');
  relationByIndex.set(DOI_CUNG_MAP[centerId], 'doiCung');

  const tamHopGroup = TAM_HOP_GROUPS.find((group) => group.includes(centerId));
  if (tamHopGroup) {
    for (const palaceId of tamHopGroup) {
      if (palaceId !== centerId) {
        relationByIndex.set(palaceId, 'tamHop');
      }
    }
  }

  relationByIndex.set((centerId + 11) % 12, 'nhiHop');
  relationByIndex.set((centerId + 1) % 12, 'nhiHop');
  return relationByIndex;
}

function calculateRelationPalaceScore(palaces: TuViPalace[], centerId: number): number {
  const relationByIndex = getRelationSectorMap(centerId);
  let score = 0;

  for (const [palaceId, relationSector] of relationByIndex.entries()) {
    const palace = palaces.find((entry) => entry.id === palaceId);
    if (!palace) continue;

    const starScore =
      scoreStarCollection(palace.chinhTinh, RELATION_STAR_SCORES.chinhTinh) +
      scoreStarCollection(palace.phuTinh, RELATION_STAR_SCORES.phuTinh) +
      scoreStarCollection(palace.satTinh, RELATION_STAR_SCORES.satTinh);

    const tuHoaScore = palace.tuHoa.reduce((sum, tuHoa) => sum + (RELATION_TU_HOA_BONUS[tuHoa.type] ?? 0), 0);
    score += (starScore + tuHoaScore) * RELATION_SECTOR_WEIGHTS[relationSector];
  }

  return roundToSingleDecimal(score);
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Calculates the legacy raw Huyền Khí score for a single palace.
 *
 * This is still exported for compatibility, but the chart-level scorer
 * now uses a relation-based model closer to the public Cổ Học cards.
 *
 * @param palace — a single Tử Vi palace
 * @returns numeric Huyền Khí score
 */
export function calculatePalaceScore(palace: TuViPalace): number {
  let score = 0;

  for (const star of palace.chinhTinh) {
    score += scoring.starScores.chinhTinh[star.brightness] ?? 0;
  }

  for (const star of palace.phuTinh) {
    score += scoring.starScores.phuTinh[star.brightness] ?? 0;
  }

  for (const star of palace.satTinh) {
    score += scoring.starScores.satTinh[star.brightness] ?? 0;
  }

  for (const tuHoa of palace.tuHoa) {
    score += scoring.tuHoaBonus[tuHoa.type] ?? 0;
  }

  return score;
}

/**
 * Calculates relation-based Huyền Khí scores for an entire chart.
 *
 * Each palace is scored from its local relation set:
 * - Tọa thủ: the palace itself
 * - Xung chiếu: its đối cung
 * - Tam hợp: the two palaces in the same tam hợp group
 * - Nhị hợp: the two adjacent palaces
 *
 * @param palaces      — all 12 palaces
 * @param combinations — detected named combinations
 * @returns `TuViHuyenKhi` with totalScore, palaceScores, and grade
 */
export function calculateHuyenKhi(palaces: TuViPalace[], combinations: TuViCombination[]): TuViHuyenKhi {
  const palaceScores: Record<string, number> = {};
  let relationTotal = 0;

  for (const palace of palaces) {
    const relationScore = calculateRelationPalaceScore(palaces, palace.id);
    palaceScores[palace.name] = relationScore;
    relationTotal += relationScore;
  }

  let combinationScore = 0;
  for (const combo of combinations) {
    combinationScore += RELATION_COMBINATION_BONUS[combo.category] ?? 0;
  }

  if (relationTotal === 0 && combinationScore === 0) {
    return {
      totalScore: 0,
      palaceScores,
      grade: scoring.gradeLabels.ha,
    };
  }

  const totalScore =
    relationTotal === 0
      ? roundToSingleDecimal(combinationScore * HUYEN_KHI_COMBINATION_WEIGHT)
      : roundToSingleDecimal(
          HUYEN_KHI_TOTAL_A * relationTotal * relationTotal +
            HUYEN_KHI_TOTAL_B * relationTotal +
            HUYEN_KHI_TOTAL_C +
            combinationScore * HUYEN_KHI_COMBINATION_WEIGHT,
        );

  let grade: string;
  if (totalScore >= scoring.gradeThresholds.thuong) {
    grade = scoring.gradeLabels.thuong;
  } else if (totalScore >= scoring.gradeThresholds.thuongTrung) {
    grade = scoring.gradeLabels.thuongTrung;
  } else if (totalScore >= scoring.gradeThresholds.trung) {
    grade = scoring.gradeLabels.trung;
  } else if (totalScore >= scoring.gradeThresholds.trungHa) {
    grade = scoring.gradeLabels.trungHa;
  } else {
    grade = scoring.gradeLabels.ha;
  }

  return { totalScore, palaceScores, grade };
}
