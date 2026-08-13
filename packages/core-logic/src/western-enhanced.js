import {
  computeJulianCentury,
  computeDeltaT,
  normalizeDegrees,
  convertTropicalToSidereal,
  computeSolarLongitude,
  computeTopocentricPlanetarySnapshot,
  computeTrueLunarPosition
} from "./astronomy.js";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

import { round } from "./astronomy.js";

// ===== OUTER PLANET ORBITAL ELEMENTS (J2000, Meeus Table 31.A) =====
const OUTER_PLANET_ELEMENTS = Object.freeze({
  uranus: {
    a: [19.18171, -0.00155],
    e: [0.04716834, -0.00019286],
    I: [0.7726378, -0.0024113],
    L: [313.23810, 428.48302],
    w: [170.95427, 0.40805],
    node: [74.22988, -0.17056]
  },
  neptune: {
    a: [30.06896, -0.00125],
    e: [0.00858587, 0.0000251],
    I: [1.76995, -0.00945],
    L: [304.87997, 218.46502],
    w: [44.96476, 0.32220],
    node: [131.7842, -0.5768]
  },
  pluto: {
    a: [39.48169, -0.00203],
    e: [0.24882730, 0.0000500],
    I: [17.14001, 0.00004],
    L: [238.92903, 145.20780],
    w: [224.06891, -0.04062],
    node: [110.30394, -0.01183]
  }
});

function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 8; i += 1) {
    const delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }
  return E;
}

function getOuterPlanetHeliocentricXYZ(planet, T) {
  const elem = OUTER_PLANET_ELEMENTS[planet];
  if (!elem) return null;

  const a = elem.a[0] + elem.a[1] * T;
  const rawE = elem.e[0] + elem.e[1] * T;
  const e = Math.max(0.0, Math.min(0.99, rawE));
  const I = (elem.I[0] + elem.I[1] * T) * DEG_TO_RAD;
  const L = elem.L[0] + elem.L[1] * T;
  const w = elem.w[0] + elem.w[1] * T;
  const node = (elem.node[0] + elem.node[1] * T) * DEG_TO_RAD;

  const M = normalizeDegrees(L - w) * DEG_TO_RAD;
  const E = solveKepler(M, e);

  const x_prime = a * (Math.cos(E) - e);
  const y_prime = a * Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E);

  const omega = (w - (elem.node[0] + elem.node[1] * T)) * DEG_TO_RAD;

  const cosOmega = Math.cos(node);
  const sinOmega = Math.sin(node);
  const cosW = Math.cos(omega);
  const sinW = Math.sin(omega);
  const cosI = Math.cos(I);
  const sinI = Math.sin(I);

  const x = x_prime * (cosW * cosOmega - sinW * sinOmega * cosI) - y_prime * (sinW * cosOmega + cosW * sinOmega * cosI);
  const y = x_prime * (cosW * sinOmega + sinW * cosOmega * cosI) - y_prime * (sinW * sinOmega - cosW * cosOmega * cosI);
  const z = x_prime * (sinW * sinI) + y_prime * (cosW * sinI);

  return { x, y, z };
}

// ===== NORTH NODE (Mean Lunar Node) =====
export function computeMeanNorthNode(julianDay) {
  const jdTT = julianDay + computeDeltaT(julianDay) / 86400;
  const T = computeJulianCentury(jdTT);

  const meanNode = normalizeDegrees(
    125.04452 - 1934.136261 * T +
    0.0020708 * T * T +
    T * T * T / 450000
  );

  return {
    body: "north_node",
    tropicalLongitude: round(meanNode),
    type: "mean"
  };
}

// ===== BLACK MOON LILITH (Mean Lunar Apogee) =====
export function computeMeanLilith(julianDay) {
  const jdTT = julianDay + computeDeltaT(julianDay) / 86400;
  const T = computeJulianCentury(jdTT);

  const meanLilith = normalizeDegrees(
    83.353243 + 4069.0137111 * T -
    0.010320 * T * T -
    T * T * T / 80053
  );

  return {
    body: "lilith",
    tropicalLongitude: round(meanLilith),
    type: "mean"
  };
}

// ===== CHIRON (Approximate) =====
export function computeChiron(julianDay) {
  const jdTT = julianDay + computeDeltaT(julianDay) / 86400;
  const T = computeJulianCentury(jdTT);

  const chironL = normalizeDegrees(268.6467 + 226.2942 * T);
  const chironM = normalizeDegrees(30.0 + 226.2942 * T) * DEG_TO_RAD;
  const C = 4.5 * Math.sin(chironM) + 0.5 * Math.sin(2 * chironM);

  return {
    body: "chiron",
    tropicalLongitude: round(normalizeDegrees(chironL + C)),
    type: "approximate"
  };
}

// ===== OUTER PLANETS =====
export function computeOuterPlanets(observer, earthHelio) {
  const jdTT = observer.julianDay + computeDeltaT(observer.julianDay) / 86400;
  const T = computeJulianCentury(jdTT);

  const epsilon = (23.439291 - 0.0130042 * T) * DEG_TO_RAD;
  const GMST = normalizeDegrees(280.46061837 + 360.98564736629 * (observer.julianDay - 2451545.0));
  const LST = GMST + observer.longitude;
  const LST_rad = LST * DEG_TO_RAD;

  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const e2 = 2 * f - f * f;
  const lat_rad = observer.latitude * DEG_TO_RAD;
  const sinLat = Math.sin(lat_rad);
  const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);

  const x_eq = (N + observer.altitudeMeters) * Math.cos(lat_rad) * Math.cos(LST_rad);
  const y_eq = (N + observer.altitudeMeters) * Math.cos(lat_rad) * Math.sin(LST_rad);
  const z_eq = (N * (1 - e2) + observer.altitudeMeters) * sinLat;

  const x_obs_ec = x_eq;
  const y_obs_ec = y_eq * Math.cos(epsilon) + z_eq * Math.sin(epsilon);
  const z_obs_ec = -y_eq * Math.sin(epsilon) + z_eq * Math.cos(epsilon);

  const AU_in_meters = 149597870700;
  const x_obs = x_obs_ec / AU_in_meters;
  const y_obs = y_obs_ec / AU_in_meters;
  const z_obs = z_obs_ec / AU_in_meters;

  const x_earth_helio = earthHelio.x;
  const y_earth_helio = earthHelio.y;
  const z_earth_helio = earthHelio.z;

  const results = [];

  for (const body of ["uranus", "neptune", "pluto"]) {
    const p_xyz = getOuterPlanetHeliocentricXYZ(body, T);
    if (!p_xyz) continue;

    const x_geo = p_xyz.x - x_earth_helio;
    const y_geo = p_xyz.y - y_earth_helio;
    const z_geo = p_xyz.z - z_earth_helio;

    const x_topo = x_geo - x_obs;
    const y_topo = y_geo - y_obs;
    const z_topo = z_geo - z_obs;

    const tropicalLongitude = normalizeDegrees(Math.atan2(y_topo, x_topo) * RAD_TO_DEG);

    results.push({
      body,
      tropicalLongitude: round(tropicalLongitude),
      siderealLongitude: convertTropicalToSidereal(tropicalLongitude, observer.julianDay)
    });
  }

  return results;
}

