"""Deterministic calculation and rendering for tropical natal charts."""

from .calculations import calculate_julian_day, calculate_natal_chart
from .models import NatalChartData, RenderSettings
from .renderer import export_json, export_svg, render_svg
from .svg_renderer import SVGRenderer


def create_natal_chart(
    *,
    date: str,
    time: str,
    latitude: float,
    longitude: float,
    timezone: str,
    house_system: str = "placidus",
    locale: str = "vi",
    size: int = 1180,
) -> NatalChartData:
    chart = calculate_natal_chart(
        date,
        time,
        latitude,
        longitude,
        timezone,
        house_system,
    )
    return chart.model_copy(
        update={"render_settings": RenderSettings(locale=locale, size=size)}
    )


__all__ = [
    "NatalChartData",
    "RenderSettings",
    "SVGRenderer",
    "calculate_julian_day",
    "calculate_natal_chart",
    "create_natal_chart",
    "export_json",
    "export_svg",
    "render_svg",
]
