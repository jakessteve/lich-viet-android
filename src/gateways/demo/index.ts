import { AuthGateway, CalendarEventGateway, RuntimeContext } from '../index.js';
import {
  AuthResult,
  LoginInput,
  RegisterInput,
  SocialTokenPayload,
  UserProfile,
  CalendarEventDto,
  CreateCalendarEventDto,
  DateRange,
} from '@lich-viet/contracts';
import { DEMO_USER_PROFILE, DEMO_CALENDAR_EVENTS_SEED } from './seed.js';

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

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    this.user = {
      ...this.user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.user;
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
      calendarType: event.calendarType ?? 'solar',
      solarDate: event.solarDate,
      lunarDay: event.lunarDay,
      lunarMonth: event.lunarMonth,
      lunarYear: event.lunarYear,
      isLeapMonth: event.isLeapMonth,
      recurrence: event.recurrence ?? 'none',
      recurrenceEndDate: event.recurrenceEndDate,
      category: event.category ?? 'personal',
      emoji: event.emoji,
      color: event.color,
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
    calendar: new DemoCalendarEventGateway(),
  };
}

