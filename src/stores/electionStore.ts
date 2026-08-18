import { create } from 'zustand';
import { type ElectionInput, type ElectionCandidate, type ElectionActivityType } from '../types/election';
import { executeElectionScan } from '@/services/election';

interface ElectionState {
  input: ElectionInput;
  results: ElectionCandidate[] | null;
  isScanning: boolean;
  scanProgress: number;
  error: string | null;

  setInput: (partial: Partial<ElectionInput>) => void;
  runScan: () => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const getNextWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const useElectionStore = create<ElectionState>((set, get) => ({
  input: {
    startDate: getToday(),
    endDate: getNextWeek(),
    activityType: 'cuoi-hoi' as ElectionActivityType,
  },
  results: null,
  isScanning: false,
  scanProgress: 0,
  error: null,

  setInput: (partial) =>
    set((state) => ({
      input: { ...state.input, ...partial },
      error: null,
    })),

  runScan: async () => {
    set({ isScanning: true, scanProgress: 0, error: null });
    try {
      const { input } = get();
      const candidates = await executeElectionScan(input, (percent) => {
        set({ scanProgress: percent });
      });

      set({ results: candidates, isScanning: false, scanProgress: 100, error: null });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : 'Có lỗi xảy ra trong quá trình quét ngày tốt.',
        isScanning: false,
        scanProgress: 0,
      });
    }
  },

  clearResults: () => set({ results: null, scanProgress: 0 }),
  clearError: () => set({ error: null }),
}));
