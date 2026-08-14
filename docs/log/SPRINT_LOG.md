# Sprint Log

Record of sprint reviews and progress summaries.

## Template

### Sprint [N] — [Date Range]

**Goal**: [Sprint goal]

**Completed**:
- [Item 1]
- [Item 2]

**Carried Over**:
- [Item 1] — Reason: [why]

**Metrics**:
| Metric | Value |
|--------|-------|
| Stories completed | X/Y |
| Test coverage delta | +/- N% |
| Bugs found/fixed | X/Y |

**Retrospective**:
- What went well: [item]
- What to improve: [item]
- Action items: [item]

---

## Sprint History

### Sprint 1 (Wave 1) — 2026-08-14

**Goal**: Full Architectural Review, Modernization Roadmap Formulation, and Wave 1 Test Suite Stabilization (100% Green Baseline).

**Completed**:
- Restored `timeNormalization.ts` historical periods table and Can-Chi helper functions.
- Restored `personalDayScore.ts` calculation logic and Chi relationship scoring.
- Restored `calendarEngine.ts` Swiss location-aware caching.
- Restored `swissEphemeris.ts` and `birthContext.ts` true solar time and leap month resolution.
- Restored `WesternWheelChart.tsx` SVG geometry and theming.
- Restored `starPlacement.ts` and `src/services/tuvi/index.ts` barrel exports.
- Configured `eslint.config.mjs` for package compatibility and fixed type errors.

**Metrics**:
| Metric | Value |
|---|---|
| Test Suites Passing | 59 / 59 (100%) |
| Tests Passing | 463 / 463 (100%) |
| TypeScript Typecheck | 0 errors |
| ESLint Static Analysis | 0 errors |
| Build Duration | 8.60s |

**Retrospective**:
- What went well: Fast isolation of test failures; preservation of high-precision math without regressions.
- What to improve: Monorepo package boundaries should be cleanly segregated to prevent TS/JS mismatch.
- Action items: Proceed to Wave 2 (Monorepo Package Boundary Consolidation).

---

### Sprint 2 — 2026-08-14

**Goal**: Userflow Optimization, Landing Page Scroll Performance, Dark Mode Adaptation, and Fresh Android APK Release.

**Completed**:
- Connected Synastry profile auto-seeding from authenticated user store.
- Deep-linked 14-day auspicious date searches from Day Detail to `/app/ngay-tot`.
- Added cross-module exploration bars across Tử Vi, Western Astrology, and Vedic Astrology.
- Categorized mobile navigation drawer into 3 clear thematic groups.
- Resolved landing page rapid scroll flicker by extracting 60fps count-up state to isolated leaf component, fixing `useInView` viewport detection, and scoping SVG linearGradient IDs with `useId()`.
- Implemented full dynamic Dark Mode theme support for the 4×4 Tử Vi table with theme-aware Ngũ Hành star colors.
- Corrected Astrology sidebar login banner persistence to reflect active user profile.
- Built fresh production APK (`app-debug.apk`, 10MB, v3.1.0).

**Metrics**:
| Metric | Value |
|---|---|
| Test Suites Passing | 59 / 59 (100%) |
| Tests Passing | 463 / 463 (100%) |
| TypeScript Typecheck | 0 errors |
| ESLint Static Analysis | 0 errors |
| Android Build Status | SUCCESSFUL (154 tasks) |
| APK Artifact Size | 10 MB |

**Retrospective**:
- What went well: Systematic root-cause diagnosis of compositor raster drops; zero regressions on existing 463 unit tests.
- What to improve: Ensure all visual components undergo dark mode contrast audit during initial implementation.
- Action items: Monitor real-device gesture performance on foldable devices.
