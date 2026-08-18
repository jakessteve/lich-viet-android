/**
 * Calendar Event Engine — Highly Optimized Pure Occurrence Expansion & Lunar Math
 *
 * Expands one-off, solar-recurring, and lunar-recurring events
 * into concrete dated occurrences with memoization and bulk grid indexing.
 */

import {
  CalendarEventDto,
  EventCategory,
  EventRecurrenceType,
  UpcomingEventOccurrence,
} from '@lich-viet/contracts';
import { getLunarDate, getCanChiDay } from './calendarEngine';

export const DAY_NAMES_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'] as const;

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; defaultEmoji: string; badgeVariant: 'purple' | 'gold' | 'good' | 'bad' | 'info' }
> = {
  personal: { label: 'Cá nhân', defaultEmoji: '👤', badgeVariant: 'purple' },
  dam_gio: { label: 'Đám giỗ', defaultEmoji: '🕯️', badgeVariant: 'gold' },
  memorial: { label: 'Kỷ niệm', defaultEmoji: '🎂', badgeVariant: 'good' },
  family: { label: 'Gia đình', defaultEmoji: '🏡', badgeVariant: 'purple' },
  work: { label: 'Công việc', defaultEmoji: '💼', badgeVariant: 'info' },
  ritual: { label: 'Cúng lễ', defaultEmoji: '🌸', badgeVariant: 'gold' },
};

export const RECURRENCE_LABELS: Record<EventRecurrenceType, string> = {
  none: 'Một lần',
  daily: 'Hàng ngày',
  weekly: 'Hàng tuần',
  monthly_solar: 'Hàng tháng (Dương)',
  monthly_lunar: 'Rằm & Mùng 1 (Âm)',
  yearly_solar: 'Hàng năm (Dương)',
  yearly_lunar: 'Hàng năm (Âm lịch)',
};

// ── In-Memory Fast Lookup Cache ──────────────────────────────
const lunarToSolarCache = new Map<string, Date | null>();

/**
 * Generates standard YYYY-MM-DD date key from Date
 */
export function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Finds the solar Date corresponding to a target lunar day & month within a target solar year.
 * Optimized with bounded 60-day search window and instant O(1) memoization.
 */
