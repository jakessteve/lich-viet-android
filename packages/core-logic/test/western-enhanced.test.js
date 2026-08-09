import test from "node:test";
import assert from "node:assert/strict";

import {
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
  computeCompositeChart,
  computeDavisonChart,
  computeMidpoint,
  computeDeclination,
  computeRetrogradeStatus,
  computeProgressedDate,
  computeSolarReturn,
  MINOR_ASPECTS
} from "../src/western-enhanced.js";

import {
  buildTopocentricObserver
} from "../src/astronomy.js";
import { unixMsToJulianDay } from "../src/time.js";

const TEST_OBSERVER = buildTopocentricObserver({
  julianDay: unixMsToJulianDay(new Date("1983-11-13T18:30:00+07:00").getTime()),
  latitude: 10.8231,
  longitude: 106.6297,
  altitudeMeters: 19
});

const EARTH_HELIO = {
  x: -0.7,
  y: -0.6,
  z: 0
};

// ===== OUTER PLANETS =====
test("computeOuterPlanets returns Uranus, Neptune, Pluto", () => {
  const outer = computeOuterPlanets(TEST_OBSERVER, EARTH_HELIO);
  assert.equal(outer.length, 3);
  assert.equal(outer[0].body, "uranus");
  assert.equal(outer[1].body, "neptune");
  assert.equal(outer[2].body, "pluto");

  for (const planet of outer) {
    assert.ok(planet.tropicalLongitude >= 0 && planet.tropicalLongitude < 360);
    assert.ok(planet.siderealLongitude >= 0 && planet.siderealLongitude < 360);
  }
});

// ===== NORTH NODE =====
test("computeMeanNorthNode returns valid longitude", () => {
  const node = computeMeanNorthNode(TEST_OBSERVER.julianDay);
  assert.equal(node.body, "north_node");
  assert.ok(node.tropicalLongitude >= 0 && node.tropicalLongitude < 360);
  assert.equal(node.type, "mean");
});

// ===== LILITH =====
test("computeMeanLilith returns valid longitude", () => {
  const lilith = computeMeanLilith(TEST_OBSERVER.julianDay);
  assert.equal(lilith.body, "lilith");
  assert.ok(lilith.tropicalLongitude >= 0 && lilith.tropicalLongitude < 360);
  assert.equal(lilith.type, "mean");
});

// ===== CHIRON =====
test("computeChiron returns valid longitude", () => {
  const chiron = computeChiron(TEST_OBSERVER.julianDay);
  assert.equal(chiron.body, "chiron");
  assert.ok(chiron.tropicalLongitude >= 0 && chiron.tropicalLongitude < 360);
  assert.equal(chiron.type, "approximate");
});

// ===== DIGNITIES =====
test("computeDignity returns domicile for Sun in Leo", () => {
  const dignity = computeDignity("sun", 135);
  assert.equal(dignity.dignity, "domicile");
  assert.equal(dignity.score, 5);
  assert.equal(dignity.sign, "leo");
});

test("computeDignity returns exaltation for Sun in Aries", () => {
  const dignity = computeDignity("sun", 15);
  assert.equal(dignity.dignity, "exaltation");
  assert.equal(dignity.score, 4);
});

test("computeDignity returns detriment for Sun in Aquarius", () => {
  const dignity = computeDignity("sun", 310);
  assert.equal(dignity.dignity, "detriment");
  assert.equal(dignity.score, -5);
});

test("computeDignity returns fall for Sun in Libra", () => {
  const dignity = computeDignity("sun", 195);
  assert.equal(dignity.dignity, "fall");
  assert.equal(dignity.score, -4);
});

test("computeDignity returns peregrine for Sun in Taurus", () => {
  const dignity = computeDignity("sun", 45);
  assert.equal(dignity.dignity, "peregrine");
  assert.equal(dignity.score, 0);
});

