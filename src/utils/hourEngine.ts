/**
 * Hour Engine — Hourly Astrological Evaluation
 * Calculates Can-Chi, deity status, star impact, and suitability scores
 * for each of the 12 two-hour periods (Thời Thần) in a day.
 */

import {
  CanChi,
  Can,
  Chi,
  HourInfo,
  ThoiThanData,
  StarData,
  StarWeight,
  ActionWeight,
  NullifyRule,
} from '../types/calendar';
import thanSatData from '../data/phase_1/than_sat.json';
import thoiThanData from '../data/phase_1/thoi_than.json';
import starWeightData from '../data/phase_1/starWeight.json';
import actionWeightData from '../data/phase_1/actionWeight.json';
import nullifyRulesData from '../data/phase_1/nullifyRules.json';
import { CAN, CHI, SCORING, HOUR_RANGES, MOI_VIEC_DEU_KY_LABEL } from './constants';
import { getNapAmIndex, checkNapAmCompatibility } from './canchiHelper';

// ── Can-Chi for Hours ─────────────────────────────────────────

export function getHourCanChi(dayCan: Can, hourChi: Chi): CanChi {
  const dayCanIndex = CAN.indexOf(dayCan);
  const hourChiIndex = CHI.indexOf(hourChi);
  const hourCanIndex = (dayCanIndex * 2 + hourChiIndex) % 10;
  return {
    can: CAN[hourCanIndex] as Can,
    chi: hourChi as Chi,
  };
}

// ── Hour Stars (from Thần Sát data) ───────────────────────────

function getHourStars(dayChi: Chi, hourChi: Chi): Array<{ name: string; description: string; type: string }> {
  const results: Array<{ name: string; description: string; type: string }> = [];
  const data = (thanSatData.than_sat as StarData[]) || [];
  data.forEach((s) => {
    const c = s.criteria;
    if (c && c.day_hour_chi && c.day_hour_chi[dayChi] === hourChi) {
      results.push({ name: s.name, description: s.description || '', type: s.type || 'Bad' });
    }
  });
  return results;
}

// ── Hourly Special Stars (Thời Thần data) ─────────────────────

function getHourlySpecialStars(dayCan: Can, dayChi: Chi, hourChi: Chi): string[] {
  const stars: string[] = [];
  const hourlyData = (thoiThanData as unknown as ThoiThanData).hourly_stars || [];

  hourlyData.forEach((s) => {
    const c = s.criteria;
    if (c && c.day_can && c.day_can[dayCan]) {
      const target = c.day_can[dayCan];
      if (Array.isArray(target)) {
        if (target.includes(hourChi)) stars.push(s.name);
      } else {
        if (target === hourChi) stars.push(s.name);
      }
    }
  });

  return stars;
}

// ── Hour Deity (12 Path Deities) ──────────────────────────────

function getHourDeity(dayChi: Chi, hourChi: Chi): { name: string; isAuspicious: boolean; meaning: string } {
  const startIndices = (thoiThanData as unknown as ThoiThanData).deity_start_indices;
  const startIndex = startIndices[dayChi] || 0;
  const hourIndex = CHI.indexOf(hourChi);
  const deityIndex = (hourIndex - startIndex + 12) % 12;
  const name = (thoiThanData as unknown as ThoiThanData).path_deities[deityIndex];
  const isAuspicious = (thoiThanData as unknown as ThoiThanData).hoang_dao_indices.includes(deityIndex);
  const meaning = (thoiThanData as unknown as ThoiThanData).path_deity_meanings[name] || '';
  return { name, isAuspicious, meaning };
}

// ── Star Impact / Nullification ───────────────────────────────

