from __future__ import annotations

from pathlib import Path

from .localization import Locale
from .models import NatalChartData
from .svg_renderer import SVGRenderer


def render_svg(
    data: NatalChartData,
    *,
    size: int | None = None,
    locale: Locale | None = None,
) -> str:
    return SVGRenderer(data, size=size, locale=locale).render()


def serialize_json(data: NatalChartData) -> str:
    return data.model_dump_json(indent=2) + "\n"


def _write_text(filepath: str | Path, content: str) -> Path:
    output = Path(filepath)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(content, encoding="utf-8", newline="\n")
    return output


def export_json(data: NatalChartData, filepath: str | Path) -> Path:
    return _write_text(filepath, serialize_json(data))


def export_svg(
    data: NatalChartData,
    filepath: str | Path,
    *,
    size: int | None = None,
    locale: Locale | None = None,
    width: int | None = None,
    height: int | None = None,
) -> Path:
    if size is None:
        if width is None and height is None:
            size = data.render_settings.size
        elif width is not None and height is not None and width == height:
            size = width
        else:
            raise ValueError("Natal chart SVG must use equal width and height")
    elif width is not None or height is not None:
        raise ValueError("Use either size or equal width/height, not both")
    return _write_text(filepath, render_svg(data, size=size, locale=locale))
