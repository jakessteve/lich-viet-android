function assertOrderedTimestamps(startTimestamp, endTimestamp) {
  if (!Number.isFinite(startTimestamp) || !Number.isFinite(endTimestamp)) {
    throw new TypeError("startTimestamp and endTimestamp must be finite numbers");
  }

  if (startTimestamp > endTimestamp) {
    throw new RangeError("startTimestamp must be less than or equal to endTimestamp");
  }
}

function assertPositiveFiniteNumber(value, fieldName) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${fieldName} must be a positive finite number`);
  }
}

function assertNonNegativeFiniteNumber(value, fieldName) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${fieldName} must be a non-negative finite number`);
  }
}

export function createCoarseWindows({
  startTimestamp,
  endTimestamp,
  stepMinutes = 30
}) {
  assertOrderedTimestamps(startTimestamp, endTimestamp);
  assertPositiveFiniteNumber(stepMinutes, "stepMinutes");

  const stepMs = stepMinutes * 60 * 1000;
  const windows = [];

  for (let cursor = startTimestamp; cursor < endTimestamp; cursor += stepMs) {
    const windowEnd = Math.min(cursor + stepMs, endTimestamp);
    windows.push({
      timestampStart: cursor,
      timestampEnd: windowEnd
    });
  }

  if (windows.length === 0) {
    windows.push({
      timestampStart: startTimestamp,
      timestampEnd: endTimestamp
    });
  }

  return windows;
}

export function expandFineWindow({
  centerTimestamp,
  radiusMinutes = 30,
  stepMinutes = 1
}) {
  if (!Number.isFinite(centerTimestamp)) {
    throw new TypeError("centerTimestamp must be a finite number");
  }

  assertNonNegativeFiniteNumber(radiusMinutes, "radiusMinutes");
  assertPositiveFiniteNumber(stepMinutes, "stepMinutes");

  const radiusMs = radiusMinutes * 60 * 1000;
  const stepMs = stepMinutes * 60 * 1000;
  const timestamps = [];

  for (let cursor = centerTimestamp - radiusMs; cursor <= centerTimestamp + radiusMs; cursor += stepMs) {
    timestamps.push(cursor);
  }

  return timestamps;
}

export function rankCandidateWindows(candidates, { limit = 3 } = {}) {
  if (!Array.isArray(candidates)) {
    throw new TypeError("candidates must be an array");
  }

  return [...candidates]
    .sort((left, right) => {
      if (right.metrics.totalScore !== left.metrics.totalScore) {
        return right.metrics.totalScore - left.metrics.totalScore;
      }

      return left.timestampStart - right.timestampStart;
    })
    .slice(0, Math.max(limit, 0));
}

export function summarizeChunkCandidates({
  chunkPlan,
  candidates,
  passingScore = 60
}) {
  if (!Array.isArray(chunkPlan)) {
    throw new TypeError("chunkPlan must be an array");
  }

  if (!Array.isArray(candidates)) {
    throw new TypeError("candidates must be an array");
  }

  if (!Number.isFinite(passingScore)) {
    throw new TypeError("passingScore must be a finite number");
  }

  return chunkPlan.map((chunk) => ({
    ...chunk,
    candidateCount: candidates.filter(
      (candidate) =>
        candidate.timestampStart >= chunk.timestampStart &&
        candidate.timestampEnd <= chunk.timestampEnd &&
        !candidate.metrics.isShortCircuited &&
        candidate.metrics.totalScore >= passingScore
    ).length
  }));
}
