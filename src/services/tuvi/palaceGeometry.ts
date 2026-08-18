/**
 * palaceGeometry.ts — Tử Vi Palace Coordinate and Geometric Relations
 *
 * Pure mathematical and topological palace mapping functions:
 * - Đối Cung (Opposition, 180°)
 * - Tam Hợp (Trine, 120°)
 * - Nhị Hợp (Hexagonal Horizontal Symmetry)
 * - Giáp Cung (Adjacent / Flanking Palaces)
 */

import { TAM_HOP_GROUPS, DOI_CUNG_MAP, NHI_HOP_MAP } from './constants';

/**
 * Normalizes a palace index into the valid 0–11 integer range.
 */
export function normalizePalaceIndex(palaceIndex: number): number {
  if (Number.isNaN(palaceIndex) || !Number.isFinite(palaceIndex)) return 0;
  return ((Math.floor(palaceIndex) % 12) + 12) % 12;
}

/**
 * Returns the index of the Đối Cung (opposition palace).
 */
export function detectDoiCung(palaceIndex: number): number {
  const normIdx = normalizePalaceIndex(palaceIndex);
  return DOI_CUNG_MAP[normIdx] ?? (normIdx + 6) % 12;
}

/**
 * Returns the indices of the two Tam Hợp palaces for a given palace.
 * Each palace belongs to exactly one Tam Hợp group of 3 palaces.
 */
export function detectTamHopPalaces(palaceIndex: number): number[] {
  const normIdx = normalizePalaceIndex(palaceIndex);
  for (const group of TAM_HOP_GROUPS) {
    if (group.includes(normIdx)) {
      return group.filter((idx) => idx !== normIdx);
    }
  }
  return [];
}

/**
 * Returns the index of the Nhị Hợp (symmetrical harmonic pair) palace.
 */
export function detectNhiHopPalace(palaceIndex: number): number {
  const normIdx = normalizePalaceIndex(palaceIndex);
  return NHI_HOP_MAP[normIdx] ?? (normIdx === 0 ? 1 : normIdx === 1 ? 0 : (13 - normIdx) % 12);
}

/**
 * Returns the two adjacent flanking palace indices [previous (-1), next (+1)].
 */
export function getAdjacentPalaceIndices(palaceIndex: number): [number, number] {
  const normIdx = normalizePalaceIndex(palaceIndex);
  return [(normIdx + 11) % 12, (normIdx + 1) % 12];
}
