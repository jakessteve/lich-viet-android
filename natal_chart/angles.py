from __future__ import annotations

import math

import swisseph as swe

from .localization import body_symbol, localize_body, localize_sign
from .models import Angle, CelestialBody, get_object_schema
from .planets import (
    EphemerisError,
    REQUIRED_SWISS_FLAGS,
    get_degree_minute,
    get_zodiac_sign,
    normalize_longitude,
    require_swiss_file_flags,
    swiss_calculation,
)


def _angle(
    object_id: str, name: str, symbol: str, longitude: float
) -> Angle:
    normalized = normalize_longitude(longitude)
    sign = get_zodiac_sign(normalized)
    degree, minute = get_degree_minute(normalized)
    return Angle(
        id=object_id,
        name=name,
        name_vi=localize_body(name),
        symbol=symbol,
        longitude=normalized,
        sign=sign,
        sign_vi=localize_sign(sign),
        degree=degree,
        minute=minute,
        is_angle=True,
    )


def build_primary_angles(ascmc: tuple[float, ...]) -> dict[str, Angle]:
    if len(ascmc) < 2 or not all(math.isfinite(value) for value in ascmc[:2]):
        raise ValueError("ASC/MC data is incomplete or non-finite")

    ascendant = normalize_longitude(ascmc[0])
    midheaven = normalize_longitude(ascmc[1])
    return {
        "Ascendant": _angle(
            "angle:ascendant", "Ascendant", "ASC", ascendant
        ),
        "Descendant": _angle(
            "angle:descendant",
            "Descendant",
            "DSC",
            ascendant + 180.0,
        ),
        "Midheaven": _angle(
            "angle:midheaven", "Midheaven", "MC", midheaven
        ),
        "Imum Coeli": _angle(
            "angle:imum-coeli",
            "Imum Coeli",
            "IC",
            midheaven + 180.0,
        ),
    }


def build_vertex(longitude: float) -> CelestialBody:
    definition = get_object_schema("angle:vertex")
    normalized = normalize_longitude(longitude)
    sign = get_zodiac_sign(normalized)
    degree, minute = get_degree_minute(normalized)
    return CelestialBody(
        id=definition.id,
        name=definition.name,
        name_vi=localize_body(definition.name),
        symbol=body_symbol(definition.name),
        longitude=normalized,
        latitude=0.0,
        distance=None,
        speed=None,
        sign=sign,
        sign_vi=localize_sign(sign),
        degree=degree,
        minute=minute,
        retrograde=None,
        is_angle=definition.is_angle,
        category=definition.category,
    )


def solar_altitude(
    jd_ut: float, latitude: float, longitude: float, altitude_m: float = 0.0
) -> float:
    if not all(
        math.isfinite(value)
        for value in (jd_ut, latitude, longitude, altitude_m)
    ):
        raise ValueError("Solar-altitude inputs must be finite")

    flags = (
        REQUIRED_SWISS_FLAGS | swe.FLG_TOPOCTR | swe.FLG_EQUATORIAL
    )
    try:
        with swiss_calculation():
            swe.set_topo(longitude, latitude, altitude_m)
            position, returned_flags = swe.calc_ut(jd_ut, swe.SUN, flags)
            require_swiss_file_flags(returned_flags, "topocentric Sun", flags)
            horizontal = swe.azalt(
                jd_ut,
                swe.EQU2HOR,
                (longitude, latitude, altitude_m),
                0.0,
                0.0,
                position[:3],
            )
    except EphemerisError:
        raise
    except Exception as exc:
        raise EphemerisError(
            f"Required topocentric Sun altitude calculation failed: {exc}"
        ) from exc

    true_altitude = float(horizontal[1])
    if not math.isfinite(true_altitude):
        raise EphemerisError(
            "Required topocentric Sun altitude returned a non-finite value"
        )
    return true_altitude


def build_part_of_fortune(
    *,
    jd_ut: float,
    latitude: float,
    longitude: float,
    ascendant_longitude: float,
    sun_longitude: float,
    moon_longitude: float,
) -> CelestialBody:
    definition = get_object_schema("derived:part-of-fortune")
    is_day = solar_altitude(jd_ut, latitude, longitude) >= 0.0
    if is_day:
        fortune_longitude = (
            ascendant_longitude + moon_longitude - sun_longitude
        )
    else:
        fortune_longitude = (
            ascendant_longitude + sun_longitude - moon_longitude
        )

    normalized = normalize_longitude(fortune_longitude)
    sign = get_zodiac_sign(normalized)
    degree, minute = get_degree_minute(normalized)
    return CelestialBody(
        id=definition.id,
        name=definition.name,
        name_vi=localize_body(definition.name),
        symbol=body_symbol(definition.name),
        longitude=normalized,
        latitude=0.0,
        distance=None,
        speed=None,
        sign=sign,
        sign_vi=localize_sign(sign),
        degree=degree,
        minute=minute,
        retrograde=None,
        is_angle=definition.is_angle,
        category=definition.category,
    )
