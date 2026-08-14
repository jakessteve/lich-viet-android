import { SwissEphemeris } from '@swisseph/browser';
import {
  Asteroid,
  CalculationFlag,
  HouseSystem,
  LunarPoint,
  Planet,
  type CelestialBody,
} from '@swisseph/core';
import type { WesternChartInput } from '../../types/astrology';
import type {
  AspectResult,
  HouseCusp as LegacyHouseCusp,
  PlanetPosition,
  WesternChartResult,
} from './westernCalculator';

export type SwissNatalObjectCategory =
  | 'planet'
  | 'centaur'
  | 'lunar_point'
  | 'asteroid'
  | 'arabic_part'
  | 'angle';

export interface SwissNatalObjectSchemaEntry {
  id: string;
  name: string;
  nameVi: string;
  symbol: string;
  category: SwissNatalObjectCategory;
  isAngle: boolean;
  swissBody?: CelestialBody;
  legacyBody: string;
}

export const REQUIRED_OBJECT_SCHEMA: readonly SwissNatalObjectSchemaEntry[] = [
  { id: 'planet:sun', name: 'Sun', nameVi: 'Mặt Trời', symbol: '☉', category: 'planet', isAngle: false, swissBody: Planet.Sun, legacyBody: 'sun' },
  { id: 'planet:moon', name: 'Moon', nameVi: 'Mặt Trăng', symbol: '☽', category: 'planet', isAngle: false, swissBody: Planet.Moon, legacyBody: 'moon' },
  { id: 'planet:mercury', name: 'Mercury', nameVi: 'Sao Thủy', symbol: '☿', category: 'planet', isAngle: false, swissBody: Planet.Mercury, legacyBody: 'mercury' },
  { id: 'planet:venus', name: 'Venus', nameVi: 'Sao Kim', symbol: '♀', category: 'planet', isAngle: false, swissBody: Planet.Venus, legacyBody: 'venus' },
  { id: 'planet:mars', name: 'Mars', nameVi: 'Sao Hỏa', symbol: '♂', category: 'planet', isAngle: false, swissBody: Planet.Mars, legacyBody: 'mars' },
  { id: 'planet:jupiter', name: 'Jupiter', nameVi: 'Sao Mộc', symbol: '♃', category: 'planet', isAngle: false, swissBody: Planet.Jupiter, legacyBody: 'jupiter' },
  { id: 'planet:saturn', name: 'Saturn', nameVi: 'Sao Thổ', symbol: '♄', category: 'planet', isAngle: false, swissBody: Planet.Saturn, legacyBody: 'saturn' },
  { id: 'planet:uranus', name: 'Uranus', nameVi: 'Thiên Vương', symbol: '♅', category: 'planet', isAngle: false, swissBody: Planet.Uranus, legacyBody: 'uranus' },
  { id: 'planet:neptune', name: 'Neptune', nameVi: 'Hải Vương', symbol: '♆', category: 'planet', isAngle: false, swissBody: Planet.Neptune, legacyBody: 'neptune' },
  { id: 'planet:pluto', name: 'Pluto', nameVi: 'Diêm Vương', symbol: '♇', category: 'planet', isAngle: false, swissBody: Planet.Pluto, legacyBody: 'pluto' },
  { id: 'centaur:chiron', name: 'Chiron', nameVi: 'Chiron', symbol: '⚷', category: 'centaur', isAngle: false, swissBody: Asteroid.Chiron, legacyBody: 'chiron' },
  { id: 'lunar-point:mean-lilith', name: 'Mean Lilith', nameVi: 'Lilith Trung Bình', symbol: '⚸', category: 'lunar_point', isAngle: false, swissBody: LunarPoint.MeanApogee, legacyBody: 'lilith' },
  { id: 'lunar-point:true-north-node', name: 'True Node', nameVi: 'La Hầu', symbol: '☊', category: 'lunar_point', isAngle: false, swissBody: LunarPoint.TrueNode, legacyBody: 'northnode' },
  { id: 'derived:true-south-node', name: 'South Node', nameVi: 'Kế Đô', symbol: '☋', category: 'lunar_point', isAngle: false, legacyBody: 'southnode' },
  { id: 'derived:part-of-fortune', name: 'Part of Fortune', nameVi: 'Điểm May Mắn', symbol: '⊗', category: 'arabic_part', isAngle: false, legacyBody: 'partoffortune' },
  { id: 'angle:vertex', name: 'Vertex', nameVi: 'Vertex', symbol: 'Vx', category: 'angle', isAngle: true, legacyBody: 'vertex' },
  { id: 'asteroid:ceres', name: 'Ceres', nameVi: 'Ceres', symbol: '⚳', category: 'asteroid', isAngle: false, swissBody: Asteroid.Ceres, legacyBody: 'ceres' },
  { id: 'asteroid:pallas', name: 'Pallas', nameVi: 'Pallas', symbol: '⚴', category: 'asteroid', isAngle: false, swissBody: Asteroid.Pallas, legacyBody: 'pallas' },
  { id: 'asteroid:juno', name: 'Juno', nameVi: 'Juno', symbol: '⚵', category: 'asteroid', isAngle: false, swissBody: Asteroid.Juno, legacyBody: 'juno' },
  { id: 'asteroid:vesta', name: 'Vesta', nameVi: 'Vesta', symbol: '⚶', category: 'asteroid', isAngle: false, swissBody: Asteroid.Vesta, legacyBody: 'vesta' },
] as const;

