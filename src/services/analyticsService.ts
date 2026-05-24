/**
 * Analytics Event Tracking Service
 *
 * Provides a unified interface for tracking user interactions, page views,
 * and system events. Currently logs to console in development and can be
 * extended to support Google Analytics, Mixpanel, or custom backends.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEventName =
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'error_occurred'
  | 'lunar_date_change'
  | 'engine_calculation'
  | 'theme_toggle'
  | 'font_size_change'
  | 'locale_change';

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | null | undefined>;
}

export interface AnalyticsError {
  message: string;
  stack?: string;
  componentStack?: string;
  fatal?: boolean;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize the analytics service.
   * Call this in your app entry point (main.tsx).
   */
  public init(): void {
    if (this.initialized) return;

    if (import.meta.env.DEV) {
      console.debug('📊 [Analytics] Initialized in development mode.');
    }

    // Initialize third-party SDKs here (e.g., gtag, mixpanel)

    this.initialized = true;
  }

  /**
   * Track a general event.
   */
  public trackEvent(event: AnalyticsEvent): void {
    const { name, properties } = event;

    if (import.meta.env.DEV) {
      console.debug(`📊 [Analytics] Event: ${name}`, properties || '');
    }

    // Send to external providers
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, properties);
    }
  }

  /**
   * Track a page view.
   */
  public trackPageView(path: string, title?: string): void {
    this.trackEvent({
      name: 'page_view',
      properties: {
        path,
        title,
      },
    });

    // Specific gtag page_view tracking if needed
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_ID, {
        page_path: path,
        page_title: title,
      });
    }
  }

  /**
   * Track an error.
   */
  public trackError(error: AnalyticsError): void {
    if (import.meta.env.DEV) {
      console.error(`📊 [Analytics] Error: ${error.message}`, error);
    }

    this.trackEvent({
      name: 'error_occurred',
      properties: {
        message: error.message,
        fatal: error.fatal ?? false,
      },
    });

    // Send to error tracking service like Sentry or Google Analytics exceptions
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: error.fatal ?? false,
      });
    }
  }
}

export const analytics = AnalyticsService.getInstance();