function computeStarImpact(goodStars: string[], badStars: string[]) {
  const sw = (starWeightData.starWeight as StarWeight[]) || [];
  const rules = (nullifyRulesData as NullifyRule[]) || [];

  let netGood = 0;
  let netBad = 0;

  const goodDetails: { name: string; w: number }[] = [];
  const badDetails: { name: string; w: number }[] = [];
  const nullifiedBads = new Set<string>();
  const nullificationMsgs: string[] = [];

  goodStars.forEach((name) => {
    const st = sw.find((x) => x.name === name || name.includes(x.name));
    const w = st ? st.weight : SCORING.DEFAULT_STAR_WEIGHT;
    goodDetails.push({ name, w });
    netGood += w;
  });

  badStars.forEach((name) => {
    const st = sw.find((x) => x.name === name || name.includes(x.name));
    const w = st ? st.weight : SCORING.DEFAULT_STAR_WEIGHT;
    badDetails.push({ name, w });
    netBad += w;
  });

  // Nullification logic
  rules.forEach((rule) => {
    const gObj = goodDetails.find((g) => g.name.includes(rule.goodStar));
    const bObj = badDetails.find((b) => b.name.includes(rule.badStar));
    if (gObj && bObj) {
      const delta = Math.min(gObj.w, bObj.w) * rule.ratio;
      netGood += delta;
      netBad -= delta;
      nullifiedBads.add(bObj.name);
      nullificationMsgs.push(`${gObj.name} đã hóa giải ${bObj.name} (${Math.round(rule.ratio * 100)}%)`);
    }
  });

  return { netGood, netBad, goodDetails, badDetails, nullifiedBads, nullificationMsgs };
}

// ── Main Hour Calculation ─────────────────────────────────────

