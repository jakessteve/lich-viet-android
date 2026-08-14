from __future__ import annotations

import math

import pytest

from natal_chart.calculations import calculate_julian_day, get_houses_and_angles
from natal_chart.angles import build_vertex


@pytest.fixture(scope="module")
def angle_data():
    jd_ut = calculate_julian_day(
        "2000-01-01", "12:00:00", "Asia/Ho_Chi_Minh"
    )
    return get_houses_and_angles(jd_ut, 21.0285, 105.8542, "placidus")


def test_primary_angle_oppositions_and_finite_longitudes(angle_data):
    _houses, angles = angle_data

    assert set(angles) == {"Ascendant", "Descendant", "Midheaven", "Imum Coeli"}
    assert all(math.isfinite(angle.longitude) for angle in angles.values())
    assert (angles["Descendant"].longitude - angles["Ascendant"].longitude) % 360 == pytest.approx(180.0)
    assert (angles["Imum Coeli"].longitude - angles["Midheaven"].longitude) % 360 == pytest.approx(180.0)


def test_vertex_has_honest_synthetic_semantics(angle_data):
    _houses, angles = angle_data
    vertex = build_vertex(185.64305551572264)

    assert angles["Ascendant"].is_angle is True
    assert vertex.id == "angle:vertex"
    assert vertex.category == "angle"
    assert vertex.is_angle is True
    assert vertex.latitude == 0.0
    assert vertex.speed is None
    assert vertex.retrograde is None
