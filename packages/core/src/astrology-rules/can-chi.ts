import { gregorianToJD } from '../lunar-engine/julian-day.js';
import { solarToLunar } from '../lunar-engine/converter.js';

export type ThienCan =
  | 'Giáp'
  | 'Ất'
  | 'Bính'
  | 'Đinh'
  | 'Mậu'
  | 'Kỷ'
  | 'Canh'
  | 'Tân'
  | 'Nhâm'
  | 'Quý';

export type DiaChi =
  | 'Tý'
  | 'Sửu'
  | 'Dần'
  | 'Mão'
  | 'Thìn'
  | 'Tỵ'
  | 'Ngọ'
  | 'Mùi'
  | 'Thân'
  | 'Dậu'
  | 'Tuất'
  | 'Hợi';

export type NguHanh = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';

export const THIEN_CAN_LIST: ThienCan[] = [
  'Giáp',
  'Ất',
  'Bính',
  'Đinh',
  'Mậu',
  'Kỷ',
  'Canh',
  'Tân',
  'Nhâm',
  'Quý',
];

export const DIA_CHI_LIST: DiaChi[] = [
  'Tý',
  'Sửu',
  'Dần',
  'Mão',
  'Thìn',
  'Tỵ',
  'Ngọ',
  'Mùi',
  'Thân',
  'Dậu',
  'Tuất',
  'Hợi',
];

export interface CanChiItem {
  can: ThienCan;
  chi: DiaChi;
  name: string;
  napAm: string;
  element: NguHanh;
}

export interface CanChiPillars {
  year: CanChiItem;
  month: CanChiItem;
  day: CanChiItem;
  hour: CanChiItem;
}

const NAP_AM_TABLE: Record<string, { napAm: string; element: NguHanh }> = {
  'Giáp Tý': { napAm: 'Hải Trung Kim', element: 'Kim' },
  'Ất Sửu': { napAm: 'Hải Trung Kim', element: 'Kim' },
  'Bính Dần': { napAm: 'Lư Trung Hỏa', element: 'Hỏa' },
  'Đinh Mão': { napAm: 'Lư Trung Hỏa', element: 'Hỏa' },
  'Mậu Thìn': { napAm: 'Đại Lâm Mộc', element: 'Mộc' },
  'Kỷ Tỵ': { napAm: 'Đại Lâm Mộc', element: 'Mộc' },
  'Canh Ngọ': { napAm: 'Lộ Bàng Thổ', element: 'Thổ' },
  'Tân Mùi': { napAm: 'Lộ Bàng Thổ', element: 'Thổ' },
  'Nhâm Thân': { napAm: 'Kiếm Phong Kim', element: 'Kim' },
  'Quý Dậu': { napAm: 'Kiếm Phong Kim', element: 'Kim' },
  'Giáp Tuất': { napAm: 'Sơn Đầu Hỏa', element: 'Hỏa' },
  'Ất Hợi': { napAm: 'Sơn Đầu Hỏa', element: 'Hỏa' },
  'Bính Tý': { napAm: 'Giản Hạ Thủy', element: 'Thủy' },
  'Đinh Sửu': { napAm: 'Giản Hạ Thủy', element: 'Thủy' },
  'Mậu Dần': { napAm: 'Thành Đầu Thổ', element: 'Thổ' },
  'Kỷ Mão': { napAm: 'Thành Đầu Thổ', element: 'Thổ' },
  'Canh Thìn': { napAm: 'Bạch Lạp Kim', element: 'Kim' },
  'Tân Tỵ': { napAm: 'Bạch Lạp Kim', element: 'Kim' },
  'Nhâm Ngọ': { napAm: 'Dương Liễu Mộc', element: 'Mộc' },
  'Quý Mùi': { napAm: 'Dương Liễu Mộc', element: 'Mộc' },
  'Giáp Thân': { napAm: 'Tuyền Trung Thủy', element: 'Thủy' },
  'Ất Dậu': { napAm: 'Tuyền Trung Thủy', element: 'Thủy' },
  'Bính Tuất': { napAm: 'Ốc Thượng Thổ', element: 'Thổ' },
  'Đinh Hợi': { napAm: 'Ốc Thượng Thổ', element: 'Thổ' },
  'Mậu Tý': { napAm: 'Tích Lịch Hỏa', element: 'Hỏa' },
  'Kỷ Sửu': { napAm: 'Tích Lịch Hỏa', element: 'Hỏa' },
  'Canh Dần': { napAm: 'Tùng Bách Mộc', element: 'Mộc' },
  'Tân Mão': { napAm: 'Tùng Bách Mộc', element: 'Mộc' },
  'Nhâm Thìn': { napAm: 'Trường Lưu Thủy', element: 'Thủy' },
  'Quý Tỵ': { napAm: 'Trường Lưu Thủy', element: 'Thủy' },
  'Giáp Ngọ': { napAm: 'Sa Trung Kim', element: 'Kim' },
  'Ất Mùi': { napAm: 'Sa Trung Kim', element: 'Kim' },
  'Bính Thân': { napAm: 'Sơn Hạ Hỏa', element: 'Hỏa' },
  'Đinh Dậu': { napAm: 'Sơn Hạ Hỏa', element: 'Hỏa' },
  'Mậu Tuất': { napAm: 'Bình Địa Mộc', element: 'Mộc' },
  'Kỷ Hợi': { napAm: 'Bình Địa Mộc', element: 'Mộc' },
  'Canh Tý': { napAm: 'Bích Thượng Thổ', element: 'Thổ' },
  'Tân Sửu': { napAm: 'Bích Thượng Thổ', element: 'Thổ' },
  'Nhâm Dần': { napAm: 'Kim Bạch Kim', element: 'Kim' },
  'Quý Mão': { napAm: 'Kim Bạch Kim', element: 'Kim' },
  'Giáp Thìn': { napAm: 'Phúc Đăng Hỏa', element: 'Hỏa' },
  'Ất Tỵ': { napAm: 'Phúc Đăng Hỏa', element: 'Hỏa' },
  'Bính Ngọ': { napAm: 'Thiên Hà Thủy', element: 'Thủy' },
  'Đinh Mùi': { napAm: 'Thiên Hà Thủy', element: 'Thủy' },
  'Mậu Thân': { napAm: 'Đại Trạch Thổ', element: 'Thổ' },
  'Kỷ Dậu': { napAm: 'Đại Trạch Thổ', element: 'Thổ' },
  'Canh Tuất': { napAm: 'Thoa Xuyến Kim', element: 'Kim' },
  'Tân Hợi': { napAm: 'Thoa Xuyến Kim', element: 'Kim' },
  'Nhâm Tý': { napAm: 'Tang Đố Mộc', element: 'Mộc' },
  'Quý Sửu': { napAm: 'Tang Đố Mộc', element: 'Mộc' },
  'Giáp Dần': { napAm: 'Đại Khê Thủy', element: 'Thủy' },
  'Ất Mão': { napAm: 'Đại Khê Thủy', element: 'Thủy' },
  'Bính Thìn': { napAm: 'Sa Trung Thổ', element: 'Thổ' },
  'Đinh Tỵ': { napAm: 'Sa Trung Thổ', element: 'Thổ' },
  'Mậu Ngọ': { napAm: 'Thiên Thượng Hỏa', element: 'Hỏa' },
  'Kỷ Mùi': { napAm: 'Thiên Thượng Hỏa', element: 'Hỏa' },
  'Canh Thân': { napAm: 'Thạch Lựu Mộc', element: 'Mộc' },
  'Tân Dậu': { napAm: 'Thạch Lựu Mộc', element: 'Mộc' },
  'Nhâm Tuất': { napAm: 'Đại Hải Thủy', element: 'Thủy' },
  'Quý Hợi': { napAm: 'Đại Hải Thủy', element: 'Thủy' },
};

