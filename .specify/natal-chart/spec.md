# Feature Specification: High-Fidelity Natal Chart SVG

> Created: 2026-08-14  
> Status: Scope Locked  
> Source: attached technical brief and two reference images

## 1. Problem and Value

The latest stale JSON artifact contains the 20 requested objects, but the current source cannot regenerate it because `planets.py` is missing. Its stored velocities are all zero, so retrogrades and applying/separating states are wrong; its SVG is structurally sparse, with a five-layer wheel and inadequate collision handling. The user needs a reproducible, configurable chart generator whose JSON is sufficient to recreate its SVG.

Success means the standalone Python package produces a deterministic, valid SVG/JSON pair from timezone-aware birth input; displays every required object; renders 12 houses, four primary angles, degree ticks, and configurable aspects; and materially approaches the supplied chiemtinhlaso.com geometry without falsifying astronomical values.

## 2. User Stories and Acceptance Criteria

### US-1: Calculate complete natal data

As a chart user, I want precise tropical positions for the supported bodies and points so that the wheel is complete.

- **FR-1.1:** A valid chart contains Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Chiron, Mean Lilith, True North Node, South Node, Part of Fortune, Vertex, Ceres, Pallas, Juno, and Vesta.
- **FR-1.2:** Every object contains a stable namespaced string ID, longitude, latitude, speed, sign, sign-local degree/minute, symbol, Vietnamese name, category, angle flag, and retrograde status. Known motion is internally consistent: negative speed means retrograde and zero/positive speed means direct; unknown speed requires unknown retrograde. Categories are `planet`, `centaur`, `lunar_point`, `asteroid`, `arabic_part`, or `angle`.
- **FR-1.3:** Birth time is localized with an IANA timezone, converted to UTC, then converted to Julian Day; invalid or ambiguous input fails clearly.
- **FR-1.4:** Placidus and Whole Sign houses are supported through validated configuration; output contains exactly 12 finite cusps.
- **FR-1.5:** ASC/DSC and MC/IC are 180 degrees apart within floating-point tolerance; Vertex is available as an object.
- **FR-1.6:** All Swiss body calls request `FLG_SWIEPH | FLG_SPEED`, inspect return flags, and reject a Moshier fallback or missing required body. The conservative supported local-date interval is 1800-01-02 through 2399-12-31. After timezone conversion the UTC instant must also fall inside the bundled all-object Swiss-file interval from 1800-01-01 06:00 UTC through 2400-01-10 20:00 UTC; accepted lower/upper dates are tested with representative positive and negative timezone offsets.
- **FR-1.7:** The frozen Hanoi fixture `2000-01-01 12:00:00 Asia/Ho_Chi_Minh, 21.0285 N, 105.8542 E, Placidus` matches Sun `280.071588 degrees`, Moon `219.810978 degrees`, ASC `14.346185 degrees`, and MC `280.133922 degrees` within `0.02 degrees`. Saturn, True Node, derived South Node, and Pallas are retrograde; Sun is direct.
- **FR-1.8:** Day/night for Part of Fortune is derived from the Sun's topocentric altitude relative to the astronomical horizon, not from selectable house numbers. Part of Fortune has ecliptic latitude `0`, unknown speed/retrograde, category `arabic_part`, and ID `derived:part-of-fortune`. Vertex has latitude `0`, unknown speed/retrograde, `is_angle=true`, category `angle`, and ID `angle:vertex`. South Node uses the True Node longitude plus 180 degrees, its speed/retrograde, category `lunar_point`, and ID `derived:true-south-node`.

### US-2: Analyze aspects reproducibly

As a chart user, I want configurable aspects and orbs so that line selection and strength are explicit.

- **FR-2.1:** The following default configuration is centralized. All 20 normalized objects are eligible by default; eligibility is configurable by ID/category.

