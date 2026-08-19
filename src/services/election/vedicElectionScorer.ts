import { normalizeDegrees } from '@/utils/astroUtils';

export interface VedicElectionScoreResult {
  score: number;
  tithiNumber: number;
  tithiName: string;
  isRikta: boolean;
  notes: string[];
}

const TITHI_NAMES = [
  'Pratipada (1)',
  'Dvitiya (2)',
  'Tritiya (3)',
  'Chaturthi (4 - Rikta)',
  'Panchami (5)',
  'Shashthi (6)',
  'Saptami (7)',
  'Ashtami (8)',
  'Navami (9 - Rikta)',
  'Dashami (10)',
  'Ekadashi (11)',
  'Dvadashi (12)',
  'Trayodashi (13)',
  'Chaturdashi (14 - Rikta)',
  'Purnima / Amavasya (15/30)',
];

/**
 * Computes a high-precision Vedic Panchanga Election Score based on true elongation.
 *
 * @param sunSidereal - Sidereal longitude of Sun
 * @param moonSidereal - Sidereal longitude of Moon
 * @param dayOfWeek - Day of week index (0=Sun, 1=Mon, ..., 6=Sat)
 */
export function scoreVedicElection(
  sunSidereal: number,
  moonSidereal: number,
  dayOfWeek: number,
): VedicElectionScoreResult {
  const elongation = normalizeDegrees(moonSidereal - sunSidereal);
  const tithiIndex = Math.floor(elongation / 12) + 1; // 1 to 30

  let score = 70;
  const notes: string[] = [];

  // 1. Tithi (Lunar Phase Day)
  const isShukla = tithiIndex <= 15; // Shukla Paksha (Bright fortnight) vs Krishna Paksha
  const tithiInPaksha = tithiIndex <= 15 ? tithiIndex : tithiIndex - 15;
  const tithiName = `${isShukla ? 'Shukla' : 'Krishna'} ${TITHI_NAMES[tithiInPaksha - 1] || tithiIndex}`;

  const riktaTithisInPaksha = [4, 9, 14];
  const isRikta = riktaTithisInPaksha.includes(tithiInPaksha);

  if (isRikta) {
    score -= 18;
    notes.push(`Rikta Tithi (${tithiName}): Ngày rỗng, kỵ khởi sự việc lớn`);
  } else if (tithiIndex === 30) {
    score -= 22;
    notes.push('Amavasya (Không Nguyệt): Ngày hội tụ tối, chỉ hợp chiêm niệm/tâm linh');
  } else if (tithiIndex === 15) {
    score += 15;
    notes.push('Purnima (Viên Mãn): Ngày trăng tròn đại cát');
  } else if ([2, 3, 5, 7, 10, 11, 13].includes(tithiInPaksha)) {
    score += 10;
    notes.push(`Cát Tithi (${tithiName}): Thuận lợi cho công việc và giao dịch`);
  }

  // 2. Vara (Day of Week Lord)
  if (dayOfWeek === 4 || dayOfWeek === 5) {
    score += 8; // Guru (Thu) / Shukra (Fri)
    notes.push('Vara Cát: Ngày Mộc Tinh / Kim Tinh cai quản');
  } else if (dayOfWeek === 2 || dayOfWeek === 6) {
    score -= 6; // Mangala (Tue) / Shani (Sat)
    notes.push('Vara Thử Thách: Ngày Hỏa Tinh / Thổ Tinh cai quản');
  }

  return {
    score: Math.max(15, Math.min(96, score)),
    tithiNumber: tithiIndex,
    tithiName,
    isRikta,
    notes,
  };
}
