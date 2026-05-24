import { CAN, CHI, getSeasonIndex, SON_NGAN_DAYS_DU, SON_NGAN_DAYS_THIEU } from './constants';
import { Can, Chi } from '../types/calendar';
import extraStarsData from '../data/phase_1/extraStarsData.json';

interface StarMatch {
  name: string;
  type: 'good' | 'bad';
}

/**
 * Data-driven tables for extra stars logic
 */

interface ExtraStarsData {
  canChiStars: Record<string, StarMatch[]>;
  dayChiStars: Record<string, StarMatch[]>;
  monthMaps: Record<string, string[]>;
  seasonChiMatches: Record<string, Record<string, string[]>>;
  canChiGroups: Record<string, string[]>;
  daiminhGroups: Record<string, string[]>;
  thatthanhGroups: Record<string, string[]>;
  hoidongGroups: Record<string, string[]>;
  xichKhauPatterns: Record<string, { positive: number[]; negative: number[] }>;
  tuHuBai: never[]; // Not used
}

const {
  canChiStars: CAN_CHI_STARS,
  dayChiStars: DAY_CHI_STARS,
  monthMaps: MONTH_MAPS,
  seasonChiMatches: SEASON_CHI_MATCHES,
  canChiGroups: CAN_CHI_GROUPS,
  daiminhGroups: DAIMINH_GROUPS,
  thatthanhGroups: THATTHANH_GROUPS,
  hoidongGroups: HOIDONG_GROUPS,
  xichKhauPatterns: XICH_KHAU_PATTERNS,
  tuHuBai: _tuHuBaiList,
} = extraStarsData as unknown as ExtraStarsData;

// ── Module-level lookup tables (not recreated on each call) ───

// removed XICH_KHAU_PATTERNS local definition as it is imported from JSON

export function getExtraStars(
  lunarMonth: number,
  lunarDay: number,
  dayCan: Can,
  dayChi: Chi,
  truc: string,
  th30: boolean,
  yearCan: Can,
): { goodStars: string[]; badStars: string[] } {
  const goodStars: string[] = [];
  const badStars: string[] = [];

  const addedStars = new Set<string>();
  const addStar = (name: string, type: 'good' | 'bad') => {
    const key = `${type}:${name}`;
    if (addedStars.has(key)) return;
    addedStars.add(key);
    if (type === 'good') goodStars.push(name);
    else badStars.push(name);
  };

  // 1. Can-Chi combined matches
  const ccKey = `${dayCan} ${dayChi}`;
  (CAN_CHI_STARS[ccKey] || []).forEach((s: StarMatch) => addStar(s.name, s.type));

  // 2. Day Chi matches
  (DAY_CHI_STARS[dayChi] || []).forEach((s: StarMatch) => addStar(s.name, s.type));

  // 3. Month & Season
  const mIdx = (lunarMonth - 1) % 12;
  const season = getSeasonIndex(lunarMonth); // 0=Xuân, 1=Hạ, 2=Thu, 3=Đông

  if (dayChi === MONTH_MAPS.batToa[mIdx]) addStar('Bát Tọa', 'bad');
  if (dayChi === MONTH_MAPS.nguyenVu[mIdx]) addStar('Nguyên Vũ', 'bad');
  if (dayChi === MONTH_MAPS.phucSinh[mIdx]) addStar('Phúc Sinh', 'good');
  if (dayChi === MONTH_MAPS.catKhanh[mIdx]) addStar('Cát Khánh', 'good');
  if (dayChi === MONTH_MAPS.amDuc[mIdx]) {
    addStar('Âm Đức', 'good');
    addStar('Nhân Cách', 'bad');
  }
  if (dayChi === MONTH_MAPS.thienLai[mIdx]) {
    addStar('Thiên Lại', 'bad');
    addStar('Trí Tử', 'bad');
  }
  if (dayChi === MONTH_MAPS.ngamThan[mIdx]) addStar('Ngâm Thần', 'bad');

  if (SEASON_CHI_MATCHES.tuQuyBatToa[season].includes(dayChi)) addStar('Tứ Quý Bát Tọa', 'bad');
  if (SEASON_CHI_MATCHES.nguHu[season].includes(dayChi)) {
    addStar('Ngũ Hư', 'bad');
    addStar('Hoang Vu', 'bad');
    addStar('Cửu Khổ Bát Cùng', 'bad');
  }
  if (SEASON_CHI_MATCHES.satSuNhat[season].includes(dayChi)) addStar('Sát Sư Nhật', 'bad');
  if (SEASON_CHI_MATCHES.thuNhat[season].includes(dayChi)) addStar('Thủ Nhật', 'good');
  if (SEASON_CHI_MATCHES.phucThi[season].includes(dayChi)) addStar('Phục Thi', 'bad');

  // 4. Can-Chi Dynamic Groups
  if (CAN_CHI_GROUPS[dayCan].includes(dayChi)) addStar('Thần Tại', 'good');
  if (DAIMINH_GROUPS[dayCan].includes(dayChi)) addStar('Đại Minh', 'good');
  if (THATTHANH_GROUPS[dayCan].includes(dayChi)) addStar('Thất Thánh', 'good');
  if (HOIDONG_GROUPS[dayCan]?.includes(dayChi)) addStar('Hội Đồng', 'good');

  // 5. Special Formulas
  // Xich Khẩu
  const amNien = CAN.indexOf(yearCan) % 2 === 1;
  const m6 = lunarMonth % 6 || 6;
  const pattern = XICH_KHAU_PATTERNS[m6];
  if (pattern) {
    const isXK = !amNien ? pattern.positive.includes(lunarDay) : pattern.negative.includes(lunarDay);
    if (isXK) addStar('Xích Khẩu', 'bad');
  }

  // Tứ Hư Bại
  const tuHuBai: Record<number, { can: Can; chi: Chi }> = {
    0: { can: 'Kỷ', chi: 'Dậu' },
    1: { can: 'Giáp', chi: 'Tý' },
    2: { can: 'Tân', chi: 'Mão' },
    3: { can: 'Mậu', chi: 'Ngọ' },
  };
  if (tuHuBai[season].can === dayCan && tuHuBai[season].chi === dayChi) addStar('Tứ Hư', 'bad');

  // Long Hội (Trực Nguy)
  if (truc === 'Nguy') {
    const nguyChi = CHI[(lunarMonth + 8) % 12];
    if (dayChi === nguyChi) {
      addStar('Long Hội', 'bad');
      addStar('Tứ Hư', 'bad');
    }
  }

  // Sơn Ngân
  const sonNganDays = th30 ? SON_NGAN_DAYS_DU : SON_NGAN_DAYS_THIEU;
  if (sonNganDays.includes(lunarDay as never)) addStar('Sơn Ngân', 'bad');

  return { goodStars, badStars };
}
