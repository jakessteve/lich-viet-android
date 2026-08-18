import {
  getDungSuScoringProfile,
  listAstrologyConcepts,
  listCalculationMethods,
  listCalculationSources,
  listDungSuEvents,
  listDungSuScoringProfiles
} from "@lich-viet/canonical-db";
import {
  calculateDungSuEventScore,
  computeWeightedScore,
  unixMsToJulianDay,
  getBranchRelationship,
  calculateTarabala,
  calculateDaiHanAgeRanges,
  calculateTieuHanPalaceIndex,
  calculateNguyetHanPalaces,
  resolveTuViBirthContext,
  createTuViStarChart,
  getLunarDate,
  computeOuterPlanets,
  computeMeanNorthNode,
  computeMeanLilith,
  computeChiron,
  computeDignity,
  computeAntiscia,
  computePartOfFortune,
  computeDispositorTree,
  detectChartShape,
  detectParallels,
  computeAllMidpoints,
  findMidpointContacts,
  detectMinorAspects,
  convertTropicalToSidereal,
  computePlacidusCusps,
  computeKochCusps,
  detectInterceptedSigns,
  computeVariableOrbs,
  computeReceptions,
  computeAlmuten,
  computeEgyptianBound,
  computePtolemaicTerm,
  computePlanetaryVelocity,
  computeNavamsha, 
  computeVimshottariDasha, 
  computeVedicDignity 
} from "@lich-viet/core-logic";
import { 
  detectStationaryPlanets,
  computeEclipseConditions,
  computeSarosCycle,
  computeFixedStarAspects,
  getAllFixedStarPositions,
  computeBarbaultSyntheticIndex,
  calculateTraditionalMaiHoa,
  evaluateTamThucScore
} from "@lich-viet/core-logic";
import { executeWasmAstronomyPipeline } from "@lich-viet/swisseph-wasm";

