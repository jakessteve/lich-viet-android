import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSwissLunarDateIfReadyMock } = vi.hoisted(() => {
  return {
    getSwissLunarDateIfReadyMock: vi.fn(
      (_date: Date, _region: 'north' | 'south', _swe: unknown, location?: { timezoneOffsetHours: number }) => {
        const offset = location?.timezoneOffsetHours ?? 7;

        if (offset >= 8) {
          return {
            day: 2,
            month: 3,
            year: 2026,
            isLeap: false,
            canChiDay: 'Bính Dần',
            canChiMonth: 'Đinh Mão',
            canChiYear: 'Bính Ngọ',
            solarTerm: 'Lập Xuân',
            boundaryWarnings: [],
          };
        }

        return {
          day: 1,
          month: 3,
          year: 2026,
          isLeap: false,
          canChiDay: 'Ất Sửu',
          canChiMonth: 'Bính Dần',
          canChiYear: 'Bính Ngọ',
          solarTerm: 'Lập Xuân',
          boundaryWarnings: [],
        };
      },
    ),
  };
});

vi.mock('@/services/astronomy/swissEphemeris', () => ({
  getSwissEphemerisInstance: () => ({}),
  getSwissLunarDateIfReady: getSwissLunarDateIfReadyMock,
}));

describe('calendarEngine location threading', () => {
  beforeEach(() => {
    vi.resetModules();
    getSwissLunarDateIfReadyMock.mockClear();
  });

  it('threads viewer location into lunar conversion cache keys', async () => {
    const { getLunarDate } = await import('@/utils/calendarEngine');
    const date = new Date(2026, 4, 24);
    const vietnam = { longitude: 105.8, timezoneOffsetHours: 7 };
    const seoul = { longitude: 126.98, timezoneOffsetHours: 9 };

    expect(getLunarDate(date, vietnam)).toEqual({ day: 1, month: 3, year: 2026, isLeap: false });
    expect(getLunarDate(date, seoul)).toEqual({ day: 2, month: 3, year: 2026, isLeap: false });

    expect(getSwissLunarDateIfReadyMock).toHaveBeenCalledWith(expect.any(Date), 'south', undefined, vietnam);
    expect(getSwissLunarDateIfReadyMock).toHaveBeenCalledWith(expect.any(Date), 'south', undefined, seoul);
  });

  it('recomputes detailed day data for different viewer locations', async () => {
    const { getDetailedDayData } = await import('@/utils/calendarEngine');
    const date = new Date(2026, 4, 24);
    const vietnam = { longitude: 105.8, timezoneOffsetHours: 7 };
    const seoul = { longitude: 126.98, timezoneOffsetHours: 9 };

    const vietnamDay = getDetailedDayData(date, vietnam);
    const seoulDay = getDetailedDayData(date, seoul);

    expect(vietnamDay.lunarDate.day).toBe(1);
    expect(seoulDay.lunarDate.day).toBe(2);
    expect(vietnamDay.lunarDate.month).toBe(3);
    expect(seoulDay.lunarDate.month).toBe(3);
    expect(vietnamDay.solarDate).toBe('2026-05-24');
    expect(seoulDay.solarDate).toBe('2026-05-24');
  });

  it('threads viewer location through month-grid generation', async () => {
    const { getMonthDays } = await import('@/utils/calendarEngine');
    const vietnam = { longitude: 105.8, timezoneOffsetHours: 7 };
    const seoul = { longitude: 126.98, timezoneOffsetHours: 9 };

    const vietnamDays = getMonthDays(2026, 4, vietnam);
    const seoulDays = getMonthDays(2026, 4, seoul);

    expect(vietnamDays).toHaveLength(42);
    expect(seoulDays).toHaveLength(42);
    expect(vietnamDays[0].lunarDate).not.toBe(seoulDays[0].lunarDate);
  });
});
