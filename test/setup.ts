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

// Mock window.gtag
Object.defineProperty(global, 'window', {
  value: {
    ...globalThis,
    gtag: vi.fn(),
    location: { pathname: '/' },
  },
  writable: true,
});

// Mock navigator.language for locale detection
Object.defineProperty(global, 'navigator', {
  value: {
    language: 'vi-VN',
  },
  writable: true,
});