export interface SwissNatalAspectDefinition {
  id: string;
  name: string;
  angle: number;
  orb: number;
  color: string;
  opacity: number;
  width: number;
  dashPattern: string;
  layer: number;
}

export const ASPECT_DEFINITIONS: readonly SwissNatalAspectDefinition[] = [
  { id: 'conjunction', name: 'Conjunction', angle: 0, orb: 8, color: '#7A4E9D', opacity: 0.72, width: 1.35, dashPattern: 'solid', layer: 5 },
  { id: 'opposition', name: 'Opposition', angle: 180, orb: 8, color: '#D1495B', opacity: 0.78, width: 1.3, dashPattern: 'solid', layer: 4 },
  { id: 'trine', name: 'Trine', angle: 120, orb: 7, color: '#315FA8', opacity: 0.74, width: 1.15, dashPattern: 'solid', layer: 3 },
  { id: 'square', name: 'Square', angle: 90, orb: 7, color: '#D1495B', opacity: 0.76, width: 1.2, dashPattern: 'solid', layer: 4 },
  { id: 'sextile', name: 'Sextile', angle: 60, orb: 6, color: '#2E8B73', opacity: 0.7, width: 1.05, dashPattern: 'solid', layer: 2 },
  { id: 'quincunx', name: 'Quincunx', angle: 150, orb: 3, color: '#8A5CA8', opacity: 0.58, width: 0.95, dashPattern: '5 4', layer: 1 },
  { id: 'semi-sextile', name: 'Semi-sextile', angle: 30, orb: 2, color: '#7C8796', opacity: 0.42, width: 0.8, dashPattern: '2 4', layer: 0 },
  { id: 'semi-square', name: 'Semi-square', angle: 45, orb: 2, color: '#C56A75', opacity: 0.48, width: 0.85, dashPattern: '3 3', layer: 1 },
  { id: 'sesquiquadrate', name: 'Sesquiquadrate', angle: 135, orb: 2, color: '#C56A75', opacity: 0.48, width: 0.85, dashPattern: '3 3', layer: 1 },
  { id: 'quintile', name: 'Quintile', angle: 72, orb: 2, color: '#8A6BBE', opacity: 0.5, width: 0.85, dashPattern: '1 3', layer: 1 },
  { id: 'bi-quintile', name: 'Bi-quintile', angle: 144, orb: 2, color: '#8A6BBE', opacity: 0.5, width: 0.85, dashPattern: '1 3', layer: 1 },
] as const;

export const LOCAL_EPHEMERIS_FILES = [
  { name: 'sepl_18.se1', path: 'ephe/sepl_18.se1' },
  { name: 'semo_18.se1', path: 'ephe/semo_18.se1' },
  { name: 'seas_18.se1', path: 'ephe/seas_18.se1' },
] as const;

