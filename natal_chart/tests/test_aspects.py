from __future__ import annotations

import pytest
from pydantic import ValidationError

from natal_chart.aspects import (
    ASPECT_DEFINITIONS,
    AspectDefinition,
    AspectEligibility,
    calculate_aspects,
)
from natal_chart.localization import (
    ANGLE_LABELS,
    OBJECT_LABELS,
    SIGN_LABELS,
    localized_angle_names,
    localized_object_names,
    localized_sign_names,
)
from natal_chart.models import Aspect, CelestialBody, OBJECT_REGISTRY
from natal_chart.styles import (
    FONT_STACKS,
    LABEL_LAYOUT_STYLE,
    OBJECT_PALETTE,
    REFERENCE_COLORS,
    RING_RATIOS,
    TICK_HIERARCHY,
    ZODIAC_PALETTE,
)


EXPECTED_ASPECT_TABLE = (
    ("Conjunction", 0.0, 8.0, "#7A4E9D", 0.72, 1.35, "solid", 5),
    ("Opposition", 180.0, 8.0, "#D1495B", 0.78, 1.30, "solid", 4),
    ("Trine", 120.0, 7.0, "#315FA8", 0.74, 1.15, "solid", 3),
    ("Square", 90.0, 7.0, "#D1495B", 0.76, 1.20, "solid", 4),
    ("Sextile", 60.0, 6.0, "#2E8B73", 0.70, 1.05, "solid", 2),
    ("Quincunx", 150.0, 3.0, "#8A5CA8", 0.58, 0.95, "5 4", 1),
    ("Semi-sextile", 30.0, 2.0, "#7C8796", 0.42, 0.80, "2 4", 0),
    ("Semi-square", 45.0, 2.0, "#C56A75", 0.48, 0.85, "3 3", 1),
    ("Sesquiquadrate", 135.0, 2.0, "#C56A75", 0.48, 0.85, "3 3", 1),
    ("Quintile", 72.0, 2.0, "#8A6BBE", 0.50, 0.85, "1 3", 1),
    ("Bi-quintile", 144.0, 2.0, "#8A6BBE", 0.50, 0.85, "1 3", 1),
)


def make_body(
    object_id: str,
    name: str,
    longitude: float,
    speed: float | None,
    category: str = "planet",
    is_angle: bool = False,
) -> CelestialBody:
    return CelestialBody(
        id=object_id,
        name=name,
        name_vi=name,
        symbol="x",
        longitude=longitude,
        latitude=0.0,
        distance=None,
        speed=speed,
        sign="Aries",
        sign_vi="Bạch Dương",
        degree=int(longitude % 30),
        minute=0,
        retrograde=None if speed is None else speed < 0.0,
        is_angle=is_angle,
        category=category,
    )


def aspect_row(definition: AspectDefinition) -> tuple[object, ...]:
    return (
        definition.name,
        definition.angle,
        definition.orb,
        definition.color,
        definition.opacity,
        definition.width,
        definition.dash_pattern,
        definition.layer,
    )


def test_default_aspect_table_matches_the_exact_declared_order():
    assert tuple(map(aspect_row, ASPECT_DEFINITIONS)) == EXPECTED_ASPECT_TABLE


def test_wraparound_boundary_strength_and_serialized_style_contract():
    sun = make_body("planet:sun", "Sun", 359.0, 1.0)
    moon = make_body("planet:moon", "Moon", 1.0, 13.0)

    aspect = calculate_aspects([sun, moon])[0]

    assert aspect.model_dump() == {
        "aspect_name": "Conjunction",
        "object_a_id": "planet:sun",
        "object_a_name": "Sun",
        "object_b_id": "planet:moon",
        "object_b_name": "Moon",
        "separation": pytest.approx(2.0),
        "exact_angle": 0.0,
        "allowed_orb": 8.0,
        "orb_difference": pytest.approx(2.0),
        "state": "separating",
        "strength": pytest.approx(0.75),
        "color": "#7A4E9D",
        "opacity": 0.72,
        "width": 1.35,
        "dash_pattern": "solid",
        "layer": 5,
    }


