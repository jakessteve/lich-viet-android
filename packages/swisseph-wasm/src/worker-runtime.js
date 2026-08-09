import {
  createChunkPlan,
  createWorkerCancelMessage,
  createWorkerRequestMessage,
  runElectionScan
} from "./engine.js";

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createProgressMessage(taskId, phase, progress, completedChunks, totalChunks) {
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

function createChunkMessage(taskId, summary) {
  return {
    type: "omce:chunk",
    payload: {
      taskId,
      summary
    }
  };
}

function createResultMessage(result) {
  return {
    type: "omce:result",
    payload: result
  };
}

function createCancelledMessage(taskId) {
  return {
    type: "omce:cancelled",
    payload: {
      taskId
    }
  };
}

function createErrorMessage(message, taskId) {
  return {
    type: "omce:error",
    payload: {
      ...(taskId ? { taskId } : {}),
      message
    }
  };
}

export function registerOmceWorker(workerScope) {
  let activeTaskId = null;
  const cancelledTaskIds = new Set();

  workerScope.onmessage = async (event) => {
    if (event.data?.type === "omce:cancel") {
      const cancelMessage = createWorkerCancelMessage(event.data.payload.taskId);
      cancelledTaskIds.add(cancelMessage.payload.taskId);
      return;
    }

    if (event.data?.type !== "omce:calculate") {
      return;
    }

    const normalizedMessage = createWorkerRequestMessage(
      event.data.payload.request,
      event.data.payload.options
    );
    const taskId = normalizedMessage.payload.request.taskId;
    const chunkPlan = createChunkPlan({
      request: normalizedMessage.payload.request,
      chunkHours: normalizedMessage.payload.options?.chunkHours
    });

    activeTaskId = taskId;
    cancelledTaskIds.delete(taskId);

    try {
      const result = runElectionScan({
        request: normalizedMessage.payload.request,
        controlZone: normalizedMessage.payload.options?.controlZone,
        chunkHours: normalizedMessage.payload.options?.chunkHours,
        strictMode: normalizedMessage.payload.options?.strictMode,
        overrides: normalizedMessage.payload.options?.overrides,
        guardrails: normalizedMessage.payload.options?.guardrails
      });

      for (const [phase, progress] of [
        ["validating", 0.12],
        ["timezone", 0.24]
      ]) {
        workerScope.postMessage(
          createProgressMessage(taskId, phase, progress, 0, chunkPlan.length)
        );
        await delay(25);
      }

      for (const chunk of chunkPlan) {
        if (cancelledTaskIds.has(taskId)) {
          workerScope.postMessage(createCancelledMessage(taskId));
          cancelledTaskIds.delete(taskId);
          if (activeTaskId === taskId) {
            activeTaskId = null;
          }
          return;
        }

        const progress = 0.24 + ((chunk.chunkIndex + 1) / Math.max(chunk.totalChunks, 1)) * 0.56;
        workerScope.postMessage(
          createProgressMessage(
            taskId,
            "scanning",
            progress,
            chunk.chunkIndex + 1,
            chunk.totalChunks
          )
        );
        const chunkSummary = result.chunkSummaries.find(
          (summary) => summary.chunkIndex === chunk.chunkIndex
        ) ?? chunk;
        workerScope.postMessage(
          createChunkMessage(taskId, chunkSummary)
        );
        await delay(25);
      }

      workerScope.postMessage(
        createProgressMessage(taskId, "scoring", 0.9, chunkPlan.length, chunkPlan.length)
      );

      workerScope.postMessage(
        createProgressMessage(taskId, "complete", 1, chunkPlan.length, chunkPlan.length)
      );
      workerScope.postMessage(createResultMessage(result), [
        result.timelineTransfer.timestamps.buffer,
        result.timelineTransfer.scores.buffer
      ]);
      if (activeTaskId === taskId) {
        activeTaskId = null;
      }
    } catch (error) {
      workerScope.postMessage(
        createErrorMessage(
          error instanceof Error ? error.message : "Unknown worker error",
          taskId
        )
      );
      if (activeTaskId === taskId) {
        activeTaskId = null;
      }
    }
  };
}
