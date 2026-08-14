# Task Breakdown: High-Fidelity Natal Chart SVG

> Plan: `.specify/natal-chart/plan.md`  
> Status: Oracle Approved With Changes Applied

## Phase 1: Calculation Contract

- [x] T1.1 Add failing tests for 20 objects, namespaced IDs/categories/synthetic semantics, numeric fixture tolerances, speed/retrograde fields, timezone/JD, Swiss return flags/range, 12 cusps, angle opposition, Vertex, and horizon-based Part of Fortune.
- [x] T1.2 Add only the package/export and declarative-registry scaffolding required to collect the tests.
- [x] T1.3 Implement package-relative strict Swiss Ephemeris calculation adapters with `FLG_SWIEPH | FLG_SPEED`, return-flag/date validation, horizon sect, and validated normalized models.
- [x] T1.4 Prove Placidus and Whole Sign output with finite longitudes.
- [x] T1.5 Oracle-review Phase 1 diff and focused evidence before Phase 2. Result: APPROVED, 42 focused tests passed, confidence 0.99.

## Phase 2: Analysis and Layout

- [x] T2.1 Define the exact centralized 11-aspect table and serialized styles from the spec.
- [x] T2.2 Add failing tests for wrap-around separations, allowed orbs, normalized tie-break/strength, near-exact signed-motion applying/separating state on both sides of conjunction/square/opposition, and eligibility.
- [x] T2.3 Implement deterministic aspect selection and localized display registries.
- [x] T2.4 Replace one-track angular pushing with cyclic multi-track placement and leader/bounding-box metadata; test clustered and 0-degree cases, enforce the closing seam, and fail beyond the 45-degree displacement budget at 1180 and 360 pixels.
- [x] T2.5 Oracle-review Phase 2 configuration, layout, and focused evidence before Phase 3. Result: APPROVED, 61 focused tests and 103 full tests passed; fixed-step mutation killed; confidence 0.99.

## Phase 3: Rendering and Operation

- [x] T3.1 Add renderer/CLI contract tests, including invalid input and contradictory JSON, safe SVG styles, pair-safe write failure, structural layer/count/overlap criteria, and non-zero CLI failure.
- [x] T3.2 Build background, sign sectors, cusp band, 360 degree ticks plus 30-minute subdivisions, house-sector, and house-number layers.
- [x] T3.3 Build strength-layered aspect web, 20 full object groups/leaders with visible zodiac sign and degree/minute, four emphasized angle groups with visible zodiac sign and degree/minute, legend/metadata, and accessibility elements.
- [x] T3.4 Support `python -m natal_chart`, `chart.to_svg`, `chart.to_json`, validated and serialized render dimensions/locale, JSON-to-identical-SVG reproduction, configurable house/aspects, package-relative imports, and pair-safe output creation.
- [x] T3.5 Pin/constraint only already-used runtime packages and declare the existing test runner in `requirements.txt`; do not install. Rewrite README with setup, configuration, troubleshooting, validation, reference limits, and license caveat.
- [x] T3.6 Generate canonical `natal_chart.svg` and `natal_chart.json`; parse, count, rasterize at 1180/360, inspect glyph/overlap/clip evidence, and compare side by side.
- [x] T3.7 Oracle-review Phase 3 evidence before convergence. Result: APPROVED after hardening; 160 full tests passed; calculation, visual, hallucination, security, and minimalism gates approved.

## Final Validation and Review

- [x] V1 Re-run every focused Python test after fixes. Evidence: 160 full natal-chart tests passed after final hardening.
- [x] V2 Run real CLI smoke, JSON contract assertions, XML validation, finite-coordinate scan, layer/object/house counts, and performance timing. Evidence: canonical generation 0.146-0.232 seconds; JSON-to-SVG identity, `xmllint`, finiteness, counts, invalid CLI, and rollback probes passed.
- [x] V3 Rasterize at 1180 and reduced mobile size; inspect overlap, clipping, glyph coverage, contrast, and reference hierarchy. Evidence: final 1180/360 rasters passed independent visual review; fine text at 360 remains inspection-scale.
- [x] V4 Run `project-regression run` and `status`, then repository typecheck, lint, and tests; if no native gate exists, preserve the wrapper's exact limitation and classify unrelated failures honestly. Evidence: no native regression entrypoint; typecheck/build passed; lint and app Vitest exposed unrelated pre-existing failures outside `natal_chart/`.
- [x] V5 Run implementation review, minimalism review, hallucination/scope audit, Oracle review, and convergence report. Evidence: all implementation gates approved; minimalism 89/100; final hallucination and security reviews approved.

## Traceability Matrix

| Requirement | Tasks |
|---|---|
| FR-1.1 through FR-1.8 | T1.1-T1.5, V1-V2 |
| FR-2.1 through FR-2.3 | T2.1-T2.5, V1-V2 |
| FR-3.1 through FR-3.7 | T2.4-T2.5, T3.1-T3.3, T3.6-T3.7, V2-V3 |
| FR-4.1 through FR-4.5 | T3.1, T3.4-T3.7, V2 |
| NFR-1 through NFR-6 | T1.3-T1.5, T2.3-T2.5, T3.2-T3.7, V1-V5 |

## Out of Scope

No task may modify application source outside `natal_chart/`, edit `natal_chart/venv/`, caches, or `natal_chart/ephe/*.se1`, infer the missing reference birth input, install packages or another astrology framework, publish, deploy, commit, or push. Editing dependency version declarations for already-used packages and declaring the existing test runner in `requirements.txt` is authorized.

## Verify

```bash
cd /home/heocop/Projects/lich-viet-android
natal_chart/venv/bin/python -m pytest natal_chart/tests -q
natal_chart/venv/bin/python -m natal_chart --date 2000-01-01 --time 12:00:00 --lat 21.0285 --lng 105.8542 --timezone Asia/Ho_Chi_Minh --house-system placidus --output natal_chart/natal_chart
project-regression run /home/heocop/Projects/lich-viet-android
project-regression status /home/heocop/Projects/lich-viet-android
```

## Done When

- [x] Every task is checked or explicitly deferred with a reason.
- [x] Every requirement row has passing evidence or a named external blocker.
- [x] Canonical artifacts were generated by the final code, not retained from an earlier run.
