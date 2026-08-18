import { create } from 'zustand';
import { analytics } from '@/services/analyticsService';
import { getDetailedDayData } from '@/utils/calendarEngine';
import type { SwissGeoLocation } from '@/services/astronomy/swissEphemeris';
import type { DayDetailsData } from '@/types/calendar';

// ══════════════════════════════════════════════════════════
// Type Definitions & Constants
// ══════════════════════════════════════════════════════════

export type FontSizeLevel = 'small' | 'normal' | 'large';

export const FONT_SIZE_MAP: Readonly<Record<FontSizeLevel, number>> = Object.freeze({
  small: 14,
  normal: 16,
  large: 18,
});

export const FONT_SIZE_CYCLE: Readonly<Record<FontSizeLevel, FontSizeLevel>> = Object.freeze({
  small: 'normal',
  normal: 'large',
  large: 'small',
});

export const MIN_SUPPORTED_YEAR = 1900;
export const MAX_SUPPORTED_YEAR = 2199;

export type ThemeTransitionOrigin = React.MouseEvent | MouseEvent | { clientX?: number; clientY?: number } | undefined;

// ══════════════════════════════════════════════════════════
// Safe Storage Abstraction (Handles QuotaExceeded / SecurityError)
// ══════════════════════════════════════════════════════════

export const safeStorage = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Degrade gracefully in sandboxed iframes or private modes
    }
  },
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Degrade gracefully
    }
  },
};

export function isFontSizeLevel(value: unknown): value is FontSizeLevel {
  return typeof value === 'string' && value in FONT_SIZE_MAP;
}

// ══════════════════════════════════════════════════════════
// Date Utilities (Defensive, Pure & Invariant Protected)
// ══════════════════════════════════════════════════════════

/**
 * Validates, defensively clones, and clamps a date to [1900-01-01, 2199-12-31].
 * Guarantees a valid Date instance without external mutation leaks or NaN crashes.
 */
export function clampDate(date: unknown): Date {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    const fallback = new Date();
    return Number.isNaN(fallback.getTime()) ? new Date(MIN_SUPPORTED_YEAR, 0, 1) : fallback;
  }

  const cloned = new Date(date.getTime());
  const year = cloned.getFullYear();

  if (year < MIN_SUPPORTED_YEAR) {
    const month = cloned.getMonth();
    const day = cloned.getDate();
    cloned.setFullYear(MIN_SUPPORTED_YEAR);
    // Correct for non-leap year adjustment if original was Feb 29
    if (month === 1 && day === 29 && cloned.getMonth() !== 1) {
      cloned.setMonth(1, 28);
    }
  } else if (year > MAX_SUPPORTED_YEAR) {
    const month = cloned.getMonth();
    const day = cloned.getDate();
    cloned.setFullYear(MAX_SUPPORTED_YEAR);
    if (month === 1 && day === 29 && cloned.getMonth() !== 1) {
      cloned.setMonth(1, 28);
    }
  }

  return cloned;
}

// ══════════════════════════════════════════════════════════
// DOM Side Effects & Transition Management
// ══════════════════════════════════════════════════════════

export function applyFontSizeToDOM(fontSize: FontSizeLevel): void {
  if (typeof document === 'undefined') return;
  const sizePx = FONT_SIZE_MAP[fontSize] ?? FONT_SIZE_MAP.normal;
  document.documentElement.style.fontSize = `${sizePx}px`;
}

export function syncThemeToDOM(isDark: boolean): void {
  if (typeof document === 'undefined') return;
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

type TransitionViewDoc = {
  startViewTransition?: (cb: () => void | Promise<void>) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

export function executeThemeTransition(apply: () => void, origin?: ThemeTransitionOrigin): void {
  if (typeof document === 'undefined') {
    apply();
    return;
  }

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  const doc = document as unknown as TransitionViewDoc;

  if (typeof doc.startViewTransition === 'function' && !prefersReducedMotion) {
    let x = window.innerWidth - 36;
    let y = 36;

    if (origin) {
      if (
        'clientX' in origin &&
        typeof origin.clientX === 'number' &&
        typeof origin.clientY === 'number' &&
        (origin.clientX > 0 || origin.clientY > 0)
      ) {
        x = origin.clientX;
        y = origin.clientY;
      } else {
        const elem = (('currentTarget' in origin && origin.currentTarget) ||
          ('target' in origin && origin.target)) as HTMLElement | null;
        if (elem && typeof elem.getBoundingClientRect === 'function') {
          const rect = elem.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
          }
        }
      }
    } else {
      const toggleBtn = document.getElementById('tour-theme-toggle') ?? document.getElementById('toggle-dark-mode');
      if (toggleBtn) {
        const rect = toggleBtn.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        }
      }
    }

    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    document.documentElement.style.setProperty('--theme-x', `${x}px`);
    document.documentElement.style.setProperty('--theme-y', `${y}px`);
    document.documentElement.classList.add('theme-transitioning');

    try {
      const transition = doc.startViewTransition(() => {
        apply();
      });

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
            },
            {
              duration: 150,
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        })
        .catch(() => {
          document.documentElement.classList.remove('theme-transitioning');
        });

      transition.finished.finally(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('theme-transitioning');
        });
      });
      return;
    } catch {
      document.documentElement.classList.remove('theme-transitioning');
      apply();
      return;
    }
  }

  // Fallback for browsers without View Transitions or with prefers-reduced-motion
  apply();
}

