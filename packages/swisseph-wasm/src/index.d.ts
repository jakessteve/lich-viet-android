import type {
  AsyncCalculationRequest,
  DungSuEventScore,
  HybridElectionTimeline,
  ScoringMetrics,
} from '@omce/contracts';

export interface OmceWorkerOptions {
  controlZone?: 'occupied' | 'resistance';
  chunkHours?: number;
  strictMode?: boolean;
  guardrails?: {
    coarseRankLimit?: number;
    fineWindowRadiusMinutes?: number;
    fineWindowStepMinutes?: number;
    maxTimelineEntries?: number;
    maxTransferBytes?: number;
  };
  overrides?: Array<{
    school_id: string;
    entity_id: string;
    custom_element?: string;
    custom_weight?: number;
  }>;
}

export interface OmceAstronomyInput {
  julianDay: number;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  targetSolarLongitude?: number;
  civilTimestamp?: number;
  controlZone?: 'occupied' | 'resistance';
}

export interface OmceAstronomyOutput {
  observer: {
    julianDay: number;
    latitude: number;
    longitude: number;
    altitudeMeters: number;
  };
  timezone: {
    ruleId: string;
    offsetHours: number;
    ambiguous: false;
    shiftedTimestamp: number;
  };
  solarTerm: {
    targetLongitude: number;
    julianDay: number;
    longitude: number;
    iterations: number;
  };
  sunriseSunset: {
    sunriseUnixMs: number;
    sunsetUnixMs: number;
    refraction: {
      pressureMbar: number;
      temperatureC: number;
      correctionArcMinutes: number;
      correctionDegrees: number;
    };
  };
  ayanamsa: number;
  planetarySnapshot: Array<{
    body: string;
    tropicalLongitude: number;
    siderealLongitude: number;
  }>;
}

export declare function executeWasmAstronomyPipeline(input: OmceAstronomyInput): OmceAstronomyOutput;
export declare function deriveWasmTopocentricSnapshot(
  input: OmceAstronomyInput,
): OmceAstronomyOutput['planetarySnapshot'];

export interface OmceWorkerProgressMessage {
  type: 'omce:progress';
  payload: {
    phase: 'validating' | 'timezone' | 'scanning' | 'scoring' | 'complete';
    progress: number;
    taskId: string;
    completedChunks: number;
    totalChunks: number;
  };
}

export interface OmceWorkerChunkSummary {
  chunkIndex: number;
  totalChunks: number;
  timestampStart: number;
  timestampEnd: number;
  candidateCount: number;
}

export interface OmceWorkerChunkMessage {
  type: 'omce:chunk';
  payload: {
    taskId: string;
    summary: OmceWorkerChunkSummary;
  };
}

export interface OmceWorkerResultPayload {
  request: AsyncCalculationRequest;
  generatedAt: number;
  status: 'completed' | 'short_circuited' | 'cancelled';
  timezone: {
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
  chunkSummaries: OmceWorkerChunkSummary[];
  timelineTransfer: {
    timestamps: Float64Array;
    scores: Float32Array;
  };
  astronomy: OmceAstronomyOutput;
  scanDiagnostics: {
    strictMode: boolean;
    coarseCandidatesEvaluated: number;
    fineCandidatesEvaluated: number;
    blockedOverrideCount: number;
    appliedOverrideCount: number;
    coarseRankLimit: number;
    fineWindowRadiusMinutes: number;
    fineWindowStepMinutes: number;
    originalTimelineCount: number;
    finalTimelineCount: number;
    timelineDownsampled: boolean;
    memoryGuardTriggered: boolean;
    maxTimelineEntries: number;
    maxTransferBytes: number;
    estimatedTransferBytes: number;
    guardReason?: string;
  };
  overrideAuditLog: Array<{
    audit_id: string;
    school_id: string;
    entity_id: string;
    previous_element?: string;
    previous_weight?: number;
    next_element?: string;
    next_weight?: number;
    reason: string;
    created_at: string;
  }>;
}

export interface OmceWorkerResultMessage {
  type: 'omce:result';
  payload: OmceWorkerResultPayload;
}

export interface OmceWorkerErrorMessage {
  type: 'omce:error';
  payload: {
    taskId?: string;
    message: string;
  };
}

export interface OmceWorkerCancelledMessage {
  type: 'omce:cancelled';
  payload: {
    taskId: string;
  };
}

export interface OmceWorkerRequestMessage {
  type: 'omce:calculate';
  payload: {
    request: AsyncCalculationRequest;
    options?: OmceWorkerOptions;
  };
}

export interface OmceWorkerCancelRequestMessage {
  type: 'omce:cancel';
  payload: {
    taskId: string;
  };
}

export declare function createWorkerRequestMessage(
  request: AsyncCalculationRequest,
  options?: OmceWorkerOptions,
): OmceWorkerRequestMessage;
export declare function createWorkerCancelMessage(taskId: string): OmceWorkerCancelRequestMessage;
export declare function createChunkPlan(input: { request: AsyncCalculationRequest; chunkHours?: number }): Array<{
  chunkIndex: number;
  totalChunks: number;
  timestampStart: number;
  timestampEnd: number;
}>;
export declare function runElectionScan(input: {
  request: AsyncCalculationRequest;
  controlZone?: 'occupied' | 'resistance';
  chunkHours?: number;
  strictMode?: boolean;
  guardrails?: {
    coarseRankLimit?: number;
    fineWindowRadiusMinutes?: number;
    fineWindowStepMinutes?: number;
    maxTimelineEntries?: number;
    maxTransferBytes?: number;
  };
  overrides?: Array<{
    school_id: string;
    entity_id: string;
    custom_element?: string;
    custom_weight?: number;
  }>;
  now?: () => number;
}): OmceWorkerResultPayload;
export declare function registerOmceWorker(workerScope: {
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
  onmessage: ((event: MessageEvent<OmceWorkerRequestMessage | OmceWorkerCancelRequestMessage>) => void) | null;
}): void;
