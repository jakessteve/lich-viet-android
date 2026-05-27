import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppFooter, { getFooterActionLabel } from '@/components/layout/AppFooter';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types/auth';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@lichviet.app',
    displayName: 'Người dùng',
    provider: 'email',
    createdAt: '2026-05-26T00:00:00.000Z',
    ...overrides,
  };
}

function renderFooter() {
  return render(
    <MemoryRouter>
      <AppFooter />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
});

describe('AppFooter', () => {
  it('keeps Nâng cấp for guests and free users', () => {
    expect(getFooterActionLabel(null, false)).toBe('Nâng cấp');

    useAuthStore.setState({ user: makeUser({ accessTier: 'free' }), isAuthenticated: true });
    renderFooter();

    expect(screen.getByRole('button', { name: 'Nâng cấp' })).toBeTruthy();
    expect(screen.queryByText(/Lịch Việt — Tra cứu âm lịch/i)).toBeNull();
    expect(screen.queryByText('menu')).toBeNull();
  });

  it('shows Premium for premium users', () => {
    useAuthStore.setState({ user: makeUser({ accessTier: 'premium' }), isAuthenticated: true });
    renderFooter();

    expect(screen.getByRole('button', { name: 'Premium' })).toBeTruthy();
  });

  it('shows Admin for admin users', () => {
    useAuthStore.setState({ user: makeUser({ email: 'admin@lichviet.app', displayName: 'Admin' }), isAuthenticated: true });
    renderFooter();

    expect(screen.getByRole('button', { name: 'Admin' })).toBeTruthy();
  });
});