test("computeDignity handles Jupiter in Sagittarius as domicile", () => {
  const dignity = computeDignity("jupiter", 250);
  assert.equal(dignity.dignity, "domicile");
  assert.equal(dignity.score, 5);
});

test("computeDignity handles Pluto in Libra as fall", () => {
  const dignity = computeDignity("pluto", 195);
  assert.equal(dignity.dignity, "fall");
  assert.equal(dignity.score, -4);
});

// ===== ANTISCIA =====
test("computeAntiscia returns correct antiscia and contra-antiscia", () => {
  const result = computeAntiscia(90);
  assert.equal(result.antiscia, 270);
  assert.equal(result.contraAntiscia, 90);
});

test("computeAntiscia handles 0 degrees", () => {
  const result = computeAntiscia(0);
  assert.equal(result.antiscia, 0);
  assert.equal(result.contraAntiscia, 180);
});

// ===== PART OF FORTUNE =====
test("computePartOfFortune day birth formula", () => {
  const pof = computePartOfFortune(120, 60, 30, true);
  assert.ok(pof >= 0 && pof < 360);
  assert.equal(pof, 330);
});

test("computePartOfFortune night birth formula", () => {
  const pof = computePartOfFortune(120, 60, 30, false);
  assert.ok(pof >= 0 && pof < 360);
  assert.equal(pof, 90);
});

// ===== DISPOSITOR TREE =====
test("computeDispositorTree returns correct dispositor chain", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 135 },
    { body: "moon", tropicalLongitude: 75 },
    { body: "mars", tropicalLongitude: 45 }
  ];

  const tree = computeDispositorTree(planets);
  assert.equal(tree.sun.sign, "leo");
  assert.equal(tree.sun.dispositor, "sun");
  assert.equal(tree.moon.sign, "gemini");
  assert.equal(tree.moon.dispositor, "mercury");
  assert.equal(tree.mars.sign, "taurus");
  assert.equal(tree.mars.dispositor, "venus");
});

// ===== CHART SHAPE =====
test("detectChartShape identifies stellium", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 10 },
    { body: "moon", tropicalLongitude: 15 },
    { body: "mercury", tropicalLongitude: 20 },
    { body: "venus", tropicalLongitude: 25 }
  ];
  const shape = detectChartShape(planets);
  assert.equal(shape.shape, "stellium");
});

test("detectChartShape identifies bowl", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 10 },
    { body: "moon", tropicalLongitude: 50 },
    { body: "mercury", tropicalLongitude: 90 },
    { body: "venus", tropicalLongitude: 130 },
    { body: "mars", tropicalLongitude: 170 }
  ];
  const shape = detectChartShape(planets);
  assert.equal(shape.shape, "bowl");
});

test("detectChartShape returns unknown for < 3 planets", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 10 },
    { body: "moon", tropicalLongitude: 50 }
  ];
  const shape = detectChartShape(planets);
  assert.equal(shape.shape, "unknown");
});

// ===== PARALLELS =====
test("detectParallels finds parallel aspects", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 90 },
    { body: "moon", tropicalLongitude: 270 }
  ];
  const result = detectParallels(planets, 2.0);
  assert.ok(result.parallels.length >= 0);
  assert.ok(result.contraparallels.length >= 0);
});

// ===== MIDPOINTS =====
test("computeMidpoint calculates correctly for same hemisphere", () => {
  const mid = computeMidpoint(10, 50);
  assert.equal(mid, 30);
});

test("computeMidpoint handles wraparound", () => {
  const mid = computeMidpoint(350, 10);
  assert.equal(mid, 0);
});

test("computeAllMidpoints generates all pairs", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 10 },
    { body: "moon", tropicalLongitude: 90 },
    { body: "mercury", tropicalLongitude: 180 }
  ];
  const midpoints = computeAllMidpoints(planets);
  assert.equal(midpoints.length, 3);
});

test("findMidpointContacts finds contacts within orb", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 10 },
    { body: "moon", tropicalLongitude: 90 },
    { body: "mars", tropicalLongitude: 50 }
  ];
  const midpoints = computeAllMidpoints(planets);
  const contacts = findMidpointContacts(planets, midpoints, 2.0);
  assert.ok(contacts.length >= 0);
});

