from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
import json

import pytest
import pytz
import swisseph as swe
from pydantic import ValidationError

from natal_chart.calculations import (
    MAX_EPHEMERIS_UTC,
    MIN_EPHEMERIS_UTC,
    _validate_utc_ephemeris_instant,
    calculate_julian_day,
    calculate_natal_chart,
)
from natal_chart.models import NatalChartData, OBJECT_REGISTRY


EXPECTED_OBJECT_SCHEMA = (
    ("planet:sun", "Sun", "planet", False),
    ("planet:moon", "Moon", "planet", False),
    ("planet:mercury", "Mercury", "planet", False),
    ("planet:venus", "Venus", "planet", False),
    ("planet:mars", "Mars", "planet", False),
    ("planet:jupiter", "Jupiter", "planet", False),
    ("planet:saturn", "Saturn", "planet", False),
    ("planet:uranus", "Uranus", "planet", False),
    ("planet:neptune", "Neptune", "planet", False),
    ("planet:pluto", "Pluto", "planet", False),
    ("centaur:chiron", "Chiron", "centaur", False),
    ("lunar-point:mean-lilith", "Mean Lilith", "lunar_point", False),
    ("lunar-point:true-north-node", "True Node", "lunar_point", False),
    ("derived:true-south-node", "South Node", "lunar_point", False),
    ("derived:part-of-fortune", "Part of Fortune", "arabic_part", False),
    ("angle:vertex", "Vertex", "angle", True),
    ("asteroid:ceres", "Ceres", "asteroid", False),
    ("asteroid:pallas", "Pallas", "asteroid", False),
    ("asteroid:juno", "Juno", "asteroid", False),
    ("asteroid:vesta", "Vesta", "asteroid", False),
)


def test_local_birth_time_is_strictly_localized_and_converted_to_julian_day():
    jd_ut = calculate_julian_day(
        "2000-01-01", "12:00:00", "Asia/Ho_Chi_Minh"
    )

    assert jd_ut == pytest.approx(2451544.7083333335, abs=1e-9)


@pytest.mark.parametrize(
    ("date_str", "time_str", "timezone_str", "message"),
    [
        ("2000-01-01", "12:00:00", "Not/A_Timezone", "timezone"),
        ("2021-11-07", "01:30:00", "America/New_York", "ambiguous"),
        ("2021-03-14", "02:30:00", "America/New_York", "does not exist"),
        ("1800-01-01", "12:00:00", "UTC", "1800-01-02"),
        ("2400-01-01", "12:00:00", "UTC", "2399"),
    ],
)
def test_invalid_or_unsupported_birth_time_fails_clearly(
    date_str, time_str, timezone_str, message
):
    with pytest.raises(ValueError, match=message):
        calculate_julian_day(date_str, time_str, timezone_str)


@pytest.mark.parametrize(
    ("utc_instant", "accepted"),
    [
        (MIN_EPHEMERIS_UTC, True),
        (MIN_EPHEMERIS_UTC - timedelta(seconds=1), False),
        (MAX_EPHEMERIS_UTC, True),
        (MAX_EPHEMERIS_UTC + timedelta(seconds=1), False),
    ],
)
def test_utc_file_interval_endpoints_are_inclusive(utc_instant, accepted):
    if accepted:
        _validate_utc_ephemeris_instant(utc_instant)
    else:
        with pytest.raises(ValueError, match="UTC instant"):
            _validate_utc_ephemeris_instant(utc_instant)


@pytest.mark.parametrize(
    ("date_str", "time_str", "timezone_str"),
    [
        ("1800-01-02", "00:00:00", "Etc/GMT-14"),
        ("2399-12-31", "23:59:59", "Etc/GMT+12"),
    ],
)
def test_supported_local_endpoints_calculate_all_objects_with_swiss_flags(
    monkeypatch, date_str, time_str, timezone_str
):
    original_calc_ut = swe.calc_ut
    seen_flags = []

    def recording_calc_ut(jd_ut, body_id, flags):
        result = original_calc_ut(jd_ut, body_id, flags)
        seen_flags.append((flags, result[1]))
        return result

    monkeypatch.setattr("natal_chart.planets.swe.calc_ut", recording_calc_ut)

    chart = calculate_natal_chart(
        date_str,
        time_str,
        21.0285,
        105.8542,
        timezone_str,
        "placidus",
    )

    assert len(chart.objects) == 20
    assert len(seen_flags) >= 18
    assert all(requested & swe.FLG_SWIEPH for requested, _returned in seen_flags)
    assert all(requested & swe.FLG_SPEED for requested, _returned in seen_flags)
    assert all(returned & swe.FLG_SWIEPH for _requested, returned in seen_flags)
    assert all(returned & swe.FLG_SPEED for _requested, returned in seen_flags)


