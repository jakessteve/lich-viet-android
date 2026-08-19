import { UserProfile, CalendarEventDto } from '@lich-viet/contracts';

export const DEMO_USER_PROFILE: UserProfile = {
  id: 'demo-user-001',
  email: 'khach@lichviet.local',
  name: 'Người dùng Khách',
  avatarUrl: undefined,
  tier: 'curious',
  role: 'user',
  provider: 'email',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};


export const DEMO_CALENDAR_EVENTS_SEED: CalendarEventDto[] = [
  {
    id: 'evt-demo-1',
    userId: 'demo-user-001',
    title: 'Cúng Rằm Tháng Giêng (Tết Nguyên Tiêu)',
    description: 'Chuẩn bị lễ chay và hoa tươi lên chùa cầu an.',
    calendarType: 'lunar',
    solarDate: '2026-03-03',
    lunarDay: 15,
    lunarMonth: 1,
    lunarYear: 2026,
    isLeapMonth: false,
    recurrence: 'yearly_lunar',
    category: 'ritual',
    alarmOffsetsMinutes: [60, 1440],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];
