from __future__ import annotations

import pytest
import swisseph as swe

from natal_chart.calculations import calculate_julian_day
from natal_chart.models import OBJECT_REGISTRY
from natal_chart.planets import (
    EphemerisError,
    SWISS_BODY_IDS,
    calculate_swiss_bodies,
    derive_south_node,
    swiss_calculation,
)


def test_registry_is_declarative_complete_and_stable():
    assert len(OBJECT_REGISTRY) == 20
    assert len(SWISS_BODY_IDS) == 17
    assert set(SWISS_BODY_IDS) < {entry.id for entry in OBJECT_REGISTRY}


def test_every_swiss_body_call_requests_file_ephemeris_and_speed(monkeypatch):
    seen_flags = []

    def fake_calc_ut(_jd_ut, _body_id, flags):
        seen_flags.append(flags)
        return (0.0, 0.0, 1.0, 0.1, 0.0, 0.0), flags

    monkeypatch.setattr("natal_chart.planets.swe.calc_ut", fake_calc_ut)

    bodies = calculate_swiss_bodies(2451544.5)

    assert len(bodies) == len(SWISS_BODY_IDS)
    assert len(seen_flags) == len(SWISS_BODY_IDS)
    assert all(flags & swe.FLG_SWIEPH for flags in seen_flags)
    assert all(flags & swe.FLG_SPEED for flags in seen_flags)


def test_package_resets_local_ephemeris_path_before_each_adapter_call(monkeypatch):
    events = []

    monkeypatch.setattr(
        "natal_chart.planets.swe.set_ephe_path",
        lambda path: events.append(("set_ephe_path", path)),
    )

    def fake_calc_ut(_jd_ut, _body_id, flags):
        events.append(("calc_ut", flags))
        return (0.0, 0.0, 1.0, 0.1, 0.0, 0.0), flags

    monkeypatch.setattr("natal_chart.planets.swe.calc_ut", fake_calc_ut)

    calculate_swiss_bodies(2451544.5)

    assert events[0][0] == "set_ephe_path"
    assert events[1][0] == "calc_ut"


def test_package_result_ignores_preexisting_global_ephemeris_and_topo_state():
    jd_ut = calculate_julian_day(
        "2000-01-01", "12:00:00", "Asia/Ho_Chi_Minh"
    )
    baseline = calculate_swiss_bodies(jd_ut)

    swe.set_ephe_path("/definitely/not/the/package/ephemeris")
    swe.set_topo(-179.0, -89.0, 8000.0)
    repeated = calculate_swiss_bodies(jd_ut)

    assert [body.model_dump() for body in repeated] == [
        body.model_dump() for body in baseline
    ]


def test_package_swiss_context_is_reentrant():
    with swiss_calculation():
        with swiss_calculation():
            result, flags = swe.calc_ut(
                2451544.5, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SPEED
            )

    assert 0.0 <= result[0] < 360.0
    assert flags & swe.FLG_SWIEPH


def test_moshier_fallback_is_rejected_with_body_context(monkeypatch):
    def fallback_calc_ut(_jd_ut, _body_id, _flags):
        return (
            (0.0, 0.0, 1.0, 0.1, 0.0, 0.0),
            swe.FLG_MOSEPH | swe.FLG_SPEED,
        )

    monkeypatch.setattr("natal_chart.planets.swe.calc_ut", fallback_calc_ut)

    with pytest.raises(EphemerisError, match=r"Sun.*Swiss.*fallback"):
        calculate_swiss_bodies(2451544.5)


def test_required_body_failure_is_fatal_and_contextual(monkeypatch):
    def missing_calc_ut(_jd_ut, _body_id, _flags):
        raise swe.Error("ephemeris file missing")

    monkeypatch.setattr("natal_chart.planets.swe.calc_ut", missing_calc_ut)

    with pytest.raises(EphemerisError, match=r"Sun.*ephemeris file missing"):
        calculate_swiss_bodies(2451544.5)


def test_real_ephemeris_positions_include_speed_and_derived_south_node():
    jd_ut = calculate_julian_day(
        "2000-01-01", "12:00:00", "Asia/Ho_Chi_Minh"
    )
    bodies = calculate_swiss_bodies(jd_ut)
    by_name = {body.name: body for body in bodies}
    south_node = derive_south_node(by_name["True Node"])

    assert by_name["Sun"].sign == "Capricorn"
    assert by_name["Sun"].speed is not None
    assert by_name["Pallas"].retrograde is True
    assert south_node.id == "derived:true-south-node"
    assert south_node.category == "lunar_point"
    assert south_node.longitude == pytest.approx(
        (by_name["True Node"].longitude + 180.0) % 360.0
    )
    assert south_node.speed == by_name["True Node"].speed
    assert south_node.retrograde == by_name["True Node"].retrograde


def test_bundled_asteroid_file_padding_supports_declared_upper_utc_endpoint():
    upper_utc_jd = 2597651.3333333335  # 2400-01-10 20:00 UTC

    bodies = calculate_swiss_bodies(upper_utc_jd)

    assert len(bodies) == 17
    assert all(body.speed is not None for body in bodies)
