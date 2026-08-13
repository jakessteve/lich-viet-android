import { create } from 'zustand';
import { type ElectionInput, type ElectionCandidate, type ElectionActivityType } from '../types/election';

interface ElectionState {
  input: ElectionInput;
  results: ElectionCandidate[] | null;
  isScanning: boolean;
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
  error: null,

  setInput: (partial) =>
    set((state) => ({
      input: { ...state.input, ...partial },
      error: null,
    })),

  runScan: async () => {
    set({ isScanning: true, error: null });
    try {
      // Run actual OMCE service call here when wired in components/ElectionPage
      // Placeholder for actual OMCE service call which will be wired later in components/ElectionPage
      // For now, this is just scaffolding the store.
      set({ results: [], isScanning: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : String(e) || 'Lỗi khi tìm ngày tốt', isScanning: false });
    }
  },

  clearResults: () => set({ results: null }),
  clearError: () => set({ error: null }),
}));
