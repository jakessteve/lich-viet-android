import { createAsyncCalculationRequest } from '@lich-viet/contracts';
import { createChunkPlan, runElectionScan } from '@lich-viet/swisseph-wasm';

export interface ElectionOptionsInput {
  chunkHours?: number;
  controlZone?: string;
  strictMode?: boolean;
  overrides?: unknown[];
  guardrails?: Record<string, unknown>;
}

export interface TimelineTransferInput {
  timestamps: ArrayLike<number>;
  scores: ArrayLike<number>;
}

export interface ChunkSummaryItem {
  chunkIndex: number;
  totalChunks: number;
  [key: string]: unknown;
}

export interface ElectionResultPayload {
  generatedAt: string;
  status: string;
  timezone: string;
  coarseWindowCount: number;
  chunkCount: number;
  latitudeGuardTriggered: boolean;
  metrics: unknown;
  eventScore?: unknown;
  timeline: unknown[];
  chunkSummaries: ChunkSummaryItem[];
  timelineTransfer: TimelineTransferInput;
  astronomy: unknown;
  scanDiagnostics: unknown;
  overrideAuditLog: unknown;
  [key: string]: unknown;
}

export interface OmceBackendEnvelopeInput {
  request: unknown;
  options?: ElectionOptionsInput;
}

function normalizeOptions(options: ElectionOptionsInput = {}) {
  return {
    chunkHours: options.chunkHours,
    controlZone: options.controlZone,
    strictMode: options.strictMode,
    overrides: Array.isArray(options.overrides) ? options.overrides : [],
    guardrails: options.guardrails ?? {},
  };
}

function toJsonTimelineTransfer(timelineTransfer: TimelineTransferInput) {
  return {
    timestamps: Array.from(timelineTransfer.timestamps),
    scores: Array.from(timelineTransfer.scores),
  };
}

function createProgressEvent(
  taskId: string,
  phase: string,
  progress: number,
  completedChunks: number,
  totalChunks: number,
) {
  return {
    type: 'omce:progress',
    payload: {
      taskId,
      phase,
      progress,
      completedChunks,
      totalChunks,
    },
  };
}

function createChunkEvent(taskId: string, summary: unknown) {
  return {
    type: 'omce:chunk',
    payload: {
      taskId,
      summary,
    },
  };
}

function createResultEvent(result: ElectionResultPayload) {
  return {
    type: 'omce:result',
    payload: {
      ...result,
      timelineTransfer: toJsonTimelineTransfer(result.timelineTransfer),
    },
  };
}

export function createOmceBackendEnvelope(input: OmceBackendEnvelopeInput) {
  const request = createAsyncCalculationRequest(input.request);
  const options = normalizeOptions(input.options);
  const chunkPlan = createChunkPlan({
    request,
    chunkHours: options.chunkHours,
  });
  const result = runElectionScan({
    request,
    ...options,
  }) as unknown as ElectionResultPayload;
  const events = [
    createProgressEvent(request.taskId, 'validating', 0.12, 0, chunkPlan.length),
    createProgressEvent(request.taskId, 'timezone', 0.24, 0, chunkPlan.length),
  ];

  for (const chunk of chunkPlan) {
    const progress = 0.24 + ((chunk.chunkIndex + 1) / Math.max(chunk.totalChunks, 1)) * 0.56;
    events.push(createProgressEvent(request.taskId, 'scanning', progress, chunk.chunkIndex + 1, chunk.totalChunks));
    const chunkSummary =
      result.chunkSummaries.find((summary: ChunkSummaryItem) => summary.chunkIndex === chunk.chunkIndex) ?? chunk;
    events.push(createChunkEvent(request.taskId, chunkSummary));
  }

  events.push(createProgressEvent(request.taskId, 'scoring', 0.9, chunkPlan.length, chunkPlan.length));
  events.push(createProgressEvent(request.taskId, 'complete', 1, chunkPlan.length, chunkPlan.length));
  events.push(createResultEvent(result));

  return {
    request,
    options,
    chunkPlan,
    events,
    result,
    response: {
      request,
      generatedAt: result.generatedAt,
      status: result.status,
      timezone: result.timezone,
      coarseWindowCount: result.coarseWindowCount,
      chunkCount: result.chunkCount,
      latitudeGuardTriggered: result.latitudeGuardTriggered,
      metrics: result.metrics,
      ...(result.eventScore ? { eventScore: result.eventScore } : {}),
      timeline: result.timeline,
      chunkSummaries: result.chunkSummaries,
      timelineTransfer: toJsonTimelineTransfer(result.timelineTransfer),
      astronomy: result.astronomy,
      scanDiagnostics: result.scanDiagnostics,
      overrideAuditLog: result.overrideAuditLog,
    },
  };
}