export function getAllHours(
  date: Date,
  parseCanChi: (s: string) => CanChi,
  getCanChiDay: (d: Date) => string,
): HourInfo[] {
  const dayCanChi = parseCanChi(getCanChiDay(date));
  const hours: HourInfo[] = [];

  const dayNapAm = getNapAmIndex(dayCanChi.can, dayCanChi.chi);

  CHI.forEach((chi, index) => {
    const deity = getHourDeity(dayCanChi.chi, chi);
    const canChi = getHourCanChi(dayCanChi.can, chi);
    const specialStars = getHourlySpecialStars(dayCanChi.can, dayCanChi.chi, chi);
    const hourStarObjects = getHourStars(dayCanChi.chi, chi);

    const goodS: string[] = [];
    const badS: string[] = [];

    specialStars.forEach((star) => badS.push(`Sao ${star}`));
    hourStarObjects.forEach((starObj) => {
      if (starObj.type === 'Good') {
        goodS.push(starObj.name);
      } else {
        badS.push(starObj.name);
      }
    });

    // Build the advancedInfo display strings (kept for UI compatibility)
    const advancedInfo = hourStarObjects.map((s) => `${s.name} (${s.description})`);

    const impact = computeStarImpact(goodS, badS);

    // Core score calculation
    let baseScore = SCORING.HOUR_BASE_SCORE;
    if (deity.isAuspicious) baseScore += SCORING.HOUR_AUSPICIOUS_BONUS;
    else baseScore -= SCORING.HOUR_INAUSPICIOUS_PENALTY;

    // Check Nap Am Khắc
    const hourNapAm = getNapAmIndex(canChi.can, canChi.chi);
    const isKhac = checkNapAmCompatibility(dayNapAm, hourNapAm) === -1;
    if (isKhac) baseScore -= SCORING.HOUR_KHAC_PENALTY;

    let score = baseScore + Math.round((impact.netGood - impact.netBad) * 2);
    score = Math.max(SCORING.HOUR_SCORE_MIN, Math.min(SCORING.HOUR_SCORE_MAX, score));

    // Refinement: Identify transformation (HOÀNG ĐẠO → HẮC ĐẠO)
    let statusLabel = deity.isAuspicious ? 'HOÀNG ĐẠO' : 'HẮC ĐẠO';
    if (deity.isAuspicious && score < SCORING.HOUR_STATUS_OVERRIDE_LOW) {
      statusLabel = 'HOÀNG ĐẠO --> HẮC ĐẠO';
    } else if (!deity.isAuspicious && score > SCORING.HOUR_STATUS_OVERRIDE_HIGH) {
      statusLabel = 'HẮC ĐẠO --> HOÀNG ĐẠO';
    }

    const actionsDesc: string[] = [];
    const kyDesc: string[] = [];

    // Compile individual action scores
    const aw = actionWeightData as unknown as ActionWeight;
    const scoredActions = Object.entries(aw).map(([act, cfg]) => {
      const catMul = goodS.length > 0 ? cfg.starMultipliers.cat : 1.0;
      const hungMul = badS.length > 0 ? cfg.starMultipliers.hung : 1.0;

      let fitness = cfg.baseWeight * SCORING.ACTION_FITNESS_MULTIPLIER * catMul * hungMul;
      fitness = fitness * (score / SCORING.ACTION_FITNESS_NORMALIZER);

      return { act, val: Math.min(100, Math.round(fitness)) };
    });

    const bestActions = [...scoredActions]
      .filter((a) => a.val >= SCORING.ACTION_BEST_THRESHOLD)
      .sort((a, b) => b.val - a.val)
      .slice(0, SCORING.ACTION_DISPLAY_COUNT);
    const worstActions = [...scoredActions]
      .filter((a) => a.val <= SCORING.ACTION_WORST_THRESHOLD)
      .sort((a, b) => a.val - b.val)
      .slice(0, SCORING.ACTION_DISPLAY_COUNT);

    if (bestActions.length > 0) {
      actionsDesc.push(bestActions.map((a) => `${a.act} (${a.val}%)`).join(', '));
    }

    if (worstActions.length > 0) {
      kyDesc.push(worstActions.map((a) => `${a.act} (${a.val}%)`).join(', '));
    }

    // ── Star-Specific Kỵ Override ─────────────────────────────
    // Parse each active star's description for "Kỵ ..." patterns
    // and inject those specific activities into the Kỵ list.
    //
    // Bug fixes applied:
    //   1. Match "Kỵ" prefix on the FULL description first, then split by comma.
    //      (previous code split by comma first, so only the first segment had "Kỵ")
    //   2. Case-insensitive lookup against actionWeight keys
    //      (e.g. "giao dịch" from description must match "Giao dịch" key).
    const awKeys = Object.keys(aw);
    const normalise = (s: string) => s.trim().toLowerCase();
    const findAwKey = (activity: string) => awKeys.find((k) => normalise(k) === normalise(activity));

    const starSpecificKy = new Set<string>();

    const allStarDescriptions = advancedInfo.map((s) => {
      const match = s.match(/\(([^)]+)\)$/);
      return match ? match[1] : '';
    });

    allStarDescriptions.forEach((desc) => {
      if (!desc) return;

      if (desc === MOI_VIEC_DEU_KY_LABEL) {
        awKeys.forEach((act) => {
          if (!kyDesc.some((k) => k.includes(act))) {
            starSpecificKy.add(act);
          }
        });
        return;
      }

      // Match "Kỵ activity1, activity2, ..."
      const kyMatch = desc.match(/^Kỵ\s+(.+)$/);
      if (kyMatch) {
        const activities = kyMatch[1].split(',').map((a) => a.trim());
        activities.forEach((activity) => {
          const canonicalKey = findAwKey(activity);
          if (canonicalKey && !kyDesc.some((k) => k.includes(canonicalKey))) {
            starSpecificKy.add(canonicalKey);
          }
        });
      }
    });

    if (starSpecificKy.size > 0) {
      const starKyEntries = Array.from(starSpecificKy).map((act) => {
        const existing = scoredActions.find((a) => a.act === act);
        const val = existing ? existing.val : 0;
        return `${act} (${val}%)`;
      });
      kyDesc.push(starKyEntries.join(', '));
    }

    hours.push({
      name: chi,
      timeRange: HOUR_RANGES[index],
      canChi,
      isAuspicious: deity.isAuspicious,
      score,
      khacDay: isKhac ? 'Vi phạm ngũ hành khắc' : undefined,
      nghi: actionsDesc,
      ky: kyDesc,
      advancedInfo: [
        `Hành khiển: ${deity.name} (${deity.meaning})`,
        ...specialStars,
        ...advancedInfo,
        `Trạng thái: ${statusLabel}`,
      ],
    });
  });

  return hours;
}

export function getAuspiciousHours(
  date: Date,
  parseCanChi: (s: string) => CanChi,
  getCanChiDay: (d: Date) => string,
): HourInfo[] {
  return getAllHours(date, parseCanChi, getCanChiDay).filter((h) => h.isAuspicious);
}

export function getInauspiciousHours(
  date: Date,
  parseCanChi: (s: string) => CanChi,
  getCanChiDay: (d: Date) => string,
): HourInfo[] {
  return getAllHours(date, parseCanChi, getCanChiDay).filter((h) => !h.isAuspicious);
}
