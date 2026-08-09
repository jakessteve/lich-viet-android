function source(source_id, title, source_type, url) {
  return { source_id, title, source_type, url };
}

function method(method_id, label, domain, school_id, source_id) {
  return { method_id, label, domain, school_id, source_id };
}

export const CALCULATION_SOURCES = Object.freeze([
  source(
    "meeus_astro_algorithms",
    "Jean Meeus, Astronomical Algorithms",
    "book",
    "https://books.google.com/books/about/Astronomical_Algorithms.html?id=PU7XxnmcDwYC"
  ),
  source(
    "nasa_delta_t_poly",
    "NASA Eclipse: Polynomial Expressions for Delta T",
    "technical_reference",
    "https://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html"
  ),
  source(
    "jpl_approx_planets",
    "NASA JPL: Approximate Positions of the Planets",
    "technical_reference",
    "https://ssd.jpl.nasa.gov/planets/approx_pos.html"
  ),
  source(
    "noaa_solcalc",
    "NOAA Solar Calculation Details",
    "technical_reference",
    "https://gml.noaa.gov/grad/solcalc/calcdetails.html"
  ),
  source(
    "epsg_wgs84",
    "EPSG 7030 WGS 84 Ellipsoid",
    "geodetic_registry",
    "https://epsg.org/ellipsoid_7030/WGS-84.html"
  ),
  source(
    "iana_tzdb",
    "IANA Time Zone Database",
    "timezone_registry",
    "https://data.iana.org/time-zones/tz-link.html"
  ),
  source(
    "tzdb_asia",
    "tzdb asia source file",
    "timezone_source",
    "https://sources.debian.org/src/tzdata/2026b-1/asia"
  ),
  source(
    "springer_vedicdatetime",
    "VedicDateTime Panchanga implementation paper",
    "journal_article",
    "https://link.springer.com/article/10.1007/s11042-023-16553-w"
  ),
  source(
    "ptolemy_tetrabiblos",
    "Ptolemy, Tetrabiblos",
    "classical_text",
    "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Ptolemy/Tetrabiblos/home.html"
  ),
  source(
    "dorotheus_carmen",
    "Dorotheus of Sidon, Carmen Astrologicum, ed. David Pingree",
    "classical_text",
    "https://catalog.perseus.org/catalog/urn:cts:greekLit:tlg1337.tlg001.opp-ara1"
  ),
  source(
    "hkbfs_shidianguji",
    "Qinding Xieji Bianfang Shu source text",
    "classical_text",
    "https://www.shidianguji.com/zh/book/SK1619"
  ),
  source(
    "hwang_yoon_topsis",
    "Hwang and Yoon TOPSIS method",
    "academic_method",
    "https://doi.org/10.1007/978-3-642-48318-9"
  ),
  source(
    "steinarsson_lttb",
    "Downsampling Time Series for Visual Representation",
    "thesis",
    "https://skemman.is/handle/1946/15343"
  )
]);

export const CALCULATION_METHODS = Object.freeze([
  method("calc_julian_day", "Julian day conversion", "astronomy", "western_electional", "meeus_astro_algorithms"),
  method("calc_delta_t", "Delta T piecewise polynomial", "astronomy", "western_electional", "nasa_delta_t_poly"),
  method("calc_solar_longitude", "Apparent solar longitude", "astronomy", "western_electional", "meeus_astro_algorithms"),
  method("calc_solar_term_root", "Solar term root solving", "astronomy", "western_electional", "meeus_astro_algorithms"),
  method("calc_kepler_planets", "Low precision Keplerian planets", "astronomy", "western_electional", "jpl_approx_planets"),
  method("calc_lunar_perturb", "Low precision lunar perturbations", "astronomy", "western_electional", "meeus_astro_algorithms"),
  method("calc_sunrise_sunset", "Sunrise and sunset equation", "astronomy", "western_electional", "noaa_solcalc"),
  method("calc_refraction", "Pressure-temperature refraction scaling", "astronomy", "western_electional", "noaa_solcalc"),
  method("calc_wgs84_topocentric", "WGS84 topocentric observer transform", "geodesy", "western_electional", "epsg_wgs84"),
  method("calc_sidereal_ayanamsa", "Sidereal ayanamsa conversion", "vedic", "vedic_muhurta", "springer_vedicdatetime"),
  method("calc_nakshatra_pada", "Nakshatra and Pada division", "vedic", "vedic_muhurta", "springer_vedicdatetime"),
  method("calc_panchanga_limb", "Panchanga limb calculations", "vedic", "vedic_muhurta", "springer_vedicdatetime"),
  method("calc_western_aspect", "Western aspect geometry", "western", "western_electional", "ptolemy_tetrabiblos"),
  method("calc_void_of_course", "Void-of-course moon guard", "western", "western_electional", "dorotheus_carmen"),
  method("calc_hkbfs_dung_su", "Hiệp Kỷ Biện Phương Thư Dụng Sự vocabulary", "eastern", "hiep_ky_bien_phuong", "hkbfs_shidianguji"),
  method("calc_htzc_tzdb", "Vietnam historical timezone offsets", "timezone", "hiep_ky_bien_phuong", "tzdb_asia"),
  method("calc_topsis_score", "TOPSIS distance-to-ideal scoring", "scoring", "western_electional", "hwang_yoon_topsis"),
  method("calc_lttb_downsample", "Largest Triangle Three Buckets downsampling", "guardrail", "western_electional", "steinarsson_lttb")
]);

export const CALCULATION_METHOD_ENTITIES = Object.freeze(
  CALCULATION_METHODS.map((item) => ({
    entity_id: item.method_id,
    entity_type: "calculation_method"
  }))
);
