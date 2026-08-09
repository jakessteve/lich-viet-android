const PTOLEMY = "ptolemy_tetrabiblos";
const DOROTHEUS = "dorotheus_carmen";
const VEDIC_DATETIME = "springer_vedicdatetime";
const BRIHAT_SAMHITA = "brihat_samhita";

function concept(concept_id, tradition, label, category, source_ref) {
  return { concept_id, tradition, label, category, source_ref };
}

const WESTERN_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces"
].map((name) => concept(`western_sign_${name}`, "western", name, "zodiac", PTOLEMY));

const WESTERN_HOUSES = Array.from({ length: 12 }, (_, index) =>
  concept(`western_house_${String(index + 1).padStart(2, "0")}`, "western", `house ${index + 1}`, "house", PTOLEMY)
);

const WESTERN_ASPECTS = [
  ["conjunction", "conjunction"],
  ["sextile", "sextile"],
  ["square", "square"],
  ["trine", "trine"],
  ["opposition", "opposition"]
].map(([id, label]) => concept(`western_aspect_${id}`, "western", label, "aspect", PTOLEMY));

const WESTERN_DIGNITIES = [
  "domicile",
  "exaltation",
  "triplicity",
  "term",
  "face",
  "detriment",
  "fall"
].map((name) => concept(`western_dignity_${name}`, "western", name, "dignity", PTOLEMY));

const WESTERN_ELECTIONAL = [
  concept("western_phase_new_moon", "western", "new moon", "phase", PTOLEMY),
  concept("western_phase_full_moon", "western", "full moon", "phase", PTOLEMY),
  concept("western_planetary_hour", "western", "planetary hour", "hour", DOROTHEUS),
  concept("western_sect_day", "western", "day sect", "sect", PTOLEMY),
  concept("western_sect_night", "western", "night sect", "sect", PTOLEMY)
];

const NAKSHATRAS = [
  "ashwini",
  "bharani",
  "krittika",
  "rohini",
  "mrigashirsha",
  "ardra",
  "punarvasu",
  "pushya",
  "ashlesha",
  "magha",
  "purva_phalguni",
  "uttara_phalguni",
  "hasta",
  "chitra",
  "swati",
  "vishakha",
  "anuradha",
  "jyeshtha",
  "mula",
  "purva_ashadha",
  "uttara_ashadha",
  "shravana",
  "dhanishta",
  "shatabhisha",
  "purva_bhadrapada",
  "uttara_bhadrapada",
  "revati"
].map((name) => concept(`vedic_nakshatra_${name}`, "vedic", name, "nakshatra", VEDIC_DATETIME));

const TITHIS = [
  "pratipada",
  "dvitiya",
  "tritiya",
  "chaturthi",
  "panchami",
  "shashthi",
  "saptami",
  "ashtami",
  "navami",
  "dashami",
  "ekadashi",
  "dvadashi",
  "trayodashi",
  "chaturdashi",
  "purnima",
  "pratipada_krishna",
  "dvitiya_krishna",
  "tritiya_krishna",
  "chaturthi_krishna",
  "panchami_krishna",
  "shashthi_krishna",
  "saptami_krishna",
  "ashtami_krishna",
  "navami_krishna",
  "dashami_krishna",
  "ekadashi_krishna",
  "dvadashi_krishna",
  "trayodashi_krishna",
  "chaturdashi_krishna",
  "amavasya"
].map((name, index) => concept(`vedic_tithi_${String(index + 1).padStart(2, "0")}`, "vedic", name, "tithi", VEDIC_DATETIME));

const YOGAS = [
  "vishkambha",
  "priti",
  "ayushman",
  "saubhagya",
  "shobhana",
  "atiganda",
  "sukarma",
  "dhriti",
  "shula",
  "ganda",
  "vriddhi",
  "dhruva",
  "vyaghata",
  "harshana",
  "vajra",
  "siddhi",
  "vyatipata",
  "variyana",
  "parigha",
  "shiva",
  "siddha",
  "sadhya",
  "shubha",
  "shukla",
  "brahma",
  "indra",
  "vaidhriti"
].map((name) => concept(`vedic_yoga_${name}`, "vedic", name, "yoga", VEDIC_DATETIME));

