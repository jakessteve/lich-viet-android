from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Sequence

from .styles import LABEL_LAYOUT_STYLE


class LayoutError(RuntimeError):
    """The declared footprints cannot be placed inside the configured view."""


@dataclass(frozen=True)
class Point:
    x: float
    y: float


@dataclass(frozen=True)
class BoundingBox:
    x: float
    y: float
    width: float
    height: float

    @property
    def left(self) -> float:
        return self.x

    @property
    def right(self) -> float:
        return self.x + self.width

    @property
    def top(self) -> float:
        return self.y

    @property
    def bottom(self) -> float:
        return self.y + self.height

    def intersects(self, other: "BoundingBox", padding: float = 0.0) -> bool:
        return not (
            self.right + padding <= other.left
            or other.right + padding <= self.left
            or self.bottom + padding <= other.top
            or other.bottom + padding <= self.top
        )


@dataclass(frozen=True)
class LabelFootprint:
    object_id: str
    true_angle: float
    width: float
    height: float

    def __post_init__(self) -> None:
        if not self.object_id:
            raise ValueError("Label object ID must not be empty")
        if not all(
            math.isfinite(value)
            for value in (self.true_angle, self.width, self.height)
        ):
            raise ValueError("Label footprint values must be finite")
        if self.width <= 0.0 or self.height <= 0.0:
            raise ValueError("Label footprint dimensions must be positive")


@dataclass(frozen=True)
class LayoutConfig:
    view_width: float
    view_height: float
    center_x: float
    center_y: float
    lane_radii: tuple[float, ...]
    leader_radius: float
    angular_step_degrees: float
    max_displacement_degrees: float
    collision_padding: float
    view_margin: float


@dataclass(frozen=True)
class LabelPlacement:
    object_id: str
    cyclic_order: int
    true_angle: float
    true_angle_unwrapped: float
    display_angle: float
    display_angle_unwrapped: float
    lane_index: int
    leader_start: Point
    leader_end: Point
    bounding_box: BoundingBox


def default_layout_config(size: float) -> LayoutConfig:
    if not math.isfinite(size) or size <= 0.0:
        raise ValueError("Layout size must be finite and positive")
    return LayoutConfig(
        view_width=size,
        view_height=size,
        center_x=size / 2.0,
        center_y=size / 2.0,
        lane_radii=tuple(
            size * ratio for ratio in LABEL_LAYOUT_STYLE.lane_radius_ratios
        ),
        leader_radius=size * LABEL_LAYOUT_STYLE.leader_radius_ratio,
        angular_step_degrees=LABEL_LAYOUT_STYLE.angular_step_degrees,
        max_displacement_degrees=LABEL_LAYOUT_STYLE.max_displacement_degrees,
        collision_padding=size * LABEL_LAYOUT_STYLE.collision_padding_ratio,
        view_margin=size * LABEL_LAYOUT_STYLE.view_margin_ratio,
    )


def _polar_point(
    center_x: float, center_y: float, radius: float, angle: float
) -> Point:
    radians = math.radians(angle % 360.0)
    return Point(
        center_x + radius * math.sin(radians),
        center_y - radius * math.cos(radians),
    )


def _cyclic_labels(
    labels: Sequence[LabelFootprint],
) -> list[tuple[int, LabelFootprint, float]]:
    indexed = [
        (index, label, label.true_angle % 360.0)
        for index, label in enumerate(labels)
    ]
    indexed.sort(key=lambda item: (item[2], item[0]))
    if len(indexed) <= 1:
        return indexed

    gaps = []
    for index, item in enumerate(indexed):
        next_angle = indexed[(index + 1) % len(indexed)][2]
        if index == len(indexed) - 1:
            next_angle += 360.0
        gaps.append(next_angle - item[2])
    seam = max(range(len(gaps)), key=lambda index: gaps[index])
    start = (seam + 1) % len(indexed)
    rotated = indexed[start:] + indexed[:start]

    result: list[tuple[int, LabelFootprint, float]] = []
    previous: float | None = None
    for original_index, label, normalized in rotated:
        unwrapped = normalized
        if previous is not None:
            while unwrapped < previous:
                unwrapped += 360.0
        result.append((original_index, label, unwrapped))
        previous = unwrapped
    return result


def _in_view(box: BoundingBox, config: LayoutConfig) -> bool:
    return (
        box.left >= config.view_margin
        and box.top >= config.view_margin
        and box.right <= config.view_width - config.view_margin
        and box.bottom <= config.view_height - config.view_margin
    )


