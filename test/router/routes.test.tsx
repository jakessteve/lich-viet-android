import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import {
  getSavedRoute,
  saveCurrentRoute,
  LAST_ACTIVE_ROUTE_KEY,
  LandingRoute,
} from '@/router/routes';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
  },
}));

describe('Route Persistence & Native Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getSavedRoute', () => {
    it('returns default /app/am-lich when no route is saved', () => {
      expect(getSavedRoute()).toBe('/app/am-lich');
    });

    it('returns saved route when valid /app path exists', () => {
      localStorage.setItem(LAST_ACTIVE_ROUTE_KEY, '/app/tu-vi');
      expect(getSavedRoute()).toBe('/app/tu-vi');
    });

    it('returns saved route with query parameters', () => {
      localStorage.setItem(LAST_ACTIVE_ROUTE_KEY, '/app/gieo-que?method=tam-thuc');
      expect(getSavedRoute()).toBe('/app/gieo-que?method=tam-thuc');
    });

    it('falls back to /app/am-lich if stored route is invalid or bare /app', () => {
      localStorage.setItem(LAST_ACTIVE_ROUTE_KEY, '/app');
      expect(getSavedRoute()).toBe('/app/am-lich');

      localStorage.setItem(LAST_ACTIVE_ROUTE_KEY, '/invalid');
      expect(getSavedRoute()).toBe('/app/am-lich');
    });
  });

  describe('saveCurrentRoute', () => {
    it('persists valid /app routes to localStorage', () => {
      saveCurrentRoute('/app/tu-vi');
      expect(localStorage.getItem(LAST_ACTIVE_ROUTE_KEY)).toBe('/app/tu-vi');
    });

    it('persists search queries with the path', () => {
      saveCurrentRoute('/app/gieo-que', '?tab=mai-hoa');
      expect(localStorage.getItem(LAST_ACTIVE_ROUTE_KEY)).toBe('/app/gieo-que?tab=mai-hoa');
    });

    it('does not persist root / or bare /app routes', () => {
      saveCurrentRoute('/');
      expect(localStorage.getItem(LAST_ACTIVE_ROUTE_KEY)).toBeNull();

      saveCurrentRoute('/app');
      expect(localStorage.getItem(LAST_ACTIVE_ROUTE_KEY)).toBeNull();
    });
  });

  describe('LandingRoute', () => {
    it('redirects to saved route when isNativePlatform is true', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      localStorage.setItem(LAST_ACTIVE_ROUTE_KEY, '/app/tu-vi');

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<LandingRoute />} />
            <Route path="/app/tu-vi" element={<div>Tu Vi Page Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Tu Vi Page Target')).toBeInTheDocument();
    });

    it('redirects to /app/am-lich on native platform when no prior route was saved', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<LandingRoute />} />
            <Route path="/app/am-lich" element={<div>Am Lich Default Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Am Lich Default Target')).toBeInTheDocument();
    });
  });
});
