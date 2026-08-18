import {
  applyUserOverrides,
  createOverrideAuditEntry,
  getDungSuScoringProfile,
  resolveVietnamHistoricalTimezone
} from "@lich-viet/canonical-db";
import {
  createAsyncCalculationRequest,
  createHybridElectionTimeline
} from "@lich-viet/contracts";
import {
  applyTimelineGuardrails,
  calculateDungSuEventScore,
  createCoarseWindows,
  evaluateElectionCandidate,
  expandFineWindow,
  isLatitudeGuardTriggered,
  julianDayToUnixMs,
  resolveStrictModeOverrides,
  summarizeChunkCandidates,
  unixMsToJulianDay
} from "@lich-viet/core-logic";
import { executeWasmAstronomyPipeline } from "./astronomy-api.js";

function createTimelineTransferPayload(timeline) {
  const timestamps = new Float64Array(timeline.length * 2);
  const scores = new Float32Array(timeline.length);

  for (const [index, item] of timeline.entries()) {
    timestamps[index * 2] = item.timestampStart;
    timestamps[index * 2 + 1] = item.timestampEnd;
    scores[index] = item.eventScore?.auspiciousnessPercent ?? item.metrics.totalScore;
  }

  return {
    timestamps,
    scores
  };
}

function createTimestampIso(now) {
  return new Date(now()).toISOString();
}

function buildAstronomyInput(request, timestamp, controlZone) {
  return {
    julianDay: unixMsToJulianDay(timestamp),
    latitude: request.userBirthData.lat,
    longitude: request.userBirthData.lng,
    altitudeMeters: request.userBirthData.alt,
    civilTimestamp: timestamp,
    controlZone
  };
}

function resolveDungSuProfile(request) {
  if (!request.dungSuEventId) {
    return null;
  }

  return getDungSuScoringProfile(request.dungSuEventId);
}

function buildDungSuEventScore({ profile, metrics, ruleSignals }) {
  if (!profile) {
    return undefined;
  }

  return calculateDungSuEventScore({
    eventProfile: profile,
    baseMetrics: metrics,
    ruleSignals
  });
}

function getCandidateRankScore(candidate) {
  return candidate.eventScore?.auspiciousnessPercent ?? candidate.metrics.totalScore;
}

function rankElectionCandidates(candidates, { limit = candidates.length } = {}) {
  return [...candidates]
    .sort((a, b) => {
      const scoreDelta = getCandidateRankScore(b) - getCandidateRankScore(a);

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return a.timestampStart - b.timestampStart;
    })
    .slice(0, limit);
}

function resolveGuardrails(guardrails = {}) {
  return {
    coarseRankLimit: Math.max(1, guardrails.coarseRankLimit ?? 3),
    fineWindowRadiusMinutes: Math.max(1, guardrails.fineWindowRadiusMinutes ?? 15),
    fineWindowStepMinutes: Math.max(1, guardrails.fineWindowStepMinutes ?? 1),
    maxTimelineEntries: Math.max(1, guardrails.maxTimelineEntries ?? 24),
    maxTransferBytes: Math.max(0, guardrails.maxTransferBytes ?? 65536)
  };
}

function evaluateWindowCandidate({
  request,
  timestamp,
  controlZone,
  latitudeGuardTriggered,
  strictMode,
  overrideMapping,
  dungSuProfile
}) {
  const astronomy = executeWasmAstronomyPipeline(
    buildAstronomyInput(request, timestamp, controlZone)
  );
  const evaluation = evaluateElectionCandidate({
    timestamp,
    astronomy,
    latitudeGuardTriggered,
    overrideMapping,
    strictMode
  });
  const eventScore = buildDungSuEventScore({
    profile: dungSuProfile,
    metrics: evaluation.metrics,
    ruleSignals: evaluation.ruleSignals
  });

  return {
    timestamp,
    astronomy,
    ...(eventScore ? { eventScore } : {}),
    ...evaluation
  };
}

