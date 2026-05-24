/**
 * personalDungSu.ts — Personalized Dụng Sự (auspicious activities)
 *
 * Applies personal day score modifiers to the list of suitable activities.
 */

import type { Chi } from '../../types/calendar';
import { calculatePersonalDayScore } from './personalDayScore';
import type { PersonalBirthDetails } from './birthMath';

export interface ScoredActivity {
  name: string;
  score: number;
  isBoosted: boolean;
  isWarned: boolean;
  reason?: string;
}

export interface PersonalDungSuResult {
  voidDayWarning?: string;
  recommended: ScoredActivity[];
  warned: ScoredActivity[];
  regular: ScoredActivity[];
}

/**
 * Calculates personalized Auspicious Activities based on birth year.
 * No premium gating — available to all authenticated users.
 */
export function getPersonalDungSu(
  birthYear: number | undefined | null,
  dayChi: Chi,
  suitableActivities: string[],
  birthDetails?: PersonalBirthDetails | null,
): PersonalDungSuResult {
  const result: PersonalDungSuResult = {
    recommended: [],
    warned: [],
    regular: [],
  };

  if (!suitableActivities || suitableActivities.length === 0 || !birthYear) {
    return result;
  }

  const scoredActivities: ScoredActivity[] = suitableActivities.map((name) => ({
    name,
    score: 10,
    isBoosted: false,
    isWarned: false,
  }));

  // Personal Day Score Overlay
  const dayScore = calculatePersonalDayScore(birthYear, dayChi, birthDetails);
  if (dayScore) {
    scoredActivities.forEach((act) => {
      if (dayScore.actionScore >= 3) {
        act.score += 10;
        act.isBoosted = true;
        if (!act.reason) act.reason = 'Ngày Đại Cát với tuổi';
      } else if (dayScore.actionScore <= -3) {
        act.score -= 15;
        act.isWarned = true;
        if (!act.reason) act.reason = 'Ngày Xung khắc mệnh';
      }
    });
  }

  // Sort and categorize
  scoredActivities.sort((a, b) => b.score - a.score);

  scoredActivities.forEach((act) => {
    if (act.score >= 15) {
      result.recommended.push(act);
    } else if (act.score < 5) {
      result.warned.push(act);
    } else {
      result.regular.push(act);
    }
  });

  return result;
}
