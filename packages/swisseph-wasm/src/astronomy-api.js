import {
  computeTrueLunarPosition,
  buildTopocentricObserver,
  computeLahiriAyanamsa,
  computeSunriseSunsetApprox,
  computeTopocentricPlanetarySnapshot,
  computeHouseCusps,
  julianDayToUnixMs,
  solveSolarTermBoundary,
  computeSolarLongitude,
  normalizeDegrees
} from "@omce/core-logic";
import {
  resolveVietnamHistoricalTimezone,
  shiftTimestampByOffsetHours
} from "@omce/canonical-db";

export function deriveWasmTopocentricSnapshot(input) {
  const observer = buildTopocentricObserver(input);
  return computeTopocentricPlanetarySnapshot(observer);
}

export function executeWasmAstronomyPipeline(input) {
  const observer = buildTopocentricObserver(input);
  const civilTimestamp = input.civilTimestamp ?? julianDayToUnixMs(observer.julianDay);
  const timezone = resolveVietnamHistoricalTimezone({
    timestamp: civilTimestamp,
    latitude: observer.latitude,
    controlZone: input.controlZone
  });
  const currentSunLong = computeSolarLongitude(observer.julianDay);
  const targetLongitude = input.targetSolarLongitude ??
    normalizeDegrees(Math.round(currentSunLong / 15) * 15);
  const solarTerm = solveSolarTermBoundary({
    targetLongitude,
    startJulianDay: observer.julianDay
  });
  const shiftedTimestamp = shiftTimestampByOffsetHours(
    civilTimestamp,
    timezone.offsetHours
  );

  const lunarPos = computeTrueLunarPosition(observer.julianDay);
  const phaseAngle = normalizeDegrees(lunarPos.longitude - currentSunLong);

  return {
    timePlaceContext: {
      julianDayUT: observer.julianDay - timezone.offsetHours / 24,
      julianDayTT: observer.julianDay, // Roughly TT based on observer usage
      luniSolarPhaseAngle: phaseAngle,
      trueSolarLongitude: currentSunLong,
      trueLunarLongitude: lunarPos.longitude,
    },
    observer,
    timezone: {
      ...timezone,
      shiftedTimestamp
    },
    solarTerm: {
      targetLongitude,
      julianDay: solarTerm.julianDay,
      longitude: solarTerm.longitude,
      iterations: solarTerm.iterations
    },
    sunriseSunset: computeSunriseSunsetApprox(observer),
    ayanamsa: computeLahiriAyanamsa(observer.julianDay),
    planetarySnapshot: computeTopocentricPlanetarySnapshot(observer),
    houses: computeHouseCusps(observer)
  };
}
