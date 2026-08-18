# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [3.3.0] - 2026-08-18

### Added
- **Full NestJS Fastify Microservice Backend (`packages/app-backend`)**:
  - `AuthModule`: Implemented `/v1/auth/login`, `/v1/auth/register`, and `/v1/auth/social` with secure credential hashing and JWT token issuance.
  - `UsersModule`: Implemented `/v1/users/me` (GET and PATCH) for profile management.
  - `DamGioModule`: Implemented complete CRUD for ancestral death anniversaries (`/v1/dam-gio`).
  - `CalendarModule` Event Handlers: Implemented `/v1/calendar/events` (GET, POST, DELETE) for ritual and personal events.
  - `SyncModule`: Implemented incremental delta synchronization (`POST /v1/sync`) supporting mutation batching, watermark timestamps, and conflict acknowledgments.
- **Client SDK & API Contract Unification (`@lich-viet/api-client` & `@lich-viet/contracts`)**:
  - Aligned all API endpoints with Fastify specifications (`/v1/tu-vi/chart`, `/v1/astrology/western`, `/v1/astrology/vedic`, `/v1/divination/mai-hoa`, `/v1/divination/tam-thuc`, `/v1/calendar/dung-su/catalog`, `/v1/election/scan`).
  - Added complete client methods: `calculateSynastry`, `calculateTamThuc`, `getDungSuCatalog`, `getDungSuScore`, `loginWithSocial`, `updateProfile`, `deleteCalendarEvent`.
  - Dynamic `Content-Type` header resolution preventing 400 errors on empty-body requests (e.g. `DELETE`).
- **Frontend Stores & UI Integrations**:
  - Created `useDamGioStore.ts` with local caching and Gateway synchronization.
  - Created `DamGioModal.tsx` for ancestral anniversary management with lunar date calculations, triggered via the "Sổ Giỗ" button in `DetailedDayView.tsx`.
  - Added "Đồng bộ đám mây" (Cloud Sync & Backup) card in `SettingsPage.tsx` with animated manual sync trigger and timestamp tracking.
  - Updated `useAuthStore.ts` to seamlessly delegate to `getRuntime().auth` with local fallback.
  - Added `syncWithCloud` to `useProfileVaultStore.ts`.
- **E2E & Unit Test Advancements**:
  - Added live Fastify HTTP socket test suite (`test/api-client/api-client-live-backend.test.ts`).
  - Extended backend E2E test suite to 22 tests (`packages/app-backend/test/backend-e2e-api.test.js`).
  - Total test coverage reached **104 test files / 714 tests (100% green)**.
- **Root Build & Automation Scripts**:
  - Added `npm run test:backend` and `npm run test:fe`.
  - Updated `npm test` to execute both Vitest and backend Node test runner.
  - Successfully produced clean Web bundle, Android Debug APK (11.4 MB), and Android Release APK (9.4 MB).

---

## [3.2.0] - 2026-08-16

### Added
- **High-Precision Calculation-Grounded Western Astrology Synthesis Engine (`westernSynthesisEngine.ts`)**:
  - Diurnal vs. Nocturnal sect classification, sect lights, and sect comfort modifiers.
  - Essential dignity evaluation (*Cư Miếu, Đắc Vượng, Hãm Địa, Tuyệt Địa, Tự Do*).
  - Dynamic House Rulership synthesis.
  - Ascendant Chart Ruler deep life vector synthesis.
  - Solilunar aspects & birth Moon phase contextual readings.
  - Aspect pattern syntheses (Grand Trine, T-Square, Stellium, etc.) and element/modality balance.
- **Vedic Jyotish Holistic Synthesis Engine (`vedicSynthesisEngine.ts`)**:
  - Janma Nakshatra (27 constellations) & Pada (4 quarters) with ruling deities and *Purusharthas*.
  - Atmakaraka (soul planet) calculation & *Purva Punya* soul growth lessons.
  - Detected Vedic Yogas & Doshas integration (*Gajakesari, Pancha Mahapurusha, Raja Yogas, Budhaditya*).
  - Active Vimshottari Dasha 10-year planetary timeline calculation.
  - Bhava distribution matrix.
- **Dialectical Tri-System Cross-Synthesizer (`dialecticalSynthesis.ts`)**:
  - Unified multi-layered synthesis connecting Western Social Persona + Tử Vi Circumstantial Reality + Vedic Soul Core.

---

## [3.1.1] - 2026-08-15

### Added
- **Personalized Tử Vi Palace Interpretation Engine (SCTE)**:
  - Deep Tam Phương Tứ Chính & Hội Chiếu analysis.
  - Contextual Cung Vô Chính Diệu interpretation.
  - Empathetic action guidance and Tuần/Triệt timing advice.

---

## [3.1.0] - 2026-08-14

### Added
- Comprehensive test suite stabilization.
- Full historical Vietnam timezone period resolution (1906–present).
- Swiss Ephemeris WASM true-solar time correction layer.
- Restored Western wheel SVG geometry and Vedic D9 Navamsha calculations.
- Clean production Vite build and service worker precaching.
- Complete dark mode theme support for the 4×4 Tử Vi chart table.
