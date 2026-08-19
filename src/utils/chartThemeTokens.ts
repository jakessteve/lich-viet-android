/**
 * Chart Theme Tokens
 * Harmonizes SVG, Canvas, and WebGL charts with the design system CSS tokens.
 */

export interface ChartPalette {
  primary: string;
  gold: string;
  good: string;
  bad: string;
  info: string;
  purple: string;
  orange: string;
}

export const CHART_THEME_TOKENS = {
  // Elements (Five Elements & Western 4 Elements)
  elements: {
    fire: '#ef4444', // Hỏa / Fire
    earth: '#f59e0b', // Thổ / Earth
    metal: '#64748b', // Kim / Metal
    water: '#3b82f6', // Thủy / Water
    wood: '#10b981', // Mộc / Wood
    air: '#06b6d4', // Phong / Air
  },

  // Western Planets
  planets: {
    sun: '#f59e0b',
    moon: '#8b5cf6',
    mercury: '#eab308',
    venus: '#10b981',
    mars: '#ef4444',
    jupiter: '#f97316',
    saturn: '#6366f1',
    uranus: '#06b6d4',
    neptune: '#3b82f6',
    pluto: '#ec4899',
  },

  // Synastry Compatibility Dimensions
  synastry: {
    emotional: '#ec4899',
    chemistry: '#f43f5e',
    intellect: '#3b82f6',
    stability: '#10b981',
    complement: '#8b5cf6',
  },

  // Polarities
  polarities: {
    harmonious: 'var(--color-good, #059669)',
    neutral: 'var(--color-info, #2563eb)',
    tension: 'var(--color-bad, #dc2626)',
  },
};

/**
 * Get color tone for a compatibility/auspicious score (0 - 100)
 */
export function getScoreToneColor(score: number): string {
  if (score >= 70) return '#10b981'; // Green
  if (score >= 45) return '#f59e0b'; // Amber
  return '#ef4444'; // Crimson
}
