from __future__ import annotations

import pytest


@pytest.fixture(scope="session")
def hanoi_birth() -> dict[str, object]:
    return {
        "date_str": "2000-01-01",
        "time_str": "12:00:00",
        "latitude": 21.0285,
        "longitude": 105.8542,
        "timezone_str": "Asia/Ho_Chi_Minh",
        "house_system": "placidus",
    }


@pytest.fixture(scope="session")
def hanoi_chart(hanoi_birth):
    from natal_chart.calculations import calculate_natal_chart

    return calculate_natal_chart(**hanoi_birth)
