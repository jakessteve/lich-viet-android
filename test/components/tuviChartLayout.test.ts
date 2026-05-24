import { describe, it, expect } from 'vitest';
import { getKhongLabel } from '@/components/TuVi/tuviChartLayout';

describe('tuviChartLayout', () => {
  it('maps palace flags to the correct khong label', () => {
    expect(getKhongLabel({ hasTuan: true, hasTriet: false })).toBe('Tuần');
    expect(getKhongLabel({ hasTuan: false, hasTriet: true })).toBe('Triệt');
    expect(getKhongLabel({ hasTuan: true, hasTriet: true })).toBe('Tuần - Triệt');
  });

  it('returns null when no khong flag exists', () => {
    expect(getKhongLabel({ hasTuan: false, hasTriet: false })).toBeNull();
  });
});
