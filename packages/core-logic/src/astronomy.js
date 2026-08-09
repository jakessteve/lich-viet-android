import { julianDayToUnixMs, unixMsToJulianDay } from "./time.js";

export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const PLANETARY_ELEMENTS = Object.freeze({
  mercury: {
    a: [0.38709893, 0],
    e: [0.20563069, 0.00002040],
    I: [7.00487, 0.00607],
    L: [252.25084, 149472.67411],
    w: [77.45645, 0.15901],
    node: [48.33167, -0.12530]
  },
  venus: {
    a: [0.72333199, 0],
    e: [0.00677323, -0.00004776],
    I: [3.39471, 0.00079],
    L: [181.97973, 58517.81538],
    w: [131.53298, 0.00213],
    node: [76.68069, -0.27769]
  },
  earth: {
    a: [1.00000261, -0.00000003],
    e: [0.01671123, -0.00003661],
    I: [-0.00001531, -0.01294668],
    L: [100.46457166, 35999.37244981],
    w: [102.93768193, 0.31795260],
    node: [0, 0]
  },
  mars: {
    a: [1.52366231, 0],
    e: [0.09341233, 0.00011902],
    I: [1.85061, -0.00724],
    L: [355.45332, 19140.30268],
    w: [336.04084, 0.44388],
    node: [49.57854, -0.29217]
  },
  jupiter: {
    a: [5.20336301, 0.00060737],
    e: [0.04839266, -0.00012880],
    I: [1.30530, -0.00415],
    L: [34.40438, 3034.74612],
    w: [14.75385, 0.19112],
    node: [100.55615, 0.20397]
  },
  saturn: {
    a: [9.53707032, -0.00301530],
    e: [0.05415060, -0.00036762],
    I: [2.48446, 0.00193],
    L: [49.94432, 1222.11379],
    w: [92.43194, -0.41897],
    node: [113.71504, -0.36841]
  }
});

export function solveKepler(M, e) {
  let E = M;
  let delta = 1;
  let iterations = 0;
  while (Math.abs(delta) > 1e-8 && iterations < 20) {
    delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
    iterations++;
  }
  return E;
}

