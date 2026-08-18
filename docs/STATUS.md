# Project Status & Source of Truth (SOT)

> **Version:** 3.4.0 | **Updated:** August 2026  
> **Status:** Stable / Production-Ready / Fully Integrated & Unified UI/UX  
> **Test Baseline:** 102 Vitest Suites (696 tests) + 4 Backend Suites (22 tests) = **718 / 718 Passed (100%)**

---

## 1. System Health & Quality Gate Summary

| Gate | Target / Threshold | Current Value | Status |
|---|---|---|---|
| **TypeScript Typecheck** | Zero errors with `strict: true` | `tsc --noEmit`: **0 errors** | ✅ GREEN |
| **Frontend & Unit Tests** | 100% passing suites | **102/102 files, 696/696 tests** | ✅ GREEN |
| **Backend Fastify E2E** | 100% passing routes | **4 files, 22/22 tests** | ✅ GREEN |
| **Live SDK Socket Tests** | Real HTTP integration | **5/5 live socket tests** | ✅ GREEN |
| **Web Production Bundle** | Clean Vite + PWA build | **Built in ~6.7s** | ✅ GREEN |
| **Android Debug APK** | Assembled via Gradle | **8.2 MB** (`app-debug.apk`) | ✅ GREEN |
| **Android Release APK** | Assembled via Gradle | **7.4 MB** (`app-release-unsigned.apk`) | ✅ GREEN |

---

## 2. Active Package & Monorepo Architecture

```text
lich-viet-android/
├── packages/
│   ├── api-client/          # TypeScript HTTP Client SDK (LichVietApiClient)
│   ├── app-backend/         # NestJS 11 + Fastify backend microservice
│   ├── contracts/           # Zero-dependency shared API DTOs and interfaces
│   ├── core/                # Core calculation facades (@lich-viet/core/*)
│   ├── core-logic/          # Metaphysical math & astronomical computation
│   ├── canonical-db/        # Historical data, stars, and timezones
│   ├── swisseph-wasm/       # Swiss Ephemeris WebAssembly engine
│   └── types/               # Shared domain TypeScript interfaces
├── src/                     # React 19 Client SPA
│   ├── components/          # Feature slices (Calendar, TuVi, Astrology, DamGio, etc.)
│   ├── gateways/            # Gateway Abstraction Layer (remote / demo runtimes)
│   ├── stores/              # Zustand state stores (app, auth, damGio, tuvi, vault)
│   ├── services/            # Pure domain services (astrology, astronomy, tuvi)
│   └── utils/               # Math, calendar, and divination algorithms
└── android/                 # Capacitor Android native project shell
```

---

## 3. Implemented Capabilities & Surfaces

### A. Calendar & Ancestral Management
- **Âm Lịch & Dụng Sự:** Solar/lunar conversion, Can Chi, Tiết Khí, Hoàng Đạo/Hắc Đạo, 28 Tú, 12 Trực, and personalized auspiciousness scoring.
- **Sổ Đám Giỗ (Ancestral Anniversaries):** Lunar-date tracking, lead-time alarm reminders, full CRUD, and cross-device sync.
- **Ngày Tốt (Electional Astrology):** Auspicious date scanner across customizable ranges and personal birth charts.

### B. Divination & Metaphysical Suite
- **Gieo Quẻ Mai Hoa Dịch Số:** Upper/lower trigrams, moving lines, dynamic hexagram transformations, and elemental analysis.
- **Tam Thức Phối Hợp:** Unified calculation suite integrating Kỳ Môn Độn Giáp (9 Cung, 8 Cửa, 9 Sao), Thái Ất Thần Kinh, and Đại Lục Nhâm (Tứ Khóa, Tam Truyền).

### C. Astrological Sciences
- **Tử Vi Đẩu Số (Nam Phái & Thiên Lương):** 12-palace grid, true-solar correction, Tam Phương Tứ Chính, Cung Vô Chính Diệu, and high-resolution SVG export.
- **Chiêm Tinh Tây Phương (Western Natal & Transits):** Placidus/Whole Sign houses, aspect matrices, sect, dignities, and SVG wheel rendering.
- **Chiêm Tinh Ấn Độ (Vedic Jyotish):** Lahiri ayanamsha, Nakshatras, Pada, Atmakaraka, Vimshottari dasha, and South/North Indian charts.
- **Hợp Lá Số (Synastry):** Multi-wheel overlay and compatibility scoring.

### D. Client-Server Synchronization & Gateway
- **Gateway Abstraction:** Decoupled `RuntimeContext` supporting zero-latency local-first demo mode and live remote NestJS backend.
- **Delta Sync Protocol:** Incremental synchronization via `/v1/sync` with server watermarking and mutation acknowledgments.
- **Cloud Backup:** Automated profile and anniversary backup directly from the Settings page.

### E. Design System & Ergonomics Standards (v3.4.0)
- **Unified Semantic Tokens:** 7 core palette tokens (`good`, `bad`, `gold`, `purple`, `orange`, `info`, `primary`) and standardized surface hierarchy.
- **Pure SVG Icon Architecture:** 100% Lucide SVG icons with zero font dependency, eliminated `material-icons-round.woff2` payload (150KB+ bandwidth saved, zero FOUT/layout shift).
- **Accessible Sub-Navigation (`SubNavTabs`):** Touch-target ergonomics (min 44px), ARIA-compliant tablists, spring-press physics across Election, Mai Hoa, and Chiem Tinh pages.
- **Unified Birth Form & Progressive Disclosure:** `UnifiedBirthDataPicker` centralized profile prefill, solar/lunar auto-conversion, and layered collapsible expert settings.

---

## 4. Operational Commands & Scripts

- `npm run dev`: Start local Vite dev server.
- `npm run start:backend`: Start NestJS Fastify backend server.
- `npm test`: Run full Vitest frontend suite and NestJS Fastify backend test suite.
- `npm run test:fe`: Run Vitest suites only.
- `npm run test:backend`: Run backend E2E test suite with experimental decorators.
- `npm run typecheck`: Run strict TypeScript compiler verification (`tsc --noEmit`).
- `npm run build:web`: Build production web bundle and PWA service worker.
- `npm run cap:sync`: Synchronize web assets to Capacitor Android project.
- `npm run android:build`: Build debug APK (`./gradlew assembleDebug`).
- `npm run android:release`: Build release APK (`./gradlew assembleRelease`).
