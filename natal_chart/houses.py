from __future__ import annotations

import math

import swisseph as swe

from .localization import localize_sign
from .models import HouseCusp
from .planets import (
    get_degree_minute,
    get_zodiac_sign,
    normalize_longitude,
    swiss_calculation,
)


class HouseCalculationError(RuntimeError):
    """Swiss Ephemeris could not produce the required house data."""


HOUSE_SYSTEMS = {
    "p": "placidus",
    "placidus": "placidus",
    "w": "whole_sign",
    "whole sign": "whole_sign",
    "whole-sign": "whole_sign",
    "whole_sign": "whole_sign",
}


def normalize_house_system(house_system: str) -> str:
    if not isinstance(house_system, str):
        raise ValueError("Unsupported house system: expected Placidus or Whole Sign")
    normalized = HOUSE_SYSTEMS.get(house_system.strip().lower())
    if normalized is None:
        raise ValueError(
            f"Unsupported house system {house_system!r}; expected Placidus or Whole Sign"
        )
    return normalized


def _validate_location(jd_ut: float, latitude: float, longitude: float) -> None:
    if not all(math.isfinite(value) for value in (jd_ut, latitude, longitude)):
        raise ValueError("Julian Day, latitude, and longitude must be finite")
    if not -90.0 <= latitude <= 90.0:
        raise ValueError("Latitude must be between -90 and 90 degrees")
    if not -180.0 <= longitude <= 180.0:
        raise ValueError("Longitude must be between -180 and 180 degrees")


def _house_cusp(number: int, longitude: float) -> HouseCusp:
    normalized = normalize_longitude(longitude)
    sign = get_zodiac_sign(normalized)
    degree, minute = get_degree_minute(normalized)
    return HouseCusp(
        house_number=number,
        longitude=normalized,
        sign=sign,
        sign_vi=localize_sign(sign),
        degree=degree,
        minute=minute,
    )


def calculate_house_data(
    jd_ut: float,
    latitude: float,
    longitude: float,
    house_system: str = "placidus",
) -> tuple[list[HouseCusp], tuple[float, ...], str]:
    _validate_location(jd_ut, latitude, longitude)
    normalized_system = normalize_house_system(house_system)

    # Whole Sign still needs an astronomical ASC, MC, and Vertex. Swiss `houses`
    # does not expose Whole Sign cusps directly, so request only the Placidus
    # frame and replace its cusps below when configured for Whole Sign.
    try:
        with swiss_calculation():
            raw_cusps, raw_ascmc = swe.houses(
                jd_ut, latitude, longitude, b"P"
            )
    except Exception as exc:
        label = "Placidus" if normalized_system == "placidus" else "Whole Sign"
        raise HouseCalculationError(
            f"{label} house calculation failed: {exc}"
        ) from exc

    ascmc = tuple(float(value) for value in raw_ascmc)
    if len(ascmc) < 4 or not all(math.isfinite(value) for value in ascmc[:4]):
        raise HouseCalculationError(
            f"{normalized_system.replace('_', ' ').title()} house calculation "
            "returned incomplete or non-finite angles"
        )

    if normalized_system == "whole_sign":
        first_cusp = math.floor(normalize_longitude(ascmc[0]) / 30.0) * 30.0
        cusp_longitudes = [
            normalize_longitude(first_cusp + index * 30.0) for index in range(12)
        ]
    else:
        if len(raw_cusps) != 12 or not all(
            math.isfinite(value) for value in raw_cusps
        ):
            raise HouseCalculationError(
                "Placidus house calculation returned incomplete or non-finite cusps"
            )
        cusp_longitudes = [normalize_longitude(value) for value in raw_cusps]

    houses = [
        _house_cusp(index + 1, cusp)
        for index, cusp in enumerate(cusp_longitudes)
    ]
    return houses, ascmc, normalized_system
