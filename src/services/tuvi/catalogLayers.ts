/**
 * Layered catalog metadata for the Tử Vi engine.
 *
 * This keeps the existing flat star lists intact while exposing the catalog
 * in the same broad strata used by academic references:
 * - core: 14 main stars
 * - classical: 14 foundational auxiliaries
 * - extended: remaining modeled stars in the engine
 */

import { CHINH_TINH_LIST, PHU_TINH_LIST } from './constants';
import type { TuViCatalogLayerSummary, TuViCatalogSummary } from '../../types/tuvi';

const CLASSICAL_AUXILIARY_STARS = new Set([
  'Văn Xương',
  'Văn Khúc',
  'Tả Phụ',
  'Hữu Bật',
  'Thiên Khôi',
  'Thiên Việt',
  'Kình Dương',
  'Đà La',
  'Hỏa Tinh',
  'Linh Tinh',
  'Địa Không',
  'Địa Kiếp',
  'Lộc Tồn',
  'Thiên Mã',
]);

const ACADEMIC_REFERENCE_TARGET_TOTAL = 113;
const ACADEMIC_REFERENCE_BASIS = '14主星 + 14輔星 + 37雜曜 + 48神煞';

function buildLayerSummary(): TuViCatalogLayerSummary[] {
  const coreCount = CHINH_TINH_LIST.length;
  const classicalCount = PHU_TINH_LIST.filter((star) => CLASSICAL_AUXILIARY_STARS.has(star.name)).length;
  const extendedCount = PHU_TINH_LIST.length - classicalCount;

  return [
    { id: 'core', label: 'Core / 14 chính tinh', count: coreCount },
    { id: 'classical', label: 'Classical / 14 phụ tinh', count: classicalCount },
    { id: 'extended', label: 'Extended / remaining modeled stars', count: extendedCount },
  ];
}

export function getTuViCatalogSummary(): TuViCatalogSummary {
  const layers = buildLayerSummary();
  const total = layers.reduce((sum, layer) => sum + layer.count, 0);

  return {
    total,
    layers,
    academicTargetTotal: ACADEMIC_REFERENCE_TARGET_TOTAL,
    academicGap: Math.max(ACADEMIC_REFERENCE_TARGET_TOTAL - total, 0),
    academicBasis: ACADEMIC_REFERENCE_BASIS,
  };
}

export function getTuViStarLayer(starName: string): TuViCatalogLayerSummary['id'] | null {
  if (CHINH_TINH_LIST.some((star) => star.name === starName)) {
    return 'core';
  }

  if (CLASSICAL_AUXILIARY_STARS.has(starName)) {
    return 'classical';
  }

  if (PHU_TINH_LIST.some((star) => star.name === starName)) {
    return 'extended';
  }

  return null;
}
