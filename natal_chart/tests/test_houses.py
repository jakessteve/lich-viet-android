from __future__ import annotations

import math

import pytest
import swisseph as swe

from natal_chart.calculations import calculate_julian_day, get_houses_and_angles
from natal_chart.houses import HouseCalculationError


@pytest.fixture(scope="module")
def jd_ut():
    return calculate_julian_day(
        "2000-01-01", "12:00:00", "Asia/Ho_Chi_Minh"
    )


@pytest.mark.parametrize("house_system", ["placidus", "whole_sign"])
def test_supported_house_systems_return_twelve_finite_cusps(jd_ut, house_system):
    houses, _angles = get_houses_and_angles(
        jd_ut, 21.0285, 105.8542, house_system
    )

    assert len(houses) == 12
    assert [house.house_number for house in houses] == list(range(1, 13))
    assert all(math.isfinite(house.longitude) for house in houses)
    assert all(0.0 <= house.longitude < 360.0 for house in houses)


def test_whole_sign_cusps_start_at_ascendant_sign_but_keep_real_angles(jd_ut):
    placidus_houses, placidus_angles = get_houses_and_angles(
        jd_ut, 21.0285, 105.8542, "placidus"
    )
    whole_houses, whole_angles = get_houses_and_angles(
        jd_ut, 21.0285, 105.8542, "whole_sign"
    )

    assert whole_houses[0].longitude == 0.0
    assert [house.longitude for house in whole_houses] == [
        float(degree) for degree in range(0, 360, 30)
    ]
    assert whole_angles["Ascendant"].longitude == pytest.approx(
        placidus_angles["Ascendant"].longitude
    )
    assert whole_angles["Midheaven"].longitude == pytest.approx(
        placidus_angles["Midheaven"].longitude
    )
    assert placidus_houses[0].longitude != whole_houses[0].longitude


def test_unsupported_house_system_is_rejected(jd_ut):
    with pytest.raises(ValueError, match="house system"):
        get_houses_and_angles(jd_ut, 21.0285, 105.8542, "koch")


def test_swiss_house_failure_is_fatal_and_contextual(monkeypatch, jd_ut):
    def fail_houses(*_args, **_kwargs):
        raise swe.Error("polar circle")

    monkeypatch.setattr("natal_chart.houses.swe.houses", fail_houses)

    with pytest.raises(HouseCalculationError, match=r"Placidus.*polar circle"):
        get_houses_and_angles(jd_ut, 89.0, 105.8542, "placidus")


def test_house_adapter_resets_package_ephemeris_path(monkeypatch, jd_ut):
    events = []
    original_houses = swe.houses

    monkeypatch.setattr(
        "natal_chart.planets.swe.set_ephe_path",
        lambda path: events.append(("set_ephe_path", path)),
    )

    def recording_houses(*args, **kwargs):
        events.append(("houses", args[-1]))
        return original_houses(*args, **kwargs)

    monkeypatch.setattr("natal_chart.houses.swe.houses", recording_houses)

    get_houses_and_angles(jd_ut, 21.0285, 105.8542, "placidus")

    assert events[0][0] == "set_ephe_path"
    assert events[1][0] == "houses"
