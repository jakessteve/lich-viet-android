import test from "node:test";
import assert from "node:assert/strict";

import {
  createChunkPlan,
  runElectionScan
} from "../src/index.js";

test("createChunkPlan splits the request into 24-hour chunks by default", () => {
  const chunks = createChunkPlan({
    request: {
      taskId: "scan-plan",
      userBirthData: {
        jd: 2460826.5,
        lat: 10.8231,
        lng: 106.6297,
        alt: 19
      },
      searchWindow: {
        startJd: 2460826.5,
        endJd: 2460828.5
      }
    }
  });

  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].chunkIndex, 0);
  assert.equal(chunks[0].totalChunks, 2);
  assert.equal(chunks[1].timestampEnd, chunks[1].timestampStart + 24 * 60 * 60 * 1000);
  assert.equal(chunks.some((chunk) => chunk.timestampStart === chunk.timestampEnd), false);
});

test("createChunkPlan rejects non-positive chunk sizes", () => {
  assert.throws(
    () =>
      createChunkPlan({
        request: {
          taskId: "scan-plan-invalid",
          userBirthData: {
            jd: 2460826.5,
            lat: 10.8231,
            lng: 106.6297,
            alt: 19
          },
          searchWindow: {
            startJd: 2460826.5,
            endJd: 2460828.5
          }
        },
        chunkHours: 0
      }),
    /chunkHours must be a positive finite number/
  );
});

test("runElectionScan returns deterministic completed output for a normal range", () => {
  const result = runElectionScan({
    request: {
      taskId: "scan-normal",
      userBirthData: {
        jd: 2460824.5,
        lat: 10.8231,
        lng: 106.6297,
        alt: 19
      },
      searchWindow: {
        startJd: 2460824.5,
        endJd: 2460825.5
      }
    },
    now: () => 123456
  });

  assert.equal(result.status, "completed");
  assert.equal(result.generatedAt, 123456);
  assert.equal(result.timeline.length, 3);
  assert.equal(result.timezone.ambiguous, false);
  assert.equal(result.chunkCount >= 1, true);
  assert.equal(result.scanDiagnostics.strictMode, true);
  assert.equal(result.scanDiagnostics.coarseCandidatesEvaluated > 0, true);
  assert.equal(result.scanDiagnostics.fineCandidatesEvaluated > 0, true);
  assert.equal(result.timelineTransfer.timestamps.length, result.timeline.length * 2);
  assert.equal(result.timelineTransfer.scores.length, result.timeline.length);
});

test("runElectionScan ranks and returns event-specific Dụng Sự percentages", () => {
  const result = runElectionScan({
    request: {
      taskId: "scan-dung-su-market",
      dungSuEventId: "ds_kai_shi",
      userBirthData: {
        jd: 2460824.5,
        lat: 10.8231,
        lng: 106.6297,
        alt: 19
      },
      searchWindow: {
        startJd: 2460824.5,
        endJd: 2460825.5
      }
    },
    now: () => 123456
  });

  assert.equal(result.status, "completed");
  assert.equal(result.request.dungSuEventId, "ds_kai_shi");
  assert.equal(result.eventScore.eventId, "ds_kai_shi");
  assert.equal(result.eventScore.accuracyTier, "complete");
  assert.equal(result.eventScore.auspiciousnessPercent > 0, true);
  assert.equal(result.eventScore.auspiciousnessPercent <= 100, true);
  assert.equal(result.timeline.every((entry) => entry.eventScore?.eventId === "ds_kai_shi"), true);
  assert.equal(
    Math.abs(result.timelineTransfer.scores[0] - result.timeline[0].eventScore.auspiciousnessPercent) < 0.001,
    true
  );
});

test("runElectionScan labels specialist-gated Dụng Sự scores without overclaiming accuracy", () => {
  const result = runElectionScan({
    request: {
      taskId: "scan-dung-su-marriage",
      dungSuEventId: "ds_jia_qu",
      userBirthData: {
        jd: 2460824.5,
        lat: 10.8231,
        lng: 106.6297,
        alt: 19
      },
      searchWindow: {
        startJd: 2460824.5,
        endJd: 2460825.5
      }
    },
    now: () => 123456
  });

  assert.equal(result.status, "completed");
  assert.equal(result.eventScore.eventId, "ds_jia_qu");
  assert.equal(result.eventScore.accuracyTier, "bounded_specialist_ready");
  assert.equal(result.eventScore.sourceCoveragePercent, 60);
  assert.equal(result.eventScore.auspiciousnessPercent <= 100, true);
  assert.deepEqual(result.eventScore.blockingReasons, []);
});