export interface SwissNatalEphemeris {
  version(): string;
  dateToJulianDay(date: Date): number;
  calculatePosition(
    julianDay: number,
    body: CelestialBody,
    flags?: number,
  ): SwissPositionResult;
  calculateHouses(
    julianDay: number,
    latitude: number,
    longitude: number,
    houseSystem?: HouseSystem,
  ): SwissHouseResult;
}

export interface SwissPositionResult {
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed: number;
  latitudeSpeed: number;
  distanceSpeed: number;
  flags: number;
}

export interface SwissHouseResult {
  cusps: number[];
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
  equatorialAscendant: number;
  coAscendant1: number;
  coAscendant2: number;
  polarAscendant: number;
  houseSystem: HouseSystem;
}

export interface SwissNatalObject {
  id: string;
  name: string;
  nameVi: string;
  symbol: string;
  category: SwissNatalObjectCategory;
  isAngle: boolean;
  longitude: number;
  latitude: number;
  distance: number | null;
  speed: number | null;
  latitudeSpeed: number | null;
  distanceSpeed: number | null;
  rightAscension: number | null;
  declination: number | null;
  sign: string;
  signVi: string;
  degree: number;
  minute: number;
  retrograde: boolean | null;
  house: number;
}

export interface SwissNatalHouse {
  number: number;
  longitude: number;
  sign: string;
  signVi: string;
  degree: number;
  minute: number;
}

export interface SwissNatalAngle {
  id: string;
  name: string;
  nameVi: string;
  symbol: string;
  longitude: number;
  sign: string;
  signVi: string;
  degree: number;
  minute: number;
  isAngle: true;
}

export type SwissNatalAngleName = 'Ascendant' | 'Descendant' | 'Midheaven' | 'Imum Coeli';

export interface SwissNatalAspect {
  id: string;
  name: string;
  objectAId: string;
  objectAName: string;
  objectBId: string;
  objectBName: string;
  separation: number;
  exactAngle: number;
  allowedOrb: number;
  orbDifference: number;
  state: 'applying' | 'separating' | 'unknown';
  strength: number;
  color: string;
  opacity: number;
  width: number;
  dashPattern: string;
  layer: number;
}

export interface SwissNatalChartResult {
  birth: {
    utc: string;
    julianDayUt: number;
    latitude: number;
    longitude: number;
    fixedUtcOffsetHours: number;
    locationName?: string;
    houseSystem: 'placidus';
  };
  metadata: {
    engine: '@swisseph/browser';
    version: string;
    ephemeris: 'Swiss Ephemeris files';
    fixedUtcOffsetHours: number;
    requestedFlags: number;
    returnedFlags: Record<string, number>;
    requestedEquatorialFlags: number;
    returnedEquatorialFlags: Record<string, number>;
    objectPolicyVersion: 'western-natal-20-v1';
    aspectPolicyVersion: 'western-aspects-11-v1';
    timePolicy: 'fixed-utc-offset-v1';
    partOfFortuneAltitudePolicy: 'geocentric-equatorial-altitude-v1';
    partOfFortuneSolarAltitudeDeg: number;
  };
  objects: SwissNatalObject[];
  houses: SwissNatalHouse[];
  angles: Record<SwissNatalAngleName, SwissNatalAngle>;
  aspects: SwissNatalAspect[];
  legacyResult: WesternChartResult;
}

export interface CalculateSwissNatalOptions {
  ephemeris?: SwissNatalEphemeris;
}

const REQUIRED_FLAGS = CalculationFlag.SwissEphemeris | CalculationFlag.Speed;
const EQUATORIAL_FLAGS = REQUIRED_FLAGS | CalculationFlag.Equatorial;
const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] as const;
const SIGN_NAMES_VI = ['Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải', 'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp', 'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư'] as const;
const MOTION_EPSILON = 1e-12;
const MIN_LOCAL_DATE = Date.UTC(1800, 0, 2);
const MAX_LOCAL_DATE = Date.UTC(2399, 11, 31);
const MIN_UTC_INSTANT = Date.UTC(1800, 0, 1, 6);
// Verified upper endpoint of the bundled 18-series files. Local 2399-12-31
// inputs are therefore accepted for every supported fixed offset through the
// complete UTC-14 day, while later instants fail before Swiss calculation.
const MAX_UTC_INSTANT = Date.UTC(2400, 0, 10, 20, 0, 0, 0);