// ===== RETROGRADE DETECTION =====
export function computeRetrogradeStatus(observer, body, currentLongitude) {
  const step = 1;
  const prevJd = observer.julianDay - step;
  const nextJd = observer.julianDay + step;

  const prevObserver = { ...observer, julianDay: prevJd };
  const nextObserver = { ...observer, julianDay: nextJd };

  let prevLongitude, nextLongitude;

  if (body === "north_node" || body === "lilith") {
    prevLongitude = body === "north_node"
      ? computeMeanNorthNode(prevJd).tropicalLongitude
      : computeMeanLilith(prevJd).tropicalLongitude;
    nextLongitude = body === "north_node"
      ? computeMeanNorthNode(nextJd).tropicalLongitude
      : computeMeanLilith(nextJd).tropicalLongitude;
  } else if (body === "chiron") {
    prevLongitude = computeChiron(prevJd).tropicalLongitude;
    nextLongitude = computeChiron(nextJd).tropicalLongitude;
  } else {
    return { isRetrograde: false, status: "direct" };
  }

  const prevDiff = ((currentLongitude - prevLongitude + 540) % 360) - 180;
  const nextDiff = ((nextLongitude - currentLongitude + 540) % 360) - 180;

  const isRetrograde = prevDiff < 0 && nextDiff < 0;
  const isStationary = Math.abs(prevDiff) < 0.1 || Math.abs(nextDiff) < 0.1;

  return {
    isRetrograde,
    isStationary,
    status: isRetrograde ? "retrograde" : isStationary ? "stationary" : "direct",
    dailyMotion: round((prevDiff + nextDiff) / 2, 4)
  };
}

// ===== PLANETARY DIGNITIES =====
const DIGNITY_TABLE = Object.freeze({
  sun: {
    domicile: ["leo"],
    exaltation: ["aries"],
    detriment: ["aquarius"],
    fall: ["libra"]
  },
  moon: {
    domicile: ["cancer"],
    exaltation: ["taurus"],
    detriment: ["capricorn"],
    fall: ["scorpio"]
  },
  mercury: {
    domicile: ["gemini", "virgo"],
    exaltation: ["virgo"],
    detriment: ["sagittarius", "pisces"],
    fall: ["pisces"]
  },
  venus: {
    domicile: ["taurus", "libra"],
    exaltation: ["pisces"],
    detriment: ["aries", "scorpio"],
    fall: ["virgo"]
  },
  mars: {
    domicile: ["aries", "scorpio"],
    exaltation: ["capricorn"],
    detriment: ["libra", "taurus"],
    fall: ["cancer"]
  },
  jupiter: {
    domicile: ["sagittarius", "pisces"],
    exaltation: ["cancer"],
    detriment: ["gemini", "virgo"],
    fall: ["capricorn"]
  },
  saturn: {
    domicile: ["capricorn", "aquarius"],
    exaltation: ["libra"],
    detriment: ["cancer", "leo"],
    fall: ["aries"]
  },
  uranus: {
    domicile: ["aquarius"],
    exaltation: ["scorpio"],
    detriment: ["leo"],
    fall: ["taurus"]
  },
  neptune: {
    domicile: ["pisces"],
    exaltation: ["leo"],
    detriment: ["virgo"],
    fall: ["aquarius"]
  },
  pluto: {
    domicile: ["scorpio"],
    exaltation: ["aries"],
    detriment: ["taurus"],
    fall: ["libra"]
  }
});

export function computeDignity(body, tropicalLongitude) {
  const signIndex = Math.floor(normalizeDegrees(tropicalLongitude) / 30);
  const sign = ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
                "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"][signIndex];

  const table = DIGNITY_TABLE[(body || '').toLowerCase()];
  if (!table) {
    return { sign, dignity: "peregrine", score: 0 };
  }

  if (table.domicile.includes(sign)) {
    return { sign, dignity: "domicile", score: 5 };
  }
  if (table.exaltation.includes(sign)) {
    return { sign, dignity: "exaltation", score: 4 };
  }
  if (table.detriment.includes(sign)) {
    return { sign, dignity: "detriment", score: -5 };
  }
  if (table.fall.includes(sign)) {
    return { sign, dignity: "fall", score: -4 };
  }

  return { sign, dignity: "peregrine", score: 0 };
}

// ===== ANTISCIA / CONTRA-ANTISCIA =====
export function computeAntiscia(tropicalLongitude) {
  const normalized = normalizeDegrees(tropicalLongitude);
  const antiscia = normalizeDegrees(360 - normalized);
  const contraAntiscia = normalizeDegrees(180 - normalized);

  return {
    antiscia: round(antiscia),
    contraAntiscia: round(contraAntiscia)
  };
}

// ===== PART OF FORTUNE =====
export function computePartOfFortune(sunLongitude, moonLongitude, ascendantLongitude, isDayBirth = true) {
  if (isDayBirth) {
    return round(normalizeDegrees(ascendantLongitude + moonLongitude - sunLongitude));
  } else {
    return round(normalizeDegrees(ascendantLongitude + sunLongitude - moonLongitude));
  }
}

// ===== DISPOSITOR TREE =====
const SIGN_RULERS = Object.freeze({
  aries: "mars",
  taurus: "venus",
  gemini: "mercury",
  cancer: "moon",
  leo: "sun",
  virgo: "mercury",
  libra: "venus",
  scorpio: "pluto",
  sagittarius: "jupiter",
  capricorn: "saturn",
  aquarius: "uranus",
  pisces: "neptune"
});

export function computeDispositorTree(planets) {
  const tree = {};

  for (const planet of planets) {
    const signIndex = Math.floor(normalizeDegrees(planet.tropicalLongitude) / 30);
    const sign = ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
                  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"][signIndex];
    const dispositor = SIGN_RULERS[sign];

    tree[planet.body] = {
      sign,
      dispositor,
      dispositorSign: null
    };

    const dispositorPlanet = planets.find(p => p.body === dispositor);
    if (dispositorPlanet) {
      const dispositorSignIndex = Math.floor(normalizeDegrees(dispositorPlanet.tropicalLongitude) / 30);
      tree[planet.body].dispositorSign = ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
                                          "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"][dispositorSignIndex];
    }
  }

  return tree;
}

// ===== CHART SHAPE DETECTION =====
export function detectChartShape(planets) {
  if (planets.length < 3) {
    return { shape: "unknown", reason: "insufficient_planets" };
  }

  const longitudes = planets.map(p => normalizeDegrees(p.tropicalLongitude)).sort((a, b) => a - b);

  let minSpan = 360;
  let maxGap = 0;
  let gapStart = 0;

  for (let i = 0; i < longitudes.length; i++) {
    const next = (i + 1) % longitudes.length;
    let gap = longitudes[next] - longitudes[i];
    if (gap < 0) gap += 360;

    if (gap > maxGap) {
      maxGap = gap;
      gapStart = longitudes[i];
    }

    const span = 360 - gap;
    if (span < minSpan) {
      minSpan = span;
    }
  }

  if (minSpan <= 120) {
    return {
      shape: "stellium",
      span: round(minSpan),
      concentration: round(360 / minSpan, 2)
    };
  }

  if (minSpan <= 180) {
    return {
      shape: "bowl",
      span: round(minSpan),
      emptyHalf: round(normalizeDegrees(gapStart + maxGap / 2))
    };
  }

  if (maxGap <= 120) {
    return {
      shape: "sectile",
      span: round(minSpan),
      distribution: "even"
    };
  }

  if (maxGap >= 240) {
    return {
      shape: "bucket",
      span: round(minSpan),
      handle: round(normalizeDegrees(gapStart + maxGap / 2))
    };
  }

  if (maxGap >= 180) {
    return {
      shape: "locomotive",
      span: round(minSpan),
      emptyArc: round(maxGap)
    };
  }

  return {
    shape: "splash",
    span: round(minSpan),
    distribution: "scattered"
  };
}

