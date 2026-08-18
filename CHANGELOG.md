# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.3.0] - 2026-08-18

### Frontend & Backend Integration Unification
- **NestJS Fastify Microservice (`packages/app-backend`)**:
  - Implemented `AuthModule` (`/v1/auth/login`, `/v1/auth/register`, `/v1/auth/social`), `UsersModule` (`/v1/users/me`), `DamGioModule` (`/v1/dam-gio`), `CalendarModule` event handlers (`/v1/calendar/events`), and `SyncModule` (`/v1/sync`).
- **Client SDK & Contracts Alignment**:
  - Synchronized `@lich-viet/api-client` endpoints and method definitions with Fastify routing conventions. Added calculations, social login, and delta synchronization.
- **Frontend Stores & Features**:
  - Created `useDamGioStore.ts` and `DamGioModal.tsx` for ancestral death anniversaries with lunar calculations.
  - Added "Đồng bộ đám mây" card to `SettingsPage.tsx` with animated manual sync trigger.
  - Refactored `useAuthStore.ts` and `useProfileVaultStore.ts` to integrate with the Gateway layer.
- **Verification & Automation**:
  - Added live HTTP socket test suite (`test/api-client/api-client-live-backend.test.ts`).
  - Total test coverage: **104 test files / 714 tests (100% passing)**.
  - Rebuilt Android Debug APK (11.4 MB) and Release APK (9.4 MB).

---

## [3.2.0] - 2026-08-16

### Astrological Engines & Cross-Synthesis
- **Western Astrology Synthesis**: Sect detection, essential dignities, dynamic house rulership, and aspect patterns.
- **Vedic Jyotish Synthesis**: Nakshatra, Pada, Atmakaraka, Vimshottari dasha, and Bhava matrix.
- **Tri-System Dialectical Synthesis**: Multi-layer synthesis combining Western + Tử Vi + Vedic.

---

## [3.1.0] - 2026-08-14

### Architecture & Quality Modernization
- **Wave 1 Stabilization Complete**: 100% green test suite.
- **Tử Vi Engine & UI**: Restored Thiên Lương / Nam Phái star placement routines, 14 major stars, auxiliary rings, and Hạn calculations. Implemented full dynamic Dark Mode theme support for the 4×4 chart table.
- **Historical Time Normalization**: Restored historical Vietnam timezone periods (1906–present).
- **Location-Aware Ephemeris**: Restored `@swisseph/browser` WASM astronomical layer with true-solar civil time correction.
- **Production Builds**: Validated clean Vite production build and produced fresh Android APK (`v3.1.0`).

---

## [3.0.0] - 2026-05-10

### Major Changes
- **Refactored** from monolith to modular SPA with dedicated `@lich-viet/core` facades.
- **Created** `packages/core` barrel exports for `@lich-viet/core/*` aliases.
- **Streamlined** global state management using lightweight Zustand stores.
