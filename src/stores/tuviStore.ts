import { create } from 'zustand';
import type { TuViChart, TuViInput, TuViPalace, TuViMarkdownOptions, TuViSchool } from '@/types/tuvi';
import { calculateHanContext, generateChart } from '@/services/tuvi';
import { formatTuViChartAsMarkdown } from '@/services/tuvi/markdownFormatter';
import { getDatePartsInTimeZone, VIETNAM_TIME_ZONE } from '@/services/tuvi/timeNormalization';

const MARKDOWN_PREVIEW_STORAGE_KEY = 'tuvi_markdown_preview';

// ══════════════════════════════════════════════════════════
// Type Definitions
// ══════════════════════════════════════════════════════════

interface TuViState {
  /** Current input form data */
  input: TuViInput;
  /** Generated chart (null until calculated) */
  chart: TuViChart | null;
  /** Currently selected palace index (null = none selected) */
  selectedPalaceIndex: number | null;
  /** Currently viewed hạn year */
  viewYear: number;
  /** Currently viewed hạn month */
  viewMonth: number;
  /** Whether chart generation is in progress */
  isCalculating: boolean;
  /** Error message if chart generation failed */
  error: string | null;
  /** Markdown export preview (null = not previewing) */
  markdownPreview: string | null;
}

interface TuViActions {
  /** Update input form data */
  setInput: (input: Partial<TuViInput>) => void;
  /** Reset input to defaults */
  resetInput: () => void;
  /** Generate chart from current input */
  calculateChart: (inputOverride?: Partial<TuViInput>) => void;
  /** Change calculation school and refresh the chart when present */
  setSchool: (school: TuViSchool) => void;
  /** Select a palace for detail view */
  selectPalace: (index: number | null) => void;
  /** Update the active year/month hạn view */
  setHanView: (year: number, month: number) => void;
  /** Get the currently selected palace */
  getSelectedPalace: () => TuViPalace | null;
  /** Generate Markdown preview */
  previewMarkdown: (options?: Partial<TuViMarkdownOptions>) => void;
  /** Clear Markdown preview */
  clearMarkdownPreview: () => void;
  /** Clear error */
  clearError: () => void;
}

type TuViStore = TuViState & TuViActions;

// ══════════════════════════════════════════════════════════
// Constants
// ══════════════════════════════════════════════════════════

const defaultInput: TuViInput = {
  name: '',
  solarDate: new Date(1990, 0, 1), // Jan 1, 1990
  birthHour: 0, // Tý
  birthClockHour: 0,
  birthMinute: 0,
  gender: 'nam',
  timezone: 'Asia/Ho_Chi_Minh',
  timePolicy: 'historical-vietnam',
  school: 'thien-luong',
  birthLocation: {
    locationName: 'Hà Nội, Việt Nam',
    lat: 21.028511,
    lng: 105.804817,
    timezone: 7,
  },
};

function getCurrentHanView(): { viewYear: number; viewMonth: number } {
  const now = getDatePartsInTimeZone(new Date(), VIETNAM_TIME_ZONE);
  return {
    viewYear: now.year,
    viewMonth: now.month,
  };
}

function getInitialMarkdownPreview(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(MARKDOWN_PREVIEW_STORAGE_KEY);
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════════
// Zustand Store
// ══════════════════════════════════════════════════════════

export const useTuViStore = create<TuViStore>()((set, get) => ({
  // State
  input: { ...defaultInput },
  chart: null,
  selectedPalaceIndex: null,
  ...getCurrentHanView(),
  isCalculating: false,
  error: null,
  markdownPreview: getInitialMarkdownPreview(),

  // ── Actions ───────────────────────────────────────────────

  setInput: (partial) =>
    set((state) => ({
      input: { ...state.input, ...partial },
    })),

  resetInput: () =>
    set({
      input: { ...defaultInput },
      chart: null,
      selectedPalaceIndex: null,
      ...getCurrentHanView(),
      error: null,
      markdownPreview: null,
    }),

  calculateChart: (inputOverride) => {
    set({ isCalculating: true, error: null });
    try {
      const { input, viewYear, viewMonth } = get();
      const nextInput = inputOverride ? { ...input, ...inputOverride } : input;
      const chart = generateChart(nextInput);
      set({
        input: nextInput,
        chart: {
          ...chart,
          hanContext: calculateHanContext(chart, viewYear, viewMonth),
        },
        isCalculating: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi tính lá số';
      set({ error: message, isCalculating: false });
    }
  },

  setSchool: (school) => {
    const state = get();
    const input = { ...state.input, school };
    if (!state.chart) {
      set({ input });
      return;
    }

    try {
      const chart = generateChart(input);
      set({
        input,
        chart: {
          ...chart,
          hanContext: calculateHanContext(chart, state.viewYear, state.viewMonth),
        },
        selectedPalaceIndex: null,
        error: null,
        markdownPreview: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi đổi trường phái';
      set({ input, error: message });
    }
  },

  selectPalace: (index) => set({ selectedPalaceIndex: index }),

  setHanView: (year, month) => {
    const normalizedYear = Number.isFinite(year) ? Math.max(1, Math.trunc(year)) : get().viewYear;
    const normalizedMonth = Math.min(12, Math.max(1, Number.isFinite(month) ? Math.trunc(month) : get().viewMonth));
    set((state) => {
      const nextChart = state.chart
        ? {
            ...state.chart,
            hanContext: calculateHanContext(state.chart, normalizedYear, normalizedMonth),
          }
        : state.chart;

      return {
        viewYear: normalizedYear,
        viewMonth: normalizedMonth,
        chart: nextChart,
      };
    });
  },

  getSelectedPalace: () => {
    const { chart, selectedPalaceIndex } = get();
    if (!chart || selectedPalaceIndex === null) return null;
    return chart.palaces[selectedPalaceIndex] ?? null;
  },

  previewMarkdown: (options) => {
    const { chart } = get();
    if (!chart) return;
    const markdown = formatTuViChartAsMarkdown(chart, options);
    try {
      localStorage.setItem(MARKDOWN_PREVIEW_STORAGE_KEY, markdown);
    } catch {
      // Silently ignore storage quota / private mode failures.
    }
    set({ markdownPreview: markdown });
  },

  clearMarkdownPreview: () => {
    try {
      localStorage.removeItem(MARKDOWN_PREVIEW_STORAGE_KEY);
    } catch {
      // Silently ignore storage failures.
    }
    set({ markdownPreview: null });
  },

  clearError: () => set({ error: null }),
}));
