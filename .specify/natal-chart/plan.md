# Implementation Plan: High-Fidelity Natal Chart SVG

> Spec: `.specify/natal-chart/spec.md`  
> Status: Oracle Approved With Changes Applied  
> Owner model: one write-capable backend worker for `natal_chart/`

## Phase -1: Gates and Decisions

- **Simplicity:** PASS. Retain the selected low-level `pyswisseph` engine and custom SVG; do not add Kerykeion, Stellium, Immanuel, Cairo, or a browser renderer.
- **Engine independence:** PASS. All implementation changes remain inside standalone `natal_chart/`.
- **Data integrity:** PASS WITH LIMIT. File-backed Swiss Ephemeris is authoritative for calculations, but the complete reference birth input is unavailable.
- **Security:** PASS. Offline deterministic calculation only; validate input and output path behavior.
- **Licensing:** PASS WITH DISCLOSURE. README will identify `pyswisseph` as AGPL-3.0-classified and note the Swiss Ephemeris professional license alternative, without making a legal conclusion or changing the repository license.

## 1. Architecture

```text
CLI / Python API
      |
validated birth input and explicit settings
      |
Swiss Ephemeris calculation modules
      |
normalized Pydantic NatalChartData
      |----------------------|
aspect engine          JSON serialization
      |
deterministic SVG layers + multi-track label layout
```

The renderer accepts only `NatalChartData` and style/localization configuration. It never calls Swiss Ephemeris. Required bodies are declared in a registry. Houses and primary angles have explicit adapters. Aspects are computed once, serialized, then drawn from their stored styles.

## 2. Technology Decisions

| Decision | Choice | Rationale | Alternatives |
|---|---|---|---|
| Ephemeris | `pyswisseph==2.10.3.2` with local `.se1` files | Direct access to required planets, nodes, apogee, asteroids, houses, Vertex, and speed; no renderer constraint or new dependency | Kerykeion v5 is complete but duplicates models and brings a renderer not tailored to the reference; Stellium is broader/newer; Immanuel is data-first without SVG |
| Timezone | `pytz` with strict localization | Already installed and supports IANA zones, ambiguous/nonexistent time errors | `zoneinfo` would reduce dependencies but changes the current implementation surface |
| Model | Pydantic v2 | JSON-compatible validation already present | Dataclasses require custom validation/serialization |
| SVG | `xml.etree.ElementTree` | Standard library, deterministic XML, no native rendering dependency | svgwrite/Cairo/HTML would add dependencies |
| Label layout | Deterministic angular tracks plus leader lines | Handles dense clusters while preserving true positions | Single-force angular displacement is insufficient; full text-metrics solver is disproportionate |

## 3. Implementation Phases

### Phase 1: Calculation and normalized contract

**Entry:** Spec is scope locked.  
**Exit:** Calculation tests pass for required objects, exact frozen fixture, speed/retrogrades, strict timezone/JD, Swiss return flags/date range, houses, primary angles, horizon-based sect, and model serialization.

**Files owned:**

- `natal_chart/__init__.py`, `natal_chart/planets.py`, `natal_chart/houses.py`, `natal_chart/angles.py`
- `natal_chart/calculations.py`, `natal_chart/models.py`
- `natal_chart/tests/conftest.py`, `natal_chart/tests/test_calculations.py`, `natal_chart/tests/test_houses.py`, `natal_chart/tests/test_planets.py`, `natal_chart/tests/test_angles.py`, `natal_chart/tests/test_pof.py`

**Failure scenarios:** missing asteroid ephemeris file or non-Swiss return flag -> fail with named body/file context; local date outside 1800-01-02 through 2399-12-31, converted UTC instant outside the declared all-object file interval, or invalid/ambiguous timezone/local time -> validation error; unsupported house name/code or polar calculation failure -> explicit error without partial chart.

**Oracle gate:** inspect source/test diff and exact focused-test output before Phase 2.

### Phase 2: Aspect, localization, style, and collision engines

**Entry:** Phase 1 normalized contract passes and its Oracle gate approves.  
**Exit:** The exact 11-aspect table, deterministic tie-break/strength/state rules, localization, and multi-track layout tests pass without renderer coupling.

**Files owned:**

- `natal_chart/aspects.py`, `natal_chart/localization.py`, `natal_chart/styles.py`, `natal_chart/label_layout.py`
- `natal_chart/tests/test_aspects.py`, `natal_chart/tests/test_label_layout.py`

**Failure scenarios:** multiple aspects match a pair -> lowest normalized orb then table order wins; near-exact motion -> signed relative angular motion determines applying/separating without overshooting; wrap-around cluster crosses 0 degrees -> cyclic spacing and the closing seam remain valid; a label would move more than 45 degrees or occupy a full revolution -> `LayoutError`; missing localized label/style -> safe English/name fallback while retaining semantic IDs.

**Oracle gate:** inspect config/algorithm traceability, clustered-label evidence, and focused tests before Phase 3.

