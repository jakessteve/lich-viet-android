from __future__ import annotations

import math
import xml.etree.ElementTree as ET

from .label_layout import LabelFootprint, default_layout_config, layout_labels
from .localization import (
    Locale,
    localized_angle_names,
    localized_object_names,
    localized_sign_names,
)
from .models import NatalChartData
from .styles import (
    ASPECT_WEB_STYLE,
    FONT_STACKS,
    MINUTE_TICK_STYLE,
    OBJECT_PALETTE,
    REFERENCE_COLORS,
    RING_RATIOS,
    SVG_LAYOUT_RATIOS,
    SVG_STROKE_RATIOS,
    SVG_TEXT_RATIOS,
    TICK_HIERARCHY,
)


SVG_NAMESPACE = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG_NAMESPACE)

ZODIAC_SIGNS = (
    ("Aries", "♈"),
    ("Taurus", "♉"),
    ("Gemini", "♊"),
    ("Cancer", "♋"),
    ("Leo", "♌"),
    ("Virgo", "♍"),
    ("Libra", "♎"),
    ("Scorpio", "♏"),
    ("Sagittarius", "♐"),
    ("Capricorn", "♑"),
    ("Aquarius", "♒"),
    ("Pisces", "♓"),
)


def _tag(name: str) -> str:
    return f"{{{SVG_NAMESPACE}}}{name}"


def _number(value: float | int) -> str:
    numeric = float(value)
    if not math.isfinite(numeric):
        raise ValueError("SVG coordinates and styles must be finite")
    if numeric == 0.0:
        numeric = 0.0
    return f"{numeric:.9f}".rstrip("0").rstrip(".")


def _font_stack(kind: str) -> str:
    return ", ".join(FONT_STACKS[kind])


def _symbol_text(value: str) -> str:
    """Force Unicode symbols into monochrome text presentation."""

    return value + "\ufe0e" if len(value) == 1 else value


