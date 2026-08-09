import test from "node:test";
import assert from "node:assert/strict";

import {
  createPredictionRecord,
  createPredictionRegistry,
  PREDICTION_QUESTION_TYPES,
  PREDICTION_ENGINE_LAYERS
} from "../src/validation/prediction-registry.js";

import {
  validateOutcome,
  createOutcomeRecord,
  getOutcomeSchema,
  getOutcomeScore,
  OUTCOME_TYPES
} from "../src/validation/outcome-tracker.js";

import { createCalibrator } from "../src/validation/calibrator.js";

import { createValidationDashboard } from "../src/validation/dashboard.js";

test("createPredictionRecord creates a valid prediction record", () => {
  const prediction = createPredictionRecord({
    questionType: "career_timing",
    engineLayer: "combined",
    predictionData: { score: 85 },
    confidenceScore: 80,
    factors: ["jupiter_transit", "moon_phase"],
    userProfile: {
      profileId: "test-user",
      birthYear: 1990,
      birthMonth: 6,
      birthDay: 15,
      birthHour: 14,
      gender: "male"
    }
  });

  assert.ok(prediction.predictionId.startsWith("pred_"));
  assert.equal(prediction.questionType, "career_timing");
  assert.equal(prediction.engineLayer, "combined");
  assert.equal(prediction.confidenceScore, 80);
  assert.deepEqual(prediction.factors, ["jupiter_transit", "moon_phase"]);
  assert.equal(prediction.validated, false);
  assert.equal(prediction.outcome, null);
});

test("createPredictionRecord throws on invalid questionType", () => {
  assert.throws(
    () => createPredictionRecord({ questionType: "invalid_type", engineLayer: "combined" }),
    /questionType must be one of/
  );
});

test("createPredictionRecord throws on invalid engineLayer", () => {
  assert.throws(
    () => createPredictionRecord({ questionType: "career_timing", engineLayer: "invalid" }),
    /engineLayer must be one of/
  );
});

test("createPredictionRecord throws on invalid confidenceScore", () => {
  assert.throws(
    () => createPredictionRecord({
      questionType: "career_timing",
      engineLayer: "combined",
      confidenceScore: 150
    }),
    /confidenceScore must be a number between 0 and 100/
  );
});

test("createPredictionRegistry manages predictions correctly", () => {
  const registry = createPredictionRegistry();

  const prediction1 = createPredictionRecord({
    questionType: "career_timing",
    engineLayer: "combined"
  });

  const prediction2 = createPredictionRecord({
    questionType: "synastry",
    engineLayer: "western"
  });

  registry.register(prediction1);
  registry.register(prediction2);

  assert.equal(registry.count(), 2);
  assert.equal(registry.count({ questionType: "career_timing" }), 1);
  assert.equal(registry.count({ engineLayer: "western" }), 1);

  const retrieved = registry.get(prediction1.predictionId);
  assert.equal(retrieved.predictionId, prediction1.predictionId);

  const all = registry.getAll();
  assert.equal(all.length, 2);
});

test("createPredictionRegistry updateOutcome marks prediction as validated", () => {
  const registry = createPredictionRegistry();

  const prediction = createPredictionRecord({
    questionType: "career_timing",
    engineLayer: "combined"
  });

  registry.register(prediction);

  const updated = registry.updateOutcome(prediction.predictionId, {
    outcomeType: "success",
    actualResult: "Got job offer",
    outcomeDate: Date.now()
  });

  assert.equal(updated.validated, true);
  assert.equal(updated.outcome.outcomeType, "success");
  assert.equal(updated.outcome.actualResult, "Got job offer");
  assert.ok(updated.validatedAt > 0);
});

test("createPredictionRegistry updateOutcome throws on non-existent prediction", () => {
  const registry = createPredictionRegistry();

  assert.throws(
    () => registry.updateOutcome("non-existent-id", { outcomeType: "success" }),
    /Prediction not found/
  );
});

test("validateOutcome validates outcome against schema", () => {
  const outcome = {
    outcomeType: "success",
    actualResult: "Got promoted"
  };

  assert.ok(validateOutcome("career_timing", outcome));
});

test("validateOutcome throws on missing required field", () => {
  const outcome = {
    actualResult: "Got promoted"
  };

  assert.throws(
    () => validateOutcome("career_timing", outcome),
    /Missing required field: outcomeType/
  );
});

test("validateOutcome throws on invalid outcomeType", () => {
  const outcome = {
    outcomeType: "invalid_outcome"
  };

  assert.throws(
    () => validateOutcome("career_timing", outcome),
    /outcomeType must be one of/
  );
});

