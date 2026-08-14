from __future__ import annotations

from contextlib import contextmanager
import math
from pathlib import Path
from threading import RLock
from types import MappingProxyType
from typing import Iterator, Mapping

import swisseph as swe

from .localization import body_symbol, localize_body, localize_sign
from .models import (
    CelestialBody,
    OBJECT_REGISTRY,
    ObjectSchemaEntry,
    get_object_schema,
)


class EphemerisError(RuntimeError):
    """A required body could not be calculated from the local Swiss files."""


SWISS_BODY_IDS: Mapping[str, int] = MappingProxyType(
    {
        "planet:sun": swe.SUN,
        "planet:moon": swe.MOON,
        "planet:mercury": swe.MERCURY,
        "planet:venus": swe.VENUS,
        "planet:mars": swe.MARS,
        "planet:jupiter": swe.JUPITER,
        "planet:saturn": swe.SATURN,
        "planet:uranus": swe.URANUS,
        "planet:neptune": swe.NEPTUNE,
        "planet:pluto": swe.PLUTO,
        "centaur:chiron": swe.CHIRON,
        "lunar-point:mean-lilith": swe.MEAN_APOG,
        "lunar-point:true-north-node": swe.TRUE_NODE,
        "asteroid:ceres": swe.CERES,
        "asteroid:pallas": swe.PALLAS,
        "asteroid:juno": swe.JUNO,
        "asteroid:vesta": swe.VESTA,
    }
)

ZODIAC_SIGNS: tuple[str, ...] = (
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

EPHEMERIS_PATH = Path(__file__).with_name("ephe")
REQUIRED_SWISS_FLAGS = swe.FLG_SWIEPH | swe.FLG_SPEED
_SWISS_CALCULATION_LOCK = RLock()
_UPPER_ASTEROID_PADDING_START_JD = 2597641.5  # 2400-01-01 00:00 UTC
_ASTEROID_FILE_WARMUP_JD = 2597640.5  # 2399-12-31 00:00 UTC


@contextmanager
def swiss_calculation() -> Iterator[None]:
    """Serialize package-owned Swiss calls and restore the package ephemeris.

    The lock is reentrant so calculation adapters can compose safely. Every
    package-owned entry resets the local file path before calling Swiss. This
    boundary coordinates this package's callers; external direct `swisseph`
    calls cannot be made to honor the package lock.
    """

    with _SWISS_CALCULATION_LOCK:
        swe.set_ephe_path(str(EPHEMERIS_PATH))
        yield


def normalize_longitude(longitude: float) -> float:
    if not math.isfinite(longitude):
        raise ValueError("Longitude must be finite")
    return longitude % 360.0


def get_zodiac_sign(longitude: float) -> str:
    return ZODIAC_SIGNS[int(normalize_longitude(longitude) // 30.0)]


def get_degree_minute(longitude: float) -> tuple[int, int]:
    sign_degrees = normalize_longitude(longitude) % 30.0
    degree = int(sign_degrees)
    minute = int((sign_degrees - degree) * 60.0)
    return degree, minute


def require_swiss_file_flags(
    returned_flags: int, body_name: str, required_flags: int = REQUIRED_SWISS_FLAGS
) -> None:
    if returned_flags & swe.FLG_MOSEPH or not returned_flags & swe.FLG_SWIEPH:
        raise EphemerisError(
            f"Required body {body_name} did not use Swiss file ephemeris; "
            f"fallback flags={returned_flags}"
        )
    missing_flags = required_flags & ~returned_flags
    if missing_flags:
        raise EphemerisError(
            f"Required body {body_name} is missing requested flags "
            f"{missing_flags}; flags={returned_flags}"
        )


def _create_body(
    definition: ObjectSchemaEntry, values: tuple[float, ...]
) -> CelestialBody:
    if len(values) < 4 or not all(math.isfinite(value) for value in values[:4]):
        raise EphemerisError(
            f"Required body {definition.name} returned incomplete or non-finite data"
        )

    longitude = normalize_longitude(values[0])
    degree, minute = get_degree_minute(longitude)
    sign = get_zodiac_sign(longitude)
    speed = float(values[3])
    return CelestialBody(
        id=definition.id,
        name=definition.name,
        name_vi=localize_body(definition.name),
        symbol=body_symbol(definition.name),
        longitude=longitude,
        latitude=float(values[1]),
        distance=float(values[2]),
        speed=speed,
        sign=sign,
        sign_vi=localize_sign(sign),
        degree=degree,
        minute=minute,
        retrograde=speed < 0.0,
        is_angle=False,
        category=definition.category,
    )


def calculate_swiss_bodies(jd_ut: float) -> list[CelestialBody]:
    if not math.isfinite(jd_ut):
        raise ValueError("Julian Day must be finite")

    bodies: list[CelestialBody] = []
    with swiss_calculation():
        # `seas_18.se1` includes interpolation padding into January 2400, but
        # Swiss selects the next nominal segment on a cold lookup at 2400.
        # Open the bundled segment inside the same locked session before using
        # that verified padding interval. The real target call and its flags
        # remain authoritative and are checked below.
        if jd_ut >= _UPPER_ASTEROID_PADDING_START_JD:
            try:
                _warmup_values, warmup_flags = swe.calc_ut(
                    _ASTEROID_FILE_WARMUP_JD,
                    swe.CHIRON,
                    REQUIRED_SWISS_FLAGS,
                )
                require_swiss_file_flags(
                    warmup_flags, "Chiron ephemeris warm-up"
                )
            except EphemerisError:
                raise
            except Exception as exc:
                raise EphemerisError(
                    f"Required Chiron ephemeris warm-up failed: {exc}"
                ) from exc
        for definition in OBJECT_REGISTRY:
            swiss_id = SWISS_BODY_IDS.get(definition.id)
            if swiss_id is None:
                continue
            try:
                values, returned_flags = swe.calc_ut(
                    jd_ut, swiss_id, REQUIRED_SWISS_FLAGS
                )
                require_swiss_file_flags(returned_flags, definition.name)
                bodies.append(_create_body(definition, values))
            except EphemerisError:
                raise
            except Exception as exc:
                raise EphemerisError(
                    f"Required body {definition.name} calculation failed: {exc}"
                ) from exc
    return bodies


def derive_south_node(north_node: CelestialBody) -> CelestialBody:
    if north_node.id != "lunar-point:true-north-node":
        raise ValueError("South Node must be derived from the True Node")

    definition = get_object_schema("derived:true-south-node")
    longitude = normalize_longitude(north_node.longitude + 180.0)
    degree, minute = get_degree_minute(longitude)
    sign = get_zodiac_sign(longitude)
    return CelestialBody(
        id=definition.id,
        name=definition.name,
        name_vi=localize_body(definition.name),
        symbol=body_symbol(definition.name),
        longitude=longitude,
        latitude=-north_node.latitude,
        distance=north_node.distance,
        speed=north_node.speed,
        sign=sign,
        sign_vi=localize_sign(sign),
        degree=degree,
        minute=minute,
        retrograde=north_node.retrograde,
        is_angle=definition.is_angle,
        category=definition.category,
    )