export function findSolarDateForLunar(
  lunarDay: number,
  lunarMonth: number,
  targetSolarYear: number,
  isLeapMonth: boolean = false,
): Date | null {
  const cacheKey = `${lunarDay}-${lunarMonth}-${targetSolarYear}-${isLeapMonth ? 1 : 0}`;
  if (lunarToSolarCache.has(cacheKey)) {
    const hit = lunarToSolarCache.get(cacheKey);
    return hit ? new Date(hit.getTime()) : null;
  }

  // A lunar month M in solar year Y always occurs roughly between solar month (M - 1) and (M + 1)
  // E.g., Lunar month 1 falls in Jan-Feb. Lunar month 8 falls in Aug-Sep. Lunar month 12 falls in Dec-Jan.
  const startMonth = Math.max(0, lunarMonth - 2);
  const endMonth = Math.min(11, lunarMonth + 1);

  const startScan = new Date(targetSolarYear, startMonth, 1);
  const endScan = new Date(targetSolarYear, endMonth + 1, 10);

  const current = new Date(startScan);
  let matchedDate: Date | null = null;

  while (current <= endScan) {
    const lunar = getLunarDate(current);
    if (
      lunar.day === lunarDay &&
      lunar.month === lunarMonth &&
      (isLeapMonth ? lunar.isLeap : !lunar.isLeap || lunar.month === lunarMonth)
    ) {
      matchedDate = new Date(current.getTime());
      break;
    }
    current.setDate(current.getDate() + 1);
  }

  // Also check early next year if lunar month is 11 or 12
  if (!matchedDate && lunarMonth >= 11) {
    const extraStart = new Date(targetSolarYear + 1, 0, 1);
    const extraEnd = new Date(targetSolarYear + 1, 1, 20);
    const cur = new Date(extraStart);
    while (cur <= extraEnd) {
      const lunar = getLunarDate(cur);
      if (
        lunar.day === lunarDay &&
        lunar.month === lunarMonth &&
        (isLeapMonth ? lunar.isLeap : !lunar.isLeap || lunar.month === lunarMonth)
      ) {
        matchedDate = new Date(cur.getTime());
        break;
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  lunarToSolarCache.set(cacheKey, matchedDate ? new Date(matchedDate.getTime()) : null);
  return matchedDate ? new Date(matchedDate.getTime()) : null;
}

/**
 * Normalizes a Date to midnight local for clean day-difference calculations
 */
export function startOfDay(d: Date): Date {
  const normalized = new Date(d);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Calculates integer difference in days: (targetDate - fromDate)
 */
export function getDaysDifference(targetDate: Date, fromDate: Date): number {
  const t1 = startOfDay(targetDate).getTime();
  const t0 = startOfDay(fromDate).getTime();
  return Math.round((t1 - t0) / 86400000);
}

/**
 * Formats a Date object into Vietnamese locale string (e.g. "25/08/2026")
 */
export function formatSolarDateStr(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats a lunar string with Can Chi (e.g. "Ngày 14/07 Âm lịch (Giáp Thân)")
 */
export function formatLunarDateStr(date: Date): string {
  const lunar = getLunarDate(date);
  const canChi = getCanChiDay(date);
  return `Ngày ${lunar.day}/${lunar.month}${lunar.isLeap ? ' nhuận' : ''} Âm lịch (${canChi})`;
}

/**
 * Expands a single event into concrete occurrences within a specified date window [startDate, endDate].
 */
export function expandSingleEvent(
  event: CalendarEventDto,
  startDate: Date,
  endDate: Date,
  referenceDate: Date = new Date(),
): UpcomingEventOccurrence[] {
  const results: UpcomingEventOccurrence[] = [];
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);

  const baseDate = new Date(event.solarDate);
  const baseLunarDay = event.lunarDay ?? (event.calendarType === 'lunar' ? getLunarDate(baseDate).day : undefined);
  const baseLunarMonth = event.lunarMonth ?? (event.calendarType === 'lunar' ? getLunarDate(baseDate).month : undefined);

  const emoji = event.emoji || CATEGORY_META[event.category]?.defaultEmoji || '📅';

  const createOccurrence = (targetDate: Date): UpcomingEventOccurrence => {
    const dayOfWeek = DAY_NAMES_VI[targetDate.getDay()];
    const daysUntil = getDaysDifference(targetDate, referenceDate);
    const dateStr = formatSolarDateStr(targetDate);
    const lunarDateStr = formatLunarDateStr(targetDate);

    return {
      eventId: event.id,
      title: event.title,
      description: event.description,
      emoji,
      category: event.category,
      calendarType: event.calendarType,
      recurrence: event.recurrence,
      targetDate,
      dateStr,
      lunarDateStr,
      dayOfWeek,
      daysUntil,
    };
  };

  const checkAndAdd = (date: Date) => {
    const d = startOfDay(date);
    if (d >= start && d <= end) {
      if (event.recurrenceEndDate) {
        const cutOff = startOfDay(new Date(event.recurrenceEndDate));
        if (d > cutOff) return;
      }
      results.push(createOccurrence(d));
    }
  };

  switch (event.recurrence) {
    case 'none': {
      if (event.calendarType === 'lunar' && baseLunarDay && baseLunarMonth) {
        const targetYear = baseDate.getFullYear();
        const solarMatch = findSolarDateForLunar(baseLunarDay, baseLunarMonth, targetYear, event.isLeapMonth);
        if (solarMatch) checkAndAdd(solarMatch);
      } else {
        checkAndAdd(baseDate);
      }
      break;
    }

    case 'daily': {
      const cur = new Date(start);
      while (cur <= end) {
        if (cur >= startOfDay(baseDate)) {
          checkAndAdd(new Date(cur));
        }
        cur.setDate(cur.getDate() + 1);
      }
      break;
    }

    case 'weekly': {
      const targetDayOfWeek = baseDate.getDay();
      const cur = new Date(start);
      while (cur <= end) {
        if (cur.getDay() === targetDayOfWeek && cur >= startOfDay(baseDate)) {
          checkAndAdd(new Date(cur));
        }
        cur.setDate(cur.getDate() + 1);
      }
      break;
    }

    case 'monthly_solar': {
      const targetDayOfMonth = baseDate.getDate();
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();

      for (let y = startYear; y <= endYear; y++) {
        const mStart = y === startYear ? start.getMonth() : 0;
        const mEnd = y === endYear ? end.getMonth() : 11;
        for (let m = mStart; m <= mEnd; m++) {
          const maxDays = new Date(y, m + 1, 0).getDate();
          const day = Math.min(targetDayOfMonth, maxDays);
          const candidate = new Date(y, m, day);
          if (candidate >= startOfDay(baseDate)) {
            checkAndAdd(candidate);
          }
        }
      }
      break;
    }

    case 'monthly_lunar': {
      // Occurs on Mùng 1 (day 1) and Ngày Rằm (day 15) of every lunar month
      const cur = new Date(start);
      while (cur <= end) {
        if (cur >= startOfDay(baseDate)) {
          const lunar = getLunarDate(cur);
          if (lunar.day === 1 || lunar.day === 15) {
            checkAndAdd(new Date(cur));
          }
        }
        cur.setDate(cur.getDate() + 1);
      }
      break;
    }

    case 'yearly_solar': {
      const targetMonth = baseDate.getMonth();
      const targetDay = baseDate.getDate();
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();

      for (let y = startYear; y <= endYear; y++) {
        const candidate = new Date(y, targetMonth, targetDay);
        checkAndAdd(candidate);
      }
      break;
    }

    case 'yearly_lunar': {
      if (baseLunarDay && baseLunarMonth) {
        const startYear = start.getFullYear();
        const endYear = end.getFullYear();

        for (let y = startYear; y <= endYear; y++) {
          const solarMatch = findSolarDateForLunar(baseLunarDay, baseLunarMonth, y, event.isLeapMonth);
          if (solarMatch) {
            checkAndAdd(solarMatch);
          }
        }
      }
      break;
    }
  }

  return results;
}

/**
 * Expands all events into occurrences, deduplicates, and sorts chronologically.
 */
export function expandAllEvents(
  events: CalendarEventDto[],
  startDate: Date,
  endDate: Date,
  referenceDate: Date = new Date(),
): UpcomingEventOccurrence[] {
  const list: UpcomingEventOccurrence[] = [];

  for (const ev of events) {
    const occurrences = expandSingleEvent(ev, startDate, endDate, referenceDate);
    list.push(...occurrences);
  }

  // Sort by targetDate ascending, then title
  return list.sort((a, b) => {
    const diff = a.targetDate.getTime() - b.targetDate.getTime();
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Builds a Map of YYYY-MM-DD -> UpcomingEventOccurrence[] in a single batch pass for the calendar month grid.
 */
export function buildMonthEventMap(
  events: CalendarEventDto[],
  startDate: Date,
  endDate: Date,
): Map<string, UpcomingEventOccurrence[]> {
  const map = new Map<string, UpcomingEventOccurrence[]>();
  if (!events || events.length === 0) return map;

  const occurrences = expandAllEvents(events, startDate, endDate, startDate);
  for (const occ of occurrences) {
    const key = getDateKey(occ.targetDate);
    const existing = map.get(key);
    if (existing) {
      existing.push(occ);
    } else {
      map.set(key, [occ]);
    }
  }

  return map;
}

/**
 * Returns upcoming events within `daysAhead` from `fromDate` (default 30 days), sorted by daysUntil.
 */
export function getUpcomingEvents(
  events: CalendarEventDto[],
  daysAhead: number = 30,
  fromDate: Date = new Date(),
): UpcomingEventOccurrence[] {
  const start = startOfDay(fromDate);
  const end = new Date(start);
  end.setDate(end.getDate() + daysAhead);

  const occurrences = expandAllEvents(events, start, end, fromDate);
  // Filter only future or today occurrences (daysUntil >= 0)
  return occurrences.filter((occ) => occ.daysUntil >= 0);
}

/**
 * Returns all event occurrences falling exactly on `targetDate`.
 */
export function getEventsForDate(
  events: CalendarEventDto[],
  targetDate: Date,
): UpcomingEventOccurrence[] {
  const start = startOfDay(targetDate);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return expandAllEvents(events, start, end, targetDate);
}