def test_orb_boundary_is_inclusive_and_just_outside_is_excluded():
    square = (ASPECT_DEFINITIONS[3],)
    sun = make_body("planet:sun", "Sun", 0.0, 1.0)
    at_boundary = make_body("planet:moon", "Moon", 83.0, 13.0)
    outside = make_body("planet:moon", "Moon", 82.999, 13.0)

    assert len(calculate_aspects([sun, at_boundary], definitions=square)) == 1
    assert calculate_aspects([sun, outside], definitions=square) == []


def test_tie_break_uses_normalized_orb_then_declared_order():
    first = AspectDefinition("First", 10.0, 10.0, "#000000", 1.0, 1.0, "solid", 0)
    second = AspectDefinition("Second", 14.0, 2.0, "#111111", 1.0, 1.0, "solid", 0)
    a = make_body("planet:sun", "Sun", 0.0, 1.0)
    b = make_body("planet:moon", "Moon", 15.0, 1.0)

    tied = calculate_aspects([a, b], definitions=(first, second))
    assert tied[0].aspect_name == "First"

    closer = calculate_aspects(
        [a, b],
        definitions=(
            AspectDefinition("Wide", 9.0, 10.0, "#000000", 1.0, 1.0, "solid", 0),
            second,
        ),
    )
    assert closer[0].aspect_name == "Second"


@pytest.mark.parametrize(
    ("definition_index", "moon_longitude", "moon_speed", "expected"),
    [
        # Conjunction: both longitude sides, including the 0/360 seam.
        (0, 2.0, 0.0, "applying"),
        (0, 2.0, 2.0, "separating"),
        (0, 358.0, 2.0, "applying"),
        (0, 358.0, 0.0, "separating"),
        (0, 0.0, 2.0, "separating"),
        # Square: approaching and departing on both sides of exactitude.
        (3, 88.0, 2.0, "applying"),
        (3, 88.0, 0.0, "separating"),
        (3, 92.0, 0.0, "applying"),
        (3, 92.0, 2.0, "separating"),
        (3, 90.0, 2.0, "separating"),
        # Opposition: both sides of its folded 180-degree seam.
        (1, 178.0, 2.0, "applying"),
        (1, 178.0, 0.0, "separating"),
        (1, 182.0, 0.0, "applying"),
        (1, 182.0, 2.0, "separating"),
        (1, 180.0, 2.0, "separating"),
        (0, 2.0, None, "unknown"),
        (0, 2.0, 1.0, "unknown"),
        (0, 2.0, 1.0 + 5e-13, "unknown"),
    ],
)
def test_motion_state_uses_instantaneous_signed_normalized_orb_derivative(
    definition_index, moon_longitude, moon_speed, expected
):
    sun = make_body("planet:sun", "Sun", 0.0, 1.0)
    moon = make_body("planet:moon", "Moon", moon_longitude, moon_speed)

    aspect = calculate_aspects(
        [sun, moon], definitions=(ASPECT_DEFINITIONS[definition_index],)
    )[0]

    assert aspect.state == expected


@pytest.mark.parametrize(
    ("definition_index", "moon_longitude", "relative_speed", "expected"),
    [
        pytest.param(
            0, 359.999999, 1.0, "applying", id="conjunction-359-applying"
        ),
        pytest.param(
            0, 359.999999, -1.0, "separating", id="conjunction-359-separating"
        ),
        pytest.param(
            0, 0.000001, -1.0, "applying", id="conjunction-000-applying"
        ),
        pytest.param(
            0, 0.000001, 1.0, "separating", id="conjunction-000-separating"
        ),
        pytest.param(3, 89.999999, 1.0, "applying", id="square-below-applying"),
        pytest.param(
            3, 89.999999, -1.0, "separating", id="square-below-separating"
        ),
        pytest.param(3, 90.000001, -1.0, "applying", id="square-above-applying"),
        pytest.param(
            3, 90.000001, 1.0, "separating", id="square-above-separating"
        ),
        pytest.param(
            1, 179.999999, 1.0, "applying", id="opposition-below-applying"
        ),
        pytest.param(
            1,
            179.999999,
            -1.0,
            "separating",
            id="opposition-below-separating",
        ),
        pytest.param(
            1, 180.000001, -1.0, "applying", id="opposition-above-applying"
        ),
        pytest.param(
            1,
            180.000001,
            1.0,
            "separating",
            id="opposition-above-separating",
        ),
    ],
)
def test_sub_step_motion_does_not_project_past_exactitude(
    definition_index, moon_longitude, relative_speed, expected
):
    sun = make_body("planet:sun", "Sun", 0.0, 0.0)
    moon = make_body(
        "planet:moon", "Moon", moon_longitude, relative_speed
    )

    aspect = calculate_aspects(
        [sun, moon], definitions=(ASPECT_DEFINITIONS[definition_index],)
    )[0]

    assert aspect.state == expected


