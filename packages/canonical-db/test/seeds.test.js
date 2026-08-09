import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCanonicalSeedSnapshot,
  getCanonicalSeedSummary,
  getDungSuScoringProfile,
  listAstrologyConcepts,
  listCalculationMethods,
  listCalculationSources,
  listDungSuEvents,
  listDungSuScoringProfiles,
  listSchoolMappings
} from "../src/seeds.js";

test("getCanonicalSeedSummary reports the bootstrap counts", () => {
  assert.deepEqual(getCanonicalSeedSummary(), {
    canonicalEntityCount: 419,
    astrologyConceptCount: 147,
    calculationMethodCount: 18,
    calculationSourceCount: 13,
    dungSuEventCount: 95,
    dungSuScoringProfileCount: 95,
    metaphysicalSchoolCount: 8,
    ontologyMappingCount: 535,
    htzcRuleCount: 10
  });
});

test("buildCanonicalSeedSnapshot returns all seed sections", () => {
  const snapshot = buildCanonicalSeedSnapshot();

  assert.equal(snapshot.canonicalEntities.length, 419);
  assert.equal(snapshot.astrologyConcepts.length, 147);
  assert.equal(snapshot.calculationMethods.length, 18);
  assert.equal(snapshot.calculationSources.length, 13);
  assert.equal(snapshot.dungSuEvents.length, 95);
  assert.equal(snapshot.dungSuScoringProfiles.length, 95);
  assert.equal(snapshot.metaphysicalSchools.length, 8);
  assert.equal(snapshot.entityOntologyMapping.length, 535);
  assert.equal(snapshot.htzcRegistry.length, 10);
});

test("listSchoolMappings returns canonical rows for a school", () => {
  const mappings = listSchoolMappings("western_electional");

  assert.equal(mappings.length, 49);
  assert.equal(mappings[0].school_id, "western_electional");
});

test("calculation knowledge seed backs implemented methods with source references", () => {
  const sources = listCalculationSources();
  const methods = listCalculationMethods();
  const sourceIds = new Set(sources.map((source) => source.source_id));

  assert.equal(sources.length, 13);
  assert.equal(methods.length, 18);
  assert.equal(methods.every((method) => sourceIds.has(method.source_id)), true);
  assert.equal(listCalculationMethods({ domain: "astronomy" }).length, 8);
  assert.deepEqual(
    methods.find((method) => method.method_id === "calc_solar_longitude"),
    {
      method_id: "calc_solar_longitude",
      label: "Apparent solar longitude",
      domain: "astronomy",
      school_id: "western_electional",
      source_id: "meeus_astro_algorithms"
    }
  );
  assert.deepEqual(
    methods.find((method) => method.method_id === "calc_htzc_tzdb"),
    {
      method_id: "calc_htzc_tzdb",
      label: "Vietnam historical timezone offsets",
      domain: "timezone",
      school_id: "hiep_ky_bien_phuong",
      source_id: "tzdb_asia"
    }
  );
  assert.equal(methods.some((method) => method.method_id === "calc_topsis_score"), true);
  assert.equal(methods.some((method) => method.method_id === "calc_lttb_downsample"), true);
  assert.equal(
    listSchoolMappings("western_electional").some((mapping) => mapping.entity_id === "calc_topsis_score"),
    false
  );
});

test("Western and Indian astrology concepts expose source-backed canonical vocabulary", () => {
  const western = listAstrologyConcepts({ tradition: "western" });
  const vedic = listAstrologyConcepts({ tradition: "vedic" });
  const westernMappings = listSchoolMappings("western_electional");
  const vedicMappings = listSchoolMappings("vedic_muhurta");
  const conceptIds = new Set([...western, ...vedic].map((concept) => concept.concept_id));

  assert.equal(western.length, 41);
  assert.equal(vedic.length, 106);
  assert.equal(conceptIds.size, 147);
  assert.equal(westernMappings.some((mapping) => mapping.entity_id === "western_aspect_trine"), true);
  assert.equal(westernMappings.some((mapping) => mapping.entity_id === "western_dignity_exaltation"), true);
  assert.equal(westernMappings.some((mapping) => mapping.entity_id === "sun"), true);
  assert.equal(vedicMappings.some((mapping) => mapping.entity_id === "vedic_panchanga_tithi"), true);
  assert.equal(vedicMappings.some((mapping) => mapping.entity_id === "vedic_nakshatra_ashwini"), true);
  assert.equal(vedicMappings.some((mapping) => mapping.entity_id === "vedic_tithi_30"), true);
  assert.equal(vedicMappings.some((mapping) => mapping.entity_id === "vedic_karana_vishti"), true);
  assert.equal(vedicMappings.some((mapping) => mapping.entity_id === "vedic_ayanamsa_lahiri"), true);
  assert.equal(vedicMappings.some((mapping) => mapping.entity_id === "moon"), true);
});

test("Dụng Sự event seed exposes Hiệp Kỷ Biện Phương Thư activity vocabulary", () => {
  const events = listDungSuEvents();
  const eventIds = new Set(events.map((event) => event.event_id));
  const mappings = listSchoolMappings("hiep_ky_bien_phuong");
  const mappedIds = new Set(mappings.map((mapping) => mapping.entity_id));

  assert.equal(eventIds.size, 95);
  assert.equal(mappedIds.size, 95);
  assert.deepEqual(mappedIds, eventIds);
  assert.deepEqual(
    events.find((event) => event.event_id === "ds_jia_qu"),
    {
      event_id: "ds_jia_qu",
      label_vi: "Cưới hỏi",
      classical_label: "嫁娶",
      category: "family",
      source_ref: "hkbfs_yiji_puzhu"
    }
  );
  assert.equal(events.some((event) => event.event_id === "ds_ru_zhai"), true);
  assert.equal(events.some((event) => event.event_id === "ds_zao_chuan"), true);
  assert.equal(events.some((event) => event.event_id === "ds_fang_shui"), true);
});

test("Dụng Sự scoring profiles cover every event and mark bounded specialist domains", () => {
  const events = listDungSuEvents();
  const profiles = listDungSuScoringProfiles();
  const eventIds = new Set(events.map((event) => event.event_id));
  const specialistProfiles = listDungSuScoringProfiles({ accuracyTier: "bounded_specialist_ready" });

  assert.equal(profiles.length, 95);
  assert.equal(profiles.every((profile) => eventIds.has(profile.event_id)), true);
  assert.equal(specialistProfiles.length, 27);
  assert.deepEqual(getDungSuScoringProfile("ds_jia_qu"), {
    event_id: "ds_jia_qu",
    scoring_profile_id: "ds_jia_qu_scoring",
    category: "family",
    source_ref: "hkbfs_yiji_puzhu",
    accuracy_tier: "bounded_specialist_ready",
    source_coverage_percent: 60,
    generic_weight: 0.3,
    cross_system_weight: 0.3,
    specialist_weight: 0.4,
    hard_cap_missing_specialist: null,
    specialist_ref: "synastry_tuvi_western_vedic"
  });
  assert.deepEqual(getDungSuScoringProfile("ds_kai_shi"), {
    event_id: "ds_kai_shi",
    scoring_profile_id: "ds_kai_shi_scoring",
    category: "market",
    source_ref: "hkbfs_yiji_puzhu",
    accuracy_tier: "complete",
    source_coverage_percent: 100,
    generic_weight: 0.7,
    cross_system_weight: 0.3,
    specialist_weight: 0,
    hard_cap_missing_specialist: null,
    specialist_ref: null
  });
});