function getHeliocentricXYZ(planet, T) {
  const elem = PLANETARY_ELEMENTS[planet];
  const a = elem.a[0] + elem.a[1] * T;
  const rawE = elem.e[0] + elem.e[1] * T;
  // Clamp eccentricity to [0, 0.99] to prevent hyperbolic/parabolic orbit math failures
  const e = Math.max(0.0, Math.min(0.99, rawE));
  const I = (elem.I[0] + elem.I[1] * T) * DEG_TO_RAD;
  const L = elem.L[0] + elem.L[1] * T;
  const w = elem.w[0] + elem.w[1] * T;
  const node = (elem.node[0] + elem.node[1] * T) * DEG_TO_RAD;

  const M = normalizeDegrees(L - w) * DEG_TO_RAD;
  const E = solveKepler(M, e);

  const x_prime = a * (Math.cos(E) - e);
  const y_prime = a * Math.sqrt(1 - e * e) * Math.sin(E);

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

export function assertFiniteNumber(value, fieldName) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${fieldName} must be a finite number`);
  }
}

function assertLatitude(value) {
  assertFiniteNumber(value, "latitude");

  if (value < -90 || value > 90) {
    throw new RangeError("latitude must be between -90 and 90 degrees");
  }
}

function assertLongitude(value) {
  assertFiniteNumber(value, "longitude");

  if (value < -180 || value > 180) {
    throw new RangeError("longitude must be between -180 and 180 degrees");
  }
}

export function normalizeDegrees(angle) {
  assertFiniteNumber(angle, "angle");
  return ((angle % 360) + 360) % 360;
}

function shortestAngleDifference(target, current) {
  const normalized = normalizeDegrees(target) - normalizeDegrees(current);
  if (normalized > 180) {
    return normalized - 360;
  }
  if (normalized < -180) {
    return normalized + 360;
  }
  return normalized;
}

export function computeDeltaT(julianDay) {
  assertFiniteNumber(julianDay, "julianDay");
  const unixMs = julianDayToUnixMs(julianDay);
  const date = new Date(unixMs);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const y = year + (month - 0.5) / 12;

  if (y < 1600) {
    const u = (y - 1000) / 100;
    return (
      1574.2 -
      556.01 * u +
      71.23472 * u * u +
      0.319781 * u * u * u -
      0.8503463 * u * u * u * u -
      0.005050998 * u * u * u * u * u +
      0.0083572073 * u * u * u * u * u * u
    );
  } else if (y < 1700) {
    const t = y - 1600;
    return 120 - 0.9808 * t - 0.01532 * t * t + (t * t * t) / 7129;
  } else if (y < 1800) {
    const t = y - 1700;
    return (
      8.83 +
      0.1603 * t -
      0.0059285 * t * t +
      0.00013336 * t * t * t -
      (t * t * t * t) / 1174000
    );
  } else if (y < 1860) {
    const t = y - 1800;
    return (
      13.72 -
      0.332447 * t +
      0.0068612 * t * t +
      0.0041116 * t * t * t -
      0.00037436 * t * t * t * t +
      0.0000121272 * t * t * t * t * t -
      0.0000001699 * t * t * t * t * t * t +
      0.000000000875 * t * t * t * t * t * t * t
    );
  } else if (y < 1900) {
    const t = y - 1860;
    return (
      7.62 +
      0.5737 * t -
      0.251754 * t * t +
      0.01680668 * t * t * t -
      0.0004473624 * t * t * t * t +
      (t * t * t * t * t) / 233174
    );
  } else if (y < 1920) {
    const t = y - 1900;
    return -2.7249 + 1.01453 * t - 0.0223507 * t * t + 0.0009039 * t * t * t;
  } else if (y < 1941) {
    const t = y - 1920;
    return 21.2 + 0.84493 * t - 0.0761 * t * t + 0.0020936 * t * t * t;
  } else if (y < 1961) {
    const t = y - 1950;
    return 29.07 + 0.407 * t - (t * t) / 233 + (t * t * t) / 2547;
  } else if (y < 1986) {
    const t = y - 1975;
    return 45.45 + 1.067 * t - (t * t) / 260 - (t * t * t) / 718;
  } else if (y < 2005) {
    const t = y - 2000;
    return (
      63.86 +
      0.3345 * t -
      0.060374 * t * t +
      0.0017275 * t * t * t +
      0.000651814 * t * t * t * t +
      0.00002373599 * t * t * t * t * t
    );
  } else if (y < 2050) {
    const t = y - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t * t;
  } else {
    const u = (y - 1820) / 100;
    return -20 + 32 * u * u - 0.5628 * (y - 2150);
  }
}

export function computeJulianCentury(julianDay) {
  assertFiniteNumber(julianDay, "julianDay");
  const T = (julianDay - 2451545) / 36525;
  // Clamp T to +/- 100 centuries (10,000 years) for extrapolation safety
  return Math.max(-100, Math.min(100, T));
}


export function computeTrueLunarPosition(julianDay) {
  const jdTT = julianDay + computeDeltaT(julianDay) / 86400;
  const T = computeJulianCentury(jdTT);
  
  // Mean elements (Meeus Ch 47)
  let L_prime = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841.0 - T * T * T * T / 65194000.0;
  let D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868.0 - T * T * T * T / 113065000.0;
  let M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000.0;
  let M_prime = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699.0 - T * T * T * T / 14712000.0;
  let F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000.0 + T * T * T * T / 863310000.0;

  // Normalize
  L_prime = normalizeDegrees(L_prime);
  D = normalizeDegrees(D) * DEG_TO_RAD;
  M = normalizeDegrees(M) * DEG_TO_RAD;
  M_prime = normalizeDegrees(M_prime) * DEG_TO_RAD;
  F = normalizeDegrees(F) * DEG_TO_RAD;

  // eccentricity parameter E
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;

  const lonTerms = [
    [22640,0,0,1,0], [-4586,2,0,-1,0], [2370,2,0,0,0], [769,0,0,2,0],
    [-668,0,1,0,0], [-412,2,0,-2,0], [-212,2,-1,-1,0], [-206,2,0,1,0],
    [212,2,1,-1,0], [-165,0,0,1,-2], [-125,1,0,0,0], [-110,0,1,1,0],
    [148,0,-1,1,0], [-55,2,0,0,-2], [-45,2,0,-3,0], [40,0,0,3,0],
    [-38,2,1,0,0], [28,0,-1,2,0], [-24,0,1,-1,0], [24,2,-1,0,0],
    [18,0,-1,0,0], [15,2,0,2,0], [15,4,0,-1,0], [-14,0,2,0,0],
    [14,2,0,-1,-2], [-14,0,0,2,-2], [-11,4,0,-2,0], [11,2,1,-2,0],
    [-9,2,-1,-2,0], [-8,2,-1,1,0], [7,0,1,2,0], [-7,2,2,-1,0],
    [-7,2,-2,0,0], [6,4,0,0,0], [6,2,0,1,-2], [6,2,-1,0,-2],
    [-6,4,0,-2,0], [5,2,0,3,0], [-5,0,0,-1,2], [-5,2,1,1,0],
    [4,0,-2,1,0], [4,2,0,0,2], [4,0,1,0,-2], [-4,2,-1,-1,-2],
    [-4,2,1,-1,-2], [-4,0,-1,1,-2], [3,0,0,-2,2]
  ];

  const latTerms = [
    [5128,0,0,0,1], [280,0,0,1,1], [277,0,0,1,-1], [173,2,0,0,-1],
    [55,2,0,-1,1], [46,2,0,-1,-1], [32,2,0,0,1], [17,0,0,2,1],
    [15,0,0,2,-1], [9,2,0,1,-1], [7,0,-1,1,1], [7,0,-1,1,-1],
    [6,2,0,-2,-1], [5,2,0,1,1], [4,2,-1,0,-1], [4,0,1,0,1],
    [3,0,1,0,-1], [3,0,-1,0,1], [3,2,0,-2,1], [3,2,0,0,-3]
  ];
  
  const distTerms = [
    [-10459,0,0,1,0], [-8,2,0,-1,0], [-712,2,0,0,0], [-57,0,0,2,0],
    [0,0,1,0,0], [-2,2,0,-2,0], [-1,2,-1,-1,0], [-2,2,0,1,0],
    [0,2,1,-1,0], [1,0,0,1,-2], [-1,1,0,0,0], [1,0,1,1,0],
    [-1,0,-1,1,0], [-1,2,0,0,-2]
  ];

  let sumLon = 0;
  let sumLat = 0;
  let sumDist = 0;

  for (const t of lonTerms) {
    const mult = (t[2] !== 0) ? Math.pow(E, Math.abs(t[2])) : 1;
    sumLon += mult * t[0] * Math.sin(t[1]*D + t[2]*M + t[3]*M_prime + t[4]*F);
  }

  for (const t of latTerms) {
    const mult = (t[2] !== 0) ? Math.pow(E, Math.abs(t[2])) : 1;
    sumLat += mult * t[0] * Math.sin(t[1]*D + t[2]*M + t[3]*M_prime + t[4]*F);
  }
  
  for (const t of distTerms) {
    const mult = (t[2] !== 0) ? Math.pow(E, Math.abs(t[2])) : 1;
    sumDist += mult * t[0] * Math.cos(t[1]*D + t[2]*M + t[3]*M_prime + t[4]*F);
  }

  // Add Venus, Jupiter, flat earth, etc corrections (A1 to A14, omitted for brevity, sum ~ 10 arcsec)
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.290 * T;
  sumLon += 3958 * Math.sin(A1 * DEG_TO_RAD) + 1962 * Math.sin((L_prime - F * RAD_TO_DEG) * DEG_TO_RAD) + 318 * Math.sin(A2 * DEG_TO_RAD);

  let trueLon = L_prime + sumLon / 1000000.0;
  const trueLat = sumLat / 1000000.0;
  const trueDist = 385000.56 + sumDist / 1000.0; // Distance in km

  // Nutation
  const omega = (125.04452 - 1934.136261 * T) * DEG_TO_RAD;
  trueLon += -0.00478 * Math.sin(omega);

  return {
    longitude: normalizeDegrees(trueLon),
    latitude: trueLat,
    distanceKm: trueDist,
    distanceAU: trueDist / 149597870.7
  };
}

export function computeSolarLongitude(julianDay) {
  const jdTT = julianDay + computeDeltaT(julianDay) / 86400;
  const T = computeJulianCentury(jdTT);
  const meanLongitude = normalizeDegrees(
    280.46646 + T * (36000.76983 + 0.0003032 * T)
  );
  const meanAnomaly = normalizeDegrees(
    357.52911 + T * (35999.05029 - 0.0001537 * T)
  );
  const meanAnomalyRad = meanAnomaly * DEG_TO_RAD;
  const equationOfCenter =
    (1.914602 - T * (0.004817 + 0.000014 * T)) * Math.sin(meanAnomalyRad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * meanAnomalyRad) +
    0.000289 * Math.sin(3 * meanAnomalyRad);

  const trueLongitude = meanLongitude + equationOfCenter;

  // Apparent longitude corrections (Meeus, Astronomical Algorithms, Ch. 25)
  // Aberration: accounts for finite speed of light (~-20.5 arcseconds)
  // Nutation in longitude: oscillatory correction from lunar nodal precession
  const omega = (125.04 - 1934.136 * T) * DEG_TO_RAD;
  const aberration = -0.00569;
  const nutationLon = -0.00478 * Math.sin(omega);

  return normalizeDegrees(trueLongitude + aberration + nutationLon);
}

function computeSolarLongitudeDerivative(julianDay) {
  const step = 1 / 24;
  const next = computeSolarLongitude(julianDay + step);
  const previous = computeSolarLongitude(julianDay - step);
  return shortestAngleDifference(next, previous) / (step * 2);
}

export function solveSolarTermBoundary({
  targetLongitude,
  startJulianDay,
  toleranceDegrees = 1e-9,
  maxIterations = 24
}) {
  assertFiniteNumber(targetLongitude, "targetLongitude");
  assertFiniteNumber(startJulianDay, "startJulianDay");

  let currentJulianDay = startJulianDay;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const currentLongitude = computeSolarLongitude(currentJulianDay);
    const delta = shortestAngleDifference(targetLongitude, currentLongitude);

    if (Math.abs(delta) <= toleranceDegrees) {
      return {
        julianDay: currentJulianDay,
        longitude: currentLongitude,
        iterations: iteration + 1
      };
    }

    const derivative = computeSolarLongitudeDerivative(currentJulianDay);
    if (!Number.isFinite(derivative) || Math.abs(derivative) < 1e-9) {
      break;
    }

    currentJulianDay += delta / derivative;
  }

  let lower = startJulianDay - 10;
  let upper = startJulianDay + 10;
  let found = false;

  for (const width of [10, 20, 30]) {
    lower = startJulianDay - width;
    upper = startJulianDay + width;
    let lowerDiff = shortestAngleDifference(targetLongitude, computeSolarLongitude(lower));

    for (let cursor = lower + 0.25; cursor <= upper; cursor += 0.25) {
      const currentDiff = shortestAngleDifference(targetLongitude, computeSolarLongitude(cursor));
      if ((lowerDiff <= 0 && currentDiff >= 0) || (lowerDiff >= 0 && currentDiff <= 0)) {
        lower = cursor - 0.25;
        upper = cursor;
        found = true;
        break;
      }
      lowerDiff = currentDiff;
    }
    if (found) {
      break;
    }
  }

  for (let iteration = 0; iteration < maxIterations * 2; iteration += 1) {
    const midpoint = (lower + upper) / 2;
    const midpointLongitude = computeSolarLongitude(midpoint);
    const midpointDiff = shortestAngleDifference(targetLongitude, midpointLongitude);

    if (Math.abs(midpointDiff) <= toleranceDegrees) {
      return {
        julianDay: midpoint,
        longitude: midpointLongitude,
        iterations: maxIterations + iteration + 1
      };
    }

    const lowerBoundaryDiff = shortestAngleDifference(targetLongitude, computeSolarLongitude(lower));
    if (
      (lowerBoundaryDiff <= 0 && midpointDiff >= 0) ||
      (lowerBoundaryDiff >= 0 && midpointDiff <= 0)
    ) {
      upper = midpoint;
    } else {
      lower = midpoint;
    }
  }

  const finalJulianDay = (lower + upper) / 2;
  return {
    julianDay: finalJulianDay,
    longitude: computeSolarLongitude(finalJulianDay),
    iterations: maxIterations * 3
  };
}

export function computeDynamicRefraction({
  elevationMeters,
  pressureMbar,
  temperatureC,
  julianDay,
  latitude
}) {
  assertFiniteNumber(elevationMeters, "elevationMeters");

  let derivedTemperature = temperatureC;
  if (derivedTemperature === undefined) {
    if (julianDay !== undefined && latitude !== undefined) {
      const unixMs = julianDayToUnixMs(julianDay);
      const date = new Date(unixMs);
      const dayOfYear = Math.floor((unixMs - Date.UTC(date.getUTCFullYear(), 0, 1)) / DAY_IN_MS) + 1;
      const latRad = latitude * DEG_TO_RAD;
      const amplitude = 12 * Math.sin(latRad);
      const meanTemp = 28 * Math.cos(latRad) - 2;
      const seasonShift = latitude >= 0 ? 172 : 355;
      const phase = (2 * Math.PI * (dayOfYear - seasonShift)) / 365.25;
      const seasonalTemp = meanTemp + amplitude * Math.cos(phase);
      derivedTemperature = seasonalTemp - 0.0065 * elevationMeters;
    } else {
      derivedTemperature = 15 - 0.0065 * elevationMeters;
    }
  }

  const derivedPressure =
    pressureMbar ??
    1013.25 * Math.pow(Math.max(0.2, 1 - 2.25577e-5 * elevationMeters), 5.25588);

  const tempKelvin = Math.max(0.1, 273.15 + derivedTemperature);
  const arcMinutes =
    34 *
    (derivedPressure / 1013.25) *
    (283.15 / tempKelvin);

  return {
    pressureMbar: round(derivedPressure, 4),
    temperatureC: round(derivedTemperature, 4),
    correctionArcMinutes: round(arcMinutes, 6),
    correctionDegrees: round(arcMinutes / 60, 8)
  };
}

export function round(value, decimals = 6) {
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
}

function computeNoaaFractionalYear(julianDay) {
  const unixMs = julianDayToUnixMs(julianDay);
  const date = new Date(unixMs);
  const year = date.getUTCFullYear();
  const startOfYearUnixMs = Date.UTC(year, 0, 1);
  const dayOfYear = Math.floor((unixMs - startOfYearUnixMs) / DAY_IN_MS) + 1;
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const fractionalHour =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  return (
    (2 * Math.PI / (isLeapYear ? 366 : 365)) *
    (dayOfYear - 1 + (fractionalHour - 12) / 24)
  );
}

function computeNoaaEquationOfTime(julianDay) {
  const gamma = computeNoaaFractionalYear(julianDay);

  return (
    229.18 *
    (
      0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma)
    )
  );
}

function computeNoaaSolarDeclination(julianDay) {
  const gamma = computeNoaaFractionalYear(julianDay);

  return (
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma)
  );
}

export function computeAyanamsa(julianDay, mode = "lahiri") {
  const jdTT = julianDay + computeDeltaT(julianDay) / 86400;
  const T = computeJulianCentury(jdTT);
  const precession = 1.39697128 * T + 0.00030878 * T * T;
  const omega = (125.04452 - 1934.136261 * T) * DEG_TO_RAD;
  const nutation = -0.004778 * Math.sin(omega);

  let baseJ2000 = 23.853056; // Lahiri default
  const normalizedMode = String(mode).toLowerCase();

  if (normalizedMode === "fagan-bradley") {
    baseJ2000 = 24.757042;
  } else if (normalizedMode === "raman") {
    baseJ2000 = 22.404222;
  } else if (normalizedMode === "krishnamurti") {
    baseJ2000 = 23.791667;
  }

  return round(normalizeDegrees(baseJ2000 + precession + nutation), 6);
}

export function computeLahiriAyanamsa(julianDay) {
  return computeAyanamsa(julianDay, "lahiri");
}

export function convertTropicalToSidereal(longitude, julianDay, ayanamsaMode = "lahiri") {
  return round(normalizeDegrees(longitude - computeAyanamsa(julianDay, ayanamsaMode)), 6);
}

export function buildTopocentricObserver({ julianDay, latitude, longitude, altitudeMeters }) {
  assertFiniteNumber(julianDay, "julianDay");
  assertLatitude(latitude);
  assertLongitude(longitude);
  assertFiniteNumber(altitudeMeters, "altitudeMeters");

  // Clamp latitude to +/- 89.99 to avoid division by zero / polar singularities in topocentric projection
  const clampedLatitude = Math.max(-89.99, Math.min(89.99, latitude));

  return {
    julianDay,
    latitude: clampedLatitude,
    longitude,
    altitudeMeters
  };
}

export function computeTopocentricPlanetarySnapshot(observer, ayanamsaMode = "lahiri") {
  const jdTT = observer.julianDay + computeDeltaT(observer.julianDay) / 86400;
  const T = computeJulianCentury(jdTT);

  // 1. Obliquity of ecliptic (including nutation)
  const omega = (125.04452 - 1934.136261 * T) * DEG_TO_RAD;
  const deltaEpsilon = 0.002556 * Math.cos(omega);
  const epsilon = (23.439291 - 0.0130042 * T + deltaEpsilon) * DEG_TO_RAD;

  // 2. Greenwich Mean Sidereal Time (GMST) and Local Hour Angle
  const GMST = normalizeDegrees(280.46061837 + 360.98564736629 * (observer.julianDay - 2451545.0));
  const LST = GMST + observer.longitude;
  const LST_rad = LST * DEG_TO_RAD;

  // 3. Observer position in equatorial Cartesian coordinates (meters, WGS-84 ellipsoid)
  const a = 6378137.0; // semi-major axis
  const f = 1 / 298.257223563; // flattening
  const e2 = 2 * f - f * f; // eccentricity squared
  const lat_rad = observer.latitude * DEG_TO_RAD;
  const sinLat = Math.sin(lat_rad);
  const N = a / Math.sqrt(1 - e2 * sinLat * sinLat); // radius of curvature in prime vertical
  const h = observer.altitudeMeters;

  const x_eq = (N + h) * Math.cos(lat_rad) * Math.cos(LST_rad);
  const y_eq = (N + h) * Math.cos(lat_rad) * Math.sin(LST_rad);
  const z_eq = (N * (1 - e2) + h) * sinLat;

  // 4. Observer position in ecliptic Cartesian coordinates (meters)
  const x_obs_ec = x_eq;
  const y_obs_ec = y_eq * Math.cos(epsilon) + z_eq * Math.sin(epsilon);
  const z_obs_ec = -y_eq * Math.sin(epsilon) + z_eq * Math.cos(epsilon);

  // Convert to AU
  const AU_in_meters = 149597870700;
  const x_obs = x_obs_ec / AU_in_meters;
  const y_obs = y_obs_ec / AU_in_meters;
  const z_obs = z_obs_ec / AU_in_meters;

  // 5. Heliocentric Earth position
  const sunLongitude = computeSolarLongitude(observer.julianDay);
  const sunLongRad = sunLongitude * DEG_TO_RAD;
  const x_sun_geo = Math.cos(sunLongRad);
  const y_sun_geo = Math.sin(sunLongRad);
  const z_sun_geo = 0.0;

  const x_earth_helio = -x_sun_geo;
  const y_earth_helio = -y_sun_geo;
  const z_earth_helio = 0.0;

  // Compute snapshot for all bodies
  const bodies = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];

  return bodies.map((body) => {
    let x_geo = 0;
    let y_geo = 0;
    let z_geo = 0;

    if (body === "sun") {
      x_geo = x_sun_geo;
      y_geo = y_sun_geo;
      z_geo = z_sun_geo;
    } else if (body === "moon") {
      const lunarPos = computeTrueLunarPosition(observer.julianDay);
      const moonLongRad = lunarPos.longitude * DEG_TO_RAD;
      const moonLatRad = lunarPos.latitude * DEG_TO_RAD;
      const moonDistAU = lunarPos.distanceAU;
      
      x_geo = moonDistAU * Math.cos(moonLongRad) * Math.cos(moonLatRad);
      y_geo = moonDistAU * Math.sin(moonLongRad) * Math.cos(moonLatRad);
      z_geo = moonDistAU * Math.sin(moonLatRad);
    } else {
      // Other planets
      const p_xyz = getHeliocentricXYZ(body, T);
      x_geo = p_xyz.x - x_earth_helio;
      y_geo = p_xyz.y - y_earth_helio;
      z_geo = p_xyz.z - z_earth_helio;
    }

    // Apply topocentric correction
    const x_topo = x_geo - x_obs;
    const y_topo = y_geo - y_obs;
    const z_topo = z_geo - z_obs;

    const tropicalLongitude = normalizeDegrees(Math.atan2(y_topo, x_topo) * RAD_TO_DEG);
    const siderealLongitude = convertTropicalToSidereal(tropicalLongitude, observer.julianDay, ayanamsaMode);

    const nakshatraSize = 360 / 27;
    const padaSize = nakshatraSize / 4;
    const nakshatraIndex = Math.floor(siderealLongitude / nakshatraSize) % 27;
    const padaIndex = Math.floor((siderealLongitude % nakshatraSize) / padaSize) % 4;

    const NAKSHATRA_NAMES = [
      "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
      "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
      "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ];

    // Calculate Right Ascension and Declination
    const x_eq_topo = x_topo;
    const y_eq_topo = y_topo * Math.cos(epsilon) - z_topo * Math.sin(epsilon);
    const z_eq_topo = y_topo * Math.sin(epsilon) + z_topo * Math.cos(epsilon);

    const ra = normalizeDegrees(Math.atan2(y_eq_topo, x_eq_topo) * RAD_TO_DEG);
    const dec = Math.atan2(z_eq_topo, Math.sqrt(x_eq_topo * x_eq_topo + y_eq_topo * y_eq_topo)) * RAD_TO_DEG;

    const H = normalizeDegrees(LST - ra);
    const H_rad = H * DEG_TO_RAD;
    const dec_rad = dec * DEG_TO_RAD;

    const sinAlt = Math.sin(lat_rad) * Math.sin(dec_rad) + Math.cos(lat_rad) * Math.cos(dec_rad) * Math.cos(H_rad);
    const alt = Math.asin(sinAlt) * RAD_TO_DEG;

    const cosAz = (Math.sin(dec_rad) - Math.sin(lat_rad) * Math.sin(alt * DEG_TO_RAD)) / (Math.cos(lat_rad) * Math.cos(alt * DEG_TO_RAD));
    const sinAz = (-Math.cos(dec_rad) * Math.sin(H_rad)) / Math.cos(alt * DEG_TO_RAD);
    const az = normalizeDegrees(Math.atan2(sinAz, cosAz) * RAD_TO_DEG);

    return {
      body,
      tropicalLongitude: round(tropicalLongitude),
      siderealLongitude,
      horizontal: {
        azimuth: round(az, 4),
        altitude: round(alt, 4)
      },
      equatorial: {
        rightAscension: round(ra, 4),
        declination: round(dec, 4)
      },
      nakshatra: {
        index: nakshatraIndex,
        name: NAKSHATRA_NAMES[nakshatraIndex],
        pada: padaIndex
      }
    };
  });
}

export function computeHouseCusps(observer) {
  assertFiniteNumber(observer.julianDay, "julianDay");
  assertLatitude(observer.latitude);
  assertLongitude(observer.longitude);
  assertFiniteNumber(observer.altitudeMeters, "altitudeMeters");

  const jdTT = observer.julianDay + computeDeltaT(observer.julianDay) / 86400;
  const T = computeJulianCentury(jdTT);
  
  const omega = (125.04452 - 1934.136261 * T) * DEG_TO_RAD;
  const deltaEpsilon = 0.002556 * Math.cos(omega);
  const epsilon = (23.439291 - 0.0130042 * T + deltaEpsilon) * DEG_TO_RAD;

  const GMST = normalizeDegrees(280.46061837 + 360.98564736629 * (observer.julianDay - 2451545.0));
  const LST = GMST + observer.longitude;
  const ramcRad = LST * DEG_TO_RAD;
  const lat_rad = observer.latitude * DEG_TO_RAD;

  const mc = normalizeDegrees(Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsilon)) * RAD_TO_DEG);

  const y_asc = Math.cos(ramcRad);
  const x_asc = -(Math.sin(ramcRad) * Math.cos(epsilon) + Math.tan(lat_rad) * Math.sin(epsilon));
  const asc = normalizeDegrees(Math.atan2(y_asc, x_asc) * RAD_TO_DEG);

  // We support Whole Sign and Equal house systems.
  // By default, if latitude is extreme (>= 60 deg), we lock to Whole Sign or Equal System.
  const isExtreme = Math.abs(observer.latitude) >= 60;
  const system = isExtreme ? "WholeSign" : "Equal";

  const cusps = [];
  if (system === "WholeSign") {
    const ascSignStart = Math.floor(asc / 30) * 30;
    for (let i = 0; i < 12; i++) {
      cusps.push(normalizeDegrees(ascSignStart + i * 30));
    }
  } else {
    for (let i = 0; i < 12; i++) {
      cusps.push(normalizeDegrees(asc + i * 30));
    }
  }

  return {
    ascendant: round(asc, 6),
    midheaven: round(mc, 6),
    system,
    cusps: cusps.map((c) => round(c, 6))
  };
}

function computeSolarDeclination(julianDay) {
  return computeNoaaSolarDeclination(julianDay);
}

export function computeSunriseSunsetApprox(observer) {
  const dayStartUnixMs =
    Math.floor(julianDayToUnixMs(observer.julianDay) / DAY_IN_MS) * DAY_IN_MS;
  const noonJulianDay = unixMsToJulianDay(dayStartUnixMs + 12 * 60 * 60 * 1000);
  const latitudeRad = observer.latitude * DEG_TO_RAD;

  // Helper to iteratively solve for rise or set time
  function solveTime(isSunset) {
    let currentJd = noonJulianDay;
    let minutesUtc = 12 * 60; // Start at noon

    for (let iter = 0; iter < 5; iter += 1) {
      const t = currentJd;
      const tTT = t + computeDeltaT(t) / 86400;
      const T = computeJulianCentury(tTT);
      const omega = (125.04452 - 1934.136261 * T) * DEG_TO_RAD;
      const deltaEpsilon = 0.002556 * Math.cos(omega);
      const epsilon = (23.439291 - 0.0130042 * T + deltaEpsilon) * DEG_TO_RAD;
      const solarLong = computeSolarLongitude(t);
      const declination = Math.asin(Math.sin(epsilon) * Math.sin(solarLong * DEG_TO_RAD));
      const equationOfTime = computeNoaaEquationOfTime(t);

      const refraction = computeDynamicRefraction({
        elevationMeters: observer.altitudeMeters,
        julianDay: t,
        latitude: observer.latitude
      });

      const horizonAltitude = (-0.26667 - refraction.correctionDegrees) * DEG_TO_RAD;
      const cosHourAngle =
        (Math.sin(horizonAltitude) - Math.sin(latitudeRad) * Math.sin(declination)) /
        (Math.cos(latitudeRad) * Math.cos(declination));
      const clampedCosHourAngle = Math.max(-1, Math.min(1, cosHourAngle));
      const hourAngle = Math.acos(clampedCosHourAngle);
      const hourAngleDegrees = hourAngle * RAD_TO_DEG;

      if (isSunset) {
        minutesUtc = 720 - 4 * (observer.longitude - hourAngleDegrees) - equationOfTime;
      } else {
        minutesUtc = 720 - 4 * (observer.longitude + hourAngleDegrees) - equationOfTime;
      }

      currentJd = unixMsToJulianDay(dayStartUnixMs + minutesUtc * 60 * 1000);
    }

    return dayStartUnixMs + Math.round(minutesUtc * 60 * 1000);
  }

  const sunriseUnixMs = solveTime(false);
  const sunsetUnixMs = solveTime(true);

  // Return refraction at noon for compatibility/diagnostics
  const refractionAtNoon = computeDynamicRefraction({
    elevationMeters: observer.altitudeMeters,
    julianDay: noonJulianDay,
    latitude: observer.latitude
  });

  return {
    sunriseUnixMs,
    sunsetUnixMs,
    refraction: refractionAtNoon
  };
}
