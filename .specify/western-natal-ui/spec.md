# Western Natal Mobile UI Repair

Status: scope locked — 2026-08-14

## Problem

The fixed-size 1180px SVG is clipped inside the mobile card, while the complete technical contract is rendered as several open, wide tables. Western export also exposes separate SVG and PNG actions. The result is difficult to inspect and consumes excessive vertical and horizontal space.

## Requirements

- The complete chart circle is visible by default at every supported viewport width; no chart content is clipped in fit mode.
- The chart follows the live app light/dark selection without recalculation.
- Users can zoom at exact levels `1`, `1.25`, `1.5`, and `2`, zoom out, and reset to fit with accessible 44px controls. Zoomed content enlarges the layout box and is pannable/scrollable only above `1`; fit mode remains centered and resets for a new result.
- Technical data remains complete but is hidden behind a top-level disclosure by default, organized into native nested disclosures for Objects, Houses, Angles, Aspects, and Metadata.
- Technical rows use responsive label/value layouts without fixed desktop minimum widths. Large aspect sets use explicit progressive disclosure.
- Western chart download exposes one menu button with SVG and PNG choices. It publishes `aria-expanded`/`aria-controls`, focuses the first choice on open, closes on Escape/outside click, returns focus to its trigger, and disables both choices while saving.
- Existing Vedic export behavior, calculation contracts, routes, theme tokens, SVG/PNG serialization, and unrelated Tử Vi changes remain unchanged.
- At 360px and 412px viewports, light and dark screenshots show the complete outer ring in fit mode with no page-level horizontal overflow; zoomed mode is pannable.

## Out of scope

- Calculation changes, ephemeris changes, route redesign, dependency installation, publishing, signing a release APK, or changing Vedic/Tử Vi export behavior.
- Pixel-identical reproduction of the reference website.

## Verification

```bash
npm test -- --run test/components/westernNatalChart.test.tsx test/components/westernNatalTechnicalDisplay.test.tsx test/components/westernNatalPageWiring.test.tsx
npm run typecheck
npm run build
npx cap sync android
cd android && ./gradlew clean assembleDebug
```