// ══════════════════════════════════════════════════════════
// Initial State Resolvers
// ══════════════════════════════════════════════════════════

export function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  const savedTheme = safeStorage.get('theme');
  if (savedTheme === 'dark') {
    syncThemeToDOM(true);
    return true;
  }
  if (savedTheme === 'light') {
    syncThemeToDOM(false);
    return false;
  }
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
  syncThemeToDOM(systemDark);
  return systemDark;
}

export function getInitialFontSize(): FontSizeLevel {
  const saved = safeStorage.get('fontSize');
  const level: FontSizeLevel = isFontSizeLevel(saved) ? saved : 'normal';
  applyFontSizeToDOM(level);
  return level;
}

export function getInitialScrollToTop(): boolean {
  const saved = safeStorage.get('showScrollToTopButton');
  return saved === null ? true : saved === 'true';
}

// ══════════════════════════════════════════════════════════
// Store Interface & Implementation
// ══════════════════════════════════════════════════════════

interface AppState {
  selectedDate: Date;
  dayData: DayDetailsData;
  viewerLocation: SwissGeoLocation | null;
  isDark: boolean;
  fontSize: FontSizeLevel;
  isPersonalized: boolean;
  showScrollToTopButton: boolean;
}

interface AppActions {
  setSelectedDate: (date: Date) => void;
  setViewerLocation: (location: SwissGeoLocation | null) => void;
  toggleDarkMode: (origin?: ThemeTransitionOrigin) => void;
  cycleFontSize: () => void;
  setFontSizeLevel: (level: FontSizeLevel) => void;
  togglePersonalization: () => void;
  setShowScrollToTopButton: (enabled: boolean) => void;
}

export type AppStore = AppState & AppActions;

const initialDate = clampDate(new Date());

export const useAppStore = create<AppStore>()((set) => ({
  // State
  selectedDate: initialDate,
  dayData: getDetailedDayData(initialDate),
  viewerLocation: null,
  isDark: getInitialDarkMode(),
  isPersonalized: false,
  fontSize: getInitialFontSize(),
  showScrollToTopButton: getInitialScrollToTop(),

  // Actions
  setSelectedDate: (date: Date) => {
    const clamped = clampDate(date);
    analytics.trackEvent({
      name: 'lunar_date_change',
      properties: { date: clamped.toISOString() },
    });
    set((state) => ({
      selectedDate: clamped,
      dayData: getDetailedDayData(clamped, state.viewerLocation ?? undefined),
    }));
  },

  setViewerLocation: (location: SwissGeoLocation | null) => {
    set((state) => ({
      viewerLocation: location,
      dayData: getDetailedDayData(state.selectedDate, location ?? undefined),
    }));
  },

  toggleDarkMode: (origin?: ThemeTransitionOrigin) => {
    set((state) => {
      const nextDark = !state.isDark;
      executeThemeTransition(() => {
        syncThemeToDOM(nextDark);
        safeStorage.set('theme', nextDark ? 'dark' : 'light');
      }, origin);

      analytics.trackEvent({
        name: 'theme_toggle',
        properties: { is_dark: nextDark },
      });
      return { isDark: nextDark };
    });
  },

  cycleFontSize: () =>
    set((state) => {
      const next = FONT_SIZE_CYCLE[state.fontSize] ?? 'normal';
      applyFontSizeToDOM(next);
      safeStorage.set('fontSize', next);
      analytics.trackEvent({
        name: 'font_size_change',
        properties: { font_size: next },
      });
      return { fontSize: next };
    }),

  setFontSizeLevel: (level: FontSizeLevel) => {
    const targetLevel = isFontSizeLevel(level) ? level : 'normal';
    applyFontSizeToDOM(targetLevel);
    safeStorage.set('fontSize', targetLevel);
    analytics.trackEvent({
      name: 'font_size_change',
      properties: { font_size: targetLevel },
    });
    set({ fontSize: targetLevel });
  },

  togglePersonalization: () =>
    set((state) => {
      const nextPersonalized = !state.isPersonalized;
      analytics.trackEvent({
        name: 'personalization_toggle',
        properties: { is_personalized: nextPersonalized },
      });
      return { isPersonalized: nextPersonalized };
    }),

  setShowScrollToTopButton: (enabled: boolean) => {
    const boolValue = Boolean(enabled);
    safeStorage.set('showScrollToTopButton', String(boolValue));
    set({ showScrollToTopButton: boolValue });
  },
}));
