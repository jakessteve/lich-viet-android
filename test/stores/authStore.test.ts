import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('seeds the local admin account on load', async () => {
    await import('@/stores/authStore');

    const rawUsers = localStorage.getItem('auth_users_db');
    expect(rawUsers).toBeTruthy();

    const users = JSON.parse(rawUsers as string) as Array<{
      user: { email: string };
    }>;
    expect(users.some((entry) => entry.user.email === 'admin@lichviet.app')).toBe(true);
  });

  it('allows the seeded admin account to log in', async () => {
    const { useAuthStore } = await import('@/stores/authStore');

    const result = await useAuthStore.getState().login({
      email: 'admin@lichviet.app',
      password: 'AdminP@ssw0rd',
    });

    expect(result).toEqual({ success: true });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('admin@lichviet.app');
  });

  it('rehydrates from localStorage on refresh', async () => {
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 'session-user',
        email: 'persisted@example.com',
        displayName: 'Persisted User',
        provider: 'email',
        createdAt: '2026-05-27T00:00:00.000Z',
      }),
    );
    localStorage.setItem('auth_user_session_initialized', 'true');

    const { useAuthStore } = await import('@/stores/authStore');
    useAuthStore.getState().rehydrate();

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('persisted@example.com');
  });

  it('does not auto-login from auth_user alone on a fresh install', async () => {
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 'seed-admin-lich-viet',
        email: 'admin@lichviet.app',
        displayName: 'Admin',
        provider: 'email',
        createdAt: '2026-05-16T00:00:00.000Z',
      }),
    );

    const { useAuthStore } = await import('@/stores/authStore');

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('persists a Tu Vi markdown cache when updating birth data', async () => {
    const { useAuthStore } = await import('@/stores/authStore');

    await useAuthStore.getState().login({
      email: 'admin@lichviet.app',
      password: 'AdminP@ssw0rd',
    });

    const result = await useAuthStore.getState().updateProfile({
      birthday: '1990-01-15',
      birthHour: 9,
      birthMinute: 30,
      birthLocation: {
        city: 'Hà Nội',
        lat: 21.028511,
        lng: 105.804817,
        countryCode: 'VN',
        countryName: 'Việt Nam',
      },
    });

    expect(result.success).toBe(true);
    expect(useAuthStore.getState().user?.extendedProfile?.natalChartCached).toBeTruthy();
    const cached = useAuthStore.getState().user?.extendedProfile?.natalChartCached as { markdown?: string } | undefined;
    expect(cached?.markdown).toContain('# Lá Số Tử Vi');
    expect(localStorage.getItem('auth_user')).toContain('natalChartCached');
  });
});