### Phase 3: SVG, API/CLI, docs, and canonical artifacts

**Entry:** Phases 1-2 pass and both Oracle gates approve.  
**Exit:** Real CLI produces valid canonical JSON/SVG; objective layer/count/overlap/glyph criteria pass and raster inspection shows substantially improved reference similarity.

**Files owned:**

- `natal_chart/svg_renderer.py`, `natal_chart/renderer.py`, `natal_chart/cli.py`, `natal_chart/__main__.py`, `natal_chart/__init__.py`
- `natal_chart/models.py` for the explicit validated render-settings contract, cross-model JSON invariants, safe serialized renderer styles, and settings-aware `to_svg` defaults; calculation formulas remain frozen
- `natal_chart/styles.py`, `natal_chart/localization.py`, and `natal_chart/label_layout.py` only for renderer integration and visual tuning; their Phase 2 behavioral contracts remain frozen
- `natal_chart/tests/test_svg.py`, `natal_chart/tests/test_json.py`, `natal_chart/tests/test_cli.py`
- `natal_chart/requirements.txt`, `natal_chart/README.md`
- generated `natal_chart/natal_chart.svg`, `natal_chart/natal_chart.json`

**Failure scenarios:** invalid coordinate, speed/retrograde mismatch, or contradictory sign/angle/aspect relationship reaches the model -> validation error before rendering; unsafe SVG color/dash syntax -> validation error; output directory missing -> create parent safely; existing directory/symlink/non-regular output -> refuse unchanged; either CLI pair write/publish fails -> no newly partial pair and any previous complete regular-file pair remains intact; unsupported glyph/font -> declared fallback stack and structural text labels remain readable; JSON render settings missing or invalid -> validated defaults/error; loaded configured JSON -> byte-identical SVG without hidden CLI state.

**Oracle gate:** inspect canonical artifacts, structural counts, raster evidence, and final commands before convergence.

## 4. Validation Strategy

- **Unit:** object registry, zodiac formatting, Julian Day, Swiss flags, frozen numeric fixture, house invariants, angles, horizon/Part of Fortune, aspect classification/strength/state, cyclic label tracks.
- **Contract:** normalized JSON keys/types, settings sufficient for reproduction, package-relative imports, renderer has no ephemeris imports.
- **System:** run `python -m natal_chart` from repository root and parse both files.
- **Visual:** enforce named layer/count/bounding-box criteria; rasterize at 1180 and 360 pixels; inspect proportions, glyphs, labels, aspects, and clipping against both supplied images.
- **Regression:** before edits run `project-regression assert-fresh /home/heocop/Projects/lich-viet-android`; after implementation run `project-regression run /home/heocop/Projects/lich-viet-android` and `project-regression status /home/heocop/Projects/lich-viet-android`. If the wrapper reports no project-native gate, preserve that exact limitation and run explicit Python plus TypeScript gates.

## 5. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Missing reference birth input | Exact ASC/planet comparison cannot be proven | Record BLOCKED reference rows and do not tune sample data |
| Swiss Ephemeris licensing | Distribution obligations may conflict with MIT expectations | Document AGPL classification and professional-license alternative; no legal conclusion |
| Dense 20-object chart | Overlap or aspect noise | Multi-track labels, leaders, strength-based opacity/width, structural tests, raster iteration |
| Font portability | Glyph substitution differs by device | Noto/DejaVu/sans fallback stack, accessible text/name labels, no remote font |
| Ephemeris fallback | Silent lower-precision result | Request `FLG_SWIEPH | FLG_SPEED`, verify return flags, enforce both conservative local-date and converted-UTC intervals, and raise on required calculation failure |

## 6. Out of Scope and Frozen Paths

The exclusions in `spec.md` are binding. In particular: no React/Android integration, dependency-framework migration, proprietary reverse engineering, deployment, or invented reference birth input. `natal_chart/venv/`, caches, and `natal_chart/ephe/*.se1` are frozen. Writer edits are restricted to package source, package tests, README, requirements version declarations, and canonical `natal_chart.svg/.json`.

## 7. Verify

```bash
cd /home/heocop/Projects/lich-viet-android
natal_chart/venv/bin/python -m pytest natal_chart/tests -q
natal_chart/venv/bin/python -m natal_chart --date 2000-01-01 --time 12:00:00 --lat 21.0285 --lng 105.8542 --timezone Asia/Ho_Chi_Minh --house-system placidus --output natal_chart/natal_chart
project-regression run /home/heocop/Projects/lich-viet-android
project-regression status /home/heocop/Projects/lich-viet-android
npm run typecheck
npm run lint
npm test
```

## 8. Done When

- [ ] All three phase exits and Oracle gates are true.
- [ ] No implementation file outside the allowlisted `natal_chart/` surface changed.
- [ ] Generated output and visual evidence were inspected after the last code change.
- [ ] Final review records exact passes, blockers, and residual risks.
