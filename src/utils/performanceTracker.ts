/**
 * Performance Instrumentation & Metrics Tracker
 *
 * Provides lightweight execution timing and profiling for core metaphysical engines,
 * calendar calculations, and cold-start lifecycle phases.
 */

import { analytics } from '@/services/analyticsService';

export interface PerformanceTimingResult {
  metricName: string;
  durationMs: number;
  metadata?: Record<string, string | number | boolean>;
}

const HAS_PERF = typeof window !== 'undefined' && typeof window.performance !== 'undefined';

/**
 * Record a synchronous engine or component operation with high-resolution performance timer.
 */
export function measureSync<T>(
  metricName: string,
  fn: () => T,
  metadata?: Record<string, string | number | boolean>,
): T {
  const start = HAS_PERF ? performance.now() : Date.now();
  const startMark = `${metricName}_start`;
  const endMark = `${metricName}_end`;

  if (HAS_PERF && typeof performance.mark === 'function') {
    performance.mark(startMark);
  }

  try {
    return fn();
  } finally {
    const end = HAS_PERF ? performance.now() : Date.now();
    const durationMs = Math.round((end - start) * 100) / 100;

    if (HAS_PERF && typeof performance.mark === 'function' && typeof performance.measure === 'function') {
      performance.mark(endMark);
      try {
        performance.measure(metricName, startMark, endMark);
      } catch {
        // Safe fallback if mark was cleared
      }
    }

    if (import.meta.env?.DEV) {
      const color = durationMs > 50 ? 'color: #ff4d4f' : durationMs > 16 ? 'color: #faad14' : 'color: #52c41a';
      console.debug(`⏱️ [Perf] %c${metricName}: ${durationMs}ms`, color, metadata || '');
    }

    // Forward slow engine runs to analytics in production
    if (durationMs > 30) {
      analytics.trackEvent({
        name: 'engine_calculation',
        properties: {
          metric_name: metricName,
          value: Math.round(durationMs),
          category: 'engine_perf',
          ...(metadata || {}),
        },
      });
    }
  }
}

/**
 * Record an asynchronous engine operation with high-resolution performance timer.
 */
export async function measureAsync<T>(
  metricName: string,
  fn: () => Promise<T>,
  metadata?: Record<string, string | number | boolean>,
): Promise<T> {
  const start = HAS_PERF ? performance.now() : Date.now();

  try {
    return await fn();
  } finally {
    const end = HAS_PERF ? performance.now() : Date.now();
    const durationMs = Math.round((end - start) * 100) / 100;

    if (import.meta.env?.DEV) {
      const color = durationMs > 100 ? 'color: #ff4d4f' : durationMs > 30 ? 'color: #faad14' : 'color: #52c41a';
      console.debug(`⏱️ [Async Perf] %c${metricName}: ${durationMs}ms`, color, metadata || '');
    }

    if (durationMs > 50) {
      analytics.trackEvent({
        name: 'engine_calculation',
        properties: {
          metric_name: metricName,
          value: Math.round(durationMs),
          category: 'engine_perf_async',
          ...(metadata || {}),
        },
      });
    }
  }
}
