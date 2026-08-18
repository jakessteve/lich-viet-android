# PLAN: Western & Vedic Chart Accuracy

Status: COMPLETED & MERGED (v3.1.0)
Reference: https://chiemtinhlaso.com (feature reference only, no content copied)

## 1. Problem Statement
Western and Vedic astrology charts are "not correct yet". Goal: fix calculation
correctness first, then cherry-pick feasible features from chiemtinhlaso.com.
No code changes in this document.

## 2. Root Causes Found (evidence)
1. Timezone ignored. WesternAstrologyPage.tsx:20-28 builds
   `new Date(y, m, d, h, min)` (device-local wall clock) and
   westernCalculator.ts:91-93 converts straight to Julian Day; `input.timezone`
   is never applied. ASC/MC/houses/Moon shift by hours for non-device timezones.
2. Only 7 bodies. packages/core-logic/src/astronomy.js bodies list =
   sun..saturn. Missing: uranus, neptune, pluto, north/south node
   (La Hau/Ke Do), lilith, chiron. chiemtinhlaso shows Sun-Pluto + nodes.
3. Retrograde hardcoded false (westernCalculator.ts:130).
4. Houses: Porphyry only (westernCalculator.ts:104). Reference standard is
   Placidus; scripts/patchSwisseph.cjs already defaults swisseph to Placidus
   but the natal path never uses it.
5. Part of Fortune hardcodes isDayBirth=true (westernCalculator.ts:161).
6. Vedic tab = same tropical pipeline. `ayanamsa` input exists
   (types/astrology.ts, astrologyStore.ts:52) but is never consumed
   (astrologyStore.ts:84-101). No Rahu/Ketu, no whole-sign bhava, no
   Vimshottari dasha, no D9 display, no Vedic dignity/aspects — although
   packages/core-logic/src/vedic.js implements navamsha, dasha, ashtakoota,
   vedic dignity, tarabala.
7. Synastry is a stub returning {} (astrologyStore.ts:106-113).
8. Duplicate minimal engine. Frontend westernCalculator.ts re-implements a
   subset while @lich-viet/app-backend already exposes a complete pipeline:
   - createWesternChart (packages/app-backend/src/frontend-readiness.js:757):
     core+outer planets, north/south node, lilith, chiron, antiscia, PoF with
     real day/night detection, major+minor aspects, midpoints, chart shape,
     dispositor tree, parallels, Placidus/Koch/equal house systems.
   - createVedicKundli (frontend-readiness.js:1013): ayanamsa, lagna, grahas
     with rashi/nakshatra, D1/D9 divisional, dashas, yogas, doshas.
   The frontend imports neither.

## 3. Cherry-Pick Targets from chiemtinhlaso.com
Site research summary: Western-only site (no Vedic section). Natal chart
includes Sun-Pluto + ASC/MC, retrogrades, aspect patterns (Grand Trine,
T-Square, Stellium, Yod, Mystic Rectangle, Grand Square, Kite), house cusps +
rulers, Part of Fortune, moon phase, nodes as La Hau/Ke Do, planets in
elements, declination parallels, solar/lunar return, transits+progressions,
synastry scoring, composite/Davison. Input UX: city autocomplete, auto
lat/lon/timezone with DST auto-adjustment, unknown-birth-time fallback.

Adopt now (Phase 0-1): bodies set, retrogrades, Placidus, aspect patterns,
house rulers, moon phase, elements/modality, PoF fix, nodes, input UX rules.
Defer (Phase 2, optional): synastry real impl, composite/Davison,
transits/progressions, solar/lunar return, parallels, dasha UI polish.
Do NOT adopt: asteroids, Sabian symbols, Draconic, zodiacal releasing,
horary, Huber, career/finance/child themed reports, MBTI.

Vedic correctness (site has no Vedic; use standard Jyotish practice):
Lahiri/KP ayanamsa, Rahu/Ketu, whole-sign bhava, Vimshottari dasha,
D9 navamsha, Vedic dignity — all already implemented in packages/.

## 4. Implementation Phases

### Phase 0 — Correctness (P0, blocking)
- T1 Engine swap: replace frontend pipeline with @lich-viet/app-backend
  createWesternChart / createVedicKundli (pure ESM JS, browser-safe).
  westernCalculator.ts becomes a thin adapter mapping results to
  WesternChartResult; or store calls backend functions directly.
- T2 Timezone contract: build UTC instant from birth date/time + explicit
  timezone offset; keep backend rule "timezone must be explicit for birth
  place" (422 ambiguous_timezone). Check canonical-db/src/htzc.js for
  historical timezone/DST support before promising DST parity.
- T3 House systems: default Placidus (Western), fallback Porphyry/Equal for
  polar latitudes; expose selector in UI later.
- T4 Real retrograde, PoF day/night by moon phase, mean node default (true
  node as later option). ORACLE FIX: createWesternChart only sets retrograde
  for uranus/neptune/pluto/node/lilith/chiron; core planets get
  "unknown" (western-enhanced.js computePlanetaryVelocity else-branch).
  Add core-planet retrograde via +/-1 day snapshot diff in adapter OR small
  core-logic patch. PoF day/night already correct in backend.