| Aspect | Angle | Orb | Color | Opacity | Width | Dash | Layer |
|---|---:|---:|---|---:|---:|---|---:|
| Conjunction | 0 | 8 | `#7A4E9D` | 0.72 | 1.35 | solid | 5 |
| Opposition | 180 | 8 | `#D1495B` | 0.78 | 1.30 | solid | 4 |
| Trine | 120 | 7 | `#315FA8` | 0.74 | 1.15 | solid | 3 |
| Square | 90 | 7 | `#D1495B` | 0.76 | 1.20 | solid | 4 |
| Sextile | 60 | 6 | `#2E8B73` | 0.70 | 1.05 | solid | 2 |
| Quincunx | 150 | 3 | `#8A5CA8` | 0.58 | 0.95 | `5 4` | 1 |
| Semi-sextile | 30 | 2 | `#7C8796` | 0.42 | 0.80 | `2 4` | 0 |
| Semi-square | 45 | 2 | `#C56A75` | 0.48 | 0.85 | `3 3` | 1 |
| Sesquiquadrate | 135 | 2 | `#C56A75` | 0.48 | 0.85 | `3 3` | 1 |
| Quintile | 72 | 2 | `#8A6BBE` | 0.50 | 0.85 | `1 3` | 1 |
| Bi-quintile | 144 | 2 | `#8A6BBE` | 0.50 | 0.85 | `1 3` | 1 |

- **FR-2.2:** Each detected aspect records its exact separation, configured exact angle, allowed orb, actual orb difference, applying/separating/unknown state, normalized strength, color, opacity, width, dash pattern, and layer. Strength is `max(0, 1 - orb_difference / allowed_orb)`. If several definitions match, choose the lowest `orb_difference / allowed_orb`, then the earlier row above. Applying/separating is `unknown` when either point has unknown speed or their relative angular motion is effectively stationary. Otherwise it is derived from the instantaneous signed change in normalized orb, without a fixed forward step that can cross exactitude. A non-stationary aspect exactly at exactitude is `separating` because its next infinitesimal motion increases the orb.
- **FR-2.3:** Configuration is centralized and the renderer does not classify aspects itself.

### US-3: Render a high-fidelity vector wheel

As a chart reader, I want a legible wheel close to the detailed reference so that dense chart information remains understandable.

- **FR-3.1:** The SVG has named layers for background, outer zodiac ring, sign band, degree ring, house sectors/cusps, house-number ring, aspect web, object labels, four primary angles, and legend/metadata.
- **FR-3.2:** All 12 signs and names, 360 degree ticks with differentiated major marks plus one 30-minute subdivision tick between adjacent degree ticks, 12 house numbers/cusps, all objects, and all detected aspects are rendered.
- **FR-3.3:** ASC is fixed at 9 o'clock; all other longitudes preserve astronomical angular relationships.
- **FR-3.4:** Deterministic multi-track label placement enforces angular separation, retains leader lines to true positions, and avoids clipping the view box. Display angles preserve strict cyclic order across the closing seam: the last unwrapped display angle must remain less than the first plus 360 degrees. Object-label displacement is limited to 45 degrees from its true unwrapped angle; an arrangement that cannot satisfy the seam, collision, view, and displacement constraints raises `LayoutError` rather than returning a misleading layout.
- **FR-3.5:** Every object visibly shows its glyph, localized name, zodiac sign (symbol or compact localized name), degree/minute, and `Rx` when retrograde. Every primary angle visibly shows its label, zodiac sign, and degree/minute. These labels, planet colors, alternating house sectors, angle emphasis, reference-like blue/purple/gold rings, line opacity, and whitespace form a clear hierarchy at 1180 by 1180 pixels.
- **FR-3.6:** The SVG is valid XML, uses finite coordinates, contains a real background rectangle, and remains vector-first.
- **FR-3.7:** Structural visual acceptance is objective: one instance of each required named layer, 360 degree ticks, 12 sign sectors/labels, 12 house sectors/numbers/cusps, 20 complete object label groups and 20 true-position leaders, four complete primary angle groups, and one aspect line per serialized aspect. Tests inspect the required visible object and angle content, not only element counts. At 1180 pixels and a rasterized 360-pixel mobile review there are zero out-of-view/non-finite elements, zero missing glyph boxes, and zero intersections between the declared bounding boxes of different object label groups. A side-by-side raster comparison with both references is recorded after the last render change.

### US-4: Export and operate the package

As a developer, I want one API and CLI so that charts are reproducible without hidden state.

