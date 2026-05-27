# Function & Engine Reference - Lich Viet v3

> **Version:** 3.0.0 | **Updated:** May 2026
> Function-level source of truth for the current local codebase.

---

## 1. Active Surfaces

Lich Viet v3 is a client-side React SPA with four primary surfaces:

| Surface | Route | Primary component |
| --- | --- | --- |
| Landing | `/` | `src/components/pages/LandingPage.tsx` |
| Am Lich + Dung Su | `/app/am-lich` | `src/components/pages/AmLichPage.tsx` |
| Gieo Que | `/app/gieo-que` | `src/components/GieoQue/GieoQueView.tsx` |
| Tu Vi | `/app/tu-vi` | `src/components/TuVi/TuViPage.tsx` |

Support routes for settings, auth, and upgrade stay inside the same SPA shell. Legacy module routes redirect into the active pages instead of loading removed modules.

---

## 2. Engine Layer

The active engines live under `src/utils/`.

| Engine | File(s) | Responsibility |
| --- | --- | --- |
| Calendar | `calendarEngine.ts` | Solar/lunar conversion, Can Chi, day detail aggregation, month grid generation |
| Activity scoring | `activityScorer.ts` | Dung Su score breakdowns for activities |
| Dung Su | `dungSuEngine.ts`, `dungSuSuggester.ts` | Activity/date recommendations |
| Mai Hoa | `maiHoaEngine.ts`, `maiHoaInterpreter.ts` | Hexagram generation and interpretation |
| Tam Thuc | `tamThucSynthesis.ts` | Synthesis of QMDJ, Luc Nham, and Thai At |
| QMDJ | `qmdjEngine.ts`, `qmdjScorer.ts` | Nine-palace chart and scoring helpers |
| Luc Nham | `lucNhamEngine.ts` | Heaven/Earth board and verdicts |
| Thai At | `thaiAtEngine.ts` | Year/month overlays and forecast helpers |
| Flying Star | `flyingStarEngine.ts` | Xuan Kong Flying Star chart |

### Astronomy and Tu Vi services

| Service | File(s) | Responsibility |
| --- | --- | --- |
| Swiss astronomy | `src/services/astronomy/swissEphemeris.ts` | Location-aware lunar dates, solar-term boundaries, and true-solar correction |
| Tu Vi birth context | `src/services/tuvi/birthContext.ts` | Birthplace normalization and historical Vietnam handling |
| Tu Vi star placement | `src/services/tuvi/starPlacement.ts` | Star placement, hạn context, and chart assembly |
| Tu Vi formatting | `src/services/tuvi/markdownFormatter.ts` | Markdown export and prompt headers |
| Tu Vi normalization | `src/services/tuvi/timeNormalization.ts` | Historical time normalization and civil-date formatting |
| Viewer location | `src/hooks/useViewerLocation.ts` | Browser geolocation to Swiss location contract |
| Holiday lookup | `src/hooks/useHolidays.ts` | Geo-IP holiday lookup plus Vietnamese holiday matching |

---

## 3. Package Exports

The public package facades are in `packages/core/src/`.

| Package path | Exports |
| --- | --- |
| `@lich-viet/core` | Shared constants, Gieo Quẻ helpers, source refs, and shared engine facades |
| `@lich-viet/core/calendar` | Calendar, Can Chi, solar-term, and hour helpers |
| `@lich-viet/core/dungsu` | Activity scoring, catalog, Dung Su generation, date suggestions |
| `@lich-viet/core/maihoa` | Mai Hoa generation, interpretation, and related types |
| `@lich-viet/core/fengshui` | Flying Star chart helpers |
| `@lich-viet/core/qmdj` | QMDJ chart and scoring helpers |
| `@lich-viet/core/thaiAt` | Thai At chart and forecast helpers |
| `@lich-viet/core/lucNham` | Luc Nham chart and interpretation helpers |
| `@lich-viet/core/tamThuc` | Tam Thuc synthesis helpers |
| `@lich-viet/types` | Shared calendar, Mai Hoa, QMDJ, Thai At, and Luc Nham types |