def _attempt_layout(
    ordered: Sequence[tuple[int, LabelFootprint, float]],
    config: LayoutConfig,
    first_shift: float,
    first_lane: int,
) -> list[LabelPlacement] | None:
    placed: list[LabelPlacement] = []
    placements_by_input: dict[int, LabelPlacement] = {}
    previous_display: float | None = None
    first_display: float | None = None

    for cyclic_order, (original_index, label, true_unwrapped) in enumerate(ordered):
        if cyclic_order == 0:
            candidate_start = true_unwrapped + first_shift
            candidate_lanes = (first_lane,)
        else:
            assert previous_display is not None
            candidate_start = max(
                true_unwrapped,
                previous_display + config.angular_step_degrees,
            )
            candidate_lanes = range(len(config.lane_radii))
        max_candidate = true_unwrapped + config.max_displacement_degrees
        if candidate_start > max_candidate + 1e-12:
            return None
        step_count = int(
            math.ceil(
                max(0.0, max_candidate - candidate_start)
                / config.angular_step_degrees
            )
        )
        if cyclic_order == 0:
            step_count = 0

        selected: LabelPlacement | None = None
        for step in range(step_count + 1):
            display_unwrapped = candidate_start + step * config.angular_step_degrees
            if display_unwrapped > max_candidate + 1e-12:
                break
            if (
                first_display is not None
                and display_unwrapped >= first_display + 360.0
            ):
                break
            for lane_index in candidate_lanes:
                lane_radius = config.lane_radii[lane_index]
                label_center = _polar_point(
                    config.center_x,
                    config.center_y,
                    lane_radius,
                    display_unwrapped,
                )
                bounding_box = BoundingBox(
                    label_center.x - label.width / 2.0,
                    label_center.y - label.height / 2.0,
                    label.width,
                    label.height,
                )
                if not _in_view(bounding_box, config):
                    continue
                if any(
                    bounding_box.intersects(
                        existing.bounding_box, config.collision_padding
                    )
                    for existing in placed
                ):
                    continue
                leader_start = _polar_point(
                    config.center_x,
                    config.center_y,
                    config.leader_radius,
                    label.true_angle,
                )
                selected = LabelPlacement(
                    object_id=label.object_id,
                    cyclic_order=cyclic_order,
                    true_angle=label.true_angle % 360.0,
                    true_angle_unwrapped=true_unwrapped,
                    display_angle=display_unwrapped % 360.0,
                    display_angle_unwrapped=display_unwrapped,
                    lane_index=lane_index,
                    leader_start=leader_start,
                    leader_end=label_center,
                    bounding_box=bounding_box,
                )
                break
            if selected is not None:
                break

        if selected is None:
            return None
        placed.append(selected)
        placements_by_input[original_index] = selected
        previous_display = selected.display_angle_unwrapped
        if first_display is None:
            first_display = selected.display_angle_unwrapped

    return [placements_by_input[index] for index in range(len(ordered))]


def layout_labels(
    labels: Sequence[LabelFootprint], config: LayoutConfig
) -> list[LabelPlacement]:
    if not config.lane_radii:
        raise ValueError("At least one radial label lane is required")
    if config.angular_step_degrees <= 0.0:
        raise ValueError("Angular layout step must be positive")
    if config.max_displacement_degrees < 0.0:
        raise ValueError("Maximum label displacement must not be negative")
    if len({label.object_id for label in labels}) != len(labels):
        raise ValueError("Label object IDs must be unique")
    if not labels:
        return []

    ordered = _cyclic_labels(labels)
    first_shift_steps = int(
        math.floor(
            config.max_displacement_degrees
            / config.angular_step_degrees
            + 1e-12
        )
    )
    first_shifts = [
        step * config.angular_step_degrees
        for step in range(first_shift_steps + 1)
    ]
    if first_shifts[-1] < config.max_displacement_degrees - 1e-12:
        first_shifts.append(config.max_displacement_degrees)

    for first_shift in first_shifts:
        for first_lane in range(len(config.lane_radii)):
            placements = _attempt_layout(
                ordered,
                config,
                first_shift,
                first_lane,
            )
            if placements is not None:
                return placements

    raise LayoutError(
        "Could not place labels within collision, view, cyclic seam, and "
        "displacement constraints"
    )