function normalize(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

function degreesToRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

function publicAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.endsWith('/') ? base : `${base}/`}${path}`;
}

function assetUrl(assetBaseUrl: string | undefined, path: string): string {
  if (!assetBaseUrl) return publicAssetUrl(path);
  return `${assetBaseUrl.endsWith('/') ? assetBaseUrl : `${assetBaseUrl}/`}${path}`;
}

export function createRetryableSwissEphemerisLoader(
  factory: () => Promise<SwissNatalEphemeris>,
): () => Promise<SwissNatalEphemeris> {
  let pending: Promise<SwissNatalEphemeris> | undefined;
  return () => {
    if (!pending) {
      pending = factory().catch((error) => {
        pending = undefined;
        throw error;
      });
    }
    return pending;
  };
}

export async function initializeBundledSwissNatalEphemeris(
  assetBaseUrl?: string,
): Promise<SwissNatalEphemeris> {
  try {
    const ephemeris = new SwissEphemeris();
    await ephemeris.init(assetUrl(assetBaseUrl, 'swisseph.wasm'));
    await ephemeris.loadEphemerisFiles(
      LOCAL_EPHEMERIS_FILES.map((file) => ({ name: file.name, url: assetUrl(assetBaseUrl, file.path) })),
    );
    ephemeris.setEphemerisPath('/ephemeris');
    const adapter: SwissNatalEphemeris = {
      version: () => ephemeris.version(),
      dateToJulianDay: (date) => ephemeris.dateToJulianDay(date),
      calculatePosition: (julianDay, body, flags) => ephemeris.calculatePosition(julianDay, body, flags),
      calculateHouses: (julianDay, latitude, longitude, houseSystem) => ephemeris.calculateHouses(
        julianDay,
        latitude,
        longitude,
        houseSystem as never,
      ) as SwissHouseResult,
    };
    return adapter;
  } catch (error) {
    throw new Error(`Unable to load the bundled Swiss Ephemeris assets: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const loadDefaultEphemeris = createRetryableSwissEphemerisLoader(
  () => initializeBundledSwissNatalEphemeris(),
);

function validateInput(input: WesternChartInput): void {
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) {
    throw new Error('Birth latitude must be a finite value between -90 and 90 degrees');
  }
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) {
    throw new Error('Birth longitude must be a finite value between -180 and 180 degrees');
  }
  if (!Number.isFinite(input.timezone) || input.timezone < -14 || input.timezone > 14) {
    throw new Error('Fixed UTC offset must be a finite value between -14 and 14 hours');
  }
  if (!Number.isInteger(input.birthHour) || input.birthHour < 0 || input.birthHour > 23) {
    throw new Error('Birth hour must be an integer between 0 and 23');
  }
  if (!Number.isInteger(input.birthMinute) || input.birthMinute < 0 || input.birthMinute > 59) {
    throw new Error('Birth minute must be an integer between 0 and 59');
  }
}

export function fixedOffsetBirthToUtc(input: WesternChartInput): Date {
  validateInput(input);
  const birthDate = input.birthDate instanceof Date ? input.birthDate : new Date(input.birthDate);
  if (Number.isNaN(birthDate.getTime())) throw new Error('Birth date is invalid');
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth();
  const day = birthDate.getDate();
  const localDate = Date.UTC(year, month, day);
  if (localDate < MIN_LOCAL_DATE || localDate > MAX_LOCAL_DATE) {
    throw new Error('Birth date is outside the bundled Swiss Ephemeris range (1800-01-02 through 2399-12-31)');
  }
  const utcMillis = Date.UTC(year, month, day, input.birthHour, input.birthMinute)
    - input.timezone * 3_600_000;
  const utc = new Date(utcMillis);
  if (Number.isNaN(utc.getTime())) throw new Error('Birth date and fixed UTC offset are invalid');
  if (utcMillis < MIN_UTC_INSTANT || utcMillis > MAX_UTC_INSTANT) {
    throw new Error('Converted UTC instant is outside the bundled Swiss Ephemeris UTC range');
  }
  return utc;
}

