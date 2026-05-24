import { describe, expect, it } from 'vitest';
import { buildSwissGeoLocation, estimateTimezoneOffsetHours, getCivilDateForOffset } from '@/utils/geo';

describe('geo helpers', () => {
  it('falls back to a safe timezone when longitude is invalid', () => {
    expect(estimateTimezoneOffsetHours(Number.NaN)).toBe(7);

    const location = buildSwissGeoLocation(Number.NaN);
    expect(location.longitude).toBe(0);
    expect(location.timezoneOffsetHours).toBe(0);
  });

  it('keeps the civil date stable when the offset is invalid', () => {
    const source = new Date('2025-05-24T12:34:56.000Z');
    const result = getCivilDateForOffset(source, Number.NaN);

    expect(result.getTime()).toBe(source.getTime());
    expect(Number.isNaN(result.getTime())).toBe(false);
  });
});
