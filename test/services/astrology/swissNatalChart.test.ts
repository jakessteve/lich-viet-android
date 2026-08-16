import { CalculationFlag, HouseSystem } from '@swisseph/core';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { WesternChartInput } from '@/types/astrology';
import {
  ASPECT_DEFINITIONS,
  LOCAL_EPHEMERIS_FILES,
  REQUIRED_OBJECT_SCHEMA,
  calculateSwissNatalChart,
  createRetryableSwissEphemerisLoader,
  fixedOffsetBirthToUtc,
  isDayChartFromSolarAltitude,
  type SwissNatalEphemeris,
} from '@/services/astrology/swissNatalChart';

const REQUIRED_FLAGS = CalculationFlag.SwissEphemeris | CalculationFlag.Speed;

const input: WesternChartInput = {
  birthDate: new Date(2000, 0, 1),
  birthHour: 12,
  birthMinute: 0,
  latitude: 21.0285,
  longitude: 105.8542,
  timezone: 7,
  locationName: 'Hà Nội',
};

function fakeEphemeris(flags = REQUIRED_FLAGS): SwissNatalEphemeris {
  return {
    version: () => 'test-swiss',
    dateToJulianDay: (date) => date.getTime() / 86_400_000 + 2_440_587.5,
    calculatePosition: (_julianDay, body, requestedFlags) => ({
      longitude:
        Number(requestedFlags) & CalculationFlag.Equatorial
          ? 100 + Number(body)
          : (((Number(body) * 23.75 + 280.071588) % 360) + 360) % 360,
      latitude:
        Number(requestedFlags) & CalculationFlag.Equatorial
          ? -10 + Number(body) * 0.2
          : Number(body) % 5 === 0
            ? 0
            : 0.1,
      distance: 1 + Number(body) / 100,
      longitudeSpeed: Number(body) % 3 === 0 ? -0.2 : 0.8,
      latitudeSpeed: 0,
      distanceSpeed: 0,
      flags: flags === REQUIRED_FLAGS ? Number(requestedFlags) : flags,
    }),
    calculateHouses: (_julianDay, _latitude, _longitude, houseSystem) => ({
      cusps: [0, 14, 44, 74, 104, 134, 164, 194, 224, 254, 284, 314, 344],
      ascendant: 14,
      mc: 284,
      armc: 0,
      vertex: 201,
      equatorialAscendant: 0,
      coAscendant1: 0,
      coAscendant2: 0,
      polarAscendant: 0,
      houseSystem: houseSystem ?? HouseSystem.Placidus,
    }),
  };
}

