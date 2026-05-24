import { describe, expect, it } from 'vitest';

import { CHINH_TINH_LIST, PHU_TINH_LIST } from '../../../src/services/tuvi/constants';
import { getTuViCatalogSummary, getTuViStarLayer } from '../../../src/services/tuvi/catalogLayers';

describe('Tu Vi catalog layers', () => {
  it('summarizes the catalog into core, classical, and extended layers', () => {
    const summary = getTuViCatalogSummary();

    expect(summary.total).toBe(CHINH_TINH_LIST.length + PHU_TINH_LIST.length);
    expect(summary.layers).toEqual([
      { id: 'core', label: 'Core / 14 chính tinh', count: 14 },
      { id: 'classical', label: 'Classical / 14 phụ tinh', count: 14 },
      { id: 'extended', label: 'Extended / remaining modeled stars', count: 76 },
    ]);
    expect(summary.academicTargetTotal).toBe(113);
    expect(summary.academicGap).toBe(9);
  });

  it('classifies core and classical stars without changing the placement engine', () => {
    expect(getTuViStarLayer('Tử Vi')).toBe('core');
    expect(getTuViStarLayer('Văn Xương')).toBe('classical');
    expect(getTuViStarLayer('Thiên Hỉ')).toBe('extended');
    expect(getTuViStarLayer('Không có sao')).toBeNull();
  });
});
