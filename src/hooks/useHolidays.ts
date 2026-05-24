import { useState, useEffect, useMemo } from 'react';
import { getLunarDate } from '../utils/calendarEngine';
import vietnameseHolidaysData from '../data/phase_1/vietnameseHolidays.json';
import { z } from 'zod';
import { HOLIDAYS_CONFIG } from '../config/api';
import type { SwissGeoLocation } from '../services/astronomy/swissEphemeris';

// --- Type Definitions ---

interface SolarHolidayRule {
  month: number;
  day: number;
  name: string;
  emoji: string;
}

interface LunarHolidayRule {
  month: number;
  day: number;
  name: string;
  emoji: string;
  daysOff?: boolean;
}

export interface HolidayEntry {
  name: string;
  emoji: string;
  source: 'vn-solar' | 'vn-lunar' | 'local';
  daysOff?: boolean;
}

interface GeoInfo {
  countryCode: string;
  countryName: string;
}

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  types: string[];
}

// --- Constants ---

const VIETNAM_COUNTRY_CODE = 'VN';
const GEO_CACHE_KEY = 'holidays_geo_cache';
const GEO_CACHE_TTL_MS = HOLIDAYS_CONFIG.geoCacheTtlMs;
const NAGER_API_BASE = HOLIDAYS_CONFIG.nagerApiBase;
const GEO_API_URL = HOLIDAYS_CONFIG.geoIpUrl;
const GEO_CONSENT_KEY = 'geo_consent_given';

// --- Zod Schemas for API response validation (HIGH-04) ---

const GeoResponseSchema = z
  .object({
    country_code: z.string().length(2).default('VN'),
    country_name: z.string().default('Việt Nam'),
  })
  .passthrough();

const NagerHolidaySchema = z.object({
  date: z.string(),
  localName: z.string(),
  name: z.string(),
  countryCode: z.string(),
  fixed: z.boolean(),
  global: z.boolean(),
  types: z.array(z.string()),
});

const NagerHolidaysSchema = z.array(NagerHolidaySchema);

const GeoCacheSchema = z.object({
  data: z.object({
    countryCode: z.string(),
    countryName: z.string(),
  }),
  timestamp: z.number(),
});

// --- Pure Helper Functions ---

function getVietnameseHolidaysForDate(
  date: Date,
  solarRules: SolarHolidayRule[],
  lunarRules: LunarHolidayRule[],
  viewerLocation?: SwissGeoLocation | null,
): HolidayEntry[] {
  const results: HolidayEntry[] = [];
  const solarMonth = date.getMonth() + 1;
  const solarDay = date.getDate();

  for (const rule of solarRules) {
    if (rule.month === solarMonth && rule.day === solarDay) {
      results.push({
        name: rule.name,
        emoji: rule.emoji,
        source: 'vn-solar',
      });
    }
  }

  const lunar = getLunarDate(date, viewerLocation ?? undefined);
  for (const rule of lunarRules) {
    if (rule.month === lunar.month && rule.day === lunar.day && !lunar.isLeap) {
      results.push({
        name: rule.name,
        emoji: rule.emoji,
        source: 'vn-lunar',
        daysOff: rule.daysOff,
      });
    }
  }

  return results;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// --- Geo Caching ---

function getCachedGeo(): GeoInfo | null {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const parsed = GeoCacheSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      localStorage.removeItem(GEO_CACHE_KEY);
      return null;
    }
    if (Date.now() - parsed.data.timestamp > GEO_CACHE_TTL_MS) {
      localStorage.removeItem(GEO_CACHE_KEY);
      return null;
    }
    return parsed.data.data;
  } catch {
    return null;
  }
}

function setCachedGeo(geo: GeoInfo): void {
  try {
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ data: geo, timestamp: Date.now() }));
  } catch {
    // Silently fail if localStorage is not available
  }
}

// --- The Hook ---

