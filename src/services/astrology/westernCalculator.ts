import { unixMsToJulianDay, buildTopocentricObserver, computeTopocentricPlanetarySnapshot } from '@omce/core-logic';
import {
  computeDignity,
  detectMinorAspects,
  computePorphyryCusps,
  computeDispositorTree,
  detectChartShape,
  computePartOfFortune,
} from '@omce/core-logic';
import type { WesternChartInput } from '../../types/astrology';

export interface PlanetPosition {
  body: string;
  tropicalLongitude: number;
  siderealLongitude: number;
  sign: string;
  signIndex: number;
  degreeInSign: number;
  house: number;
  retrograde: boolean;
  nakshatra: string;
  nakshatraIndex: number;
  pada: number;
  ra: number;
  dec: number;
  distance: number;
}

export interface DignityResult {
  body: string;
  domicile: boolean;
  exaltation: boolean;
  detriment: boolean;
  fall: boolean;
  dignityScore: number;
  domicileRuler: string;
  exaltationRuler: string;
}

export interface AspectResult {
  planetA: string;
  planetB: string;
  type: string;
  orb: number;
}

export interface HouseCusp {
  index: number;
  longitude: number;
  sign: string;
  signIndex: number;
}

export interface WesternChartResult {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  dignities: DignityResult[];
  aspects: AspectResult[];
  dispositorTree: Record<string, { ruler: string; sign: string; dispositorSign?: string }> | null;
  chartShape: { shape: string; reason: string } | null;
  partOfFortune: { longitude: number; sign: string; signIndex: number };
  ascendant: number;
  midheaven: number;
}

const SIGNS = [
  'Bạch Dương',
  'Kim Ngưu',
  'Song Tử',
  'Cự Giải',
  'Sư Tử',
  'Xử Nữ',
  'Thiên Bình',
  'Bọ Cạp',
  'Nhân Mã',
  'Ma Kết',
  'Bảo Bình',
  'Song Ngư',
];

function getSign(longitude: number) {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  return { sign: SIGNS[index], signIndex: index, degree: normalized % 30 };
}

function assignHouse(longitude: number, cusps: number[]): number {
  const normalized = ((longitude % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    if (start <= end) {
      if (normalized >= start && normalized < end) return i + 1;
    } else {
      if (normalized >= start || normalized < end) return i + 1;
    }
  }
  return 1;
}

export function calculateWesternChartForJulianDay(
  julianDay: number,
  latitude: number,
  longitude: number,
  ayanamsaMode: string = 'lahiri',
): WesternChartResult {
  const observer = buildTopocentricObserver({
    julianDay,
    latitude,
    longitude,
    altitudeMeters: 0,
  });

  const snapshot = computeTopocentricPlanetarySnapshot(observer, ayanamsaMode);

  const houseData = computePorphyryCusps(observer);
  const cuspsArray = houseData.cusps;

  const ascendant = houseData.ascendant;
  const midheaven = houseData.midheaven;

  const snapshotWithPositions = snapshot as Array<{
    body: string;
    tropicalLongitude: number;
    siderealLongitude: number;
    nakshatra: { index: number; name: string; pada: number };
    equatorial: { rightAscension: number; declination: number };
    horizontal: { azimuth: number; altitude: number };
  }>;
  const planets: PlanetPosition[] = snapshotWithPositions.map((p) => {
    const { sign, signIndex, degree } = getSign(p.tropicalLongitude);
    const house = assignHouse(p.tropicalLongitude, cuspsArray);
    const nakshatra = p.nakshatra;
    return {
      body: p.body,
      tropicalLongitude: p.tropicalLongitude,
      siderealLongitude: p.siderealLongitude,
      sign,
      signIndex,
      degreeInSign: degree,
      house,
      retrograde: false,
      nakshatra: nakshatra?.name || '',
      nakshatraIndex: nakshatra?.index ?? -1,
      pada: nakshatra?.pada ?? 0,
      ra: p.equatorial?.rightAscension ?? 0,
      dec: p.equatorial?.declination ?? 0,
      distance: 0,
    };
  });

  const dignities: DignityResult[] = planets.map((p) => {
    const d = computeDignity(p.body, p.tropicalLongitude) as { sign: string; dignity: string; score: number };
    return {
      body: p.body,
      domicile: d.dignity === 'domicile',
      exaltation: d.dignity === 'exaltation',
      detriment: d.dignity === 'detriment',
      fall: d.dignity === 'fall',
      dignityScore: d.score,
      domicileRuler: d.dignity === 'domicile' ? `Chúa tể ${d.sign}` : '',
      exaltationRuler: d.dignity === 'exaltation' ? `Vượng tại ${d.sign}` : '',
    };
  });

  const aspects: AspectResult[] = detectMinorAspects(planets);

  const dispositorTree = computeDispositorTree(planets);
  const chartShape = detectChartShape(planets);
  const pof = computePartOfFortune(
    planets.find((p) => p.body === 'sun')?.tropicalLongitude ?? 0,
    planets.find((p) => p.body === 'moon')?.tropicalLongitude ?? 0,
    ascendant,
    true,
  );
  const houses: HouseCusp[] = cuspsArray.map((cusp: number, index: number) => {
    const { sign, signIndex } = getSign(cusp);
    return { index: index + 1, longitude: cusp, sign, signIndex };
  });

  return buildResult(planets, dignities, aspects, dispositorTree, chartShape, pof, ascendant, midheaven, houses);
}

function buildResult(
  planets: PlanetPosition[],
  dignities: DignityResult[],
  aspects: AspectResult[],
  dispositorTree: WesternChartResult['dispositorTree'],
  chartShape: WesternChartResult['chartShape'],
  pof: number,
  ascendant: number,
  midheaven: number,
  houses: HouseCusp[],
): WesternChartResult {
  const { sign: pofSign, signIndex: pofSignIndex } = getSign(pof);
  return {
    planets,
    houses,
    dignities,
    aspects,
    dispositorTree,
    chartShape,
    partOfFortune: { longitude: pof, sign: pofSign, signIndex: pofSignIndex },
    ascendant,
    midheaven,
  };
}

export function calculateWesternChart(input: WesternChartInput & { ayanamsa?: string }): WesternChartResult {
  const birthDate = input.birthDate instanceof Date ? input.birthDate : new Date(input.birthDate);
  const julianDay = unixMsToJulianDay(birthDate.getTime());
  return calculateWesternChartForJulianDay(julianDay, input.latitude, input.longitude, input.ayanamsa ?? 'lahiri');
}
