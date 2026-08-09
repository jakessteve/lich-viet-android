const VALID_OUTCOME_TYPES = Object.freeze([
  "success",
  "partial",
  "failure",
  "neutral",
  "pending"
]);

const OUTCOME_SCHEMAS = Object.freeze({
  career_timing: {
    required: ["outcomeType"],
    optional: [
      "actualResult",
      "jobOfferDate",
      "startDate",
      "salaryChange",
      "salaryChangePercent",
      "satisfactionScore",
      "roleLevel",
      "companySize",
      "industry",
      "location",
      "notes"
    ],
    outcomeTypes: VALID_OUTCOME_TYPES
  },

  synastry: {
    required: ["outcomeType"],
    optional: [
      "actualResult",
      "relationshipDuration",
      "conflictLevel",
      "satisfactionScore",
      "majorEvents",
      "communicationQuality",
      "trustLevel",
      "notes"
    ],
    outcomeTypes: VALID_OUTCOME_TYPES
  },

  electional: {
    required: ["outcomeType"],
    optional: [
      "actualResult",
      "eventOutcome",
      "unexpectedIssues",
      "overallSuccess",
      "duration",
      "cost",
      "notes"
    ],
    outcomeTypes: VALID_OUTCOME_TYPES
  },

  location: {
    required: ["outcomeType"],
    optional: [
      "actualResult",
      "visaSuccess",
      "jobFound",
      "satisfactionScore",
      "duration",
      "qualityOfLife",
      "costOfLiving",
      "notes"
    ],
    outcomeTypes: VALID_OUTCOME_TYPES
  },

  financial: {
    required: ["outcomeType"],
    optional: [
      "actualResult",
      "amountGained",
      "amountLost",
      "roiPercent",
      "duration",
      "riskLevel",
      "notes"
    ],
    outcomeTypes: VALID_OUTCOME_TYPES
  },

  relationship: {
    required: ["outcomeType"],
    optional: [
      "actualResult",
      "relationshipType",
      "duration",
      "satisfactionScore",
      "notes"
    ],
    outcomeTypes: VALID_OUTCOME_TYPES
  },

  health: {
    required: ["outcomeType"],
    optional: [
      "actualResult",
      "improvementLevel",
      "duration",
      "treatmentType",
      "notes"
    ],
    outcomeTypes: VALID_OUTCOME_TYPES
  },

  general: {
    required: ["outcomeType"],
    optional: ["actualResult", "notes"],
    outcomeTypes: VALID_OUTCOME_TYPES
  }
});

function assertValidOutcomeType(outcomeType, questionType) {
  if (!VALID_OUTCOME_TYPES.includes(outcomeType)) {
    throw new TypeError(
      `outcomeType must be one of: ${VALID_OUTCOME_TYPES.join(", ")}. Received: ${outcomeType}`
    );
  }

  const schema = OUTCOME_SCHEMAS[questionType];
  if (schema && !schema.outcomeTypes.includes(outcomeType)) {
    throw new TypeError(
      `outcomeType '${outcomeType}' is not valid for questionType '${questionType}'`
    );
  }
}

export function validateOutcome(questionType, outcome) {
  if (!outcome || typeof outcome !== "object") {
    throw new TypeError("outcome must be an object");
  }

  const schema = OUTCOME_SCHEMAS[questionType];
  if (!schema) {
    throw new TypeError(`Unknown questionType: ${questionType}`);
  }

  for (const field of schema.required) {
    if (outcome[field] === undefined || outcome[field] === null) {
      throw new TypeError(`Missing required field: ${field}`);
    }
  }

  assertValidOutcomeType(outcome.outcomeType, questionType);

  const validFields = new Set([...schema.required, ...schema.optional]);
  const invalidFields = Object.keys(outcome).filter((key) => !validFields.has(key));

  if (invalidFields.length > 0) {
    console.warn(
      `Outcome contains unrecognized fields for ${questionType}: ${invalidFields.join(", ")}`
    );
  }

  return true;
}

export function createOutcomeRecord(input = {}) {
  if (!input || typeof input !== "object") {
    throw new TypeError("input must be an object");
  }

  if (!input.predictionId) {
    throw new TypeError("predictionId is required");
  }

  assertValidOutcomeType(input.outcomeType, input.questionType ?? "general");

  return {
    predictionId: input.predictionId,
    outcomeType: input.outcomeType,
    actualResult: input.actualResult ?? null,
    outcomeDate: input.outcomeDate ?? Date.now(),
    notes: input.notes ?? null,
    metrics: input.metrics ?? null,
    validatedAt: Date.now()
  };
}

export function getOutcomeSchema(questionType) {
  return OUTCOME_SCHEMAS[questionType] ?? null;
}

export function getAllOutcomeSchemas() {
  return { ...OUTCOME_SCHEMAS };
}

export function getOutcomeScore(outcomeType) {
  switch (outcomeType) {
    case "success":
      return 1.0;
    case "partial":
      return 0.5;
    case "neutral":
      return 0.0;
    case "failure":
      return -1.0;
    case "pending":
      return null;
    default:
      return null;
  }
}

export const OUTCOME_TYPES = VALID_OUTCOME_TYPES;
