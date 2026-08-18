import { vi } from 'vitest';

// Mock localStorage for appStore and local persistence tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock import.meta.env for analyticsService
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        DEV: true,
        VITE_GA_ID: 'test-ga-id',
      },
    },
  },
});

// Mock window.gtag on existing window
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).gtag = vi.fn();
}

// Mock navigator.language for locale detection
if (typeof navigator !== 'undefined') {
  try {
    Object.defineProperty(navigator, 'language', {
      value: 'vi-VN',
      configurable: true,
    });
  } catch {
    // ignore
  }
}

// Mock window.matchMedia for JSDOM / React component testing
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
