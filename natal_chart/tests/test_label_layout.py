from __future__ import annotations

from itertools import combinations
import math

import pytest

from natal_chart.label_layout import (
    LabelFootprint,
    LayoutError,
    default_layout_config,
    layout_labels,
)


def footprint_for_body(body, size: float) -> LabelFootprint:
    scale = size / 1180.0
    return LabelFootprint(
        object_id=body.id,
        true_angle=body.longitude,
        width=max(58.0, len(body.name) * 7.0 + 28.0) * scale,
        height=30.0 * scale,
    )


def assert_no_intersections(placements) -> None:
    for first, second in combinations(placements, 2):
        assert not first.bounding_box.intersects(second.bounding_box), (
            first.object_id,
            second.object_id,
        )


def assert_strict_cyclic_order_and_budget(placements, config) -> None:
    ordered = sorted(placements, key=lambda placement: placement.cyclic_order)
    assert all(
        first.display_angle_unwrapped < second.display_angle_unwrapped
        for first, second in zip(ordered, ordered[1:])
    )
    assert ordered[-1].display_angle_unwrapped < (
        ordered[0].display_angle_unwrapped + 360.0
    )
    assert all(
        abs(placement.display_angle_unwrapped - placement.true_angle_unwrapped)
        <= config.max_displacement_degrees
        for placement in ordered
    )


@pytest.mark.parametrize("size", [1180.0, 360.0])
def test_dense_hanoi_layout_is_deterministic_finite_in_view_and_non_overlapping(
    hanoi_chart, size
):
    labels = [footprint_for_body(body, size) for body in hanoi_chart.objects]
    config = default_layout_config(size)

    first = layout_labels(labels, config)
    second = layout_labels(labels, config)

    assert first == second
    assert len(first) == 20
    assert_no_intersections(first)
    assert config.max_displacement_degrees == 45.0
    assert_strict_cyclic_order_and_budget(first, config)
    for placement in first:
        assert placement.lane_index in range(len(config.lane_radii))
        assert all(
            math.isfinite(value)
            for value in (
                placement.display_angle,
                placement.display_angle_unwrapped,
                placement.leader_start.x,
                placement.leader_start.y,
                placement.leader_end.x,
                placement.leader_end.y,
                placement.bounding_box.x,
                placement.bounding_box.y,
            )
        )
        assert placement.bounding_box.left >= 0.0
        assert placement.bounding_box.top >= 0.0
        assert placement.bounding_box.right <= size
        assert placement.bounding_box.bottom <= size


def test_layout_preserves_cyclic_order_and_true_position_leader_anchors(
    hanoi_chart,
):
    size = 1180.0
    labels = [footprint_for_body(body, size) for body in hanoi_chart.objects]
    config = default_layout_config(size)
    placements = layout_labels(labels, config)
    ordered = sorted(placements, key=lambda placement: placement.cyclic_order)

    assert [item.display_angle_unwrapped for item in ordered] == sorted(
        item.display_angle_unwrapped for item in ordered
    )
    assert [item.true_angle_unwrapped for item in ordered] == sorted(
        item.true_angle_unwrapped for item in ordered
    )

    by_id = {body.id: body for body in hanoi_chart.objects}
    for placement in placements:
        radians = math.radians(by_id[placement.object_id].longitude)
        assert placement.leader_start.x == pytest.approx(
            config.center_x + config.leader_radius * math.sin(radians)
        )
        assert placement.leader_start.y == pytest.approx(
            config.center_y - config.leader_radius * math.cos(radians)
        )


def test_wraparound_exact_conjunctions_use_stable_lanes_boxes_and_order():
    labels = [
        LabelFootprint("a", 359.5, 44.0, 16.0),
        LabelFootprint("b", 0.0, 52.0, 16.0),
        LabelFootprint("c", 0.0, 60.0, 16.0),
        LabelFootprint("d", 0.5, 48.0, 16.0),
        LabelFootprint("e", 1.0, 56.0, 16.0),
    ]
    config = default_layout_config(360.0)

    placements = layout_labels(labels, config)
    ordered = sorted(placements, key=lambda placement: placement.cyclic_order)

    assert_no_intersections(placements)
    assert_strict_cyclic_order_and_budget(placements, config)
    assert [placement.object_id for placement in ordered].index("b") < [
        placement.object_id for placement in ordered
    ].index("c")
    assert [placement.display_angle_unwrapped for placement in ordered] == sorted(
        placement.display_angle_unwrapped for placement in ordered
    )
    assert {placement.lane_index for placement in placements}
    for label, placement in zip(labels, placements):
        assert placement.bounding_box.width == label.width
        assert placement.bounding_box.height == label.height


def test_closing_seam_layout_stays_within_one_strict_revolution():
    labels = [
        LabelFootprint(f"object-{index}", index * 18.0, 430.0, 40.0)
        for index in range(20)
    ]
    config = default_layout_config(1180.0)

    placements = layout_labels(labels, config)

    assert_no_intersections(placements)
    assert_strict_cyclic_order_and_budget(placements, config)


@pytest.mark.parametrize("size", [1180.0, 360.0])
def test_exact_conjunction_rejects_layout_beyond_45_degree_budget(size):
    scale = size / 1180.0
    labels = [
        LabelFootprint(
            f"object-{index}",
            0.0,
            450.0 * scale,
            40.0 * scale,
        )
        for index in range(20)
    ]

    with pytest.raises(LayoutError):
        layout_labels(labels, default_layout_config(size))
