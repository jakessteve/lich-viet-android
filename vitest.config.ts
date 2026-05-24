import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Sub-packages MUST come before the base alias to prevent prefix match collision
      { find: '@lich-viet/core/calendar', replacement: path.resolve(__dirname, 'packages/core/src/calendar/index.ts') },
      { find: '@lich-viet/core/dungsu', replacement: path.resolve(__dirname, 'packages/core/src/dungsu/index.ts') },
      { find: '@lich-viet/core/maihoa', replacement: path.resolve(__dirname, 'packages/core/src/maihoa/index.ts') },
      { find: '@lich-viet/core/fengshui', replacement: path.resolve(__dirname, 'packages/core/src/fengshui/index.ts') },
      { find: '@lich-viet/core/qmdj', replacement: path.resolve(__dirname, 'packages/core/src/qmdj/index.ts') },
      { find: '@lich-viet/core/thaiAt', replacement: path.resolve(__dirname, 'packages/core/src/thaiAt/index.ts') },
      { find: '@lich-viet/core/lucNham', replacement: path.resolve(__dirname, 'packages/core/src/lucNham/index.ts') },
      { find: '@lich-viet/core/tamThuc', replacement: path.resolve(__dirname, 'packages/core/src/tamThuc/index.ts') },
      // Base package alias
      { find: '@lich-viet/core', replacement: path.resolve(__dirname, 'packages/core/src/index.ts') },
      // App-level alias
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/types/**',
        'src/data/**',
      ],
      thresholds: {
        // Phase 3 Sprint 1 thresholds — baseline: Stmts 41%, Branch 30%, Fn 32%, Lines 42%
        // Target: 90% per engine. Raise incrementally each sprint.
        lines: 40,
        functions: 30,
        branches: 28,
        statements: 40,
        perFile: false, // Enable per-file in Sprint 2 once engines pass individually
      },
    },
  },
});
