from __future__ import annotations

import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import xml.etree.ElementTree as ET

import pytest

import natal_chart.cli as cli
from natal_chart.models import NatalChartData
from natal_chart.renderer import render_svg


ROOT = Path(__file__).parents[2]


def run_cli(*arguments: str) -> subprocess.CompletedProcess[str]:
    environment = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1"}
    return subprocess.run(
        [sys.executable, "-m", "natal_chart", *arguments],
        cwd=ROOT,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
        timeout=5,
    )


def test_cli_generates_svg_and_json_with_declared_settings(tmp_path):
    output = tmp_path / "safe" / "nested" / "hanoi"

    result = run_cli(
        "--date",
        "2000-01-01",
        "--time",
        "12:00:00",
        "--lat",
        "21.0285",
        "--lng",
        "105.8542",
        "--timezone",
        "Asia/Ho_Chi_Minh",
        "--house-system",
        "whole_sign",
        "--locale",
        "en",
        "--size",
        "360",
        "--output",
        str(output),
    )

    assert result.returncode == 0, result.stderr
    assert result.stderr == ""
    assert "Generated" in result.stdout
    svg_path = output.with_suffix(".svg")
    json_path = output.with_suffix(".json")
    assert svg_path.is_file() and json_path.is_file()
    root = ET.parse(svg_path).getroot()
    assert root.attrib["viewBox"] == "0 0 360 360"
    assert root.attrib["data-locale"] == "en"
    payload = json.loads(json_path.read_text(encoding="utf-8"))
    assert payload["birth_data"]["house_system"] == "whole_sign"
    assert payload["render_settings"] == {"locale": "en", "size": 360}
    assert len(payload["objects"]) == 20
    loaded = NatalChartData.model_validate(payload)
    assert render_svg(loaded) == svg_path.read_text(encoding="utf-8")


def test_cli_defaults_are_serialized_and_reproduce_the_paired_svg(tmp_path):
    output = tmp_path / "defaults" / "hanoi"

    result = run_cli(
        "--date",
        "2000-01-01",
        "--time",
        "12:00:00",
        "--lat",
        "21.0285",
        "--lng",
        "105.8542",
        "--timezone",
        "Asia/Ho_Chi_Minh",
        "--output",
        str(output),
    )

    assert result.returncode == 0, result.stderr
    loaded = NatalChartData.model_validate_json(
        output.with_suffix(".json").read_text(encoding="utf-8")
    )
    assert loaded.render_settings.locale == "vi"
    assert loaded.render_settings.size == 1180
    assert render_svg(loaded) == output.with_suffix(".svg").read_text(
        encoding="utf-8"
    )


def test_cli_invalid_input_is_concise_nonzero_and_writes_no_partial_output(
    tmp_path,
):
    output = tmp_path / "invalid" / "chart"

    result = run_cli(
        "--date",
        "2000-01-01",
        "--time",
        "12:00:00",
        "--lat",
        "21.0285",
        "--lng",
        "105.8542",
        "--timezone",
        "Not/AZone",
        "--house-system",
        "placidus",
        "--output",
        str(output),
    )

    assert result.returncode != 0
    assert result.stdout == ""
    assert result.stderr.startswith("error:")
    assert "Invalid IANA timezone" in result.stderr
    assert not output.with_suffix(".svg").exists()
    assert not output.with_suffix(".json").exists()


def test_cli_rejects_invalid_locale_and_size_before_generation(tmp_path):
    output = tmp_path / "rejected"
    common = (
        "--date",
        "2000-01-01",
        "--time",
        "12:00:00",
        "--lat",
        "21.0285",
        "--lng",
        "105.8542",
        "--timezone",
        "Asia/Ho_Chi_Minh",
        "--output",
        str(output),
    )

    bad_locale = run_cli(*common, "--locale", "fr")
    bad_size = run_cli(*common, "--size", "0")

    assert bad_locale.returncode != 0
    assert bad_size.returncode != 0
    assert not output.with_suffix(".svg").exists()
    assert not output.with_suffix(".json").exists()


def assert_only_complete_prior_pair_remains(
    directory: Path, svg_path: Path, json_path: Path
) -> None:
    assert svg_path.read_text(encoding="utf-8") == "old svg\n"
    assert json_path.read_text(encoding="utf-8") == "old json\n"
    assert sorted(path.name for path in directory.iterdir()) == sorted(
        (svg_path.name, json_path.name)
    )


def test_pair_safe_writer_preserves_prior_pair_when_second_temp_write_fails(
    tmp_path, monkeypatch
):
    svg_path = tmp_path / "chart.svg"
    json_path = tmp_path / "chart.json"
    svg_path.write_text("old svg\n", encoding="utf-8")
    json_path.write_text("old json\n", encoding="utf-8")
    real_write_text = Path.write_text
    temp_writes = 0

    def fail_second_temp_write(path, content, *args, **kwargs):
        nonlocal temp_writes
        if path not in (svg_path, json_path):
            temp_writes += 1
            if temp_writes == 2:
                raise OSError("injected second temporary write failure")
        return real_write_text(path, content, *args, **kwargs)

    monkeypatch.setattr(Path, "write_text", fail_second_temp_write)

    with pytest.raises(OSError, match="second temporary write"):
        cli._write_output_pair(svg_path, json_path, "new svg\n", "new json\n")

    assert_only_complete_prior_pair_remains(tmp_path, svg_path, json_path)


