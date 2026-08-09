import { createScoringMetrics } from "../../contracts/src/index.js";

export const DEFAULT_TOPSIS_WEIGHTS = Object.freeze({
  eastern: 0.4,
  western: 0.4,
  vedic: 0.2
});

export function normalizeVedicScore(vedicScore, maxScore = 36) {
  if (!Number.isFinite(vedicScore) || !Number.isFinite(maxScore) || maxScore <= 0) {
    throw new TypeError("vedicScore and maxScore must be finite numbers, and maxScore must be > 0");
  }

  return (vedicScore / maxScore) * 100;
}

export function computeWeightedScore(input, options = {}) {
  const weights = {
    ...DEFAULT_TOPSIS_WEIGHTS,
    ...(options.weights ?? {})
  };

  if (input.isShortCircuited) {
    return createScoringMetrics({
      totalScore: 0,
      easternScore: input.easternScore ?? 0,
      westernScore: input.westernScore ?? 0,
      vedicScore: input.vedicScore ?? 0,
      isShortCircuited: true,
      reason: input.reason ?? "short_circuited"
    });
  }

  const vedicScaleMax = options.vedicScaleMax ?? 36;
  const weightedCriteria = [
    normalizeVedicScore(input.easternScore, 100) * weights.eastern,
    normalizeVedicScore(input.westernScore, 100) * weights.western,
    normalizeVedicScore(input.vedicScore, vedicScaleMax) * weights.vedic
  ];
  const idealBest = [weights.eastern * 100, weights.western * 100, weights.vedic * 100];
  const distanceToBest = Math.sqrt(
    weightedCriteria.reduce((sum, value, index) => sum + (value - idealBest[index]) ** 2, 0)
  );
  const distanceToWorst = Math.sqrt(weightedCriteria.reduce((sum, value) => sum + value ** 2, 0));
  const totalScore =
    distanceToBest + distanceToWorst === 0
      ? 0
      : (distanceToWorst / (distanceToBest + distanceToWorst)) * 100;

  return createScoringMetrics({
    totalScore: Number(totalScore.toFixed(2)),
    easternScore: input.easternScore,
    westernScore: input.westernScore,
    vedicScore: input.vedicScore,
    isShortCircuited: false
  });
}
