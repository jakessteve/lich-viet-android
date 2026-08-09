const VALID_QUESTION_TYPES = Object.freeze([
  "career_timing",
  "synastry",
  "electional",
  "location",
  "financial",
  "relationship",
  "health",
  "general"
]);

const VALID_ENGINE_LAYERS = Object.freeze([
  "tu_vi",
  "vedic",
  "western",
  "combined",
  "mai_hoa",
  "tam_thuc"
]);

let idCounter = 0;

function generatePredictionId() {
  idCounter += 1;
  const timestamp = Date.now().toString(36);
  const counter = idCounter.toString(36).padStart(4, "0");
  return `pred_${timestamp}_${counter}`;
}

function assertValidQuestionType(questionType) {
  if (!VALID_QUESTION_TYPES.includes(questionType)) {
    throw new TypeError(
      `questionType must be one of: ${VALID_QUESTION_TYPES.join(", ")}. Received: ${questionType}`
    );
  }
}

function assertValidEngineLayer(engineLayer) {
  if (!VALID_ENGINE_LAYERS.includes(engineLayer)) {
    throw new TypeError(
      `engineLayer must be one of: ${VALID_ENGINE_LAYERS.join(", ")}. Received: ${engineLayer}`
    );
  }
}

function sanitizeUserProfile(userProfile) {
  if (!userProfile || typeof userProfile !== "object") {
    return null;
  }

  return {
    profileId: userProfile.profileId ?? null,
    birthYear: userProfile.birthYear ?? null,
    birthMonth: userProfile.birthMonth ?? null,
    birthDay: userProfile.birthDay ?? null,
    birthHour: userProfile.birthHour ?? null,
    gender: userProfile.gender ?? null,
    birthLocation: userProfile.birthLocation ?? null
  };
}

export function createPredictionRecord(input = {}) {
  if (!input || typeof input !== "object") {
    throw new TypeError("input must be an object");
  }

  assertValidQuestionType(input.questionType);
  assertValidEngineLayer(input.engineLayer);

  if (input.confidenceScore !== undefined) {
    if (!Number.isFinite(input.confidenceScore) ||
        input.confidenceScore < 0 ||
        input.confidenceScore > 100) {
      throw new RangeError("confidenceScore must be a number between 0 and 100");
    }
  }

  return {
    predictionId: input.predictionId ?? generatePredictionId(),
    timestamp: input.timestamp ?? Date.now(),
    questionType: input.questionType,
    engineLayer: input.engineLayer,
    predictionData: input.predictionData ?? null,
    confidenceScore: input.confidenceScore ?? null,
    factors: Array.isArray(input.factors) ? [...input.factors] : [],
    userProfile: sanitizeUserProfile(input.userProfile),
    outcome: null,
    validated: false,
    validatedAt: null,
    calibrationData: null
  };
}

export function createPredictionRegistry(options = {}) {
  const predictions = new Map();
  const persistFn = options.persistFn ?? null;
  const loadFn = options.loadFn ?? null;

  if (options.initialPredictions && Array.isArray(options.initialPredictions)) {
    for (const prediction of options.initialPredictions) {
      predictions.set(prediction.predictionId, prediction);
    }
  }

  function persist(prediction) {
    if (persistFn) {
      try {
        persistFn(prediction);
      } catch (error) {
        // Persistence failure should not break the registry
        console.warn("Prediction persistence failed:", error.message);
      }
    }
  }

  return {
    register(prediction) {
      if (!prediction || typeof prediction !== "object") {
        throw new TypeError("prediction must be an object");
      }
      if (!prediction.predictionId) {
        throw new TypeError("prediction must have a predictionId");
      }

      predictions.set(prediction.predictionId, prediction);
      persist(prediction);
      return prediction;
    },

    get(predictionId) {
      if (typeof predictionId !== "string") {
        throw new TypeError("predictionId must be a string");
      }
      return predictions.get(predictionId) ?? null;
    },

    getAll(filters = {}) {
      return Array.from(predictions.values()).filter((p) => {
        if (filters.questionType !== undefined && p.questionType !== filters.questionType) {
          return false;
        }
        if (filters.engineLayer !== undefined && p.engineLayer !== filters.engineLayer) {
          return false;
        }
        if (filters.validated !== undefined && p.validated !== filters.validated) {
          return false;
        }
        if (filters.predictionId !== undefined && p.predictionId !== filters.predictionId) {
          return false;
        }
        return true;
      });
    },

    updateOutcome(predictionId, outcome) {
      if (typeof predictionId !== "string") {
        throw new TypeError("predictionId must be a string");
      }

      const prediction = predictions.get(predictionId);
      if (!prediction) {
        throw new RangeError(`Prediction not found: ${predictionId}`);
      }

      if (!outcome || typeof outcome !== "object") {
        throw new TypeError("outcome must be an object");
      }

      prediction.outcome = {
        outcomeType: outcome.outcomeType ?? null,
        actualResult: outcome.actualResult ?? null,
        outcomeDate: outcome.outcomeDate ?? Date.now(),
        notes: outcome.notes ?? null,
        metrics: outcome.metrics ?? null
      };
      prediction.validated = true;
      prediction.validatedAt = Date.now();

      persist(prediction);
      return prediction;
    },

    delete(predictionId) {
      if (typeof predictionId !== "string") {
        throw new TypeError("predictionId must be a string");
      }
      return predictions.delete(predictionId);
    },

    count(filters = {}) {
      return this.getAll(filters).length;
    },

    clear() {
      predictions.clear();
    },

    export() {
      return Array.from(predictions.values());
    },

    import(predictionArray) {
      if (!Array.isArray(predictionArray)) {
        throw new TypeError("predictionArray must be an array");
      }
      for (const prediction of predictionArray) {
        if (prediction && prediction.predictionId) {
          predictions.set(prediction.predictionId, prediction);
        }
      }
    }
  };
}

export const PREDICTION_QUESTION_TYPES = VALID_QUESTION_TYPES;
export const PREDICTION_ENGINE_LAYERS = VALID_ENGINE_LAYERS;