// ===== DECLINATION / PARALLEL =====
export function computeDeclination(tropicalLongitude, obliquity = 23.439291) {
  const lonRad = normalizeDegrees(tropicalLongitude) * DEG_TO_RAD;
  const oblRad = obliquity * DEG_TO_RAD;
  return round(Math.asin(Math.sin(oblRad) * Math.sin(lonRad)) * RAD_TO_DEG);
}

export function detectParallels(planets, orb = 1.0) {
  const parallels = [];
  const contraparallels = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const decA = computeDeclination(planets[i].tropicalLongitude);
      const decB = computeDeclination(planets[j].tropicalLongitude);

      const diff = Math.abs(decA - decB);
      const sum = Math.abs(decA + decB);

      if (diff <= orb) {
        parallels.push({
          bodyA: planets[i].body,
          bodyB: planets[j].body,
          declinationA: round(decA),
          declinationB: round(decB),
          orb: round(diff)
        });
      }

      if (sum <= orb) {
        contraparallels.push({
          bodyA: planets[i].body,
          bodyB: planets[j].body,
          declinationA: round(decA),
          declinationB: round(decB),
          orb: round(sum)
        });
      }
    }
  }

  return { parallels, contraparallels };
}

// ===== SECONDARY PROGRESSIONS =====
export function computeProgressedDate(birthJulianDay, ageYears) {
  return birthJulianDay + ageYears;
}

export function computeProgressedPlanets(observer, birthObserver, ageYears) {
  const progressedJd = computeProgressedDate(birthObserver.julianDay, ageYears);
  const progressedObserver = { ...observer, julianDay: progressedJd };

  return {
    progressedDate: progressedJd,
    progressedObserver,
    note: "1 day = 1 year (secondary progression)"
  };
}

// ===== SOLAR RETURN =====
export function computeSolarReturn(birthSunLongitude, year, startJulianDay) {
  let low = startJulianDay;
  let high = startJulianDay + 366;

  for (let iter = 0; iter < 50; iter++) {
    const mid = (low + high) / 2;
    const jdTT = mid + computeDeltaT(mid) / 86400;
    const T = computeJulianCentury(jdTT);
    const meanLongitude = normalizeDegrees(280.46646 + T * (36000.76983 + 0.0003032 * T));
    const meanAnomaly = normalizeDegrees(357.52911 + T * (35999.05029 - 0.0001537 * T));
    const meanAnomalyRad = meanAnomaly * DEG_TO_RAD;

    const equationOfCenter =
      (1.914602 - T * (0.004817 + 0.000014 * T)) * Math.sin(meanAnomalyRad) +
      (0.019993 - 0.000101 * T) * Math.sin(2 * meanAnomalyRad) +
      0.000289 * Math.sin(3 * meanAnomalyRad);

    const trueLongitude = normalizeDegrees(meanLongitude + equationOfCenter);
    const diff = ((trueLongitude - birthSunLongitude + 540) % 360) - 180;

    if (Math.abs(diff) < 0.001) {
      return {
        solarReturnJulianDay: mid,
        solarReturnLongitude: round(trueLongitude),
        birthLongitude: round(birthSunLongitude),
        orb: round(Math.abs(diff))
      };
    }

    if (diff > 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return null;
}

// ===== LUNAR RETURN =====
export function computeLunarReturn(birthMoonLongitude, startJulianDay) {
  const target = normalizeDegrees(birthMoonLongitude);
  const diffAt = (jd) =>
    ((computeTrueLunarPosition(jd).longitude - target + 540) % 360) - 180;

  let low = startJulianDay;
  let lowDiff = diffAt(low);
  let found = null;

  for (let step = 0; step < 64; step++) {
    const high = startJulianDay + (step + 1) * 0.5;
    const highDiff = diffAt(high);

    if (lowDiff <= 0 && highDiff > 0) {
      found = [low, high];
      break;
    }

    low = high;
    lowDiff = highDiff;
  }

  if (!found) return null;

  let [a, b] = found;
  for (let iter = 0; iter < 50; iter++) {
    const mid = (a + b) / 2;
    const midDiff = diffAt(mid);
    if (Math.abs(midDiff) < 0.0001) {
      a = mid;
      b = mid;
      break;
    }
    if (midDiff <= 0) {
      a = mid;
    } else {
      b = mid;
    }
  }

  const jd = (a + b) / 2;
  return {
    lunarReturnJulianDay: round(jd),
    lunarReturnLongitude: round(computeTrueLunarPosition(jd).longitude),
    birthLongitude: round(target),
    orb: round(Math.abs(diffAt(jd)))
  };
}

// ===== MIDPOINTS =====
export function computeMidpoint(lonA, lonB) {
  const a = normalizeDegrees(lonA);
  const b = normalizeDegrees(lonB);
  let midpoint = (a + b) / 2;

  if (Math.abs(a - b) > 180) {
    midpoint = normalizeDegrees(midpoint + 180);
  }

  return round(midpoint);
}

export function computeAllMidpoints(planets) {
  const midpoints = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      midpoints.push({
        bodyA: planets[i].body,
        bodyB: planets[j].body,
        midpointLongitude: computeMidpoint(planets[i].tropicalLongitude, planets[j].tropicalLongitude)
      });
    }
  }

  return midpoints;
}

export function findMidpointContacts(planets, midpoints, orb = 1.5) {
  const contacts = [];

  for (const midpoint of midpoints) {
    for (const planet of planets) {
      if (planet.body === midpoint.bodyA || planet.body === midpoint.bodyB) continue;

      const dist = Math.abs(normalizeDegrees(planet.tropicalLongitude) - midpoint.midpointLongitude);
      const shortestDist = Math.min(dist, 360 - dist);

      if (shortestDist <= orb) {
        contacts.push({
          midpoint: `${midpoint.bodyA}/${midpoint.bodyB}`,
          planet: planet.body,
          orb: round(shortestDist),
          midpointLongitude: midpoint.midpointLongitude
        });
      }
    }
  }

  return contacts;
}

// ===== MINOR ASPECTS =====
export const MINOR_ASPECTS = Object.freeze([
  { id: "semi_sextile", angle: 30, orb: 2, score: 2 },
  { id: "semi_square", angle: 45, orb: 2, score: -3 },
  { id: "quincunx", angle: 150, orb: 2, score: -3 },
  { id: "sesquisquare", angle: 135, orb: 2, score: -3 },
  { id: "quintile", angle: 72, orb: 2, score: 3 },
  { id: "biquintile", angle: 144, orb: 2, score: 3 }
]);

