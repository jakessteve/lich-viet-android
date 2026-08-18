import { AuthGateway, CalendarEventGateway, SyncGateway, RuntimeContext } from '../index.js';
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
import { LichVietApiClient } from '@lich-viet/api-client';

export class RemoteAuthGateway implements AuthGateway {
  constructor(private client: LichVietApiClient) {}

  async login(input: LoginInput): Promise<AuthResult> {
    const res = await this.client.login(input);
    this.client.setToken(res.accessToken);
    return res;
  }

  async loginWithSocial(
    provider: 'google' | 'facebook' | 'apple' | 'zalo',
    payload: SocialTokenPayload,
  ): Promise<AuthResult> {
    const res = await this.client.loginWithSocial({
      provider,
      token: payload.token || `social-token-${Date.now()}`,
      codeVerifier: payload.codeVerifier,
      redirectUri: payload.redirectUri,
    });
    this.client.setToken(res.accessToken);
    return res;
  }

  async logout(): Promise<void> {
    this.client.setToken(null);
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const res = await this.client.register(input);
    this.client.setToken(res.accessToken);
    return res;
  }

  async getProfile(): Promise<UserProfile> {
    return this.client.getProfile();
  }
}

export class RemoteCalendarEventGateway implements CalendarEventGateway {
  constructor(private client: LichVietApiClient) {}

  async getEvents(range: DateRange): Promise<CalendarEventDto[]> {
    return this.client.getCalendarEvents(range);
  }

  async saveEvent(event: CreateCalendarEventDto): Promise<CalendarEventDto> {
    return this.client.createCalendarEvent(event);
  }

  async deleteEvent(id: string): Promise<void> {
    return this.client.deleteCalendarEvent(id);
  }
}

export class RemoteSyncGateway implements SyncGateway {
  constructor(private client: LichVietApiClient) {}

  async sync(request: SyncPushRequest): Promise<SyncPullResponse> {
    return this.client.sync(request);
  }
}

export function createRemoteRuntime(apiBaseUrl = 'http://localhost:3000'): RuntimeContext {
  const client = new LichVietApiClient(apiBaseUrl);
  return {
    kind: 'remote',
    auth: new RemoteAuthGateway(client),
    calendar: new RemoteCalendarEventGateway(client),
    sync: new RemoteSyncGateway(client),
  };
}

