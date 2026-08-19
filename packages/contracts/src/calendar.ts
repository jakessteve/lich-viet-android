import { z } from 'zod';

export const DateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng YYYY-MM-DD không hợp lệ'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng YYYY-MM-DD không hợp lệ'),
});
export type DateRange = z.infer<typeof DateRangeSchema>;

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

export const CreateCalendarEventSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  calendarType: z.enum(['solar', 'lunar']).default('solar'),
  solarDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng YYYY-MM-DD không hợp lệ'),
  lunarDay: z.number().int().min(1).max(30).optional(),
  lunarMonth: z.number().int().min(1).max(12).optional(),
  lunarYear: z.number().int().optional(),
  isLeapMonth: z.boolean().optional(),
  recurrence: z
    .enum(['none', 'daily', 'weekly', 'monthly_solar', 'monthly_lunar', 'yearly_solar', 'yearly_lunar'])
    .default('none'),
  recurrenceEndDate: z.string().optional(),
  category: z.enum(['personal', 'dam_gio', 'memorial', 'work', 'family', 'ritual']).default('personal'),
  emoji: z.string().optional(),
  color: z.string().optional(),
  alarmOffsetsMinutes: z.array(z.number()).default([]),
});
export type CreateCalendarEventDto = z.infer<typeof CreateCalendarEventSchema>;

export const UpdateCalendarEventSchema = CreateCalendarEventSchema.partial().extend({
  id: z.string().min(1),
});
export type UpdateCalendarEventDto = z.infer<typeof UpdateCalendarEventSchema>;

export const CalendarEventSchema = CreateCalendarEventSchema.extend({
  id: z.string(),
  userId: z.string(),
  syncedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CalendarEventDto = z.infer<typeof CalendarEventSchema>;

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