describe('Swiss natal application adapter', () => {
  it('converts selected wall time using the explicit fixed UTC offset', () => {
    expect(fixedOffsetBirthToUtc(input).toISOString()).toBe('2000-01-01T05:00:00.000Z');
  });

  it('rejects unsupported local/UTC boundaries before calculation', () => {
    expect(() =>
      fixedOffsetBirthToUtc({
        ...input,
        birthDate: new Date(1800, 0, 1),
      }),
    ).toThrow(/1800-01-02/);
    expect(
      fixedOffsetBirthToUtc({
        ...input,
        birthDate: new Date(2399, 11, 31),
        birthHour: 23,
        birthMinute: 59,
        timezone: -14,
      }).toISOString(),
    ).toBe('2400-01-01T13:59:00.000Z');
    expect(() =>
      fixedOffsetBirthToUtc({
        ...input,
        birthDate: new Date(2400, 0, 1),
      }),
    ).toThrow(/1800-01-02/);
    expect(
      fixedOffsetBirthToUtc({
        ...input,
        birthDate: new Date(1800, 0, 2),
        birthHour: 0,
        timezone: 14,
      }).toISOString(),
    ).toBe('1800-01-01T10:00:00.000Z');
  });

  it('treats the exact solar horizon as a day chart', () => {
    expect(isDayChartFromSolarAltitude(0)).toBe(true);
    expect(isDayChartFromSolarAltitude(-Number.EPSILON)).toBe(false);
  });

  it('retries local Swiss initialization after a rejected attempt', async () => {
    let attempts = 0;
    const expected = fakeEphemeris();
    const load = createRetryableSwissEphemerisLoader(async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('asset unavailable');
      return expected;
    });

    await expect(load()).rejects.toThrow(/asset unavailable/);
    await expect(load()).resolves.toBe(expected);
    expect(attempts).toBe(2);
  });

  it('declares the exact local ephemeris assets and 11-aspect table', () => {
    expect(LOCAL_EPHEMERIS_FILES.map((entry) => entry.name)).toEqual(['sepl_18.se1', 'semo_18.se1', 'seas_18.se1']);
    expect(ASPECT_DEFINITIONS).toHaveLength(11);
    expect(ASPECT_DEFINITIONS.map(({ id, angle, orb }) => [id, angle, orb])).toEqual([
      ['conjunction', 0, 8],
      ['opposition', 180, 8],
      ['trine', 120, 7],
      ['square', 90, 7],
      ['sextile', 60, 6],
      ['quincunx', 150, 3],
      ['semi-sextile', 30, 2],
      ['semi-square', 45, 2],
      ['sesquiquadrate', 135, 2],
      ['quintile', 72, 2],
      ['bi-quintile', 144, 2],
    ]);
    for (const file of LOCAL_EPHEMERIS_FILES) {
      expect(statSync(resolve('public', file.path)).isFile()).toBe(true);
    }
    expect(REQUIRED_OBJECT_SCHEMA.map(({ id, name, category, isAngle }) => [id, name, category, isAngle])).toEqual([
      ['planet:sun', 'Sun', 'planet', false],
      ['planet:moon', 'Moon', 'planet', false],
      ['planet:mercury', 'Mercury', 'planet', false],
      ['planet:venus', 'Venus', 'planet', false],
      ['planet:mars', 'Mars', 'planet', false],
      ['planet:jupiter', 'Jupiter', 'planet', false],
      ['planet:saturn', 'Saturn', 'planet', false],
      ['planet:uranus', 'Uranus', 'planet', false],
      ['planet:neptune', 'Neptune', 'planet', false],
      ['planet:pluto', 'Pluto', 'planet', false],
      ['centaur:chiron', 'Chiron', 'centaur', false],
      ['lunar-point:mean-lilith', 'Mean Lilith', 'lunar_point', false],
      ['lunar-point:true-north-node', 'True Node', 'lunar_point', false],
      ['derived:true-south-node', 'South Node', 'lunar_point', false],
      ['derived:part-of-fortune', 'Part of Fortune', 'arabic_part', false],
      ['angle:vertex', 'Vertex', 'angle', true],
      ['asteroid:ceres', 'Ceres', 'asteroid', false],
      ['asteroid:pallas', 'Pallas', 'asteroid', false],
      ['asteroid:juno', 'Juno', 'asteroid', false],
      ['asteroid:vesta', 'Vesta', 'asteroid', false],
    ]);
  });

  it('returns the ordered 20-object Swiss contract, houses, angles, and aspects', async () => {
    const result = await calculateSwissNatalChart(input, { ephemeris: fakeEphemeris() });

    expect(result.objects.map(({ id, name, category, isAngle }) => [id, name, category, isAngle])).toEqual(
      REQUIRED_OBJECT_SCHEMA.map(({ id, name, category, isAngle }) => [id, name, category, isAngle]),
    );
    expect(result.objects).toHaveLength(20);
    expect(result.houses).toHaveLength(12);
    expect(Object.keys(result.angles)).toEqual(['Ascendant', 'Descendant', 'Midheaven', 'Imum Coeli']);
    expect(result.angles.Descendant.longitude).toBe(194);
    expect(result.angles['Imum Coeli'].longitude).toBe(104);
    expect(result.aspects.length).toBeGreaterThan(0);
    expect(result.objects.find((body) => body.id === 'derived:true-south-node')?.speed).toBe(
      result.objects.find((body) => body.id === 'lunar-point:true-north-node')?.speed,
    );
    expect(result.objects.find((body) => body.id === 'derived:true-south-node')?.retrograde).toBe(
      result.objects.find((body) => body.id === 'lunar-point:true-north-node')?.retrograde,
    );
    expect(result.objects.find((body) => body.id === 'derived:part-of-fortune')?.speed).toBeNull();
    expect(result.objects.find((body) => body.id === 'angle:vertex')?.retrograde).toBeNull();
    expect(result.metadata.ephemeris).toBe('Swiss Ephemeris files');
    expect(result.metadata.fixedUtcOffsetHours).toBe(7);
    expect(result.metadata.requestedFlags).toBe(REQUIRED_FLAGS);
    expect(result.metadata.returnedFlags['planet:sun']).toBe(REQUIRED_FLAGS);
    expect(Object.keys(result.metadata.returnedFlags)).toHaveLength(17);
    expect(result.metadata.objectPolicyVersion).toBe('western-natal-20-v1');
    expect(result.metadata.aspectPolicyVersion).toBe('western-aspects-11-v1');
    expect(result.metadata.returnedEquatorialFlags['planet:sun']).toBe(REQUIRED_FLAGS | CalculationFlag.Equatorial);
    expect(result.metadata.partOfFortuneAltitudePolicy).toBe('geocentric-equatorial-altitude-v1');
    const sun = result.objects[0];
    expect(sun.rightAscension).toBe(100);
    expect(sun.declination).toBe(-10);
    expect(sun.latitudeSpeed).toBe(0);
    expect(sun.distanceSpeed).toBe(0);
    expect(result.legacyResult.planets[0].ra).toBe(100);
    expect(result.legacyResult.planets[0].dec).toBe(-10);
    expect(
      result.legacyResult.aspects.every((aspect) =>
        ASPECT_DEFINITIONS.some((definition) => definition.id === aspect.type),
      ),
    ).toBe(true);
  });

  it('rejects a required body when Swiss falls back to Moshier', async () => {
    const fallbackFlags = CalculationFlag.MoshierEphemeris | CalculationFlag.Speed;

    await expect(calculateSwissNatalChart(input, { ephemeris: fakeEphemeris(fallbackFlags) })).rejects.toThrow(
      /Sun.*Swiss Ephemeris/i,
    );
  });
});
