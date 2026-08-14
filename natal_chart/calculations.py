from __future__ import annotations

from datetime import datetime, timezone

import pytz
import swisseph as swe

from .angles import build_part_of_fortune, build_primary_angles, build_vertex
from .aspects import calculate_aspects
from .houses import calculate_house_data
from .models import (
    Angle,
    BirthData,
    CelestialBody,
    HouseCusp,
    NatalChartData,
    OBJECT_REGISTRY,
)
from .planets import calculate_swiss_bodies, derive_south_node, swiss_calculation


MIN_EPHEMERIS_DATE = datetime(1800, 1, 2).date()
MAX_EPHEMERIS_DATE = datetime(2399, 12, 31).date()
MIN_EPHEMERIS_UTC = datetime(1800, 1, 1, 6, 0, 0, tzinfo=timezone.utc)
MAX_EPHEMERIS_UTC = datetime(2400, 1, 10, 20, 0, 0, tzinfo=timezone.utc)


def _validate_utc_ephemeris_instant(utc_time: datetime) -> None:
    if utc_time.tzinfo is None or utc_time.utcoffset() is None:
        raise ValueError("UTC ephemeris instant must be timezone-aware")
    normalized_utc = utc_time.astimezone(timezone.utc)
    if not MIN_EPHEMERIS_UTC <= normalized_utc <= MAX_EPHEMERIS_UTC:
        raise ValueError(
            "UTC instant is outside bundled all-object ephemeris range "
            "1800-01-01 06:00 through 2400-01-10 20:00 UTC"
        )


def calculate_julian_day(
    date_str: str, time_str: str, timezone_str: str
) -> float:
    try:
        local_wall_time = datetime.strptime(
            f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S"
        )
    except (TypeError, ValueError) as exc:
        raise ValueError(
            "Invalid birth date/time; expected YYYY-MM-DD and HH:MM:SS"
        ) from exc

    if not MIN_EPHEMERIS_DATE <= local_wall_time.date() <= MAX_EPHEMERIS_DATE:
        raise ValueError(
            "Birth date is outside bundled ephemeris range "
            "1800-01-02 through 2399-12-31"
        )

    try:
        timezone = pytz.timezone(timezone_str)
    except (pytz.UnknownTimeZoneError, AttributeError, TypeError) as exc:
        raise ValueError(f"Invalid IANA timezone {timezone_str!r}") from exc

    try:
        localized = timezone.localize(local_wall_time, is_dst=None)
    except pytz.AmbiguousTimeError as exc:
        raise ValueError(
            f"Local birth time is ambiguous in timezone {timezone_str}"
        ) from exc
    except pytz.NonExistentTimeError as exc:
        raise ValueError(
            f"Local birth time does not exist in timezone {timezone_str}"
        ) from exc

    utc_time = localized.astimezone(pytz.utc)
    _validate_utc_ephemeris_instant(utc_time)
    utc_hour = (
        utc_time.hour
        + utc_time.minute / 60.0
        + utc_time.second / 3600.0
        + utc_time.microsecond / 3_600_000_000.0
    )
    with swiss_calculation():
        return float(
            swe.julday(
                utc_time.year,
                utc_time.month,
                utc_time.day,
                utc_hour,
                swe.GREG_CAL,
            )
        )


def get_celestial_bodies(jd_ut: float) -> list[CelestialBody]:
    swiss_bodies = calculate_swiss_bodies(jd_ut)
    objects_by_id = {body.id: body for body in swiss_bodies}
    objects_by_id["derived:true-south-node"] = derive_south_node(
        objects_by_id["lunar-point:true-north-node"]
    )
    return [
        objects_by_id[entry.id]
        for entry in OBJECT_REGISTRY
        if entry.id in objects_by_id
    ]


def get_houses_and_angles(
    jd_ut: float,
    latitude: float,
    longitude: float,
    house_system: str = "placidus",
) -> tuple[list[HouseCusp], dict[str, Angle]]:
    houses, ascmc, _normalized_system = calculate_house_data(
        jd_ut, latitude, longitude, house_system
    )
    return houses, build_primary_angles(ascmc)


def calculate_natal_chart(
    date_str: str,
    time_str: str,
    latitude: float,
    longitude: float,
    timezone_str: str,
    house_system: str = "placidus",
) -> NatalChartData:
    jd_ut = calculate_julian_day(date_str, time_str, timezone_str)
    houses, ascmc, normalized_system = calculate_house_data(
        jd_ut, latitude, longitude, house_system
    )
    angles = build_primary_angles(ascmc)

    swiss_bodies = calculate_swiss_bodies(jd_ut)
    objects_by_id = {body.id: body for body in swiss_bodies}
    objects_by_id["derived:true-south-node"] = derive_south_node(
        objects_by_id["lunar-point:true-north-node"]
    )
    sun = objects_by_id["planet:sun"]
    moon = objects_by_id["planet:moon"]
    part_of_fortune = build_part_of_fortune(
        jd_ut=jd_ut,
        latitude=latitude,
        longitude=longitude,
        ascendant_longitude=angles["Ascendant"].longitude,
        sun_longitude=sun.longitude,
        moon_longitude=moon.longitude,
    )
    vertex = build_vertex(ascmc[3])
    objects_by_id[part_of_fortune.id] = part_of_fortune
    objects_by_id[vertex.id] = vertex
    objects = [objects_by_id[entry.id] for entry in OBJECT_REGISTRY]
    aspects = calculate_aspects(objects)

    return NatalChartData(
        birth_data=BirthData(
            date=date_str,
            time=time_str,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone_str,
            julian_day_ut=jd_ut,
            house_system=normalized_system,
        ),
        objects=objects,
        houses=houses,
        angles=angles,
        aspects=aspects,
    )
