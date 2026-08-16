import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  useAppStore,
  clampDate,
  isFontSizeLevel,
  getInitialDarkMode,
  getInitialFontSize,
  getInitialScrollToTop,
  executeThemeTransition,
  safeStorage,
  type FontSizeLevel,
} from '@/stores/appStore';

describe('appStore Hardening & Defensive Invariants', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.fontSize = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('clampDate() & Immutability Invariants', () => {
    it('returns a defensive copy to prevent external mutation of store state', () => {
      const original = new Date(2025, 5, 15);
      const clamped = clampDate(original);

      expect(clamped.getTime()).toBe(original.getTime());
      expect(clamped).not.toBe(original);

      // Mutating original must not affect clamped
      original.setFullYear(2030);
      expect(clamped.getFullYear()).toBe(2025);
    });

    it('handles Invalid Date (NaN) without throwing and returns valid fallback date', () => {
      const invalidDate = new Date(NaN);
      const result = clampDate(invalidDate);

      expect(result).toBeInstanceOf(Date);
      expect(Number.isNaN(result.getTime())).toBe(false);
      expect(result.getFullYear()).toBeGreaterThanOrEqual(1900);
      expect(result.getFullYear()).toBeLessThanOrEqual(2199);
    });

    it('handles non-date inputs defensively', () => {
      expect(clampDate(null)).toBeInstanceOf(Date);
      expect(clampDate(undefined)).toBeInstanceOf(Date);
      expect(clampDate('2025-01-01')).toBeInstanceOf(Date);
      expect(clampDate({})).toBeInstanceOf(Date);
    });

    it('strictly clamps lower and upper boundaries', () => {
      expect(clampDate(new Date(1850, 0, 1)).getFullYear()).toBe(1900);
      expect(clampDate(new Date(2350, 11, 31)).getFullYear()).toBe(2199);
    });

    it('handles leap day (Feb 29) clamping to non-leap years gracefully', () => {
      // 1896 is a leap year; clamped to 1900 (non-leap year)
      const leapDay = new Date(1896, 1, 29);
      const clamped = clampDate(leapDay);
      expect(clamped.getFullYear()).toBe(1900);
      expect(clamped.getMonth()).toBe(1); // February
      expect(clamped.getDate()).toBe(28); // Clamped to Feb 28
    });
  });

  describe('Storage Resilience & Quota/Security Fault Injection', () => {
    it('gracefully handles localStorage.getItem throwing SecurityError', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      });

      expect(() => getInitialFontSize()).not.toThrow();
      expect(getInitialFontSize()).toBe('normal');

      expect(() => getInitialScrollToTop()).not.toThrow();
      expect(getInitialScrollToTop()).toBe(true);

      expect(() => getInitialDarkMode()).not.toThrow();
      expect(safeStorage.get('anyKey')).toBeNull();
    });

    it('gracefully handles localStorage.setItem throwing QuotaExceededError', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Quota exceeded.', 'QuotaExceededError');
      });

      const store = useAppStore.getState();
      expect(() => store.setFontSizeLevel('large')).not.toThrow();
      expect(useAppStore.getState().fontSize).toBe('large');

      expect(() => store.setShowScrollToTopButton(false)).not.toThrow();
      expect(useAppStore.getState().showScrollToTopButton).toBe(false);

      expect(() => safeStorage.set('test', 'value')).not.toThrow();
      expect(() => safeStorage.remove('test')).not.toThrow();
    });
  });

  describe('Font Size Validation & Injection Protection', () => {
    it('validates FontSizeLevel type predicates', () => {
      expect(isFontSizeLevel('small')).toBe(true);
      expect(isFontSizeLevel('normal')).toBe(true);
      expect(isFontSizeLevel('large')).toBe(true);
      expect(isFontSizeLevel('huge')).toBe(false);
      expect(isFontSizeLevel(null)).toBe(false);
      expect(isFontSizeLevel(14)).toBe(false);
    });

    it('falls back to "normal" when setFontSizeLevel receives malicious/untyped input', () => {
      const store = useAppStore.getState();
      store.setFontSizeLevel('invalid_size' as FontSizeLevel);

      expect(useAppStore.getState().fontSize).toBe('normal');
      expect(document.documentElement.style.fontSize).toBe('16px');
    });
  });

  describe('Theme & View Transition Resilience', () => {
    it('falls back to window.matchMedia when no theme is persisted in localStorage', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-color-scheme: dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getInitialDarkMode()).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('handles synchronous failure in startViewTransition without unhandled rejection', () => {
      const applyMock = vi.fn();
      (document as unknown as { startViewTransition: unknown }).startViewTransition = vi.fn(() => {
        throw new Error('Transition canceled');
      });

      expect(() => executeThemeTransition(applyMock)).not.toThrow();
      expect(applyMock).toHaveBeenCalledTimes(1);
      expect(document.documentElement.classList.contains('theme-transitioning')).toBe(false);
    });
  });
});
