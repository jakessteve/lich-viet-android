from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable, Sequence

from .models import Aspect, CelestialBody, ObjectCategory


@dataclass(frozen=True)
class AspectDefinition:
    name: str
    angle: float
    orb: float
    color: str
    opacity: float
    width: float
    dash_pattern: str
    layer: int

    def __post_init__(self) -> None:
        if not self.name:
            raise ValueError("Aspect name must not be empty")
        if not 0.0 <= self.angle <= 180.0:
            raise ValueError("Aspect angle must be between 0 and 180 degrees")
        if not self.orb > 0.0:
            raise ValueError("Aspect orb must be positive")
        if not 0.0 <= self.opacity <= 1.0:
            raise ValueError("Aspect opacity must be between 0 and 1")
        if not self.width > 0.0:
            raise ValueError("Aspect width must be positive")
        if not self.dash_pattern:
            raise ValueError("Aspect dash pattern must not be empty")
        if self.layer < 0:
            raise ValueError("Aspect layer must not be negative")


ASPECT_DEFINITIONS: tuple[AspectDefinition, ...] = (
    AspectDefinition("Conjunction", 0.0, 8.0, "#7A4E9D", 0.72, 1.35, "solid", 5),
    AspectDefinition("Opposition", 180.0, 8.0, "#D1495B", 0.78, 1.30, "solid", 4),
    AspectDefinition("Trine", 120.0, 7.0, "#315FA8", 0.74, 1.15, "solid", 3),
    AspectDefinition("Square", 90.0, 7.0, "#D1495B", 0.76, 1.20, "solid", 4),
    AspectDefinition("Sextile", 60.0, 6.0, "#2E8B73", 0.70, 1.05, "solid", 2),
    AspectDefinition("Quincunx", 150.0, 3.0, "#8A5CA8", 0.58, 0.95, "5 4", 1),
    AspectDefinition("Semi-sextile", 30.0, 2.0, "#7C8796", 0.42, 0.80, "2 4", 0),
    AspectDefinition("Semi-square", 45.0, 2.0, "#C56A75", 0.48, 0.85, "3 3", 1),
    AspectDefinition("Sesquiquadrate", 135.0, 2.0, "#C56A75", 0.48, 0.85, "3 3", 1),
    AspectDefinition("Quintile", 72.0, 2.0, "#8A6BBE", 0.50, 0.85, "1 3", 1),
    AspectDefinition("Bi-quintile", 144.0, 2.0, "#8A6BBE", 0.50, 0.85, "1 3", 1),
)


_MOTION_EPSILON = 1e-12


@dataclass(frozen=True)
class AspectEligibility:
    """Deterministic semantic selectors; exclusions always take precedence."""

    include_ids: frozenset[str] | None = None
    include_categories: frozenset[ObjectCategory] | None = None
    exclude_ids: frozenset[str] = field(default_factory=frozenset)
    exclude_categories: frozenset[ObjectCategory] = field(default_factory=frozenset)

    def allows(self, body: CelestialBody) -> bool:
        if body.id in self.exclude_ids or body.category in self.exclude_categories:
            return False
        if self.include_ids is None and self.include_categories is None:
            return True
        return bool(
            (self.include_ids is not None and body.id in self.include_ids)
            or (
                self.include_categories is not None
                and body.category in self.include_categories
            )
        )


def angular_separation(first: float, second: float) -> float:
    difference = abs((first % 360.0) - (second % 360.0))
    return min(difference, 360.0 - difference)


def _signed_angular_difference(first: float, second: float) -> float:
    """Return second minus first on the deterministic [-180, 180) branch."""

    return (second - first + 180.0) % 360.0 - 180.0


def _select_definition(
    separation: float, definitions: Sequence[AspectDefinition]
) -> tuple[AspectDefinition, float] | None:
    matches: list[tuple[float, int, AspectDefinition, float]] = []
    for index, definition in enumerate(definitions):
        orb_difference = abs(separation - definition.angle)
        if orb_difference <= definition.orb + 1e-12:
            normalized_orb = orb_difference / definition.orb
            matches.append(
                (normalized_orb, index, definition, orb_difference)
            )
    if not matches:
        return None
    _ratio, _index, definition, orb_difference = min(
        matches, key=lambda match: (match[0], match[1])
    )
    return definition, orb_difference


def _motion_state(
    first: CelestialBody,
    second: CelestialBody,
    definition: AspectDefinition,
    current_orb: float,
) -> str:
    if first.speed is None or second.speed is None:
        return "unknown"

    relative_motion = second.speed - first.speed
    if abs(relative_motion) <= _MOTION_EPSILON:
        return "unknown"
    if current_orb == 0.0:
        # Exactitude is the cusp of absolute orb: any non-stationary next
        # infinitesimal motion increases it.
        return "separating"

    signed_difference = _signed_angular_difference(
        first.longitude, second.longitude
    )
    separation = abs(signed_difference)
    separation_direction = 1.0 if signed_difference > 0.0 else -1.0
    separation_derivative = separation_direction * relative_motion
    orb_side = 1.0 if separation > definition.angle else -1.0
    normalized_orb_derivative = (
        orb_side * separation_derivative / definition.orb
    )
    return "applying" if normalized_orb_derivative < 0.0 else "separating"


def calculate_aspects(
    bodies: Iterable[CelestialBody],
    *,
    definitions: Sequence[AspectDefinition] = ASPECT_DEFINITIONS,
    eligibility: AspectEligibility | None = None,
) -> list[Aspect]:
    if not definitions:
        return []

    selector = eligibility or AspectEligibility()
    eligible_bodies = [body for body in bodies if selector.allows(body)]
    aspects: list[Aspect] = []
    for first_index, first in enumerate(eligible_bodies):
        for second in eligible_bodies[first_index + 1 :]:
            separation = angular_separation(first.longitude, second.longitude)
            selected = _select_definition(separation, definitions)
            if selected is None:
                continue
            definition, orb_difference = selected
            state = _motion_state(
                first,
                second,
                definition,
                orb_difference,
            )
            strength = max(0.0, 1.0 - orb_difference / definition.orb)
            aspects.append(
                Aspect(
                    aspect_name=definition.name,
                    object_a_id=first.id,
                    object_a_name=first.name,
                    object_b_id=second.id,
                    object_b_name=second.name,
                    separation=separation,
                    exact_angle=definition.angle,
                    allowed_orb=definition.orb,
                    orb_difference=orb_difference,
                    state=state,
                    strength=strength,
                    color=definition.color,
                    opacity=definition.opacity,
                    width=definition.width,
                    dash_pattern=definition.dash_pattern,
                    layer=definition.layer,
                )
            )
    return aspects
