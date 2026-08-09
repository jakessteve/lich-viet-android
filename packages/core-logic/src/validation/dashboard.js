import { createPredictionRegistry, createPredictionRecord } from "./prediction-registry.js";
import { validateOutcome, createOutcomeRecord } from "./outcome-tracker.js";
import { createCalibrator } from "./calibrator.js";

export function createValidationDashboard(options = {}) {
  const registry = options.registry ?? createPredictionRegistry(options);
  const calibrator = createCalibrator(registry);

  return {
    registry,
    calibrator,

    recordPrediction(input) {
      const prediction = createPredictionRecord(input);
      registry.register(prediction);
      return prediction;
    },

    recordOutcome(predictionId, outcome) {
      const prediction = registry.get(predictionId);
      if (!prediction) {
        throw new RangeError(`Prediction not found: ${predictionId}`);
      }

      validateOutcome(prediction.questionType, outcome);

      const outcomeRecord = createOutcomeRecord({
        predictionId,
        questionType: prediction.questionType,
        ...outcome
      });

      return registry.updateOutcome(predictionId, outcomeRecord);
    },

    getOverview() {
      const questionTypes = [
        "career_timing",
        "synastry",
        "electional",
        "location",
        "financial",
        "relationship",
        "health",
        "general"
      ];

      const accuracyByType = {};
      for (const questionType of questionTypes) {
        const accuracy = calibrator.calculateAccuracy({ questionType });
        if (accuracy.sampleSize > 0) {
          accuracyByType[questionType] = accuracy;
        }
      }

      return {
        totalPredictions: registry.count(),
        validatedPredictions: registry.count({ validated: true }),
        pendingValidation: registry.count({ validated: false }),
        accuracyByType,
        recommendations: calibrator.recommendWeightAdjustments()
      };
    },

    getDetailedReport(questionType) {
      if (!questionType) {
        throw new TypeError("questionType is required");
      }

      return {
        questionType,
        accuracy: calibrator.calculateAccuracy({ questionType }),
        engineComparison: calibrator.compareEngineLayers(questionType),
        factorAnalysis: calibrator.analyzeFactors(questionType),
        recentPredictions: registry
          .getAll({ questionType, validated: true })
          .slice(-10)
          .reverse(),
        pendingPredictions: registry
          .getAll({ questionType, validated: false })
          .slice(-5)
          .reverse()
      };
    },

    getFullReport(options = {}) {
      return calibrator.generateReport(options);
    },

    exportData() {
      return {
        predictions: registry.export(),
        exportedAt: Date.now()
      };
    },

    importData(data) {
      if (!data || !Array.isArray(data.predictions)) {
        throw new TypeError("data must contain a predictions array");
      }
      registry.import(data.predictions);
      return { imported: data.predictions.length };
    }
  };
}
