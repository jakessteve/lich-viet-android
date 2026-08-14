from __future__ import annotations

import math
import re
from typing import Literal, NamedTuple, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .localization import SIGN_LABELS, localized_sign_names


ObjectCategory = Literal[
    "planet",
    "centaur",
    "lunar_point",
    "asteroid",
    "arabic_part",
    "angle",
]

class ObjectSchemaEntry(NamedTuple):
    id: str
    name: str
    category: ObjectCategory
    is_angle: bool


# This is the single authoritative public object schema and serialization order.
# Calculation-specific Swiss IDs live separately and are keyed by these IDs.
OBJECT_REGISTRY: tuple[ObjectSchemaEntry, ...] = (
    ObjectSchemaEntry("planet:sun", "Sun", "planet", False),
    ObjectSchemaEntry("planet:moon", "Moon", "planet", False),
    ObjectSchemaEntry("planet:mercury", "Mercury", "planet", False),
    ObjectSchemaEntry("planet:venus", "Venus", "planet", False),
    ObjectSchemaEntry("planet:mars", "Mars", "planet", False),
    ObjectSchemaEntry("planet:jupiter", "Jupiter", "planet", False),
    ObjectSchemaEntry("planet:saturn", "Saturn", "planet", False),
    ObjectSchemaEntry("planet:uranus", "Uranus", "planet", False),
    ObjectSchemaEntry("planet:neptune", "Neptune", "planet", False),
    ObjectSchemaEntry("planet:pluto", "Pluto", "planet", False),
    ObjectSchemaEntry("centaur:chiron", "Chiron", "centaur", False),
    ObjectSchemaEntry(
        "lunar-point:mean-lilith", "Mean Lilith", "lunar_point", False
    ),
    ObjectSchemaEntry(
        "lunar-point:true-north-node", "True Node", "lunar_point", False
    ),
    ObjectSchemaEntry(
        "derived:true-south-node", "South Node", "lunar_point", False
    ),
    ObjectSchemaEntry(
        "derived:part-of-fortune", "Part of Fortune", "arabic_part", False
    ),
    ObjectSchemaEntry("angle:vertex", "Vertex", "angle", True),
    ObjectSchemaEntry("asteroid:ceres", "Ceres", "asteroid", False),
    ObjectSchemaEntry("asteroid:pallas", "Pallas", "asteroid", False),
    ObjectSchemaEntry("asteroid:juno", "Juno", "asteroid", False),
    ObjectSchemaEntry("asteroid:vesta", "Vesta", "asteroid", False),
)

_OBJECT_SCHEMA_BY_ID = {entry.id: entry for entry in OBJECT_REGISTRY}
_ZODIAC_SIGNS = tuple(SIGN_LABELS)
_ANGLE_SCHEMA = {
    "Ascendant": ("angle:ascendant", "Ascendant"),
    "Descendant": ("angle:descendant", "Descendant"),
    "Midheaven": ("angle:midheaven", "Midheaven"),
    "Imum Coeli": ("angle:imum-coeli", "Imum Coeli"),
}
_HEX_COLOR_PATTERN = re.compile(r"#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3})?\Z")
_DASH_NUMBER = r"\+?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?"
_DASH_LIST_PATTERN = re.compile(
    rf"{_DASH_NUMBER}(?:(?:\s*,\s*|\s+){_DASH_NUMBER})*\Z"
)


def get_object_schema(object_id: str) -> ObjectSchemaEntry:
    try:
        return _OBJECT_SCHEMA_BY_ID[object_id]
    except KeyError as exc:
        raise ValueError(f"Unknown chart object ID {object_id!r}") from exc