@pytest.mark.parametrize(
    ("definition_index", "exact_longitude", "sun_speed", "moon_speed", "expected"),
    [
        pytest.param(0, 0.0, 0.0, 0.0, "unknown", id="conjunction-stationary"),
        pytest.param(0, 0.0, 0.0, None, "unknown", id="conjunction-moon-unknown"),
        pytest.param(0, 0.0, None, 1.0, "unknown", id="conjunction-sun-unknown"),
        pytest.param(0, 0.0, 0.0, 1.0, "separating", id="conjunction-exact-forward"),
        pytest.param(0, 0.0, 0.0, -1.0, "separating", id="conjunction-exact-reverse"),
        pytest.param(3, 90.0, 0.0, 0.0, "unknown", id="square-stationary"),
        pytest.param(3, 90.0, 0.0, None, "unknown", id="square-moon-unknown"),
        pytest.param(3, 90.0, None, 1.0, "unknown", id="square-sun-unknown"),
        pytest.param(3, 90.0, 0.0, 1.0, "separating", id="square-exact-forward"),
        pytest.param(3, 90.0, 0.0, -1.0, "separating", id="square-exact-reverse"),
        pytest.param(1, 180.0, 0.0, 0.0, "unknown", id="opposition-stationary"),
        pytest.param(1, 180.0, 0.0, None, "unknown", id="opposition-moon-unknown"),
        pytest.param(1, 180.0, None, 1.0, "unknown", id="opposition-sun-unknown"),
        pytest.param(1, 180.0, 0.0, 1.0, "separating", id="opposition-exact-forward"),
        pytest.param(1, 180.0, 0.0, -1.0, "separating", id="opposition-exact-reverse"),
    ],
)
def test_exactitude_is_separating_unless_motion_is_stationary_or_unknown(
    definition_index, exact_longitude, sun_speed, moon_speed, expected
):
    sun = make_body("planet:sun", "Sun", 0.0, sun_speed)
    moon = make_body("planet:moon", "Moon", exact_longitude, moon_speed)

    aspect = calculate_aspects(
        [sun, moon], definitions=(ASPECT_DEFINITIONS[definition_index],)
    )[0]

    assert aspect.state == expected


def test_default_eligibility_includes_all_20_objects_and_filters_by_id_category(
    hanoi_chart,
):
    default = AspectEligibility()
    assert all(default.allows(body) for body in hanoi_chart.objects)

    asteroids_except_pallas = AspectEligibility(
        include_categories=frozenset({"asteroid"}),
        exclude_ids=frozenset({"asteroid:pallas"}),
    )
    allowed = {
        body.id for body in hanoi_chart.objects if asteroids_except_pallas.allows(body)
    }
    assert allowed == {"asteroid:ceres", "asteroid:juno", "asteroid:vesta"}

    only_sun = AspectEligibility(include_ids=frozenset({"planet:sun"}))
    assert [body.id for body in hanoi_chart.objects if only_sun.allows(body)] == [
        "planet:sun"
    ]


def test_chart_calculation_serializes_preclassified_aspects(hanoi_chart):
    assert hanoi_chart.aspects
    object_ids = {entry.id for entry in OBJECT_REGISTRY}
    for aspect in hanoi_chart.aspects:
        assert aspect.object_a_id in object_ids
        assert aspect.object_b_id in object_ids
        assert 0.0 <= aspect.strength <= 1.0
        assert aspect.dash_pattern


