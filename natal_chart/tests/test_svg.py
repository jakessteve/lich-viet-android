from __future__ import annotations

from itertools import combinations
import math
from pathlib import Path
import re
import xml.etree.ElementTree as ET

import pytest

from natal_chart.localization import localized_angle_names, localized_object_names
from natal_chart.renderer import render_svg
from natal_chart.svg_renderer import SVGRenderer


SVG = "{http://www.w3.org/2000/svg}"
EXPECTED_LAYERS = (
    "background",
    "outer-zodiac-ring",
    "sign-band",
    "degree-ring",
    "house-sectors",
    "house-cusps",
    "house-number-ring",
    "aspect-web",
    "object-labels",
    "primary-angles",
    "legend-metadata",
)
ZODIAC_SYMBOLS = {
    "Aries": "♈",
    "Taurus": "♉",
    "Gemini": "♊",
    "Cancer": "♋",
    "Leo": "♌",
    "Virgo": "♍",
    "Libra": "♎",
    "Scorpio": "♏",
    "Sagittarius": "♐",
    "Capricorn": "♑",
    "Aquarius": "♒",
    "Pisces": "♓",
}


def parse_svg(svg: str) -> ET.Element:
    return ET.fromstring(svg)


def elements_with_role(root: ET.Element, role: str) -> list[ET.Element]:
    return root.findall(f".//*[@data-role='{role}']")


def declared_box(element: ET.Element) -> tuple[float, float, float, float]:
    return tuple(
        float(element.attrib[f"data-bbox-{key}"])
        for key in ("x", "y", "width", "height")
    )


def boxes_intersect(
    first: tuple[float, float, float, float],
    second: tuple[float, float, float, float],
) -> bool:
    ax, ay, aw, ah = first
    bx, by, bw, bh = second
    return not (
        ax + aw <= bx or bx + bw <= ax or ay + ah <= by or by + bh <= ay
    )


def test_svg_has_accessible_root_exact_layers_and_structural_counts(hanoi_chart):
    root = parse_svg(render_svg(hanoi_chart))

    assert root.tag == f"{SVG}svg"
    assert root.attrib["role"] == "img"
    assert root.attrib["aria-labelledby"] == "chart-title chart-description"
    assert root.find(f"{SVG}title").attrib["id"] == "chart-title"
    assert root.find(f"{SVG}desc").attrib["id"] == "chart-description"
    assert tuple(
        element.attrib["id"]
        for element in root.findall(f"{SVG}g[@data-layer='true']")
    ) == EXPECTED_LAYERS

    background = root.find(f"{SVG}g[@id='background']/{SVG}rect")
    assert background is not None
    assert background.attrib["width"] == "1180"
    assert background.attrib["height"] == "1180"
    assert background.attrib["fill"] == "#FBFAF7"

    expected_counts = {
        "degree-tick": 360,
        "minute-tick": 360,
        "sign-sector": 12,
        "sign-label": 12,
        "house-sector": 12,
        "house-number": 12,
        "house-cusp": 12,
        "object-label": 20,
        "true-position-leader": 20,
        "primary-angle": 4,
        "aspect-line": len(hanoi_chart.aspects),
    }
    assert {
        role: len(elements_with_role(root, role))
        for role in expected_counts
    } == expected_counts
    minute_ticks = elements_with_role(root, "minute-tick")
    assert {tick.attrib["data-minute"] for tick in minute_ticks} == {"30"}
    assert {tick.attrib["data-degree"] for tick in minute_ticks} == {
        str(degree) for degree in range(360)
    }


@pytest.mark.parametrize("locale", ["vi", "en"])
def test_every_object_label_visibly_contains_complete_position_content(
    hanoi_chart, locale
):
    root = parse_svg(render_svg(hanoi_chart, locale=locale))

    for body in hanoi_chart.objects:
        group = root.find(
            f".//*[@data-role='object-label'][@data-object-id='{body.id}']"
        )
        assert group is not None
        sign_label = ZODIAC_SYMBOLS[body.sign]
        visible = " ".join("".join(group.itertext()).split())
        assert group.attrib["data-sign"] == body.sign
        assert group.attrib["data-sign-label"] == sign_label
        assert localized_object_names(body.id, locale, body.name).compact in visible
        assert body.symbol in visible
        assert sign_label in visible
        assert f"{body.degree:02d}°{body.minute:02d}′" in visible
        if body.retrograde:
            assert "Rx" in visible

        x, y, width, height = declared_box(group)
        for text in group.findall(f"{SVG}text"):
            assert x <= float(text.attrib["x"]) <= x + width
            assert y <= float(text.attrib["y"]) <= y + height


@pytest.mark.parametrize("locale", ["vi", "en"])
def test_every_primary_angle_visibly_contains_label_sign_and_position(
    hanoi_chart, locale
):
    root = parse_svg(render_svg(hanoi_chart, locale=locale))

    for angle in hanoi_chart.angles.values():
        group = root.find(
            ".//*[@data-role='primary-angle']"
            f"[@data-angle-id='{angle.id}']"
        )
        assert group is not None
        sign_label = ZODIAC_SYMBOLS[angle.sign]
        visible = " ".join("".join(group.itertext()).split())
        assert group.attrib["data-sign"] == angle.sign
        assert group.attrib["data-sign-label"] == sign_label
        assert localized_angle_names(angle.id, locale, angle.name).compact in visible
        assert sign_label in visible
        assert f"{angle.degree:02d}°{angle.minute:02d}′" in visible
        for text in group.findall(f"{SVG}text"):
            assert 0.0 <= float(text.attrib["x"]) <= 1180.0
            assert 0.0 <= float(text.attrib["y"]) <= 1180.0


