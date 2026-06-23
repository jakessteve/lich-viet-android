import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useViewerLocation } from '@/hooks/useViewerLocation';

describe('useViewerLocation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('falls back to timezone when geolocation is unavailable', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });

    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-420);

    const { result } = renderHook(() => useViewerLocation());

    expect(result.current).toEqual({
      longitude: 105,
      timezoneOffsetHours: 7,
    });
  });

  it('falls back to timezone when geolocation is denied', async () => {
    const getCurrentPosition = vi.fn((_success: unknown, error: (err: GeolocationPositionError) => void) => {
      error({ code: 1, message: 'User denied' } as GeolocationPositionError);
    });
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition },
      configurable: true,
    });

    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-420);

    const { result } = renderHook(() => useViewerLocation());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(getCurrentPosition).toHaveBeenCalled();
    expect(result.current).toEqual({
      longitude: 105,
      timezoneOffsetHours: 7,
    });
  });
});