def test_pair_safe_writer_rolls_back_prior_pair_when_second_publish_fails(
    tmp_path, monkeypatch
):
    svg_path = tmp_path / "chart.svg"
    json_path = tmp_path / "chart.json"
    svg_path.write_text("old svg\n", encoding="utf-8")
    json_path.write_text("old json\n", encoding="utf-8")
    real_replace = Path.replace
    injected = False

    def fail_second_publish(path, target):
        nonlocal injected
        if Path(target) == json_path and not injected:
            injected = True
            raise OSError("injected second publish failure")
        return real_replace(path, target)

    monkeypatch.setattr(Path, "replace", fail_second_publish)

    with pytest.raises(OSError, match="second publish"):
        cli._write_output_pair(svg_path, json_path, "new svg\n", "new json\n")

    assert injected
    assert_only_complete_prior_pair_remains(tmp_path, svg_path, json_path)


def test_pair_safe_writer_removes_new_partial_pair_when_publish_fails(
    tmp_path, monkeypatch
):
    svg_path = tmp_path / "chart.svg"
    json_path = tmp_path / "chart.json"
    real_replace = Path.replace
    injected = False

    def fail_second_publish(path, target):
        nonlocal injected
        if Path(target) == json_path and not injected:
            injected = True
            raise OSError("injected second publish failure")
        return real_replace(path, target)

    monkeypatch.setattr(Path, "replace", fail_second_publish)

    with pytest.raises(OSError, match="second publish"):
        cli._write_output_pair(svg_path, json_path, "new svg\n", "new json\n")

    assert injected
    assert list(tmp_path.iterdir()) == []


def assert_no_transaction_artifacts(directory: Path) -> None:
    assert not [
        path
        for path in directory.iterdir()
        if path.name.startswith(".")
        and (path.name.endswith(".tmp") or path.name.endswith(".bak"))
    ]


def forbid_pair_write_activity(monkeypatch) -> None:
    def unexpected_activity(*args, **kwargs):
        pytest.fail("pair writer touched output before target preflight completed")

    monkeypatch.setattr(Path, "write_text", unexpected_activity)
    monkeypatch.setattr(Path, "replace", unexpected_activity)


def test_pair_safe_writer_refuses_paired_directories_without_touching_them(
    tmp_path, monkeypatch
):
    svg_path = tmp_path / "chart.svg"
    json_path = tmp_path / "chart.json"
    svg_path.mkdir()
    json_path.mkdir()
    forbid_pair_write_activity(monkeypatch)

    with pytest.raises(ValueError, match="regular non-symlink"):
        cli._write_output_pair(svg_path, json_path, "new svg\n", "new json\n")

    assert svg_path.is_dir() and json_path.is_dir()
    assert list(svg_path.iterdir()) == [] and list(json_path.iterdir()) == []
    assert_no_transaction_artifacts(tmp_path)


def test_pair_safe_writer_refuses_live_and_dangling_symlinks_unchanged(
    tmp_path, monkeypatch
):
    svg_source = tmp_path / "prior.svg"
    svg_source.write_text("old svg\n", encoding="utf-8")
    missing_json_source = tmp_path / "missing.json"
    svg_path = tmp_path / "chart.svg"
    json_path = tmp_path / "chart.json"
    svg_path.symlink_to(svg_source.name)
    json_path.symlink_to(missing_json_source.name)
    forbid_pair_write_activity(monkeypatch)

    with pytest.raises(ValueError, match="regular non-symlink"):
        cli._write_output_pair(svg_path, json_path, "new svg\n", "new json\n")

    assert svg_path.is_symlink() and svg_path.readlink() == Path(svg_source.name)
    assert json_path.is_symlink()
    assert json_path.readlink() == Path(missing_json_source.name)
    assert not json_path.exists()
    assert svg_source.read_text(encoding="utf-8") == "old svg\n"
    assert_no_transaction_artifacts(tmp_path)


@pytest.mark.skipif(not hasattr(os, "mkfifo"), reason="FIFO requires POSIX mkfifo")
def test_pair_safe_writer_refuses_fifo_when_other_target_is_regular(
    tmp_path, monkeypatch
):
    svg_path = tmp_path / "chart.svg"
    json_path = tmp_path / "chart.json"
    os.mkfifo(svg_path)
    json_path.write_text("old json\n", encoding="utf-8")
    forbid_pair_write_activity(monkeypatch)

    with pytest.raises(ValueError, match="regular non-symlink"):
        cli._write_output_pair(svg_path, json_path, "new svg\n", "new json\n")

    assert stat.S_ISFIFO(svg_path.lstat().st_mode)
    assert json_path.read_text(encoding="utf-8") == "old json\n"
    assert_no_transaction_artifacts(tmp_path)
