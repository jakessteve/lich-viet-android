import { ASTROLOGY_CONCEPTS } from "../seeds/astrology-concepts.js";
import {
  CALCULATION_METHODS,
  CALCULATION_SOURCES
} from "../seeds/calculation-knowledge.js";
import { CANONICAL_ENTITIES } from "../seeds/canonical-entities.js";
import { DUNG_SU_EVENTS } from "../seeds/dung-su-events.js";
import { DUNG_SU_SCORING_PROFILES } from "../seeds/dung-su-scoring.js";
import { ENTITY_ONTOLOGY_MAPPING } from "../seeds/entity-ontology-mapping.js";
import { METAPHYSICAL_SCHOOLS } from "../seeds/metaphysical-schools.js";
import { HTZC_RULES } from "./htzc.js";

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

export function buildCanonicalSeedSnapshot() {
  return {
    canonicalEntities: cloneRows(CANONICAL_ENTITIES),
    astrologyConcepts: cloneRows(ASTROLOGY_CONCEPTS),
    calculationSources: cloneRows(CALCULATION_SOURCES),
    calculationMethods: cloneRows(CALCULATION_METHODS),
    dungSuEvents: cloneRows(DUNG_SU_EVENTS),
    dungSuScoringProfiles: cloneRows(DUNG_SU_SCORING_PROFILES),
    metaphysicalSchools: cloneRows(METAPHYSICAL_SCHOOLS),
    entityOntologyMapping: cloneRows(ENTITY_ONTOLOGY_MAPPING),
    htzcRegistry: HTZC_RULES.map((rule) => ({ ...rule }))
  };
}

export function listSchoolMappings(schoolId) {
  if (typeof schoolId !== "string" || schoolId.trim() === "") {
    throw new TypeError("schoolId must be a non-empty string");
  }

  return ENTITY_ONTOLOGY_MAPPING.filter((mapping) => mapping.school_id === schoolId).map(
    (mapping) => ({ ...mapping })
  );
}

export function listDungSuEvents() {
  return cloneRows(DUNG_SU_EVENTS);
}

export function listDungSuScoringProfiles({ accuracyTier } = {}) {
  if (accuracyTier !== undefined && typeof accuracyTier !== "string") {
    throw new TypeError("accuracyTier must be a string when provided");
  }

  return DUNG_SU_SCORING_PROFILES
    .filter((profile) => accuracyTier === undefined || profile.accuracy_tier === accuracyTier)
    .map((profile) => ({ ...profile }));
}

export function getDungSuScoringProfile(eventId) {
  if (typeof eventId !== "string" || eventId.trim() === "") {
    throw new TypeError("eventId must be a non-empty string");
  }

  const profile = DUNG_SU_SCORING_PROFILES.find((item) => item.event_id === eventId);

  if (!profile) {
    throw new RangeError(`Unknown Dụng Sự event id: ${eventId}`);
  }

  return { ...profile };
}

export function listAstrologyConcepts({ tradition } = {}) {
  if (tradition !== undefined && typeof tradition !== "string") {
    throw new TypeError("tradition must be a string when provided");
  }

  return ASTROLOGY_CONCEPTS
    .filter((item) => tradition === undefined || item.tradition === tradition)
    .map((item) => ({ ...item }));
}

export function listCalculationSources() {
  return cloneRows(CALCULATION_SOURCES);
}

export function listCalculationMethods({ domain } = {}) {
  if (domain !== undefined && typeof domain !== "string") {
    throw new TypeError("domain must be a string when provided");
  }

  return CALCULATION_METHODS
    .filter((item) => domain === undefined || item.domain === domain)
    .map((item) => ({ ...item }));
}

export function getCanonicalSeedSummary() {
  return {
    canonicalEntityCount: CANONICAL_ENTITIES.length,
    astrologyConceptCount: ASTROLOGY_CONCEPTS.length,
    calculationMethodCount: CALCULATION_METHODS.length,
    calculationSourceCount: CALCULATION_SOURCES.length,
    dungSuEventCount: DUNG_SU_EVENTS.length,
    dungSuScoringProfileCount: DUNG_SU_SCORING_PROFILES.length,
    metaphysicalSchoolCount: METAPHYSICAL_SCHOOLS.length,
    ontologyMappingCount: ENTITY_ONTOLOGY_MAPPING.length,
    htzcRuleCount: HTZC_RULES.length
  };
}
