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
});
