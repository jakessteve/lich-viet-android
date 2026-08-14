# Natal Chart Feature Constitution

> Created: 2026-08-14  
> Scope: `natal_chart/` high-fidelity natal-wheel calculation, serialization, rendering, and validation

## Governing Principles

1. **Astronomy before presentation.** Local birth input is converted through timezone-aware UTC and Julian Day processing before any tropical longitudes, houses, angles, or aspects are derived. Rendering must never invent or adjust calculated values to resemble a screenshot.
2. **Normalized data is the contract.** `natal_chart/models.py` owns a JSON-compatible chart model. `natal_chart/svg_renderer.py` consumes only that model and explicit style/localization configuration; it must not call the ephemeris.
3. **Complete, extensible object registry.** Required planets, points, nodes, angles, and asteroids are declared as data so an object can be added without rewriting layout or SVG-layer logic. Unsupported calculations must fail explicitly, not silently disappear.
4. **Reference fidelity with honest limits.** Geometry, hierarchy, typography, ring structure, and aspect styling should approach the supplied chiemtinhlaso.com image, but unknown proprietary rules and missing reference birth data must be reported as limitations.
5. **Deterministic, scalable output.** SVG and JSON generated from the same normalized chart must be reproducible for identical inputs, contain no invalid numeric coordinates, and remain vector-first.
6. **Test-driven domain changes.** Calculation and model defects receive a failing test in `natal_chart/tests/` before implementation. Visual changes require regenerated output plus structural SVG validation and image inspection.
7. **Vietnamese-first configuration.** Vietnamese zodiac/object names live in `natal_chart/localization.py`; style and aspect behavior live in centralized configuration rather than being scattered through rendering code.
8. **Surgical integration.** Existing unrelated changes outside `natal_chart/` are frozen. Updating version declarations for the packages already used by `natal_chart/` and declaring its existing test runner in `natal_chart/requirements.txt` are authorized; package installation, adding another framework, mobile-app integration, migration, push, or architectural rewrite are not.

## Required Evidence

- Calculation tests prove required objects, 12 valid house cusps, angle oppositions, aspect angle/orb classification, timezone handling, and known reference checks where input data is available.
- Serialization tests prove the normalized JSON contract and absence of hidden renderer state.
- SVG tests prove valid XML, required layers and labels, finite coordinates, and complete house/object rendering.
- The CLI generates a named SVG and JSON pair from a documented command.
- Visual review compares a rasterized generated chart with the two supplied reference images and records remaining differences.

## Out of Scope

- Reverse-engineering proprietary chiemtinhlaso.com source code or undisclosed algorithms.
- Fabricating the complete reference birth input from the screenshot alone.
- Replacing the existing TypeScript Western astrology pipeline or wiring the Python package into the Android UI.
- Network services, databases, authentication, deployment, and publishing.

## Verification Commands

```bash
cd /home/heocop/Projects/lich-viet-android
natal_chart/venv/bin/python -m pytest natal_chart/tests -q
natal_chart/venv/bin/python -m natal_chart.cli --help
python -c "import xml.etree.ElementTree as ET; ET.parse('natal_chart/natal_chart.svg')"
```

## Amendment Policy

Changes to these principles require a written rationale in the implementation plan and must preserve calculation integrity, normalized-data independence, and reproducible validation.
