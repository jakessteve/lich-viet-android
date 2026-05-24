/**
 * personalHourScore.ts — Personalized hour auspiciousness modifier
 *
 * Combines 3 schools:
 * 1. Bát Tự (Nhật Chủ & Thái Tuế interactions)
 * 2. Trạch Cát (Quý Nhân, Lộc, Mã)
 * 3. QMDJ (Mệnh Cung in current Board)
 */

import type { Chi, Can, CanChi } from '../../types/calendar';
import { getCanChiYear, getCanChiDay, parseCanChi } from '../../utils/calendarEngine';
import { generateQmdjChart, interpretQmdjChart } from '../../utils/qmdjEngine';
import { resolvePersonalBirthMoment, type PersonalBirthDetails } from './birthMath';

export interface PersonalHourModifier {
  totalModifier: number;
  flags: string[];
  breakdowns: string[];
}

const isLucXung = (c1: Chi, c2: Chi): boolean => {
  const groups: [Chi, Chi][] = [
    ['Tý', 'Ngọ'],
    ['Sửu', 'Mùi'],
    ['Dần', 'Thân'],
    ['Mão', 'Dậu'],
    ['Thìn', 'Tuất'],
    ['Tỵ', 'Hợi'],
  ];
  return groups.some(([a, b]) => (c1 === a && c2 === b) || (c1 === b && c2 === a));
};

const isTuongXungCan = (can1: Can, can2: Can): boolean => {
  const groups: [Can, Can][] = [
    ['Giáp', 'Canh'],
    ['Ất', 'Tân'],
    ['Nhâm', 'Bính'],
    ['Quý', 'Đinh'],
  ];
  return groups.some(([a, b]) => (can1 === a && can2 === b) || (can1 === b && can2 === a));
};

const isLucHop = (c1: Chi, c2: Chi): boolean => {
  const groups: [Chi, Chi][] = [
    ['Tý', 'Sửu'],
    ['Dần', 'Hợi'],
    ['Mão', 'Tuất'],
    ['Thìn', 'Dậu'],
    ['Tỵ', 'Thân'],
    ['Ngọ', 'Mùi'],
  ];
  return groups.some(([a, b]) => (c1 === a && c2 === b) || (c1 === b && c2 === a));
};

const isTamHop = (c1: Chi, c2: Chi): boolean => {
  const groups: Chi[][] = [
    ['Dần', 'Ngọ', 'Tuất'],
    ['Hợi', 'Mão', 'Mùi'],
    ['Thân', 'Tý', 'Thìn'],
    ['Tỵ', 'Dậu', 'Sửu'],
  ];
  return groups.some((group) => group.includes(c1) && group.includes(c2));
};

// Trạch Cát (Personal Stars)
const getQuyNhan = (can: Can): Chi[] => {
  const qn: Record<Can, Chi[]> = {
    Giáp: ['Sửu', 'Mùi'],
    Ất: ['Tý', 'Thân'],
    Bính: ['Hợi', 'Dậu'],
    Đinh: ['Hợi', 'Dậu'],
    Mậu: ['Sửu', 'Mùi'],
    Kỷ: ['Tý', 'Thân'],
    Canh: ['Sửu', 'Mùi'],
    Tân: ['Dần', 'Ngọ'],
    Nhâm: ['Mão', 'Tỵ'],
    Quý: ['Mão', 'Tỵ'],
  };
  return qn[can] || [];
};

const getLocThan = (can: Can): Chi | null => {
  const loc: Record<Can, Chi> = {
    Giáp: 'Dần',
    Ất: 'Mão',
    Bính: 'Tỵ',
    Đinh: 'Ngọ',
    Mậu: 'Tỵ',
    Kỷ: 'Ngọ',
    Canh: 'Thân',
    Tân: 'Dậu',
    Nhâm: 'Hợi',
    Quý: 'Tý',
  };
  return loc[can] || null;
};

const getDichMa = (chi: Chi): Chi | null => {
  const ma: Record<Chi, Chi> = {
    Dần: 'Thân',
    Ngọ: 'Thân',
    Tuất: 'Thân',
    Thân: 'Dần',
    Tý: 'Dần',
    Thìn: 'Dần',
    Tỵ: 'Hợi',
    Dậu: 'Hợi',
    Sửu: 'Hợi',
    Hợi: 'Tỵ',
    Mão: 'Tỵ',
    Mùi: 'Tỵ',
  };
  return ma[chi] || null;
};

/**
 * Calculate personalized hour modifier.
 * No premium gating — available to all authenticated users with birthday details.
 */
