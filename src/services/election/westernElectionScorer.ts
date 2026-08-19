import { calculateBirthMoonPhase } from '../astrology/moonPhase';
import { normalizeDegrees } from '@/utils/astroUtils';

export interface WesternElectionScoreResult {
  score: number;
  phaseName: string;
  isWaxing: boolean;
  dignityLabel: string;
  notes: string[];
}

/**
 * Computes a high-precision Western Astrology Election Score based on true ephemeris coordinates.
 *
 * @param sunLongitude - Tropical longitude of Sun (0-360)
 * @param moonLongitude - Tropical longitude of Moon (0-360)
 * @param isVoidOfCourse - Whether the Moon is in Void-of-Course
 */
export function scoreWesternElection(
  sunLongitude: number,
  moonLongitude: number,
  isVoidOfCourse = false,
): WesternElectionScoreResult {
  const normSun = normalizeDegrees(sunLongitude);
  const normMoon = normalizeDegrees(moonLongitude);
  const phase = calculateBirthMoonPhase(normSun, normMoon);

  let score = 70;
  const notes: string[] = [];

  // 1. Moon Phase Scoring
  // Waxing (growing light) is generally auspicious for starting new ventures
  const isWaxing = phase.phaseAngle > 0 && phase.phaseAngle < 180;
  if (phase.key === 'new_moon') {
    score += 2;
    notes.push('Trăng Non: Khởi đầu mới');
  } else if (phase.key === 'waxing_crescent' || phase.key === 'first_quarter' || phase.key === 'waxing_gibbous') {
    score += 10;
    notes.push(`Trăng Tăng Trưởng (${phase.nameVi}): Thuận lợi phát triển`);
  } else if (phase.key === 'full_moon') {
    score += 12;
    notes.push('Trăng Tròn (Full Moon): Năng lượng đỉnh cao');
  } else if (phase.key === 'waning_crescent') {
    score -= 10;
    notes.push('Trăng Tàn (Balsamic): Hạn chế khởi sự lớn');
  } else {
    score -= 2;
  }

  // 2. Moon Essential Dignity
  const moonSignIndex = Math.floor(normMoon / 30);
  let dignityLabel = 'Bình Hòa';
  if (moonSignIndex === 3) {
    // Cancer - Domicile
    score += 8;
    dignityLabel = 'Mặt Trăng tại Cự Giải (Chính vị/Domicile)';
    notes.push(dignityLabel);
  } else if (moonSignIndex === 1) {
    // Taurus - Exaltation
    score += 10;
    dignityLabel = 'Mặt Trăng tại Kim Ngưu (Đắc địa/Exaltation)';
    notes.push(dignityLabel);
  } else if (moonSignIndex === 9) {
    // Capricorn - Detriment
    score -= 8;
    dignityLabel = 'Mặt Trăng tại Ma Kết (Thất thế/Detriment)';
    notes.push(dignityLabel);
  } else if (moonSignIndex === 7) {
    // Scorpio - Fall
    score -= 10;
    dignityLabel = 'Mặt Trăng tại Bọ Cạp (Hãm địa/Fall)';
    notes.push(dignityLabel);
  }

  // 3. Void-of-Course Penalty
  if (isVoidOfCourse) {
    score -= 15;
    notes.push('Mặt Trăng Không Hướng (Void of Course): Không nên ký kết hợp đồng quan trọng');
  }

  return {
    score: Math.max(15, Math.min(98, score)),
    phaseName: phase.nameVi,
    isWaxing,
    dignityLabel,
    notes,
  };
}
