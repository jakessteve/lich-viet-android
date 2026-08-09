import test from "node:test";
import assert from "node:assert/strict";

import {
  createAsyncCalculationRequest,
  createHybridElectionTimeline,
  createScoringMetrics
} from "../src/index.js";

test("createScoringMetrics requires a reason when short-circuited", () => {
  assert.throws(
    () =>
      createScoringMetrics({
        totalScore: 0,
        easternScore: 0,
        westernScore: 0,
        vedicScore: 0,
        isShortCircuited: true
      }),
    /reason must be a non-empty string/
  );
});

test("createHybridElectionTimeline enforces timestamp ordering", () => {
  assert.throws(
    () =>
      createHybridElectionTimeline({
        timestampStart: 2,
        timestampEnd: 1,
        metrics: {
          totalScore: 10,
          easternScore: 10,
          westernScore: 10,
          vedicScore: 10,
          isShortCircuited: false
        },
        termName: "Term",
        lunarDayStr: "Day"
      }),
    /timestampStart must be less than or equal to timestampEnd/
  );
});

test("createAsyncCalculationRequest preserves a valid request", () => {
  const request = createAsyncCalculationRequest({
    taskId: "scan-001",
    dungSuEventId: "ds_kai_shi",
    userBirthData: {
      jd: 2451545,
      lat: 16.0471,
      lng: 108.2068,
      alt: 5
    },
    searchWindow: {
      startJd: 2451545,
      endJd: 2451546
    }
  });

  assert.equal(request.taskId, "scan-001");
  assert.equal(request.dungSuEventId, "ds_kai_shi");
  assert.equal(request.userBirthData.lat, 16.0471);
});

test("createAsyncCalculationRequest rejects malformed requests", () => {
  assert.throws(() => createAsyncCalculationRequest(null), /input must be an object/);
  assert.throws(
    () =>
      createAsyncCalculationRequest({
        taskId: "scan-002",
        userBirthData: null,
        searchWindow: {
          startJd: 2451545,
          endJd: 2451546
        }
      }),
    /input\.userBirthData must be an object/
  );
  assert.throws(
    () =>
      createAsyncCalculationRequest({
        taskId: "scan-003",
        dungSuEventId: "",
        userBirthData: {
          jd: 2451545,
          lat: 16.0471,
          lng: 108.2068,
          alt: 5
        },
        searchWindow: {
          startJd: 2451545,
          endJd: 2451546
        }
      }),
    /dungSuEventId must be a non-empty string/
  );
});