class SVGRenderer:
    """Render already-normalized chart data without calculation dependencies."""

    def __init__(
        self,
        data: NatalChartData,
        *,
        size: int | None = None,
        locale: Locale | None = None,
    ) -> None:
        if size is None:
            size = data.render_settings.size
        if locale is None:
            locale = data.render_settings.locale
        if isinstance(size, bool) or not isinstance(size, int) or size <= 0:
            raise ValueError("SVG size must be a positive integer")
        if locale not in ("en", "vi"):
            raise ValueError("SVG locale must be 'en' or 'vi'")
        self.data = data
        self.size = size
        self.locale = locale
        self.center = size / 2.0
        self.ascendant = data.angles["Ascendant"].longitude
        self.positions = {body.id: body.longitude for body in data.objects}

    @staticmethod
    def zodiac_symbol(sign: str) -> str:
        for sign_name, symbol in ZODIAC_SIGNS:
            if sign_name == sign:
                return symbol
        raise ValueError(f"Unknown zodiac sign {sign!r}")

    def radius(self, name: str) -> float:
        return self.size * RING_RATIOS[name]

    def screen_angle(self, longitude: float) -> float:
        """Place ASC left; increasing tropical longitude travels lower-left."""

        if not math.isfinite(longitude):
            raise ValueError("Longitude must be finite")
        return (270.0 - ((longitude - self.ascendant) % 360.0)) % 360.0

    def point(self, radius: float, screen_angle: float) -> tuple[float, float]:
        radians = math.radians(screen_angle % 360.0)
        return (
            self.center + radius * math.sin(radians),
            self.center - radius * math.cos(radians),
        )

    def _element(
        self,
        parent: ET.Element,
        name: str,
        attributes: dict[str, str],
        text: str | None = None,
    ) -> ET.Element:
        element = ET.SubElement(parent, _tag(name), attributes)
        if text is not None:
            element.text = text
        return element

    def _layer(self, root: ET.Element, layer_id: str) -> ET.Element:
        return self._element(
            root, "g", {"id": layer_id, "data-layer": "true"}
        )

    def _line(
        self,
        parent: ET.Element,
        start_radius: float,
        end_radius: float,
        screen_angle: float,
        **attributes: str,
    ) -> ET.Element:
        x1, y1 = self.point(start_radius, screen_angle)
        x2, y2 = self.point(end_radius, screen_angle)
        return self._element(
            parent,
            "line",
            {
                "x1": _number(x1),
                "y1": _number(y1),
                "x2": _number(x2),
                "y2": _number(y2),
                **attributes,
            },
        )

    def _text(
        self,
        parent: ET.Element,
        text: str,
        x: float,
        y: float,
        *,
        font_size: float,
        fill: str,
        font_kind: str = "text",
        anchor: str = "middle",
        weight: str = "400",
        **attributes: str,
    ) -> ET.Element:
        return self._element(
            parent,
            "text",
            {
                "x": _number(x),
                "y": _number(y),
                "fill": fill,
                "font-family": _font_stack(font_kind),
                "font-size": _number(font_size),
                "font-weight": weight,
                "text-anchor": anchor,
                "dominant-baseline": "middle",
                **attributes,
            },
            text,
        )

    def _annular_sector(
        self,
        parent: ET.Element,
        start_angle: float,
        end_angle: float,
        outer_radius: float,
        inner_radius: float,
        **attributes: str,
    ) -> ET.Element:
        outer_start = self.point(outer_radius, start_angle)
        outer_end = self.point(outer_radius, end_angle)
        inner_end = self.point(inner_radius, end_angle)
        inner_start = self.point(inner_radius, start_angle)
        path = " ".join(
            (
                f"M {_number(outer_start[0])} {_number(outer_start[1])}",
                f"A {_number(outer_radius)} {_number(outer_radius)} 0 0 0 "
                f"{_number(outer_end[0])} {_number(outer_end[1])}",
                f"L {_number(inner_end[0])} {_number(inner_end[1])}",
                f"A {_number(inner_radius)} {_number(inner_radius)} 0 0 1 "
                f"{_number(inner_start[0])} {_number(inner_start[1])}",
                "Z",
            )
        )
        return self._element(parent, "path", {"d": path, **attributes})

    def _background(self, root: ET.Element) -> None:
        layer = self._layer(root, "background")
        self._element(
            layer,
            "rect",
            {
                "x": "0",
                "y": "0",
                "width": _number(self.size),
                "height": _number(self.size),
                "fill": REFERENCE_COLORS["background"],
            },
        )

    def _outer_zodiac_ring(self, root: ET.Element) -> None:
        layer = self._layer(root, "outer-zodiac-ring")
        outer = self.radius("outer_edge")
        inner = self.radius("zodiac_inner")
        for index, (_sign, symbol) in enumerate(ZODIAC_SIGNS):
            start = self.screen_angle(index * 30.0)
            end = self.screen_angle((index + 1) * 30.0)
            sector = self._annular_sector(
                layer,
                start,
                end,
                outer,
                inner,
                fill=(
                    REFERENCE_COLORS["blue"]
                    if index % 2 == 0
                    else REFERENCE_COLORS["blue_light"]
                ),
                stroke=REFERENCE_COLORS["ink"],
                **{
                    "stroke-width": _number(
                        self.size * SVG_STROKE_RATIOS["separator"]
                    )
                },
            )
            sector.set("data-sign-index", str(index))
            midpoint = self.screen_angle(index * 30.0 + 15.0)
            x, y = self.point((outer + inner) / 2.0, midpoint)
            self._text(
                layer,
                _symbol_text(symbol),
                x,
                y,
                font_size=self.size * SVG_TEXT_RATIOS["zodiac_symbol"],
                fill=REFERENCE_COLORS["surface"],
                font_kind="symbol",
                weight="400",
                **{"data-role": "zodiac-symbol"},
            )

    def _sign_band(self, root: ET.Element) -> None:
        layer = self._layer(root, "sign-band")
        outer = self.radius("zodiac_inner")
        inner = self.radius("sign_inner")
        for index, (sign, _symbol) in enumerate(ZODIAC_SIGNS):
            sector = self._annular_sector(
                layer,
                self.screen_angle(index * 30.0),
                self.screen_angle((index + 1) * 30.0),
                outer,
                inner,
                fill=(
                    REFERENCE_COLORS["purple"]
                    if index % 2 == 0
                    else REFERENCE_COLORS["purple_light"]
                ),
                stroke=REFERENCE_COLORS["ink"],
                **{
                    "stroke-width": _number(
                        self.size * SVG_STROKE_RATIOS["separator"]
                    ),
                    "data-role": "sign-sector",
                    "data-sign": sign,
                },
            )
            sector.set("data-sign-index", str(index))
            midpoint = self.screen_angle(index * 30.0 + 15.0)
            x, y = self.point((outer + inner) / 2.0, midpoint)
            label = localized_sign_names(sign, self.locale).compact
            self._text(
                layer,
                label,
                x,
                y,
                font_size=self.size * SVG_TEXT_RATIOS["sign_name"],
                fill=REFERENCE_COLORS["surface"],
                weight="600",
                **{"data-role": "sign-label", "data-sign": sign},
            )

    def _degree_ring(self, root: ET.Element) -> None:
        layer = self._layer(root, "degree-ring")
        outer = self.radius("sign_inner")
        for longitude in range(360):
            self._line(
                layer,
                outer - self.size * MINUTE_TICK_STYLE.length_ratio,
                outer,
                self.screen_angle(longitude + 0.5),
                stroke=REFERENCE_COLORS["muted"],
                **{
                    "stroke-width": _number(
                        MINUTE_TICK_STYLE.width * self.size / 1180.0
                    ),
                    "stroke-opacity": "0.38",
                    "data-role": "minute-tick",
                    "data-degree": str(longitude),
                    "data-minute": "30",
                },
            )
            if longitude % TICK_HIERARCHY["major"].every_degrees == 0:
                style = TICK_HIERARCHY["major"]
                hierarchy = "major"
            elif longitude % TICK_HIERARCHY["medium"].every_degrees == 0:
                style = TICK_HIERARCHY["medium"]
                hierarchy = "medium"
            else:
                style = TICK_HIERARCHY["minor"]
                hierarchy = "minor"
            self._line(
                layer,
                outer - self.size * style.length_ratio,
                outer,
                self.screen_angle(float(longitude)),
                stroke=(
                    REFERENCE_COLORS["purple"]
                    if hierarchy == "major"
                    else REFERENCE_COLORS["muted"]
                ),
                **{
                    "stroke-width": _number(style.width * self.size / 1180.0),
                    "data-role": "degree-tick",
                    "data-degree": str(longitude),
                    "data-hierarchy": hierarchy,
                },
            )

    def _house_layers(self, root: ET.Element) -> None:
        sectors = self._layer(root, "house-sectors")
        cusps = self._layer(root, "house-cusps")
        numbers = self._layer(root, "house-number-ring")
        outer = self.radius("degree_ring")
        number_outer = self.radius("house_ring")
        number_inner = self.radius("house_number_inner")
        aspect_radius = self.radius("aspect_radius")

        for index, house in enumerate(self.data.houses):
            next_house = self.data.houses[(index + 1) % 12]
            start = self.screen_angle(house.longitude)
            end = self.screen_angle(next_house.longitude)
            self._annular_sector(
                sectors,
                start,
                end,
                outer,
                number_outer,
                fill=(
                    REFERENCE_COLORS["sector_even"]
                    if index % 2 == 0
                    else REFERENCE_COLORS["sector_odd"]
                ),
                stroke="none",
                **{
                    "data-role": "house-sector",
                    "data-house": str(house.house_number),
                },
            )
            self._line(
                cusps,
                aspect_radius,
                outer,
                start,
                stroke=REFERENCE_COLORS["line"],
                **{
                    "stroke-width": _number(
                        self.size * SVG_STROKE_RATIOS["house_cusp"]
                    ),
                    "data-role": "house-cusp",
                    "data-house": str(house.house_number),
                },
            )
            self._annular_sector(
                numbers,
                start,
                end,
                number_outer,
                number_inner,
                fill=(
                    REFERENCE_COLORS["gold_light"]
                    if index % 2 == 0
                    else "#F2D994"
                ),
                stroke=REFERENCE_COLORS["gold"],
                **{
                    "stroke-width": _number(
                        self.size * SVG_STROKE_RATIOS["separator"]
                    )
                },
            )
            span = (next_house.longitude - house.longitude) % 360.0
            midpoint = self.screen_angle(house.longitude + span / 2.0)
            x, y = self.point((number_outer + number_inner) / 2.0, midpoint)
            self._text(
                numbers,
                str(house.house_number),
                x,
                y,
                font_size=self.size * SVG_TEXT_RATIOS["house_number"],
                fill=REFERENCE_COLORS["ink"],
                weight="600",
                **{
                    "data-role": "house-number",
                    "data-house": str(house.house_number),
                },
            )

    def _aspect_web(self, root: ET.Element) -> None:
        layer = self._layer(root, "aspect-web")
        radius = self.radius("aspect_radius")
        self._element(
            layer,
            "circle",
            {
                "cx": _number(self.center),
                "cy": _number(self.center),
                "r": _number(radius),
                "fill": REFERENCE_COLORS["surface"],
                "stroke": REFERENCE_COLORS["gold"],
                "stroke-width": _number(self.size * SVG_STROKE_RATIOS["ring"]),
            },
        )
        for aspect in sorted(
            self.data.aspects, key=lambda item: (item.layer, item.strength)
        ):
            first = self.point(
                radius, self.screen_angle(self.positions[aspect.object_a_id])
            )
            second = self.point(
                radius, self.screen_angle(self.positions[aspect.object_b_id])
            )
            effective_opacity = aspect.opacity * (
                ASPECT_WEB_STYLE.opacity_floor
                + ASPECT_WEB_STYLE.opacity_strength_scale * aspect.strength
            )
            effective_width = aspect.width * (
                ASPECT_WEB_STYLE.width_floor
                + ASPECT_WEB_STYLE.width_strength_scale * aspect.strength
            )
            self._element(
                layer,
                "line",
                {
                    "x1": _number(first[0]),
                    "y1": _number(first[1]),
                    "x2": _number(second[0]),
                    "y2": _number(second[1]),
                    "stroke": aspect.color,
                    "stroke-opacity": _number(effective_opacity),
                    "stroke-width": _number(
                        effective_width * self.size / 1180.0
                    ),
                    "stroke-dasharray": (
                        "none"
                        if aspect.dash_pattern == "solid"
                        else aspect.dash_pattern
                    ),
                    "data-role": "aspect-line",
                    "data-aspect-name": aspect.aspect_name,
                    "data-object-a-id": aspect.object_a_id,
                    "data-object-b-id": aspect.object_b_id,
                    "data-layer-order": str(aspect.layer),
                    "data-strength": _number(aspect.strength),
                    "data-configured-opacity": _number(aspect.opacity),
                    "data-configured-width": _number(aspect.width),
                    "vector-effect": "non-scaling-stroke",
                },
            )

    def _object_labels(self, root: ET.Element) -> None:
        layer = self._layer(root, "object-labels")
        scale = self.size / 1180.0
        labels: list[LabelFootprint] = []
        localized_names: dict[str, str] = {}
        for body in self.data.objects:
            name = localized_object_names(
                body.id, self.locale, body.name
            ).compact
            localized_names[body.id] = name
            sign_symbol = self.zodiac_symbol(body.sign)
            position = f"{body.degree:02d}°{body.minute:02d}′ {sign_symbol}"
            if body.retrograde:
                position += " Rx"
            width = max(
                self.size * SVG_LAYOUT_RATIOS["object_label_min_width"],
                (
                    max(
                        len(name)
                        * SVG_LAYOUT_RATIOS["object_label_character_width"],
                        len(position)
                        * SVG_LAYOUT_RATIOS["object_label_character_width"]
                        * 0.68,
                    )
                    + SVG_LAYOUT_RATIOS["object_label_horizontal_padding"]
                )
                * self.size,
            )
            labels.append(
                LabelFootprint(
                    body.id,
                    self.screen_angle(body.longitude),
                    width,
                    self.size * SVG_LAYOUT_RATIOS["object_label_height"],
                )
            )
        placements = {
            placement.object_id: placement
            for placement in layout_labels(labels, default_layout_config(self.size))
        }

        for body in self.data.objects:
            placement = placements[body.id]
            box = placement.bounding_box
            self._element(
                layer,
                "line",
                {
                    "x1": _number(placement.leader_start.x),
                    "y1": _number(placement.leader_start.y),
                    "x2": _number(placement.leader_end.x),
                    "y2": _number(placement.leader_end.y),
                    "stroke": OBJECT_PALETTE[body.id],
                    "stroke-opacity": "0.62",
                    "stroke-width": _number(
                        self.size * SVG_STROKE_RATIOS["leader"]
                    ),
                    "data-role": "true-position-leader",
                    "data-object-id": body.id,
                    "vector-effect": "non-scaling-stroke",
                },
            )
            group = self._element(
                layer,
                "g",
                {
                    "id": f"object-{body.id.replace(':', '-')}",
                    "data-role": "object-label",
                    "data-object-id": body.id,
                    "data-true-longitude": _number(body.longitude),
                    "data-screen-angle": _number(placement.display_angle),
                    "data-sign": body.sign,
                    "data-sign-label": self.zodiac_symbol(body.sign),
                    "data-bbox-x": _number(box.x),
                    "data-bbox-y": _number(box.y),
                    "data-bbox-width": _number(box.width),
                    "data-bbox-height": _number(box.height),
                },
            )
            self._element(
                group,
                "rect",
                {
                    "x": _number(box.x),
                    "y": _number(box.y),
                    "width": _number(box.width),
                    "height": _number(box.height),
                    "rx": _number(3.0 * scale),
                    "fill": REFERENCE_COLORS["background"],
                    "fill-opacity": "0.34",
                    "stroke": OBJECT_PALETTE[body.id],
                    "stroke-opacity": "0.12",
                    "stroke-width": _number(0.45 * scale),
                },
            )
            symbol_x = box.x + box.height * 0.42
            text_x = box.x + box.height * 0.82
            self._text(
                group,
                _symbol_text(body.symbol),
                symbol_x,
                box.y + box.height / 2.0,
                font_size=self.size * SVG_TEXT_RATIOS["object_symbol"],
                fill=OBJECT_PALETTE[body.id],
                font_kind="symbol",
                weight="600",
            )
            self._text(
                group,
                localized_names[body.id],
                text_x,
                box.y + box.height * 0.34,
                font_size=self.size * SVG_TEXT_RATIOS["object_name"],
                fill=REFERENCE_COLORS["ink"],
                anchor="start",
                weight="600",
            )
            position = (
                f"{body.degree:02d}°{body.minute:02d}′ "
                f"{_symbol_text(self.zodiac_symbol(body.sign))}"
            )
            if body.retrograde:
                position += " Rx"
            self._text(
                group,
                position,
                text_x,
                box.y + box.height * 0.70,
                font_size=self.size * SVG_TEXT_RATIOS["object_position"],
                fill=REFERENCE_COLORS["ink"],
                anchor="start",
            )

    def _primary_angles(self, root: ET.Element) -> None:
        layer = self._layer(root, "primary-angles")
        inner = self.radius("aspect_radius")
        outer = self.radius("sign_inner")
        for name, angle in self.data.angles.items():
            screen_angle = self.screen_angle(angle.longitude)
            group = self._element(
                layer,
                "g",
                {
                    "id": angle.id.replace(":", "-"),
                    "data-role": "primary-angle",
                    "data-angle-id": angle.id,
                    "data-screen-angle": _number(screen_angle),
                    "data-sign": angle.sign,
                    "data-sign-label": self.zodiac_symbol(angle.sign),
                },
            )
            is_ascendant = angle.id == "angle:ascendant"
            color = (
                REFERENCE_COLORS["blue"]
                if is_ascendant
                else REFERENCE_COLORS["purple"]
            )
            self._line(
                group,
                inner,
                outer,
                screen_angle,
                stroke=color,
                **{
                    "stroke-width": _number(
                        self.size
                        * SVG_STROKE_RATIOS[
                            "angle" if is_ascendant else "house_cusp"
                        ]
                    ),
                    "vector-effect": "non-scaling-stroke",
                },
            )
            label_x, label_y = self.point(inner * 0.84, screen_angle)
            label = localized_angle_names(
                angle.id, self.locale, angle.name
            ).compact
            detail = (
                f"{label} · {angle.degree:02d}°{angle.minute:02d}′ "
                f"{_symbol_text(self.zodiac_symbol(angle.sign))}"
            )
            self._text(
                group,
                detail,
                label_x,
                label_y,
                font_size=self.size * SVG_TEXT_RATIOS["angle_label"],
                fill=color,
                weight="700",
                stroke=REFERENCE_COLORS["background"],
                **{
                    "stroke-width": _number(self.size * 0.0024),
                    "paint-order": "stroke",
                    "stroke-linejoin": "round",
                },
            )

    def _legend_metadata(self, root: ET.Element) -> None:
        layer = self._layer(root, "legend-metadata")
        birth = self.data.birth_data
        heading = "LÁ SỐ CHIÊM TINH" if self.locale == "vi" else "NATAL CHART"
        self._text(
            layer,
            heading,
            self.size * 0.018,
            self.size * 0.947,
            font_size=self.size * SVG_TEXT_RATIOS["metadata"],
            fill=REFERENCE_COLORS["ink"],
            anchor="start",
            weight="700",
        )
        metadata = (
            f"{birth.date} · {birth.time} · {birth.timezone} · "
            f"{birth.house_system.replace('_', ' ').title()}"
        )
        self._text(
            layer,
            metadata,
            self.size * 0.018,
            self.size * 0.962,
            font_size=self.size * SVG_TEXT_RATIOS["legend"],
            fill=REFERENCE_COLORS["ink"],
            anchor="start",
        )
        aspect_names = []
        for aspect in self.data.aspects:
            if aspect.aspect_name not in aspect_names:
                aspect_names.append(aspect.aspect_name)
        styles = {
            aspect.aspect_name: aspect for aspect in self.data.aspects
        }
        for index, aspect_name in enumerate(aspect_names):
            on_left = index < 6
            row = index % 6
            entry_x = self.size * (0.018 if on_left else 0.842)
            entry_y = self.size * (0.025 + row * 0.015)
            aspect = styles[aspect_name]
            entry = self._element(
                layer,
                "g",
                {
                    "data-role": "aspect-legend-entry",
                    "data-aspect-name": aspect_name,
                },
            )
            self._element(
                entry,
                "line",
                {
                    "x1": _number(entry_x),
                    "y1": _number(entry_y),
                    "x2": _number(entry_x + self.size * 0.026),
                    "y2": _number(entry_y),
                    "stroke": aspect.color,
                    "stroke-width": _number(aspect.width * self.size / 1180.0),
                    "stroke-dasharray": (
                        "none"
                        if aspect.dash_pattern == "solid"
                        else aspect.dash_pattern
                    ),
                },
            )
            self._text(
                entry,
                aspect_name,
                entry_x + self.size * 0.032,
                entry_y,
                font_size=self.size * SVG_TEXT_RATIOS["legend"],
                fill=REFERENCE_COLORS["ink"],
                anchor="start",
            )

    def render(self) -> str:
        root = ET.Element(
            _tag("svg"),
            {
                "viewBox": f"0 0 {self.size} {self.size}",
                "width": str(self.size),
                "height": str(self.size),
                "role": "img",
                "aria-labelledby": "chart-title chart-description",
                "data-locale": self.locale,
            },
        )
        self._element(
            root,
            "title",
            {"id": "chart-title"},
            "Lá số chiêm tinh" if self.locale == "vi" else "Natal chart",
        )
        self._element(
            root,
            "desc",
            {"id": "chart-description"},
            (
                "Vòng tròn chiêm tinh với cung hoàng đạo, nhà, hành tinh, "
                "góc chính và các góc hợp."
                if self.locale == "vi"
                else "Natal wheel with zodiac signs, houses, objects, primary "
                "angles, and labeled aspect styles."
            ),
        )
        self._background(root)
        self._outer_zodiac_ring(root)
        self._sign_band(root)
        self._degree_ring(root)
        self._house_layers(root)
        self._aspect_web(root)
        self._object_labels(root)
        self._primary_angles(root)
        self._legend_metadata(root)
        ET.indent(root, space="  ")
        return ET.tostring(root, encoding="unicode", xml_declaration=True) + "\n"