test("createOutcomeRecord creates a valid outcome record", () => {
  const outcome = createOutcomeRecord({
    predictionId: "pred_test",
    questionType: "career_timing",
    outcomeType: "success",
    actualResult: "Got job offer",
    notes: "Very happy with the outcome"
  });

  assert.equal(outcome.predictionId, "pred_test");
  assert.equal(outcome.outcomeType, "success");
  assert.equal(outcome.actualResult, "Got job offer");
  assert.ok(outcome.validatedAt > 0);
});

test("getOutcomeSchema returns schema for valid questionType", () => {
  const schema = getOutcomeSchema("career_timing");
  assert.ok(schema);
  assert.ok(Array.isArray(schema.required));
  assert.ok(Array.isArray(schema.optional));
  assert.ok(Array.isArray(schema.outcomeTypes));
});

test("getOutcomeSchema returns null for invalid questionType", () => {
  const schema = getOutcomeSchema("invalid_type");
  assert.equal(schema, null);
});

test("getOutcomeScore returns correct scores", () => {
  assert.equal(getOutcomeScore("success"), 1.0);
  assert.equal(getOutcomeScore("partial"), 0.5);
  assert.equal(getOutcomeScore("neutral"), 0.0);
  assert.equal(getOutcomeScore("failure"), -1.0);
  assert.equal(getOutcomeScore("pending"), null);
  assert.equal(getOutcomeScore("invalid"), null);
});

test("createCalibrator calculates accuracy correctly", () => {
  const registry = createPredictionRegistry();

  const predictions = [
    createPredictionRecord({ questionType: "career_timing", engineLayer: "combined" }),
    createPredictionRecord({ questionType: "career_timing", engineLayer: "combined" }),
    createPredictionRecord({ questionType: "career_timing", engineLayer: "combined" }),
    createPredictionRecord({ questionType: "career_timing", engineLayer: "combined" })
  ];

  predictions.forEach(p => registry.register(p));

  registry.updateOutcome(predictions[0].predictionId, { outcomeType: "success" });
  registry.updateOutcome(predictions[1].predictionId, { outcomeType: "success" });
  registry.updateOutcome(predictions[2].predictionId, { outcomeType: "partial" });
  registry.updateOutcome(predictions[3].predictionId, { outcomeType: "failure" });

  const calibrator = createCalibrator(registry);
  const accuracy = calibrator.calculateAccuracy({ questionType: "career_timing" });

  assert.equal(accuracy.sampleSize, 4);
  assert.ok(accuracy.accuracy > 0);
  assert.ok(accuracy.accuracy <= 100);
  assert.equal(accuracy.breakdown.success, 2);
  assert.equal(accuracy.breakdown.partial, 1);
  assert.equal(accuracy.breakdown.failure, 1);
});

test("createCalibrator compareEngineLayers compares different engines", () => {
  const registry = createPredictionRegistry();

  const predictions = [
    createPredictionRecord({ questionType: "career_timing", engineLayer: "combined" }),
    createPredictionRecord({ questionType: "career_timing", engineLayer: "western" }),
    createPredictionRecord({ questionType: "career_timing", engineLayer: "vedic" })
  ];

  predictions.forEach(p => registry.register(p));

  registry.updateOutcome(predictions[0].predictionId, { outcomeType: "success" });
  registry.updateOutcome(predictions[1].predictionId, { outcomeType: "partial" });
  registry.updateOutcome(predictions[2].predictionId, { outcomeType: "failure" });

  const calibrator = createCalibrator(registry);
  const comparison = calibrator.compareEngineLayers("career_timing");

  assert.ok(comparison.combined);
  assert.ok(comparison.western);
  assert.ok(comparison.vedic);
  assert.equal(comparison.combined.sampleSize, 1);
  assert.equal(comparison.western.sampleSize, 1);
  assert.equal(comparison.vedic.sampleSize, 1);
});

test("createCalibrator analyzeFactors identifies predictive factors", () => {
  const registry = createPredictionRegistry();

  const predictions = [
    createPredictionRecord({
      questionType: "career_timing",
      engineLayer: "combined",
      factors: ["jupiter_transit", "moon_phase"]
    }),
    createPredictionRecord({
      questionType: "career_timing",
      engineLayer: "combined",
      factors: ["jupiter_transit", "saturn_return"]
    }),
    createPredictionRecord({
      questionType: "career_timing",
      engineLayer: "combined",
      factors: ["moon_phase"]
    })
  ];

  predictions.forEach(p => registry.register(p));

  registry.updateOutcome(predictions[0].predictionId, { outcomeType: "success" });
  registry.updateOutcome(predictions[1].predictionId, { outcomeType: "success" });
  registry.updateOutcome(predictions[2].predictionId, { outcomeType: "failure" });

  const calibrator = createCalibrator(registry);
  const factors = calibrator.analyzeFactors("career_timing");

  assert.ok(factors.length > 0);
  assert.ok(factors[0].factor);
  assert.ok(factors[0].successRate >= 0);
  assert.ok(factors[0].successRate <= 1);
  assert.ok(factors[0].sampleSize > 0);
});

