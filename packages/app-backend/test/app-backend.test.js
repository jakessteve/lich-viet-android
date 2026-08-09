import test from "node:test";
import assert from "node:assert/strict";

import { createOmceBackendEnvelope } from "../src/index.js";

test("createOmceBackendEnvelope emits a backend-only request/result transcript", () => {
  const envelope = createOmceBackendEnvelope({
    request: {
      taskId: "app-backend-scan",
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
    options: {
      chunkHours: 24,
      strictMode: true
    }
  });

  assert.equal(envelope.request.taskId, "app-backend-scan");
  assert.equal(envelope.events[0].type, "omce:progress");
  assert.equal(envelope.events.at(-1).type, "omce:result");
  assert.equal(envelope.response.timelineTransfer.timestamps.length, envelope.response.timeline.length * 2);
  assert.equal(Array.isArray(envelope.response.timelineTransfer.timestamps), true);
});
