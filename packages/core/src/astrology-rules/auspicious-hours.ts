import { DIA_CHI_LIST, DiaChi } from './can-chi.js';

export interface HourAuspiciousInfo {
  chi: DiaChi;
  starName: string;
  isHoangDao: boolean;
  timeRange: string; // e.g. "23:00 - 00:59"
}

// 12 Stars in cyclic sequence starting from the lead star (Thanh Long)
const STAR_SEQUENCE = [
  { name: 'Thanh Long', isHoangDao: true },
  { name: 'Minh Đường', isHoangDao: true },
  { name: 'Thiên Hình', isHoangDao: false },
  { name: 'Chu Tước', isHoangDao: false },
  { name: 'Kim Quỹ', isHoangDao: true },
  { name: 'Thiên Đức', isHoangDao: true },
  { name: 'Bạch Hổ', isHoangDao: false },
  { name: 'Ngọc Đường', isHoangDao: true },
  { name: 'Thiên Lao', isHoangDao: false },
  { name: 'Huyền Vũ', isHoangDao: false },
  { name: 'Tư Mệnh', isHoangDao: true },
  { name: 'Câu Trận', isHoangDao: false },
];

const TIME_RANGES = [
  '23:00 - 00:59', // Tý
  '01:00 - 02:59', // Sửu
  '03:00 - 04:59', // Dần
  '05:00 - 06:59', // Mão
  '07:00 - 08:59', // Thìn
  '09:00 - 10:59', // Tỵ
  '11:00 - 12:59', // Ngọ
  '13:00 - 14:59', // Mùi
  '15:00 - 16:59', // Thân
  '17:00 - 18:59', // Dậu
  '19:00 - 20:59', // Tuất
  '21:00 - 22:59', // Hợi
];

/**
 * Returns the branch index where Thanh Long begins for a given Day Branch.
 */
function getThanhLongStartIndex(dayChi: DiaChi): number {
  switch (dayChi) {
    case 'Tý':
    case 'Ngọ':
      return 0; // Tý
    case 'Sửu':
    case 'Mùi':
      return 2; // Dần
    case 'Dần':
    case 'Thân':
      return 4; // Thìn
    case 'Mão':
    case 'Dậu':
      return 6; // Ngọ
    case 'Thìn':
    case 'Tuất':
      return 8; // Thân
    case 'Tỵ':
    case 'Hợi':
      return 10; // Tuất
  }
}

export function getAuspiciousHoursForDay(dayChi: DiaChi): HourAuspiciousInfo[] {
  const startChiIndex = getThanhLongStartIndex(dayChi);
  const result: HourAuspiciousInfo[] = [];

  for (let i = 0; i < 12; i++) {
    const chi = DIA_CHI_LIST[i]!;
    const starIndex = (i - startChiIndex + 12) % 12;
    const star = STAR_SEQUENCE[starIndex]!;

    result.push({
      chi,
      starName: star.name,
      isHoangDao: star.isHoangDao,
      timeRange: TIME_RANGES[i]!,
    });
  }

  return result;
}

/**
 * Determines Day Hoàng Đạo / Hắc Đạo status based on Lunar Month and Day Branch.
 */
export function getDayHoangDao(lunarMonth: number, dayChi: DiaChi): { isHoangDao: boolean; starName: string } {
  const normalizedMonth = ((lunarMonth - 1) % 6) + 1;
  const startBranchIndex = ((normalizedMonth - 1) * 2) % 12;

  const dayBranchIndex = DIA_CHI_LIST.indexOf(dayChi);
  const starIndex = (dayBranchIndex - startBranchIndex + 12) % 12;
  const star = STAR_SEQUENCE[starIndex]!;

  return {
    isHoangDao: star.isHoangDao,
    starName: star.name,
  };
}
