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
      })
    );
  });

  it('fetches Đám Giỗ records with auth header', async () => {
    client.setToken('auth-token-xyz');
    const mockDamGioList = [
      {
        id: 'dg-1',
        userId: 'usr-1',
        deceasedName: 'Cụ Tổ',
        relationship: 'Ông Cố',
        lunarDay: 15,
        lunarMonth: 7,
        alarmLeadDays: [1, 3],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockDamGioList,
    } as Response);

    const records = await client.listDamGio();
    expect(records.length).toBe(1);
    expect(records[0]?.deceasedName).toBe('Cụ Tổ');
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:3000/v1/dam-gio',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer auth-token-xyz',
        }),
      })
    );
  });
});
