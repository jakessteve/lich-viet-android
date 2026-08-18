export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface CalendarEventDto {
  id: string;
  userId: string;
  title: string;
  description?: string | undefined;
  solarDate: string; // YYYY-MM-DD
  lunarDate?: {
    day: number;
    month: number;
    year: number;
    isLeap: boolean;
  } | undefined;
  category: 'personal' | 'dam_gio' | 'holiday' | 'ritual';
  alarmOffsetsMinutes: number[];
  syncedAt?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventDto {
  title: string;
  description?: string | undefined;
  solarDate: string;
  category: 'personal' | 'dam_gio' | 'holiday' | 'ritual';
  alarmOffsetsMinutes?: number[] | undefined;
}