const KARANAS = [
  "bava",
  "balava",
  "kaulava",
  "taitila",
  "gara",
  "vanija",
  "vishti",
  "shakuni",
  "chatushpada",
  "naga",
  "kimstughna"
].map((name) => concept(`vedic_karana_${name}`, "vedic", name, "karana", VEDIC_DATETIME));

const PANCHANGA_LIMBS = [
  "tithi",
  "vara",
  "nakshatra",
  "yoga",
  "karana"
].map((name) => concept(`vedic_panchanga_${name}`, "vedic", name, "panchanga", VEDIC_DATETIME));

const VEDIC_REFERENCE = [
  concept("vedic_graha_rahu", "vedic", "rahu", "graha", BRIHAT_SAMHITA),
  concept("vedic_graha_ketu", "vedic", "ketu", "graha", BRIHAT_SAMHITA),
  concept("vedic_ayanamsa_lahiri", "vedic", "lahiri ayanamsa", "ayanamsa", VEDIC_DATETIME),
  concept("vedic_ayanamsa_raman", "vedic", "raman ayanamsa", "ayanamsa", VEDIC_DATETIME),
  concept("vedic_ayanamsa_krishnamurti", "vedic", "krishnamurti ayanamsa", "ayanamsa", VEDIC_DATETIME),
  concept("vedic_ayanamsa_fagan_bradley", "vedic", "fagan-bradley ayanamsa", "ayanamsa", VEDIC_DATETIME)
];

export const ASTROLOGY_CONCEPTS = Object.freeze([
  ...WESTERN_SIGNS,
  ...WESTERN_HOUSES,
  ...WESTERN_ASPECTS,
  ...WESTERN_DIGNITIES,
  ...WESTERN_ELECTIONAL,
  ...NAKSHATRAS,
  ...TITHIS,
  ...YOGAS,
  ...KARANAS,
  ...PANCHANGA_LIMBS,
  ...VEDIC_REFERENCE
]);

export const ASTROLOGY_CONCEPT_ENTITIES = Object.freeze(
  ASTROLOGY_CONCEPTS.map((item) => ({
    entity_id: item.concept_id,
    entity_type: "astrology_concept"
  }))
);

export const ASTROLOGY_CONCEPT_ONTOLOGY_MAPPING = Object.freeze(
  ASTROLOGY_CONCEPTS.map((item) => ({
    school_id: item.tradition === "western" ? "western_electional" : "vedic_muhurta",
    entity_id: item.concept_id,
    element_attribute: item.category,
    is_enabled: true,
    weight_modifier: item.source_ref === DOROTHEUS ? 1.1 : 1
  }))
);

export const WESTERN_BODY_ONTOLOGY_MAPPING = Object.freeze([
  { school_id: "western_electional", entity_id: "sun", element_attribute: "fire", is_enabled: true, weight_modifier: 1.15 },
  { school_id: "western_electional", entity_id: "moon", element_attribute: "water", is_enabled: true, weight_modifier: 1.15 },
  { school_id: "western_electional", entity_id: "mercury", element_attribute: "air", is_enabled: true, weight_modifier: 1.05 },
  { school_id: "western_electional", entity_id: "mars", element_attribute: "fire", is_enabled: true, weight_modifier: 1.05 },
  { school_id: "western_electional", entity_id: "jupiter", element_attribute: "fire", is_enabled: true, weight_modifier: 1.05 },
  { school_id: "western_electional", entity_id: "saturn", element_attribute: "earth", is_enabled: true, weight_modifier: 1.05 }
]);

export const VEDIC_BODY_ONTOLOGY_MAPPING = Object.freeze([
  { school_id: "vedic_muhurta", entity_id: "sun", element_attribute: "fire", is_enabled: true, weight_modifier: 1.1 },
  { school_id: "vedic_muhurta", entity_id: "moon", element_attribute: "water", is_enabled: true, weight_modifier: 1.2 },
  { school_id: "vedic_muhurta", entity_id: "mercury", element_attribute: "earth", is_enabled: true, weight_modifier: 1.05 },
  { school_id: "vedic_muhurta", entity_id: "venus", element_attribute: "water", is_enabled: true, weight_modifier: 1.05 },
  { school_id: "vedic_muhurta", entity_id: "mars", element_attribute: "fire", is_enabled: true, weight_modifier: 1.05 },
  { school_id: "vedic_muhurta", entity_id: "saturn", element_attribute: "air", is_enabled: true, weight_modifier: 1.05 }
]);
