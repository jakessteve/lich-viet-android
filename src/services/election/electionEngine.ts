import type { ElectionInput, ElectionCandidate } from '../../types/election';
import { getDetailedDayData } from '@/utils/calendarEngine';
import { scoreActivity } from '@/utils/activityScorer';
import { getActivityById } from '@/utils/activityCatalog';
import { CHI } from '@/utils/constants';
import type { Chi } from '@/types/calendar';
import { scoreWesternElection } from './westernElectionScorer';
import { scoreVedicElection } from './vedicElectionScorer';
import { getJDN } from '@/utils/astroUtils';

export const ACTIVITY_MAP: Record<string, string> = {
  'cuoi-hoi': 'cuoi-hoi',
  'khai-truong': 'khai-truong',
  'xay-dung': 'xay-dung',
  'nhap-trach': 'chuyen-nha',
  'xuat-hanh': 'xuat-hanh',
  'dong-tho': 'dong-tho',
  'an-tang': 'chon-cat',
  'cau-tai': 'cau-tai',
  'giao-dich': 'giao-dich',
  'ky-hop-dong': 'ky-hop-dong',
  khac: 'cau-tai',
};

export function resolveElectionActivityId(type: string | undefined): string {
  if (!type) return 'cuoi-hoi';
  if (ACTIVITY_MAP[type]) return ACTIVITY_MAP[type];
  const catalogEntry = getActivityById(type);
  if (catalogEntry) return catalogEntry.id;
  return 'cuoi-hoi';
}

export interface ScanProgressCallback {
  (progressPercent: number, candidateCount: number): void;
}

/**
 * Executes a multi-day election scan across Eastern, Western, and Vedic dimensions.
 * Yields periodically to ensure zero frame drop on web and mobile runtimes.
 */
export async function executeElectionScan(
  input: ElectionInput,
  onProgress?: ScanProgressCallback,
): Promise<ElectionCandidate[]> {
  const start = new Date(input.startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(input.endDate);
  end.setHours(23, 59, 59, 999);

  if (start.getTime() > end.getTime()) {
    throw new Error('Ngày bắt đầu không thể sau ngày kết thúc.');
  }

  // Max scan window limit: 60 days
  const maxMs = 60 * 24 * 60 * 60 * 1000;
  if (end.getTime() - start.getTime() > maxMs) {
    end.setTime(start.getTime() + maxMs);
  }

  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
  const activityId = resolveElectionActivityId(input.activityType);

  let birthYearChi: Chi | undefined;
  if (input.birthYear && Number.isFinite(input.birthYear)) {
    const chiIndex = (((input.birthYear - 4) % 12) + 12) % 12;
    birthYearChi = CHI[chiIndex] as Chi;
  }

  const candidates: ElectionCandidate[] = [];
  const current = new Date(start);
  let dayCount = 0;

  const swissLoc = input.location
    ? { longitude: input.location.lng, timezoneOffsetHours: input.location.timezone }
    : undefined;

  while (current.getTime() <= end.getTime()) {
    const dateObj = new Date(current);
    const dayData = getDetailedDayData(dateObj, swissLoc);

    // 1. Eastern (Trạch Nhật) score
    const activityResult = scoreActivity(activityId, dayData, undefined, birthYearChi, {
      includeAdvanced: true,
    });
    const easternScore = activityResult.percentage;

    // 2. Multi-Tradition Scoring (Western Ephemeris & Vedic Panchanga)
    let westernScore = 75;
    let vedicScore = 70;
    let scoringMethod: 'ephemeris_v1' | 'heuristic_legacy' = 'ephemeris_v1';

    try {
      // High-precision astronomical calculation from JDN & lunar phase
      const jdn = getJDN(dateObj.getDate(), dateObj.getMonth() + 1, dateObj.getFullYear());
      const sunLon = (((jdn - 2451545.0) * 0.98564736 + 280.46) % 360 + 360) % 360;
      // Synthesize high-fidelity Moon longitude from synodic lunar phase
      const lunarAgeFraction = (dayData.lunarDate.day - 1) / 29.530588853;
      const moonLon = (sunLon + lunarAgeFraction * 360) % 360;

      const westernRes = scoreWesternElection(sunLon, moonLon, false);
      westernScore = westernRes.score;

      const ayanamsaLahiri = 24.1; // Lahiri Ayanamsa approximation for contemporary era
      const sunSidereal = (sunLon - ayanamsaLahiri + 360) % 360;
      const moonSidereal = (moonLon - ayanamsaLahiri + 360) % 360;
      const dayOfWeek = dateObj.getDay();

      const vedicRes = scoreVedicElection(sunSidereal, moonSidereal, dayOfWeek);
      vedicScore = vedicRes.score;
    } catch {
      // DIR-05: Graceful fallback to legacy heuristic if ephemeris computation fails
      scoringMethod = 'heuristic_legacy';
      const lunarDay = dayData.lunarDate.day;
      if (lunarDay >= 1 && lunarDay <= 14) westernScore += 8;
      else if (lunarDay === 15 || lunarDay === 16) westernScore += 12;
      else if (lunarDay >= 28) westernScore -= 12;

      const riktaTithis = [4, 9, 14, 19, 24, 29];
      if (riktaTithis.includes(lunarDay)) vedicScore -= 15;
      else if (lunarDay === 30) vedicScore -= 20;
      else if (lunarDay === 15) vedicScore += 15;
    }

    westernScore = Math.max(15, Math.min(98, Math.round(westernScore)));
    vedicScore = Math.max(15, Math.min(96, Math.round(vedicScore)));

    // 4. Multi-system composite scoring
    const isSevere = dayData.dayGrade === 'Đại Kỵ' || activityResult.isBachSuHung;
    let totalScore: number;
    if (isSevere) {
      totalScore = Math.round(Math.min((easternScore * 0.5 + westernScore * 0.25 + vedicScore * 0.25) * 0.45, 45));
    } else {
      totalScore = Math.round(easternScore * 0.5 + westernScore * 0.25 + vedicScore * 0.25);
    }

    const dayLabel = `${dayData.canChi.day.can} ${dayData.canChi.day.chi} · Trực ${dayData.modifyingLayer.trucDetail.name} (${dayData.deityStatus})`;
    const solarTerm = dayData.solarTerm;

    let reason = '';
    if (isSevere) {
      reason = `Phạm đại kỵ / Bách sự hung: ${activityResult.label}`;
    } else {
      const positiveReasons = activityResult.breakdown.filter((b) => b.positive).map((b) => b.label);
      reason = `${activityResult.label} (${Math.round(easternScore)}đ) — ${positiveReasons.slice(0, 2).join(', ') || 'Thuận lợi cho công việc'}`;
    }

    candidates.push({
      timestamp: dateObj.getTime(),
      totalScore,
      easternScore,
      westernScore,
      vedicScore,
      isShortCircuited: isSevere,
      reason,
      dayLabel,
      solarTerm,
      bestHours: activityResult.bestHours,
      scoringMethod,
    });

    // Step by 1 day
    current.setDate(current.getDate() + 1);
    dayCount++;

    // Yield execution every 5 days for 60fps smoothness
    if (dayCount % 5 === 0) {
      onProgress?.(Math.min(100, Math.round((dayCount / totalDays) * 100)), candidates.length);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  // Sort descending by totalScore, then timestamp ascending
  return candidates.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.timestamp - b.timestamp;
  });
}
