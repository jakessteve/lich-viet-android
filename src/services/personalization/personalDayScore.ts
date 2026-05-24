/**
 * personalDayScore.ts — Personalized day auspiciousness based on birth year
 *
 * Calculates how auspicious a day is for a specific person based on
 * their birth year's Can Chi interacting with the day's Can Chi.
 * Uses Tam Hợp, Lục Hợp, Lục Xung, Lục Hại, Tương Hình, Tương Phá relationships.
 */

import { getCanChiYear } from '../../utils/calendarEngine';
import type { Chi, Can } from '../../types/calendar';
import { resolvePersonalBirthMoment, type PersonalBirthDetails } from './birthMath';

export const CHI_LIST: Chi[] = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
export const CAN_LIST: Can[] = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

export interface PersonalDayScore {
  actionScore: number;
  label: string;
  description: string;
  isThaiTue: boolean;
  isTamHop: boolean;
  isLucHop: boolean;
  isTuongXung: boolean;
  isTuongHai: boolean;
  isTuongHinh: boolean;
  isTuongPha: boolean;
}

/** Get the Earthly Branch (Chi) of a given solar year. */
export function getYearChi(year: number): Chi {
  const canChi = getCanChiYear(year);
  return canChi.split(' ')[1] as Chi;
}

/** Check Tam Hợp (Three Harmonies) */
export const isTamHop = (chi1: Chi, chi2: Chi): boolean => {
  const tamHopGroups: Chi[][] = [
    ['Dần', 'Ngọ', 'Tuất'],
    ['Hợi', 'Mão', 'Mùi'],
    ['Thân', 'Tý', 'Thìn'],
    ['Tỵ', 'Dậu', 'Sửu'],
  ];
  return tamHopGroups.some((group) => group.includes(chi1) && group.includes(chi2));
};

/** Check Lục Hợp (Six Harmonies) */
const isLucHop = (chi1: Chi, chi2: Chi): boolean => {
  const hopGroups: [Chi, Chi][] = [
    ['Tý', 'Sửu'],
    ['Dần', 'Hợi'],
    ['Mão', 'Tuất'],
    ['Thìn', 'Dậu'],
    ['Tỵ', 'Thân'],
    ['Ngọ', 'Mùi'],
  ];
  return hopGroups.some(([a, b]) => (chi1 === a && chi2 === b) || (chi1 === b && chi2 === a));
};

/** Check Lục Xung (Six Clashes) */
const isTuongXung = (chi1: Chi, chi2: Chi): boolean => {
  const xungGroups: [Chi, Chi][] = [
    ['Tý', 'Ngọ'],
    ['Sửu', 'Mùi'],
    ['Dần', 'Thân'],
    ['Mão', 'Dậu'],
    ['Thìn', 'Tuất'],
    ['Tỵ', 'Hợi'],
  ];
  return xungGroups.some(([a, b]) => (chi1 === a && chi2 === b) || (chi1 === b && chi2 === a));
};

/** Check Lục Hại (Six Harms) */
const isTuongHai = (chi1: Chi, chi2: Chi): boolean => {
  const haiGroups: [Chi, Chi][] = [
    ['Tý', 'Mùi'],
    ['Sửu', 'Ngọ'],
    ['Dần', 'Tỵ'],
    ['Mão', 'Thìn'],
    ['Thân', 'Hợi'],
    ['Dậu', 'Tuất'],
  ];
  return haiGroups.some(([a, b]) => (chi1 === a && chi2 === b) || (chi1 === b && chi2 === a));
};

/** Check Tương Hình (Mutual Punishment) */
const isTuongHinh = (chi1: Chi, chi2: Chi): boolean => {
  const hinhGroups: Chi[][] = [
    ['Dần', 'Tỵ', 'Thân'],
    ['Sửu', 'Tuất', 'Mùi'],
    ['Tý', 'Mão'],
    ['Thìn', 'Thìn'],
    ['Ngọ', 'Ngọ'],
    ['Dậu', 'Dậu'],
    ['Hợi', 'Hợi'],
  ];
  return hinhGroups.some((group) => group.includes(chi1) && group.includes(chi2));
};

