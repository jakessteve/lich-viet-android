import { describe, expect, it } from 'vitest';
import lunarJs from 'lunar-javascript';
import { getLunarDate as getVnLunarDate } from '@dqcai/vn-lunar';

import { buildTuViBirthContext } from '../../../src/services/tuvi/birthContext';
import { resolveTuViSchoolProfile } from '../../../src/services/tuvi/schoolProfiles';
import { getLunarDate } from '../../../src/utils/calendarEngine';

function toLunarJsDate(date: Date) {
  const lunar = lunarJs.Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate()).getLunar();
  const month = lunar.getMonth();

  return {
    day: lunar.getDay(),
    month: Math.abs(month),
    year: lunar.getYear(),
    isLeap: month < 0,
  };
}

describe('Tu Vi birth context', () => {
  it('matches the main external lunar engines for representative dates', () => {
    const samples = [
      new Date(2024, 1, 10), // Tet 2024
      new Date(2025, 0, 29), // Tet 2025
      new Date(2023, 3, 10), // leap 2/20 in 2023
    ];

    for (const date of samples) {
      const ours = getLunarDate(date);
      const vn = getVnLunarDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
      const js = toLunarJsDate(date);

      expect(ours).toEqual({
        day: vn.day,
        month: vn.month,
        year: vn.year,
        isLeap: vn.leap,
      });
      expect(ours).toEqual(js);
    }
  });

  it('applies split-15 leap month policy for Nam phái but not Bắc phái', () => {
    const input = {
      name: 'Leap month sample',
      solarDate: new Date(2023, 3, 10, 12, 0),
      birthHour: 4,
      birthClockHour: 12,
      birthMinute: 0,
      gender: 'nam' as const,
      timezone: 'Asia/Ho_Chi_Minh',
      birthLocation: {
        locationName: 'Hanoi',
        lat: 21.028511,
        lng: 105.804817,
        timezone: 7,
      },
      school: 'nam-phai' as const,
    };

    const namPhai = buildTuViBirthContext(input, resolveTuViSchoolProfile('nam-phai'));
    const bacPhai = buildTuViBirthContext({ ...input, school: 'bac-phai' }, resolveTuViSchoolProfile('bac-phai'));

    expect(namPhai.lunarDate).toMatchObject({ day: 20, month: 2, year: 2023, isLeap: true });
    expect(namPhai.logicalMonth).toBe(3);
    expect(bacPhai.logicalMonth).toBe(2);
  });

  it('keeps pre-1975 northern Vietnam charts on GMT+7 while defaulting ambiguous charts to the south rule', () => {
    const baseInput = {
      name: 'Historical sample',
      solarDate: new Date(1968, 5, 1, 12, 0),
      birthHour: 6,
      birthClockHour: 12,
      birthMinute: 0,
      gender: 'nam' as const,
      timezone: 'Asia/Ho_Chi_Minh',
      school: 'thien-luong' as const,
    };

    const north = buildTuViBirthContext(
      {
        ...baseInput,
        birthLocation: {
          locationName: 'Hanoi',
          lat: 21.028511,
          lng: 105.804817,
          timezone: 7,
          historicalRegion: 'north',
        },
      },
      resolveTuViSchoolProfile('thien-luong'),
    );

    const southDefault = buildTuViBirthContext(baseInput, resolveTuViSchoolProfile('thien-luong'));

    expect(north.correctedDate.getHours()).toBe(12);
    expect(southDefault.correctedDate.getHours()).toBe(11);
    expect(southDefault.warnings.join(' ')).toContain('Không xác định được Bắc/Nam Việt Nam');
  });

  it('preserves the intended civil date when a birth timestamp arrives as a UTC instant', () => {
    const input = {
      name: 'UTC instant sample',
      solarDate: new Date('1983-11-13T18:30:00.000Z'),
      birthHour: 9,
      birthClockHour: 18,
      birthMinute: 30,
      gender: 'nam' as const,
      timezone: 'Asia/Ho_Chi_Minh',
      birthLocation: {
        locationName: 'Ho Chi Minh City, Vietnam',
        lat: 10.8231,
        lng: 106.6297,
        timezone: 7,
        countryCode: 'VN',
      },
      school: 'thien-luong' as const,
    };

    const context = buildTuViBirthContext(input, resolveTuViSchoolProfile('thien-luong'));

    expect(context.correctedDate.getFullYear()).toBe(1983);
    expect(context.correctedDate.getMonth()).toBe(10);
    expect(context.correctedDate.getDate()).toBe(13);
    expect(context.correctedDate.getHours()).toBe(18);
    expect(context.correctedDate.getMinutes()).toBe(36);
    expect(context.canChi.day).toEqual({ can: 'Ất', chi: 'Tỵ' });
  });

  it('preserves a UTC instant civil date when only the branch hour is available', () => {
    const input = {
      name: 'UTC branch-only sample',
      solarDate: new Date('1983-11-13T18:30:00.000Z'),
      birthHour: 9,
      gender: 'nam' as const,
      timezone: 'Asia/Ho_Chi_Minh',
      birthLocation: {
        locationName: 'Ho Chi Minh City, Vietnam',
        lat: 10.8231,
        lng: 106.6297,
        timezone: 7,
        countryCode: 'VN',
      },
      school: 'thien-luong' as const,
    };

    const context = buildTuViBirthContext(input, resolveTuViSchoolProfile('thien-luong'));

    expect(context.correctedDate.getFullYear()).toBe(1983);
    expect(context.correctedDate.getMonth()).toBe(10);
    expect(context.correctedDate.getDate()).toBe(13);
    expect(context.canChi.day).toEqual({ can: 'Ất', chi: 'Tỵ' });
  });
});
