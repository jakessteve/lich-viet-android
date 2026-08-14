# Western Natal Mobile UI Implementation Plan

1. Override the embedded SVG sizing only in the live chart component so the existing deterministic export remains unchanged.
2. Add a fit-first chart viewport with exact `1/1.25/1.5/2` layout-box zoom levels, bounded controls, reset-on-result, double-tap toggle, and scrollable zoomed state.
3. Replace open wide technical tables with one default-collapsed explorer, native nested disclosures, responsive label/value rows, and a 12-item aspect preview with explicit Show all/Collapse.
4. Replace the two Western image buttons with one accessible SVG/PNG menu with complete focus/Escape/outside-click/saving semantics; keep Markdown and Vedic behavior separate.
5. Add focused interaction/accessibility tests, run typecheck/build, capture light/dark screenshots at 360px and 412px and inspect page overflow/panning, obtain Oracle review, correct blockers, then create and inspect a clean APK.

## File scope

- `src/components/Astrology/Western/WesternNatalChartDisplay.tsx`
- `src/components/Astrology/Western/WesternNatalTechnicalDisplay.tsx`
- `src/components/Astrology/WesternMarkdownExport.tsx`
- matching Western component/export tests

## Out of scope

All engine formulas, stores, Vedic/Tử Vi UI, dependencies, routes, and release signing.