function zodiacPosition(longitude: number) {
  const normalized = normalize(longitude);
  const signIndex = Math.floor(normalized / 30);
  const withinSign = normalized % 30;
  const degree = Math.floor(withinSign);
  return {
    longitude: normalized,
    sign: SIGN_NAMES[signIndex],
    signVi: SIGN_NAMES_VI[signIndex],
    signIndex,
    degree,
    minute: Math.floor((withinSign - degree) * 60),
  };
}

function assignHouse(longitude: number, cusps: readonly number[]): number {
  const target = normalize(longitude);
  for (let index = 0; index < 12; index += 1) {
    const start = normalize(cusps[index]);
    const end = normalize(cusps[(index + 1) % 12]);
    if (start <= end ? target >= start && target < end : target >= start || target < end) {
      return index + 1;
    }
  }
  return 1;
}

function assertPosition(name: string, position: SwissPositionResult): void {
  const values = [position.longitude, position.latitude, position.distance, position.longitudeSpeed];
  if (!values.every(Number.isFinite)) throw new Error(`${name}: Swiss Ephemeris returned non-finite position data`);
  if ((position.flags & CalculationFlag.SwissEphemeris) === 0
    || (position.flags & CalculationFlag.Speed) === 0
    || (position.flags & CalculationFlag.MoshierEphemeris) !== 0) {
    throw new Error(`${name}: Swiss Ephemeris files and speed data are required; fallback output was rejected`);
  }
}

function makeObject(
  schema: SwissNatalObjectSchemaEntry,
  position: Pick<SwissPositionResult, 'longitude' | 'latitude' | 'distance' | 'longitudeSpeed'>
    & Partial<Pick<SwissPositionResult, 'latitudeSpeed' | 'distanceSpeed'>>,
  cusps: readonly number[],
  motionKnown = true,
  equatorial?: Pick<SwissPositionResult, 'longitude' | 'latitude'>,
): SwissNatalObject {
  const zodiac = zodiacPosition(position.longitude);
  const speed = motionKnown ? position.longitudeSpeed : null;
  return {
    id: schema.id,
    name: schema.name,
    nameVi: schema.nameVi,
    symbol: schema.symbol,
    category: schema.category,
    isAngle: schema.isAngle,
    longitude: zodiac.longitude,
    latitude: position.latitude,
    distance: Number.isFinite(position.distance) ? position.distance : null,
    speed,
    latitudeSpeed: motionKnown && Number.isFinite(position.latitudeSpeed)
      ? position.latitudeSpeed as number
      : null,
    distanceSpeed: motionKnown && Number.isFinite(position.distanceSpeed)
      ? position.distanceSpeed as number
      : null,
    rightAscension: equatorial && Number.isFinite(equatorial.longitude) ? normalize(equatorial.longitude) : null,
    declination: equatorial && Number.isFinite(equatorial.latitude) ? equatorial.latitude : null,
    sign: zodiac.sign,
    signVi: zodiac.signVi,
    degree: zodiac.degree,
    minute: zodiac.minute,
    retrograde: speed === null ? null : speed < 0,
    house: assignHouse(zodiac.longitude, cusps),
  };
}

function makeAngle(
  id: string,
  name: SwissNatalAngleName,
  nameVi: string,
  symbol: string,
  longitude: number,
): SwissNatalAngle {
  const zodiac = zodiacPosition(longitude);
  return { id, name, nameVi, symbol, longitude: zodiac.longitude, sign: zodiac.sign, signVi: zodiac.signVi, degree: zodiac.degree, minute: zodiac.minute, isAngle: true };
}

function solarAltitudeFromEquatorial(julianDay: number, latitude: number, longitude: number, rightAscension: number, declination: number): number {
  const centuries = (julianDay - 2_451_545) / 36_525;
  const gmst = normalize(280.46061837 + 360.98564736629 * (julianDay - 2_451_545)
    + 0.000387933 * centuries * centuries - centuries * centuries * centuries / 38_710_000);
  const hourAngle = degreesToRadians(normalize(gmst + longitude - rightAscension));
  const observerLatitude = degreesToRadians(latitude);
  const declinationRadians = degreesToRadians(declination);
  return Math.asin(
    Math.sin(observerLatitude) * Math.sin(declinationRadians)
    + Math.cos(observerLatitude) * Math.cos(declinationRadians) * Math.cos(hourAngle),
  ) * 180 / Math.PI;
}