- **FR-4.1:** `create_natal_chart(...)` returns the normalized model; `chart.to_svg(path)` and `chart.to_json(path)` generate outputs.
- **FR-4.2:** `python -m natal_chart` accepts date, time, latitude, longitude, timezone, house system, locale, size, and output basename, then creates both files or exits non-zero with a clear error.
- **FR-4.3:** JSON contains birth data, explicit render settings (`locale` and square `size`), calculation/settings metadata, objects, houses, angles, aspects, and all values needed by the renderer. Loading validates longitude/sign/degree-minute consistency, primary-angle identities/oppositions, aspect endpoint/name consistency, and safe renderer style syntax. Loading the JSON into the same package version and rendering without overrides produces an SVG byte-identical to the originally configured render.
- **FR-4.4:** README documents installation, environment setup, dependencies, CLI/API usage, inputs/outputs, house/aspect configuration, localization, license caveat, and troubleshooting.
- **FR-4.5:** All internal imports are package-relative so both `python -m natal_chart` and normal package imports work from the repository root.
- **FR-4.6:** CLI output is pair-safe: both targets must be absent or regular non-symlink files; directories, symlinks, and other non-regular targets are refused unchanged. Both files are prepared as temporary siblings before publication, and any handled preparation/publication failure removes temporary or newly published partial output while preserving a previously complete pair.

## 3. Non-Functional Requirements

- **NFR-1 Accuracy:** Swiss Ephemeris file-backed calculations are used with speed flags and verified return flags; required calculation failures are not swallowed.
- **NFR-2 Determinism:** Identical input, configuration, package version, and ephemeris files produce stable normalized values and SVG structure.
- **NFR-3 Localization:** Vietnamese is the default display locale; English remains configurable.
- **NFR-4 Accessibility:** Text contrast is legible on light backgrounds, information is not encoded by color alone, and SVG layer/element IDs support inspection.
- **NFR-5 Performance:** A sample 20-object SVG/JSON pair generates within five seconds on the current development machine.
- **NFR-6 Security:** Output paths are explicit caller inputs; no network access, shell execution, secrets, or remote font dependency is introduced.

## 4. Known Reference Limitation

Only three expected placements are given (ASC Taurus 19 degrees, Sun Capricorn 0 degrees, Moon Leo 0 degrees). The full reference birth date, local time, location, timezone, house system, and source SVG/JSON are absent. Exact position-difference PASS/FAIL validation is therefore blocked; the implementation must report this rather than tune sample input to the screenshot.

## 5. Out of Scope

- Reconstructing missing birth input from pixels or altering input until positions match.
- Copying proprietary website code or claiming pixel-identical proprietary output.
- Integrating the Python package into the React/Capacitor/Android runtime.
- Replacing `src/services/astrology/westernCalculator.ts` or changing existing app routes.
- Installing a new astrology framework, adding a web service/database, deployment, publishing, or pushing commits.
- Editing `natal_chart/venv/`, Python caches, pytest caches, or existing `natal_chart/ephe/*.se1` binaries.

For this standalone package only, this specification supersedes the asteroid exclusion and unresolved node choice in `docs/tech/PLAN_ASTROLOGY_CHART_ACCURACY.md`: asteroids are required and the north-node policy is True Node with a derived opposing South Node.

## 6. Verification

```bash
cd /home/heocop/Projects/lich-viet-android
natal_chart/venv/bin/python -m pytest natal_chart/tests -q
natal_chart/venv/bin/python -m natal_chart --date 2000-01-01 --time 12:00:00 --lat 21.0285 --lng 105.8542 --timezone Asia/Ho_Chi_Minh --house-system placidus --output natal_chart/natal_chart
natal_chart/venv/bin/python -c "import json; d=json.load(open('natal_chart/natal_chart.json')); assert len(d['objects']) == 20 and len(d['houses']) == 12"
natal_chart/venv/bin/python -c "import xml.etree.ElementTree as ET; ET.parse('natal_chart/natal_chart.svg')"
rsvg-convert -w 1180 -h 1180 natal_chart/natal_chart.svg -o /tmp/natal-chart-review.png
project-regression status /home/heocop/Projects/lich-viet-android
```

## 7. Done When

- [x] All functional and non-functional requirements above have automated or explicit manual evidence.
- [x] Canonical `natal_chart/natal_chart.svg` and `natal_chart/natal_chart.json` are regenerated from the documented command.
- [x] The detailed reference and generated raster have been visually compared, with remaining differences recorded in the convergence report.
- [x] Missing reference birth data is reported as blocked rather than misrepresented as an accuracy pass.