/** Check Tương Phá (Mutual Destruction) */
const isTuongPha = (chi1: Chi, chi2: Chi): boolean => {
  const phaGroups: [Chi, Chi][] = [
    ['Tý', 'Dậu'],
    ['Sửu', 'Thìn'],
    ['Dần', 'Hợi'],
    ['Mão', 'Ngọ'],
    ['Tỵ', 'Thân'],
    ['Mùi', 'Tuất'],
  ];
  return phaGroups.some(([a, b]) => (chi1 === a && chi2 === b) || (chi1 === b && chi2 === a));
};

/** Get Thái Tuế type for a birth year vs target year */
export function getYearThaiTueType(birthYear: number, targetYear: number): string | null {
  const userChi = getYearChi(birthYear);
  const targetChi = getYearChi(targetYear);
  if (userChi === targetChi) return 'Trị Thái Tuế (Năm bản mệnh)';
  if (isTuongXung(userChi, targetChi)) return 'Xung Thái Tuế';
  if (isTuongHinh(userChi, targetChi)) return 'Hình Thái Tuế';
  if (isTuongHai(userChi, targetChi)) return 'Hại Thái Tuế';
  if (isTuongPha(userChi, targetChi)) return 'Phá Thái Tuế';
  return null;
}

/** Calculate the Personal Day Score based on birth year and the day's Chi.
 * When birthday and birthplace details are available, the natal day pillar is
 * re-derived from the corrected birth moment and folded into the score.
 */
export function calculatePersonalDayScore(
  birthYear: number | undefined | null,
  dayChi: Chi,
  birthDetails?: PersonalBirthDetails | null,
): PersonalDayScore | null {
  if (!birthYear) return null;

  const userChi = getYearChi(birthYear);
  const resolvedBirth = birthDetails ? resolvePersonalBirthMoment(birthYear, birthDetails) : null;
  const hasBirthDetailAdjustment = Boolean(resolvedBirth?.dayCanChi);

  const scoreFromRelation = (sourceChi: Chi, targetChi: Chi): number => {
    let score = 0;
    if (isTamHop(sourceChi, targetChi)) score += 3;
    if (isLucHop(sourceChi, targetChi)) score += 2;
    if (sourceChi === targetChi) score -= 1;
    if (isTuongXung(sourceChi, targetChi)) score -= 3;
    if (isTuongHai(sourceChi, targetChi)) score -= 2;
    if (isTuongHinh(sourceChi, targetChi)) score -= 2;
    if (isTuongPha(sourceChi, targetChi)) score -= 1;
    return score;
  };

  const scoreData: PersonalDayScore = {
    actionScore: 0,
    label: 'Bình thường',
    description: '',
    isThaiTue: userChi === dayChi,
    isTamHop: isTamHop(userChi, dayChi),
    isLucHop: isLucHop(userChi, dayChi),
    isTuongXung: isTuongXung(userChi, dayChi),
    isTuongHai: isTuongHai(userChi, dayChi),
    isTuongHinh: isTuongHinh(userChi, dayChi),
    isTuongPha: isTuongPha(userChi, dayChi),
  };

  let score = scoreFromRelation(userChi, dayChi);

  if (resolvedBirth?.dayCanChi) {
    const natalDayWeight = scoreFromRelation(resolvedBirth.dayCanChi.chi, dayChi);
    score += natalDayWeight;
  }

  scoreData.actionScore = score;

  if (score >= 3) {
    scoreData.label = 'Đại Cát';
    scoreData.description = 'Ngày cực kỳ thuận lợi, sinh khí thịnh vượng, hợp làm việc lớn.';
  } else if (score > 0) {
    scoreData.label = 'Tiểu Cát';
    scoreData.description = 'Ngày có nhiều thuận lợi, phù hợp triển khai các công việc đã chuẩn bị.';
  } else if (score === 0) {
    scoreData.label = 'Bình Hòa';
    scoreData.description = 'Trạng thái cân bằng, không tốt không xấu. Cẩn trọng khi quyết định.';
  } else if (score > -3) {
    scoreData.label = 'Tiểu Hung';
    scoreData.description = 'Ngày có một số trở ngại, tránh thực hiện các giao dịch quan trọng.';
  } else {
    scoreData.label = 'Đại Hung';
    scoreData.description = 'Xung khắc mạnh với bản mệnh. Tuyệt đối tránh mưu sự, đi xa, cưới hỏi.';
  }

  if (hasBirthDetailAdjustment) {
    scoreData.description = `${scoreData.description} Đã hiệu chỉnh theo ngày sinh và nơi sinh.`;
  }

  return scoreData;
}
