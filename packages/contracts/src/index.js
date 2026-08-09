function assertFiniteNumber(value, fieldName) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${fieldName} must be a finite number`);
  }
}

function assertObject(value, fieldName) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${fieldName} must be an object`);
  }
}

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${fieldName} must be a non-empty string`);
  }
}

export function createScoringMetrics(input) {
  assertObject(input, "input");
  assertFiniteNumber(input.totalScore, "totalScore");
  assertFiniteNumber(input.easternScore, "easternScore");
  assertFiniteNumber(input.westernScore, "westernScore");
  assertFiniteNumber(input.vedicScore, "vedicScore");

  if (typeof input.isShortCircuited !== "boolean") {
    throw new TypeError("isShortCircuited must be a boolean");
  }

  if (input.totalScore < 0 || input.totalScore > 100) {
    throw new RangeError("totalScore must be between 0 and 100");
  }

  if (input.isShortCircuited) {
    assertNonEmptyString(input.reason, "reason");
  }

  return {
    totalScore: input.totalScore,
    easternScore: input.easternScore,
    westernScore: input.westernScore,
    vedicScore: input.vedicScore,
    isShortCircuited: input.isShortCircuited,
    ...(input.reason ? { reason: input.reason } : {})
  };
}

export function createHybridElectionTimeline(input) {
  assertObject(input, "input");
  assertObject(input.metrics, "input.metrics");
  assertFiniteNumber(input.timestampStart, "timestampStart");
  assertFiniteNumber(input.timestampEnd, "timestampEnd");
  assertNonEmptyString(input.termName, "termName");
  assertNonEmptyString(input.lunarDayStr, "lunarDayStr");

  if (input.timestampStart > input.timestampEnd) {
    throw new RangeError("timestampStart must be less than or equal to timestampEnd");
  }

  return {
    timestampStart: input.timestampStart,
    timestampEnd: input.timestampEnd,
    metrics: createScoringMetrics(input.metrics),
    termName: input.termName,
    lunarDayStr: input.lunarDayStr,
    ...(input.eventScore ? { eventScore: input.eventScore } : {})
  };
}

export function createAsyncCalculationRequest(input) {
  assertObject(input, "input");
  assertObject(input.userBirthData, "input.userBirthData");
  assertObject(input.searchWindow, "input.searchWindow");
  assertNonEmptyString(input.taskId, "taskId");
  assertFiniteNumber(input.userBirthData.jd, "userBirthData.jd");
  assertFiniteNumber(input.userBirthData.lat, "userBirthData.lat");
  assertFiniteNumber(input.userBirthData.lng, "userBirthData.lng");
  assertFiniteNumber(input.userBirthData.alt, "userBirthData.alt");
  assertFiniteNumber(input.searchWindow.startJd, "searchWindow.startJd");
  assertFiniteNumber(input.searchWindow.endJd, "searchWindow.endJd");

  if (input.dungSuEventId !== undefined) {
    assertNonEmptyString(input.dungSuEventId, "dungSuEventId");
  }

  if (input.searchWindow.startJd > input.searchWindow.endJd) {
    throw new RangeError("searchWindow.startJd must be less than or equal to searchWindow.endJd");
  }

  return {
    taskId: input.taskId,
    ...(input.dungSuEventId ? { dungSuEventId: input.dungSuEventId } : {}),
    userBirthData: {
      jd: input.userBirthData.jd,
      lat: input.userBirthData.lat,
      lng: input.userBirthData.lng,
      alt: input.userBirthData.alt
    },
    searchWindow: {
      startJd: input.searchWindow.startJd,
      endJd: input.searchWindow.endJd
    }
  };
}
