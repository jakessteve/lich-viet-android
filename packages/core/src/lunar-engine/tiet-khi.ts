import { getSunLongitude } from './solar-longitude.js';
import { gregorianToJD, jdToGregorian } from './julian-day.js';

export interface TietKhiInfo {
  index: number; // 0 to 23
  nameVi: string;
  nameSino: string;
  targetLongitudeDegrees: number;
  isMajorTerm: boolean; // Trung Khí (even indices: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22)
}

export const TIET_KHI_NAMES: { nameVi: string; nameSino: string }[] = [
  { nameVi: 'Xuân Phân', nameSino: '春分' },   // 0°
  { nameVi: 'Thanh Minh', nameSino: '清明' },  // 15°
  { nameVi: 'Cốc Vũ', nameSino: '穀雨' },     // 30°
  { nameVi: 'Lập Hạ', nameSino: '立夏' },     // 45°
  { nameVi: 'Tiểu Mãn', nameSino: '小滿' },   // 60°
  { nameVi: 'Mang Chủng', nameSino: '芒種' }, // 75°
  { nameVi: 'Hạ Chí', nameSino: '夏至' },     // 90°
  { nameVi: 'Tiểu Thử', nameSino: '小暑' },   // 105°
  { nameVi: 'Đại Thử', nameSino: '大暑' },    // 120°
  { nameVi: 'Lập Thu', nameSino: '立秋' },    // 135°
  { nameVi: 'Xử Thử', nameSino: '處暑' },     // 150°
  { nameVi: 'Bạch Lộ', nameSino: '白露' },    // 165°
  { nameVi: 'Thu Phân', nameSino: '秋分' },   // 180°
  { nameVi: 'Hàn Lộ', nameSino: '寒露' },     // 195°
  { nameVi: 'Sương Giáng', nameSino: '霜降' }, // 210°
  { nameVi: 'Lập Đông', nameSino: '立冬' },   // 225°
  { nameVi: 'Tiểu Tuyết', nameSino: '小雪' }, // 240°
  { nameVi: 'Đại Tuyết', nameSino: '大雪' },  // 255°
  { nameVi: 'Đông Chí', nameSino: '冬至' },   // 270°
  { nameVi: 'Tiểu Hàn', nameSino: '小寒' },   // 285°
  { nameVi: 'Đại Hàn', nameSino: '大寒' },    // 300°
  { nameVi: 'Lập Xuân', nameSino: '立春' },   // 315°
  { nameVi: 'Vũ Thủy', nameSino: '雨水' },    // 330°
  { nameVi: 'Kinh Trập', nameSino: '驚蟄' },  // 345°
];

export function getTietKhi(jd: number): TietKhiInfo {
  const sunLong = getSunLongitude(jd);
  const index = Math.floor(sunLong / 15) % 24;
  const item = TIET_KHI_NAMES[index]!;
  return {
    index,
    nameVi: item.nameVi,
    nameSino: item.nameSino,
    targetLongitudeDegrees: index * 15,
    isMajorTerm: index % 2 === 0,
  };
}

export function findTietKhiTransition(
  year: number,
  termIndex: number
): { transitionJD: number; isoUtc7: string } {
  // Approximate day of year for the given solar term
  const targetLong = termIndex * 15;
  let estJD = gregorianToJD(year, 1, 1) + (termIndex * 15.218 + 79) % 365.25;

  // 4-iteration Newton-Raphson solver
  for (let i = 0; i < 4; i++) {
    const currentLong = getSunLongitude(estJD);
    let diff = currentLong - targetLong;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    estJD = estJD - diff / 0.9856473;
  }

  // Convert JD to UTC+7 ISO string
  const jdUtc7 = estJD + 7 / 24;
  const g = jdToGregorian(jdUtc7);
  const pad = (n: number) => String(n).padStart(2, '0');
  const isoUtc7 = `${g.year}-${pad(g.month)}-${pad(g.day)}T${pad(g.hour)}:${pad(g.minute)}:${pad(g.second)}+07:00`;

  return {
    transitionJD: estJD,
    isoUtc7,
  };
}