export function detectMinorAspects(planets, orbMultiplier = 1.0) {
  const aspects = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const dist = Math.abs(normalizeDegrees(planets[i].tropicalLongitude) - normalizeDegrees(planets[j].tropicalLongitude));
      const shortestDist = Math.min(dist, 360 - dist);

      for (const aspect of MINOR_ASPECTS) {
        const orb = aspect.orb * orbMultiplier;
        if (Math.abs(shortestDist - aspect.angle) <= orb) {
          aspects.push({
            bodyA: planets[i].body,
            bodyB: planets[j].body,
            aspectId: aspect.id,
            angle: aspect.angle,
            orb: round(Math.abs(shortestDist - aspect.angle)),
            score: aspect.score
          });
        }
      }
    }
  }

  return aspects;
}

// ===== COMPOSITE CHART =====
export function computeCompositeChart(planetsA, planetsB) {
  const composite = [];

  for (const planetA of planetsA) {
    const planetB = planetsB.find(p => p.body === planetA.body);
    if (!planetB) continue;

    const lonA = normalizeDegrees(planetA.tropicalLongitude);
    const lonB = normalizeDegrees(planetB.tropicalLongitude);

    composite.push({
      body: planetA.body,
      tropicalLongitude: computeMidpoint(lonA, lonB),
      midpointType: "composite"
    });
  }

  return composite;
}

// ===== DAVISON CHART =====
export function computeDavisonChart(birthA, birthB) {
  const midTime = (birthA.julianDay + birthB.julianDay) / 2;
  const midLat = (birthA.latitude + birthB.latitude) / 2;
  const midLon = (birthA.longitude + birthB.longitude) / 2;

  return {
    julianDay: midTime,
    latitude: midLat,
    longitude: midLon,
    note: "Time and space midpoint between two births"
  };
}

// ===== PHASE 5: HOUSE SYSTEMS =====

// Placidus house cusp calculation (Meeus Ch. 22)
export function computePorphyryCusps(observer) {
  const { julianDay, latitude } = observer;
  const jdTT = julianDay + computeDeltaT(julianDay) / 86400;
  const T = computeJulianCentury(jdTT);
  
  // Apparent obliquity and sidereal time (including nutation)
  const omega = (125.04452 - 1934.136261 * T) * DEG_TO_RAD;
  const deltaEpsilon = 0.002556 * Math.cos(omega);
  const deltaPsi = -0.00478 * Math.sin(omega);
  const epsilon = (23.439291 - 0.0130042 * T + deltaEpsilon) * DEG_TO_RAD;
  
  // RAMC (Right Ascension of Midheaven)
  const GMST = normalizeDegrees(280.46061837 + 360.98564736629 * (julianDay - 2451545.0));
  const RAMC = GMST + deltaPsi * Math.cos(epsilon) + observer.longitude;
  const RAMC_rad = RAMC * DEG_TO_RAD;
  
  // Calculate MC (House 10)
  const mc = normalizeDegrees(Math.atan2(Math.sin(RAMC_rad), Math.cos(RAMC_rad) * Math.cos(epsilon)) * RAD_TO_DEG);
  
  // Calculate Ascendant (House 1)
  const lat_rad = latitude * DEG_TO_RAD;
  const asc = normalizeDegrees(Math.atan2(
    Math.cos(RAMC_rad),
    -(Math.sin(RAMC_rad) * Math.cos(epsilon) + Math.tan(lat_rad) * Math.sin(epsilon))
  ) * RAD_TO_DEG);
  
  // Calculate IC (House 4) and Descendant (House 7)
  const ic = normalizeDegrees(mc + 180);
  const desc = normalizeDegrees(asc + 180);
  
  // Quadrant 1: Asc (H1) to IC (H4)
  const quad1Span = normalizeDegrees(ic - asc);
  const q1Third = quad1Span / 3;
  
  // Quadrant 4: MC (H10) to Asc (H1)
  const quad4Span = normalizeDegrees(asc - mc);
  const q4Third = quad4Span / 3;
  
  const cusps = [
    asc,                                // House 1
    normalizeDegrees(asc + q1Third),    // House 2
    normalizeDegrees(asc + 2 * q1Third),// House 3
    ic,                                 // House 4
    normalizeDegrees(ic + q4Third),     // House 5
    normalizeDegrees(ic + 2 * q4Third), // House 6
    desc,                               // House 7
    normalizeDegrees(desc + q1Third),   // House 8
    normalizeDegrees(desc + 2 * q1Third),// House 9
    mc,                                 // House 10
    normalizeDegrees(mc + q4Third),     // House 11
    normalizeDegrees(mc + 2 * q4Third)  // House 12
  ];
  
  return {
    system: "porphyry",
    cusps: cusps.map(c => round(c, 4)),
    ascendant: round(asc, 4),
    midheaven: round(mc, 4)
  };
}

// Koch house cusp calculation
export function computeKochCusps(observer) {
  const { julianDay, latitude } = observer;
  const jdTT = julianDay + computeDeltaT(julianDay) / 86400;
  const T = computeJulianCentury(jdTT);
  
  const epsilon = (23.439291 - 0.0130042 * T) * DEG_TO_RAD;
  const GMST = normalizeDegrees(280.46061837 + 360.98564736629 * (julianDay - 2451545.0));
  const RAMC = GMST + observer.longitude;
  const RAMC_rad = RAMC * DEG_TO_RAD;
  const lat_rad = latitude * DEG_TO_RAD;
  
  // Calculate MC
  const mc = normalizeDegrees(Math.atan2(Math.sin(RAMC_rad), Math.cos(RAMC_rad) * Math.cos(epsilon)) * RAD_TO_DEG);
  
  // Calculate Ascendant
  const asc = normalizeDegrees(Math.atan2(
    -Math.cos(RAMC_rad),
    Math.sin(RAMC_rad) * Math.cos(epsilon) + Math.tan(lat_rad) * Math.sin(epsilon)
  ) * RAD_TO_DEG);
  
  // Koch method: use polar elevation
  const cusps = [asc];
  
  for (let house = 2; house <= 12; house++) {
    let cusp;
    
    if (house === 10) {
      cusp = mc;
    } else if (house === 7) {
      cusp = normalizeDegrees(asc + 180);
    } else if (house === 4) {
      cusp = normalizeDegrees(mc + 180);
    } else {
      // Koch calculation
      const fraction = (house <= 6) ? (house - 1) / 3 : (house - 7) / 3;
      const RA = RAMC + fraction * 90;
      const RA_rad = RA * DEG_TO_RAD;
      
      // Calculate declination
      const decl = Math.asin(Math.sin(epsilon) * Math.sin(RA_rad)) * RAD_TO_DEG;
      
      // Polar elevation
      const polarElevation = Math.asin(Math.tan(lat_rad) * Math.tan(decl)) * RAD_TO_DEG;
      
      const OA = RA + polarElevation;
      const OA_rad = OA * DEG_TO_RAD;
      const decl_rad = decl * DEG_TO_RAD;
      
      cusp = normalizeDegrees(Math.atan2(
        Math.sin(OA_rad) * Math.cos(epsilon) + Math.tan(decl_rad) * Math.sin(epsilon),
        Math.cos(OA_rad)
      ) * RAD_TO_DEG);
    }
    
    cusps.push(cusp);
  }
  
  return {
    system: "koch",
    cusps: cusps.map(c => round(c, 4)),
    ascendant: round(asc, 4),
    midheaven: round(mc, 4)
  };
}