test("createCalibrator recommendWeightAdjustments generates recommendations", () => {
  const registry = createPredictionRegistry();

  for (let i = 0; i < 15; i++) {
    const prediction = createPredictionRecord({
      questionType: "career_timing",
      engineLayer: i < 10 ? "combined" : "western",
      factors: ["jupiter_transit"]
    });
    registry.register(prediction);

    const outcomeType = i < 12 ? "success" : "failure";
    registry.updateOutcome(prediction.predictionId, { outcomeType });
  }

  const calibrator = createCalibrator(registry);
  const recommendations = calibrator.recommendWeightAdjustments({
    minSampleSize: 5,
    minCorrelation: 0.1
  });

  assert.ok(Array.isArray(recommendations));
});

test("createCalibrator generateReport creates comprehensive report", () => {
  const registry = createPredictionRegistry();

  const prediction = createPredictionRecord({
    questionType: "career_timing",
    engineLayer: "combined"
  });
  registry.register(prediction);
  registry.updateOutcome(prediction.predictionId, { outcomeType: "success" });

  const calibrator = createCalibrator(registry);
  const report = calibrator.generateReport();

  assert.ok(report.generatedAt);
  assert.ok(report.overview);
  assert.ok(report.accuracyByType);
  assert.ok(report.engineComparison);
  assert.ok(Array.isArray(report.recommendations));
});

test("createValidationDashboard provides unified API", () => {
  const dashboard = createValidationDashboard();

  const prediction = dashboard.recordPrediction({
    questionType: "career_timing",
    engineLayer: "combined",
    predictionData: { score: 85 },
    factors: ["jupiter_transit"]
  });

  assert.ok(prediction.predictionId);

  const updated = dashboard.recordOutcome(prediction.predictionId, {
    outcomeType: "success",
    actualResult: "Got job"
  });

  assert.equal(updated.validated, true);

  const overview = dashboard.getOverview();
  assert.ok(overview.totalPredictions >= 1);
  assert.ok(overview.validatedPredictions >= 1);

  const detailed = dashboard.getDetailedReport("career_timing");
  assert.equal(detailed.questionType, "career_timing");
  assert.ok(detailed.accuracy);
});

test("createValidationDashboard exportData and importData work correctly", () => {
  const dashboard1 = createValidationDashboard();

  const prediction = dashboard1.recordPrediction({
    questionType: "synastry",
    engineLayer: "western"
  });

  dashboard1.recordOutcome(prediction.predictionId, {
    outcomeType: "partial"
  });

  const exported = dashboard1.exportData();
  assert.ok(exported.predictions);
  assert.ok(exported.exportedAt);

  const dashboard2 = createValidationDashboard();
  const importResult = dashboard2.importData(exported);

  assert.equal(importResult.imported, 1);
  assert.equal(dashboard2.registry.count(), 1);
});

test("PREDICTION_QUESTION_TYPES contains expected types", () => {
  assert.ok(PREDICTION_QUESTION_TYPES.includes("career_timing"));
  assert.ok(PREDICTION_QUESTION_TYPES.includes("synastry"));
  assert.ok(PREDICTION_QUESTION_TYPES.includes("electional"));
  assert.ok(PREDICTION_QUESTION_TYPES.includes("location"));
});

test("PREDICTION_ENGINE_LAYERS contains expected layers", () => {
  assert.ok(PREDICTION_ENGINE_LAYERS.includes("tu_vi"));
  assert.ok(PREDICTION_ENGINE_LAYERS.includes("vedic"));
  assert.ok(PREDICTION_ENGINE_LAYERS.includes("western"));
  assert.ok(PREDICTION_ENGINE_LAYERS.includes("combined"));
});

test("OUTCOME_TYPES contains expected types", () => {
  assert.ok(OUTCOME_TYPES.includes("success"));
  assert.ok(OUTCOME_TYPES.includes("partial"));
  assert.ok(OUTCOME_TYPES.includes("failure"));
  assert.ok(OUTCOME_TYPES.includes("neutral"));
  assert.ok(OUTCOME_TYPES.includes("pending"));
});
