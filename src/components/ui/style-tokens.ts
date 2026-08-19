/**
 * Shared Design System Style Tokens for Lịch Việt
 * 
 * Provides consistent class mappings for card surfaces, borders, typography,
 * and badge/tone styling.
 */

export const cardStyles = {
  base: 'rounded-3xl bg-surface-light dark:bg-surface-elevated-dark border border-border-light/60 dark:border-border-dark/60 shadow-sm transition-all duration-200',
  glass: 'rounded-3xl bg-surface-light/80 dark:bg-surface-elevated-dark/80 backdrop-blur-md border border-border-light/50 dark:border-border-dark/50 shadow-sm',
  highlight: 'rounded-3xl bg-gold/5 dark:bg-gold-dark/5 border border-gold/30 dark:border-gold-dark/30 shadow-md',
};

export const typographyStyles = {
  sectionHeader: 'text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark',
  subtle: 'text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark',
  primary: 'text-text-primary-light dark:text-text-primary-dark',
};

export const toneStyles = {
  good: 'text-good dark:text-good-dark',
  bad: 'text-bad dark:text-bad-dark',
  warning: 'text-orange dark:text-orange-dark',
  gold: 'text-gold dark:text-gold-dark',
  purple: 'text-purple dark:text-purple-dark',
};
