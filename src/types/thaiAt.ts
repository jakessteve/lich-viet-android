/**
 * Thái Ất Types — Thái Ất Thần Số Type Definitions
 */

// ── Palace ──────────────────────────────────────────────────

export interface ThaiAtPalace {
  number: number;
  nameVi: string;
  trigram: string | null;
  direction: string;
  element: string;
  cosmicRole: string;
}

// ── Deity Position ──────────────────────────────────────────

export interface ThaiAtDeityPosition {
  id: string;
  nameVi: string;
  palace: number;
  nature: 'cat' | 'hung' | 'trung_binh' | 'neutral';
  role: string;
  /** Detailed personality description of the deity */
  personality?: string;
  /** Impact when in a favorable palace */
  influenceWhenStrong?: string;
  /** Impact when in an unfavorable palace */
  influenceWhenWeak?: string;
}

// ── Host/Guest Counts ───────────────────────────────────────

export interface HostGuestResult {
  hostCount: number;
  guestCount: number;
  /** T3: Fixed Count (Định Toán) — cosmic constant derived from sexagenary cycle */
  fixedCount?: number;
  dominance: 'hostDominant' | 'guestDominant' | 'balanced';
  dominanceLabel: string;
  dominanceSummary: string;
  dominanceAdvice: string;
  /** Optional disclaimer when the algorithm uses simplified approximation */
  disclaimer?: string;
  /** Extended analysis of the Host/Guest dynamic */
  detailedAnalysis?: string;
  /** Career-specific advice based on dominance */
  careerAdvice?: string;
  /** Personal life advice based on dominance */
  personalAdvice?: string;
}

// ── Chart ───────────────────────────────────────────────────

export interface ThaiAtChart {
  lunarYear: number;
  canChiYear: string;
  thaiAtPalace: number;
  thaiAtPalaceInfo: ThaiAtPalace;
  deityPositions: ThaiAtDeityPosition[];
  hostGuest: HostGuestResult;
  epochPosition: {
    superiorEpochYear: number; // 1-360
    cycleNumber: number; // 1-5
    cycleYear: number; // 1-72
    subCycleYear: number; // 1-12
  };
  forecast: string;
  forecastTone: 'optimistic' | 'neutral' | 'cautious';
  element: string;
  /** Extended multi-paragraph palace forecast */
  detailedForecast?: string;
  /** Quarterly highlights for the year */
  monthlyHighlights?: string;
  /** T2: Ngũ Hành interaction between palace element and year’s Nạp Âm */
  palaceElementAnalysis?: {
    palaceElement: string;
    yearElement: string;
    relation: string;
    relationLabel: string;
    score: number;
    interpretation: string;
  };
}

// ── Monthly Overlay ─────────────────────────────────────────

export interface ThaiAtMonthOverlay {
  lunarMonth: number;
  adjustedPalace: number;
  shiftNote: string;
  monthlyForecast: string;
  /** Detailed month-specific cultural and energetic note */
  monthNote?: string;
}

// ── Cosmic Forecast (for Landing Page) ──────────────────────

export interface CosmicForecast {
  year: number;
  canChiYear: string;
  oneLiner: string;
  tone: 'optimistic' | 'neutral' | 'cautious';
  element: string;
  palaceName: string;
  hostGuestLabel: string;
}
