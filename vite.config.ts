import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    compression({
      include: /\.(js|css|html|svg|json)$/,
      threshold: 1024, // Only compress files > 1KB
      deleteOriginalAssets: false,
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@swisseph/browser/dist/swisseph.wasm',
          dest: '.',
          rename: { stripBase: true },
        },
      ],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'fonts/**/*', 'swisseph.wasm'],
      manifest: {
        name: 'Lịch Việt — Âm Lịch & Phong Thủy',
        short_name: 'Lịch Việt',
        description: 'Tra cứu ngày âm lịch, la bàn phong thủy, giờ tốt xấu, gieo quẻ, và lập lá số Tử Vi.',
        theme_color: '#1a1a2e',
        background_color: '#0f0f1a',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'vi',
        categories: ['lifestyle', 'utilities'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,wasm}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lich-viet/core/calendar': path.resolve(__dirname, './packages/core/src/calendar/index.ts'),
      '@lich-viet/core/dungsu': path.resolve(__dirname, './packages/core/src/dungsu/index.ts'),
      '@lich-viet/core/maihoa': path.resolve(__dirname, './packages/core/src/maihoa/index.ts'),
      '@lich-viet/core/fengshui': path.resolve(__dirname, './packages/core/src/fengshui/index.ts'),
      '@lich-viet/core/qmdj': path.resolve(__dirname, './packages/core/src/qmdj/index.ts'),
      '@lich-viet/core/thaiAt': path.resolve(__dirname, './packages/core/src/thaiAt/index.ts'),
      '@lich-viet/core/lucNham': path.resolve(__dirname, './packages/core/src/lucNham/index.ts'),
      '@lich-viet/core/tamThuc': path.resolve(__dirname, './packages/core/src/tamThuc/index.ts'),
      '@lich-viet/core': path.resolve(__dirname, './packages/core/src/index.ts'),
      '@lich-viet/types': path.resolve(__dirname, './packages/types/src/index.ts'),
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    sourcemap: 'hidden', // Generate source maps for error reporting but don't expose to browser
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React runtime
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          // Validation
          if (id.includes('node_modules/zod')) {
            return 'vendor-zod';
          }
          // Data & Interpretation Domain Splitting
          if (id.includes('/src/data/qmdj/') || id.includes('/services/qmdj/')) return 'data-qmdj';
          if (id.includes('/src/data/lucNham/') || id.includes('/services/lucNham/')) return 'data-lucnham';
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
});
