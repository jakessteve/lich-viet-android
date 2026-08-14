from __future__ import annotations

import ast
from copy import deepcopy
import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from natal_chart import (
    NatalChartData,
    RenderSettings,
    SVGRenderer,
    create_natal_chart,
)
from natal_chart.models import CelestialBody
from natal_chart.renderer import export_json, export_svg, render_svg


ZODIAC_SIGNS = (
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
)


def position_fields(longitude: float) -> dict[str, object]:
    longitude %= 360.0
    within_sign = longitude % 30.0
    degree = int(within_sign)
    return {
        "longitude": longitude,
        "sign": ZODIAC_SIGNS[int(longitude // 30.0)],
        "degree": degree,
        "minute": int((within_sign - degree) * 60.0),
    }


def test_public_api_returns_normalized_chart_and_package_exports():
    chart = create_natal_chart(
        date="2000-01-01",
        time="12:00:00",
        latitude=21.0285,
        longitude=105.8542,
        timezone="Asia/Ho_Chi_Minh",
        house_system="placidus",
    )

    assert isinstance(chart, NatalChartData)
    assert SVGRenderer.__name__ == "SVGRenderer"
    assert len(chart.objects) == 20
    assert len(chart.houses) == 12
    assert chart.render_settings == RenderSettings(locale="vi", size=1180)


def test_json_export_is_deterministic_roundtrippable_and_complete(
    hanoi_chart, tmp_path
):
    output = tmp_path / "nested" / "chart.json"

    export_json(hanoi_chart, output)
    first = output.read_bytes()
    export_json(hanoi_chart, output)

    assert output.read_bytes() == first
    payload = json.loads(first)
    assert set(payload) == {
        "birth_data",
        "render_settings",
        "objects",
        "houses",
        "angles",
        "aspects",
    }
    assert payload["render_settings"] == {"locale": "vi", "size": 1180}
    assert payload["birth_data"]["house_system"] == "placidus"
    assert len(payload["objects"]) == 20
    assert len(payload["houses"]) == 12
    assert len(payload["angles"]) == 4
    assert payload["aspects"]
    assert NatalChartData.model_validate(payload) == hanoi_chart


def test_model_export_methods_create_safe_parent_directories(hanoi_chart, tmp_path):
    json_path = tmp_path / "deep" / "model" / "chart.json"
    svg_path = tmp_path / "deep" / "model" / "chart.svg"

    hanoi_chart.to_json(str(json_path))
    hanoi_chart.to_svg(str(svg_path), width=360, height=360)

    assert json_path.is_file()
    assert svg_path.is_file()
    assert NatalChartData.model_validate_json(json_path.read_text()) == hanoi_chart
    assert 'viewBox="0 0 360 360"' in svg_path.read_text()


def test_export_svg_accepts_explicit_locale_and_size(hanoi_chart, tmp_path):
    output = tmp_path / "en" / "chart.svg"

    export_svg(hanoi_chart, output, size=360, locale="en")

    rendered = output.read_text(encoding="utf-8")
    assert 'data-locale="en"' in rendered
    assert 'viewBox="0 0 360 360"' in rendered
    assert hanoi_chart.render_settings == RenderSettings(locale="vi", size=1180)


def test_nondefault_api_settings_roundtrip_to_byte_identical_svg(tmp_path):
    chart = create_natal_chart(
        date="2000-01-01",
        time="12:00:00",
        latitude=21.0285,
        longitude=105.8542,
        timezone="Asia/Ho_Chi_Minh",
        house_system="whole_sign",
        locale="en",
        size=360,
    )

    configured_svg = render_svg(chart)
    loaded = NatalChartData.model_validate_json(chart.model_dump_json())
    output = tmp_path / "configured.svg"
    loaded.to_svg(str(output))

    assert chart.render_settings == RenderSettings(locale="en", size=360)
    assert loaded.render_settings == chart.render_settings
    assert render_svg(loaded) == configured_svg
    assert output.read_text(encoding="utf-8") == configured_svg
    assert render_svg(chart, locale="vi", size=1180) != configured_svg
    assert chart.render_settings == RenderSettings(locale="en", size=360)


@pytest.mark.parametrize(
    "settings",
    [
        {"locale": "fr", "size": 1180},
        {"locale": "vi", "size": 0},
        {"locale": "vi", "size": -1},
        {"locale": "vi", "size": True},
    ],
)
def test_render_settings_are_strictly_validated(settings):
    with pytest.raises(ValidationError):
        RenderSettings.model_validate(settings)


@pytest.mark.parametrize(
    ("speed", "retrograde"),
    [
        pytest.param(1.0, True, id="positive-marked-retrograde"),
        pytest.param(-1.0, False, id="negative-marked-direct"),
        pytest.param(0.0, True, id="zero-marked-retrograde"),
    ],
)
def test_known_motion_rejects_inconsistent_retrograde_status(
    hanoi_chart, speed, retrograde
):
    payload = hanoi_chart.objects[0].model_dump()
    payload.update(speed=speed, retrograde=retrograde)

    with pytest.raises(ValidationError, match="retrograde"):
        CelestialBody.model_validate(payload)


@pytest.mark.parametrize(
    ("speed", "retrograde"),
    [
        pytest.param(1.0, False, id="positive-direct"),
        pytest.param(-1.0, True, id="negative-retrograde"),
        pytest.param(0.0, False, id="zero-direct"),
        pytest.param(None, None, id="unknown-pair"),
    ],
)
def test_known_and_unknown_motion_accept_consistent_retrograde_status(
    hanoi_chart, speed, retrograde
):
    payload = hanoi_chart.objects[0].model_dump()
    payload.update(speed=speed, retrograde=retrograde)

    body = CelestialBody.model_validate(payload)

    assert (body.speed, body.retrograde) == (speed, retrograde)


@pytest.mark.parametrize(
    ("section", "field", "wrong_value"),
    [
        pytest.param("objects", "sign", "Pisces", id="object-sign"),
        pytest.param("houses", "degree", 29, id="house-degree"),
        pytest.param("angles", "minute", 59, id="angle-minute"),
    ],
)
def test_json_loading_rejects_position_fields_inconsistent_with_longitude(
    hanoi_chart, section, field, wrong_value
):
    payload = deepcopy(hanoi_chart.model_dump())
    if section == "angles":
        payload[section]["Ascendant"][field] = wrong_value
    else:
        payload[section][0][field] = wrong_value

    with pytest.raises(ValidationError, match="longitude"):
        NatalChartData.model_validate(payload)


@pytest.mark.parametrize(
    ("field", "wrong_value"),
    [
        pytest.param("id", "angle:not-ascendant", id="wrong-id"),
        pytest.param("name", "Not Ascendant", id="wrong-name"),
    ],
)
def test_json_loading_rejects_primary_angle_identity_mismatch(
    hanoi_chart, field, wrong_value
):
    payload = deepcopy(hanoi_chart.model_dump())
    payload["angles"]["Ascendant"][field] = wrong_value

    with pytest.raises(ValidationError, match="Ascendant"):
        NatalChartData.model_validate(payload)


@pytest.mark.parametrize(
    ("moving_key", "fixed_key"),
    [
        pytest.param("Descendant", "Ascendant", id="asc-dsc"),
        pytest.param("Imum Coeli", "Midheaven", id="mc-ic"),
    ],
)
def test_json_loading_rejects_primary_angles_that_are_not_opposed(
    hanoi_chart, moving_key, fixed_key
):
    payload = deepcopy(hanoi_chart.model_dump())
    fixed_longitude = payload["angles"][fixed_key]["longitude"]
    payload["angles"][moving_key].update(
        position_fields(fixed_longitude + 179.0)
    )

    with pytest.raises(ValidationError, match="opposition"):
        NatalChartData.model_validate(payload)


@pytest.mark.parametrize(
    ("field", "wrong_value", "message"),
    [
        pytest.param(
            "object_a_id", "planet:not-present", "endpoint", id="missing-endpoint"
        ),
        pytest.param(
            "object_a_name", "Not the Sun", "name", id="misnamed-endpoint"
        ),
    ],
)
def test_json_loading_rejects_missing_or_misnamed_aspect_endpoints(
    hanoi_chart, field, wrong_value, message
):
    payload = deepcopy(hanoi_chart.model_dump())
    payload["aspects"][0][field] = wrong_value

    with pytest.raises(ValidationError, match=message):
        NatalChartData.model_validate(payload)


def test_json_loading_rejects_aspect_separation_unrelated_to_endpoints(hanoi_chart):
    payload = deepcopy(hanoi_chart.model_dump())
    aspect = payload["aspects"][0]
    aspect["separation"] += 0.01
    aspect["orb_difference"] = abs(aspect["separation"] - aspect["exact_angle"])
    aspect["strength"] = max(
        0.0, 1.0 - aspect["orb_difference"] / aspect["allowed_orb"]
    )

    with pytest.raises(ValidationError, match="separation"):
        NatalChartData.model_validate(payload)


def test_phase_three_package_modules_use_relative_internal_imports():
    package = Path(__file__).parents[1]
    internal_modules = {
        "angles",
        "aspects",
        "calculations",
        "cli",
        "label_layout",
        "localization",
        "models",
        "renderer",
        "styles",
        "svg_renderer",
    }
    for filename in ("__init__.py", "__main__.py", "cli.py", "renderer.py", "svg_renderer.py"):
        tree = ast.parse((package / filename).read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom) and node.module in internal_modules:
                assert node.level > 0, (filename, node.module)
