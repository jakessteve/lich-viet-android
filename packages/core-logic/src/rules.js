import { normalizeDegrees, assertFiniteNumber } from "./astronomy.js";

export const STRICT_MODE_LOCKED_ENTITY_IDS = Object.freeze([
  "tu_hoa_canh",
  "tu_hoa_nham"
]);

export const DAI_LUC_NHAM_MONTHLY_GENERALS = Object.freeze([
  { branch: "Tuat", label: "Tuat Tho", weightBonus: 0.92 },
  { branch: "Dau", label: "Dau Kim", weightBonus: 1.15 },
  { branch: "Than", label: "Than Kim", weightBonus: 1.05 },
  { branch: "Mui", label: "Mui Tho", weightBonus: 0.9 },
  { branch: "Ngo", label: "Ngo Hoa", weightBonus: 1.4 },
  { branch: "Ty", label: "Ty Hoa", weightBonus: 1.3 },
  { branch: "Thin", label: "Thin Tho", weightBonus: 0.95 },
  { branch: "Mao", label: "Mao Moc", weightBonus: 1.1 },
  { branch: "Dan", label: "Dan Moc", weightBonus: 1.2 },
  { branch: "Suu", label: "Suu Tho", weightBonus: 0.88 },
  { branch: "Ti", label: "Ti Thuy", weightBonus: 1.08 },
  { branch: "Hoi", label: "Hoi Thuy", weightBonus: 1.18 }
]);

const MAJOR_ASPECTS = Object.freeze([0, 60, 90, 120, 180]);



function normalizeOverrides(overrides) {
  if (overrides === undefined) {
    return [];
  }

  if (!Array.isArray(overrides)) {
    throw new TypeError("overrides must be an array when provided");
  }

  return overrides;
}

export function resolveStrictModeOverrides({
  overrides,
  strictMode = true,
  lockedEntityIds = STRICT_MODE_LOCKED_ENTITY_IDS
} = {}) {
  const normalizedOverrides = normalizeOverrides(overrides);
  const lockedSet = new Set(lockedEntityIds);
  const allowedOverrides = [];
  const blockedOverrides = [];

  for (const override of normalizedOverrides) {
    if (strictMode && lockedSet.has(override.entity_id)) {
      blockedOverrides.push({
        ...override,
        reason: "strict_mode_locked_entity"
      });
      continue;
    }

    allowedOverrides.push({ ...override });
  }

  return {
    strictMode,
    allowedOverrides,
    blockedOverrides
  };
}

export function deriveKyMonChietBoState({
  timestamp,
  solarTermBoundaryTimestamp,
  timezoneOffsetHours = 0
}) {
  assertFiniteNumber(timestamp, "timestamp");
  assertFiniteNumber(solarTermBoundaryTimestamp, "solarTermBoundaryTimestamp");
  assertFiniteNumber(timezoneOffsetHours, "timezoneOffsetHours");

  const localTimestamp = timestamp + timezoneOffsetHours * 60 * 60 * 1000;
  const localBoundaryTimestamp =
    solarTermBoundaryTimestamp + timezoneOffsetHours * 60 * 60 * 1000;
  const deltaMinutes = Math.floor((localTimestamp - localBoundaryTimestamp) / (60 * 1000));

  return {
    minuteIndex: Math.floor((localTimestamp / (60 * 1000)) % 60 + 60) % 60,
    boundaryMinuteIndex:
      Math.floor((localBoundaryTimestamp / (60 * 1000)) % 60 + 60) % 60,
    deltaMinutes,
    isPostBoundary: localTimestamp >= localBoundaryTimestamp,
    minuteSwitchActive: deltaMinutes === 0,
    phase: localTimestamp >= localBoundaryTimestamp ? "new_cycle" : "previous_cycle"
  };
}

export function deriveDaiLucNhamMonthlyGeneral({ solarLongitude }) {
  assertFiniteNumber(solarLongitude, "solarLongitude");

  const normalizedLongitude = normalizeDegrees(solarLongitude);
  const monthIndex = Math.floor(normalizedLongitude / 30) % 12;
  const monthlyGeneral = DAI_LUC_NHAM_MONTHLY_GENERALS[monthIndex];

  return {
    monthIndex,
    branch: monthlyGeneral.branch,
    label: monthlyGeneral.label,
    weightBonus: monthlyGeneral.weightBonus
  };
}

export function evaluateVoidOfCourseGuard({
  planetarySnapshot,
  orbDegrees = 0.5
}) {
  if (!Array.isArray(planetarySnapshot)) {
    throw new TypeError("planetarySnapshot must be an array");
  }

  assertFiniteNumber(orbDegrees, "orbDegrees");

  const moon = planetarySnapshot.find((body) => body.body.toLowerCase() === "moon");

  if (!moon) {
    throw new RangeError("planetarySnapshot must include a Moon entry");
  }

  const remainingDegreesInSign = 30 - (normalizeDegrees(moon.tropicalLongitude) % 30);
  let closestAspectDelta = Number.POSITIVE_INFINITY;
  let closestAspect = null;
  let closestBody = null;

  for (const body of planetarySnapshot) {
    if (body.body.toLowerCase() === "moon") {
      continue;
    }

    // Check all major aspects
    for (const aspect of MAJOR_ASPECTS) {
      // An aspect occurs when Moon reaches (planetLongitude + aspect) or (planetLongitude - aspect)
      const target1 = normalizeDegrees(body.tropicalLongitude + aspect);
      const target2 = normalizeDegrees(body.tropicalLongitude - aspect);

      // Distance Moon needs to travel to reach these targets
      const dist1 = normalizeDegrees(target1 - moon.tropicalLongitude);
      const dist2 = normalizeDegrees(target2 - moon.tropicalLongitude);

      const delta = Math.min(dist1, dist2);

      if (delta <= remainingDegreesInSign && delta < closestAspectDelta) {
        closestAspectDelta = delta;
        closestAspect = aspect;
        closestBody = body.body;
      }
    }
  }

  return {
    isVoidOfCourse: !Number.isFinite(closestAspectDelta),
    remainingDegreesInSign: Number(remainingDegreesInSign.toFixed(3)),
    closestAspectDelta: Number.isFinite(closestAspectDelta)
      ? Number(closestAspectDelta.toFixed(3))
      : null,
    closestAspect,
    closestBody
  };
}
