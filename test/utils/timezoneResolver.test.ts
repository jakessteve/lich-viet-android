import { describe, it, expect } from 'vitest';
import { resolveTimezone } from '@/utils/timezoneResolver';

describe('Timezone Resolution Precision Suite (F-02 & DIR-06)', () => {
  it('resolves Mumbai, India to UTC+5.5 (not naive +5)', () => {
    // Mumbai coordinates: 19.0760° N, 72.8777° E
    const res = resolveTimezone(19.076, 72.8777);
    expect(res.offsetHours).toBe(5.5);
    expect(res.source).toBe('offline_iana');
    expect(res.timeZoneId).toBe('Asia/Kolkata');
  });

  it('resolves Kathmandu, Nepal to UTC+5.75 (not naive +6)', () => {
    // Kathmandu coordinates: 27.7172° N, 85.3240° E
    const res = resolveTimezone(27.7172, 85.324);
    expect(res.offsetHours).toBe(5.75);
    expect(res.source).toBe('offline_iana');
    expect(res.timeZoneId).toBe('Asia/Kathmandu');
  });

  it('resolves Tehran, Iran to UTC+3.5 (not naive +3)', () => {
    // Tehran coordinates: 35.6892° N, 51.3890° E
    const res = resolveTimezone(35.6892, 51.389);
    expect(res.offsetHours).toBe(3.5);
    expect(res.source).toBe('offline_iana');
    expect(res.timeZoneId).toBe('Asia/Tehran');
  });

  it('resolves Adelaide, Australia to UTC+9.5 (not naive +9)', () => {
    // Adelaide coordinates: 34.9285° S, 138.6007° E
    const res = resolveTimezone(-34.9285, 138.6007);
    expect(res.offsetHours).toBe(9.5);
    expect(res.source).toBe('offline_iana');
    expect(res.timeZoneId).toBe('Australia/Adelaide');
  });

  it('resolves Hanoi, Vietnam to UTC+7', () => {
    // Hanoi coordinates: 21.0285° N, 105.8542° E
    const res = resolveTimezone(21.0285, 105.8542);
    expect(res.offsetHours).toBe(7);
    expect(res.source).toBe('offline_iana');
    expect(res.timeZoneId).toBe('Asia/Ho_Chi_Minh');
  });

  it('falls back to solar meridian with explicit metadata for unknown ocean location', () => {
    // Middle of Pacific: 0.0° N, -150.0° W (lng = -150 -> -10)
    const res = resolveTimezone(0.0, -150.0);
    expect(res.offsetHours).toBe(-10);
    expect(res.source).toBe('solar_meridian_fallback');
  });
});
