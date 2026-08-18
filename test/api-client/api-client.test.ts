import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LichVietApiClient } from '@lich-viet/api-client';

describe('LichVietApiClient', () => {
  let client: LichVietApiClient;

  beforeEach(() => {
    client = new LichVietApiClient('http://localhost:3000');
    vi.restoreAllMocks();
  });

  it('manages authorization token correctly', () => {
    expect(client.getToken()).toBeNull();
    client.setToken('test-bearer-token');
    expect(client.getToken()).toBe('test-bearer-token');
    client.setToken(null);
    expect(client.getToken()).toBeNull();
  });

  it('performs login request with JSON payload', async () => {
    const mockAuthResult = {
      accessToken: 'jwt-token-123',
      user: {
        id: 'usr-1',
        email: 'test@lichviet.local',
        name: 'Tester',
        tier: 'free' as const,
        role: 'user' as const,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockAuthResult,
    } as Response);

    const result = await client.login({ email: 'test@lichviet.local' });
    expect(result.accessToken).toBe('jwt-token-123');
    expect(result.user.email).toBe('test@lichviet.local');
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:3000/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });


  it('calls aligned calculation routes matching NestJS backend controllers', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    await client.calculateTuViChart({ birthDate: '1995-08-15' });
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/v1/tu-vi/chart', expect.anything());

    await client.calculateWesternChart({ birthDate: '1995-08-15' });
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/v1/astrology/western', expect.anything());

    await client.calculateVedicChart({ birthDate: '1995-08-15' });
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/v1/astrology/vedic', expect.anything());

    await client.calculateSynastry({ personA: {}, personB: {} });
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/v1/astrology/synastry', expect.anything());

    await client.calculateMaiHoa({ date: '2026-08-18' });
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/v1/divination/mai-hoa', expect.anything());

    await client.calculateTamThuc({ date: '2026-08-18' });
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/v1/divination/tam-thuc', expect.anything());

    await client.getDungSuCatalog();
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/v1/calendar/dung-su/catalog', expect.anything());

    await client.getDungSuScore('2026-08-18', 'general');
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/v1/calendar/dung-su/score', expect.anything());
  });
});
