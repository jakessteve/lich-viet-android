import { CHI_XUNG, TAM_SAT_YEARLY, NGU_HOANG_ANCHOR_YEAR, NGU_HOANG_CYCLE, CUU_CUNG_PALACE_MAP } from './constants';
import type { Chi } from '../types/calendar';

/**
 * Yearly Stars and Directional Evaluation (Khai Sơn Lập Hướng)
 * Based on Hiệp Kỷ Biện Phương Thư
 */

export interface YearlyStar {
  name: string;
  direction: string;
  directionDetail?: string;
  description: string;
  type: 'Good' | 'Bad';
}

/**
 * Calculate Ngũ Hoàng (Five Yellow Star) palace position for a given year.
 * The yearly Center Star decreases by 1 each year, meaning Ngũ Hoàng's position increases by 1.
 * Palace layout: 1=Bắc(Khảm), 2=Tây Nam(Khôn), 3=Đông(Chấn), 4=Đông Nam(Tốn),
 *               5=Trung Cung, 6=Tây Bắc(Càn), 7=Tây(Đoài), 8=Đông Bắc(Cấn), 9=Nam(Ly)
 */
function getNguHoangPalace(lunarYear: number): { palace: number; direction: string; detail: string } {
  // Standard Huyền Không formula:
  // In 2024, the Center Star is 3. Following the Lo Shu path, star 5 (Ngũ Hoàng) lands in Palace 7 (Đoài/Tây).
  // The position increases by 1 each year. Anchor year 2017 was Palace 9 (resulting in 0->9 logic).
  let raw = (((lunarYear - NGU_HOANG_ANCHOR_YEAR) % NGU_HOANG_CYCLE) + NGU_HOANG_CYCLE) % NGU_HOANG_CYCLE;
  if (raw === 0) raw = NGU_HOANG_CYCLE;
  const palace = raw;

  return { palace, ...CUU_CUNG_PALACE_MAP[palace] };
}

export function getYearlyStars(yearChi: Chi, lunarYear?: number): YearlyStar[] {
  const stars: YearlyStar[] = [];

  // 1. Tam Sát (Yearly) — lookup from TAM_SAT_YEARLY table in constants
  const tamSatEntry = TAM_SAT_YEARLY.find((row) => row.chis.includes(yearChi));
  const tamSatDir = tamSatEntry?.direction ?? '';
  const tamSatDetail = tamSatEntry?.detail ?? '';

  stars.push({
    name: 'Tam Sát',
    direction: tamSatDir,
    directionDetail: tamSatDetail,
    type: 'Bad',
    description: 'Kị động thổ, tu tạo, khởi công ở phương này.',
  });

  // 2. Thái Tuế & Tuế Phá — CHI_XUNG imported from constants
  stars.push({
    name: 'Thái Tuế',
    direction: `Phương ${yearChi}`,
    directionDetail: '',
    type: 'Bad',
    description: 'Chủ quản năm, kị động thổ mạnh.',
  });
  stars.push({
    name: 'Tuế Phá',
    direction: `Phương ${CHI_XUNG[yearChi as Chi]}`,

    directionDetail: '',
    type: 'Bad',
    description: 'Đại hung, xung với Thái Tuế.',
  });

  // 3. Ngũ Hoàng (Huyền Không - Yearly) — Rotating through Cửu Cung
  const nguHoang = lunarYear ? getNguHoangPalace(lunarYear) : { direction: 'Trung Cung', detail: '(Giữa nhà)' };
  stars.push({
    name: 'Ngũ Hoàng',
    direction: nguHoang.direction,
    directionDetail: nguHoang.detail,
    type: 'Bad',
    description: 'Nghi tĩnh, không nên xáo trộn.',
  });

  return stars;
}
