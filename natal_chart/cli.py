from __future__ import annotations

import argparse
from pathlib import Path
import stat
import sys
from typing import Sequence
from uuid import uuid4

from .calculations import calculate_natal_chart
from .models import RenderSettings
from .renderer import render_svg, serialize_json


def _remove_if_present(path: Path) -> None:
    try:
        path.unlink()
    except FileNotFoundError:
        pass


def _preflight_output_target(path: Path) -> bool:
    """Return whether a target exists, refusing links and non-regular nodes."""

    try:
        target_stat = path.lstat()
    except FileNotFoundError:
        return False
    if not stat.S_ISREG(target_stat.st_mode):
        raise ValueError(
            f"Output target must be absent or a regular non-symlink file: {path}"
        )
    return True


def _write_output_pair(
    svg_path: Path, json_path: Path, svg: str, serialized: str
) -> None:
    """Publish both sibling outputs, rolling back any incomplete replacement."""

    svg_path = Path(svg_path)
    json_path = Path(json_path)
    if svg_path.parent != json_path.parent:
        raise ValueError("SVG and JSON outputs must share a parent directory")
    svg_path.parent.mkdir(parents=True, exist_ok=True)

    had_svg = _preflight_output_target(svg_path)
    had_json = _preflight_output_target(json_path)
    if had_svg != had_json:
        raise RuntimeError("Refusing to replace an incomplete existing output pair")
    had_pair = had_svg and had_json

    token = uuid4().hex
    svg_temp = svg_path.with_name(f".{svg_path.name}.{token}.tmp")
    json_temp = json_path.with_name(f".{json_path.name}.{token}.tmp")
    svg_backup = svg_path.with_name(f".{svg_path.name}.{token}.bak")
    json_backup = json_path.with_name(f".{json_path.name}.{token}.bak")
    temporary_paths = (svg_temp, json_temp)
    backup_paths = (svg_backup, json_backup)
    backed_up_svg = False
    backed_up_json = False
    published_svg = False
    published_json = False

    try:
        svg_temp.write_text(svg, encoding="utf-8", newline="\n")
        json_temp.write_text(serialized, encoding="utf-8", newline="\n")
        if had_pair:
            svg_path.replace(svg_backup)
            backed_up_svg = True
            json_path.replace(json_backup)
            backed_up_json = True
        svg_temp.replace(svg_path)
        published_svg = True
        json_temp.replace(json_path)
        published_json = True
    except BaseException:
        if published_svg:
            _remove_if_present(svg_path)
        if published_json:
            _remove_if_present(json_path)
        if backed_up_svg:
            svg_backup.replace(svg_path)
            backed_up_svg = False
        if backed_up_json:
            json_backup.replace(json_path)
            backed_up_json = False
        for path in temporary_paths:
            _remove_if_present(path)
        for path in backup_paths:
            _remove_if_present(path)
        raise
    else:
        for path in backup_paths:
            _remove_if_present(path)


def _positive_size(value: str) -> int:
    try:
        size = int(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("size must be an integer") from exc
    if size <= 0:
        raise argparse.ArgumentTypeError("size must be positive")
    return size


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m natal_chart",
        description="Generate a deterministic natal-chart SVG and JSON pair.",
    )
    parser.add_argument("--date", required=True, help="Local date: YYYY-MM-DD")
    parser.add_argument("--time", required=True, help="Local time: HH:MM:SS")
    parser.add_argument("--lat", required=True, type=float, help="Latitude")
    parser.add_argument("--lng", required=True, type=float, help="Longitude")
    parser.add_argument("--timezone", required=True, help="IANA timezone")
    parser.add_argument(
        "--house-system",
        choices=("placidus", "whole_sign"),
        default="placidus",
    )
    parser.add_argument("--locale", choices=("en", "vi"), default="vi")
    parser.add_argument("--size", type=_positive_size, default=1180)
    parser.add_argument(
        "--output", required=True, help="Output basename without extension"
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    arguments = build_parser().parse_args(argv)
    try:
        chart = calculate_natal_chart(
            arguments.date,
            arguments.time,
            arguments.lat,
            arguments.lng,
            arguments.timezone,
            arguments.house_system,
        )
        chart = chart.model_copy(
            update={
                "render_settings": RenderSettings(
                    locale=arguments.locale, size=arguments.size
                )
            }
        )
        svg = render_svg(chart)
        serialized = serialize_json(chart)
        basename = Path(arguments.output)
        svg_path = basename.with_suffix(".svg")
        json_path = basename.with_suffix(".json")
        _write_output_pair(svg_path, json_path, svg, serialized)
    except Exception as exc:
        message = " ".join(str(exc).splitlines()) or exc.__class__.__name__
        print(f"error: {message}", file=sys.stderr)
        return 2
    print(f"Generated {svg_path} and {json_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
