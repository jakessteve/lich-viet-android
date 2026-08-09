import test from "node:test";
import assert from "node:assert/strict";

import {
  createWorkerCancelMessage,
  createWorkerRequestMessage,
  registerOmceWorker
} from "../src/index.js";

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

test("registerOmceWorker emits chunk and result messages for a calculation", async () => {
  const messages = [];
  const workerScope = {
    onmessage: null,
    postMessage(message) {
      messages.push(message);
    }
  };

  registerOmceWorker(workerScope);
  workerScope.onmessage({
    data: createWorkerRequestMessage({
      taskId: "scan-runtime",
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
    })
  });

  await wait(150);

  assert.equal(messages.some((message) => message.type === "omce:chunk"), true);
  assert.equal(messages.some((message) => message.type === "omce:result"), true);
});

test("registerOmceWorker can cancel an in-flight request", async () => {
  const messages = [];
  const workerScope = {
    onmessage: null,
    postMessage(message) {
      messages.push(message);
    }
  };

  registerOmceWorker(workerScope);
  workerScope.onmessage({
    data: createWorkerRequestMessage(
      {
        taskId: "scan-cancel",
        userBirthData: {
          jd: 2460826.5,
          lat: 10.8231,
          lng: 106.6297,
          alt: 19
        },
        searchWindow: {
          startJd: 2460826.5,
          endJd: 2460830.5
        }
      },
      {
        chunkHours: 12
      }
    )
  });
  await wait(40);
  workerScope.onmessage({
    data: createWorkerCancelMessage("scan-cancel")
  });

  await wait(120);

  assert.equal(messages.some((message) => message.type === "omce:cancelled"), true);
  assert.equal(messages.some((message) => message.type === "omce:result"), false);
});
