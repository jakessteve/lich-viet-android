import {
  AuthGateway,
  CalendarEventGateway,
  DamGioGateway,
  SyncGateway,
  RuntimeContext,
} from '../index.js';
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
    _payload: SocialTokenPayload
  ): Promise<AuthResult> {
    return this.client.login({ email: `social-${provider}@lichviet.local` });
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

export class RemoteDamGioGateway implements DamGioGateway {
  constructor(private client: LichVietApiClient) {}

  async listDamGio(): Promise<DamGioRecord[]> {
    return this.client.listDamGio();
  }

  async createDamGio(entry: CreateDamGioDto): Promise<DamGioRecord> {
    return this.client.createDamGio(entry);
  }

  async updateDamGio(id: string, entry: UpdateDamGioDto): Promise<DamGioRecord> {
    return this.client.updateDamGio(id, entry);
  }

  async deleteDamGio(id: string): Promise<void> {
    return this.client.deleteDamGio(id);
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

  async deleteEvent(_id: string): Promise<void> {}
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
    damGio: new RemoteDamGioGateway(client),
    calendar: new RemoteCalendarEventGateway(client),
    sync: new RemoteSyncGateway(client),
  };
}
