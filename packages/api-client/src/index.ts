import {
  AuthResult,
  LoginInput,
  RegisterInput,
  UserProfile,
  DamGioRecord,
  CreateDamGioDto,
  UpdateDamGioDto,
  SyncPushRequest,
  SyncPullResponse,
  CalendarEventDto,
  CreateCalendarEventDto,
  DateRange,
  AsyncCalculationRequest,
  HybridElectionTimeline,
} from '@lich-viet/contracts';

export class LichVietApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  // Auth endpoints
  async login(data: LoginInput): Promise<AuthResult> {
    return this.fetchJson<AuthResult>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterInput): Promise<AuthResult> {
    return this.fetchJson<AuthResult>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<UserProfile> {
    return this.fetchJson<UserProfile>('/v1/users/me');
  }

  // Đám Giỗ endpoints
  async listDamGio(): Promise<DamGioRecord[]> {
    return this.fetchJson<DamGioRecord[]>('/v1/dam-gio');
  }

  async createDamGio(data: CreateDamGioDto): Promise<DamGioRecord> {
    return this.fetchJson<DamGioRecord>('/v1/dam-gio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDamGio(id: string, data: UpdateDamGioDto): Promise<DamGioRecord> {
    return this.fetchJson<DamGioRecord>(`/v1/dam-gio/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDamGio(id: string): Promise<void> {
    await this.fetchJson(`/v1/dam-gio/${id}`, { method: 'DELETE' });
  }

  // Calendar event endpoints
  async getCalendarEvents(range: DateRange): Promise<CalendarEventDto[]> {
    return this.fetchJson<CalendarEventDto[]>(`/v1/calendar/events?start=${range.startDate}&end=${range.endDate}`);
  }

  async createCalendarEvent(event: CreateCalendarEventDto): Promise<CalendarEventDto> {
    return this.fetchJson<CalendarEventDto>('/v1/calendar/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  // Sync endpoint
  async sync(pushData: SyncPushRequest): Promise<SyncPullResponse> {
    return this.fetchJson<SyncPullResponse>('/v1/sync', {
      method: 'POST',
      body: JSON.stringify(pushData),
    });
  }

  // Metaphysical & Calculation endpoints
  async getCalendarDay(date: string, timezone = 7): Promise<unknown> {
    return this.fetchJson(`/v1/calendar/day?date=${encodeURIComponent(date)}&timezone=${timezone}`);
  }

  async calculateTuViChart(data: unknown): Promise<unknown> {
    return this.fetchJson('/v1/tuvi/chart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateWesternChart(data: unknown): Promise<unknown> {
    return this.fetchJson('/v1/astrology/western-chart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateVedicChart(data: unknown): Promise<unknown> {
    return this.fetchJson('/v1/astrology/vedic-chart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateMaiHoa(data: unknown): Promise<unknown> {
    return this.fetchJson('/v1/divination/maihoa', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateElectionScan(request: AsyncCalculationRequest): Promise<HybridElectionTimeline[]> {
    return this.fetchJson<HybridElectionTimeline[]>('/v1/election/scan', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}
