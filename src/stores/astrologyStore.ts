import { create } from 'zustand';
import type { VedicChartInput, SynastryInput, WesternChartInput } from '../types/astrology';
import { calculateWesternChart, type WesternChartResult } from '../services/astrology/westernCalculator';

export type AstrologyTab = 'tay-phuong' | 'vedic' | 'hop-la';

interface AstrologyState {
  activeSubTab: AstrologyTab;

  westernInput: WesternChartInput;
  vedicInput: VedicChartInput;
  synastryInput: SynastryInput;

  westernResult: WesternChartResult | null;
  vedicResult: WesternChartResult | null;
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
      const { westernInput } = get();
      const result = calculateWesternChart(westernInput);
      set({ westernResult: result, isCalculating: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : String(e), isCalculating: false });
    }
  },

  setVedicInput: (partial) =>
    set((state) => ({ vedicInput: { ...state.vedicInput, ...partial }, error: null })),
    
  calculateVedic: async () => {
    set({ isCalculating: true, error: null });
    try {
      const { vedicInput } = get();
      const westernInput = {
        birthDate: vedicInput.birthDate,
        birthHour: vedicInput.birthHour,
        birthMinute: vedicInput.birthMinute,
        latitude: vedicInput.latitude,
        longitude: vedicInput.longitude,
        timezone: vedicInput.timezone,
      };
      const result = calculateWesternChart(westernInput);
      set({ vedicResult: result, isCalculating: false });
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
