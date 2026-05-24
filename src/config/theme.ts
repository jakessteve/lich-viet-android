/**
 * Theme Configuration — Score Labels & Color Mappings
 *
 * Maps score tiers to display labels and CSS classes.
 * Separated from scoring logic to keep business rules
 * independent of presentation.
 */

export interface ScoreLabelConfig {
  label: string;
  colorClass: string;
}

/**
 * Score tier label definitions (ordered highest to lowest).
 * Used by activityScorer to map percentage → display label + color.
 */
export const SCORE_LABELS: readonly { minPercent: number; label: string; colorClass: string }[] = [
  { minPercent: 80, label: 'Đại Cát ✨', colorClass: 'text-emerald-600 dark:text-emerald-400' },
  { minPercent: 60, label: 'Tốt', colorClass: 'text-green-600 dark:text-green-400' },
  { minPercent: 40, label: 'Trung Bình', colorClass: 'text-amber-600 dark:text-amber-400' },
  { minPercent: 20, label: 'Không Tốt', colorClass: 'text-orange-600 dark:text-orange-400' },
  { minPercent: 0, label: 'Đại Kỵ ⚠️', colorClass: 'text-red-600 dark:text-red-400' },
] as const;

/**
 * Resolves a percentage score to its display label and CSS color class.
 */
export function getScoreLabelFromConfig(pct: number): ScoreLabelConfig {
  for (const tier of SCORE_LABELS) {
    if (pct >= tier.minPercent) {
      return { label: tier.label, colorClass: tier.colorClass };
    }
  }
  // Fallback (should not reach)
  return { label: 'Đại Kỵ ⚠️', colorClass: 'text-red-600 dark:text-red-400' };
}

/**
 * Fallback color class for cases where no activity is found.
 */
export const FALLBACK_COLOR_CLASS = 'text-amber-600 dark:text-amber-400';