// Intercepted sign detection
export function detectInterceptedSigns(cusps) {
  const intercepted = [];
  
  for (let i = 0; i < cusps.length; i++) {
    const next = (i + 1) % cusps.length;
    const span = ((cusps[next] - cusps[i]) + 360) % 360;
    
    if (span > 30) {
      // This house spans more than 30 degrees - may contain intercepted signs
      const startSign = Math.floor(cusps[i] / 30);
      const endSign = Math.floor(cusps[next] / 30);
      
      // Check for signs completely contained within this house
      for (let sign = 0; sign < 12; sign++) {
        if (sign === startSign || sign === endSign) continue;
        
        const signStart = sign * 30;
        const signEnd = signStart + 30;
        // To check if a sign is within a house, we normalize everything relative to the house start cusp
        const normalizedSignStart = (signStart - cusps[i] + 360) % 360;
        let normalizedSignEnd = (signEnd - cusps[i] + 360) % 360;
        if (normalizedSignEnd === 0) normalizedSignEnd = 360;
        
        // If the sign crosses Aries (0 degrees), the normalized start might be higher than the normalized end.
        // We know a sign is 30 degrees long. So if it's within the house span, the normalized start must be > 0 and normalized start + 30 <= span.
        const inHouse = (normalizedSignStart > 0 && (normalizedSignStart + 30) <= span);
        
        if (inHouse) {
          intercepted.push({
            house: i + 1,
            sign: ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
                   "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"][sign],
            signIndex: sign
          });
        }
      }
    }
  }
  
  return intercepted;
}

// ===== PHASE 6: VARIABLE ORBS + RECEPTIONS + ALMUTEN + BOUNDS =====

// Variable orbs based on planet speed
export function computeVariableOrbs(planets, baseOrbs = {
  conjunction: 8,
  opposition: 8,
  trine: 6,
  square: 6,
  sextile: 4
}) {
  const luminaryBodies = new Set(["sun", "moon"]);
  const slowBodies = new Set(["saturn", "uranus", "neptune", "pluto"]);
  
  const aspects = [];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const dist = Math.abs(normalizeDegrees(planets[i].tropicalLongitude) - 
                           normalizeDegrees(planets[j].tropicalLongitude));
      const shortestDist = Math.min(dist, 360 - dist);
      
      // Determine orb based on planet types
      let orbMultiplier = 1.0;
      
      if (luminaryBodies.has(planets[i].body) || luminaryBodies.has(planets[j].body)) {
        orbMultiplier = 1.2; // Luminaries get wider orbs
      } else if (slowBodies.has(planets[i].body) || slowBodies.has(planets[j].body)) {
        orbMultiplier = 0.8; // Slow planets get tighter orbs
      }
      
      // Check each aspect type
      for (const [aspectType, baseOrb] of Object.entries(baseOrbs)) {
        const adjustedOrb = baseOrb * orbMultiplier;
        const aspectAngle = {
          conjunction: 0,
          opposition: 180,
          trine: 120,
          square: 90,
          sextile: 60
        }[aspectType];
        
        if (Math.abs(shortestDist - aspectAngle) <= adjustedOrb) {
          aspects.push({
            bodyA: planets[i].body,
            bodyB: planets[j].body,
            aspectType,
            angle: aspectAngle,
            orb: round(Math.abs(shortestDist - aspectAngle), 2),
            adjustedOrb: round(adjustedOrb, 2),
            orbMultiplier
          });
        }
      }
    }
  }
  
  return aspects;
}

// Planetary receptions
export function computeReceptions(planets) {
  const receptions = [];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planetA = planets[i];
      const planetB = planets[j];
      
      const signA = Math.floor(normalizeDegrees(planetA.tropicalLongitude) / 30);
      const signB = Math.floor(normalizeDegrees(planetB.tropicalLongitude) / 30);
      
      const rulerA = SIGN_RULERS[["aries", "taurus", "gemini", "cancer", "leo", "virgo",
                                   "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"][signA]];
      const rulerB = SIGN_RULERS[["aries", "taurus", "gemini", "cancer", "leo", "virgo",
                                   "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"][signB]];
      
      // Check if A receives B (A is in sign ruled by B)
      if (rulerA === planetB.body) {
        receptions.push({
          type: "reception",
          receiver: planetA.body,
          received: planetB.body,
          strength: "strong"
        });
      }
      
      // Check if B receives A (B is in sign ruled by A)
      if (rulerB === planetA.body) {
        receptions.push({
          type: "reception",
          receiver: planetB.body,
          received: planetA.body,
          strength: "strong"
        });
      }
      
      // Check mutual reception
      if (rulerA === planetB.body && rulerB === planetA.body) {
        receptions.push({
          type: "mutual_reception",
          planets: [planetA.body, planetB.body],
          strength: "very_strong"
        });
      }
    }
  }
  
  return receptions;
}

// Almuten computation
export function computeAlmuten(planets, houseCusps = null) {
  const dignityScores = {};
  
  // Initialize scores
  for (const planet of planets) {
    dignityScores[planet.body] = 0;
  }
  
  // Calculate dignity scores for each planet
  for (const planet of planets) {
    const sign = Math.floor(normalizeDegrees(planet.tropicalLongitude) / 30);
    const signName = ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
                      "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"][sign];
    
    // Check each planet's dignity in this sign
    for (const otherPlanet of planets) {
      const dignity = computeDignity(otherPlanet.body, planet.tropicalLongitude);
      
      if (dignity.dignity === "domicile") {
        dignityScores[otherPlanet.body] += 5;
      } else if (dignity.dignity === "exaltation") {
        dignityScores[otherPlanet.body] += 4;
      } else if (dignity.dignity === "triplicity") {
        dignityScores[otherPlanet.body] += 3;
      } else if (dignity.dignity === "term") {
        dignityScores[otherPlanet.body] += 2;
      } else if (dignity.dignity === "face") {
        dignityScores[otherPlanet.body] += 1;
      }
    }
  }
  
  // Find planet with highest score
  let maxScore = -Infinity;
  let almuten = null;
  const coAlmutens = [];
  
  for (const [planet, score] of Object.entries(dignityScores)) {
    if (score > maxScore) {
      maxScore = score;
      almuten = planet;
      coAlmutens.length = 0;
      coAlmutens.push(planet);
    } else if (score === maxScore) {
      coAlmutens.push(planet);
    }
  }
  
  return {
    almuten,
    score: maxScore,
    coAlmutens: coAlmutens.length > 1 ? coAlmutens : null,
    allScores: dignityScores
  };
}