test("runElectionScan blocks strict-mode overrides but still applies allowed overrides with audit entries", () => {
  const result = runElectionScan({
    request: {
      taskId: "scan-overrides",
      userBirthData: {
        jd: 2460826.5,
        lat: 10.8231,
        lng: 106.6297,
        alt: 19
      },
      searchWindow: {
        startJd: 2460826.5,
        endJd: 2460827.5
      }
    },
    overrides: [
      {
        school_id: "tu_vi_bac_phai",
        entity_id: "tu_hoa_canh",
        custom_weight: 1.3
      },
      {
        school_id: "western_electional",
        entity_id: "void_of_course_guard",
        custom_weight: 0.95
      }
    ],
    now: () => 123456
  });

  assert.equal(result.scanDiagnostics.blockedOverrideCount, 1);
  assert.equal(result.scanDiagnostics.appliedOverrideCount, 1);
  assert.equal(result.overrideAuditLog.length, 2);
  assert.equal(
    result.overrideAuditLog.some((entry) => entry.reason === "strict_mode_locked_entity"),
    true
  );
  assert.equal(
    result.overrideAuditLog.some((entry) => entry.reason === "user_override_applied"),
    true
  );
});

test("runElectionScan resolves the former control-zone period as canonical civil time", () => {
  const result = runElectionScan({
    request: {
      taskId: "scan-ambiguous",
      userBirthData: {
        jd: 2433282.5,
        lat: 16,
        lng: 108,
        alt: 10
      },
      searchWindow: {
        startJd: 2433282.5,
        endJd: 2433283.5
      }
    },
    controlZone: "occupied"
  });

  assert.equal(result.status, "completed");
  assert.equal(result.metrics.isShortCircuited, false);
  assert.equal(result.timeline.length > 0, true);
  assert.equal(result.timezone.ambiguous, false);
  assert.equal(result.timezone.offsetHours, 8);
  assert.equal(result.scanDiagnostics.coarseCandidatesEvaluated > 0, true);
  assert.equal(result.timelineTransfer.timestamps.length, result.timeline.length * 2);
});

test("runElectionScan downsamples the timeline when Phase 4 guardrails require it", () => {
  const result = runElectionScan({
    request: {
      taskId: "scan-downsample",
      userBirthData: {
        jd: 2460826.5,
        lat: 10.8231,
        lng: 106.6297,
        alt: 19
      },
      searchWindow: {
        startJd: 2460826.5,
        endJd: 2460828.5
      }
    },
    guardrails: {
      coarseRankLimit: 8,
      maxTimelineEntries: 4,
      maxTransferBytes: 4096
    }
  });

  assert.equal(result.status, "completed");
  assert.equal(result.timeline.length, 4);
  assert.equal(result.scanDiagnostics.originalTimelineCount, 8);
  assert.equal(result.scanDiagnostics.finalTimelineCount, 4);
  assert.equal(result.scanDiagnostics.timelineDownsampled, true);
  assert.equal(result.scanDiagnostics.memoryGuardTriggered, true);
});

test("runElectionScan short-circuits when the memory guard budget cannot fit one timeline point", () => {
  const result = runElectionScan({
    request: {
      taskId: "scan-memory-guard",
      userBirthData: {
        jd: 2460826.5,
        lat: 10.8231,
        lng: 106.6297,
        alt: 19
      },
      searchWindow: {
        startJd: 2460826.5,
        endJd: 2460828.5
      }
    },
    guardrails: {
      coarseRankLimit: 6,
      maxTimelineEntries: 6,
      maxTransferBytes: 10
    }
  });

  assert.equal(result.status, "short_circuited");
  assert.equal(result.metrics.reason, "memory_guard_budget_exceeded");
  assert.equal(result.timeline.length, 0);
  assert.equal(result.scanDiagnostics.guardReason, "memory_guard_budget_exceeded");
});
