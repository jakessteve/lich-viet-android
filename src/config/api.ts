/**
 * Centralized API & External Resource Configuration
 *
 * All API endpoints, CDN URLs, and external service URLs are defined here
 * as a single source of truth. Supports environment variable overrides
 * for different deployment environments.
 *
 * Usage: import { API_CONFIG } from '@/config/api';
 */

// ── Holidays & Geo IP APIs ────────────────────────────────────
export const HOLIDAYS_CONFIG = {
  nagerApiBase: import.meta.env.VITE_NAGER_URL || 'https://date.nager.at/api/v3',
  geoIpUrl: import.meta.env.VITE_GEOIP_URL || 'https://ipapi.co/json/',
  /** Geo cache TTL in ms (24 hours) */
  geoCacheTtlMs: 24 * 60 * 60 * 1000,
  /** Geo IP request timeout in ms */
  geoTimeoutMs: 5000,
} as const;

// ── App Identity ──────────────────────────────────────────────
export const APP_CONFIG = {
  name: 'LichViet',
  version: '3.0.0',
  get userAgent() {
    return `${this.name}/${this.version}`;
  },
  githubUrl: 'https://github.com/minhcopilot/Lich-Viet',
} as const;