function resolveOverrideApplication({
  overrides,
  strictMode,
  now
}) {
  const strictModeResolution = resolveStrictModeOverrides({
    overrides,
    strictMode
  });
  const isoTimestamp = createTimestampIso(now);
  const appliedOverrides =
    strictModeResolution.allowedOverrides.length > 0
      ? applyUserOverrides(
          strictModeResolution.allowedOverrides,
          () => isoTimestamp
        )
      : {
          records: [],
          auditLog: [],
          appliedMapping: []
        };
  const blockedAuditLog = strictModeResolution.blockedOverrides.map((override) =>
    createOverrideAuditEntry(
      {
        school_id: override.school_id,
        entity_id: override.entity_id,
        previous: undefined,
        next: undefined,
        reason: override.reason
      },
      () => isoTimestamp
    )
  );

  return {
    strictModeResolution,
    appliedOverrides,
    overrideAuditLog: [...appliedOverrides.auditLog, ...blockedAuditLog]
  };
}

export function createWorkerRequestMessage(request, options = {}) {
  return {
    type: "omce:calculate",
    payload: {
      request: createAsyncCalculationRequest(request),
      options
    }
  };
}

export function createWorkerCancelMessage(taskId) {
  return {
    type: "omce:cancel",
    payload: {
      taskId
    }
  };
}

export function createChunkPlan({ request, chunkHours = 24 }) {
  const normalizedRequest = createAsyncCalculationRequest(request);
  if (!Number.isFinite(chunkHours) || chunkHours <= 0) {
    throw new TypeError("chunkHours must be a positive finite number");
  }

  const startTimestamp = julianDayToUnixMs(normalizedRequest.searchWindow.startJd);
  const endTimestamp = julianDayToUnixMs(normalizedRequest.searchWindow.endJd);
  const chunkMs = chunkHours * 60 * 60 * 1000;
  const chunks = [];

  for (let cursor = startTimestamp, index = 0; cursor < endTimestamp; cursor += chunkMs, index += 1) {
    chunks.push({
      chunkIndex: index,
      totalChunks: 0,
      timestampStart: cursor,
      timestampEnd: Math.min(cursor + chunkMs, endTimestamp)
    });
  }

  if (chunks.length === 0) {
    chunks.push({
      chunkIndex: 0,
      totalChunks: 0,
      timestampStart: startTimestamp,
      timestampEnd: endTimestamp
    });
  }

  return chunks.map((chunk) => ({
    ...chunk,
    totalChunks: chunks.length
  }));
}

/**
 * @param {Object} input
 * @param {any} input.request
 * @param {string} [input.controlZone]
 * @param {number} [input.chunkHours]
 * @param {boolean} [input.strictMode]
 * @param {Array<any>} [input.overrides]
 * @param {Record<string, any>} [input.guardrails]
 * @param {() => number} [input.now]
 */
