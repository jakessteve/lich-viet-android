import { CAN, CHI } from './constants';
import { Can, Chi } from '../types/calendar';

/**
 * Advanced Can Chi and Nap Am Relationships
 * Ported from Old Calendar logic (AmLich/Harry Tran)
 */

import napAmData from '../data/phase_1/napAmData.json';

const NAP_AM_HANH_MAP = napAmData.napAmHanhMap;
export const NAP_AM_5_HANH = napAmData.napAm5Hanh;

/**
 * Checks if two Nap Am elements are compatible (Hợp) or clashing (Khắc)
 * Returns: 1 for Hợp, -1 for Khắc, 0 for Neutral/Normal interaction
 */
export function checkNapAmCompatibility(naIndex1: number, naIndex2: number): number {
  const h1 = NAP_AM_HANH_MAP[naIndex1];
  const h2 = NAP_AM_HANH_MAP[naIndex2];

  const isException = (
    hA: number,
    hB: number,
    targetHA: number,
    targetHB: number,
    exceptionIndices: number[],
    idxA: number,
    idxB: number,
  ) => {
    // Match the element types and ensure the specific Nạp Âm is in the exception list
    if (hA === targetHA && hB === targetHB && exceptionIndices.includes(idxA)) return true;
    if (hB === targetHA && hA === targetHB && exceptionIndices.includes(idxB)) return true;
    return false;
  };

  // Thủy (4) - Hỏa (1) Exception: Phích Lịch (12), Sơn Hạ (16), Thiên Thượng (27) ARE compatible with Thủy.
  if (isException(h1, h2, 1, 4, [12, 16, 27], naIndex1, naIndex2)) return 1;

  // Thổ (2) - Thủy (4) Exception: Thiên Hà (21), Đại Hải (29) ARE NOT limited by Thổ.
  if (isException(h1, h2, 4, 2, [21, 29], naIndex1, naIndex2)) return 1;

  // Hỏa (1) - Kim (3) Exception: Kiếm Phong (4), Sa Trung (15) NEED Hỏa to be forged.
  if (isException(h1, h2, 3, 1, [4, 15], naIndex1, naIndex2)) return 1;

  // Kim (3) - Mộc (0) Exception: Bình Địa Mộc (17) is okay with Kim (axes prune it).
  if (isException(h1, h2, 0, 3, [17], naIndex1, naIndex2)) return 1;

  // Thổ (2) - Mộc (0) Exception: Lộ Bàng (3), Đại Dịch (22), Sa Trung (26) do not fear Mộc.
  if (isException(h1, h2, 2, 0, [3, 22, 26], naIndex1, naIndex2)) return 1;

  // Standard Ngu Hanh rules
  const sinhMap: Record<number, number> = { 3: 4, 4: 0, 0: 1, 1: 2, 2: 3 }; // h1 sinh h2
  const khacMap: Record<number, number> = { 3: 0, 0: 2, 2: 4, 4: 1, 1: 3 }; // h1 khắc h2

  if (khacMap[h1] === h2 || khacMap[h2] === h1) return -1;
  if (sinhMap[h1] === h2 || sinhMap[h2] === h1) return 1;

  return 0;
}

/**
 * Returns exception comment for Nạp Âm interaction.
 * When two elements normally clash but have a specific Nạp Âm exception,
 * this returns the explanatory comment text.
 */
export function getNapAmExceptionComment(dayNaIndex: number, targetNaIndex: number): string {
  const h1 = NAP_AM_HANH_MAP[dayNaIndex];
  const h2 = NAP_AM_HANH_MAP[targetNaIndex];

  const getComment = (
    hA: number,
    hB: number,
    targetHA: number,
    targetHB: number,
    idxA: number,
    idxB: number,
    exceptionMap: Record<number, string>,
  ) => {
    if (hA === targetHA && hB === targetHB && exceptionMap[idxA]) return exceptionMap[idxA];
    if (hB === targetHA && hA === targetHB && exceptionMap[idxB]) return exceptionMap[idxB];
    return '';
  };

  // Kim (3) - Mộc (0) exception for Bình Địa Mộc (17)
  const comment1 = getComment(h1, h2, 0, 3, dayNaIndex, targetNaIndex, {
    17: 'Đặc biệt: Nhờ Kim khắc mà được lợi (Bình Địa Mộc)',
  });
  if (comment1) return comment1;

  // Hỏa (1) - Kim (3) exception for Kiếm Phong (4), Sa Trung (15)
  const comment2 = getComment(h1, h2, 3, 1, dayNaIndex, targetNaIndex, {
    4: 'Đặc biệt: Nhờ Hỏa luyện mà thành khí (Kiếm Phong Kim)',
    15: 'Đặc biệt: Nhờ Hỏa luyện mà thành khí (Sa Trung Kim)',
  });
  if (comment2) return comment2;

  // Thủy (4) - Hỏa (1) exception for Phích Lịch (12), Sơn Hạ (16), Thiên Thượng (27)
  const comment3 = getComment(h1, h2, 1, 4, dayNaIndex, targetNaIndex, {
    12: 'Đặc biệt: Phích Lịch Hỏa không sợ Thủy',
    16: 'Đặc biệt: Sơn Hạ Hỏa không sợ Thủy',
    27: 'Đặc biệt: Thiên Thượng Hỏa không sợ Thủy',
  });
  if (comment3) return comment3;

  // Thổ (2) - Thủy (4) exception for Thiên Hà (21), Đại Hải (29)
  const comment4 = getComment(h1, h2, 4, 2, dayNaIndex, targetNaIndex, {
    21: 'Đặc biệt: Thiên Hà Thủy không sợ Thổ',
    29: 'Đặc biệt: Đại Hải Thủy không sợ Thổ',
  });
  if (comment4) return comment4;

  // Mộc (0) - Thổ (2) exception for Lộ Bàng (3), Đại Dịch (22), Sa Trung (26)
  const comment5 = getComment(h1, h2, 2, 0, dayNaIndex, targetNaIndex, {
    3: 'Đặc biệt: Lộ Bàng Thổ không sợ Mộc',
    22: 'Đặc biệt: Đại Dịch Thổ không sợ Mộc',
    26: 'Đặc biệt: Sa Trung Thổ không sợ Mộc',
  });
  if (comment5) return comment5;

  return '';
}

export function getNapAmIndex(can: Can, chi: Chi): number {
  const canIdx = CAN.indexOf(can);
  const chiIdx = CHI.indexOf(chi);

  if (canIdx === -1 || chiIdx === -1) return -1;

  const map: Record<string, number[]> = napAmData.napAmIndexMap;

  return map[canIdx.toString()][Math.floor(chiIdx / 2)];
}
