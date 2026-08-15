import { create } from 'zustand';
import {
  generateUnifiedBirthProfile,
  calculateSynastry as calculateSynastryCore,
  unixMsToJulianDay,
} from '@omce/core-logic';
import type { VedicChartInput, SynastryInput, WesternChartInput } from '../types/astrology';
import { calculateWesternChart, type WesternChartResult } from '../services/astrology/westernCalculator';
import {
  calculateSwissNatalChart,
  type SwissNatalChartResult,
} from '../services/astrology/swissNatalChart';
import {
  calculateSolarReturnChart,
  calculateLunarReturnDates,
  calculateLunarReturnChart,
  calculateTransitReport,
  calculateProgressedChart,
  calculateCompositeResult,
  calculateDavisonResult,
  type ReturnChartResult,
  type LunarReturnEntry,
  type TransitReport,
  type ProgressionResult,
  type DavisonResult,
} from '../services/astrology/predictiveCalculator';

export type AstrologyTab = 'tay-phuong' | 'vedic' | 'hop-la';

export interface SynastryEngineScores {
  tuVi: { score: number; insights: string[] };
  western: { score: number; insights: string[] };
  vedic: { score: number; insights: string[]; rawBreakdown: Record<string, number> };
}

export interface SynastryResult {
  combinedScore: number;
  engines: SynastryEngineScores;
}

export interface ForecastResult {
  year: number;
  solarReturn: ReturnChartResult | null;
  lunarReturns: LunarReturnEntry[];
  selectedLunarReturn: ReturnChartResult | null;
  transits: TransitReport;
  progressions: ProgressionResult;
}

interface AstrologyState {
  activeSubTab: AstrologyTab;

  westernInput: WesternChartInput;
  vedicInput: VedicChartInput;
  synastryInput: SynastryInput;

  westernResult: WesternChartResult | null;
  westernNatalResult: SwissNatalChartResult | null;
  vedicResult: WesternChartResult | null;
  synastryResult: SynastryResult | null;
  compositeResult: WesternChartResult | null;
  davisonResult: DavisonResult | null;

  forecastYear: number;
  forecastResult: ForecastResult | null;

  vedicChartStyle: 'south' | 'north';
  vedicChartType: 'D1' | 'D9';

  isCalculating: boolean;
  error: string | null;

  setSubTab: (tab: AstrologyTab) => void;
  
  setWesternInput: (partial: Partial<WesternChartInput>) => void;
  calculateWestern: () => Promise<void>;

  setVedicInput: (partial: Partial<VedicChartInput>) => void;
  calculateVedic: () => Promise<void>;
  setVedicChartStyle: (style: 'south' | 'north') => void;
  setVedicChartType: (type: 'D1' | 'D9') => void;

  setSynastryInput: (partial: Partial<SynastryInput>) => void;
  calculateSynastry: () => Promise<void>;

  setForecastYear: (year: number) => void;
  calculateForecast: () => Promise<void>;
  selectLunarReturn: (julianDay: number) => void;

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

const buildUnifiedProfile = (input: WesternChartInput, gender: string) => {
  const birthDate = input.birthDate instanceof Date ? new Date(input.birthDate.getTime()) : new Date(input.birthDate);
  birthDate.setHours(input.birthHour ?? 12, input.birthMinute ?? 0, 0, 0);
  return generateUnifiedBirthProfile({
    birthTimestamp: birthDate.getTime(),
    latitude: input.latitude,
    longitude: input.longitude,
    gender,
    timezone: input.timezone ?? 7,
  });
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
  westernNatalResult: null,
  vedicResult: null,
  synastryResult: null,
  compositeResult: null,
  davisonResult: null,

  forecastYear: new Date().getFullYear(),
  forecastResult: null,

  vedicChartStyle: 'south',
  vedicChartType: 'D1',

  isCalculating: false,
  error: null,

  setSubTab: (tab) => set({ activeSubTab: tab }),

  setVedicChartStyle: (style) => set({ vedicChartStyle: style }),
  setVedicChartType: (type) => set({ vedicChartType: type }),

  setWesternInput: (partial) =>
    set((state) => ({
      westernInput: { ...state.westernInput, ...partial },
      westernResult: null,
      westernNatalResult: null,
      error: null,
    })),
    
  calculateWestern: async () => {
    set({ isCalculating: true, error: null, westernResult: null, westernNatalResult: null });
    try {
      const { westernInput } = get();
      const result = await calculateSwissNatalChart(westernInput);
      set({ westernNatalResult: result, westernResult: result.legacyResult, isCalculating: false });
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
        ayanamsa: vedicInput.ayanamsa ?? 'lahiri',
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
      const { synastryInput } = get();
      const profileA = buildUnifiedProfile(synastryInput.profileA, 'male');
      const profileB = buildUnifiedProfile(synastryInput.profileB, 'female');
      const result = calculateSynastryCore(profileA, profileB);
      const compositeResult = calculateCompositeResult(synastryInput.profileA, synastryInput.profileB);
      const davisonResult = calculateDavisonResult(synastryInput.profileA, synastryInput.profileB);
      set({ synastryResult: result, compositeResult, davisonResult, isCalculating: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : String(e), isCalculating: false });
    }
  },

  setForecastYear: (year) => set({ forecastYear: year, error: null }),

  calculateForecast: async () => {
    set({ isCalculating: true, error: null });
    try {
      const { westernInput, forecastYear } = get();
      const now = new Date();
      const solarReturn = calculateSolarReturnChart(westernInput, forecastYear);
      const lunarReturns = calculateLunarReturnDates(westernInput, forecastYear);
      const upcoming =
        lunarReturns.find((entry) => entry.julianDay >= unixMsToJulianDay(now.getTime())) ??
        lunarReturns[0] ??
        null;
      const selectedLunarReturn = upcoming
        ? calculateLunarReturnChart(westernInput, upcoming.julianDay)
        : null;
      const transits = calculateTransitReport(westernInput, now);
      const progressions = calculateProgressedChart(westernInput, now);
      set({
        forecastResult: { year: forecastYear, solarReturn, lunarReturns, selectedLunarReturn, transits, progressions },
        isCalculating: false,
      });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : String(e), isCalculating: false });
    }
  },

  selectLunarReturn: (julianDay) => {
    const { westernInput, forecastResult } = get();
    if (!forecastResult) return;
    set({
      forecastResult: {
        ...forecastResult,
        selectedLunarReturn: calculateLunarReturnChart(westernInput, julianDay),
      },
    });
  },

  clearResults: () =>
    set({
      westernResult: null,
      westernNatalResult: null,
      vedicResult: null,
      synastryResult: null,
      compositeResult: null,
      davisonResult: null,
      forecastResult: null,
    }),
  clearError: () => set({ error: null }),
}));
