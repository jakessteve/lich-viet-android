import { getOutcomeScore } from "./outcome-tracker.js";

function calculateWilsonInterval(n, p, z = 1.96) {
  if (n === 0 || p === null) {
    return { lower: 0, upper: 0 };
  }

  const denominator = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denominator;
  const margin = (z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / denominator;

  return {
    lower: Number(Math.max(0, centre - margin).toFixed(3)),
    upper: Number(Math.min(1, centre + margin).toFixed(3))
  };
}

export function createCalibrator(predictionRegistry) {
  if (!predictionRegistry || typeof predictionRegistry.getAll !== "function") {
    throw new TypeError("predictionRegistry must have a getAll method");
  }

  return {
    calculateAccuracy(filters = {}) {
      const predictions = predictionRegistry.getAll({
        ...filters,
        validated: true
      });

      if (predictions.length === 0) {
        return {
          sampleSize: 0,
          accuracy: null,
          confidence: { lower: 0, upper: 0 },
          breakdown: { success: 0, partial: 0, failure: 0, neutral: 0 }
        };
      }

      let successes = 0;
      let partials = 0;
      let failures = 0;
      let neutrals = 0;
      let weightedSum = 0;

      for (const prediction of predictions) {
        const outcomeType = prediction.outcome?.outcomeType;
        const score = getOutcomeScore(outcomeType);

        if (score === null) continue;

        switch (outcomeType) {
          case "success":
            successes += 1;
            break;
          case "partial":
            partials += 1;
            break;
          case "failure":
            failures += 1;
            break;
          case "neutral":
            neutrals += 1;
            break;
        }

        weightedSum += (score + 1) / 2;
      }

      const accuracy = weightedSum / predictions.length;
      const confidence = calculateWilsonInterval(predictions.length, accuracy);

      return {
        sampleSize: predictions.length,
        accuracy: Number((accuracy * 100).toFixed(2)),
        confidence,
        breakdown: {
          success: successes,
          partial: partials,
          failure: failures,
          neutral: neutrals
        }
      };
    },

    compareEngineLayers(questionType) {
      if (!questionType) {
        throw new TypeError("questionType is required");
      }

      const layers = ["tu_vi", "vedic", "western", "combined"];
      const results = {};

      for (const layer of layers) {
        results[layer] = this.calculateAccuracy({
          questionType,
          engineLayer: layer
        });
      }

      return results;
    },

    analyzeFactors(questionType) {
      if (!questionType) {
        throw new TypeError("questionType is required");
      }

      const predictions = predictionRegistry.getAll({
        questionType,
        validated: true
      });

      if (predictions.length === 0) {
        return [];
      }

      const factorStats = {};

      for (const prediction of predictions) {
        const outcomeType = prediction.outcome?.outcomeType;
        const score = getOutcomeScore(outcomeType);
        if (score === null) continue;

        const isSuccess = outcomeType === "success" || outcomeType === "partial";

        const factors = prediction.factors ?? [];
        for (const factor of factors) {
          if (!factorStats[factor]) {
            factorStats[factor] = { success: 0, total: 0, scoreSum: 0 };
          }

          factorStats[factor].total += 1;
          factorStats[factor].scoreSum += (score + 1) / 2;
          if (isSuccess) {
            factorStats[factor].success += 1;
          }
        }
      }

      return Object.entries(factorStats)
        .map(([factor, stats]) => ({
          factor,
          successRate: Number((stats.success / stats.total).toFixed(3)),
          avgScore: Number((stats.scoreSum / stats.total).toFixed(3)),
          sampleSize: stats.total,
          correlation: Number((stats.success / stats.total - 0.5).toFixed(3))
        }))
        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    },

    recommendWeightAdjustments(options = {}) {
      const minSampleSize = options.minSampleSize ?? 10;
      const minCorrelation = options.minCorrelation ?? 0.2;
      const questionTypes = options.questionTypes ?? [
        "career_timing",
        "synastry",
        "electional",
        "location"
      ];

      const recommendations = [];

      for (const questionType of questionTypes) {
        const layerComparison = this.compareEngineLayers(questionType);

        const validLayers = Object.entries(layerComparison).filter(
          ([, data]) => data.sampleSize >= minSampleSize
        );

        if (validLayers.length > 0) {
          const sorted = validLayers.sort((a, b) => b[1].accuracy - a[1].accuracy);
          const bestLayer = sorted[0];

          if (bestLayer[1].accuracy > 70) {
            recommendations.push({
              questionType,
              action: "increase_weight",
              target: bestLayer[0],
              currentAccuracy: bestLayer[1].accuracy,
              sampleSize: bestLayer[1].sampleSize,
              confidence: bestLayer[1].confidence,
              priority: "high"
            });
          }

          const worstLayer = sorted[sorted.length - 1];
          if (worstLayer[1].accuracy < 40 && worstLayer[1].sampleSize >= minSampleSize) {
            recommendations.push({
              questionType,
              action: "decrease_weight",
              target: worstLayer[0],
              currentAccuracy: worstLayer[1].accuracy,
              sampleSize: worstLayer[1].sampleSize,
              confidence: worstLayer[1].confidence,
              priority: "medium"
            });
          }
        }

        const factorAnalysis = this.analyzeFactors(questionType);
        const strongFactors = factorAnalysis.filter(
          (f) => f.sampleSize >= 5 && Math.abs(f.correlation) >= minCorrelation
        );

        for (const factor of strongFactors) {
          recommendations.push({
            questionType,
            action: factor.correlation > 0 ? "emphasize_factor" : "deemphasize_factor",
            factor: factor.factor,
            correlation: factor.correlation,
            sampleSize: factor.sampleSize,
            priority: Math.abs(factor.correlation) > 0.3 ? "high" : "medium"
          });
        }
      }

      return recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    },

    generateReport(options = {}) {
      const questionTypes = options.questionTypes ?? [
        "career_timing",
        "synastry",
        "electional",
        "location"
      ];

      const report = {
        generatedAt: Date.now(),
        overview: {
          totalPredictions: predictionRegistry.count(),
          validatedPredictions: predictionRegistry.count({ validated: true }),
          pendingValidation: predictionRegistry.count({ validated: false })
        },
        accuracyByType: {},
        engineComparison: {},
        recommendations: this.recommendWeightAdjustments(options)
      };

      for (const questionType of questionTypes) {
        report.accuracyByType[questionType] = this.calculateAccuracy({ questionType });
        report.engineComparison[questionType] = this.compareEngineLayers(questionType);
      }

      return report;
    }
  };
}