def test_ascendant_is_at_nine_oclock_and_longitudes_run_down_from_left(
    hanoi_chart,
):
    root = parse_svg(render_svg(hanoi_chart))
    ascendant = root.find(
        ".//*[@data-role='primary-angle'][@data-angle-id='angle:ascendant']"
    )
    assert ascendant is not None
    line = ascendant.find(f"{SVG}line")
    center = 590.0

    assert float(ascendant.attrib["data-screen-angle"]) == pytest.approx(270.0)
    assert float(line.attrib["x2"]) < center
    assert float(line.attrib["y2"]) == pytest.approx(center)

    asc_longitude = hanoi_chart.angles["Ascendant"].longitude
    just_after = SVGRenderer(hanoi_chart).screen_angle(asc_longitude + 10.0)
    assert just_after < 270.0


def test_aspect_web_consumes_serialized_endpoints_and_styles(hanoi_chart):
    root = parse_svg(render_svg(hanoi_chart))
    lines = elements_with_role(root, "aspect-line")

    assert [int(line.attrib["data-layer-order"]) for line in lines] == sorted(
        aspect.layer for aspect in hanoi_chart.aspects
    )
    by_pair = {
        (line.attrib["data-object-a-id"], line.attrib["data-object-b-id"]): line
        for line in lines
    }
    assert len(by_pair) == len(hanoi_chart.aspects)
    for aspect in hanoi_chart.aspects:
        line = by_pair[(aspect.object_a_id, aspect.object_b_id)]
        assert line.attrib["data-aspect-name"] == aspect.aspect_name
        assert line.attrib["stroke"] == aspect.color
        assert float(line.attrib["data-configured-opacity"]) == pytest.approx(
            aspect.opacity
        )
        assert float(line.attrib["data-configured-width"]) == pytest.approx(
            aspect.width
        )
        assert 0.0 < float(line.attrib["stroke-opacity"]) < aspect.opacity
        assert 0.0 < float(line.attrib["stroke-width"]) <= aspect.width
        assert line.attrib["stroke-dasharray"] == (
            "none" if aspect.dash_pattern == "solid" else aspect.dash_pattern
        )
        assert float(line.attrib["data-strength"]) == pytest.approx(
            aspect.strength
        )

    legend_entries = elements_with_role(root, "aspect-legend-entry")
    assert {entry.attrib["data-aspect-name"] for entry in legend_entries} == {
        aspect.aspect_name for aspect in hanoi_chart.aspects
    }
    assert all(entry.find(f"{SVG}text") is not None for entry in legend_entries)


@pytest.mark.parametrize("size", [1180, 360])
def test_declared_object_boxes_are_in_view_and_do_not_intersect(
    hanoi_chart, size
):
    root = parse_svg(render_svg(hanoi_chart, size=size))
    labels = elements_with_role(root, "object-label")
    boxes = [declared_box(label) for label in labels]

    assert len(boxes) == 20
    for x, y, width, height in boxes:
        assert all(math.isfinite(value) for value in (x, y, width, height))
        assert 0.0 <= x < x + width <= size
        assert 0.0 <= y < y + height <= size
    for first, second in combinations(boxes, 2):
        assert not boxes_intersect(first, second)


def test_svg_is_deterministic_localized_finite_and_size_configurable(hanoi_chart):
    first = render_svg(hanoi_chart, size=360, locale="vi")
    second = render_svg(hanoi_chart, size=360, locale="vi")
    english = render_svg(hanoi_chart, size=360, locale="en")

    assert first == second
    vi_root = parse_svg(first)
    en_root = parse_svg(english)
    assert vi_root.attrib["viewBox"] == "0 0 360 360"
    assert vi_root.attrib["data-locale"] == "vi"
    assert en_root.attrib["data-locale"] == "en"
    assert "M.Trời" in "".join(vi_root.itertext())
    assert "Sun" in "".join(en_root.itertext())
    assert not re.search(r"(?<![A-Za-z])(?:nan|inf)(?![A-Za-z])", first, re.I)


def test_zodiac_and_rare_object_glyphs_force_text_presentation(hanoi_chart):
    root = parse_svg(render_svg(hanoi_chart))
    zodiac_symbols = elements_with_role(root, "zodiac-symbol")
    assert len(zodiac_symbols) == 12
    assert all(element.text.endswith("\ufe0e") for element in zodiac_symbols)

    by_id = {body.id: body for body in hanoi_chart.objects}
    for object_id in (
        "planet:pluto",
        "centaur:chiron",
        "lunar-point:mean-lilith",
        "lunar-point:true-north-node",
        "derived:true-south-node",
        "asteroid:ceres",
        "asteroid:pallas",
        "asteroid:juno",
        "asteroid:vesta",
    ):
        group = root.find(f".//*[@data-role='object-label'][@data-object-id='{object_id}']")
        assert group is not None
        assert f"{by_id[object_id].symbol}\ufe0e" in "".join(group.itertext())
        assert "□" not in "".join(group.itertext())


def test_renderer_modules_are_data_only_and_do_not_calculate_aspects_or_ephemeris():
    package = Path(__file__).parents[1]
    source = "\n".join(
        (package / filename).read_text(encoding="utf-8")
        for filename in ("svg_renderer.py", "renderer.py")
    ).lower()

    for forbidden in (
        "swisseph",
        "calculate_aspects",
        "calculate_natal_chart",
        "from .calculations",
        "from .aspects",
    ):
        assert forbidden not in source
