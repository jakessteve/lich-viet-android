import {
  AuthResult,
  LoginInput,
  RegisterInput,
  SocialTokenPayload,
  UserProfile,
  SyncPushRequest,
  SyncPullResponse,
  CalendarEventDto,
  CreateCalendarEventDto,
  DateRange,
  AsyncCalculationRequest,
  HybridElectionTimeline,
  TuViBirthInput,
  TuViChartDto,
  WesternChartInput,
  WesternNatalChartDto,
  VedicChartInput,
  SynastryInput,
  MaiHoaInput,
  TamThucInput,
  TamThucSynthesisDto,
  ApiEnvelope,
} from '@lich-viet/contracts';

export type { ApiEnvelope };

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly traceId?: string;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode: number;
      details?: unknown;
      traceId?: string;
    },
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = options.code || 'API_ERROR';
    this.statusCode = options.statusCode;
    this.details = options.details;
    this.traceId = options.traceId;
  }
}

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
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers as Record<string, string>),
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    let parsedBody: unknown;
    try {
      parsedBody = await response.json();
    } catch {
      // Body not JSON
    }

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lichviet:unauthorized', { detail: { path } }));
      }

      const envelope = parsedBody as ApiEnvelope | undefined;
      const errorCode = envelope?.error?.code || (parsedBody as { error?: string })?.error || 'HTTP_ERROR';
      const errorMessage =
        envelope?.error?.message ||
        (parsedBody as { message?: string })?.message ||
        `HTTP ${response.status} ${response.statusText}`;
      const errorDetails = envelope?.error?.details || (parsedBody as { details?: unknown })?.details;
      const traceId = envelope?.meta?.traceId;

      throw new ApiClientError(errorMessage, {
        code: errorCode,
        statusCode: response.status,
        details: errorDetails,
        traceId,
      });
    }

    const envelope = parsedBody as ApiEnvelope<T> | undefined;
    if (envelope && typeof envelope === 'object' && 'ok' in envelope) {
      if (envelope.ok === false) {
        throw new ApiClientError(envelope.error?.message || 'Yêu cầu không thành công', {
          code: envelope.error?.code || 'OPERATION_FAILED',
          statusCode: response.status,
          details: envelope.error?.details,
          traceId: envelope.meta?.traceId,
        });
      }
      return envelope.data as T;
    }

    return parsedBody as T;
  }

  // ── Auth Endpoints ──────────────────────────────────────────
  async login(input: LoginInput): Promise<AuthResult> {
    return this.fetchJson<AuthResult>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    return this.fetchJson<AuthResult>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async socialAuth(payload: SocialTokenPayload): Promise<AuthResult> {
    return this.fetchJson<AuthResult>('/v1/auth/social', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async loginWithSocial(payload: SocialTokenPayload): Promise<AuthResult> {
    return this.socialAuth(payload);
  }

  async getProfile(): Promise<UserProfile> {
    return this.fetchJson<UserProfile>('/v1/users/me');
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.fetchJson<UserProfile>('/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // ── Calendar Event Endpoints ────────────────────────────────
  async getCalendarEvents(range: DateRange): Promise<CalendarEventDto[]> {
    return this.fetchJson<CalendarEventDto[]>(
      `/v1/calendar/events?start=${encodeURIComponent(range.startDate)}&end=${encodeURIComponent(range.endDate)}`,
    );
  }

  async createCalendarEvent(event: CreateCalendarEventDto): Promise<CalendarEventDto> {
    return this.fetchJson<CalendarEventDto>('/v1/calendar/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await this.fetchJson(`/v1/calendar/events/${id}`, { method: 'DELETE' });
  }

  // ── Sync Endpoint ───────────────────────────────────────────
  async sync(pushData: SyncPushRequest): Promise<SyncPullResponse> {
    return this.fetchJson<SyncPullResponse>('/v1/sync', {
      method: 'POST',
      body: JSON.stringify(pushData),
    });
  }

  // ── Metaphysical & Calculation Endpoints ────────────────────
  async getCalendarDay(date: string, timezone = 7): Promise<unknown> {
    return this.fetchJson(`/v1/calendar/day?date=${encodeURIComponent(date)}&timezone=${timezone}`);
  }

  async getDungSuCatalog(): Promise<unknown> {
    return this.fetchJson('/v1/calendar/dung-su/catalog');
  }

  async getDungSuScore(date: string, profileId?: string): Promise<unknown> {
    return this.fetchJson('/v1/calendar/dung-su/score', {
      method: 'POST',
      body: JSON.stringify({ date, profileId }),
    });
  }

  async calculateTuViChart(data: TuViBirthInput): Promise<TuViChartDto> {
    return this.fetchJson<TuViChartDto>('/v1/tu-vi/chart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateWesternChart(data: WesternChartInput): Promise<WesternNatalChartDto> {
    return this.fetchJson<WesternNatalChartDto>('/v1/astrology/western', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateVedicChart(data: VedicChartInput): Promise<unknown> {
    return this.fetchJson('/v1/astrology/vedic', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateSynastry(data: SynastryInput): Promise<unknown> {
    return this.fetchJson('/v1/astrology/synastry', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateMaiHoa(data: MaiHoaInput): Promise<unknown> {
    return this.fetchJson('/v1/divination/mai-hoa', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateTamThuc(data: TamThucInput): Promise<TamThucSynthesisDto> {
    return this.fetchJson<TamThucSynthesisDto>('/v1/divination/tam-thuc', {
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