def test_aspect_model_rejects_inconsistent_orb_and_strength_contract():
    valid = calculate_aspects(
        [
            make_body("planet:sun", "Sun", 0.0, 1.0),
            make_body("planet:moon", "Moon", 84.0, 13.0),
        ],
        definitions=(ASPECT_DEFINITIONS[3],),
    )[0].model_dump()

    invalid_strength = {**valid, "strength": 0.5}
    with pytest.raises(ValidationError, match="strength formula"):
        Aspect.model_validate(invalid_strength)

    invalid_orb = {**valid, "orb_difference": valid["allowed_orb"] + 0.1}
    with pytest.raises(ValidationError, match="allowed orb"):
        Aspect.model_validate(invalid_orb)


@pytest.mark.parametrize(
    ("field", "unsafe_value"),
    [
        pytest.param("color", "url(#malicious)", id="unsafe-color-url"),
        pytest.param("color", "#1234", id="unsupported-color-length"),
        pytest.param("dash_pattern", "url(#malicious)", id="unsafe-dash-url"),
        pytest.param("dash_pattern", "0 0", id="all-zero-dash"),
        pytest.param("dash_pattern", "1 -2", id="negative-dash"),
        pytest.param("dash_pattern", "nan 2", id="non-finite-dash"),
    ],
)
def test_aspect_model_rejects_unsafe_serialized_svg_styles(field, unsafe_value):
    valid = calculate_aspects(
        [
            make_body("planet:sun", "Sun", 0.0, 1.0),
            make_body("planet:moon", "Moon", 84.0, 13.0),
        ],
        definitions=(ASPECT_DEFINITIONS[3],),
    )[0].model_dump()

    with pytest.raises(ValidationError):
        Aspect.model_validate({**valid, field: unsafe_value})


def test_aspect_model_accepts_declared_safe_svg_style_syntax():
    valid = calculate_aspects(
        [
            make_body("planet:sun", "Sun", 0.0, 1.0),
            make_body("planet:moon", "Moon", 84.0, 13.0),
        ],
        definitions=(ASPECT_DEFINITIONS[3],),
    )[0].model_dump()

    assert Aspect.model_validate({**valid, "color": "#AbC"}).color == "#AbC"
    assert (
        Aspect.model_validate({**valid, "dash_pattern": "1.5, 2"}).dash_pattern
        == "1.5, 2"
    )


def test_localization_covers_all_semantic_ids_and_has_deterministic_fallbacks():
    assert len(SIGN_LABELS) == 12
    assert set(OBJECT_LABELS) == {entry.id for entry in OBJECT_REGISTRY}
    assert set(ANGLE_LABELS) == {
        "angle:ascendant",
        "angle:descendant",
        "angle:midheaven",
        "angle:imum-coeli",
    }

    for locale in ("en", "vi"):
        for sign in SIGN_LABELS:
            labels = localized_sign_names(sign, locale)
            assert labels.compact and labels.full
        for entry in OBJECT_REGISTRY:
            labels = localized_object_names(entry.id, locale)
            assert labels.compact and labels.full
        for angle_id in ANGLE_LABELS:
            labels = localized_angle_names(angle_id, locale)
            assert labels.compact and labels.full

    assert localized_object_names("custom:new-point", "fr", "New Point").full == "New Point"
    assert localized_sign_names("Ophiuchus", "vi").full == "Ophiuchus"


def test_vietnamese_true_node_names_use_requested_traditional_labels():
    north = localized_object_names("lunar-point:true-north-node", "vi")
    south = localized_object_names("derived:true-south-node", "vi")

    assert (north.compact, north.full) == ("La Hầu", "La Hầu")
    assert (south.compact, south.full) == ("Kế Đô", "Kế Đô")


def test_style_registries_centralize_renderer_inputs_without_rendering():
    assert set(RING_RATIOS) >= {
        "outer_edge",
        "zodiac_inner",
        "degree_ring",
        "house_ring",
        "aspect_radius",
    }
    assert all(0.0 < radius <= 0.5 for radius in RING_RATIOS.values())
    assert set(FONT_STACKS) >= {"text", "symbol", "numeric"}
    assert len(ZODIAC_PALETTE) == 12
    assert set(OBJECT_PALETTE) == {entry.id for entry in OBJECT_REGISTRY}
    assert set(TICK_HIERARCHY) == {"minor", "medium", "major"}
    assert len(LABEL_LAYOUT_STYLE.lane_radius_ratios) >= 3
    assert set(REFERENCE_COLORS) >= {"blue", "purple", "gold", "background"}