export function isDayChartFromSolarAltitude(altitude: number): boolean {
  if (!Number.isFinite(altitude)) throw new Error('Solar altitude must be finite');
  return altitude >= 0;
}

function angularSeparation(first: number, second: number): number {
  const difference = Math.abs(normalize(first) - normalize(second));
  return Math.min(difference, 360 - difference);
}

function motionState(
  first: SwissNatalObject,
  second: SwissNatalObject,
  definition: SwissNatalAspectDefinition,
  orbDifference: number,
): SwissNatalAspect['state'] {
  if (first.speed === null || second.speed === null) return 'unknown';
  const relativeMotion = second.speed - first.speed;
  if (Math.abs(relativeMotion) <= MOTION_EPSILON) return 'unknown';
  if (orbDifference <= MOTION_EPSILON) return 'separating';
  const signedDifference = (second.longitude - first.longitude + 540) % 360 - 180;
  const separation = Math.abs(signedDifference);
  const separationDerivative = (signedDifference > 0 ? 1 : -1) * relativeMotion;
  const orbDerivative = (separation > definition.angle ? 1 : -1) * separationDerivative;
  return orbDerivative < 0 ? 'applying' : 'separating';
}

function calculateAspects(objects: readonly SwissNatalObject[]): SwissNatalAspect[] {
  const aspects: SwissNatalAspect[] = [];
  for (let firstIndex = 0; firstIndex < objects.length; firstIndex += 1) {
    const first = objects[firstIndex];
    for (const second of objects.slice(firstIndex + 1)) {
      const separation = angularSeparation(first.longitude, second.longitude);
      const matches = ASPECT_DEFINITIONS
        .map((definition, index) => ({ definition, index, orbDifference: Math.abs(separation - definition.angle) }))
        .filter(({ definition, orbDifference }) => orbDifference <= definition.orb + 1e-12)
        .sort((a, b) => a.orbDifference / a.definition.orb - b.orbDifference / b.definition.orb || a.index - b.index);
      const match = matches[0];
      if (!match) continue;
      const { definition, orbDifference } = match;
      aspects.push({
        id: definition.id,
        name: definition.name,
        objectAId: first.id,
        objectAName: first.name,
        objectBId: second.id,
        objectBName: second.name,
        separation,
        exactAngle: definition.angle,
        allowedOrb: definition.orb,
        orbDifference,
        state: motionState(first, second, definition, orbDifference),
        strength: Math.max(0, 1 - orbDifference / definition.orb),
        color: definition.color,
        opacity: definition.opacity,
        width: definition.width,
        dashPattern: definition.dashPattern,
        layer: definition.layer,
      });
    }
  }
  return aspects;
}

function buildLegacyResult(
  objects: readonly SwissNatalObject[],
  houses: readonly SwissNatalHouse[],
  aspects: readonly SwissNatalAspect[],
  ascendant: number,
  midheaven: number,
): WesternChartResult {
  const legacyById = new Map(REQUIRED_OBJECT_SCHEMA.map((entry) => [entry.id, entry.legacyBody]));
  const planets: PlanetPosition[] = objects
    .filter((object) => object.id !== 'derived:part-of-fortune' && object.id !== 'angle:vertex')
    .map((object) => ({
      body: legacyById.get(object.id) ?? object.id,
      tropicalLongitude: object.longitude,
      siderealLongitude: object.longitude,
      sign: object.signVi,
      signIndex: SIGN_NAMES.indexOf(object.sign as (typeof SIGN_NAMES)[number]),
      degreeInSign: object.degree + object.minute / 60,
      house: object.house,
      retrograde: object.retrograde === true,
      nakshatra: '',
      nakshatraIndex: -1,
      pada: 0,
      ra: object.rightAscension ?? 0,
      dec: object.declination ?? 0,
      distance: object.distance ?? 0,
    }));
  const legacyHouses: LegacyHouseCusp[] = houses.map((house) => ({
    index: house.number,
    longitude: house.longitude,
    sign: house.signVi,
    signIndex: SIGN_NAMES.indexOf(house.sign as (typeof SIGN_NAMES)[number]),
  }));
  const legacyAspects: AspectResult[] = aspects.map((aspect) => ({
    planetA: legacyById.get(aspect.objectAId) ?? aspect.objectAId,
    planetB: legacyById.get(aspect.objectBId) ?? aspect.objectBId,
    type: aspect.id,
    orb: aspect.orbDifference,
  }));
  const fortune = objects.find((object) => object.id === 'derived:part-of-fortune');
  if (!fortune) throw new Error('Part of Fortune was not assembled');
  return {
    planets,
    houses: legacyHouses,
    dignities: [],
    aspects: legacyAspects,
    dispositorTree: null,
    chartShape: null,
    partOfFortune: { longitude: fortune.longitude, sign: fortune.signVi, signIndex: SIGN_NAMES.indexOf(fortune.sign as (typeof SIGN_NAMES)[number]) },
    ascendant,
    midheaven,
  };
}