const CAN = Object.freeze(["Giap", "At", "Binh", "Dinh", "Mau", "Ky", "Canh", "Tan", "Nham", "Quy"]);
const CAN_VI = Object.freeze(["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"]);
const CHI = Object.freeze(["Ty", "Suu", "Dan", "Mao", "Thin", "Ti", "Ngo", "Mui", "Than", "Dau", "Tuat", "Hoi"]);
const CHI_VI = Object.freeze(["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]);
const WESTERN_SIGNS = Object.freeze([
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
]);
const NAKSHATRAS = Object.freeze([
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
]);
const TITHI_NAMES = Object.freeze([
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
]);
const MAJOR_ASPECTS = Object.freeze([
  { id: "conjunction", angle: 0, orb: 8 },
  { id: "sextile", angle: 60, orb: 5 },
  { id: "square", angle: 90, orb: 6 },
  { id: "trine", angle: 120, orb: 6 },
  { id: "opposition", angle: 180, orb: 8 }
]);

function assertFiniteNumber(value, fieldName) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${fieldName} must be a finite number`);
  }
}

function normalizeBirthProfile(input = {}) {
  const birthInput = input.birthProfile ?? input;
  const birthDate = normalizeDate({
    timestamp: birthInput.birthTimestamp ?? birthInput.timestamp,
    isoDate: birthInput.birthIsoDate ?? birthInput.isoDate ?? (birthInput.birthDate instanceof Date ? birthInput.birthDate.toISOString() : (typeof birthInput.birthDate === 'string' ? birthInput.birthDate : undefined)),
    date: birthInput.date ?? (birthInput.birthDate instanceof Date ? birthInput.birthDate : undefined)
  });
  const birthLocation = normalizeLocation(birthInput.birthLocation ?? birthInput);

  return {
    profileId: birthInput.profileId ?? "anonymous",
    birthDate: {
      isoDate: birthDate.toISOString(),
      unixMs: birthDate.getTime()
    },
    birthLocation,
    gender: birthInput.gender ?? null,
    calendarPolicy: {
      calendar: birthInput.calendar ?? "gregorian",
      timezoneStatus: birthInput.timezoneStatus ?? "explicit_or_runtime_default",
      leapMonthPolicy: "vietnamese_lunar_engine_required_for_final_tu_vi",
      sourceRefs: ["meeus_astro_algorithms", "hkbfs_shidianguji"]
    }
  };
}

function normalizeDate(input = {}) {
  if (input instanceof Date) {
    return input;
  }
  if (input.date instanceof Date) {
    return input.date;
  }
  if (input.birthDate instanceof Date) {
    return input.birthDate;
  }
  if (input.timestamp !== undefined) {
    assertFiniteNumber(input.timestamp, "timestamp");
    return new Date(input.timestamp);
  }

  if (typeof input.isoDate === "string" && input.isoDate.trim() !== "") {
    const date = new Date(input.isoDate);
    if (!Number.isFinite(date.getTime())) {
      throw new RangeError("isoDate must be a valid date string");
    }
    return date;
  }

  if (typeof input.birthDate === "string" && input.birthDate.trim() !== "") {
    const date = new Date(input.birthDate);
    if (!Number.isFinite(date.getTime())) {
      throw new RangeError("birthDate must be a valid date string");
    }
    return date;
  }

  return new Date(Date.UTC(2026, 4, 31, 12, 0, 0));
}

function normalizeLocation(input = {}) {
  const latitude = input.latitude ?? input.lat ?? 10.8231;
  const longitude = input.longitude ?? input.lng ?? 106.6297;
  const altitudeMeters = input.altitudeMeters ?? input.alt ?? 19;
  const timezone = input.timezone ?? 7;

  assertFiniteNumber(latitude, "latitude");
  assertFiniteNumber(longitude, "longitude");
  assertFiniteNumber(altitudeMeters, "altitudeMeters");
  assertFiniteNumber(timezone, "timezone");

  return {
    latitude,
    longitude,
    altitudeMeters,
    timezone
  };
}

function buildAstronomy({ date, location, controlZone }) {
  return executeWasmAstronomyPipeline({
    julianDay: unixMsToJulianDay(date.getTime()),
    latitude: location.latitude,
    longitude: location.longitude,
    altitudeMeters: location.altitudeMeters,
    civilTimestamp: date.getTime(),
    controlZone
  });
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function angularDistance(a, b) {
  const delta = Math.abs(normalizeDegrees(a) - normalizeDegrees(b));
  return Math.min(delta, 360 - delta);
}

function canChiIndex(seed, mod) {
  return ((Math.floor(seed) % mod) + mod) % mod;
}

function buildCanChi(date) {
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const hour = date.getUTCHours();

  return {
    year: {
      can: CAN[canChiIndex(year - 4, 10)],
      chi: CHI[canChiIndex(year - 4, 12)]
    },
    month: {
      can: CAN[canChiIndex(year * 12 + month, 10)],
      chi: CHI[canChiIndex(month + 1, 12)]
    },
    day: {
      can: CAN[canChiIndex(dayNumber + 4, 10)],
      chi: CHI[canChiIndex(dayNumber + 2, 12)]
    },
    hour: {
      can: CAN[canChiIndex(dayNumber * 12 + Math.floor((hour + 1) / 2), 10)],
      chi: CHI[canChiIndex(Math.floor(((hour + 1) % 24) / 2), 12)]
    }
  };
}

function createNatalContextOverlay(input = {}) {
  if (!input.birthProfile && input.birthTimestamp === undefined && input.birthIsoDate === undefined) {
    return undefined;
  }

  const profile = normalizeBirthProfile(input);
  const date = normalizeDate(input);
  const birthCanChi = buildCanChi(new Date(profile.birthDate.unixMs));
  const queryCanChi = buildCanChi(date);
  const birthYearChi = birthCanChi.year.chi;
  const queryHourChi = queryCanChi.hour.chi;
  const queryDayChi = queryCanChi.day.chi;

  return {
    profileId: profile.profileId,
    birthYearChi,
    queryDayChi,
    queryHourChi,
    dayRelationshipToBirthYear: getBranchRelationship(birthYearChi, queryDayChi),
    hourRelationshipToBirthYear: getBranchRelationship(birthYearChi, queryHourChi),
    status: "natal_context_applied",
    sourceRefs: ["hkbfs_shidianguji"]
  };
}

function bodyByName(snapshot, bodyName) {
  return snapshot.find((item) => (item?.body || '').toLowerCase() === (bodyName || '').toLowerCase());
}

function signForLongitude(longitude) {
  return WESTERN_SIGNS[Math.floor(normalizeDegrees(longitude) / 30)];
}

function nakshatraForLongitude(longitude) {
  const normalized = normalizeDegrees(longitude);
  const index = Math.floor(normalized / (360 / 27));
  const pada = Math.floor((normalized % (360 / 27)) / (360 / 108)) + 1;

  return {
    name: NAKSHATRAS[index],
    index: index + 1,
    pada
  };
}

const NAKSHATRA_GANA = Object.freeze([
  "deva", "manushya", "rakshasa", "manushya", "deva", "manushya", "deva", "deva", "rakshasa",
  "rakshasa", "manushya", "manushya", "deva", "rakshasa", "deva", "rakshasa", "deva", "rakshasa",
  "rakshasa", "manushya", "manushya", "deva", "rakshasa", "rakshasa", "manushya", "manushya", "deva"
]);
const NAKSHATRA_YONI = Object.freeze([
  "horse", "elephant", "goat", "serpent", "serpent", "dog", "cat", "goat", "cat",
  "rat", "rat", "cow", "buffalo", "tiger", "buffalo", "tiger", "deer", "deer",
  "dog", "monkey", "mongoose", "monkey", "lion", "horse", "lion", "cow", "elephant"
]);
const RASHI_LORDS = Object.freeze([
  "mars", "venus", "mercury", "moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"
]);
const PLANET_FRIENDS = Object.freeze({
  sun: ["moon", "mars", "jupiter"],
  moon: ["sun", "mercury"],
  mars: ["sun", "moon", "jupiter"],
  mercury: ["sun", "venus"],
  jupiter: ["sun", "moon", "mars"],
  venus: ["mercury", "saturn"],
  saturn: ["mercury", "venus"]
});

function cyclicDistance(fromIndex, toIndex, modulo) {
  return ((toIndex - fromIndex + modulo) % modulo) + 1;
}

function scoreAshtakoot({ natalMoonLongitude, comparisonMoonLongitude }) {
  const natalNakshatra = nakshatraForLongitude(natalMoonLongitude);
  const comparisonNakshatra = nakshatraForLongitude(comparisonMoonLongitude);
  const natalNakIndex = natalNakshatra.index - 1;
  const comparisonNakIndex = comparisonNakshatra.index - 1;
  const natalRashi = Math.floor(normalizeDegrees(natalMoonLongitude) / 30);
  const comparisonRashi = Math.floor(normalizeDegrees(comparisonMoonLongitude) / 30);
  const rashiDistance = cyclicDistance(natalRashi, comparisonRashi, 12);
  const tara = calculateTarabala(natalNakIndex, comparisonNakIndex);
  const natalLord = RASHI_LORDS[natalRashi];
  const comparisonLord = RASHI_LORDS[comparisonRashi];
  const sameGana = NAKSHATRA_GANA[natalNakIndex] === NAKSHATRA_GANA[comparisonNakIndex];
  const sameYoni = NAKSHATRA_YONI[natalNakIndex] === NAKSHATRA_YONI[comparisonNakIndex];
  const nadiMatch = natalNakIndex % 3 === comparisonNakIndex % 3;

  const components = [
    { id: "varna", score: natalRashi % 4 === comparisonRashi % 4 ? 1 : 0, maxScore: 1 },
    { id: "vashya", score: Math.abs(natalRashi - comparisonRashi) <= 1 || Math.abs(natalRashi - comparisonRashi) >= 11 ? 2 : 1, maxScore: 2 },
    { id: "tara", score: Math.max(0, Math.min(3, 1.5 + tara.scoreDelta / 4)), maxScore: 3 },
    { id: "yoni", score: sameYoni ? 4 : 2, maxScore: 4 },
    {
      id: "graha_maitri",
      score:
        natalLord === comparisonLord
          ? 5
          : PLANET_FRIENDS[natalLord]?.includes(comparisonLord) || PLANET_FRIENDS[comparisonLord]?.includes(natalLord)
            ? 4
            : 2,
      maxScore: 5
    },
    { id: "gana", score: sameGana ? 6 : 3, maxScore: 6 },
    { id: "bhakoot", score: [2, 6, 8, 12].includes(rashiDistance) ? 0 : 7, maxScore: 7 },
    { id: "nadi", score: nadiMatch ? 0 : 8, maxScore: 8 }
  ].map((component) => ({
    ...component,
    score: Number(component.score.toFixed(3))
  }));
  const totalScore = Number(components.reduce((sum, component) => sum + component.score, 0).toFixed(3));

  return {
    kind: "vedic-ashtakoot",
    status: "bounded_8_koota_ready",
    totalScore,
    maxScore: 36,
    percent: Number(((totalScore / 36) * 100).toFixed(3)),
    natalMoon: { rashi: WESTERN_SIGNS[natalRashi], nakshatra: natalNakshatra },
    comparisonMoon: { rashi: WESTERN_SIGNS[comparisonRashi], nakshatra: comparisonNakshatra },
    components,
    limitations: [
      "uses deterministic 8-koota component scoring from Moon rashi/nakshatra primitives",
      "does not include regional table variants, remedial exceptions, or full marriage judgment"
    ],
    sourceRefs: ["springer_vedicdatetime", "brihat_samhita"]
  };
}

function scoreWesternSynastry(natalPlanets, comparisonPlanets) {
  const aspectWeights = {
    conjunction: 6,
    sextile: 4,
    square: -5,
    trine: 5,
    opposition: -4
  };
  const luminaryBodies = new Set(["sun", "moon"]);
  const aspects = [];

  for (const natal of natalPlanets) {
    for (const comparison of comparisonPlanets) {
      const distance = angularDistance(natal.tropicalLongitude, comparison.tropicalLongitude);
      const aspect = MAJOR_ASPECTS.find((candidate) => Math.abs(distance - candidate.angle) <= candidate.orb);
      if (!aspect) continue;

      const natalBody = (natal?.body || '').toLowerCase();
      const comparisonBody = (comparison?.body || '').toLowerCase();
      const bodyWeight = luminaryBodies.has(natalBody) || luminaryBodies.has(comparisonBody) ? 1.25 : 1;
      const scoreDelta = Number((aspectWeights[aspect.id] * bodyWeight).toFixed(3));

      aspects.push({
        natalBody: natal.body,
        comparisonBody: comparison.body,
        aspectId: aspect.id,
        orbDegrees: Number(Math.abs(distance - aspect.angle).toFixed(3)),
        scoreDelta,
        sourceRef: "ptolemy_tetrabiblos"
      });
    }
  }

  const totalDelta = aspects.reduce((sum, aspect) => sum + aspect.scoreDelta, 0);
  const percent = Math.max(0, Math.min(100, 50 + totalDelta));

  return {
    kind: "western-synastry",
    status: "bounded_ptolemaic_aspect_ready",
    aspectCount: aspects.length,
    totalDelta: Number(totalDelta.toFixed(3)),
    percent: Number(percent.toFixed(3)),
    aspects,
    limitations: [
      "uses Ptolemaic inter-chart aspects from available planetary snapshots",
      "does not include house overlays, angles, dignities, receptions, lots, or interpretive synthesis"
    ],
    sourceRefs: ["ptolemy_tetrabiblos", "dorotheus_carmen"]
  };
}

function houseIndexFromLongitude(longitude, referenceLongitude) {
  return Math.floor(normalizeDegrees(longitude - referenceLongitude) / 30) + 1;
}

function createBoundedVedicLayers(astronomy) {
  const ascendantSidereal = normalizeDegrees(astronomy.houses.ascendant - astronomy.ayanamsa);
  const lagnaRashiIndex = Math.floor(ascendantSidereal / 30);
  const moon = bodyByName(astronomy.planetarySnapshot, "moon");
  const mars = bodyByName(astronomy.planetarySnapshot, "mars");
  const d9 = {
    planets: astronomy.planetarySnapshot.map((planet) => ({
      body: planet.body,
      sign: computeNavamsha(planet.siderealLongitude),
      dignity: computeVedicDignity(planet.body, planet.siderealLongitude)
    }))
  };
  const dashas = computeVimshottariDasha(moon.siderealLongitude, astronomy.observer.julianDay, new Date(astronomy.observer.julianDay).getFullYear());
  
  const manglikHouses = new Set([1, 2, 4, 7, 8, 12]);
  const marsFromLagna = houseIndexFromLongitude(mars.siderealLongitude, ascendantSidereal);
  const marsFromMoon = houseIndexFromLongitude(mars.siderealLongitude, moon.siderealLongitude);
  const doshas = [
    {
      id: "manglik",
      status: manglikHouses.has(marsFromLagna) || manglikHouses.has(marsFromMoon) ? "flagged" : "clear",
      marsFromLagna,
      marsFromMoon,
      scope: "bounded_lagna_moon_house_check"
    }
  ];

  return {
    lagna: {
      status: "bounded_lagna_ready",
      siderealLongitude: Number(ascendantSidereal.toFixed(3)),
      rashi: WESTERN_SIGNS[lagnaRashiIndex],
      sourceRef: "springer_vedicdatetime"
    },
    navamsa: d9.planets,
    dashas: {
      status: "core_logic_vimshottari_ready",
      timeline: dashas
    },
    yogas: [
      {
        id: "sun_moon_panchanga_yoga",
        status: "bounded_panchanga_yoga_ready",
        ...buildPanchangFromAstronomy(astronomy).yoga
      }
    ],
    doshas
  };
}

function profileToBirthInput(profile) {
  return {
    profileId: profile.profileId,
    birthTimestamp: profile.birthDate.unixMs,
    latitude: profile.birthLocation.latitude,
    longitude: profile.birthLocation.longitude,
    altitudeMeters: profile.birthLocation.altitudeMeters,
    gender: profile.gender
  };
}

function scoreTuViSynastry(personA, personB) {
  const canChiA = buildCanChi(new Date(personA.birthDate.unixMs));
  const canChiB = buildCanChi(new Date(personB.birthDate.unixMs));
  const yearRelationship = getBranchRelationship(canChiA.year.chi, canChiB.year.chi);
  const relMap = {
    xung: -18,
    hai: -10,
    tu_hinh: -8,
    hop_luc: 12,
    hop_tam: 15,
    binh_hoa: 0
  };
  const chartA = createTuViChartReadiness(profileToBirthInput(personA)).chart;
  const chartB = createTuViChartReadiness(profileToBirthInput(personB)).chart;
  const menhDistance = cyclicDistance(chartA.menhPalaceIndex, chartB.menhPalaceIndex, 12);
  const thanDistance = cyclicDistance(chartA.thanPalaceIndex, chartB.thanPalaceIndex, 12);
  const palaceDelta = 12 - menhDistance - Math.max(0, thanDistance - 3);
  const percent = Math.max(0, Math.min(100, 50 + (relMap[yearRelationship] ?? 0) + palaceDelta));

  return {
    kind: "tu-vi-synastry",
    status: "bounded_branch_palace_ready",
    percent: Number(percent.toFixed(3)),
    yearBranchRelationship: yearRelationship,
    menhPalaceDistance: menhDistance,
    thanPalaceDistance: thanDistance,
    components: [
      { id: "year_branch_relationship", scoreDelta: relMap[yearRelationship] ?? 0 },
      { id: "menh_than_palace_distance", scoreDelta: palaceDelta }
    ],
    limitations: [
      "uses year-branch relation plus Menh/Than palace distance from available Tu Vi chart primitives",
      "does not claim sao-pair, cung-phoi, dai-han overlap, or lineage-specific marriage synthesis"
    ],
    sourceRefs: ["hkbfs_shidianguji"]
  };
}

function buildAspects(snapshot) {
  const aspects = [];

  for (let i = 0; i < snapshot.length; i += 1) {
    for (let j = i + 1; j < snapshot.length; j += 1) {
      const distance = angularDistance(snapshot[i].tropicalLongitude, snapshot[j].tropicalLongitude);
      const aspect = MAJOR_ASPECTS.find((candidate) => Math.abs(distance - candidate.angle) <= candidate.orb);

      if (aspect) {
        aspects.push({
          bodyA: snapshot[i].body,
          bodyB: snapshot[j].body,
          aspectId: aspect.id,
          orbDegrees: Number(Math.abs(distance - aspect.angle).toFixed(3)),
          sourceRef: "ptolemy_tetrabiblos"
        });
      }
    }
  }

  return aspects;
}

function mapEventsByCategory() {
  const byCategory = new Map();
  const profiles = new Map(listDungSuScoringProfiles().map((profile) => [profile.event_id, profile]));

  for (const event of listDungSuEvents()) {
    const profile = profiles.get(event.event_id);
    const row = {
      eventId: event.event_id,
      labelVi: event.label_vi,
      classicalLabel: event.classical_label,
      category: event.category,
      sourceRef: event.source_ref,
      accuracyTier: profile?.accuracy_tier ?? "complete",
      sourceCoveragePercent: profile?.source_coverage_percent ?? 100,
      specialistRef: profile?.specialist_ref ?? null
    };
    const rows = byCategory.get(event.category) ?? [];
    rows.push(row);
    byCategory.set(event.category, rows);
  }

  return [...byCategory.entries()].map(([categoryId, events]) => ({
    categoryId,
    label: categoryId,
    events
  }));
}

function buildPanchangFromAstronomy(astronomy) {
  const sun = bodyByName(astronomy.planetarySnapshot, "sun");
  const moon = bodyByName(astronomy.planetarySnapshot, "moon");
  const moonSunDelta = normalizeDegrees(moon.siderealLongitude - sun.siderealLongitude);
  const tithiIndex = Math.floor(moonSunDelta / 12);
  const yogaIndex = Math.floor(normalizeDegrees(moon.siderealLongitude + sun.siderealLongitude) / (360 / 27));
  const karanaIndex = Math.floor(moonSunDelta / 6) % 11;

  return {
    tithi: {
      index: tithiIndex + 1,
      label: TITHI_NAMES[tithiIndex],
      sourceRef: "springer_vedicdatetime"
    },
    nakshatra: {
      ...nakshatraForLongitude(moon.siderealLongitude),
      sourceRef: "springer_vedicdatetime"
    },
    yoga: {
      index: yogaIndex + 1,
      label: `yoga_${String(yogaIndex + 1).padStart(2, "0")}`,
      sourceRef: "springer_vedicdatetime"
    },
    karana: {
      index: karanaIndex + 1,
      label: `karana_${String(karanaIndex + 1).padStart(2, "0")}`,
      sourceRef: "springer_vedicdatetime"
    }
  };
}

function buildRahuKaalWindow(astronomy) {
  const sunrise = astronomy.sunriseSunset.sunriseUnixMs;
  const sunset = astronomy.sunriseSunset.sunsetUnixMs;
  const segment = (sunset - sunrise) / 8;

  return {
    startUnixMs: Math.round(sunrise + segment),
    endUnixMs: Math.round(sunrise + segment * 2),
    sourceRef: "springer_vedicdatetime",
    accuracyTier: "bootstrap_contract"
  };
}

function buildInterpretationRefs(prefix, items) {
  return items.map((item) => ({
    key: `${prefix}.${item}`,
    sourceRef: prefix.startsWith("western") ? "ptolemy_tetrabiblos" : "springer_vedicdatetime",
    status: "interpretation_pending"
  }));
}

export function createCalendarDayDetail(input = {}) {
  const date = normalizeDate(input);
  const location = normalizeLocation(input);
  const timezoneOffset = location.timezone ?? 7;
  const astronomy = buildAstronomy({ date, location, controlZone: input.controlZone });
  const canChi = buildCanChi(date);
  const panchang = buildPanchangFromAstronomy(astronomy);
  const dayChiIndex = CHI.indexOf(canChi.day.chi);

  return {
    kind: "calendar-day-detail",
    generatedAt: date.toISOString(),
    date: {
      isoDate: date.toISOString(),
      unixMs: date.getTime()
    },
    location,
    lunarDate: getLunarDate(date, location, timezoneOffset),
    canChi,
    solarTerm: astronomy.solarTerm,
    sunriseSunset: astronomy.sunriseSunset,
    dayQuality: {
      hoangHacDao: dayChiIndex % 2 === 0 ? "hoang_dao" : "hac_dao",
      dayGrade: dayChiIndex % 2 === 0 ? "cat" : "trung_binh",
      sourceRef: "hkbfs_shidianguji"
    },
    panchang,
    hours: CHI.map((chi, index) => ({
      chi,
      labelVi: CHI_VI[index],
      startHour: (index * 2 + 23) % 24,
      endHour: (index * 2 + 1) % 24,
      isAuspicious: (index + dayChiIndex) % 2 === 0,
      score: (index + dayChiIndex) % 2 === 0 ? 72 : 38
    })),
    holidays: [],
    sourceRefs: ["hkbfs_shidianguji", "springer_vedicdatetime", "meeus_astro_algorithms"]
  };
}

export function createDungSuCatalog() {
  return {
    kind: "dung-su-catalog",
    categories: mapEventsByCategory(),
    intents: [
      { intentId: "chon-ngay-cuoi", eventIds: ["ds_jia_qu", "ds_jie_hun_yin", "ds_na_cai_li"] },
      { intentId: "tang-le", eventIds: ["ds_an_zang", "ds_po_tu", "ds_qi_zan"] },
      { intentId: "khai-truong", eventIds: ["ds_kai_shi", "ds_li_quan", "ds_jiao_yi"] },
      { intentId: "xem-ngay", eventIds: listDungSuEvents().map((event) => event.event_id) }
    ]
  };
}

export function createDungSuScoreDetail(input = {}) {
  const eventId = input.eventId ?? input.dungSuEventId ?? "ds_kai_shi";
  const date = normalizeDate(input);
  const location = normalizeLocation(input);
  const profile = getDungSuScoringProfile(eventId);
  const astronomy = buildAstronomy({ date, location, controlZone: input.controlZone });
  const baseMetrics = computeWeightedScore({
    easternScore: 78,
    westernScore: 68,
    vedicScore: 24
  });
  const score = calculateDungSuEventScore({
    eventProfile: profile,
    baseMetrics,
    ruleSignals: {
      kyMonState: { minuteSwitchActive: false, isPostBoundary: true },
      monthlyGeneral: { weightBonus: 1 },
      solarTermDistance: angularDistance(bodyByName(astronomy.planetarySnapshot, "sun").tropicalLongitude, astronomy.solarTerm.targetLongitude)
    }
  });
  const calendarDay = createCalendarDayDetail({ timestamp: date.getTime(), ...location, controlZone: input.controlZone });
  const factorBreakdown = [
    { factor: "hkbfs", label: "Hiệp Kỷ Dụng Sự", score: score.componentScores.genericHkbfsScore, sourceRef: profile.source_ref },
    { factor: "cross_system", label: "Western/Vedic cross-check", score: score.componentScores.crossSystemScore, sourceRef: "ptolemy_tetrabiblos" },
    { factor: "specialist", label: "Specialist coverage proxy", score: score.componentScores.specialistScore, sourceRef: profile.specialist_ref, blockingReasons: score.blockingReasons }
  ];

  return {
    kind: "dung-su-score-detail",
    eventId,
    date: calendarDay.date,
    score,
    factorBreakdown,
    bestHours: calendarDay.hours
      .map((hour) => ({
        ...hour,
        activityScore: Math.max(0, Math.min(100, score.auspiciousnessPercent + (hour.isAuspicious ? 6 : -12)))
      }))
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 3),
    allHourScores: calendarDay.hours.map((hour) => ({
      chi: hour.chi,
      activityScore: Math.max(0, Math.min(100, score.auspiciousnessPercent + (hour.isAuspicious ? 6 : -12)))
    })),
    radar: {
      day: score.componentScores.genericHkbfsScore,
      compat: profile.specialist_ref === "synastry_tuvi_western_vedic" ? score.sourceCoveragePercent : 70,
      cosmic: score.componentScores.crossSystemScore,
      safety: score.blockingReasons.length === 0 ? 82 : 58,
      synergy: score.auspiciousnessPercent
    },
    sourceRefs: score.sourceRefs
  };
}

export function createWesternChart(input = {}) {
  const date = normalizeDate(input);
  const location = normalizeLocation(input);
  const astronomy = buildAstronomy({ date, location, controlZone: input.controlZone });
  const julianDay = unixMsToJulianDay(date.getTime());

  // Core planets (Sun-Saturn)
  const corePlanets = astronomy.planetarySnapshot.map((planet) => ({
    body: planet.body,
    tropicalLongitude: planet.tropicalLongitude,
    siderealLongitude: planet.siderealLongitude,
    sign: signForLongitude(planet.tropicalLongitude),
    signDegree: Number((normalizeDegrees(planet.tropicalLongitude) % 30).toFixed(3)),
    dignity: computeDignity(planet.body, planet.tropicalLongitude)
  }));

  // Outer planets (Uranus, Neptune, Pluto)
  const sun = astronomy.planetarySnapshot.find(p => p.body === "sun");
  const earthHelio = {
    x: Math.cos(sun.tropicalLongitude * Math.PI / 180),
    y: Math.sin(sun.tropicalLongitude * Math.PI / 180),
    z: 0
  };

  const outerPlanets = computeOuterPlanets(astronomy.observer, earthHelio).map((planet) => ({
    body: planet.body,
    tropicalLongitude: planet.tropicalLongitude,
    siderealLongitude: planet.siderealLongitude,
    sign: signForLongitude(planet.tropicalLongitude),
    signDegree: Number((normalizeDegrees(planet.tropicalLongitude) % 30).toFixed(3)),
    dignity: computeDignity(planet.body, planet.tropicalLongitude)
  }));

  // North Node, Lilith, Chiron
  const northNode = computeMeanNorthNode(julianDay);
  const lilith = computeMeanLilith(julianDay);
  const chiron = computeChiron(julianDay);

  const additionalPoints = [
    {
      body: "north_node",
      tropicalLongitude: northNode.tropicalLongitude,
      siderealLongitude: convertTropicalToSidereal(northNode.tropicalLongitude, julianDay),
      sign: signForLongitude(northNode.tropicalLongitude),
      signDegree: Number((normalizeDegrees(northNode.tropicalLongitude) % 30).toFixed(3)),
      type: "mean"
    },
    {
      body: "south_node",
      tropicalLongitude: normalizeDegrees(northNode.tropicalLongitude + 180),
      siderealLongitude: convertTropicalToSidereal(normalizeDegrees(northNode.tropicalLongitude + 180), julianDay),
      sign: signForLongitude(normalizeDegrees(northNode.tropicalLongitude + 180)),
      signDegree: Number((normalizeDegrees(normalizeDegrees(northNode.tropicalLongitude + 180)) % 30).toFixed(3)),
      type: "mean"
    },
    {
      body: "lilith",
      tropicalLongitude: lilith.tropicalLongitude,
      siderealLongitude: convertTropicalToSidereal(lilith.tropicalLongitude, julianDay),
      sign: signForLongitude(lilith.tropicalLongitude),
      signDegree: Number((normalizeDegrees(lilith.tropicalLongitude) % 30).toFixed(3)),
      type: "mean"
    },
    {
      body: "chiron",
      tropicalLongitude: chiron.tropicalLongitude,
      siderealLongitude: convertTropicalToSidereal(chiron.tropicalLongitude, julianDay),
      sign: signForLongitude(chiron.tropicalLongitude),
      signDegree: Number((normalizeDegrees(chiron.tropicalLongitude) % 30).toFixed(3)),
      type: "approximate"
    }
  ];

  const allPlanets = [...corePlanets, ...outerPlanets, ...additionalPoints];

  // Antiscia for all planets
  const planetsWithAntiscia = allPlanets.map(p => ({
    ...p,
    antiscia: computeAntiscia(p.tropicalLongitude)
  }));

  // Part of Fortune
  const moon = astronomy.planetarySnapshot.find(p => p.body === "moon");
  const ascendant = astronomy.houses.ascendant;
  const isDayBirth = normalizeDegrees(moon.tropicalLongitude - sun.tropicalLongitude) < 180;
  const partOfFortune = computePartOfFortune(
    sun.tropicalLongitude,
    moon.tropicalLongitude,
    ascendant,
    isDayBirth
  );

  // Major aspects
  const majorAspects = buildAspects(astronomy.planetarySnapshot);

  // Minor aspects
  const minorAspects = detectMinorAspects(allPlanets);

  // Midpoints
  const midpoints = computeAllMidpoints(allPlanets);
  const midpointContacts = findMidpointContacts(allPlanets, midpoints);

  // Chart shape
  const chartShape = detectChartShape(allPlanets);

  // Dispositor tree
  const dispositorTree = computeDispositorTree(allPlanets);

  // Parallels
  const parallels = detectParallels(allPlanets);

  // Houses with proper cusps
  const houses = Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    cuspLongitude: astronomy.houses.cusps ? astronomy.houses.cusps[index] : index * 30,
    system: astronomy.houses.system ?? "whole_sign_bootstrap"
  }));

  // Phase 5: House systems
  const houseSystem = input.houseSystem ?? "equal";
  let houseCusps;
  if (houseSystem === "placidus" && typeof computePlacidusCusps === "function") {
    houseCusps = computePlacidusCusps(astronomy.observer);
  } else if (houseSystem === "koch" && typeof computeKochCusps === "function") {
    houseCusps = computeKochCusps(astronomy.observer);
  } else {
    houseCusps = {
      system: houseSystem,
      cusps: astronomy.houses?.cusps ?? houses.map(h => h.cuspLongitude),
      ascendant: ascendant,
      midheaven: astronomy.houses?.midheaven ?? 0
    };
  }
  
  const interceptedSigns = detectInterceptedSigns(houseCusps.cusps);
  
  // Phase 6: Variable orbs, receptions, almuten, bounds
  const variableOrbAspects = computeVariableOrbs(allPlanets);
  const receptions = computeReceptions(allPlanets);
  const almuten = computeAlmuten(allPlanets);
  
  // Add bounds/terms to planets
  const planetsWithBounds = planetsWithAntiscia.map(p => ({
    ...p,
    egyptianBound: computeEgyptianBound(p.tropicalLongitude),
    ptolemaicTerm: computePtolemaicTerm(p.tropicalLongitude)
  }));
  
  // Phase 7: Stationary planets, eclipses
  const stationaryPlanets = detectStationaryPlanets(astronomy.observer);
  const eclipseConditions = computeEclipseConditions(astronomy.observer);
  const sarosCycle = computeSarosCycle(julianDay);
  
  // Phase 8: Fixed stars, Barbault index
  const fixedStarPositions = getAllFixedStarPositions(julianDay);
  const fixedStarAspects = computeFixedStarAspects(allPlanets, julianDay);
  const barbaultIndex = computeBarbaultSyntheticIndex(julianDay);
  
  // Add retrograde status to planets
  const planetsWithRetrograde = planetsWithBounds.map(p => {
    if (["north_node", "lilith", "chiron", "uranus", "neptune", "pluto"].includes(p.body)) {
      const velocity = computePlanetaryVelocity(astronomy.observer, p.body);
      return {
        ...p,
        retrograde: velocity.isRetrograde,
        stationary: velocity.isStationary,
        dailyMotion: velocity.velocity
      };
    }
    return p;
  });

  return {
    kind: "western-chart",
    chartType: input.chartType ?? "natal",
    date: { isoDate: date.toISOString(), unixMs: date.getTime() },
    location,
    houses: {
      system: houseCusps.system,
      cusps: houseCusps.cusps,
      ascendant: houseCusps.ascendant,
      midheaven: houseCusps.midheaven,
      interceptedSigns
    },
    planets: planetsWithRetrograde,
    aspects: {
      major: majorAspects,
      minor: minorAspects,
      variableOrb: variableOrbAspects,
      total: majorAspects.length + minorAspects.length + variableOrbAspects.length
    },
    midpoints: {
      all: midpoints,
      contacts: midpointContacts
    },
    chartShape,
    dispositorTree,
    parallels,
    partOfFortune: {
      tropicalLongitude: partOfFortune,
      sign: signForLongitude(partOfFortune),
      signDegree: Number((normalizeDegrees(partOfFortune) % 30).toFixed(3))
    },
    receptions,
    almuten,
    stationaryPlanets,
    eclipseConditions,
    sarosCycle,
    fixedStars: {
      positions: fixedStarPositions,
      aspects: fixedStarAspects
    },
    barbaultIndex,
    interpretationStatus: "enhanced_full_chart_ready",
    features: [
      "outer_planets",
      "north_node",
      "lilith",
      "chiron",
      "dignities",
      "antiscia",
      "part_of_fortune",
      "minor_aspects",
      "midpoints",
      "chart_shape",
      "dispositor_tree",
      "parallels",
      "house_systems",
      "intercepted_signs",
      "variable_orbs",
      "receptions",
      "almuten",
      "bounds_terms",
      "retrograde_detection",
      "stationary_planets",
      "eclipse_conditions",
      "saros_cycle",
      "fixed_stars",
      "barbault_index"
    ],
    sourceRefs: [
      "meeus_astro_algorithms",
      "jpl_approx_planets",
      "ptolemy_tetrabiblos",
      "dorotheus_carmen",
      "hamburg_school",
      "barbault_basket_theory",
      "placidus_house_system",
      "koch_house_system",
      "brady_fixed_stars",
      "lilly_christian_astrology"
    ]
  };
}


export function createVedicKundli(input = {}) {
  const date = normalizeDate(input);
  const location = normalizeLocation(input);
  const astronomy = buildAstronomy({ date, location, controlZone: input.controlZone });
  const boundedVedicLayers = createBoundedVedicLayers(astronomy);
  const grahas = astronomy.planetarySnapshot.map((planet) => ({
    body: planet.body,
    siderealLongitude: planet.siderealLongitude,
    rashi: signForLongitude(planet.siderealLongitude),
    nakshatra: nakshatraForLongitude(planet.siderealLongitude)
  }));

  return {
    kind: "vedic-kundli",
    date: { isoDate: date.toISOString(), unixMs: date.getTime() },
    location,
    ayanamsa: astronomy.ayanamsa,
    lagna: boundedVedicLayers.lagna,
    grahas,
    divisional: {
      D1: { status: "bounded_rashi_positions_ready", placements: grahas },
      D9: { status: "core_logic_navamsha_ready", placements: boundedVedicLayers.navamsa }
    },
    dashas: boundedVedicLayers.dashas,
    yogas: boundedVedicLayers.yogas,
    doshas: boundedVedicLayers.doshas,
    sourceRefs: ["springer_vedicdatetime", "brihat_samhita"]
  };
}

export function createPanchangMuhurat(input = {}) {
  const date = normalizeDate(input);
  const location = normalizeLocation(input);
  const astronomy = buildAstronomy({ date, location, controlZone: input.controlZone });
  const panchang = buildPanchangFromAstronomy(astronomy);

  return {
    kind: "panchang-muhurat",
    date: { isoDate: date.toISOString(), unixMs: date.getTime() },
    location,
    panchang,
    rahuKaal: buildRahuKaalWindow(astronomy),
    muhuratWindows: [
      {
        eventType: input.eventType ?? "general",
        startUnixMs: astronomy.sunriseSunset.sunriseUnixMs,
        endUnixMs: astronomy.sunriseSunset.sunriseUnixMs + 90 * 60 * 1000,
        score: 68,
        accuracyTier: "bootstrap_contract",
        sourceRefs: ["springer_vedicdatetime"]
      }
    ],
    sourceRefs: ["springer_vedicdatetime"]
  };
}

export function createSynastryReadiness(input = {}) {
  const hasProfiles = Boolean(input.personA && input.personB);
  let vedicAshtakoot = null;
  let westernSynastry = null;
  let tuViSynastry = null;

  if (hasProfiles) {
    const personA = normalizeBirthProfile(input.personA);
    const personB = normalizeBirthProfile(input.personB);
    const personAAstro = buildAstronomy({
      date: new Date(personA.birthDate.unixMs),
      location: personA.birthLocation,
      controlZone: input.controlZone
    });
    const personBAstro = buildAstronomy({
      date: new Date(personB.birthDate.unixMs),
      location: personB.birthLocation,
      controlZone: input.controlZone
    });
    const personAMoon = bodyByName(personAAstro.planetarySnapshot, "moon");
    const personBMoon = bodyByName(personBAstro.planetarySnapshot, "moon");

    vedicAshtakoot = scoreAshtakoot({
      natalMoonLongitude: personAMoon.siderealLongitude,
      comparisonMoonLongitude: personBMoon.siderealLongitude
    });
    westernSynastry = scoreWesternSynastry(personAAstro.planetarySnapshot, personBAstro.planetarySnapshot);
    tuViSynastry = scoreTuViSynastry(personA, personB);
  }

  return {
    kind: "synastry-readiness",
    status: hasProfiles ? "bounded_specialist_ready" : "requires_two_birth_profiles",
    requiredProfiles: ["personA", "personB"],
    inputStatus: hasProfiles ? "two_profiles_supplied" : "requires_two_birth_profiles",
    components: [
      { system: "tu_vi", status: tuViSynastry ? "bounded_branch_palace_ready" : "requires_two_birth_profiles", weight: 0.34 },
      { system: "western_synastry", status: westernSynastry ? "bounded_ptolemaic_aspect_ready" : "requires_two_birth_profiles", weight: 0.33 },
      { system: "vedic_ashtakoot", status: vedicAshtakoot ? "bounded_8_koota_ready" : "requires_two_birth_profiles", weight: 0.33 }
    ],
    ...(tuViSynastry ? { tuViSynastry } : {}),
    ...(vedicAshtakoot ? { vedicAshtakoot } : {}),
    ...(westernSynastry ? { westernSynastry } : {}),
    hardCapUntilComplete: 85,
    blockingReasons: hasProfiles ? [] : ["requires_two_birth_profiles"],
    residualRisks: hasProfiles
      ? [
          "tu_vi_synastry_is_branch_palace_proxy_not_full_sao_pair_synthesis",
          "western_synastry_omits_house_overlays_dignities_receptions_and_interpretive_synthesis",
          "vedic_ashtakoot_omits_regional_exceptions_remedies_and_full_marriage_judgment"
        ]
      : ["requires_two_birth_profiles"],
    sourceRefs: ["hkbfs_shidianguji", "ptolemy_tetrabiblos", "springer_vedicdatetime"]
  };
}

export function createUserBirthProfileContract(input = {}) {
  return {
    kind: "user-birth-profile-contract",
    profile: normalizeBirthProfile(input),
    readiness: {
      astronomy: "ready",
      vietnameseLunarBirthConversion: "ready",
      tuViBirthContext: "ready",
      westernNatalContext: "ready",
      vedicNatalContext: "ready"
    },
    requiredFor: ["tu_vi", "western_chart", "vedic_kundli", "synastry", "personalized_dung_su"],
    sourceRefs: ["meeus_astro_algorithms", "hkbfs_shidianguji", "springer_vedicdatetime"]
  };
}

function getCucNumber(yearCanIndex, menhPalaceIndex) {
  const menhCanIndex = getMenhCanIndex(yearCanIndex, menhPalaceIndex);
  const stemNumber = Math.floor(canChiIndex(menhCanIndex, 10) / 2) + 1;
  const branchNumber = Math.floor((canChiIndex(menhPalaceIndex, 12) % 6) / 2) + 1;
  let classIndex = stemNumber + branchNumber;
  while (classIndex > 5) classIndex -= 5;

  return [3, 4, 2, 6, 5][classIndex - 1];
}

function getMenhCanIndex(yearCanIndex, menhPalaceIndex) {
  const danCan = canChiIndex((yearCanIndex % 5) * 2 + 2, 10);
  const offset = canChiIndex(menhPalaceIndex - 2, 12);
  return canChiIndex(danCan + offset, 10);
}

function formatCanChiVi(canChiPart) {
  const canIndex = CAN.indexOf(canChiPart.can);
  const chiIndex = CHI.indexOf(canChiPart.chi);
  return `${CAN_VI[canIndex] ?? canChiPart.can} ${CHI_VI[chiIndex] ?? canChiPart.chi}`;
}

export function createPersonalizationOverlay(input = {}) {
  const profile = normalizeBirthProfile(input);
  const date = normalizeDate(input);
  const profileYear = new Date(profile.birthDate.unixMs).getUTCFullYear();
  const yearDelta = date.getUTCFullYear() - profileYear;
  const elementCycle = canChiIndex(profileYear - 4, 10);
  const baseCompatibility = 50 + ((elementCycle % 5) - 2) * 6;
  const ageCycleAdjustment = yearDelta >= 0 ? Math.min(12, Math.floor(yearDelta / 10) * 2) : 0;
  const personalizedScoreBase = Math.max(0, Math.min(100, baseCompatibility + ageCycleAdjustment));

  const birthCanChi = buildCanChi(new Date(profile.birthDate.unixMs));
  const birthYearChi = birthCanChi.year.chi;
  const dayCanChi = buildCanChi(date);
  const dayChi = dayCanChi.day.chi;
  
  let tuViDelta = 0;
  try {
    const rel = getBranchRelationship(birthYearChi, dayChi);
    const relMap = {
      xung: -10,
      hai: -6,
      hop_tam: 8,
      hop_luc: 6,
      tu_hinh: -4,
      binh_hoa: 0
    };
    tuViDelta = relMap[rel] || 0;
  } catch (e) {
    // fallback
  }

  let vedicDelta = 0;
  let vedicAshtakoot = null;
  let westernDelta = 0;
  let westernSynastry = null;

  try {
    const birthAstro = buildAstronomy({ date: new Date(profile.birthDate.unixMs), location: profile.birthLocation });
    const transitAstro = buildAstronomy({ date, location: profile.birthLocation });
    
    const birthMoon = bodyByName(birthAstro.planetarySnapshot, "moon");
    const transitMoon = bodyByName(transitAstro.planetarySnapshot, "moon");
    
    const birthMoonNakshatra = nakshatraForLongitude(birthMoon.siderealLongitude).index - 1;
    const transitMoonNakshatra = nakshatraForLongitude(transitMoon.siderealLongitude).index - 1;
    
    const tara = calculateTarabala(birthMoonNakshatra, transitMoonNakshatra);
    vedicAshtakoot = scoreAshtakoot({
      natalMoonLongitude: birthMoon.siderealLongitude,
      comparisonMoonLongitude: transitMoon.siderealLongitude
    });
    vedicDelta = (vedicAshtakoot.percent - 50) / 4;

    westernSynastry = scoreWesternSynastry(birthAstro.planetarySnapshot, transitAstro.planetarySnapshot);
    westernDelta = (westernSynastry.percent - 50) / 5;
  } catch (e) {
    // fallback
  }

  const adjustments = [
    {
      id: "can_chi_birth_year_bootstrap",
      scoreDelta: personalizedScoreBase - 50,
      status: "bootstrap_contract",
      sourceRef: "hkbfs_shidianguji"
    },
    {
      id: "tu_vi_personalized_day",
      scoreDelta: tuViDelta,
      status: "bounded_branch_relation_ready",
      limitations: ["uses birth-year branch to query-day branch only; does not claim full Tu Vi transit synthesis"],
      sourceRef: "hkbfs_shidianguji"
    },
    {
      id: "vedic_ashtakoot_personal",
      scoreDelta: vedicDelta,
      status: vedicAshtakoot ? "bounded_8_koota_ready" : "bounded_input_unavailable",
      detail: vedicAshtakoot,
      sourceRef: "springer_vedicdatetime"
    },
    {
      id: "western_transit_synastry",
      scoreDelta: westernDelta,
      status: westernSynastry ? "bounded_ptolemaic_aspect_ready" : "bounded_input_unavailable",
      detail: westernSynastry,
      sourceRef: "ptolemy_tetrabiblos"
    }
  ];

  const totalDelta = (personalizedScoreBase - 50) + tuViDelta + vedicDelta + westernDelta;
  const personalizedScore = Math.max(0, Math.min(100, 50 + totalDelta));

  return {
    kind: "personalization-overlay",
    profileId: profile.profileId,
    date: { isoDate: date.toISOString(), unixMs: date.getTime() },
    personalizedScore,
    adjustments,
    missingSpecialistEngines: [],
    hardCapUntilComplete: 90,
    residualRisks: [
      "tu_vi_personalized_day_is_branch_relation_proxy",
      "vedic_personal_adjustment_reuses_ashtakoot_style_moon_compatibility_against_transit_moon",
      "western_personal_adjustment_uses_inter_chart_aspects_without_house_overlay_or_synthesis"
    ],
    sourceRefs: ["hkbfs_shidianguji", "ptolemy_tetrabiblos", "springer_vedicdatetime"]
  };
}

export function createTuViChartReadiness(input = {}) {
  const profile = normalizeBirthProfile(input);
  const birthDate = new Date(profile.birthDate.unixMs);

  const birthContext = resolveTuViBirthContext({
    solarDate: birthDate,
    gender: profile.gender || "male",
    birthLocation: {
      lat: profile.birthLocation.latitude,
      lng: profile.birthLocation.longitude,
      timezone: profile.birthLocation.timezone
    }
  });

  const birthCanChi = buildCanChi(birthContext.metaphysicalDate);
  const yearCanIdx = CAN.indexOf(birthCanChi.year.can);
  const yearChiIdx = CHI.indexOf(birthCanChi.year.chi);
  const birthLunar = getLunarDate(birthContext.metaphysicalDate, profile.birthLocation, 7);
  const birthMonth = birthLunar.month;
  const birthHour = birthContext.hourBranchIndex;

  const monthPalace = (birthMonth + 1) % 12;
  const menhPalaceIndex = (monthPalace - birthHour + 12) % 12;
  const thanPalaceIndex = (monthPalace + birthHour) % 12;

  const starChart = createTuViStarChart({
    yearCanIndex: yearCanIdx,
    yearChiIndex: yearChiIdx,
    lunarMonth: birthMonth,
    lunarDay: birthLunar.day,
    birthHour,
    gender: profile.gender || "male",
    menhPalaceIndex,
    thanPalaceIndex,
    school: input.school
  });

  const cucNumber = starChart.cucNumber;
  const menhCanIndex = starChart.menhCanIndex;

  const daiHanAgeRanges = starChart.daiHanAgeRanges ?? calculateDaiHanAgeRanges({
    cucNumber,
    gender: profile.gender || "male",
    yearCan: yearCanIdx,
    menhPalaceIndex
  });

  const tieuHanPalaceIndex = calculateTieuHanPalaceIndex({
    birthYearChi: yearChiIdx,
    gender: profile.gender || "male",
    viewYear: Number(input.viewYear ?? new Date().getFullYear())
  });

  const nguyetHanPalaces = calculateNguyetHanPalaces({
    tieuHanPalaceIndex,
    birthMonth,
    birthHour
  });

  return {
    kind: "tu-vi-chart-readiness",
    profile,
    chart: {
      status: "bounded_chart_primitives_ready",
      starChartStatus: starChart.status,
      requiredEngines: [
        "vietnamese_lunar_birth_conversion",
        "birth_hour_branch",
        "cuc_menh_an_sao",
        "tuan_triet",
        "dai_han_tieu_han_nguyet_han",
        "v1_backed_full_star_placement_table",
        "v1_backed_cach_cuc_evaluation",
        "bounded_lineage_profile"
      ],
      unavailableEngines: [],
      availableExportContracts: ["json", "png_request", "pdf_request"],
      cucNumber,
      menhPalaceIndex,
      thanPalaceIndex,
      menhCanIndex,
      amDuong: starChart.amDuong,
      thuanNghich: starChart.thuanNghich,
      lunarBirthYearCanChi: formatCanChiVi(birthCanChi.year),
      canChi: {
        year: formatCanChiVi(birthCanChi.year),
        month: formatCanChiVi(birthCanChi.month),
        day: formatCanChiVi(birthCanChi.day),
        hour: formatCanChiVi(birthCanChi.hour)
      },
      trietPositions: starChart.trietPositions,
      tuanPositions: starChart.tuanPositions,
      daiHanAgeRanges,
      tieuHanPalaceIndex,
      nguyetHanPalaces,
      palaces: starChart.palaces,
      combinations: starChart.combinations,
      lineageProfile: starChart.lineageProfile,
      sourceRefs: starChart.sourceRefs,
      menhNapAm: starChart.menhNapAm,
      saoChuCuc: starChart.saoChuCuc,
      menhChu: starChart.menhChu,
      thanChu: starChart.thanChu,
      laiNhanCung: starChart.laiNhanCung,
      nguyenThan: starChart.nguyenThan
    },
    residualRisks: [],
    calculationGuards: [
      "timezone_must_be_explicit_for_birth_place",
      "lunar_leap_month_policy_must_be_preserved",
      "gender_direction_rules_must_match_canonical_tu_vi"
    ],
    sourceRefs: ["hkbfs_shidianguji", ...starChart.sourceRefs]
  };
}

export function createFrontendErrorCatalog() {
  return {
    kind: "frontend-error-catalog",
    errors: [
      { code: "invalid_date", httpStatus: 400, retryable: false },
      { code: "invalid_location", httpStatus: 400, retryable: false },
      { code: "ambiguous_timezone", httpStatus: 422, retryable: true },
      { code: "missing_birth_profile", httpStatus: 422, retryable: true },
      { code: "specialist_module_unavailable", httpStatus: 409, retryable: false },
      { code: "unsupported_date_range", httpStatus: 422, retryable: false },
      { code: "calculation_guard_triggered", httpStatus: 409, retryable: true }
    ]
  };
}

export function createMaiHoaReading(input = {}) {
  const date = normalizeDate(input);
  const location = normalizeLocation(input);
  const timezoneOffset = location.timezone ?? 7;
  const lunarDate = getLunarDate(date, location, timezoneOffset);
  const canChi = buildCanChi(date);
  
  const customNumbers = (input.numberA !== undefined && input.numberB !== undefined) 
    ? [input.numberA, input.numberB] 
    : undefined;

  const reading = calculateTraditionalMaiHoa({
    yearChi: canChi.year.chi,
    lunarMonth: lunarDate.month,
    lunarDay: lunarDate.day,
    hourChi: canChi.hour.chi,
    customNumbers
  });

  const natalContext = createNatalContextOverlay(input);

  return {
    kind: "mai-hoa-reading",
    mode: customNumbers ? "custom_numbers" : "time",
    date: { isoDate: date.toISOString(), unixMs: date.getTime() },
    ...reading,
    residualRisks: [
      "lineage_specific_trigram_strength_and_seasonal_yong_shen_weighting_not_claimed"
    ],
    ...(natalContext ? { natalContext } : {}),
    sourceRefs: ["mai_hoa_dich_so"]
  };
}

export function createTamThucReading(input = {}) {
  const date = normalizeDate(input);
  const location = normalizeLocation(input);
  const astronomy = buildAstronomy({ date, location, controlZone: input.controlZone });
  const canChi = buildCanChi(date);
  
  const reading = evaluateTamThucScore({
    solarTermLongitude: astronomy.solarTerm.targetLongitude,
    dayChi: canChi.day.chi,
    hourChi: canChi.hour.chi,
    monthChi: canChi.month.chi
  });

  const natalContext = createNatalContextOverlay(input);

  return {
    kind: "tam-thuc-reading",
    date: { isoDate: date.toISOString(), unixMs: date.getTime() },
    hourBranch: canChi.hour.chi,
    methods: {
      qmdj: reading.qmdj,
      daiLucNham: reading.daiLucNham,
      thaiAt: reading.thaiAt
    },
    consensus: reading.consensus,
    residualRisks: [
      "dai_luc_nham_ke_not_constructed",
      "thai_at_chart_not_constructed",
      "qmdj_uses_bounded_palace_calculation"
    ],
    ...(natalContext ? { natalContext } : {}),
    sourceRefs: ["hkbfs_shidianguji"]
  };
}

export function createFrontendReadinessBundle(input = {}) {
  const date = normalizeDate(input);
  const location = normalizeLocation(input);
  const birthInput = input.birthProfile
    ? {
        ...input.birthProfile,
        timestamp: input.birthProfile.birthTimestamp ?? input.birthProfile.timestamp,
        isoDate: input.birthProfile.birthIsoDate ?? input.birthProfile.isoDate,
        controlZone: input.controlZone
      }
    : input;
  const baseInput = {
    timestamp: date.getTime(),
    ...location,
    controlZone: input.controlZone
  };

  return {
    kind: "frontend-readiness-bundle",
    generatedAt: date.toISOString(),
    calendarDay: createCalendarDayDetail(baseInput),
    dungSuCatalog: createDungSuCatalog(),
    dungSuScoreDetail: createDungSuScoreDetail({ ...baseInput, eventId: input.eventId ?? "ds_kai_shi" }),
    userBirthProfile: createUserBirthProfileContract({ ...input, ...baseInput }),
    personalizationOverlay: createPersonalizationOverlay({ ...input, ...baseInput }),
    tuViChart: createTuViChartReadiness({ ...input, ...baseInput }),
    westernChart: createWesternChart(birthInput),
    vedicKundli: createVedicKundli(birthInput),
    panchangMuhurat: createPanchangMuhurat(baseInput),
    synastryReadiness: createSynastryReadiness(input),
    maiHoaReading: createMaiHoaReading({ ...input, ...baseInput }),
    tamThucReading: createTamThucReading({ ...input, ...baseInput }),
    errorCatalog: createFrontendErrorCatalog(),
    sourceCatalog: {
      sources: listCalculationSources(),
      methods: listCalculationMethods(),
      westernConceptCount: listAstrologyConcepts({ tradition: "western" }).length,
      vedicConceptCount: listAstrologyConcepts({ tradition: "vedic" }).length
    }
  };
}

// Validation System Integration
import {
  createValidationDashboard,
  createPredictionRecord
} from "@lich-viet/core-logic";

let validationDashboard = null;

export function getValidationDashboard(options = {}) {
  if (!validationDashboard) {
    validationDashboard = createValidationDashboard(options);
  }
  return validationDashboard;
}

export function recordPrediction(input = {}) {
  const dashboard = getValidationDashboard();
  return dashboard.recordPrediction(input);
}

export function recordOutcome(predictionId, outcome) {
  const dashboard = getValidationDashboard();
  return dashboard.recordOutcome(predictionId, outcome);
}

export function getValidationOverview() {
  const dashboard = getValidationDashboard();
  return dashboard.getOverview();
}

export function getValidationReport(questionType) {
  const dashboard = getValidationDashboard();
  return questionType ? dashboard.getDetailedReport(questionType) : dashboard.getFullReport();
}

export function exportValidationData() {
  const dashboard = getValidationDashboard();
  return dashboard.exportData();
}

export function importValidationData(data) {
  const dashboard = getValidationDashboard();
  return dashboard.importData(data);
}

function maybeRegisterPrediction(input, predictionData, factors = []) {
  if (!input.enableValidation) {
    return null;
  }

  try {
    const prediction = createPredictionRecord({
      questionType: input.questionType ?? "general",
      engineLayer: input.engineLayer ?? "combined",
      predictionData,
      confidenceScore: predictionData?.confidenceScore ?? predictionData?.personalizedScore ?? null,
      factors,
      userProfile: input.birthProfile ?? null
    });

    const dashboard = getValidationDashboard();
    dashboard.registry.register(prediction);

    return prediction.predictionId;
  } catch (error) {
    console.warn("Prediction registration failed:", error.message);
    return null;
  }
}