// Egyptian Bounds
export const EGYPTIAN_BOUNDS = Object.freeze({
  aries: [
    { planet: "jupiter", degrees: 6 },
    { planet: "venus", degrees: 8 },
    { planet: "mercury", degrees: 8 },
    { planet: "mars", degrees: 5 },
    { planet: "saturn", degrees: 7 }
  ],
  taurus: [
    { planet: "venus", degrees: 8 },
    { planet: "mercury", degrees: 6 },
    { planet: "jupiter", degrees: 8 },
    { planet: "saturn", degrees: 5 },
    { planet: "mars", degrees: 3 }
  ],
  gemini: [
    { planet: "mercury", degrees: 7 },
    { planet: "jupiter", degrees: 6 },
    { planet: "venus", degrees: 7 },
    { planet: "mars", degrees: 6 },
    { planet: "saturn", degrees: 4 }
  ],
  cancer: [
    { planet: "mars", degrees: 6 },
    { planet: "jupiter", degrees: 7 },
    { planet: "mercury", degrees: 6 },
    { planet: "venus", degrees: 7 },
    { planet: "saturn", degrees: 4 }
  ],
  leo: [
    { planet: "jupiter", degrees: 6 },
    { planet: "venus", degrees: 5 },
    { planet: "saturn", degrees: 7 },
    { planet: "mercury", degrees: 6 },
    { planet: "mars", degrees: 6 }
  ],
  virgo: [
    { planet: "mercury", degrees: 7 },
    { planet: "venus", degrees: 10 },
    { planet: "jupiter", degrees: 4 },
    { planet: "mars", degrees: 7 },
    { planet: "saturn", degrees: 2 }
  ],
  libra: [
    { planet: "saturn", degrees: 6 },
    { planet: "venus", degrees: 8 },
    { planet: "jupiter", degrees: 7 },
    { planet: "mercury", degrees: 7 },
    { planet: "mars", degrees: 2 }
  ],
  scorpio: [
    { planet: "mars", degrees: 7 },
    { planet: "venus", degrees: 4 },
    { planet: "mercury", degrees: 8 },
    { planet: "jupiter", degrees: 5 },
    { planet: "saturn", degrees: 6 }
  ],
  sagittarius: [
    { planet: "jupiter", degrees: 12 },
    { planet: "venus", degrees: 5 },
    { planet: "mercury", degrees: 4 },
    { planet: "saturn", degrees: 5 },
    { planet: "mars", degrees: 4 }
  ],
  capricorn: [
    { planet: "mercury", degrees: 7 },
    { planet: "jupiter", degrees: 7 },
    { planet: "venus", degrees: 8 },
    { planet: "saturn", degrees: 4 },
    { planet: "mars", degrees: 4 }
  ],
  aquarius: [
    { planet: "saturn", degrees: 7 },
    { planet: "mercury", degrees: 6 },
    { planet: "venus", degrees: 6 },
    { planet: "jupiter", degrees: 6 },
    { planet: "mars", degrees: 5 }
  ],
  pisces: [
    { planet: "venus", degrees: 8 },
    { planet: "jupiter", degrees: 6 },
    { planet: "mercury", degrees: 6 },
    { planet: "mars", degrees: 5 },
    { planet: "saturn", degrees: 5 }
  ]
});

export function computeEgyptianBound(tropicalLongitude) {
  const sign = Math.floor(normalizeDegrees(tropicalLongitude) / 30);
  const degreeInSign = normalizeDegrees(tropicalLongitude) % 30;
  const signName = ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
                    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"][sign];
  
  const bounds = EGYPTIAN_BOUNDS[signName];
  let cumulative = 0;
  
  for (const bound of bounds) {
    cumulative += bound.degrees;
    if (degreeInSign < cumulative) {
      return {
        sign: signName,
        planet: bound.planet,
        startDegree: cumulative - bound.degrees,
        endDegree: cumulative,
        degreeInSign: round(degreeInSign, 2)
      };
    }
  }
  
  return null;
}

// Ptolemaic Terms
export const PTOLEMAIC_TERMS = Object.freeze({
  aries: [
    { planet: "jupiter", degrees: 6 },
    { planet: "venus", degrees: 7 },
    { planet: "mercury", degrees: 8 },
    { planet: "mars", degrees: 5 },
    { planet: "saturn", degrees: 4 }
  ],
  taurus: [
    { planet: "venus", degrees: 8 },
    { planet: "mercury", degrees: 6 },
    { planet: "jupiter", degrees: 7 },
    { planet: "saturn", degrees: 5 },
    { planet: "mars", degrees: 4 }
  ],
  gemini: [
    { planet: "mercury", degrees: 7 },
    { planet: "jupiter", degrees: 6 },
    { planet: "venus", degrees: 6 },
    { planet: "mars", degrees: 6 },
    { planet: "saturn", degrees: 5 }
  ],
  cancer: [
    { planet: "mars", degrees: 7 },
    { planet: "venus", degrees: 6 },
    { planet: "mercury", degrees: 6 },
    { planet: "jupiter", degrees: 6 },
    { planet: "saturn", degrees: 5 }
  ],
  leo: [
    { planet: "jupiter", degrees: 6 },
    { planet: "venus", degrees: 6 },
    { planet: "saturn", degrees: 6 },
    { planet: "mercury", degrees: 6 },
    { planet: "mars", degrees: 5 }
  ],
  virgo: [
    { planet: "mercury", degrees: 7 },
    { planet: "venus", degrees: 6 },
    { planet: "jupiter", degrees: 6 },
    { planet: "saturn", degrees: 5 },
    { planet: "mars", degrees: 6 }
  ],
  libra: [
    { planet: "saturn", degrees: 6 },
    { planet: "mercury", degrees: 6 },
    { planet: "jupiter", degrees: 7 },
    { planet: "venus", degrees: 5 },
    { planet: "mars", degrees: 6 }
  ],
  scorpio: [
    { planet: "mars", degrees: 7 },
    { planet: "venus", degrees: 5 },
    { planet: "mercury", degrees: 6 },
    { planet: "jupiter", degrees: 6 },
    { planet: "saturn", degrees: 6 }
  ],
  sagittarius: [
    { planet: "jupiter", degrees: 8 },
    { planet: "venus", degrees: 6 },
    { planet: "mercury", degrees: 6 },
    { planet: "saturn", degrees: 5 },
    { planet: "mars", degrees: 5 }
  ],
  capricorn: [
    { planet: "mercury", degrees: 7 },
    { planet: "jupiter", degrees: 7 },
    { planet: "venus", degrees: 6 },
    { planet: "saturn", degrees: 5 },
    { planet: "mars", degrees: 5 }
  ],
  aquarius: [
    { planet: "saturn", degrees: 7 },
    { planet: "mercury", degrees: 6 },
    { planet: "venus", degrees: 6 },
    { planet: "jupiter", degrees: 6 },
    { planet: "mars", degrees: 5 }
  ],
  pisces: [
    { planet: "venus", degrees: 8 },
    { planet: "jupiter", degrees: 6 },
    { planet: "mercury", degrees: 6 },
    { planet: "mars", degrees: 5 },
    { planet: "saturn", degrees: 5 }
  ]
});

export function computePtolemaicTerm(tropicalLongitude) {
  const sign = Math.floor(normalizeDegrees(tropicalLongitude) / 30);
  const degreeInSign = normalizeDegrees(tropicalLongitude) % 30;
  const signName = ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
                    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"][sign];
  
  const terms = PTOLEMAIC_TERMS[signName];
  let cumulative = 0;
  
  for (const term of terms) {
    cumulative += term.degrees;
    if (degreeInSign < cumulative) {
      return {
        sign: signName,
        planet: term.planet,
        startDegree: cumulative - term.degrees,
        endDegree: cumulative,
        degreeInSign: round(degreeInSign, 2)
      };
    }
  }
  
  return null;
}

// ===== PHASE 7: STATIONARY PLANETS + ECLIPSES =====