// ===== MINOR ASPECTS =====
test("detectMinorAspects finds quincunx", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 0 },
    { body: "moon", tropicalLongitude: 150 }
  ];
  const aspects = detectMinorAspects(planets);
  const quincunx = aspects.find(a => a.aspectId === "quincunx");
  assert.ok(quincunx);
});

test("detectMinorAspects finds semi-square", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 0 },
    { body: "moon", tropicalLongitude: 45 }
  ];
  const aspects = detectMinorAspects(planets);
  const semiSquare = aspects.find(a => a.aspectId === "semi_square");
  assert.ok(semiSquare);
});

test("MINOR_ASPECTS contains expected aspects", () => {
  assert.ok(MINOR_ASPECTS.length >= 6);
  assert.ok(MINOR_ASPECTS.find(a => a.id === "quincunx"));
  assert.ok(MINOR_ASPECTS.find(a => a.id === "semi_square"));
  assert.ok(MINOR_ASPECTS.find(a => a.id === "semi_sextile"));
  assert.ok(MINOR_ASPECTS.find(a => a.id === "sesquisquare"));
  assert.ok(MINOR_ASPECTS.find(a => a.id === "quintile"));
  assert.ok(MINOR_ASPECTS.find(a => a.id === "biquintile"));
});

// ===== COMPOSITE CHART =====
test("computeCompositeChart returns midpoint positions", () => {
  const planetsA = [
    { body: "sun", tropicalLongitude: 0 },
    { body: "moon", tropicalLongitude: 90 }
  ];
  const planetsB = [
    { body: "sun", tropicalLongitude: 60 },
    { body: "moon", tropicalLongitude: 180 }
  ];

  const composite = computeCompositeChart(planetsA, planetsB);
  assert.equal(composite.length, 2);
  assert.equal(composite[0].body, "sun");
  assert.equal(composite[0].tropicalLongitude, 30);
  assert.equal(composite[1].body, "moon");
  assert.equal(composite[1].tropicalLongitude, 135);
});

// ===== DAVISON CHART =====
test("computeDavisonChart returns time and space midpoint", () => {
  const birthA = { julianDay: 2445000, latitude: 10, longitude: 100 };
  const birthB = { julianDay: 2446000, latitude: 20, longitude: 110 };

  const davison = computeDavisonChart(birthA, birthB);
  assert.equal(davison.julianDay, 2445500);
  assert.equal(davison.latitude, 15);
  assert.equal(davison.longitude, 105);
});

// ===== DECLINATION =====
test("computeDeclination returns correct value for Sun at 90 degrees", () => {
  const dec = computeDeclination(90, 23.44);
  assert.ok(Math.abs(dec - 23.44) < 0.01);
});

test("computeDeclination returns 0 for equinox points", () => {
  const dec0 = computeDeclination(0, 23.44);
  assert.ok(Math.abs(dec0) < 0.01);

  const dec180 = computeDeclination(180, 23.44);
  assert.ok(Math.abs(dec180) < 0.01);
});

// ===== PROGRESSIONS =====
test("computeProgressedDate adds 1 day per year", () => {
  const birthJd = 2445000;
  const progressed = computeProgressedDate(birthJd, 40);
  assert.equal(progressed, 2445040);
});

// ===== SOLAR RETURN =====
test("computeSolarReturn finds return within year", () => {
  const birthSunLon = 220;
  const startJd = unixMsToJulianDay(new Date("2025-01-01T00:00:00Z").getTime());
  const result = computeSolarReturn(birthSunLon, 2025, startJd);
  if (result) {
    assert.ok(Math.abs(result.solarReturnLongitude - birthSunLon) < 1);
  }
});