export function useHolidays(selectedDate: Date, viewerLocation?: SwissGeoLocation | null) {
  const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [localHolidays, setLocalHolidays] = useState<NagerHoliday[]>([]);
  const [localLoading, setLocalLoading] = useState(false);

  // Step 1: Detect country via IP geolocation (cached for 24h)
  // MED-02: Only fetch if user has given consent or GPC is not set
  useEffect(() => {
    const cached = getCachedGeo();
    if (cached) {
      setGeoInfo(cached);
      setGeoLoading(false);
      return;
    }

    // Check for Global Privacy Control or explicit opt-out (MED-02)
    const gpcEnabled =
      'globalPrivacyControl' in navigator && (navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl;
    const consentGiven = localStorage.getItem(GEO_CONSENT_KEY) === 'true';
    if (gpcEnabled && !consentGiven) {
      // Respect GPC: default to Vietnam without IP detection
      setGeoInfo({ countryCode: VIETNAM_COUNTRY_CODE, countryName: 'Việt Nam' });
      setGeoLoading(false);
      return;
    }

    let cancelled = false;
    async function fetchGeo() {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
      try {
        const res = await fetch(GEO_API_URL, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`Geo API returned ${res.status}`);
        const json = await res.json();
        const validated = GeoResponseSchema.safeParse(json);
        const geo: GeoInfo = validated.success
          ? { countryCode: validated.data.country_code, countryName: validated.data.country_name }
          : { countryCode: VIETNAM_COUNTRY_CODE, countryName: 'Việt Nam' };
        if (!cancelled) {
          setCachedGeo(geo);
          setGeoInfo(geo);
        }
      } catch {
        clearTimeout(timeout);
        // Fallback to Vietnam if geo fails or times out;
        // Cache the fallback to prevent repeated 429 requests on re-renders
        if (!cancelled) {
          const fallback: GeoInfo = { countryCode: VIETNAM_COUNTRY_CODE, countryName: 'Việt Nam' };
          setCachedGeo(fallback);
          setGeoInfo(fallback);
        }
      } finally {
        if (!cancelled) setGeoLoading(false);
      }
    }

    fetchGeo();
    return () => {
      cancelled = true;
    };
  }, []);

  // Step 2: Fetch local country holidays from Nager.Date API
  // Only fetches if the country is NOT Vietnam (Vietnamese holidays are static).
  const year = selectedDate.getFullYear();
  const countryCode = geoInfo?.countryCode;

  useEffect(() => {
    if (!countryCode || countryCode === VIETNAM_COUNTRY_CODE) {
      setLocalHolidays([]);
      return;
    }

    let cancelled = false;
    async function fetchLocal() {
      setLocalLoading(true);
      try {
        const res = await fetch(`${NAGER_API_BASE}/PublicHolidays/${year}/${countryCode}`);
        if (!res.ok) throw new Error(`Nager API returned ${res.status}`);
        const json = await res.json();
        const validated = NagerHolidaysSchema.safeParse(json);
        if (!cancelled) {
          setLocalHolidays(validated.success ? validated.data : []);
        }
      } catch {
        if (!cancelled) setLocalHolidays([]);
      } finally {
        if (!cancelled) setLocalLoading(false);
      }
    }

    fetchLocal();
    return () => {
      cancelled = true;
    };
  }, [year, countryCode]);

  // Step 3: Combine results for the selected date
  const holidays = useMemo<HolidayEntry[]>(() => {
    const vnHolidays = getVietnameseHolidaysForDate(
      selectedDate,
      vietnameseHolidaysData.solar as SolarHolidayRule[],
      vietnameseHolidaysData.lunar as LunarHolidayRule[],
      viewerLocation,
    );

    // If user is in Vietnam, only return Vietnamese holidays
    if (!countryCode || countryCode === VIETNAM_COUNTRY_CODE) {
      return vnHolidays;
    }

    // Otherwise, combine VN + local
    const dateKey = formatDateKey(selectedDate);
    const matchingLocal: HolidayEntry[] = localHolidays
      .filter((h) => h.date === dateKey)
      .map((h) => ({
        name: h.localName || h.name,
        emoji: '🏳️',
        source: 'local' as const,
      }));

    return [...vnHolidays, ...matchingLocal];
  }, [selectedDate, countryCode, localHolidays, viewerLocation]);

  return {
    holidays,
    isLoading: geoLoading || localLoading,
    countryCode: geoInfo?.countryCode ?? null,
    countryName: geoInfo?.countryName ?? null,
    isVietnam: !countryCode || countryCode === VIETNAM_COUNTRY_CODE,
  };
}
