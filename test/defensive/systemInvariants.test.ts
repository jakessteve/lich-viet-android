import { describe, it, expect, beforeEach } from 'vitest';
import { sanitizePlainText, sanitizeCoordinates, escapeSvgText, escapeHtml } from '@/utils/security';
import { getCivilDateForOffset, estimateTimezoneOffsetHours } from '@/utils/geo';
import { useProfileVaultStore, DEFAULT_PROFILE } from '@/stores/profileVaultStore';
import { getSolarTerm } from '@/utils/foundationalLayer';
import { calculateSwissNatalChart, type SwissNatalEphemeris } from '@/services/astrology/swissNatalChart';
import { CalculationFlag, HouseSystem } from '@swisseph/core';

describe('Zero-Trust Defensive & Boundary Test Suite', () => {
  // ── 1. Security & Sanitization Boundaries ───────────────────
  describe('Security Sanitization', () => {
    it('handles nested malicious script tags without bypass', () => {
      const payload = '<scr<script>ipt>alert(1)</script>';
      const sanitized = sanitizePlainText(payload);
      expect(sanitized).not.toContain('<script>');
    });

    it('neutralizes protocol injection (javascript: and data:)', () => {
      expect(sanitizePlainText('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizePlainText('javjavascript:ascript:void(0)')).toBe('void(0)');
      expect(sanitizePlainText('data:text/html;base64,PHNjcmlwdD4=')).toBe('');
    });

    it('handles non-string and empty inputs gracefully', () => {
      expect(sanitizePlainText(null)).toBe('');
      expect(sanitizePlainText(undefined)).toBe('');
      expect(sanitizePlainText(12345 as unknown as string)).toBe('');
      expect(sanitizePlainText('')).toBe('');
      expect(escapeHtml(null)).toBe('');
      expect(escapeSvgText(null)).toBe('');
    });

    it('bounds coordinates to strict geographic boundaries', () => {
      expect(sanitizeCoordinates(100, 200)).toEqual({ lat: 90, lng: 180 });
      expect(sanitizeCoordinates(-120, -300)).toEqual({ lat: -90, lng: -180 });
      expect(sanitizeCoordinates(NaN, Infinity)).toEqual({ lat: 0, lng: 0 });
    });
  });

  // ── 2. Geo-Temporal Crash Immunity ─────────────────────────
  describe('Geo-Temporal Invariants', () => {
    it('safely recovers from invalid Date objects without crashing', () => {
      const invalidDate = new Date(NaN);
      const civil = getCivilDateForOffset(invalidDate, 7);
      expect(Number.isFinite(civil.getTime())).toBe(true);
      expect(civil.getFullYear()).toBe(2000);
    });

    it('clamps extreme timezone offsets to valid planetary bounds [-12, +14]', () => {
      expect(estimateTimezoneOffsetHours(180)).toBe(12);
      expect(estimateTimezoneOffsetHours(-180)).toBe(-12);
      expect(estimateTimezoneOffsetHours(NaN)).toBe(7);
    });
  });

  // ── 3. Profile Vault Concurrency & State Isolation ─────────
  describe('Profile Vault Concurrency', () => {
    beforeEach(() => {
      useProfileVaultStore.setState({
        activeProfile: { ...DEFAULT_PROFILE },
        savedProfiles: [],
        isLoading: false,
      });
    });

    it('preserves user edits and newly created ID without race clobbering', async () => {
      const store = useProfileVaultStore.getState();
      store.setActiveProfile({
        name: 'Custom User Test',
        solarDate: '1990-01-01',
      });

      const saved = await store.saveCurrentAsProfile('Custom User Test');
      const active = useProfileVaultStore.getState().activeProfile;

      expect(active.id).toBe(saved.id);
      expect(active.name).toBe('Custom User Test');
      expect(active.solarDate).toBe('1990-01-01');
    });
  });

  // ── 4. Astronomical Cache Bounds ───────────────────────────
  describe('Astronomical Calculations', () => {
    it('evaluates solar terms stably across varying Julian days', () => {
      for (let i = 0; i < 24; i++) {
        const jd = 2460350.5 + i * 15.2;
        const term = getSolarTerm(jd);
        expect(typeof term).toBe('string');
        expect(term.length).toBeGreaterThan(0);
      }
    });

    it('calculates Western natal chart at polar latitude falling back to Porphyry when Placidus fails', async () => {
      const REQUIRED_FLAGS = CalculationFlag.SwissEphemeris | CalculationFlag.Speed;

      const polarEphemeris: SwissNatalEphemeris = {
        version: () => 'test-swiss',
        dateToJulianDay: (date: Date) => date.getTime() / 86_400_000 + 2_440_587.5,
        calculatePosition: (_julianDay: number, body: number, requestedFlags: number) => ({
          longitude: (((Number(body) * 23.75 + 280.071588) % 360) + 360) % 360,
          latitude: 0.1,
          distance: 1,
          longitudeSpeed: 0.8,
          latitudeSpeed: 0,
          distanceSpeed: 0,
          flags: Number(requestedFlags) || REQUIRED_FLAGS,
        }),
        calculateHouses: (_julianDay: number, _latitude: number, _longitude: number, houseSystem?: HouseSystem) => {
          if (houseSystem === HouseSystem.Placidus) {
            throw new Error('House calculation failed at polar latitude');
          }
          return {
            cusps: [0, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345],
            ascendant: 15,
            mc: 285,
            armc: 0,
            vertex: 205,
            equatorialAscendant: 0,
            coAscendant1: 0,
            coAscendant2: 0,
            polarAscendant: 0,
            houseSystem: HouseSystem.Porphyrius,
          };
        },
      };

      const polarChart = await calculateSwissNatalChart(
        {
          birthDate: new Date(1995, 7, 15),
          birthHour: 12,
          birthMinute: 0,
          latitude: 78.2232, // Longyearbyen, Svalbard (Arctic)
          longitude: 15.6267,
          timezone: 2,
          houseSystem: 'placidus',
        },
        { ephemeris: polarEphemeris },
      );

      expect(polarChart).toBeDefined();
      expect(polarChart.houses.length).toBe(12);
      expect(Number.isFinite(polarChart.angles.Ascendant.longitude)).toBe(true);
      expect(polarChart.angles.Ascendant.longitude).toBe(15);
    });
  });
});
