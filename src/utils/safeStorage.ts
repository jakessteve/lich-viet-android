/**
 * Production-hardened LocalStorage utility with Prototype Pollution protection (DIR-09)
 * and non-blocking asynchronous diagnostic telemetry warnings (DIR-08).
 */

export function safeWarn(event: string, context?: Record<string, unknown>): void {
  // DIR-08: Use queueMicrotask to ensure diagnostic logging never blocks UI/render thread
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(() => {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(`[SafeStorage Warning] ${event}`, context);
      }
    });
  }
}

/**
 * Checks for Prototype Pollution keys in parsed JSON objects (DIR-09).
 */
export function sanitizeParsedJson<T = unknown>(data: unknown): T | null {
  if (data === null || typeof data !== 'object') {
    return data as T;
  }

  // Check dangerous keys directly on object
  if (
    Object.prototype.hasOwnProperty.call(data, '__proto__') ||
    Object.prototype.hasOwnProperty.call(data, 'constructor') ||
    Object.prototype.hasOwnProperty.call(data, 'prototype')
  ) {
    safeWarn('prototype_pollution_blocked', { keys: Object.keys(data as object) });
    return null;
  }

  return data as T;
}

export const safeStorage = {
  getItem<T = unknown>(key: string, defaultValue: T | null = null): T | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      const parsed = JSON.parse(raw);
      const sanitized = sanitizeParsedJson<T>(parsed);
      return sanitized !== null ? sanitized : defaultValue;
    } catch (err) {
      safeWarn('storage_parse_failed', { key, error: String(err) });
      return defaultValue;
    }
  },

  setItem<T = unknown>(key: string, value: T): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (err) {
      safeWarn('storage_write_failed', { key, error: String(err) });
      return false;
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (err) {
      safeWarn('storage_remove_failed', { key, error: String(err) });
    }
  },
};
