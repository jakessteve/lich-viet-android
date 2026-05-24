import { useEffect, useState } from 'react';
import { buildSwissGeoLocation } from '@/utils/geo';
import type { SwissGeoLocation } from '@/services/astronomy/swissEphemeris';

/**
 * Requests the viewer's browser geolocation once and converts longitude into the
 * Swiss engine's location contract.
 */
export function useViewerLocation(): SwissGeoLocation | null {
  const [location, setLocation] = useState<SwissGeoLocation | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        const { longitude } = position.coords;
        if (!Number.isFinite(longitude)) {
          setLocation(null);
          return;
        }
        setLocation(buildSwissGeoLocation(longitude));
      },
      () => {
        if (cancelled) return;
        setLocation(null);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return location;
}
