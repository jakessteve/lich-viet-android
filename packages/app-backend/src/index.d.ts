import type {
  AsyncCalculationRequest,
  DungSuEventScore,
  HybridElectionTimeline,
  ScoringMetrics
} from "@omce/contracts";

export interface OmceBackendOptions {
  controlZone?: "occupied" | "resistance";
  chunkHours?: number;
  strictMode?: boolean;
  overrides?: Array<{
    school_id: string;
    entity_id: string;
    custom_element?: string;
    custom_weight?: number;
  }>;
  guardrails?: {
    coarseRankLimit?: number;
    fineWindowRadiusMinutes?: number;
    fineWindowStepMinutes?: number;
    maxTimelineEntries?: number;
    maxTransferBytes?: number;
  };
}

export interface OmceBackendEnvelope {
  request: AsyncCalculationRequest;
  options: OmceBackendOptions;
  chunkPlan: Array<{
    chunkIndex: number;
    totalChunks: number;
    timestampStart: number;
    timestampEnd: number;
  }>;
  events: Array<
    | {
        type: "omce:progress";
        payload: {
          taskId: string;
          phase: "validating" | "timezone" | "scanning" | "scoring" | "complete";
          progress: number;
          completedChunks: number;
          totalChunks: number;
        };
      }
    | {
        type: "omce:chunk";
        payload: {
          taskId: string;
          summary: {
            chunkIndex: number;
            totalChunks: number;
            timestampStart: number;
            timestampEnd: number;
            candidateCount: number;
          };
        };
      }
    | {
        type: "omce:result";
        payload: {
          request: AsyncCalculationRequest;
          generatedAt: number;
          status: "completed" | "short_circuited" | "cancelled";
          timezone:
            {
              ruleId: string;
              offsetHours: number;
              ambiguous: false;
            };
          coarseWindowCount: number;
          chunkCount: number;
          latitudeGuardTriggered: boolean;
          metrics: ScoringMetrics;
          eventScore?: DungSuEventScore;
          timeline: HybridElectionTimeline[];
          chunkSummaries: Array<{
            chunkIndex: number;
            totalChunks: number;
            timestampStart: number;
            timestampEnd: number;
            candidateCount: number;
          }>;
          timelineTransfer: {
            timestamps: number[];
            scores: number[];
          };
          astronomy: unknown;
          scanDiagnostics: Record<string, unknown>;
          overrideAuditLog: Array<Record<string, unknown>>;
        };
      }
  >;
  result: {
    request: AsyncCalculationRequest;
    generatedAt: number;
    status: "completed" | "short_circuited" | "cancelled";
    timezone:
      {
        ruleId: string;
        offsetHours: number;
        ambiguous: false;
      };
    coarseWindowCount: number;
    chunkCount: number;
    latitudeGuardTriggered: boolean;
    metrics: ScoringMetrics;
    eventScore?: DungSuEventScore;
    timeline: HybridElectionTimeline[];
    chunkSummaries: Array<{
      chunkIndex: number;
      totalChunks: number;
      timestampStart: number;
      timestampEnd: number;
      candidateCount: number;
    }>;
    timelineTransfer: {
      timestamps: Float64Array;
      scores: Float32Array;
    };
    astronomy: unknown;
    scanDiagnostics: Record<string, unknown>;
    overrideAuditLog: Array<Record<string, unknown>>;
  };
  response: {
    request: AsyncCalculationRequest;
    generatedAt: number;
    status: "completed" | "short_circuited" | "cancelled";
    timezone:
      {
        ruleId: string;
        offsetHours: number;
        ambiguous: false;
      };
    coarseWindowCount: number;
    chunkCount: number;
    latitudeGuardTriggered: boolean;
    metrics: ScoringMetrics;
    eventScore?: DungSuEventScore;
    timeline: HybridElectionTimeline[];
    chunkSummaries: Array<{
      chunkIndex: number;
      totalChunks: number;
      timestampStart: number;
      timestampEnd: number;
      candidateCount: number;
    }>;
    timelineTransfer: {
      timestamps: number[];
      scores: number[];
    };
    astronomy: unknown;
    scanDiagnostics: Record<string, unknown>;
    overrideAuditLog: Array<Record<string, unknown>>;
  };
}

export declare function createOmceBackendEnvelope(input: {
  request: AsyncCalculationRequest;
  options?: OmceBackendOptions;
}): OmceBackendEnvelope;

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
  controlZone?: "occupied" | "resistance";
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
