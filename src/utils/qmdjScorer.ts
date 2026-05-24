/**
 * QMDJ Scorer — Activity Scoring Based on QMDJ Chart
 *
 * Maps activities from ACTIVITY_CATALOG to QMDJ Doors,
 * then evaluates the Door's palace quality (Star + Deity + Formations).
 */

import type { QmdjChart, QmdjActivityScore } from '../types/qmdj';
import doorActivityMap from '../data/qmdj/qmdjDoorActivityMap.json';

// ── Types ──────────────────────────────────────────────────────

interface DoorActivityMapEntry {
  favors: string[];
  disfavors: string[];
}

const { description: _desc, ...doorMap } = doorActivityMap as Record<string, DoorActivityMapEntry | string>;
const activityMap = doorMap as Record<string, DoorActivityMapEntry>;

// ── Auspiciousness Scores ──────────────────────────────────────

const DOOR_SCORES: Record<string, number> = {
  dai_cat: 10,
  cat: 7,
  trung_binh: 3,
  hung: -5,
  dai_hung: -10,
};

const STAR_SCORES: Record<string, number> = {
  cat: 3,
  trung_binh: 1,
  hung: -2,
};

const DEITY_SCORES: Record<string, number> = {
  dai_cat: 3,
  cat: 2,
  hung: -2,
};

// ── Main Scoring Function ──────────────────────────────────────

/**
 * Score a specific activity based on the current QMDJ chart.
 *
 * Algorithm:
 * 1. Find which Door(s) favor/disfavor this activity
 * 2. Find that Door's position in the current chart
 * 3. Check the Star and Deity in that palace
 * 4. Check for any formations affecting the score
 * 5. Return weighted score + explanation
 */
export function scoreActivityByQmdj(activityId: string, chart: QmdjChart): QmdjActivityScore {
  // 1. Find governing door(s) for this activity
  let bestDoorId: string | null = null;
  let bestDoorScore = -Infinity;
  let isDisfavored = false;

  for (const [doorId, mapping] of Object.entries(activityMap)) {
    if (mapping.favors.includes(activityId)) {
      // Find door in chart and get score
      const doorPalace = findDoorPalace(chart, doorId);
      if (doorPalace) {
        const doorInfo = doorPalace.door!;
        const score = DOOR_SCORES[doorInfo.auspiciousness] || 0;
        if (score > bestDoorScore) {
          bestDoorScore = score;
          bestDoorId = doorId;
        }
      }
    }
    if (mapping.disfavors.includes(activityId)) {
      isDisfavored = true;
    }
  }

  // No matching door found — neutral score
  if (!bestDoorId) {
    return {
      score: 0,
      detail: 'Kỳ Môn: Không ảnh hưởng',
      doorName: '',
      doorAuspiciousness: '',
      starBonus: 0,
      deityBonus: 0,
      formationBonus: 0,
      bestDirection: '',
    };
  }

  // 2. Find the door's palace
  const doorPalace = findDoorPalace(chart, bestDoorId);
  if (!doorPalace || !doorPalace.door) {
    return {
      score: 0,
      detail: 'Kỳ Môn: Không tìm thấy Môn',
      doorName: '',
      doorAuspiciousness: '',
      starBonus: 0,
      deityBonus: 0,
      formationBonus: 0,
      bestDirection: '',
    };
  }

  const door = doorPalace.door;
  let totalScore = DOOR_SCORES[door.auspiciousness] || 0;

  // If activity is disfavored by a hung door, amplify penalty
  if (isDisfavored) {
    totalScore = Math.min(totalScore, -3);
  }

  // 3. Star bonus
  let starBonus = 0;
  if (doorPalace.star) {
    starBonus = STAR_SCORES[doorPalace.star.auspiciousness] || 0;
    totalScore += starBonus;
  }

  // 4. Deity bonus
  let deityBonus = 0;
  if (doorPalace.deity) {
    deityBonus = DEITY_SCORES[doorPalace.deity.auspiciousness] || 0;
    totalScore += deityBonus;
  }

  // 5. Formation bonus
  let formationBonus = 0;
  for (const f of chart.formations) {
    if (f.palaceNumber === doorPalace.number) {
      if (f.effect === 'dai_cat') formationBonus += 5;
      else if (f.effect === 'cat') formationBonus += 3;
      else if (f.effect === 'hung') formationBonus -= 3;
      else if (f.effect === 'dai_hung') formationBonus -= 5;
    }
  }
  totalScore += formationBonus;

  // Clamp to reasonable range
  totalScore = Math.max(-15, Math.min(15, totalScore));

  // Build detail string
  const doorLabel = getAuspiciousnessLabel(door.auspiciousness);
  const starLabel = doorPalace.star
    ? ` + ${doorPalace.star.nameVi} (${getAuspiciousnessLabel(doorPalace.star.auspiciousness)})`
    : '';
  const deityLabel = doorPalace.deity ? ` + ${doorPalace.deity.nameVi}` : '';
  const formationLabel = chart.formations
    .filter((f) => f.palaceNumber === doorPalace.number)
    .map((f) => f.nameVi)
    .join(', ');
  const formationText = formationLabel ? ` 🐉 ${formationLabel}` : '';

  const detail = `${door.nameVi} (${doorLabel}) tại ${doorPalace.direction}${starLabel}${deityLabel}${formationText}`;

  return {
    score: totalScore,
    detail,
    doorName: door.nameVi,
    doorAuspiciousness: door.auspiciousness,
    starBonus,
    deityBonus,
    formationBonus,
    bestDirection: doorPalace.direction,
  };
}

// ── Helpers ────────────────────────────────────────────────────

function findDoorPalace(chart: QmdjChart, doorId: string) {
  return chart.palaces.find((p) => p.door?.id === doorId) || null;
}

function getAuspiciousnessLabel(a: string): string {
  switch (a) {
    case 'dai_cat':
      return '✅ Đại Cát';
    case 'cat':
      return '✅ Cát';
    case 'trung_binh':
      return '⚠️ Trung Bình';
    case 'hung':
      return '❌ Hung';
    case 'dai_hung':
      return '❌ Đại Hung';
    default:
      return a;
  }
}

/**
 * Get a quick summary of the QMDJ chart for a given hour.
 * Returns the top 3 auspicious doors and their directions.
 */
export function getQmdjHourSummary(chart: QmdjChart): {
  topDoors: Array<{ doorName: string; direction: string; auspiciousness: string }>;
  formations: Array<{ nameVi: string; effect: string }>;
} {
  const doors = chart.palaces
    .filter((p) => p.door !== null)
    .map((p) => ({
      doorName: p.door!.nameVi,
      direction: p.direction,
      auspiciousness: p.door!.auspiciousness,
      score: DOOR_SCORES[p.door!.auspiciousness] || 0,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    topDoors: doors.slice(0, 3).map((d) => ({
      doorName: d.doorName,
      direction: d.direction,
      auspiciousness: d.auspiciousness,
    })),
    formations: chart.formations.map((f) => ({
      nameVi: f.nameVi,
      effect: f.effect,
    })),
  };
}
