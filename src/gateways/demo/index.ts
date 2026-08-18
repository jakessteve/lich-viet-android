import { AuthGateway, CalendarEventGateway, DamGioGateway, RuntimeContext } from '../index.js';
import {
  AuthResult,
  LoginInput,
  RegisterInput,
  SocialTokenPayload,
  UserProfile,
  DamGioRecord,
  CreateDamGioDto,
  UpdateDamGioDto,
  CalendarEventDto,
  CreateCalendarEventDto,
  DateRange,
} from '@lich-viet/contracts';
import { DEMO_USER_PROFILE, DEMO_DAM_GIO_SEED, DEMO_CALENDAR_EVENTS_SEED } from './seed.js';

export class DemoAuthGateway implements AuthGateway {
  private user: UserProfile = { ...DEMO_USER_PROFILE };

  async login(_input: LoginInput): Promise<AuthResult> {
    return {
      accessToken: 'demo-local-access-token',
      refreshToken: 'demo-local-refresh-token',
      user: this.user,
    };
  }

  async loginWithSocial(
    provider: 'google' | 'facebook' | 'apple' | 'zalo',
    _payload: SocialTokenPayload,
  ): Promise<AuthResult> {
    return {
      accessToken: `demo-${provider}-access-token`,
      refreshToken: `demo-${provider}-refresh-token`,
      user: this.user,
    };
  }

  async logout(): Promise<void> {}

  async register(_input: RegisterInput): Promise<AuthResult> {
    return {
      accessToken: 'demo-registered-access-token',
      user: this.user,
    };
  }

  async getProfile(): Promise<UserProfile> {
    return this.user;
  }
}

export class DemoDamGioGateway implements DamGioGateway {
  private records: DamGioRecord[] = [...DEMO_DAM_GIO_SEED];

  async listDamGio(): Promise<DamGioRecord[]> {
    return [...this.records];
  }

  async createDamGio(entry: CreateDamGioDto): Promise<DamGioRecord> {
    const newRecord: DamGioRecord = {
      id: `dg-${Date.now()}`,
      userId: DEMO_USER_PROFILE.id,
      deceasedName: entry.deceasedName,
      relationship: entry.relationship,
      lunarDay: entry.lunarDay,
      lunarMonth: entry.lunarMonth,
      isLeapMonth: entry.isLeapMonth,
      notes: entry.notes,
      alarmLeadDays: entry.alarmLeadDays,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.records.unshift(newRecord);
    return newRecord;
  }

  async updateDamGio(id: string, entry: UpdateDamGioDto): Promise<DamGioRecord> {
    const idx = this.records.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('DamGio record not found');
    const current = this.records[idx]!;
    const updated: DamGioRecord = {
      ...current,
      ...(entry.deceasedName !== undefined ? { deceasedName: entry.deceasedName } : {}),
      ...(entry.relationship !== undefined ? { relationship: entry.relationship } : {}),
      ...(entry.lunarDay !== undefined ? { lunarDay: entry.lunarDay } : {}),
      ...(entry.lunarMonth !== undefined ? { lunarMonth: entry.lunarMonth } : {}),
      ...(entry.isLeapMonth !== undefined ? { isLeapMonth: entry.isLeapMonth } : {}),
      ...(entry.notes !== undefined ? { notes: entry.notes } : {}),
      ...(entry.alarmLeadDays !== undefined ? { alarmLeadDays: entry.alarmLeadDays } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.records[idx] = updated;
    return updated;
  }

  async deleteDamGio(id: string): Promise<void> {
    this.records = this.records.filter((r) => r.id !== id);
  }
}

export class DemoCalendarEventGateway implements CalendarEventGateway {
  private events: CalendarEventDto[] = [...DEMO_CALENDAR_EVENTS_SEED];

  async getEvents(_range: DateRange): Promise<CalendarEventDto[]> {
    return [...this.events];
  }

  async saveEvent(event: CreateCalendarEventDto): Promise<CalendarEventDto> {
    const newEvent: CalendarEventDto = {
      id: `evt-${Date.now()}`,
      userId: DEMO_USER_PROFILE.id,
      title: event.title,
      description: event.description,
      solarDate: event.solarDate,
      category: event.category,
      alarmOffsetsMinutes: event.alarmOffsetsMinutes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.events.push(newEvent);
    return newEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    this.events = this.events.filter((e) => e.id !== id);
  }
}

export function createDemoRuntime(): RuntimeContext {
  return {
    kind: 'demo',
    auth: new DemoAuthGateway(),
    damGio: new DemoDamGioGateway(),
    calendar: new DemoCalendarEventGateway(),
  };
}
