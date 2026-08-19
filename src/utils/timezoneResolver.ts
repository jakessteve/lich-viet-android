export type TimezoneSource = 'iana' | 'offline_iana' | 'solar_meridian_fallback';

export interface TimezoneResolutionResult {
  offsetHours: number;
  source: TimezoneSource;
  timeZoneId?: string;
}

// Bounded lookup table of standard geopolitical coordinates / regions
const KNOWN_REGION_OFFSETS: Array<{
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  offset: number;
  timeZoneId: string;
}> = [
  // Vietnam (GMT+7)
  { name: 'Vietnam', minLat: 8.0, maxLat: 24.0, minLng: 102.0, maxLng: 110.0, offset: 7, timeZoneId: 'Asia/Ho_Chi_Minh' },
  // Nepal (GMT+5:45) - Must be before India due to geographical subset
  { name: 'Nepal', minLat: 26.0, maxLat: 31.0, minLng: 80.0, maxLng: 89.0, offset: 5.75, timeZoneId: 'Asia/Kathmandu' },
  // India (GMT+5:30)
  { name: 'India', minLat: 6.0, maxLat: 36.0, minLng: 68.0, maxLng: 97.5, offset: 5.5, timeZoneId: 'Asia/Kolkata' },
  // Iran (GMT+3:30)
  { name: 'Iran', minLat: 25.0, maxLat: 40.0, minLng: 44.0, maxLng: 63.5, offset: 3.5, timeZoneId: 'Asia/Tehran' },
  // South Australia / Adelaide (GMT+9:30)
  { name: 'Adelaide / South Australia', minLat: -39.0, maxLat: -25.0, minLng: 129.0, maxLng: 141.0, offset: 9.5, timeZoneId: 'Australia/Adelaide' },
  // Japan / Korea (GMT+9)
  { name: 'Japan/Korea', minLat: 30.0, maxLat: 46.0, minLng: 124.0, maxLng: 146.0, offset: 9, timeZoneId: 'Asia/Tokyo' },
  // China / Singapore / Hong Kong / Taiwan / Philippines (GMT+8)
  { name: 'East Asia', minLat: 1.0, maxLat: 54.0, minLng: 97.5, maxLng: 124.0, offset: 8, timeZoneId: 'Asia/Shanghai' },
  // Thailand / Laos / Cambodia (GMT+7)
  { name: 'Indochina', minLat: 5.0, maxLat: 21.0, minLng: 97.0, maxLng: 106.0, offset: 7, timeZoneId: 'Asia/Bangkok' },
  // Western Europe / UK (GMT+0)
  { name: 'UK / Portugal', minLat: 36.0, maxLat: 60.0, minLng: -10.0, maxLng: 2.0, offset: 0, timeZoneId: 'Europe/London' },
  // Central Europe (GMT+1)
  { name: 'Central Europe', minLat: 36.0, maxLat: 70.0, minLng: 2.0, maxLng: 20.0, offset: 1, timeZoneId: 'Europe/Paris' },
  // US Eastern (GMT-5)
  { name: 'US Eastern', minLat: 24.0, maxLat: 50.0, minLng: -85.0, maxLng: -65.0, offset: -5, timeZoneId: 'America/New_York' },
  // US Pacific (GMT-8)
  { name: 'US Pacific', minLat: 32.0, maxLat: 49.0, minLng: -125.0, maxLng: -114.0, offset: -8, timeZoneId: 'America/Los_Angeles' },
];

/**
 * Resolves precise civil timezone offset from geographic coordinates.
 * Prevents naive longitude dividing errors (e.g. India +5.5 vs solar meridian +5).
 */
export function resolveTimezone(lat?: number, lng?: number): TimezoneResolutionResult {
  if (lat === undefined || lng === undefined || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { offsetHours: 7, source: 'offline_iana', timeZoneId: 'Asia/Ho_Chi_Minh' };
  }

  // 1. Check known geopolitical bounding boxes
  const matched = KNOWN_REGION_OFFSETS.find(
    (r) => lat >= r.minLat && lat <= r.maxLat && lng >= r.minLng && lng <= r.maxLng,
  );
  if (matched) {
    return {
      offsetHours: matched.offset,
      source: 'offline_iana',
      timeZoneId: matched.timeZoneId,
    };
  }

  // 2. Fallback to solar meridian approximation with explicit metadata
  const fallbackOffset = Math.max(-12, Math.min(14, Math.round(lng / 15)));
  return {
    offsetHours: fallbackOffset,
    source: 'solar_meridian_fallback',
  };
}