// Compute planetary velocity (degrees per day)
export function computePlanetaryVelocity(observer, body) {
  const step = 1; // 1 day
  const prevJd = observer.julianDay - step;
  const nextJd = observer.julianDay + step;
  
  let prevLon, nextLon;
  
  if (body === "north_node") {
    prevLon = computeMeanNorthNode(prevJd).tropicalLongitude;
    nextLon = computeMeanNorthNode(nextJd).tropicalLongitude;
  } else if (body === "lilith") {
    prevLon = computeMeanLilith(prevJd).tropicalLongitude;
    nextLon = computeMeanLilith(nextJd).tropicalLongitude;
  } else if (body === "chiron") {
    prevLon = computeChiron(prevJd).tropicalLongitude;
    nextLon = computeChiron(nextJd).tropicalLongitude;
  } else if (["uranus", "neptune", "pluto"].includes(body)) {
    // Use outer planet calculation
    const prevObserver = { ...observer, julianDay: prevJd };
    const nextObserver = { ...observer, julianDay: nextJd };
    const T_prev = computeJulianCentury(prevJd + computeDeltaT(prevJd) / 86400);
    const T_next = computeJulianCentury(nextJd + computeDeltaT(nextJd) / 86400);
    
    const prevXYZ = getOuterPlanetHeliocentricXYZ(body, T_prev);
    const nextXYZ = getOuterPlanetHeliocentricXYZ(body, T_next);
    
    // Compute geocentric coordinates
    const prevSunLon = computeSolarLongitude(prevJd) * DEG_TO_RAD;
    const nextSunLon = computeSolarLongitude(nextJd) * DEG_TO_RAD;
    const earth_x_prev = -Math.cos(prevSunLon);
    const earth_y_prev = -Math.sin(prevSunLon);
    const earth_x_next = -Math.cos(nextSunLon);
    const earth_y_next = -Math.sin(nextSunLon);
    
    prevLon = normalizeDegrees(Math.atan2(prevXYZ.y - earth_y_prev, prevXYZ.x - earth_x_prev) * RAD_TO_DEG);
    nextLon = normalizeDegrees(Math.atan2(nextXYZ.y - earth_y_next, nextXYZ.x - earth_x_next) * RAD_TO_DEG);
  } else {
    // For sun, moon, and inner planets - use existing functions
    return { velocity: 0, status: "unknown" };
  }
  
  const diff = ((nextLon - prevLon + 540) % 360) - 180;
  const velocity = diff / (2 * step);
  
  let status = "direct";
  if (Math.abs(velocity) < 0.05) {
    status = "stationary";
  } else if (velocity < 0) {
    status = "retrograde";
  }
  
  return {
    velocity: round(velocity, 4),
    status,
    isStationary: status === "stationary",
    isRetrograde: status === "retrograde"
  };
}

// Detect all stationary planets
export function detectStationaryPlanets(observer) {
  const bodies = ["north_node", "lilith", "chiron", "uranus", "neptune", "pluto"];
  const stationary = [];
  
  for (const body of bodies) {
    const result = computePlanetaryVelocity(observer, body);
    if (result.isStationary) {
      stationary.push({
        body,
        velocity: result.velocity,
        status: result.status
      });
    }
  }
  
  return stationary;
}

// Compute eclipse conditions
export function computeEclipseConditions(observer) {
  const northNode = computeMeanNorthNode(observer.julianDay);
  const southNode = { tropicalLongitude: normalizeDegrees(northNode.tropicalLongitude + 180) };
  
  // Get actual Sun and Moon positions for accurate eclipse checking
  // If observer doesn't have topocentric coords, default to center of Earth (0,0,0)
  const safeObserver = {
    julianDay: observer.julianDay,
    latitude: observer.latitude || 0,
    longitude: observer.longitude || 0,
    altitudeMeters: observer.altitudeMeters || 0
  };
  
  const snapshot = computeTopocentricPlanetarySnapshot(safeObserver);
  const sunLon = snapshot.find(b => b.body === "sun").tropicalLongitude;
  const moonLon = snapshot.find(b => b.body === "moon").tropicalLongitude;
  
  return {
    northNode: northNode.tropicalLongitude,
    southNode: southNode.tropicalLongitude,
    sun: sunLon,
    moon: moonLon,
    nodeAxis: {
      north: northNode.tropicalLongitude,
      south: southNode.tropicalLongitude
    }
  };
}

// Check if eclipse is possible (sun/moon near nodes)
export function isEclipsePossible(sunLongitude, moonLongitude, nodeLongitude, orb = 18) {
  const sunDistToNode = Math.min(
    Math.abs(sunLongitude - nodeLongitude),
    360 - Math.abs(sunLongitude - nodeLongitude)
  );
  
  const moonDistToNode = Math.min(
    Math.abs(moonLongitude - nodeLongitude),
    360 - Math.abs(moonLongitude - nodeLongitude)
  );
  
  return {
    solarEclipsePossible: sunDistToNode <= orb && moonDistToNode <= orb,
    lunarEclipsePossible: sunDistToNode <= orb && moonDistToNode <= orb,
    sunDistance: round(sunDistToNode, 2),
    moonDistance: round(moonDistToNode, 2)
  };
}

// Compute Saros cycle (approximate)
export function computeSarosCycle(julianDay) {
  const sarosPeriod = 6585.3211; // days
  const sarosNumber = Math.floor((julianDay - 2451545.0) / sarosPeriod);
  const sarosCycle = sarosNumber % 223; // Saros series repeat every 223 cycles
  
  return {
    sarosNumber,
    sarosCycle,
    daysSinceEpoch: round((julianDay - 2451545.0), 2)
  };
}

// ===== PHASE 8: FIXED STARS + BARBAULT SYNTHETIC INDEX =====

// Fixed star catalog (J2000 epoch positions)
export const FIXED_STARS = Object.freeze({
  aldebaran: { ra: 68.9816, dec: 16.5093, magnitude: 0.85, name: "Aldebaran" },
  antares: { ra: 247.3519, dec: -26.4320, magnitude: 0.96, name: "Antares" },
  arcturus: { ra: 213.9153, dec: 19.1824, magnitude: -0.05, name: "Arcturus" },
  betelgeuse: { ra: 88.7929, dec: 7.4071, magnitude: 0.42, name: "Betelgeuse" },
  capella: { ra: 79.1723, dec: 45.9980, magnitude: 0.08, name: "Capella" },
  deneb: { ra: 310.3580, dec: 45.2803, magnitude: 1.25, name: "Deneb" },
  fomalhaut: { ra: 344.4127, dec: -29.6222, magnitude: 1.16, name: "Fomalhaut" },
  pollux: { ra: 116.3289, dec: 28.0262, magnitude: 1.14, name: "Pollux" },
  procyon: { ra: 114.8255, dec: 5.2250, magnitude: 0.34, name: "Procyon" },
  rigel: { ra: 78.6345, dec: -8.2016, magnitude: 0.18, name: "Rigel" },
  regulus: { ra: 152.0930, dec: 11.9672, magnitude: 1.35, name: "Regulus" },
  sirius: { ra: 101.2875, dec: -16.7161, magnitude: -1.46, name: "Sirius" },
  spica: { ra: 201.2983, dec: -11.1614, magnitude: 0.97, name: "Spica" },
  vega: { ra: 279.2347, dec: 38.7837, magnitude: 0.03, name: "Vega" },
  aldebaran: { ra: 68.9816, dec: 16.5093, magnitude: 0.85, name: "Aldebaran" }
});

