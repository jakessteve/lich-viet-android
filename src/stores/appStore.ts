import { create } from 'zustand';
import { analytics } from '@/services/analyticsService';
import { getDetailedDayData } from '@/utils/calendarEngine';
import type { SwissGeoLocation } from '@/services/astronomy/swissEphemeris';
import type { DayDetailsData } from '@/types/calendar';

// ══════════════════════════════════════════════════════════
// Type Definitions
// ══════════════════════════════════════════════════════════

export type FontSizeLevel = 'small' | 'normal' | 'large';

const FONT_SIZE_MAP: Record<FontSizeLevel, number> = {
  small: 14,
  normal: 16,
  large: 18,
};

const FONT_SIZE_CYCLE: Record<FontSizeLevel, FontSizeLevel> = {
  small: 'normal',
  normal: 'large',
  large: 'small',
};

// ══════════════════════════════════════════════════════════
// Store Interface
// ══════════════════════════════════════════════════════════

interface AppState {
  /** The currently selected calendar date (clamped to 1900-2200) */
  selectedDate: Date;
  /** Detailed astrological data for the selected date */
  dayData: DayDetailsData;
  /** Viewer location used by the Swiss calendar engine, if available */
  viewerLocation: SwissGeoLocation | null;
  /** Whether dark mode is active */
  isDark: boolean;
  /** Current font size level */
  fontSize: FontSizeLevel;
  /** Whether personalization is active (toggle by user) */
  isPersonalized: boolean;
  /** Whether the floating jump to top button is enabled */
  showScrollToTopButton: boolean;
}

interface AppActions {
  /** Update the selected date (with 1900-2200 clamping) */
  setSelectedDate: (date: Date) => void;
  /** Update the browser geolocation used by the live calendar surface */
  setViewerLocation: (location: SwissGeoLocation | null) => void;
  /** Toggle dark mode */
  toggleDarkMode: () => void;
  /** Cycle font size: small → normal → large → small */
  cycleFontSize: () => void;
  /** Set font size to a specific level */
  setFontSizeLevel: (level: FontSizeLevel) => void;
  /** Toggle personalization on/off */
  togglePersonalization: () => void;
  /** Set floating jump to top button visibility */
  setShowScrollToTopButton: (enabled: boolean) => void;
}

type AppStore = AppState & AppActions;

// ══════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════

/** Clamp year to safe range (1900-2199) to prevent engine errors */
function clampDate(date: Date): Date {
  const year = date.getFullYear();
  if (year < 1900 || year > 2199) {
    const clamped = new Date(date);
    clamped.setFullYear(Math.max(1900, Math.min(2199, year)));
    return clamped;
  }
  return date;
}

// ══════════════════════════════════════════════════════════
// Side Effects — kept outside Zustand for purity
// ══════════════════════════════════════════════════════════

export function executeThemeTransition(apply: () => void): void {
  if (typeof document === 'undefined') {
    apply();
    return;
  }

  // Use View Transitions API if supported for silky-smooth GPU crossfade
  const doc = document as unknown as {
    startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
  };
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(() => {
      apply();
    });
    return;
  }

  // Fallback for environments without View Transitions
  const root = document.documentElement;
  root.classList.add('theme-transitioning');
  apply();
  window.setTimeout(() => {
    root.classList.remove('theme-transitioning');
  }, 230);
}

function applyDarkMode(isDark: boolean): void {
  executeThemeTransition(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  });
}

function applyFontSize(fontSize: FontSizeLevel): void {
  document.documentElement.style.fontSize = `${FONT_SIZE_MAP[fontSize]}px`;
}

// ══════════════════════════════════════════════════════════
// Initialize from DOM/localStorage (runs once at import)
// ══════════════════════════════════════════════════════════

function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.theme === 'dark') {
    document.documentElement.classList.add('dark');
    return true;
  }
  document.documentElement.classList.remove('dark');
  return false;
}

function getInitialFontSize(): FontSizeLevel {
  if (typeof window === 'undefined') return 'normal';
  const saved = localStorage.getItem('fontSize');
  const level = saved === 'small' || saved === 'normal' || saved === 'large' ? saved : 'normal';
  applyFontSize(level);
  return level;
}

function getInitialScrollToTop(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('showScrollToTopButton');
  return saved === null ? true : saved === 'true';
}

// ══════════════════════════════════════════════════════════
// Zustand Store
// ══════════════════════════════════════════════════════════

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

  toggleDarkMode: () =>
    set((state) => {
      const newDark = !state.isDark;
      applyDarkMode(newDark);
      analytics.trackEvent({
        name: 'theme_toggle',
        properties: { is_dark: newDark },
      });
      return { isDark: newDark };
    }),

  cycleFontSize: () =>
    set((state) => {
      const next = FONT_SIZE_CYCLE[state.fontSize];
      applyFontSize(next);
      localStorage.setItem('fontSize', next);
      analytics.trackEvent({
        name: 'font_size_change',
        properties: { font_size: next },
      });
      return { fontSize: next };
    }),

  togglePersonalization: () =>
    set((state) => {
      analytics.trackEvent({
        name: 'personalization_toggle',
        properties: { is_personalized: !state.isPersonalized },
      });
      return { isPersonalized: !state.isPersonalized };
    }),

  setFontSizeLevel: (level: FontSizeLevel) => {
    applyFontSize(level);
    localStorage.setItem('fontSize', level);
    analytics.trackEvent({
      name: 'font_size_change',
      properties: { font_size: level },
    });
    set({ fontSize: level });
  },

  setShowScrollToTopButton: (enabled: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showScrollToTopButton', String(enabled));
    }
    set({ showScrollToTopButton: enabled });
  },
}));
