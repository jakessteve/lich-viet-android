export interface FrontendReadinessInput {
  timestamp?: number;
  isoDate?: string;
  latitude?: number;
  lat?: number;
  longitude?: number;
  lng?: number;
  altitudeMeters?: number;
  alt?: number;
  timezone?: number;
  controlZone?: 'occupied' | 'resistance';
  eventId?: string;
  dungSuEventId?: string;
  eventType?: string;
  chartType?: string;
  mode?: string;
  numberA?: number;
  numberB?: number;
  hourIndex?: number;
  birthProfile?: Record<string, unknown>;
  birthTimestamp?: number;
  birthIsoDate?: string;
  gender?: string | null;
  profileId?: string;
  personA?: Record<string, unknown>;
  personB?: Record<string, unknown>;
  viewYear?: number;
  school?: string;
  location?: { timezone?: number; lat?: number; lng?: number; [key: string]: unknown };
  date?: Date | string | number;
  number1?: number;
  number2?: number;
  number3?: number;
  query?: string;
  houseSystem?: string;
  ayanamsa?: string;
}

export type FrontendReadyPayload = Record<string, unknown> & {
  kind: string;
};

export declare function createCalendarDayDetail(input?: FrontendReadinessInput): FrontendReadyPayload;
export declare function createDungSuCatalog(): FrontendReadyPayload;
export declare function createDungSuScoreDetail(input?: FrontendReadinessInput): FrontendReadyPayload;
export declare function createFrontendErrorCatalog(): FrontendReadyPayload;
export declare function createFrontendReadinessBundle(input?: FrontendReadinessInput): FrontendReadyPayload;
export declare function createMaiHoaReading(input?: FrontendReadinessInput): FrontendReadyPayload;
export declare function createPanchangMuhurat(input?: FrontendReadinessInput): FrontendReadyPayload;
export declare function createPersonalizationOverlay(input?: FrontendReadinessInput): FrontendReadyPayload;
export declare function createSynastryReadiness(input?: FrontendReadinessInput): FrontendReadyPayload;
export declare function createTamThucReading(input?: FrontendReadinessInput): FrontendReadyPayload;
export declare function createTuViChartReadiness(input?: FrontendReadinessInput): FrontendReadyPayload;
export declare function createUserBirthProfileContract(input?: FrontendReadinessInput): FrontendReadyPayload;
export declare function createVedicKundli(input?: FrontendReadinessInput): FrontendReadyPayload;
export declare function createWesternChart(input?: FrontendReadinessInput): FrontendReadyPayload;