- T5 Vedic rebuild on createVedicKundli: sidereal grahas, whole-sign bhava,
  Vimshottari dasha, D9 navamsha. ORACLE FIX: createVedicKundli maps only the
  7-body planetarySnapshot -> Rahu/Ketu absent; adapter must add north/south
  node (sidereal) placements before rendering.
- T6 Verification fixtures: 3-5 reference births cross-checked against
  chiemtinhlaso outputs (and astro.com as second reference). Targets:
  planets within 1 arc-minute, ASC/MC within 0.5 deg vs Swiss Ephemeris.
  Add vitest unit tests; run native regression gate if present.

### Phase 1 — Display parity (cherry-pick)
- T7 Western wheel: add nodes + retrograde glyph markers, aspect-pattern
  panel, house rulers list, moon phase badge, elements/modality counts.
  ORACLE FIX: aspect-pattern detectors (Grand Trine, T-Square, Stellium,
  Yod...) do NOT exist in core-logic (only detectChartShape overall shape);
  implement pattern classification in frontend service (new pure module +
  unit tests), not UI-only. Moon phase derivable from sun/moon longitudes;
  house rulers via existing dispositorTree.
- T8 Vedic display: Rahu/Ketu in square chart, dasha timeline block,
  D9 navamsha table, Vedic dignity markers.
- T9 Interpretation wiring via existing interpretations.ts (no new content).

### Phase 2 — Deferred (optional, after P0/P1 validated)
- T10 Real synastry (core-logic synastry.js + ashtakoota), composite/Davison,
  transits/progressions, solar/lunar return, parallels.

## 5. Out of Scope
- Any packages/* engine rewrite (reuse only; swisseph-wasm upgrade is a
  separate decision if accuracy targets fail).
- New backend API surface, persistence of saved charts, paid tiers.
- Content/interpretation authoring beyond existing text.
- docs/biz contradiction cleanup (docs say astrology removed; flag to owner).

## 6. Files Likely Touched (estimate 10-12)
src/services/astrology/westernCalculator.ts (adapter rewrite)
src/stores/astrologyStore.ts
src/types/astrology.ts
src/components/Astrology/Western/{WesternAstrologyPage,WesternChartDisplay,WesternWheelChart,WesternInterpretationPanel}.tsx
src/components/Astrology/Vedic/{VedicAstrologyPage,VedicChartDisplay,VedicSquareChart,VedicInterpretationPanel}.tsx
test/ (new fixtures)

## 6b. Input UX (cherry-pick from reference)
- T11 Timezone/city handling in birth form: explicit timezone required
  (backend 422 rule), unknown-birth-time fallback (noon + warning banner),
  DST/historical offset via canonical-db htzc.js (Vietnam rules only).
- T12 i18n: all new labels in vi (and en if i18n keys exist).

## 7. Risks
- R1 core-logic JS ephemeris (VSOP-style) is approximate; outer planets and
  Chiron are low-precision series. Mitigation: fixture tolerance gate;
  fallback option = swisseph-wasm engine (already a dependency).
- R2 Historical timezone/DST data may be incomplete; affects pre-1975 VN births.
- R3 Module officially "removed" per docs — needs owner confirmation.
- R4 Bundle size/perf when importing @lich-viet/app-backend client-side; check
  tree-shaking of frontend-readiness imports.

## 8. Open Questions (user decision needed)
Q1 Confirm astrology module stays (docs say removed).
Q2 Default house system: Placidus only, or keep selector (Placidus/Koch/Equal/Porphyry)?
Q3 Lunar node: mean (default) or true?
Q4 Is Phase 2 (synastry/transits) in scope for this round or later?

## 9. Verification Commands (post-implementation)
npx vitest run test/ (chart fixtures)
npm run lint && npm run typecheck (or repo equivalents)
project-regression run (if available)


## 10. Oracle Review Verdict (inline review — subagent runtime returned empty)
VERDICT: APPROVE_WITH_CHANGES

CONFIRMED (evidence):
- All 7 root causes verified in code (westernCalculator.ts:91-93,104,130,161;
  astronomy.js 7-body list; astrologyStore.ts:52,84-101,106-113).
- createWesternChart delivers outer planets, nodes, lilith, chiron, antiscia,
  PoF day/night, Placidus/Koch/equal, midpoints, parallels, dispositor tree,
  receptions, almuten, bounds/terms, fixed stars, intercepted signs
  (frontend-readiness.js:757-1012).
- createVedicKundli delivers lagna, D1/D9, dashas, yogas, doshas (:1013-1042).
- @lich-viet/app-backend is browser-safe: executeWasmAstronomyPipeline is pure JS
  core-logic math despite the wasm name (swisseph-wasm/src/astronomy-api.js).
- Historical timezone support exists but Vietnam-only (canonical-db/htzc.js).

OVERCLAIMS CORRECTED (see T4/T5/T7 inline fixes):
- Core-planet retrograde not provided by backend engine.
- Aspect-pattern classifiers absent from core-logic.
- Rahu/Ketu absent from createVedicKundli output.

ADDITIONS REQUIRED: T11/T12 (input UX + i18n) added; file estimate raised.

REMAINING OPEN ITEMS: Q1-Q4 in section 8 unchanged; also confirm bundle-size
acceptability after app-backend import (R4) during Phase 0 spike.