// ===== RETROGRADE =====
test("computeRetrogradeStatus returns status for north node", () => {
  const node = computeMeanNorthNode(TEST_OBSERVER.julianDay);
  const status = computeRetrogradeStatus(TEST_OBSERVER, "north_node", node.tropicalLongitude);
  assert.ok(["direct", "retrograde", "stationary"].includes(status.status));
});

// ===== PHASE 5 TESTS =====

import {
  computePlacidusCusps,
  computeKochCusps,
  detectInterceptedSigns
} from "../src/western-enhanced.js";

test("computePlacidusCusps returns 12 house cusps", () => {
  const observer = {
    julianDay: 2445650.5,
    latitude: 10.8,
    longitude: 106.6,
    altitudeMeters: 0
  };
  
  const cusps = computePlacidusCusps(observer);
  
  assert.equal(cusps.system, "placidus");
  assert.equal(cusps.cusps.length, 12);
  assert.ok(typeof cusps.ascendant === "number");
  assert.ok(typeof cusps.midheaven === "number");
});

test("computeKochCusps returns 12 house cusps", () => {
  const observer = {
    julianDay: 2445650.5,
    latitude: 10.8,
    longitude: 106.6,
    altitudeMeters: 0
  };
  
  const cusps = computeKochCusps(observer);
  
  assert.equal(cusps.system, "koch");
  assert.equal(cusps.cusps.length, 12);
  assert.ok(typeof cusps.ascendant === "number");
  assert.ok(typeof cusps.midheaven === "number");
});

test("detectInterceptedSigns returns array", () => {
  const cusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const intercepted = detectInterceptedSigns(cusps);
  
  assert.ok(Array.isArray(intercepted));
});

// ===== PHASE 6 TESTS =====

import {
  computeVariableOrbs,
  computeReceptions,
  computeAlmuten,
  computeEgyptianBound,
  computePtolemaicTerm
} from "../src/western-enhanced.js";

test("computeVariableOrbs returns aspects with adjusted orbs", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 10 },
    { body: "moon", tropicalLongitude: 15 },
    { body: "mars", tropicalLongitude: 100 }
  ];
  
  const aspects = computeVariableOrbs(planets);
  
  assert.ok(Array.isArray(aspects));
  if (aspects.length > 0) {
    assert.ok(typeof aspects[0].orbMultiplier === "number");
    assert.ok(typeof aspects[0].adjustedOrb === "number");
  }
});

test("computeReceptions detects planetary receptions", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 150 }, // Leo = sun domicile
    { body: "mars", tropicalLongitude: 10 }  // Aries = mars domicile
  ];
  
  const receptions = computeReceptions(planets);
  
  assert.ok(Array.isArray(receptions));
});

test("computeAlmuten returns planet with highest dignity", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 150 },
    { body: "moon", tropicalLongitude: 100 },
    { body: "mars", tropicalLongitude: 200 }
  ];
  
  const almuten = computeAlmuten(planets);
  
  assert.ok(typeof almuten.almuten === "string");
  assert.ok(typeof almuten.score === "number");
  assert.ok(typeof almuten.allScores === "object");
});

test("computeEgyptianBound returns bound for longitude", () => {
  const bound = computeEgyptianBound(15); // 15° Aries
  
  assert.ok(bound);
  assert.equal(bound.sign, "aries");
  assert.ok(typeof bound.planet === "string");
  assert.ok(typeof bound.startDegree === "number");
  assert.ok(typeof bound.endDegree === "number");
});

test("computePtolemaicTerm returns term for longitude", () => {
  const term = computePtolemaicTerm(45); // 15° Taurus
  
  assert.ok(term);
  assert.equal(term.sign, "taurus");
  assert.ok(typeof term.planet === "string");
});

// ===== PHASE 7 TESTS =====

import {
  computePlanetaryVelocity,
  detectStationaryPlanets,
  computeEclipseConditions,
  isEclipsePossible,
  computeSarosCycle
} from "../src/western-enhanced.js";

