/**
 * Apparent Solar Longitude calculation using Jean Meeus (Astronomical Algorithms, Ch 25).
 * Deterministic and zero-I/O.
 */

const DEG2RAD = Math.PI / 180;

export function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

export function getSunLongitude(jd: number): number {
  // Julian centuries from J2000.0 (JD 2451545.0)
  const T = (jd - 2451545.0) / 36525;

  // Geometric mean longitude of the Sun
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;

  // Mean anomaly of the Sun
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = M * DEG2RAD;

  // Equation of center C
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  // True longitude of the Sun
  const sunTrue = L0 + C;

  // Apparent longitude of the Sun (corrected for nutation and aberration)
  const omega = 125.04 - 1934.136 * T;
  const lambda = sunTrue - 0.00569 - 0.00478 * Math.sin(omega * DEG2RAD);

  return normalizeDegrees(lambda);
}