export async function calculateSwissNatalChart(
  input: WesternChartInput,
  options: CalculateSwissNatalOptions = {},
): Promise<SwissNatalChartResult> {
  const utc = fixedOffsetBirthToUtc(input);
  const ephemeris = options.ephemeris ?? await loadDefaultEphemeris();
  const julianDay = ephemeris.dateToJulianDay(utc);
  if (!Number.isFinite(julianDay)) throw new Error('Swiss Ephemeris returned an invalid Julian day');

  const houseData = ephemeris.calculateHouses(julianDay, input.latitude, input.longitude, HouseSystem.Placidus);
  if (houseData.houseSystem !== HouseSystem.Placidus) {
    throw new Error(`Swiss Ephemeris returned house system ${String(houseData.houseSystem)} instead of Placidus`);
  }
  const angleValues = [houseData.ascendant, houseData.mc, houseData.vertex];
  if (!angleValues.every(Number.isFinite)) {
    throw new Error('Swiss Ephemeris returned non-finite primary angle data');
  }
  const rawCusps = houseData.cusps.length >= 13 ? houseData.cusps.slice(1, 13) : houseData.cusps.slice(0, 12);
  if (rawCusps.length !== 12 || !rawCusps.every(Number.isFinite)) {
    throw new Error('Swiss Ephemeris did not return twelve finite Placidus house cusps');
  }
  const cusps = rawCusps.map(normalize);
  const calculatedById = new Map<string, SwissNatalObject>();
  const returnedFlags: Record<string, number> = {};
  const returnedEquatorialFlags: Record<string, number> = {};
  for (const schema of REQUIRED_OBJECT_SCHEMA) {
    if (schema.swissBody === undefined) continue;
    let position: SwissPositionResult;
    try {
      position = ephemeris.calculatePosition(julianDay, schema.swissBody, REQUIRED_FLAGS);
    } catch (error) {
      throw new Error(`${schema.name}: Swiss Ephemeris calculation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    assertPosition(schema.name, position);
    returnedFlags[schema.id] = position.flags;
    let equatorial: SwissPositionResult;
    try {
      equatorial = ephemeris.calculatePosition(julianDay, schema.swissBody, EQUATORIAL_FLAGS);
    } catch (error) {
      throw new Error(`${schema.name}: Swiss equatorial calculation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    assertPosition(`${schema.name} equatorial`, equatorial);
    if ((equatorial.flags & CalculationFlag.Equatorial) === 0) {
      throw new Error(`${schema.name}: Swiss equatorial coordinates were requested but not returned`);
    }
    returnedEquatorialFlags[schema.id] = equatorial.flags;
    calculatedById.set(schema.id, makeObject(schema, position, cusps, true, equatorial));
  }

  const northNode = calculatedById.get('lunar-point:true-north-node');
  const sun = calculatedById.get('planet:sun');
  const moon = calculatedById.get('planet:moon');
  if (!northNode || !sun || !moon) throw new Error('Swiss Ephemeris required bodies were not assembled');

  const southSchema = REQUIRED_OBJECT_SCHEMA.find((entry) => entry.id === 'derived:true-south-node');
  const fortuneSchema = REQUIRED_OBJECT_SCHEMA.find((entry) => entry.id === 'derived:part-of-fortune');
  const vertexSchema = REQUIRED_OBJECT_SCHEMA.find((entry) => entry.id === 'angle:vertex');
  if (!southSchema || !fortuneSchema || !vertexSchema) throw new Error('Western natal object registry is incomplete');
  calculatedById.set(southSchema.id, makeObject(southSchema, {
    longitude: normalize(northNode.longitude + 180),
    latitude: -northNode.latitude,
    distance: northNode.distance ?? Number.NaN,
    longitudeSpeed: northNode.speed ?? Number.NaN,
  }, cusps));
  if (sun.rightAscension === null || sun.declination === null) {
    throw new Error('Sun equatorial coordinates are required for Part of Fortune day/night classification');
  }
  const solarAltitude = solarAltitudeFromEquatorial(
    julianDay,
    input.latitude,
    input.longitude,
    sun.rightAscension,
    sun.declination,
  );
  const isDayChart = isDayChartFromSolarAltitude(solarAltitude);
  const fortuneLongitude = isDayChart
    ? normalize(houseData.ascendant + moon.longitude - sun.longitude)
    : normalize(houseData.ascendant + sun.longitude - moon.longitude);
  calculatedById.set(fortuneSchema.id, makeObject(fortuneSchema, {
    longitude: fortuneLongitude,
    latitude: 0,
    distance: Number.NaN,
    longitudeSpeed: Number.NaN,
  }, cusps, false));
  calculatedById.set(vertexSchema.id, makeObject(vertexSchema, {
    longitude: houseData.vertex,
    latitude: 0,
    distance: Number.NaN,
    longitudeSpeed: Number.NaN,
  }, cusps, false));

  const objects = REQUIRED_OBJECT_SCHEMA.map((schema) => {
    const object = calculatedById.get(schema.id);
    if (!object) throw new Error(`${schema.name}: required Western natal object is missing`);
    return object;
  });
  const houses: SwissNatalHouse[] = cusps.map((longitude, index) => {
    const zodiac = zodiacPosition(longitude);
    return { number: index + 1, longitude, sign: zodiac.sign, signVi: zodiac.signVi, degree: zodiac.degree, minute: zodiac.minute };
  });
  const angles: Record<SwissNatalAngleName, SwissNatalAngle> = {
    Ascendant: makeAngle('angle:ascendant', 'Ascendant', 'Cung Mọc', 'ASC', houseData.ascendant),
    Descendant: makeAngle('angle:descendant', 'Descendant', 'Cung Lặn', 'DSC', houseData.ascendant + 180),
    Midheaven: makeAngle('angle:midheaven', 'Midheaven', 'Thiên Đỉnh', 'MC', houseData.mc),
    'Imum Coeli': makeAngle('angle:imum-coeli', 'Imum Coeli', 'Thiên Đế', 'IC', houseData.mc + 180),
  };
  const aspects = calculateAspects(objects);
  return {
    birth: {
      utc: utc.toISOString(),
      julianDayUt: julianDay,
      latitude: input.latitude,
      longitude: input.longitude,
      fixedUtcOffsetHours: input.timezone,
      ...(input.locationName ? { locationName: input.locationName } : {}),
      houseSystem: 'placidus',
    },
    metadata: {
      engine: '@swisseph/browser',
      version: ephemeris.version(),
      ephemeris: 'Swiss Ephemeris files',
      fixedUtcOffsetHours: input.timezone,
      requestedFlags: REQUIRED_FLAGS,
      returnedFlags,
      requestedEquatorialFlags: EQUATORIAL_FLAGS,
      returnedEquatorialFlags,
      objectPolicyVersion: 'western-natal-20-v1',
      aspectPolicyVersion: 'western-aspects-11-v1',
      timePolicy: 'fixed-utc-offset-v1',
      partOfFortuneAltitudePolicy: 'geocentric-equatorial-altitude-v1',
      partOfFortuneSolarAltitudeDeg: solarAltitude,
    },
    objects,
    houses,
    angles,
    aspects,
    legacyResult: buildLegacyResult(objects, houses, aspects, angles.Ascendant.longitude, angles.Midheaven.longitude),
  };
}
