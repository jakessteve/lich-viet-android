import { createAsyncCalculationRequest } from "@omce/contracts";
import {
  createChunkPlan,
  runElectionScan
} from "@omce/swisseph-wasm";

export {
  createCalendarDayDetail,
  createDungSuCatalog,
  createDungSuScoreDetail,
  createFrontendErrorCatalog,
  createFrontendReadinessBundle,
  createMaiHoaReading,
  createPanchangMuhurat,
  createPersonalizationOverlay,
  createSynastryReadiness,
  createTamThucReading,
  createTuViChartReadiness,
  createUserBirthProfileContract,
  createVedicKundli,
  createWesternChart
} from "./frontend-readiness.js";

function normalizeOptions(options = {}) {
  return {
    chunkHours: options.chunkHours,
    controlZone: options.controlZone,
    strictMode: options.strictMode,
    overrides: Array.isArray(options.overrides) ? options.overrides : [],
    guardrails: options.guardrails ?? {}
  };
}

function toJsonTimelineTransfer(timelineTransfer) {
  return {
    timestamps: Array.from(timelineTransfer.timestamps),
    scores: Array.from(timelineTransfer.scores)
  };
}

function createProgressEvent(taskId, phase, progress, completedChunks, totalChunks) {
  return {
    type: "omce:progress",
    payload: {
      taskId,
      phase,
      progress,
      completedChunks,
      totalChunks
    }
  };
}

function createChunkEvent(taskId, summary) {
  return {
    type: "omce:chunk",
    payload: {
      taskId,
      summary
    }
  };
}

function createResultEvent(result) {
  return {
    type: "omce:result",
    payload: {
      ...result,
      timelineTransfer: toJsonTimelineTransfer(result.timelineTransfer)
    }
  };
}

export function createOmceBackendEnvelope(input) {
  const request = createAsyncCalculationRequest(input.request);
  const options = normalizeOptions(input.options);
  const chunkPlan = createChunkPlan({
    request,
    chunkHours: options.chunkHours
  });
  const result = runElectionScan({
    request,
    ...options
  });
  const events = [
    createProgressEvent(request.taskId, "validating", 0.12, 0, chunkPlan.length),
    createProgressEvent(request.taskId, "timezone", 0.24, 0, chunkPlan.length)
  ];

  for (const chunk of chunkPlan) {
    const progress = 0.24 + ((chunk.chunkIndex + 1) / Math.max(chunk.totalChunks, 1)) * 0.56;
    events.push(
      createProgressEvent(
        request.taskId,
        "scanning",
        progress,
        chunk.chunkIndex + 1,
        chunk.totalChunks
      )
    );
    const chunkSummary = result.chunkSummaries.find(
      (summary) => summary.chunkIndex === chunk.chunkIndex
    ) ?? chunk;
    events.push(createChunkEvent(request.taskId, chunkSummary));
  }

  events.push(createProgressEvent(request.taskId, "scoring", 0.9, chunkPlan.length, chunkPlan.length));
  events.push(createProgressEvent(request.taskId, "complete", 1, chunkPlan.length, chunkPlan.length));
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
      overrideAuditLog: result.overrideAuditLog
    }
  };
}
