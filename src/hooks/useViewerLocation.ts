import { useEffect, useState } from 'react';
import { buildSwissGeoLocation } from '@/utils/geo';
import type { SwissGeoLocation } from '@/services/astronomy/swissEphemeris';

function getTimezoneLocation(): SwissGeoLocation | null {
  if (typeof window === 'undefined') return null;
  const timezoneOffsetHours = -new Date().getTimezoneOffset() / 60;
  if (!Number.isFinite(timezoneOffsetHours)) return null;
  const longitude = Math.max(-180, Math.min(180, timezoneOffsetHours * 15));
  return { longitude, timezoneOffsetHours };
}

/**
 * Requests the viewer's browser geolocation once and converts longitude into the
 * Swiss engine's location contract. Falls back to timezone-based estimation when
 * geolocation is unavailable or denied (e.g. Capacitor WebView without permission).
 */
export function useViewerLocation(): SwissGeoLocation | null {
  const [location, setLocation] = useState<SwissGeoLocation | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocation(getTimezoneLocation());
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        const { longitude } = position.coords;
        if (!Number.isFinite(longitude)) {
          setLocation(getTimezoneLocation());
          return;
        }
        setLocation(buildSwissGeoLocation(longitude));
      },
      () => {
        if (cancelled) return;
        setLocation(getTimezoneLocation());
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return location;
}