Tu Vi currently lives under `src/services/tuvi/` and `src/components/TuVi/`. There is no dedicated public `@lich-viet/core/tuvi` barrel in this codebase.

Removed v2 modules such as Bazi, Western Astrology, Numerology, PDF export, premium gating, onboarding, admin, and widget exports are intentionally absent.

---

## 4. Shared Services

| Service | File | Purpose |
| --- | --- | --- |
| Analytics | `src/services/analyticsService.ts` | Local/dev event tracking plus optional `gtag` forwarding |
| Auth store | `src/stores/authStore.ts` | Demo-only localStorage auth, seeded admin, and profile persistence |
| Personalization | `src/services/personalization/` | Personal day, activity, and hour scoring helpers |
| Holiday geo | `src/hooks/useHolidays.ts` | Geo-IP lookup and holiday caching for the calendar view |
| App store | `src/stores/appStore.ts` | Selected date, day data, viewer location, and app preferences |
| Tu Vi store | `src/stores/tuviStore.ts` | Tu Vi chart state, birth data, palace selection, and hạn view |

Security note: auth remains client-side demo auth. It seeds a local admin account for testing and should not be treated as production authentication.

---

## 5. Core Functions

### Calendar and location

- `getLunarDate(date, location?)`
- `getMonthDays(year, month, location?)`
- `getDetailedDayData(date, location?)`
- `getDayQuality(date, location?)`
- `getCanChiDay(date)`
- `getCanChiMonth(lunarMonth, lunarYear)`
- `getCanChiYear(lunarYear)`
- `getAuspiciousHours(date)`
- `getSwissLunarDate(date, region?, swe?, location?)`
- `getSwissLunarDateIfReady(date, region?, swe?, location?)`
- `getSwissTrueSolarCivilTimeForLocation(swe, civilDate, location)`
- `buildSwissGeoLocation(longitude)`
- `estimateTimezoneOffsetHours(longitude)`
- `useViewerLocation()`

### Tu Vi

- `buildTuViBirthContext(input, schoolProfile)`
- `normalizeBirthTimeWithPolicy(date, birthLocation?)`
- `normalizeBirthTime(date, birthLocation?)`
- `generateChart(input, schoolProfile)`
- `calculateHanContext(...)`
- `calculateCenterInfo(...)`
- `formatTuViChartAsMarkdown(chart)`
- `generatePromptHeader(...)`

### Divination and scoring

- `performTimeBasedDivination(input)`
- `performNumberBasedDivination(input)`
- `buildDivinationContext(date, mode, label, query)`
- `interpretDivination(result, lunarMonth)`
- `synthesizeTamThuc(date, hourIndex)`
- `calculatePersonalDayScore(birthYear, dayChi)`
- `calculateFinalScore(...)`
- `calculateNguHanhInteraction(dayCanChi)`
- `buildNapAmInteraction(dayCanChi)`
- `buildCanChiXungHop(dayChi)`

---

## 6. Current Route Map

| Route | Notes |
| --- | --- |
| `/` | Landing page |
| `/app/am-lich` | Calendar, holidays, day detail, and Dung Su |
| `/app/gieo-que` | Mai Hoa and Tam Thuc |
| `/app/tu-vi` | Tu Vi charting |
| `/app/cai-dat` | Settings |
| `/app/dang-nhap` | Demo login |
| `/app/dang-ky` | Demo registration |
| `/app/nang-cap` | Upgrade / pricing status |

Legacy redirects still exist for removed v2 routes and should continue to resolve into active v3 pages.

---

## 7. Current Validation Baseline

Latest local validation in this workspace:

| Check | Status |
| --- | --- |
| TypeScript | `npm run typecheck` passes |
| Tests | `npm test` passes |
| Lint | `npm run lint` passes with one pre-existing warning in `src/components/DetailedDayView.tsx` |
