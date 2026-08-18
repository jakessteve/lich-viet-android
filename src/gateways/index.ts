import {
  AuthResult,
  LoginInput,
  RegisterInput,
  SocialTokenPayload,
  UserProfile,
  CalendarEventDto,
  CreateCalendarEventDto,
  DateRange,
  SyncPushRequest,
  SyncPullResponse,
} from '@lich-viet/contracts';

export interface AuthGateway {
  login(input: LoginInput): Promise<AuthResult>;
  loginWithSocial(provider: 'google' | 'facebook' | 'apple' | 'zalo', payload: SocialTokenPayload): Promise<AuthResult>;
  logout(): Promise<void>;
  register(input: RegisterInput): Promise<AuthResult>;
  getProfile(): Promise<UserProfile>;
}

export interface CalendarEventGateway {
  getEvents(range: DateRange): Promise<CalendarEventDto[]>;
  saveEvent(event: CreateCalendarEventDto): Promise<CalendarEventDto>;
  deleteEvent(id: string): Promise<void>;
}

export interface SyncGateway {
  sync(request: SyncPushRequest): Promise<SyncPullResponse>;
}

export interface RuntimeContext {
  kind: 'demo' | 'remote';
  auth: AuthGateway;
  calendar: CalendarEventGateway;
  sync?: SyncGateway;
}