export function createCanChiItem(can: ThienCan, chi: DiaChi): CanChiItem {
  const name = `${can} ${chi}`;
  const info = NAP_AM_TABLE[name] || { napAm: 'Hải Trung Kim', element: 'Kim' };
  return {
    can,
    chi,
    name,
    napAm: info.napAm,
    element: info.element,
  };
}

export function getYearCanChi(lunarYear: number): CanChiItem {
  const canIndex = (lunarYear + 6) % 10;
  const chiIndex = (lunarYear + 8) % 12;
  const can = THIEN_CAN_LIST[canIndex >= 0 ? canIndex : canIndex + 10]!;
  const chi = DIA_CHI_LIST[chiIndex >= 0 ? chiIndex : chiIndex + 12]!;
  return createCanChiItem(can, chi);
}

export function getMonthCanChi(lunarYear: number, lunarMonth: number): CanChiItem {
  const yearCanIndex = (lunarYear + 6) % 10;
  const monthCanIndex = (yearCanIndex * 2 + lunarMonth + 1) % 10;
  const monthChiIndex = (lunarMonth + 1) % 12;
  const can = THIEN_CAN_LIST[monthCanIndex]!;
  const chi = DIA_CHI_LIST[monthChiIndex]!;
  return createCanChiItem(can, chi);
}

export function getDayCanChi(jd: number): CanChiItem {
  const jdn = Math.floor(jd + 0.5);
  const canIndex = (jdn + 7) % 10;
  const chiIndex = (jdn + 11) % 12;
  const can = THIEN_CAN_LIST[canIndex >= 0 ? canIndex : canIndex + 10]!;
  const chi = DIA_CHI_LIST[chiIndex >= 0 ? chiIndex : chiIndex + 12]!;
  return createCanChiItem(can, chi);
}

export function getHourCanChi(dayCan: ThienCan, hour: number, _minute = 0): CanChiItem {
  const chiIndex = Math.floor(((hour + 1) % 24) / 2);
  const chi = DIA_CHI_LIST[chiIndex]!;

  const dayCanIndex = THIEN_CAN_LIST.indexOf(dayCan);
  const tyHourCanIndex = ((dayCanIndex % 5) * 2) % 10;
  const hourCanIndex = (tyHourCanIndex + chiIndex) % 10;
  const can = THIEN_CAN_LIST[hourCanIndex]!;

  return createCanChiItem(can, chi);
}

export function getCanChiPillars(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
  hour = 12,
  minute = 0
): CanChiPillars {
  const lunar = solarToLunar(solarYear, solarMonth, solarDay);
  const jd = gregorianToJD(solarYear, solarMonth, solarDay, hour, minute);

  let targetJD = jd;
  if (hour >= 23) {
    targetJD += 1;
  }

  const year = getYearCanChi(lunar.year);
  const month = getMonthCanChi(lunar.year, lunar.month);
  const day = getDayCanChi(targetJD);
  const hourItem = getHourCanChi(day.can, hour, minute);

  return {
    year,
    month,
    day,
    hour: hourItem,
  };
}
