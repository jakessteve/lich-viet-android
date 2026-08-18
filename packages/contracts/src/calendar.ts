export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export type CalendarSystemType = 'solar' | 'lunar';

export type EventRecurrenceType =
  | 'none'          // One-off event
  | 'daily'         // Every day
  | 'weekly'        // Every week on specific day
  | 'monthly_solar' // Same solar day each month
  | 'monthly_lunar' // 1st & 15th lunar of every month (Mùng 1 & Rằm)
  | 'yearly_solar'  // Same solar date every year (e.g. Nov 20)
  | 'yearly_lunar'; // Same lunar date every year (e.g. Giỗ 18/7 âm)

export type EventCategory = 'personal' | 'dam_gio' | 'memorial' | 'work' | 'family' | 'ritual';

export interface CalendarEventDto {
  id: string;
  userId: string;
  title: string;
  description?: string | undefined;
  calendarType: CalendarSystemType; // 'solar' | 'lunar'
  solarDate: string; // ISO date YYYY-MM-DD
  lunarDay?: number | undefined;
  lunarMonth?: number | undefined;
  lunarYear?: number | undefined;
  isLeapMonth?: boolean | undefined;
  recurrence: EventRecurrenceType;
  recurrenceEndDate?: string | undefined;
  category: EventCategory;
  emoji?: string | undefined;
  color?: string | undefined;
  alarmOffsetsMinutes: number[];
  syncedAt?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventDto {
  title: string;
  description?: string | undefined;
  calendarType?: CalendarSystemType | undefined;
  solarDate: string;
  lunarDay?: number | undefined;
  lunarMonth?: number | undefined;
  lunarYear?: number | undefined;
  isLeapMonth?: boolean | undefined;
  recurrence?: EventRecurrenceType | undefined;
  recurrenceEndDate?: string | undefined;
  category?: EventCategory | undefined;
  emoji?: string | undefined;
  color?: string | undefined;
  alarmOffsetsMinutes?: number[] | undefined;
}

export interface UpdateCalendarEventDto extends Partial<CreateCalendarEventDto> {
  id: string;
}

export interface UpcomingEventOccurrence {
  eventId: string;
  title: string;
  description?: string | undefined;
  emoji: string;
  category: EventCategory;
  calendarType: CalendarSystemType;
  recurrence: EventRecurrenceType;
  targetDate: Date;
  dateStr: string;
  lunarDateStr?: string | undefined;
  dayOfWeek: string;
  daysUntil: number; // 0 = today, 1 = tomorrow
}
