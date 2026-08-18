import type { ElectionInput, ElectionCandidate, ElectionActivityType } from '../../types/election';
import { getDetailedDayData } from '@/utils/calendarEngine';
import { scoreActivity } from '@/utils/activityScorer';
import { CHI } from '@/utils/constants';
import type { Chi } from '@/types/calendar';

export const ACTIVITY_MAP: Record<ElectionActivityType, string> = {
  'cuoi-hoi': 'hon-nhan',
  'khai-truong': 'khai-truong-kinh-doanh',
  'xay-dung': 'xay-dung',
  'nhap-trach': 'nhap-trach',
  'xuat-hanh': 'xuat-hanh',
  khac: 'hop-tac-lam-an',
};

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
  const activityId = ACTIVITY_MAP[input.activityType] || 'hon-nhan';

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

    // 2. Western Astrology score heuristics (Moon Phase & Dignity)
    const lunarDay = dayData.lunarDate.day;
    let westernScore = 75;
    if (lunarDay >= 1 && lunarDay <= 14) {
      westernScore += 8; // Waxing Moon (Growing light)
    } else if (lunarDay === 15 || lunarDay === 16) {
      westernScore += 12; // Full Moon
    } else if (lunarDay >= 28) {
      westernScore -= 12; // Balsamic / Dark Moon
    }
    westernScore = Math.max(20, Math.min(98, westernScore));

    // 3. Vedic Panchanga score (Tithi & Vara)
    let vedicScore = 70;
    const riktaTithis = [4, 9, 14, 19, 24, 29];
    if (riktaTithis.includes(lunarDay)) {
      vedicScore -= 15; // Rikta (empty) Tithis
    } else if (lunarDay === 30) {
      vedicScore -= 20; // Amavasya
    } else if (lunarDay === 15) {
      vedicScore += 15; // Purnima
    } else if ([1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13].includes(lunarDay)) {
      vedicScore += 8; // Auspicious Tithis
    }

    const dayOfWeek = dateObj.getDay(); // 0 Sun, 1 Mon, 2 Tue, 3 Wed, 4 Thu, 5 Fri, 6 Sat
    if (dayOfWeek === 4 || dayOfWeek === 5) {
      vedicScore += 8; // Guru (Thu) / Shukra (Fri)
    } else if (dayOfWeek === 2 || dayOfWeek === 6) {
      vedicScore -= 6; // Mangala (Tue) / Shani (Sat)
    }
    vedicScore = Math.max(15, Math.min(96, vedicScore));

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