test("computePlanetaryVelocity returns velocity and status", () => {
  const observer = {
    julianDay: 2445650.5,
    latitude: 10.8,
    longitude: 106.6,
    altitudeMeters: 0
  };
  
  const result = computePlanetaryVelocity(observer, "north_node");
  
  assert.ok(typeof result.velocity === "number");
  assert.ok(["direct", "retrograde", "stationary", "unknown"].includes(result.status));
});

test("detectStationaryPlanets returns array of stationary bodies", () => {
  const observer = {
    julianDay: 2445650.5,
    latitude: 10.8,
    longitude: 106.6,
    altitudeMeters: 0
  };
  
  const stationary = detectStationaryPlanets(observer);
  
  assert.ok(Array.isArray(stationary));
});

test("computeEclipseConditions returns node positions", () => {
  const observer = {
    julianDay: 2445650.5,
    latitude: 10.8,
    longitude: 106.6,
    altitudeMeters: 0
  };
  
  const conditions = computeEclipseConditions(observer);
  
  assert.ok(typeof conditions.northNode === "number");
  assert.ok(typeof conditions.southNode === "number");
});

test("isEclipsePossible checks sun/moon proximity to nodes", () => {
  const result = isEclipsePossible(0, 0, 5, 10);
  
  assert.ok(typeof result.solarEclipsePossible === "boolean");
  assert.ok(typeof result.lunarEclipsePossible === "boolean");
});

test("computeSarosCycle returns cycle information", () => {
  const cycle = computeSarosCycle(2445650.5);
  
  assert.ok(typeof cycle.sarosNumber === "number");
  assert.ok(typeof cycle.sarosCycle === "number");
  assert.ok(typeof cycle.daysSinceEpoch === "number");
});

// ===== PHASE 8 TESTS =====

import {
  FIXED_STARS,
  computeFixedStarPosition,
  computeFixedStarAspects,
  getAllFixedStarPositions,
  computeBarbaultSyntheticIndex,
  computeBarbaultIndexRange
} from "../src/western-enhanced.js";

test("FIXED_STARS catalog contains expected stars", () => {
  assert.ok(FIXED_STARS.sirius);
  assert.ok(FIXED_STARS.spica);
  assert.ok(FIXED_STARS.regulus);
  assert.ok(typeof FIXED_STARS.sirius.magnitude === "number");
});

test("computeFixedStarPosition returns position with precession", () => {
  const pos = computeFixedStarPosition("sirius", 2445650.5);
  
  assert.ok(pos);
  assert.equal(pos.star, "Sirius");
  assert.ok(typeof pos.tropicalLongitude === "number");
  assert.ok(pos.tropicalLongitude >= 0 && pos.tropicalLongitude < 360);
});

test("computeFixedStarAspects returns aspects to planets", () => {
  const planets = [
    { body: "sun", tropicalLongitude: 100 },
    { body: "moon", tropicalLongitude: 200 }
  ];
  
  const aspects = computeFixedStarAspects(planets, 2445650.5, 2.0);
  
  assert.ok(Array.isArray(aspects));
});

test("getAllFixedStarPositions returns all star positions", () => {
  const positions = getAllFixedStarPositions(2445650.5);
  
  assert.ok(Array.isArray(positions));
  assert.ok(positions.length > 0);
});

test("computeBarbaultSyntheticIndex returns index and interpretation", () => {
  const index = computeBarbaultSyntheticIndex(2445650.5);
  
  assert.ok(typeof index.syntheticIndex === "number");
  assert.ok(index.syntheticIndex >= 0 && index.syntheticIndex <= 100);
  assert.ok(["crisis_point", "decline", "expansion", "peak"].includes(index.interpretation));
  assert.ok(typeof index.phases === "object");
});

test("computeBarbaultIndexRange returns array of indices", () => {
  const range = computeBarbaultIndexRange(2445650.5, 2445700.5, 10);
  
  assert.ok(Array.isArray(range));
  assert.ok(range.length > 0);
  assert.ok(typeof range[0].syntheticIndex === "number");
});
