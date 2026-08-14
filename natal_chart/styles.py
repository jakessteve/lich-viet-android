from __future__ import annotations

from dataclasses import dataclass
from types import MappingProxyType
from typing import Mapping


REFERENCE_COLORS: Mapping[str, str] = MappingProxyType(
    {
        "background": "#FBFAF7",
        "surface": "#FFFDFC",
        "blue": "#315FA8",
        "blue_light": "#4E7FB5",
        "purple": "#7A4E9D",
        "purple_light": "#90639D",
        "gold": "#C69A3A",
        "gold_light": "#E8CC83",
        "ink": "#263342",
        "muted": "#7C8796",
        "line": "#9EA8AE",
        "sector_even": "#F1F0EC",
        "sector_odd": "#FAF9F6",
    }
)

RING_RATIOS: Mapping[str, float] = MappingProxyType(
    {
        "outer_edge": 0.48,
        "zodiac_inner": 0.43,
        "sign_inner": 0.385,
        "degree_ring": 0.375,
        "house_ring": 0.255,
        "house_number_inner": 0.222,
        "aspect_radius": 0.218,
    }
)

FONT_STACKS: Mapping[str, tuple[str, ...]] = MappingProxyType(
    {
        "text": ("Noto Sans", "DejaVu Sans", "sans-serif"),
        "symbol": ("DejaVu Sans", "Noto Sans Symbols", "sans-serif"),
        "numeric": ("Noto Sans Mono", "DejaVu Sans Mono", "monospace"),
    }
)

ZODIAC_PALETTE: tuple[str, ...] = (
    "#C95C5C",
    "#6F8F62",
    "#C69A3A",
    "#557FA3",
    "#C97945",
    "#77966D",
    "#B08A3E",
    "#70558C",
    "#B9684E",
    "#607D6B",
    "#4F78A5",
    "#7A6095",
)

OBJECT_PALETTE: Mapping[str, str] = MappingProxyType(
    {
        "planet:sun": "#C89422",
        "planet:moon": "#557FA3",
        "planet:mercury": "#3F7B73",
        "planet:venus": "#A85D83",
        "planet:mars": "#C05252",
        "planet:jupiter": "#8B5E3C",
        "planet:saturn": "#65706F",
        "planet:uranus": "#397F9C",
        "planet:neptune": "#4D65A4",
        "planet:pluto": "#6D4D78",
        "centaur:chiron": "#7D6755",
        "lunar-point:mean-lilith": "#59425F",
        "lunar-point:true-north-node": "#315FA8",
        "derived:true-south-node": "#70558C",
        "derived:part-of-fortune": "#C69A3A",
        "angle:vertex": "#7A4E9D",
        "asteroid:ceres": "#6F8F62",
        "asteroid:pallas": "#557FA3",
        "asteroid:juno": "#A85D83",
        "asteroid:vesta": "#C97945",
    }
)


@dataclass(frozen=True)
class TickStyle:
    every_degrees: int
    length_ratio: float
    width: float


TICK_HIERARCHY: Mapping[str, TickStyle] = MappingProxyType(
    {
        "minor": TickStyle(1, 0.006, 0.45),
        "medium": TickStyle(5, 0.011, 0.75),
        "major": TickStyle(10, 0.017, 1.15),
    }
)

# Half-degree subdivisions stay deliberately shorter and lighter than the
# existing one-degree hierarchy, especially in the 360px review raster.
MINUTE_TICK_STYLE = TickStyle(1, 0.003, 0.25)


@dataclass(frozen=True)
class LabelLayoutStyle:
    lane_radius_ratios: tuple[float, ...]
    leader_radius_ratio: float
    angular_step_degrees: float
    max_displacement_degrees: float
    collision_padding_ratio: float
    view_margin_ratio: float


LABEL_LAYOUT_STYLE = LabelLayoutStyle(
    lane_radius_ratios=(0.285, 0.325, 0.355),
    leader_radius_ratio=0.378,
    angular_step_degrees=0.25,
    max_displacement_degrees=45.0,
    collision_padding_ratio=0.002,
    view_margin_ratio=0.006,
)


@dataclass(frozen=True)
class AspectWebStyle:
    opacity_floor: float
    opacity_strength_scale: float
    width_floor: float
    width_strength_scale: float


ASPECT_WEB_STYLE = AspectWebStyle(
    opacity_floor=0.14,
    opacity_strength_scale=0.52,
    width_floor=0.38,
    width_strength_scale=0.62,
)


SVG_STROKE_RATIOS: Mapping[str, float] = MappingProxyType(
    {
        "outer": 0.0018,
        "ring": 0.0011,
        "separator": 0.00075,
        "house_cusp": 0.0008,
        "angle": 0.0018,
        "leader": 0.0007,
    }
)

SVG_TEXT_RATIOS: Mapping[str, float] = MappingProxyType(
    {
        "zodiac_symbol": 0.024,
        "sign_name": 0.0095,
        "house_number": 0.012,
        "object_symbol": 0.020,
        "object_name": 0.0085,
        "object_position": 0.0075,
        "angle_label": 0.009,
        "metadata": 0.0065,
        "legend": 0.0055,
    }
)

SVG_LAYOUT_RATIOS: Mapping[str, float] = MappingProxyType(
    {
        "object_label_min_width": 0.060,
        "object_label_character_width": 0.0065,
        "object_label_horizontal_padding": 0.026,
        "object_label_height": 0.040,
    }
)
