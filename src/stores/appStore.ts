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

function applyDarkMode(isDark: boolean): void {
  if (isDark) {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  }
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
  fontSize: getInitialFontSize(),

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

  setFontSizeLevel: (level: FontSizeLevel) => {
    applyFontSize(level);
    localStorage.setItem('fontSize', level);
    analytics.trackEvent({
      name: 'font_size_change',
      properties: { font_size: level },
    });
    set({ fontSize: level });
  },
}));