def test_rejected_local_date_fails_before_partial_calculation(monkeypatch):
    def unexpected_house_call(*_args, **_kwargs):
        raise AssertionError("house calculation must not start")

    monkeypatch.setattr(
        "natal_chart.calculations.calculate_house_data", unexpected_house_call
    )

    with pytest.raises(ValueError, match="1800-01-02"):
        calculate_natal_chart(
            "1800-01-01",
            "23:59:59",
            21.0285,
            105.8542,
            "Etc/GMT-14",
        )


def test_rejected_converted_utc_instant_fails_before_partial_calculation(
    monkeypatch,
):
    seen = {}

    def reject_converted_utc(utc_time):
        seen["utc_time"] = utc_time
        raise ValueError("UTC instant rejected")

    def unexpected_house_call(*_args, **_kwargs):
        raise AssertionError("house calculation must not start")

    monkeypatch.setattr(
        "natal_chart.calculations._validate_utc_ephemeris_instant",
        reject_converted_utc,
    )
    monkeypatch.setattr(
        "natal_chart.calculations.calculate_house_data", unexpected_house_call
    )

    with pytest.raises(ValueError, match="UTC instant rejected"):
        calculate_natal_chart(
            "1800-01-02",
            "00:00:00",
            21.0285,
            105.8542,
            "Etc/GMT-14",
        )

    assert seen["utc_time"] == datetime(1800, 1, 1, 10, 0, tzinfo=pytz.utc)


def test_normalized_chart_contains_exact_authoritative_object_order(hanoi_chart):
    assert tuple(OBJECT_REGISTRY) == EXPECTED_OBJECT_SCHEMA
    actual_schema = tuple(
        (body.id, body.name, body.category, body.is_angle)
        for body in hanoi_chart.objects
    )
    assert actual_schema == EXPECTED_OBJECT_SCHEMA


def test_normalized_model_rejects_reordered_object_schema(hanoi_chart):
    payload = hanoi_chart.model_dump(mode="python")
    payload["objects"] = list(reversed(payload["objects"]))

    with pytest.raises(ValidationError, match="ordered object schema"):
        NatalChartData.model_validate(payload)

    required_fields = {
        "id",
        "longitude",
        "latitude",
        "speed",
        "sign",
        "degree",
        "minute",
        "symbol",
        "name_vi",
        "category",
        "is_angle",
        "retrograde",
    }
    for body in hanoi_chart.objects:
        assert required_fields <= body.model_dump().keys()


def test_frozen_hanoi_fixture_matches_reference_tolerance(hanoi_chart):
    by_name = {body.name: body for body in hanoi_chart.objects}

    assert by_name["Sun"].longitude == pytest.approx(280.071588, abs=0.02)
    assert by_name["Moon"].longitude == pytest.approx(219.810978, abs=0.02)
    assert hanoi_chart.angles["Ascendant"].longitude == pytest.approx(
        14.346185, abs=0.02
    )
    assert hanoi_chart.angles["Midheaven"].longitude == pytest.approx(
        280.133922, abs=0.02
    )

    for name in ("Saturn", "True Node", "South Node", "Pallas"):
        assert by_name[name].retrograde is True
    assert by_name["Sun"].retrograde is False


def test_normalized_chart_model_is_json_compatible(hanoi_chart):
    payload = hanoi_chart.model_dump(mode="json")
    serialized = json.dumps(payload, ensure_ascii=False, allow_nan=False)

    assert json.loads(serialized)["birth_data"]["house_system"] == "placidus"
    assert len(payload["objects"]) == 20
    assert len(payload["houses"]) == 12


def test_concurrent_package_calculations_are_deterministic(hanoi_birth):
    def calculate_once(_index):
        return calculate_natal_chart(**hanoi_birth).model_dump(mode="json")

    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(calculate_once, range(8)))

    assert results == [results[0]] * 8