export function calculatePersonalHourModifier(
  birthYear: number | undefined | null,
  birthMonth: number | undefined | null,
  birthDay: number | undefined | null,
  hourCanChi: CanChi,
  dayCanChi: CanChi,
  date: Date,
  birthDetails?: PersonalBirthDetails | null,
): PersonalHourModifier | null {
  if (!birthYear) return null;

  let totalModifier = 0;
  const flags: string[] = [];
  const breakdowns: string[] = [];

  // Derive user's Can Chi from birth year
  const userYearCanChi = parseCanChi(getCanChiYear(birthYear));
  const userYearCan = userYearCanChi.can;
  const userYearChi = userYearCanChi.chi;

  // Derive user's day Can Chi if birth month/day available
  let userDayCan: Can | undefined;
  let userDayChi: Chi | undefined;
  const resolvedBirth =
    birthMonth != null && birthDay != null
      ? resolvePersonalBirthMoment(birthYear, birthDetails ?? { birthMonth, birthDay })
      : null;
  if (birthMonth != null && birthDay != null) {
    if (resolvedBirth?.dayCanChi) {
      userDayCan = resolvedBirth.dayCanChi.can;
      userDayChi = resolvedBirth.dayCanChi.chi;
    } else {
      const birthDate = new Date(birthYear, birthMonth - 1, birthDay, 12, 0);
      const dayCC = parseCanChi(getCanChiDay(birthDate));
      userDayCan = dayCC.can;
      userDayChi = dayCC.chi;
    }
  }

  // 1. Bát Tự (Tử Bình) Interactions — Nhật Chủ (Day Pillar)
  if (userDayCan && userDayChi) {
    if (isLucXung(userDayChi, hourCanChi.chi)) {
      if (isTuongXungCan(userDayCan, hourCanChi.can)) {
        totalModifier -= 40;
        flags.push('thien_khac_dia_xung');
        breakdowns.push('Thiên Khắc Địa Xung với Nhật Chủ (-40%)');
      } else {
        totalModifier -= 20;
        flags.push('xung_nhat_chu');
        breakdowns.push('Lục Xung với Nhật Chủ (-20%)');
      }
    } else if (isLucHop(userDayChi, hourCanChi.chi) || isTamHop(userDayChi, hourCanChi.chi)) {
      totalModifier += 15;
      flags.push('hop_nhat_chu');
      breakdowns.push('Tương hợp với Nhật Chủ (+15%)');
    } else if (userDayChi === hourCanChi.chi) {
      totalModifier -= 5;
      breakdowns.push('Trị Nhật Chủ (-5%)');
    }
  }

  // 2. Thái Tuế (Year Pillar)
  if (isLucXung(userYearChi, hourCanChi.chi)) {
    totalModifier -= 10;
    flags.push('xung_thai_tue');
    breakdowns.push('Xung Thái Tuế (-10%)');
  } else if (isLucHop(userYearChi, hourCanChi.chi) || isTamHop(userYearChi, hourCanChi.chi)) {
    totalModifier += 10;
    flags.push('hop_thai_tue');
    breakdowns.push('Tương hợp với Thái Tuế (+10%)');
  }

  // 3. Trạch Cát (Thần Sát)
  const targetCan = userDayCan || userYearCan;
  const targetChi = userDayChi || userYearChi;

  if (getQuyNhan(targetCan).includes(hourCanChi.chi)) {
    totalModifier += 20;
    flags.push('quy_nhan');
    breakdowns.push('Giờ Thiên Ất Quý Nhân (+20%)');
  }

  if (getLocThan(targetCan) === hourCanChi.chi) {
    totalModifier += 15;
    flags.push('loc_than');
    breakdowns.push('Giờ Lộc Thần (+15%)');
  }

  if (getDichMa(targetChi) === hourCanChi.chi) {
    totalModifier += 10;
    flags.push('dich_ma');
    breakdowns.push('Giờ Dịch Mã (+10%)');
  }

  if (birthDetails?.birthHour != null && resolvedBirth?.hourCanChi) {
    if (resolvedBirth.hourCanChi.chi === hourCanChi.chi) {
      totalModifier += 3;
      flags.push('trung_gio_sinh');
      breakdowns.push('Trùng giờ sinh (+3%)');
    } else if (isLucXung(resolvedBirth.hourCanChi.chi, hourCanChi.chi)) {
      totalModifier -= 6;
      flags.push('xung_gio_sinh');
      breakdowns.push('Lục Xung với giờ sinh (-6%)');
    } else if (isLucHop(resolvedBirth.hourCanChi.chi, hourCanChi.chi) || isTamHop(resolvedBirth.hourCanChi.chi, hourCanChi.chi)) {
      totalModifier += 5;
      flags.push('hop_gio_sinh');
      breakdowns.push('Tương hợp với giờ sinh (+5%)');
    }
  }

  // 4. Kỳ Môn Độn Giáp
  try {
    const qmdjChart = generateQmdjChart(date, hourCanChi.chi);
    const interpretations = interpretQmdjChart(qmdjChart);
    const menhCung = qmdjChart.palaces.find((p) => p.heavenlyStem === userYearCan);
    if (menhCung && menhCung.number !== 5) {
      const qmdjInterp = interpretations.find((i) => i.palaceNumber === menhCung.number);
      if (qmdjInterp && qmdjInterp.doorStarCombo) {
        if (qmdjInterp.overallAuspiciousness === 'cat') {
          totalModifier += 15;
          flags.push('qmdj_cat');
          breakdowns.push(`Kỳ Môn Cát Cung (+15%)`);
        } else if (qmdjInterp.overallAuspiciousness === 'hung') {
          totalModifier -= 15;
          flags.push('qmdj_hung');
          breakdowns.push(`Kỳ Môn Hung Cung (-15%)`);
        }
      }
    }
  } catch {
    // QMDJ engine may fail for some dates — gracefully degrade
  }

  return { totalModifier, flags, breakdowns };
}
