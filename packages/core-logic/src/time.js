const JULIAN_DAY_UNIX_EPOCH = 2440587.5;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function julianDayToUnixMs(julianDay) {
  if (!Number.isFinite(julianDay)) {
    throw new TypeError("julianDay must be a finite number");
  }

  return Math.round((julianDay - JULIAN_DAY_UNIX_EPOCH) * DAY_IN_MS);
}

export function unixMsToJulianDay(unixMs) {
  if (!Number.isFinite(unixMs)) {
    throw new TypeError("unixMs must be a finite number");
  }

  return unixMs / DAY_IN_MS + JULIAN_DAY_UNIX_EPOCH;
}

export function getTransitDayBranchIndex(unixMs) {
  if (!Number.isFinite(unixMs)) {
    throw new TypeError("unixMs must be a finite number");
  }
  
  const date = new Date(unixMs);
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  
  // The Chi (Branch) cycle is 12 days.
  // We use the same baseline as `buildCanChi`: CHI[ (dayNumber + 2) % 12 ]
  // We just need the index (0 to 11) where 0 is Tý.
  // Wait, CHI array: ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]
  return ((dayNumber + 2) % 12 + 12) % 12;
}
