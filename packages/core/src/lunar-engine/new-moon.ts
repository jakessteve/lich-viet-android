/**
 * Astronomical New Moon (Sóc) Finder based on Jean Meeus, Astronomical Algorithms, Ch 32.
 * Pure TypeScript, zero I/O, deterministic.
 */

const DEG2RAD = Math.PI / 180;

export function getNewMoonJD(k: number): number {
  // Julian centuries since J2000.0
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  // Approximate time of New Moon (JDE)
  const jde =
    2451549.59289 +
    29.530588853 * k +
    0.0001337 * T2 -
    0.00000015 * T3 +
    0.00000000073 * T4;

  // Sun's mean anomaly
  const M = 2.5534 + 29.10535669 * k - 0.0000218 * T2 - 0.00000011 * T3;
  // Moon's mean anomaly
  const Mprime = 201.5643 + 385.81693528 * k + 0.0107438 * T2 + 0.00001239 * T3 - 0.000000058 * T4;
  // Moon's argument of latitude
  const F = 160.7108 + 390.67050274 * k - 0.0016341 * T2 - 0.00000227 * T3 + 0.000000011 * T4;
  // Longitude of the ascending node of lunar orbit
  const Omega = 124.7746 - 1.5637558 * k + 0.0020691 * T2 + 0.00000215 * T3;

  const Mr = M * DEG2RAD;
  const Mpr = Mprime * DEG2RAD;
  const Fr = F * DEG2RAD;
  const Or = Omega * DEG2RAD;

  // Periodic corrections for New Moon (Meeus Table 32.A)
  let delta =
    -0.4072 * Math.sin(Mpr) +
    0.17241 * Math.sin(Mr) +
    0.01608 * Math.sin(2 * Mpr) +
    0.01039 * Math.sin(2 * Fr) +
    0.00739 * Math.sin(Mpr - Mr) -
    0.00514 * Math.sin(Mpr + Mr) +
    0.00208 * Math.sin(2 * Mr) -
    0.00111 * Math.sin(Mpr - 2 * Fr) -
    0.00057 * Math.sin(Mpr + 2 * Fr) +
    0.00056 * Math.sin(2 * Mpr + Mr) -
    0.00042 * Math.sin(3 * Mpr) +
    0.00042 * Math.sin(Mr + 2 * Fr) +
    0.00038 * Math.sin(Mr - 2 * Fr) -
    0.00024 * Math.sin(2 * Mpr - Mr) -
    0.00017 * Math.sin(Or);

  // Additional planetary perturbations
  delta +=
    0.000325 * Math.sin((299.77 + 0.107408 * k - 0.009173 * T2) * DEG2RAD) +
    0.000165 * Math.sin((132.84 + 1.54271 * k) * DEG2RAD) +
    0.000164 * Math.sin((251.88 + 0.016321 * k) * DEG2RAD);

  return jde + delta;
}

/**
 * Returns the Julian Day (at 00:00 UTC+7) of the 1st day of the lunar month containing or preceding the given Julian Day.
 */
export function getNewMoonDayNumber(k: number): number {
  const jdNewMoon = getNewMoonJD(k);
  return Math.floor(jdNewMoon + 7 / 24 + 0.5);
}
