# High-Fidelity Natal Chart Generator

`natal_chart` is an offline Python package that calculates a tropical natal
chart from timezone-aware birth input and exports a deterministic SVG/JSON
pair. The normalized chart includes 20 objects, 12 Placidus or Whole Sign
houses, four primary angles, and serialized aspect analysis.

The renderer is data-only: it consumes the normalized JSON-compatible model
and never recalculates positions or aspects.

## Requirements and setup

- Python 3.10 or newer
- The bundled Swiss Ephemeris files in `natal_chart/ephe/`
- Locally installed fonts from the declared Noto/DejaVu fallback stacks

From the repository root:

```bash
python3 -m venv natal_chart/venv
natal_chart/venv/bin/python -m pip install -r natal_chart/requirements.txt
```

The requirements file pins the versions verified in this workspace:
`pyswisseph`, `pytz`, `pydantic`, and the existing `pytest` test runner. The
package does not use remote fonts, network calls, scripts, or renderer
dependencies.

## CLI

Generate the canonical Hanoi fixture in Vietnamese at 1180 pixels:

```bash
natal_chart/venv/bin/python -m natal_chart \
  --date 2000-01-01 \
  --time 12:00:00 \
  --lat 21.0285 \
  --lng 105.8542 \
  --timezone Asia/Ho_Chi_Minh \
  --house-system placidus \
  --locale vi \
  --size 1180 \
  --output natal_chart/natal_chart
```

This creates `natal_chart/natal_chart.svg` and
`natal_chart/natal_chart.json`. Missing parent directories are created. Invalid
dates, times, timezones, coordinates, house systems, locales, or sizes return a
non-zero exit status and a concise error on stderr. The CLI prepares both files
as temporary siblings before publication. If preparation or publication fails,
it removes partial output and restores any prior complete SVG/JSON pair.
Existing targets must be regular, non-symlink files; directories, links
(including dangling links), FIFOs, sockets, and device nodes are refused
unchanged before temporary or backup files are written.

CLI options:

- `--date`, `--time`: local wall time in `YYYY-MM-DD` and `HH:MM:SS` form.
- `--lat`, `--lng`: geographic latitude and longitude.
- `--timezone`: IANA name such as `Asia/Ho_Chi_Minh`.
- `--house-system`: `placidus` or `whole_sign`.
- `--locale`: `vi` (default) or `en`.
- `--size`: positive square SVG dimension; default `1180`.
- `--output`: explicit basename for the `.svg` and `.json` files.

## Python API

```python
from natal_chart import create_natal_chart

chart = create_natal_chart(
    date="2000-01-01",
    time="12:00:00",
    latitude=21.0285,
    longitude=105.8542,
    timezone="Asia/Ho_Chi_Minh",
    house_system="placidus",
)

chart.to_json("output/chart.json")
chart.to_svg("output/chart.svg", width=1180, height=1180)
```

For explicit rendering settings:

```python
from natal_chart.renderer import export_svg

export_svg(chart, "output/chart-en.svg", size=360, locale="en")
```

`create_natal_chart` returns a validated `NatalChartData`. Pass `locale="en"`
and `size=360` to store non-default render settings on the model. JSON includes
birth and calculation settings, explicit `render_settings` (`locale` and
positive square `size`), ordered objects, houses, primary angles, and each
aspect's endpoints, geometry, state, strength, color, opacity, width, dash, and
layer. It can be loaded with
`NatalChartData.model_validate_json(path.read_text())`.

Loading validates that every serialized sign and degree/minute matches its
longitude, primary angle IDs/names and oppositions are exact, aspect endpoints
and names refer to the ordered object registry, aspect separation matches those
endpoint longitudes, and renderer colors/dash lists use safe SVG syntax.

`render_svg(chart)` and `chart.to_svg(path)` use the serialized render settings
when no override is supplied. Therefore a JSON payload loaded by the same
package version reproduces its paired SVG byte-for-byte. Explicit `size` or
`locale` overrides apply only to that export and do not mutate the model.

## Calculation and display configuration

- Local dates are supported from `1800-01-02` through `2399-12-31`; the
  converted UTC instant must also be inside the bundled all-object ephemeris
  interval documented in the feature specification.
- Timezones use strict IANA localization. Ambiguous and nonexistent local wall
  times are rejected rather than guessed.
- `placidus` uses Swiss house cusps. `whole_sign` derives twelve 30-degree
  cusps from the astronomical Ascendant sign while preserving ASC and MC.
- The centralized 11-aspect table, eligibility selectors, orbs, strengths,
  states, colors, dash patterns, and layer order live in `aspects.py`.
- Vietnamese and English compact/full labels live in `localization.py`.
  The requested Vietnamese True/North Node and South Node labels are `La Hầu`
  and `Kế Đô`, respectively.
- Ring geometry, fonts, palettes, ticks, and label lanes live in `styles.py`.
- SVG longitudes are rotated so ASC is exactly at 9 o'clock. Object label
  leaders retain the true screen position while deterministic radial lanes
  prevent overlap.
- Every visible object label contains its glyph, localized compact name,
  zodiac glyph, degree/minute, and `Rx` when applicable. Each primary angle
  likewise shows its angle label, zodiac glyph, and degree/minute.

## Output structure and accessibility

The SVG is vector-first XML with a real warm background and named layers for
the zodiac rings, degree ticks, houses, aspects, object labels, angles, and
legend/metadata. The degree ring has 360 differentiated whole-degree ticks and
360 subtle 30-minute subdivision ticks. It includes `<title>`, `<desc>`,
`role="img"`, stable semantic IDs/data attributes, and aspect dash/legend
labels so color is not the only encoding.

## Validation

```bash
PYTHONDONTWRITEBYTECODE=1 natal_chart/venv/bin/python -m pytest \
  -p no:cacheprovider -q natal_chart/tests
xmllint --noout natal_chart/natal_chart.svg
rsvg-convert -w 1180 -h 1180 natal_chart/natal_chart.svg \
  -o /tmp/natal-chart-1180.png
rsvg-convert -w 360 -h 360 natal_chart/natal_chart.svg \
  -o /tmp/natal-chart-360.png
```

## Troubleshooting

- **Invalid IANA timezone:** use a canonical IANA name, not an abbreviation.
- **Ambiguous/nonexistent local time:** supply an unambiguous local wall time;
  the package intentionally does not guess a DST fold.
- **Swiss fallback or missing body:** confirm the bundled `.se1` files are
  present and readable. Required-body failures are fatal and contextual.
- **`LayoutError`:** the declared label footprints cannot satisfy collision,
  view, cyclic-seam, and 45-degree displacement constraints at that geometry.
- **Different glyph appearance:** install Noto Sans, Noto Sans Symbols, and
  DejaVu Sans locally; no font is downloaded by the SVG.

## Reference and licensing limits

The supplied detailed image guides geometry and information density, and the
simplified image guides visual restraint. Its complete birth input is not
available, so this package does not claim an exact positional or pixel-identical
match and does not infer missing birth data from pixels.

The installed `pyswisseph` package identifies itself as GNU Affero General
Public License v3 in its package metadata. Swiss Ephemeris also offers a
professional-license route. Review the applicable upstream terms for your
distribution model; this note is a disclosure, not legal advice.
