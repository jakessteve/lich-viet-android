import React, { useEffect, useMemo, useState } from 'react';
import type { TuViBirthLocation } from '../../types/tuvi';
import { estimateTimezoneOffsetHours } from '@/utils/geo';
import { Search, LocateFixed, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TuViLocationPickerProps {
  value?: TuViBirthLocation;
  onChange: (location: TuViBirthLocation) => void;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

const QUICK_LOCATIONS: TuViBirthLocation[] = [
  {
    locationName: 'Hà Nội, Việt Nam',
    lat: 21.028511,
    lng: 105.804817,
    timezone: 7,
    countryCode: 'VN',
    countryName: 'Việt Nam',
  },
  {
    locationName: 'TP. Hồ Chí Minh, Việt Nam',
    lat: 10.776889,
    lng: 106.700806,
    timezone: 7,
    countryCode: 'VN',
    countryName: 'Việt Nam',
  },
  {
    locationName: 'Đà Nẵng, Việt Nam',
    lat: 16.047079,
    lng: 108.20623,
    timezone: 7,
    countryCode: 'VN',
    countryName: 'Việt Nam',
  },
  {
    locationName: 'Huế, Việt Nam',
    lat: 16.463713,
    lng: 107.590866,
    timezone: 7,
    countryCode: 'VN',
    countryName: 'Việt Nam',
  },
  {
    locationName: 'Hải Phòng, Việt Nam',
    lat: 20.844912,
    lng: 106.688084,
    timezone: 7,
    countryCode: 'VN',
    countryName: 'Việt Nam',
  },
  {
    locationName: 'Cần Thơ, Việt Nam',
    lat: 10.045162,
    lng: 105.746857,
    timezone: 7,
    countryCode: 'VN',
    countryName: 'Việt Nam',
  },
];

const formatDisplayName = (result: NominatimResult): string => {
  const parts = [
    result.address?.city || result.address?.town || result.address?.village || result.address?.state,
    result.address?.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : result.display_name;
};

const createBirthLocation = (result: NominatimResult, lat: number, lng: number): TuViBirthLocation => ({
  locationName: formatDisplayName(result),
  lat: Number.isFinite(lat) ? lat : 0,
  lng: Number.isFinite(lng) ? lng : 0,
  timezone: estimateTimezoneOffsetHours(lng),
  countryCode: result.address?.country_code?.toUpperCase(),
  countryName: result.address?.country,
});

async function reverseGeocodeLocation(lat: number, lng: number): Promise<TuViBirthLocation> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'jsonv2',
    addressdetails: '1',
    'accept-language': 'vi',
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Không tìm được địa điểm.');
  }

  const result = (await response.json()) as NominatimResult;
  return createBirthLocation(result, lat, lng);
}

export const TuViLocationPicker: React.FC<TuViLocationPickerProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TuViBirthLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const selectedQuickIndex = useMemo(() => {
    if (!value) return -1;
    return QUICK_LOCATIONS.findIndex((loc) => loc.locationName === value.locationName);
  }, [value]);

  const selectedName = value?.locationName || '';

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError('');
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          format: 'jsonv2',
          addressdetails: '1',
          limit: '5',
          'accept-language': 'vi',
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Không thể tìm địa điểm.');
        const rawResults = (await res.json()) as NominatimResult[];
        const mapped = rawResults.map((r) => {
          const lat = parseFloat(r.lat);
          const lng = parseFloat(r.lon);
          return createBirthLocation(r, lat, lng);
        });
        setResults(mapped);
      } catch {
        setError('Lỗi khi tìm kiếm địa điểm.');
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị.');
      return;
    }

    setIsSearching(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          setError('Không lấy được vị trí hiện tại.');
          setIsSearching(false);
          return;
        }
        try {
          const location = await reverseGeocodeLocation(latitude, longitude);
          onChange({
            ...location,
            locationName: location.locationName || `Vị trí hiện tại (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          });
        } catch {
          onChange({
            locationName: `Vị trí hiện tại (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            lat: latitude,
            lng: longitude,
            timezone: estimateTimezoneOffsetHours(longitude),
          });
        }
        setIsSearching(false);
      },
      () => {
        setError('Không lấy được vị trí hiện tại.');
        setIsSearching(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {QUICK_LOCATIONS.map((location, index) => (
          <button
            key={location.locationName}
            type="button"
            onClick={() => onChange(location)}
            className={cn(
              'rounded-xl border px-3 py-2 text-xs font-semibold transition-all spring-press',
              selectedQuickIndex === index
                ? 'border-gold-light bg-gold/10 text-text-primary-light dark:border-gold dark:bg-gold/20 dark:text-gold-light shadow-sm'
                : 'surface-control text-text-secondary-light hover:bg-surface-container-lowest dark:text-text-secondary-dark dark:hover:bg-white/10',
            )}
          >
            {location.locationName.replace(', Việt Nam', '')}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary-light/70 dark:text-text-secondary-dark/70" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tỉnh/thành, quốc gia sinh..."
            className="w-full pl-9 text-sm"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={useCurrentLocation}
          className="h-10 w-10 shrink-0 rounded-xl"
          title="Dùng vị trí hiện tại"
          aria-label="Dùng vị trí hiện tại"
        >
          <LocateFixed className="h-4 w-4" />
        </Button>
      </div>

      {selectedName && (
        <div className="rounded-xl border border-gold/20 bg-gold/5 px-3 py-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
          <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">Nơi sinh:</span>{' '}
          {selectedName}
          {value && (
            <span className="ml-1 text-[0.7rem] opacity-75">
              ({value.lat.toFixed(3)}, {value.lng.toFixed(3)}, UTC{value.timezone >= 0 ? '+' : ''}
              {value.timezone})
            </span>
          )}
        </div>
      )}

      {(isSearching || error || results.length > 0) && (
        <div className="surface-panel p-2 rounded-xl border border-border-light/60 dark:border-border-dark/60">
          {isSearching && (
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
              Đang tìm địa điểm...
            </div>
          )}
          {error && <p className="px-2 py-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>}
          {!isSearching &&
            results.map((location) => (
              <button
                key={`${location.locationName}-${location.lat}-${location.lng}`}
                type="button"
                onClick={() => {
                  onChange(location);
                  setQuery('');
                  setResults([]);
                }}
                className="flex w-full items-start justify-between gap-3 rounded-lg px-2 py-2 text-left text-xs text-text-secondary-light transition-colors hover:bg-gold/10 dark:text-text-secondary-dark"
              >
                <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                  {location.locationName}
                </span>
                <span className="shrink-0 opacity-70">
                  UTC{location.timezone >= 0 ? '+' : ''}
                  {location.timezone}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