export function runElectionScan({
  request,
  controlZone,
  chunkHours = 24,
  strictMode = true,
  overrides = [],
  guardrails: guardrailOptions = {},
  now = () => Date.now()
}) {
  const normalizedRequest = createAsyncCalculationRequest(request);
  const startTimestamp = julianDayToUnixMs(normalizedRequest.searchWindow.startJd);
  const endTimestamp = julianDayToUnixMs(normalizedRequest.searchWindow.endJd);
  const timezone = resolveVietnamHistoricalTimezone({
    timestamp: startTimestamp,
    latitude: normalizedRequest.userBirthData.lat,
    controlZone
  });
  const latitudeGuardTriggered = isLatitudeGuardTriggered(normalizedRequest.userBirthData.lat);
  const coarseWindows = createCoarseWindows({
    startTimestamp,
    endTimestamp
  });
  const chunkPlan = createChunkPlan({
    request: normalizedRequest,
    chunkHours
  });
  const guardrails = resolveGuardrails(guardrailOptions);
  const dungSuProfile = resolveDungSuProfile(normalizedRequest);

  if (timezone.ambiguous) {
    return {
      request: normalizedRequest,
      generatedAt: now(),
      status: "short_circuited",
      timezone,
      coarseWindowCount: coarseWindows.length,
      chunkCount: chunkPlan.length,
      latitudeGuardTriggered,
      metrics: {
        totalScore: 0,
        easternScore: 0,
        westernScore: 0,
        vedicScore: 0,
        isShortCircuited: true,
        reason: "ambiguous_timezone"
      },
      ...(dungSuProfile
        ? {
            eventScore: buildDungSuEventScore({
              profile: dungSuProfile,
              metrics: {
                totalScore: 0,
                easternScore: 0,
                westernScore: 0,
                vedicScore: 0,
                isShortCircuited: true,
                reason: "ambiguous_timezone"
              },
              ruleSignals: {}
            })
          }
        : {}),
      timeline: [],
      chunkSummaries: chunkPlan.map((chunk) => ({ ...chunk, candidateCount: 0 })),
      timelineTransfer: { timestamps: new Float64Array(0), scores: new Float32Array(0) },
      astronomy: executeWasmAstronomyPipeline(
        buildAstronomyInput(normalizedRequest, startTimestamp, controlZone)
      ),
      scanDiagnostics: {
        strictMode,
        coarseCandidatesEvaluated: 0,
        fineCandidatesEvaluated: 0,
        blockedOverrideCount: 0,
        appliedOverrideCount: 0,
        coarseRankLimit: guardrails.coarseRankLimit,
        fineWindowRadiusMinutes: guardrails.fineWindowRadiusMinutes,
        fineWindowStepMinutes: guardrails.fineWindowStepMinutes,
        originalTimelineCount: 0,
        finalTimelineCount: 0,
        timelineDownsampled: false,
        memoryGuardTriggered: false,
        maxTimelineEntries: guardrails.maxTimelineEntries,
        maxTransferBytes: guardrails.maxTransferBytes,
        estimatedTransferBytes: 0,
        guardReason: "ambiguous_timezone"
      },
      overrideAuditLog: []
    };
  }
  const {
    strictModeResolution,
    appliedOverrides,
    overrideAuditLog
  } = resolveOverrideApplication({
    overrides,
    strictMode,
    now
  });

  const coarseCandidates = coarseWindows.map((window) => {
    const centerTimestamp =
      window.timestampStart + Math.floor((window.timestampEnd - window.timestampStart) / 2);
    const evaluation = evaluateWindowCandidate({
      request: normalizedRequest,
      timestamp: centerTimestamp,
      controlZone,
      latitudeGuardTriggered,
      strictMode,
      overrideMapping: appliedOverrides.appliedMapping,
      dungSuProfile
    });

    return {
      timestampStart: window.timestampStart,
      timestampEnd: window.timestampEnd,
      centerTimestamp,
      astronomy: evaluation.astronomy,
      metrics: evaluation.metrics,
      ...(evaluation.eventScore ? { eventScore: evaluation.eventScore } : {}),
      ruleSignals: evaluation.ruleSignals
    };
  });
  const chunkSummaries = summarizeChunkCandidates({
    chunkPlan,
    candidates: coarseCandidates,
    passingScore: 60
  });
  const rankedCoarseCandidates = rankElectionCandidates(coarseCandidates, {
    limit: guardrails.coarseRankLimit
  });
  const fineCandidates = rankedCoarseCandidates.flatMap((coarseCandidate) => {
    const fineTimestamps = expandFineWindow({
      centerTimestamp: coarseCandidate.centerTimestamp,
      radiusMinutes: guardrails.fineWindowRadiusMinutes,
      stepMinutes: guardrails.fineWindowStepMinutes
    });

    return fineTimestamps.map((timestamp) => ({
      ...evaluateWindowCandidate({
        request: normalizedRequest,
        timestamp,
        controlZone,
        latitudeGuardTriggered,
        strictMode,
        overrideMapping: appliedOverrides.appliedMapping,
        dungSuProfile
      }),
      coarseWindowStart: coarseCandidate.timestampStart,
      coarseWindowEnd: coarseCandidate.timestampEnd
    }));
  });
  const bestFineCandidatesByWindow = rankedCoarseCandidates
    .map((coarseCandidate) =>
      rankElectionCandidates(
        fineCandidates.filter(
          (candidate) =>
            candidate.coarseWindowStart === coarseCandidate.timestampStart &&
            candidate.coarseWindowEnd === coarseCandidate.timestampEnd
        ).map((candidate) => ({
          ...candidate,
          timestampStart: candidate.timestamp,
          timestampEnd: candidate.timestamp + 60 * 1000
        })),
        { limit: 1 }
      )[0]
    )
    .filter(Boolean);
  const timeline = bestFineCandidatesByWindow
    .filter((candidate) => !candidate.metrics.isShortCircuited)
    .map((candidate, index) =>
      createHybridElectionTimeline({
        timestampStart: candidate.timestampStart,
        timestampEnd: candidate.timestampEnd,
        metrics: candidate.metrics,
        ...(candidate.eventScore ? { eventScore: candidate.eventScore } : {}),
        termName: `Ky Mon ${candidate.ruleSignals.kyMonState.phase} ${index + 1}`,
        lunarDayStr: `HTZC ${timezone.ruleId} | DLN ${candidate.ruleSignals.monthlyGeneral.branch}`
      })
    );
  const guardedTimeline = applyTimelineGuardrails(timeline, {
    maxEntries: guardrails.maxTimelineEntries,
    maxTransferBytes: guardrails.maxTransferBytes
  });
  const bestCandidate = rankElectionCandidates(
    bestFineCandidatesByWindow.map((candidate) => ({
      ...candidate,
      timestampStart: candidate.timestampStart
    })),
    { limit: 1 }
  )[0];
  const astronomy =
    bestCandidate?.astronomy ??
    executeWasmAstronomyPipeline(
      buildAstronomyInput(normalizedRequest, startTimestamp, controlZone)
    );
  const metrics = bestCandidate?.metrics ?? {
    totalScore: 0,
    easternScore: 0,
    westernScore: 0,
    vedicScore: 0,
    isShortCircuited: true,
    reason: "no_viable_candidates"
  };
  const finalMetrics = guardedTimeline.diagnostics.shortCircuited
    ? {
        totalScore: 0,
        easternScore: 0,
        westernScore: 0,
        vedicScore: 0,
        isShortCircuited: true,
        reason: guardedTimeline.diagnostics.reason
      }
    : metrics;
  const finalTimeline = guardedTimeline.entries;
  const eventScore = buildDungSuEventScore({
    profile: dungSuProfile,
    metrics: finalMetrics,
    ruleSignals: bestCandidate?.ruleSignals
  }) ?? bestCandidate?.eventScore;

  return {
    request: normalizedRequest,
    generatedAt: now(),
    status:
      finalTimeline.length === 0 || finalMetrics.isShortCircuited
        ? "short_circuited"
        : "completed",
    timezone,
    coarseWindowCount: coarseWindows.length,
    chunkCount: chunkPlan.length,
    latitudeGuardTriggered,
    metrics: finalMetrics,
    ...(eventScore ? { eventScore } : {}),
    timeline: finalTimeline,
    chunkSummaries,
    timelineTransfer: createTimelineTransferPayload(finalTimeline),
    astronomy,
    scanDiagnostics: {
      strictMode,
      coarseCandidatesEvaluated: coarseCandidates.length,
      fineCandidatesEvaluated: fineCandidates.length,
      blockedOverrideCount: strictModeResolution.blockedOverrides.length,
      appliedOverrideCount: appliedOverrides.records.length,
      coarseRankLimit: guardrails.coarseRankLimit,
      fineWindowRadiusMinutes: guardrails.fineWindowRadiusMinutes,
      fineWindowStepMinutes: guardrails.fineWindowStepMinutes,
      originalTimelineCount: guardedTimeline.diagnostics.originalTimelineCount,
      finalTimelineCount: guardedTimeline.diagnostics.finalTimelineCount,
      timelineDownsampled: guardedTimeline.diagnostics.timelineDownsampled,
      memoryGuardTriggered: guardedTimeline.diagnostics.memoryGuardTriggered,
      maxTimelineEntries: guardrails.maxTimelineEntries,
      maxTransferBytes: guardrails.maxTransferBytes,
      estimatedTransferBytes: guardedTimeline.diagnostics.estimatedTransferBytes,
      guardReason: guardedTimeline.diagnostics.reason
    },
    overrideAuditLog
  };
}
