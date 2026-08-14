from __future__ import annotations

import pytest
import swisseph as swe

from natal_chart.angles import build_part_of_fortune, solar_altitude
from natal_chart.planets import EphemerisError


def test_solar_altitude_uses_topocentric_swiss_equatorial_position(monkeypatch):
    seen = {}

    def fake_set_topo(longitude, latitude, altitude):
        seen["topo"] = (longitude, latitude, altitude)

    def fake_set_ephe_path(path):
        seen["ephe_path"] = path

    def fake_calc_ut(jd_ut, body_id, flags):
        seen["calc"] = (jd_ut, body_id, flags)
        return (10.0, 20.0, 1.0, 0.1, 0.0, 0.0), flags

    def fake_azalt(jd_ut, mode, geopos, pressure, temperature, position):
        seen["azalt"] = (jd_ut, mode, geopos, pressure, temperature, position)
        return 180.0, -2.5, -2.0

    monkeypatch.setattr("natal_chart.angles.swe.set_topo", fake_set_topo)
    monkeypatch.setattr("natal_chart.planets.swe.set_ephe_path", fake_set_ephe_path)
    monkeypatch.setattr("natal_chart.angles.swe.calc_ut", fake_calc_ut)
    monkeypatch.setattr("natal_chart.angles.swe.azalt", fake_azalt)

    altitude = solar_altitude(2451544.5, 21.0, 105.0)

    flags = seen["calc"][2]
    assert flags & swe.FLG_SWIEPH
    assert flags & swe.FLG_SPEED
    assert flags & swe.FLG_TOPOCTR
    assert flags & swe.FLG_EQUATORIAL
    assert seen["ephe_path"].endswith("natal_chart/ephe")
    assert seen["topo"] == (105.0, 21.0, 0.0)
    assert altitude == -2.5


def test_solar_altitude_rejects_missing_topocentric_return_flags(monkeypatch):
    monkeypatch.setattr(
        "natal_chart.angles.swe.set_topo", lambda *_args, **_kwargs: None
    )
    monkeypatch.setattr(
        "natal_chart.angles.swe.calc_ut",
        lambda *_args, **_kwargs: (
            (10.0, 20.0, 1.0, 0.1, 0.0, 0.0),
            swe.FLG_SWIEPH | swe.FLG_SPEED,
        ),
    )

    with pytest.raises(EphemerisError, match="topocentric Sun.*requested flags"):
        solar_altitude(2451544.5, 21.0, 105.0)


def test_solar_altitude_ignores_preexisting_global_topocentric_state():
    baseline = solar_altitude(2451544.5, 21.0, 105.0)

    swe.set_topo(-179.0, -89.0, 8000.0)
    repeated = solar_altitude(2451544.5, 21.0, 105.0)

    assert repeated == pytest.approx(baseline)


@pytest.mark.parametrize(
    ("altitude", "expected"),
    [
        (5.0, 310.0),  # day: ASC + Moon - Sun
        (-5.0, 70.0),  # night: ASC + Sun - Moon
    ],
)
def test_part_of_fortune_uses_horizon_sect_not_house_number(
    monkeypatch, altitude, expected
):
    monkeypatch.setattr(
        "natal_chart.angles.solar_altitude", lambda *_args, **_kwargs: altitude
    )

    part = build_part_of_fortune(
        jd_ut=2451544.5,
        latitude=21.0,
        longitude=105.0,
        ascendant_longitude=10.0,
        sun_longitude=100.0,
        moon_longitude=40.0,
    )

    assert part.longitude == expected
    assert part.id == "derived:part-of-fortune"
    assert part.category == "arabic_part"
    assert part.latitude == 0.0
    assert part.speed is None
    assert part.retrograde is None


def test_frozen_fixture_is_a_day_chart_and_uses_day_formula(hanoi_chart):
    by_name = {body.name: body for body in hanoi_chart.objects}
    expected = (
        hanoi_chart.angles["Ascendant"].longitude
        + by_name["Moon"].longitude
        - by_name["Sun"].longitude
    ) % 360.0

    assert by_name["Part of Fortune"].longitude == pytest.approx(expected)
