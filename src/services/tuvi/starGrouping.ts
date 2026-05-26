/**
 * Star Grouping — categorizing and grouping stars in a Tử Vi chart.
 *
 * Pure TypeScript — zero React dependencies.
 */

import type { TuViStar, TuViPalace } from '../../types/tuvi';
import { STAR_COLORS, BRIGHTNESS_MARKERS, CHINH_TINH_LIST, PHU_TINH_LIST } from './constants';

const SAT_TINH_NAMES = ['Kình Dương', 'Đà La', 'Hỏa Tinh', 'Linh Tinh', 'Địa Không', 'Địa Kiếp'];
const NGU_HANH_ELEMENTS = new Set(['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ']);
const CHINH_TINH_BY_NAME = new Map(CHINH_TINH_LIST.map((star) => [star.name, star] as const));
const PHU_TINH_BY_NAME = new Map(PHU_TINH_LIST.map((star) => [star.name, star] as const));

/**
 * Normalizes a star Ngũ Hành string to its elemental core.
 *
 * The catalog stores values like "Âm Thổ" and "Dương Kim". For color rendering we
 * only want the core element, because the academic color convention follows the five
 * elements rather than the âm/dương prefix.
 */
export function getNguHanhElement(nguHanh: string): string {
  const trimmed = nguHanh.trim();
  if (!trimmed) return 'Thổ';

  if (NGU_HANH_ELEMENTS.has(trimmed)) {
    return trimmed;
  }

  const parts = trimmed.split(/\s+/);
  const lastPart = parts[parts.length - 1] ?? 'Thổ';
  return NGU_HANH_ELEMENTS.has(lastPart) ? lastPart : 'Thổ';
}

/**
 * Groups an array of stars by their type.
 */
export function groupStarsByType(stars: TuViStar[]): {
  chinhTinh: TuViStar[];
  phuTinh: TuViStar[];
  satTinh: TuViStar[];
  tuHoa: TuViStar[];
  luuDieu: TuViStar[];
} {
  const result = {
    chinhTinh: [] as TuViStar[],
    phuTinh: [] as TuViStar[],
    satTinh: [] as TuViStar[],
    tuHoa: [] as TuViStar[],
    luuDieu: [] as TuViStar[],
  };
  for (const star of stars) {
    switch (star.type) {
      case 'chinhTinh':
        result.chinhTinh.push(star);
        break;
      case 'phuTinh':
        result.phuTinh.push(star);
        break;
      case 'satTinh':
        result.satTinh.push(star);
        break;
      case 'tuHoa':
        result.tuHoa.push(star);
        break;
      case 'luuDieu':
        result.luuDieu.push(star);
        break;
    }
  }
  return result;
}

/**
 * Groups stars by their Ngũ Hành element (Kim, Mộc, Thủy, Hỏa, Thổ).
 * Extracts the element from the nguHanh string (e.g. "Âm Thổ" → "Thổ").
 */
export function groupStarsByNguHanh(stars: TuViStar[]): Record<string, TuViStar[]> {
  const result: Record<string, TuViStar[]> = {};
  for (const star of stars) {
    const element = getNguHanhElement(star.nguHanh);
    if (!result[element]) {
      result[element] = [];
    }
    result[element].push(star);
  }
  return result;
}

/**
 * Returns the hex color for a star based on its Ngũ Hành element.
 */
export function getStarColor(star: TuViStar): string {
  const element = getNguHanhElement(star.nguHanh);
  return STAR_COLORS[element] ?? '#888888';
}

/**
 * Returns the short brightness marker for a star.
 */
export function getStarBrightnessMarker(star: TuViStar): string {
  return BRIGHTNESS_MARKERS[star.brightness] ?? '';
}

/**
 * Looks up the Ngũ Hành string for a star by name.
 */
function findStarNguHanh(starName: string): string | null {
  const chinh = CHINH_TINH_BY_NAME.get(starName);
  if (chinh) return chinh.nguHanh;
  const phu = PHU_TINH_BY_NAME.get(starName);
  if (phu) return phu.nguHanh;
  return null;
}

/**
 * Formats palace stars for display:
 * - chinhTinhLines: Major stars, one per line, with brightness marker
 * - phuTinhLines: Auxiliary stars, two per line (column layout)
 * - tuHoaLabels: Tứ Hóa labels with color indicators
 */
export function formatPalaceStars(palace: TuViPalace): {
  chinhTinhLines: string[];
  phuTinhLines: string[];
  satTinhLines: string[];
  tuHoaLabels: string[];
} {
  const chinhTinhLines = palace.chinhTinh.map((star) => {
    const marker = getStarBrightnessMarker(star);
    return `${star.name}${marker}`;
  });

  const phuTinhLines: string[] = [];
  for (let i = 0; i < palace.phuTinh.length; i += 2) {
    const pair = palace.phuTinh.slice(i, i + 2);
    phuTinhLines.push(pair.map((s) => s.name).join(', '));
  }

  const satTinhLines = palace.satTinh.map((star) => {
    const marker = getStarBrightnessMarker(star);
    return `${star.name}${marker}`;
  });

  const tuHoaLabels = palace.tuHoa.map((tuHoa) => {
    const nguHanh = findStarNguHanh(tuHoa.starName);
    const element = nguHanh ? getNguHanhElement(nguHanh) : null;
    const color = element ? (STAR_COLORS[element] ?? '#888888') : '#888888';
    return `${tuHoa.type} [${color}]`;
  });

  return { chinhTinhLines, phuTinhLines, satTinhLines, tuHoaLabels };
}

/**
 * Checks if a star is one of the 14 Chính Tinh.
 */
export function isChinhTinh(starName: string): boolean {
  return CHINH_TINH_LIST.some((s) => s.name === starName);
}

/**
 * Checks if a star is one of the 6 Sát Tinh
 * (Kình Dương, Đà La, Hỏa Tinh, Linh Tinh, Địa Không, Địa Kiếp).
 */
export function isSatTinh(starName: string): boolean {
  return SAT_TINH_NAMES.includes(starName);
}
