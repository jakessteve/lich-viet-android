export function isLatitudeGuardTriggered(latitude) {
  if (!Number.isFinite(latitude)) {
    throw new TypeError("latitude must be a finite number");
  }

  return Math.abs(latitude) >= 60;
}

const BYTES_PER_TIMELINE_ENTRY =
  Float64Array.BYTES_PER_ELEMENT * 2 + Float32Array.BYTES_PER_ELEMENT;

function normalizePositiveInteger(value, name, fallback) {
  if (value === undefined) {
    return fallback;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative integer`);
  }

  return value;
}

function isTimelineEntry(entry) {
  return (
    entry !== null &&
    typeof entry === "object" &&
    Number.isFinite(entry.timestampStart) &&
    entry.metrics !== null &&
    typeof entry.metrics === "object" &&
    Number.isFinite(entry.metrics.totalScore)
  );
}

function sortTimelineEntries(entries) {
  return [...entries].sort((left, right) => {
    if (left.timestampStart !== right.timestampStart) {
      return left.timestampStart - right.timestampStart;
    }

    return left.timestampEnd - right.timestampEnd;
  });
}

function evenSample(entries, resolvedMaxEntries) {
  if (entries.length <= resolvedMaxEntries) {
    return [...entries];
  }

  if (resolvedMaxEntries === 0) {
    return [];
  }

  if (resolvedMaxEntries === 1) {
    return [entries[0]];
  }

  const lastIndex = entries.length - 1;
  const sampled = [];

  for (let slot = 0; slot < resolvedMaxEntries; slot += 1) {
    const index = Math.round((slot * lastIndex) / (resolvedMaxEntries - 1));
    sampled.push(entries[index]);
  }

  return sampled;
}

function lttbDownsampleTimeline(entries, resolvedMaxEntries) {
  if (entries.length <= resolvedMaxEntries) {
    return [...entries];
  }

  if (resolvedMaxEntries <= 1) {
    return [entries[0]];
  }

  const sampled = [entries[0]];
  const bucketSize = (entries.length - 2) / (resolvedMaxEntries - 2);
  let anchorIndex = 0;

  for (let bucketIndex = 0; bucketIndex < resolvedMaxEntries - 2; bucketIndex += 1) {
    const bucketStart = Math.floor(bucketIndex * bucketSize) + 1;
    const bucketEnd = Math.min(Math.floor((bucketIndex + 1) * bucketSize) + 1, entries.length - 1);
    const nextBucketStart = Math.floor((bucketIndex + 1) * bucketSize) + 1;
    const nextBucketEnd = Math.min(
      Math.floor((bucketIndex + 2) * bucketSize) + 1,
      entries.length
    );

    let averageX = entries[entries.length - 1].timestampStart;
    let averageY = entries[entries.length - 1].metrics.totalScore;

    if (nextBucketStart < nextBucketEnd) {
      let sumX = 0;
      let sumY = 0;

      for (let index = nextBucketStart; index < nextBucketEnd; index += 1) {
        sumX += entries[index].timestampStart;
        sumY += entries[index].metrics.totalScore;
      }

      const bucketCount = nextBucketEnd - nextBucketStart;
      averageX = sumX / bucketCount;
      averageY = sumY / bucketCount;
    }

    let chosenIndex = bucketStart;
    let maxArea = Number.NEGATIVE_INFINITY;
    const anchor = entries[anchorIndex];

    for (let index = bucketStart; index < bucketEnd; index += 1) {
      const candidate = entries[index];
      const area = Math.abs(
        (anchor.timestampStart - averageX) * (candidate.metrics.totalScore - anchor.metrics.totalScore) -
          (anchor.timestampStart - candidate.timestampStart) *
            (averageY - anchor.metrics.totalScore)
      );

      if (area > maxArea) {
        maxArea = area;
        chosenIndex = index;
      }
    }

    sampled.push(entries[chosenIndex]);
    anchorIndex = chosenIndex;
  }

  sampled.push(entries[entries.length - 1]);
  return sampled;
}

function calculateObjectSize(val) {
  if (val === null || val === undefined) {
    return 0;
  }
  if (typeof val === "number") {
    return 8;
  }
  if (typeof val === "string") {
    return val.length * 2;
  }
  if (typeof val === "boolean") {
    return 4;
  }
  if (typeof val === "object") {
    let size = 0;
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        size += key.length * 2;
        size += calculateObjectSize(val[key]);
      }
    }
    return size;
  }
  return 0;
}

function preservePeakScores(original, sampled, numPeaks) {
  if (numPeaks <= 0 || original.length <= sampled.length || sampled.length <= 2) {
    return sampled;
  }

  const sortedOriginal = [...original].sort(
    (left, right) => right.metrics.totalScore - left.metrics.totalScore
  );
  const peaks = sortedOriginal.slice(0, numPeaks);
  const sampledTimestamps = new Set(sampled.map((item) => item.timestampStart));
  const result = [...sampled];
  const replacedIndices = new Set();

  for (const peak of peaks) {
    if (sampledTimestamps.has(peak.timestampStart)) {
      continue;
    }

    let closestIndex = -1;
    let minDiff = Infinity;

    for (let i = 1; i < result.length - 1; i += 1) {
      if (replacedIndices.has(i)) {
        continue;
      }
      const diff = Math.abs(result[i].timestampStart - peak.timestampStart);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    if (closestIndex !== -1) {
      sampledTimestamps.delete(result[closestIndex].timestampStart);
      result[closestIndex] = peak;
      sampledTimestamps.add(peak.timestampStart);
      replacedIndices.add(closestIndex);
    }
  }

  return sortTimelineEntries(result);
}

export function estimateTimelineTransferBytes(input) {
  if (typeof input === "number") {
    if (!Number.isInteger(input) || input < 0) {
      throw new TypeError("input must be a non-negative integer");
    }
    return input * BYTES_PER_TIMELINE_ENTRY;
  }
  if (!Array.isArray(input)) {
    throw new TypeError("input must be an array or a non-negative integer");
  }

  let totalBytes = 0;
  for (const entry of input) {
    totalBytes += Math.max(BYTES_PER_TIMELINE_ENTRY, calculateObjectSize(entry));
  }
  return totalBytes;
}

export function downsampleTimelineEntries(entries, { maxEntries } = {}) {
  if (!Array.isArray(entries)) {
    throw new TypeError("entries must be an array");
  }

  const resolvedMaxEntries = normalizePositiveInteger(
    maxEntries,
    "maxEntries",
    entries.length
  );
  const timelineLikeEntries = entries.every(isTimelineEntry);

  if (entries.length <= resolvedMaxEntries) {
    return {
      entries: timelineLikeEntries ? sortTimelineEntries(entries) : [...entries],
      downsampled: false,
      originalCount: entries.length,
      finalCount: entries.length
    };
  }

  if (resolvedMaxEntries === 0) {
    return {
      entries: [],
      downsampled: true,
      originalCount: entries.length,
      finalCount: 0
    };
  }

  if (resolvedMaxEntries === 1) {
    return {
      entries: [entries[0]],
      downsampled: true,
      originalCount: entries.length,
      finalCount: 1
    };
  }

  let sampled = timelineLikeEntries
    ? lttbDownsampleTimeline(sortTimelineEntries(entries), resolvedMaxEntries)
    : evenSample(entries, resolvedMaxEntries);

  if (timelineLikeEntries) {
    const numPeaks = resolvedMaxEntries >= 2
      ? Math.max(1, Math.min(Math.floor(resolvedMaxEntries / 4), 6))
      : 0;
    sampled = preservePeakScores(entries, sampled, numPeaks);
  }

  return {
    entries: sampled,
    downsampled: true,
    originalCount: entries.length,
    finalCount: sampled.length
  };
}

export function applyTimelineGuardrails(
  entries,
  { maxEntries = 24, maxTransferBytes = 65536 } = {}
) {
  if (!Array.isArray(entries)) {
    throw new TypeError("entries must be an array");
  }

  const resolvedMaxEntries = normalizePositiveInteger(
    maxEntries,
    "maxEntries",
    24
  );
  const resolvedMaxTransferBytes = normalizePositiveInteger(
    maxTransferBytes,
    "maxTransferBytes",
    65536
  );

  const avgEntrySize = entries.length > 0
    ? Math.ceil(estimateTimelineTransferBytes(entries) / entries.length)
    : BYTES_PER_TIMELINE_ENTRY;

  const allowedEntriesByBytes = Math.floor(
    resolvedMaxTransferBytes / avgEntrySize
  );
  const allowedEntries = Math.min(resolvedMaxEntries, allowedEntriesByBytes);

  if (entries.length > 0 && allowedEntries < 1) {
    return {
      entries: [],
      diagnostics: {
        memoryGuardTriggered: true,
        timelineDownsampled: true,
        shortCircuited: true,
        reason: "memory_guard_budget_exceeded",
        originalTimelineCount: entries.length,
        finalTimelineCount: 0,
        maxTimelineEntries: resolvedMaxEntries,
        maxTransferBytes: resolvedMaxTransferBytes,
        allowedEntriesByBytes,
        estimatedTransferBytes: 0
      }
    };
  }

  const sampled = downsampleTimelineEntries(entries, {
    maxEntries: Math.max(0, allowedEntries)
  });
  const estimatedTransferBytes = estimateTimelineTransferBytes(
    sampled.entries
  );

  return {
    entries: sampled.entries,
    diagnostics: {
      memoryGuardTriggered: sampled.downsampled,
      timelineDownsampled: sampled.downsampled,
      shortCircuited: false,
      reason: undefined,
      originalTimelineCount: sampled.originalCount,
      finalTimelineCount: sampled.finalCount,
      maxTimelineEntries: resolvedMaxEntries,
      maxTransferBytes: resolvedMaxTransferBytes,
      allowedEntriesByBytes,
      estimatedTransferBytes
    }
  };
}
