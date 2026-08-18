import { UserProfile, DamGioRecord, CalendarEventDto } from '@lich-viet/contracts';

export const DEMO_USER_PROFILE: UserProfile = {
  id: 'demo-user-001',
  email: 'khach@lichviet.local',
  name: 'Người dùng Khách',
  avatarUrl: undefined,
  tier: 'curious',
  role: 'user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const DEMO_DAM_GIO_SEED: DamGioRecord[] = [
  {
    id: 'dg-demo-1',
    userId: 'demo-user-001',
    deceasedName: 'Cụ Ông Nguyễn Văn Tổ',
    relationship: 'Ông Nội',
    lunarDay: 15,
    lunarMonth: 7,
    isLeapMonth: false,
    notes: 'Giỗ chính cúng trước 11h trưa, mời các bác chi trưởng.',
    alarmLeadDays: [1, 3, 7],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dg-demo-2',
    userId: 'demo-user-001',
    deceasedName: 'Cụ Bà Trần Thị Hậu',
    relationship: 'Bà Ngoại',
    lunarDay: 10,
    lunarMonth: 3,
    isLeapMonth: false,
    notes: 'Cúng tại từ đường quê ngoại.',
    alarmLeadDays: [1, 3],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export const DEMO_CALENDAR_EVENTS_SEED: CalendarEventDto[] = [
  {
    id: 'evt-demo-1',
    userId: 'demo-user-001',
    title: 'Cúng Rằm Tháng Giêng (Tết Nguyên Tiêu)',
    description: 'Chuẩn bị lễ chay và hoa tươi lên chùa cầu an.',
    solarDate: '2026-03-03',
    lunarDate: { day: 15, month: 1, year: 2026, isLeap: false },
    category: 'ritual',
    alarmOffsetsMinutes: [60, 1440],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];
