import { describe, it, expect } from 'vitest';
import {
  findSolarDateForLunar,
  expandSingleEvent,
  buildMonthEventMap,
  getUpcomingEvents,
} from '@/utils/eventEngine';
import { CalendarEventDto } from '@lich-viet/contracts';

describe('eventEngine', () => {
  it('should find solar date for a given lunar day and month with memoization', () => {
    // Tết Trung Thu: 15/08 Âm lịch 2026 -> 25/09/2026 Dương lịch
    const t0 = performance.now();
    const match1 = findSolarDateForLunar(15, 8, 2026);
    const duration1 = performance.now() - t0;

    expect(match1).not.toBeNull();
    if (match1) {
      expect(match1.getFullYear()).toBe(2026);
      expect(match1.getMonth()).toBe(8); // September is 8 (0-indexed)
      expect(match1.getDate()).toBe(25);
    }

    // Second call should hit the in-memory cache instantly (< 0.1ms)
    const t1 = performance.now();
    const match2 = findSolarDateForLunar(15, 8, 2026);
    const duration2 = performance.now() - t1;

    expect(match2).not.toBeNull();
    expect(duration2).toBeLessThanOrEqual(duration1);
  });

  it('should expand a one-off solar event', () => {
    const ev: CalendarEventDto = {
      id: 'test-1',
      userId: 'u1',
      title: 'Họp phụ huynh',
      calendarType: 'solar',
      solarDate: '2026-08-20',
      recurrence: 'none',
      category: 'work',
      alarmOffsetsMinutes: [],
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
    };

    const start = new Date(2026, 7, 1);
    const end = new Date(2026, 7, 31);
    const ref = new Date(2026, 7, 18);

    const occurrences = expandSingleEvent(ev, start, end, ref);
    expect(occurrences.length).toBe(1);
    expect(occurrences[0].title).toBe('Họp phụ huynh');
    expect(occurrences[0].daysUntil).toBe(2);
    expect(occurrences[0].dateStr).toBe('20/08/2026');
  });

  it('should expand yearly lunar recurring event (Đám Giỗ)', () => {
    const ev: CalendarEventDto = {
      id: 'test-dam-gio',
      userId: 'u1',
      title: 'Giỗ Cụ',
      calendarType: 'lunar',
      solarDate: '2026-01-01',
      lunarDay: 15,
      lunarMonth: 8,
      recurrence: 'yearly_lunar',
      category: 'dam_gio',
      alarmOffsetsMinutes: [1440],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 11, 31);
    const ref = new Date(2026, 7, 25); // Aug 25 2026 (1 month before 25/09/2026)

    const occurrences = expandSingleEvent(ev, start, end, ref);
    expect(occurrences.length).toBe(1);
    expect(occurrences[0].title).toBe('Giỗ Cụ');
    expect(occurrences[0].dateStr).toBe('25/09/2026');
    expect(occurrences[0].daysUntil).toBe(31);
  });

  it('should expand monthly lunar recurring events (Mùng 1 & Rằm)', () => {
    const ev: CalendarEventDto = {
      id: 'test-monthly-lunar',
      userId: 'u1',
      title: 'Thắp hương ngày Rằm & Mùng 1',
      calendarType: 'lunar',
      solarDate: '2026-01-01',
      recurrence: 'monthly_lunar',
      category: 'ritual',
      alarmOffsetsMinutes: [60],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    // 60-day window
    const start = new Date(2026, 7, 1);
    const end = new Date(2026, 8, 30);
    const ref = new Date(2026, 7, 1);

    const occurrences = expandSingleEvent(ev, start, end, ref);
    // In 2 months, there are ~4 occurrences (2 mùng 1 and 2 ngày rằm)
    expect(occurrences.length).toBeGreaterThanOrEqual(3);
  });

  it('should build month event map in a single pass for calendar grid', () => {
    const events: CalendarEventDto[] = [
      {
        id: 'ev-1',
        userId: 'u1',
        title: 'Lễ Động Thổ',
        calendarType: 'solar',
        solarDate: '2026-08-18',
        recurrence: 'none',
        category: 'ritual',
        alarmOffsetsMinutes: [],
        createdAt: '2026-08-01',
        updatedAt: '2026-08-01',
      },
      {
        id: 'ev-2',
        userId: 'u1',
        title: 'Tết Trung Thu',
        calendarType: 'lunar',
        solarDate: '2026-01-01',
        lunarDay: 15,
        lunarMonth: 8,
        recurrence: 'yearly_lunar',
        category: 'ritual',
        alarmOffsetsMinutes: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];

    const gridStart = new Date(2026, 7, 1);
    const gridEnd = new Date(2026, 8, 30);

    const map = buildMonthEventMap(events, gridStart, gridEnd);
    expect(map.has('2026-08-18')).toBe(true);
    expect(map.get('2026-08-18')?.[0].title).toBe('Lễ Động Thổ');

    expect(map.has('2026-09-25')).toBe(true);
    expect(map.get('2026-09-25')?.[0].title).toBe('Tết Trung Thu');
  });

  it('should filter upcoming events properly', () => {
    const events: CalendarEventDto[] = [
      {
        id: 'ev-past',
        userId: 'u1',
        title: 'Sự kiện quá khứ',
        calendarType: 'solar',
        solarDate: '2026-08-10',
        recurrence: 'none',
        category: 'personal',
        alarmOffsetsMinutes: [],
        createdAt: '2026-08-01',
        updatedAt: '2026-08-01',
      },
      {
        id: 'ev-future',
        userId: 'u1',
        title: 'Sự kiện tương lai',
        calendarType: 'solar',
        solarDate: '2026-08-25',
        recurrence: 'none',
        category: 'personal',
        alarmOffsetsMinutes: [],
        createdAt: '2026-08-01',
        updatedAt: '2026-08-01',
      },
    ];

    const ref = new Date(2026, 7, 18);
    const upcoming = getUpcomingEvents(events, 14, ref);
    expect(upcoming.length).toBe(1);
    expect(upcoming[0].title).toBe('Sự kiện tương lai');
    expect(upcoming[0].daysUntil).toBe(7);
  });
});
