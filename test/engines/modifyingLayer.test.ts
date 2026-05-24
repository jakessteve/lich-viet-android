import { describe, it, expect } from 'vitest';
import { calculateModifyingLayer } from '@/utils/modifyingLayer';
import type { CanChi } from '@/types/calendar';

describe('modifyingLayer', () => {
  it('uses the solar-term month for month-based star matching', () => {
    const date = new Date(2024, 5, 15);
    const lunar = { day: 10, month: 1, year: 2024, isLeap: false };
    const dayCanChi: CanChi = { can: 'Đinh', chi: 'Tý' };

    const solarMonthOne = calculateModifyingLayer(date, lunar, dayCanChi, 1);
    const solarMonthTwo = calculateModifyingLayer(date, lunar, dayCanChi, 2);

    expect(solarMonthOne.stars.some((star) => star.name === 'Thiên Đức')).toBe(true);
    expect(solarMonthTwo.stars.some((star) => star.name === 'Thiên Đức')).toBe(false);
  });

  it('changes Trực when the solar-term month changes', () => {
    const date = new Date(2024, 5, 15);
    const lunar = { day: 10, month: 1, year: 2024, isLeap: false };
    const dayCanChi: CanChi = { can: 'Giáp', chi: 'Tý' };

    const solarMonthOne = calculateModifyingLayer(date, lunar, dayCanChi, 1);
    const solarMonthTwo = calculateModifyingLayer(date, lunar, dayCanChi, 2);

    expect(solarMonthOne.trucDetail.name).not.toBe(solarMonthTwo.trucDetail.name);
  });
});
