import { create } from 'zustand';
import { type WesternChartInput, type VedicChartInput, type SynastryInput } from '../types/astrology';

export type AstrologyTab = 'tay-phuong' | 'vedic' | 'hop-la';

interface AstrologyState {
  activeSubTab: AstrologyTab;

  westernInput: WesternChartInput;
  vedicInput: VedicChartInput;
  synastryInput: SynastryInput;

  westernResult: Record<string, unknown> | null;
  vedicResult: Record<string, unknown> | null;
  synastryResult: Record<string, unknown> | null;

  isCalculating: boolean;
  error: string | null;

  setSubTab: (tab: AstrologyTab) => void;
  
  setWesternInput: (partial: Partial<WesternChartInput>) => void;
  calculateWestern: () => Promise<void>;

  setVedicInput: (partial: Partial<VedicChartInput>) => void;
  calculateVedic: () => Promise<void>;

  setSynastryInput: (partial: Partial<SynastryInput>) => void;
  calculateSynastry: () => Promise<void>;

  clearResults: () => void;
  clearError: () => void;
}

const getDefaultWesternInput = (): WesternChartInput => {
  const d = new Date();
  return {
    birthDate: d,
    birthHour: 12,
    birthMinute: 0,
    latitude: 21.0285, // Hanoi
    longitude: 105.8542,
    timezone: 7,
  };
};

export const useAstrologyStore = create<AstrologyState>((set, get) => ({
  activeSubTab: 'tay-phuong',

  westernInput: getDefaultWesternInput(),
  vedicInput: { ...getDefaultWesternInput(), ayanamsa: 'lahiri' },
  synastryInput: {
    profileA: { ...getDefaultWesternInput(), name: 'Người A' },
    profileB: { ...getDefaultWesternInput(), name: 'Người B' },
  },

  westernResult: null,
  vedicResult: null,
  synastryResult: null,

  isCalculating: false,
  error: null,

  setSubTab: (tab) => set({ activeSubTab: tab }),

  setWesternInput: (partial) =>
    set((state) => ({ westernInput: { ...state.westernInput, ...partial }, error: null })),
    
  calculateWestern: async () => {
    set({ isCalculating: true, error: null });
    try {
      set({ westernResult: {}, isCalculating: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : String(e), isCalculating: false });
    }
  },

  setVedicInput: (partial) =>
    set((state) => ({ vedicInput: { ...state.vedicInput, ...partial }, error: null })),
    
  calculateVedic: async () => {
    set({ isCalculating: true, error: null });
    try {
      set({ vedicResult: {}, isCalculating: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : String(e), isCalculating: false });
    }
  },

  setSynastryInput: (partial) =>
    set((state) => ({ synastryInput: { ...state.synastryInput, ...partial }, error: null })),

  calculateSynastry: async () => {
    set({ isCalculating: true, error: null });
    try {
      set({ synastryResult: {}, isCalculating: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : String(e), isCalculating: false });
    }
  },

  clearResults: () => set({ westernResult: null, vedicResult: null, synastryResult: null }),
  clearError: () => set({ error: null }),
}));
