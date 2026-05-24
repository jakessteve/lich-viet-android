/**
 * Web Vitals Reporter — Core Web Vitals monitoring.
 *
 * Tracks LCP, FID, CLS, FCP, TTFB using the `web-vitals` library.
 * Call `initWebVitals()` once in your app entry point.
 *
 * Currently logs to console; replace `sendToAnalytics` with your
 * analytics endpoint when ready.
 *
 * @example
 * ```ts
 * // In main.tsx:
 * import { initWebVitals } from '@/utils/webVitals';
 * initWebVitals();
 * ```
 */

import { analytics } from '@/services/analyticsService';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Send metric data to analytics backend.
 */
function sendToAnalytics(metric: WebVitalMetric): void {
  // ── Development: console logging ──
  const emoji = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴';
  console.debug(`${emoji} [Web Vitals] ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);

  // ── Unified Analytics Service ──
  analytics.trackEvent({
    name: 'engine_calculation',
    properties: {
      metric_name: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      rating: metric.rating,
      id: metric.id,
      category: 'web_vitals',
    },
  });
}

/**
 * Initialize Core Web Vitals monitoring.
 * Dynamically imports `web-vitals` to avoid adding to initial bundle.
 */
export async function initWebVitals(): Promise<void> {
  try {
    // Dynamic import — no compile-time dependency on web-vitals

    const vitals = await (Function('return import("web-vitals")')() as Promise<
      Record<string, (cb: (metric: WebVitalMetric) => void) => void>
    >);

    vitals.onCLS(sendToAnalytics);
    vitals.onFID(sendToAnalytics);
    vitals.onLCP(sendToAnalytics);
    vitals.onFCP(sendToAnalytics);
    vitals.onTTFB(sendToAnalytics);
  } catch {
    // web-vitals not installed — silently skip
    console.debug('[Web Vitals] Library not available. Install with: npm i web-vitals');
  }
}