def _validate_zodiac_position(
    *,
    longitude: float,
    sign: str,
    sign_vi: str,
    degree: int,
    minute: int,
    label: str,
) -> None:
    normalized = longitude % 360.0
    within_sign = normalized % 30.0
    expected_degree = int(within_sign)
    expected = (
        _ZODIAC_SIGNS[int(normalized // 30.0)],
        expected_degree,
        int((within_sign - expected_degree) * 60.0),
    )
    if (sign, degree, minute) != expected:
        raise ValueError(
            f"{label} sign/degree-minute is inconsistent with longitude"
        )
    if sign_vi != localized_sign_names(sign, "vi").full:
        raise ValueError(f"{label} Vietnamese sign is inconsistent with longitude")


def _angular_separation(first: float, second: float) -> float:
    difference = abs((first - second) % 360.0)
    return min(difference, 360.0 - difference)


class NormalizedModel(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)


class CelestialBody(NormalizedModel):
    id: str = Field(min_length=3, pattern=r"^[a-z][a-z-]*:.+$")
    name: str = Field(min_length=1)
    name_vi: str = Field(min_length=1)
    symbol: str = Field(min_length=1)
    longitude: float = Field(ge=0.0, lt=360.0)
    latitude: float = Field(ge=-90.0, le=90.0)
    distance: Optional[float] = None
    speed: Optional[float]
    sign: str = Field(min_length=1)
    sign_vi: str = Field(min_length=1)
    degree: int = Field(ge=0, le=29)
    minute: int = Field(ge=0, le=59)
    retrograde: Optional[bool]
    is_angle: bool = False
    category: ObjectCategory

    @model_validator(mode="after")
    def validate_unknown_motion(self) -> "CelestialBody":
        if (self.speed is None) != (self.retrograde is None):
            raise ValueError("speed and retrograde must both be known or both be unknown")
        if self.speed is not None and self.retrograde != (self.speed < 0.0):
            raise ValueError(
                "retrograde must be true exactly when known speed is negative"
            )
        if self.category == "angle" and not self.is_angle:
            raise ValueError("angle-category objects must set is_angle=true")
        return self


class HouseCusp(NormalizedModel):
    house_number: int = Field(ge=1, le=12)
    longitude: float = Field(ge=0.0, lt=360.0)
    sign: str = Field(min_length=1)
    sign_vi: str = Field(min_length=1)
    degree: int = Field(ge=0, le=29)
    minute: int = Field(ge=0, le=59)

class Angle(NormalizedModel):
    id: str = Field(min_length=3, pattern=r"^angle:.+$")
    name: str = Field(min_length=1)
    name_vi: str = Field(min_length=1)
    symbol: str = Field(min_length=1)
    longitude: float = Field(ge=0.0, lt=360.0)
    sign: str = Field(min_length=1)
    sign_vi: str = Field(min_length=1)
    degree: int = Field(ge=0, le=29)
    minute: int = Field(ge=0, le=59)
    is_angle: Literal[True] = True

class Aspect(NormalizedModel):
    aspect_name: str = Field(min_length=1)
    object_a_id: str = Field(min_length=3)
    object_a_name: str = Field(min_length=1)
    object_b_id: str = Field(min_length=3)
    object_b_name: str = Field(min_length=1)
    separation: float = Field(ge=0.0, le=180.0)
    exact_angle: float = Field(ge=0.0, le=180.0)
    allowed_orb: float = Field(gt=0.0)
    orb_difference: float = Field(ge=0.0)
    state: Literal["applying", "separating", "unknown"]
    strength: float = Field(ge=0.0, le=1.0)
    color: str = Field(min_length=1)
    opacity: float = Field(ge=0.0, le=1.0)
    width: float = Field(gt=0.0)
    dash_pattern: str = Field(min_length=1)
    layer: int = Field(ge=0)

    @field_validator("color")
    @classmethod
    def validate_safe_color(cls, color: str) -> str:
        if _HEX_COLOR_PATTERN.fullmatch(color) is None:
            raise ValueError("Aspect color must be a #RGB or #RRGGBB hex value")
        return color

    @field_validator("dash_pattern")
    @classmethod
    def validate_safe_dash_pattern(cls, dash_pattern: str) -> str:
        if dash_pattern == "solid":
            return dash_pattern
        if _DASH_LIST_PATTERN.fullmatch(dash_pattern) is None:
            raise ValueError("Aspect dash pattern must be a safe numeric SVG dash list")
        values = [
            float(value)
            for value in re.findall(_DASH_NUMBER, dash_pattern)
        ]
        if not values or not all(math.isfinite(value) and value >= 0.0 for value in values):
            raise ValueError("Aspect dash pattern values must be finite and nonnegative")
        if not any(value > 0.0 for value in values):
            raise ValueError("Aspect dash pattern cannot contain only zero values")
        return dash_pattern

    @model_validator(mode="after")
    def validate_serialized_contract(self) -> "Aspect":
        if self.object_a_id == self.object_b_id:
            raise ValueError("An aspect must connect two different objects")
        if self.orb_difference > self.allowed_orb + 1e-12:
            raise ValueError("Aspect orb difference exceeds the allowed orb")
        expected_orb = abs(self.separation - self.exact_angle)
        if not abs(self.orb_difference - expected_orb) <= 1e-9:
            raise ValueError("Aspect orb difference is inconsistent with separation")
        expected_strength = max(
            0.0, 1.0 - self.orb_difference / self.allowed_orb
        )
        if not abs(self.strength - expected_strength) <= 1e-9:
            raise ValueError("Aspect strength formula is inconsistent with its orb")
        return self


class BirthData(NormalizedModel):
    date: str
    time: str
    latitude: float = Field(ge=-90.0, le=90.0)
    longitude: float = Field(ge=-180.0, le=180.0)
    timezone: str = Field(min_length=1)
    julian_day_ut: float
    house_system: Literal["placidus", "whole_sign"]


class RenderSettings(NormalizedModel):
    locale: Literal["en", "vi"] = "vi"
    size: int = Field(default=1180, strict=True, gt=0)


class NatalChartData(NormalizedModel):
    birth_data: BirthData
    render_settings: RenderSettings = Field(default_factory=RenderSettings)
    objects: list[CelestialBody] = Field(min_length=20, max_length=20)
    houses: list[HouseCusp] = Field(min_length=12, max_length=12)
    angles: dict[str, Angle]
    aspects: list[Aspect]

    @field_validator("objects")
    @classmethod
    def validate_required_objects(
        cls, objects: list[CelestialBody]
    ) -> list[CelestialBody]:
        actual_schema = tuple(
            ObjectSchemaEntry(
                body.id, body.name, body.category, body.is_angle
            )
            for body in objects
        )
        if actual_schema != OBJECT_REGISTRY:
            raise ValueError(
                "Chart objects do not match the complete ordered object schema"
            )
        return objects

    @field_validator("houses")
    @classmethod
    def validate_house_numbers(
        cls, houses: list[HouseCusp]
    ) -> list[HouseCusp]:
        if {house.house_number for house in houses} != set(range(1, 13)):
            raise ValueError("Chart must contain house numbers 1 through 12")
        return houses

    @field_validator("angles")
    @classmethod
    def validate_primary_angles(
        cls, angles: dict[str, Angle]
    ) -> dict[str, Angle]:
        required = {"Ascendant", "Descendant", "Midheaven", "Imum Coeli"}
        if set(angles) != required:
            raise ValueError("Chart must contain exactly the four primary angles")
        return angles

    @model_validator(mode="after")
    def validate_cross_model_contract(self) -> "NatalChartData":
        for body in self.objects:
            _validate_zodiac_position(
                longitude=body.longitude,
                sign=body.sign,
                sign_vi=body.sign_vi,
                degree=body.degree,
                minute=body.minute,
                label=f"Object {body.id!r}",
            )
        for house in self.houses:
            _validate_zodiac_position(
                longitude=house.longitude,
                sign=house.sign,
                sign_vi=house.sign_vi,
                degree=house.degree,
                minute=house.minute,
                label=f"House {house.house_number}",
            )
        for angle in self.angles.values():
            _validate_zodiac_position(
                longitude=angle.longitude,
                sign=angle.sign,
                sign_vi=angle.sign_vi,
                degree=angle.degree,
                minute=angle.minute,
                label=f"Angle {angle.id!r}",
            )

        for key, (expected_id, expected_name) in _ANGLE_SCHEMA.items():
            angle = self.angles[key]
            if (angle.id, angle.name) != (expected_id, expected_name):
                raise ValueError(
                    f"{key} must use ID {expected_id!r} and name {expected_name!r}"
                )

        for first_key, second_key in (
            ("Ascendant", "Descendant"),
            ("Midheaven", "Imum Coeli"),
        ):
            separation = _angular_separation(
                self.angles[first_key].longitude,
                self.angles[second_key].longitude,
            )
            if not math.isclose(separation, 180.0, abs_tol=1e-9):
                raise ValueError(
                    f"{first_key}/{second_key} must form an exact opposition"
                )

        objects_by_id = {body.id: body for body in self.objects}
        for aspect in self.aspects:
            first = objects_by_id.get(aspect.object_a_id)
            second = objects_by_id.get(aspect.object_b_id)
            if first is None or second is None:
                raise ValueError("Aspect endpoint does not exist in chart objects")
            if (
                aspect.object_a_name != first.name
                or aspect.object_b_name != second.name
            ):
                raise ValueError("Aspect endpoint name does not match its chart object")
            expected_separation = _angular_separation(
                first.longitude, second.longitude
            )
            if not math.isclose(
                aspect.separation, expected_separation, abs_tol=1e-9
            ):
                raise ValueError(
                    "Aspect separation is inconsistent with endpoint longitudes"
                )
        return self

    def to_json(self, filepath: str) -> None:
        from .renderer import export_json

        export_json(self, filepath)

    def to_svg(
        self,
        filepath: str,
        *,
        size: int | None = None,
        locale: Literal["en", "vi"] | None = None,
        width: int | None = None,
        height: int | None = None,
    ) -> None:
        from .renderer import export_svg

        export_svg(
            self,
            filepath,
            size=size,
            locale=locale,
            width=width,
            height=height,
        )