// Compute fixed star position with precession correction
export function computeFixedStarPosition(starName, julianDay) {
  const star = FIXED_STARS[(starName || '').toLowerCase()];
  if (!star) {
    return null;
  }
  
  // Calculate years from J2000
  const T = (julianDay - 2451545.0) / 365.25;
  
  // General precession in longitude from J2000 (Meeus Chapter 21, simplified to ecliptic longitude)
  const p = 1.39697128 * T + 0.00030878 * T * T; // Degrees
  
  // Convert J2000 RA/Dec to Ecliptic Longitude/Latitude at J2000
  const epsilon2000 = 23.4392911 * DEG_TO_RAD; // Obliquity at J2000
  const raRad = star.ra * DEG_TO_RAD;
  const decRad = star.dec * DEG_TO_RAD;
  
  const sinLon = Math.sin(raRad) * Math.cos(epsilon2000) + Math.tan(decRad) * Math.sin(epsilon2000);
  const cosLon = Math.cos(raRad);
  
  const longitudeJ2000 = Math.atan2(sinLon, cosLon) * RAD_TO_DEG;
  const longitude = normalizeDegrees(longitudeJ2000 + p);
  
  // Approximate RA/Dec at epoch for display purposes
  const raCorrection = (3.07496 + 1.33617 * Math.sin(raRad) * Math.tan(decRad)) * T / 3600;
  const decCorrection = (1.33617 * Math.cos(raRad)) * T / 3600;
  const correctedRA = star.ra + raCorrection;
  const correctedDec = star.dec + decCorrection;
  
  return {
    star: star.name,
    tropicalLongitude: round(longitude, 4),
    magnitude: star.magnitude,
    ra: round(correctedRA, 4),
    dec: round(correctedDec, 4)
  };
}

// Compute aspects from fixed stars to planets
export function computeFixedStarAspects(planets, julianDay, orb = 1.0) {
  const aspects = [];
  
  for (const starName of Object.keys(FIXED_STARS)) {
    const starPos = computeFixedStarPosition(starName, julianDay);
    if (!starPos) continue;
    
    for (const planet of planets) {
      const dist = Math.abs(normalizeDegrees(planet.tropicalLongitude) - starPos.tropicalLongitude);
      const shortestDist = Math.min(dist, 360 - dist);
      
      if (shortestDist <= orb) {
        aspects.push({
          star: starPos.star,
          planet: planet.body,
          orb: round(shortestDist, 2),
          starLongitude: starPos.tropicalLongitude,
          planetLongitude: planet.tropicalLongitude,
          magnitude: starPos.magnitude
        });
      }
    }
  }
  
  return aspects;
}

// Get all fixed star positions for a date
export function getAllFixedStarPositions(julianDay) {
  const positions = [];
  
  for (const starName of Object.keys(FIXED_STARS)) {
    const pos = computeFixedStarPosition(starName, julianDay);
    if (pos) {
      positions.push(pos);
    }
  }
  
  return positions;
}

// Barbault synthetic index calculation
export function computeBarbaultSyntheticIndex(julianDay) {
  // Calculate years from J2000
  const T = (julianDay - 2451545.0) / 365.25;
  
  // Key planetary cycles from Barbault (in years)
  const cycles = {
    jupiterSaturn: 19.86,
    jupiterUranus: 14.06,
    jupiterNeptune: 12.78,
    saturnUranus: 45.36,
    saturnNeptune: 35.87,
    uranusNeptune: 83.96
  };
  
  // Calculate phase for each cycle (0-1, always positive)
  const phases = {};
  for (const [name, period] of Object.entries(cycles)) {
    let phase = (T % period) / period;
    // Ensure phase is always positive (0-1)
    if (phase < 0) phase += 1;
    phases[name] = phase;
  }
  
  // Calculate synthetic index (weighted average)
  // Barbault weights: outer planet conjunctions are most significant
  const weights = {
    jupiterSaturn: 3,
    jupiterUranus: 2,
    jupiterNeptune: 2,
    saturnUranus: 1,
    saturnNeptune: 1,
    uranusNeptune: 1
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const [name, phase] of Object.entries(phases)) {
    // Convert phase to 0-100 scale
    // 0 = conjunction (start), 50 = opposition (middle), 100 = next conjunction
    let value;
    if (phase < 0.5) {
      value = phase * 200; // 0-0.5 -> 0-100
    } else {
      value = (1 - phase) * 200; // 0.5-1 -> 100-0
    }
    
    // Ensure value is in 0-100 range
    value = Math.max(0, Math.min(100, value));
    
    weightedSum += value * weights[name];
    totalWeight += weights[name];
  }
  
  const syntheticIndex = weightedSum / totalWeight;
  
  // Ensure final index is in 0-100 range
  const clampedIndex = Math.max(0, Math.min(100, syntheticIndex));
  
  // Interpretation
  let interpretation;
  if (clampedIndex < 25) {
    interpretation = "crisis_point";
  } else if (clampedIndex < 50) {
    interpretation = "decline";
  } else if (clampedIndex < 75) {
    interpretation = "expansion";
  } else {
    interpretation = "peak";
  }
  
  return {
    syntheticIndex: round(clampedIndex, 2),
    interpretation,
    phases: Object.fromEntries(Object.entries(phases).map(([k, v]) => [k, round(v * 360, 2)])),
    cycles
  };
}

// Compute Barbault index for a date range
export function computeBarbaultIndexRange(startJd, endJd, step = 30) {
  const results = [];
  
  for (let jd = startJd; jd <= endJd; jd += step) {
    const index = computeBarbaultSyntheticIndex(jd);
    results.push({
      julianDay: round(jd, 2),
      syntheticIndex: index.syntheticIndex,
      interpretation: index.interpretation
    });
  }
  
  return results;
}

/**
 * Computes Western transit aspect score delta between transiting planets and natal positions.
 *
 * @param {Array<{ body: string, tropicalLongitude: number }>} natalPlanets
 * @param {Array<{ body: string, tropicalLongitude: number }>} transitPlanets
 * @returns {number}
 */
export function calculateWesternTransitAspects(natalPlanets, transitPlanets) {
  if (!Array.isArray(natalPlanets) || !Array.isArray(transitPlanets)) {
    throw new TypeError("natalPlanets and transitPlanets must be arrays");
  }

  const targetAspects = [
    { angle: 0, orb: 8, value: 5 },
    { angle: 60, orb: 5, value: 5 },
    { angle: 90, orb: 6, value: -5 },
    { angle: 120, orb: 6, value: 5 },
    { angle: 180, orb: 8, value: -5 }
  ];

  function angularDistance(a, b) {
    const delta = Math.abs((a % 360) - (b % 360));
    return Math.min(delta, 360 - delta);
  }

  let totalDelta = 0;
  const majorBodies = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];

  for (const transitPlanet of transitPlanets) {
    const tBody = (transitPlanet?.body || '').toLowerCase();
    if (!majorBodies.includes(tBody)) continue;

    for (const natalPlanet of natalPlanets) {
      const nBody = (natalPlanet?.body || '').toLowerCase();
      if (!majorBodies.includes(nBody)) continue;

      const dist = angularDistance(transitPlanet.tropicalLongitude, natalPlanet.tropicalLongitude);

      for (const aspect of targetAspects) {
        if (Math.abs(dist - aspect.angle) <= aspect.orb) {
          totalDelta += aspect.value;
          break;
        }
      }
    }
  }

  return Math.max(-15, Math.min(15, totalDelta));
}
