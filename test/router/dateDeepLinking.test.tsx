import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAppStore, parseIsoDate, toIsoDateString } from '@/stores/appStore';
import AmLichPage from '@/components/pages/AmLichPage';
import { resolveElectionActivityId } from '@/services/election/electionEngine';
import { getActivityById } from '@/utils/activityCatalog';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}));

describe('Date Deep Linking & Logic Interconnection Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('parseIsoDate & toIsoDateString utilities', () => {
    it('correctly parses ISO string YYYY-MM-DD into local Date', () => {
      const parsed = parseIsoDate('2026-08-19');
      expect(parsed).not.toBeNull();
      expect(parsed?.getFullYear()).toBe(2026);
      expect(parsed?.getMonth()).toBe(7); // 0-indexed month (August = 7)
      expect(parsed?.getDate()).toBe(19);
    });

    it('formats local Date to YYYY-MM-DD string consistently', () => {
      const date = new Date(2026, 7, 19);
      expect(toIsoDateString(date)).toBe('2026-08-19');
    });

    it('returns null for invalid inputs', () => {
      expect(parseIsoDate(null)).toBeNull();
      expect(parseIsoDate(undefined)).toBeNull();
      expect(parseIsoDate('invalid-date')).toBeNull();
      expect(parseIsoDate('2026-02-31')).toBeNull(); // 31 Feb is invalid
      expect(parseIsoDate('')).toBeNull();
    });

    it('clamps dates to supported boundary [1900, 2199]', () => {
      const beforeMin = parseIsoDate('1850-01-01');
      expect(beforeMin?.getFullYear()).toBe(1900);

      const afterMax = parseIsoDate('2250-12-31');
      expect(afterMax?.getFullYear()).toBe(2199);
    });
  });

  describe('AmLichPage URL query parameter synchronization', () => {
    it('synchronizes selectedDate from ?date=YYYY-MM-DD param', async () => {
      render(
        <MemoryRouter initialEntries={['/app/am-lich?date=2026-11-25']}>
          <Routes>
            <Route path="/app/am-lich" element={<AmLichPage />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const state = useAppStore.getState();
        expect(state.selectedDate.getFullYear()).toBe(2026);
        expect(state.selectedDate.getMonth()).toBe(10); // November = 10
        expect(state.selectedDate.getDate()).toBe(25);
      });
    });

    it('ignores invalid ?date param gracefully and keeps current store date', async () => {
      const initialDate = new Date(2025, 5, 15);
      useAppStore.getState().setSelectedDate(initialDate);

      render(
        <MemoryRouter initialEntries={['/app/am-lich?date=not-a-valid-date']}>
          <Routes>
            <Route path="/app/am-lich" element={<AmLichPage />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const state = useAppStore.getState();
        expect(state.selectedDate.getFullYear()).toBe(2025);
        expect(state.selectedDate.getMonth()).toBe(5);
        expect(state.selectedDate.getDate()).toBe(15);
      });
    });
  });

  describe('Activity resolution & Cross-system Mapping', () => {
    it('resolves election activity presets to canonical activity IDs', () => {
      expect(resolveElectionActivityId('cuoi-hoi')).toBe('cuoi-hoi');
      expect(resolveElectionActivityId('khai-truong')).toBe('khai-truong');
      expect(resolveElectionActivityId('xay-dung')).toBe('xay-dung');
      expect(resolveElectionActivityId('nhap-trach')).toBe('chuyen-nha');
      expect(resolveElectionActivityId('xuat-hanh')).toBe('xuat-hanh');
      expect(resolveElectionActivityId('khac')).toBe('cau-tai');
    });

    it('resolves specific catalog activity IDs correctly', () => {
      expect(resolveElectionActivityId('dong-tho')).toBe('dong-tho');
      expect(resolveElectionActivityId('giao-dich')).toBe('giao-dich');
      expect(resolveElectionActivityId('ky-hop-dong')).toBe('ky-hop-dong');
      expect(resolveElectionActivityId('chua-benh')).toBe('chua-benh');
    });

    it('falls back to cuoi-hoi for undefined or unknown activities', () => {
      expect(resolveElectionActivityId(undefined)).toBe('cuoi-hoi');
      expect(resolveElectionActivityId('unknown-random-activity-id')).toBe('cuoi-hoi');
    });

    it('ensures all resolved activities exist in activityCatalog', () => {
      const testActivities = ['cuoi-hoi', 'khai-truong', 'xay-dung', 'nhap-trach', 'xuat-hanh', 'khac', 'dong-tho'];
      for (const act of testActivities) {
        const resolvedId = resolveElectionActivityId(act);
        const entry = getActivityById(resolvedId);
        expect(entry).toBeDefined();
        expect(entry?.id).toBe(resolvedId);
      }
    });
  });
});
