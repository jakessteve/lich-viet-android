from __future__ import annotations

from dataclasses import dataclass
from types import MappingProxyType
from typing import Literal, Mapping


Locale = Literal["en", "vi"]


@dataclass(frozen=True)
class LocalizedNames:
    compact: str
    full: str


@dataclass(frozen=True)
class BilingualNames:
    en: LocalizedNames
    vi: LocalizedNames


def _names(
    en_compact: str, en_full: str, vi_compact: str, vi_full: str
) -> BilingualNames:
    return BilingualNames(
        en=LocalizedNames(en_compact, en_full),
        vi=LocalizedNames(vi_compact, vi_full),
    )


SIGN_LABELS: Mapping[str, BilingualNames] = MappingProxyType(
    {
        "Aries": _names("Ari", "Aries", "B.Dương", "Bạch Dương"),
        "Taurus": _names("Tau", "Taurus", "K.Ngưu", "Kim Ngưu"),
        "Gemini": _names("Gem", "Gemini", "S.Tử", "Song Tử"),
        "Cancer": _names("Can", "Cancer", "C.Giải", "Cự Giải"),
        "Leo": _names("Leo", "Leo", "S.Tử", "Sư Tử"),
        "Virgo": _names("Vir", "Virgo", "X.Nữ", "Xử Nữ"),
        "Libra": _names("Lib", "Libra", "T.Bình", "Thiên Bình"),
        "Scorpio": _names("Sco", "Scorpio", "B.Cạp", "Bọ Cạp"),
        "Sagittarius": _names("Sag", "Sagittarius", "N.Mã", "Nhân Mã"),
        "Capricorn": _names("Cap", "Capricorn", "M.Kết", "Ma Kết"),
        "Aquarius": _names("Aqu", "Aquarius", "B.Bình", "Bảo Bình"),
        "Pisces": _names("Pis", "Pisces", "S.Ngư", "Song Ngư"),
    }
)

OBJECT_LABELS: Mapping[str, BilingualNames] = MappingProxyType(
    {
        "planet:sun": _names("Sun", "Sun", "M.Trời", "Mặt Trời"),
        "planet:moon": _names("Moon", "Moon", "M.Trăng", "Mặt Trăng"),
        "planet:mercury": _names("Merc", "Mercury", "Thủy", "Sao Thủy"),
        "planet:venus": _names("Ven", "Venus", "Kim", "Sao Kim"),
        "planet:mars": _names("Mars", "Mars", "Hỏa", "Sao Hỏa"),
        "planet:jupiter": _names("Jup", "Jupiter", "Mộc", "Sao Mộc"),
        "planet:saturn": _names("Sat", "Saturn", "Thổ", "Sao Thổ"),
        "planet:uranus": _names("Ura", "Uranus", "T.Vương", "Thiên Vương"),
        "planet:neptune": _names("Nep", "Neptune", "H.Vương", "Hải Vương"),
        "planet:pluto": _names("Plu", "Pluto", "D.Vương", "Diêm Vương"),
        "centaur:chiron": _names("Chi", "Chiron", "Chi", "Chiron"),
        "lunar-point:mean-lilith": _names(
            "Lilith", "Mean Lilith", "Lilith", "Lilith Trung Bình"
        ),
        "lunar-point:true-north-node": _names(
            "N.Node", "True Node", "La Hầu", "La Hầu"
        ),
        "derived:true-south-node": _names(
            "S.Node", "South Node", "Kế Đô", "Kế Đô"
        ),
        "derived:part-of-fortune": _names(
            "PoF", "Part of Fortune", "P.May", "Điểm May Mắn"
        ),
        "angle:vertex": _names("Vx", "Vertex", "Vx", "Vertex"),
        "asteroid:ceres": _names("Cer", "Ceres", "Cer", "Ceres"),
        "asteroid:pallas": _names("Pal", "Pallas", "Pal", "Pallas"),
        "asteroid:juno": _names("Jun", "Juno", "Jun", "Juno"),
        "asteroid:vesta": _names("Ves", "Vesta", "Ves", "Vesta"),
    }
)

ANGLE_LABELS: Mapping[str, BilingualNames] = MappingProxyType(
    {
        "angle:ascendant": _names("ASC", "Ascendant", "ASC", "Cung Mọc"),
        "angle:descendant": _names("DSC", "Descendant", "DSC", "Cung Lặn"),
        "angle:midheaven": _names("MC", "Midheaven", "MC", "Thiên Đỉnh"),
        "angle:imum-coeli": _names("IC", "Imum Coeli", "IC", "Thiên Đế"),
    }
)


def _resolve(
    registry: Mapping[str, BilingualNames],
    key: str,
    locale: str,
    fallback: str | None,
) -> LocalizedNames:
    labels = registry.get(key)
    if labels is None:
        value = fallback if fallback is not None else key
        return LocalizedNames(value, value)
    return labels.vi if locale == "vi" else labels.en


def localized_sign_names(sign: str, locale: str = "vi") -> LocalizedNames:
    return _resolve(SIGN_LABELS, sign, locale, sign)


def localized_object_names(
    object_id: str, locale: str = "vi", fallback: str | None = None
) -> LocalizedNames:
    return _resolve(OBJECT_LABELS, object_id, locale, fallback)


def localized_angle_names(
    angle_id: str, locale: str = "vi", fallback: str | None = None
) -> LocalizedNames:
    return _resolve(ANGLE_LABELS, angle_id, locale, fallback)


ZODIAC_NAMES_EN = {key: labels.en.full for key, labels in SIGN_LABELS.items()}
ZODIAC_NAMES_VI = {key: labels.vi.full for key, labels in SIGN_LABELS.items()}

_BODY_LABELS_BY_NAME = {
    labels.en.full: labels for labels in (*OBJECT_LABELS.values(), *ANGLE_LABELS.values())
}
PLANET_NAMES_EN = {key: labels.en.full for key, labels in _BODY_LABELS_BY_NAME.items()}
PLANET_NAMES_VI = {key: labels.vi.full for key, labels in _BODY_LABELS_BY_NAME.items()}

BODY_SYMBOLS = {
    "Sun": "☉",
    "Moon": "☽",
    "Mercury": "☿",
    "Venus": "♀",
    "Mars": "♂",
    "Jupiter": "♃",
    "Saturn": "♄",
    "Uranus": "♅",
    "Neptune": "♆",
    "Pluto": "♇",
    "Chiron": "⚷",
    "Mean Lilith": "⚸",
    "True Node": "☊",
    "South Node": "☋",
    "Part of Fortune": "⊗",
    "Vertex": "Vx",
    "Ceres": "⚳",
    "Pallas": "⚴",
    "Juno": "⚵",
    "Vesta": "⚶",
    "Ascendant": "ASC",
    "Descendant": "DSC",
    "Midheaven": "MC",
    "Imum Coeli": "IC",
}


def localize_sign(sign: str, locale: Locale = "vi") -> str:
    return localized_sign_names(sign, locale).full


def localize_body(name: str, locale: Locale = "vi") -> str:
    labels = _BODY_LABELS_BY_NAME.get(name)
    if labels is None:
        return name
    return labels.vi.full if locale == "vi" else labels.en.full


def body_symbol(name: str) -> str:
    return BODY_SYMBOLS.get(name, name)
