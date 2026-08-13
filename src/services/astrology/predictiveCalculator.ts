import {
  unixMsToJulianDay,
  julianDayToUnixMs,
  buildTopocentricObserver,
  computeTopocentricPlanetarySnapshot,
  computeSolarReturn,
  computeLunarReturn,
  computeCompositeChart,
  computeDavisonChart,
  calculateWesternTransitAspects,
} from '@omce/core-logic';
import {
  calculateWesternChart,
  calculateWesternChartForJulianDay,
  type AspectResult,
  type PlanetPosition,
  type WesternChartResult,
} from './westernCalculator';
import type { WesternChartInput } from '../../types/astrology';

const SIGNS = [
  'Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải',
  'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp',
  'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư',
];

const norm = (v: number) => ((v % 360) + 360) % 360;

const toJulianDay = (date: Date) => unixMsToJulianDay(date.getTime());
const fromDate = (date: Date) =>
  date.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

function signOf(longitude: number) {
  const normalized = norm(longitude);
  return { sign: SIGNS[Math.floor(normalized / 30)], degree: normalized % 30 };
}

const MAJOR_ASPECTS = [
  { type: 'conjunction', angle: 0, orb: 6 },
  { type: 'sextile', angle: 60, orb: 4 },
  { type: 'square', angle: 90, orb: 5 },
  { type: 'trine', angle: 120, orb: 5 },
  { type: 'opposition', angle: 180, orb: 6 },
] as const;

export function detectMajorAspects(planets: Array<{ body: string; tropicalLongitude: number }>): AspectResult[] {
  const aspects: AspectResult[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const dist = Math.abs(norm(planets[i].tropicalLongitude - planets[j].tropicalLongitude));
      const shortest = Math.min(dist, 360 - dist);
      for (const aspect of MAJOR_ASPECTS) {
        if (Math.abs(shortest - aspect.angle) <= aspect.orb) {
          aspects.push({
            planetA: planets[i].body,
            planetB: planets[j].body,
            type: aspect.type,
            orb: Math.abs(shortest - aspect.angle),
          });
        }
      }
    }
  }
  return aspects;
}

function natalSnapshot(input: WesternChartInput) {
  const chart = calculateWesternChart(input);
  const sun = chart.planets.find((p) => p.body === 'sun')?.tropicalLongitude ?? 0;
  const moon = chart.planets.find((p) => p.body === 'moon')?.tropicalLongitude ?? 0;
  return { chart, sun, moon };
}

export interface ReturnChartResult {
  julianDay: number;
  dateLabel: string;
  longitude: number;
  orb: number;
  chart: WesternChartResult;
}

export function calculateSolarReturnChart(
  input: WesternChartInput,
  targetYear: number,
): ReturnChartResult | null {
  const { sun } = natalSnapshot(input);
  const yearStart = toJulianDay(new Date(targetYear, 0, 1));
  const sr =
    computeSolarReturn(sun, targetYear, yearStart - 2) ??
    computeSolarReturn(sun, targetYear, yearStart - 35);
  if (!sr) return null;
  const yearEnd = toJulianDay(new Date(targetYear + 1, 0, 1));
  if (sr.solarReturnJulianDay < yearStart - 2 || sr.solarReturnJulianDay >= yearEnd) return null;
  const returnDate = new Date(julianDayToUnixMs(sr.solarReturnJulianDay));
  return {
    julianDay: sr.solarReturnJulianDay,
    dateLabel: fromDate(returnDate),
    longitude: sr.solarReturnLongitude,
    orb: sr.orb,
    chart: calculateWesternChartForJulianDay(sr.solarReturnJulianDay, input.latitude, input.longitude),
  };
}

export interface LunarReturnEntry {
  index: number;
  julianDay: number;
  dateLabel: string;
}

export function calculateLunarReturnDates(input: WesternChartInput, targetYear: number): LunarReturnEntry[] {
  const { moon } = natalSnapshot(input);
  const yearStart = toJulianDay(new Date(targetYear, 0, 1));
  const yearEnd = toJulianDay(new Date(targetYear + 1, 0, 1));
  const entries: LunarReturnEntry[] = [];
  let cursor = yearStart;
  while (entries.length < 14) {
    const lr = computeLunarReturn(moon, cursor);
    if (!lr || lr.lunarReturnJulianDay >= yearEnd) break;
    entries.push({
      index: entries.length + 1,
      julianDay: lr.lunarReturnJulianDay,
      dateLabel: fromDate(new Date(julianDayToUnixMs(lr.lunarReturnJulianDay))),
    });
    cursor = lr.lunarReturnJulianDay + 1;
  }
  return entries;
}

export function calculateLunarReturnChart(input: WesternChartInput, returnJulianDay: number): ReturnChartResult {
  const { moon } = natalSnapshot(input);
  const lr = computeLunarReturn(moon, returnJulianDay - 0.5);
  const jd = lr?.lunarReturnJulianDay ?? returnJulianDay;
  return {
    julianDay: jd,
    dateLabel: fromDate(new Date(julianDayToUnixMs(jd))),
    longitude: lr?.lunarReturnLongitude ?? 0,
    orb: lr?.orb ?? 0,
    chart: calculateWesternChartForJulianDay(jd, input.latitude, input.longitude),
  };
}

export interface TransitAspect {
  transitBody: string;
  natalBody: string;
  type: string;
  orb: number;
}

export interface TransitReport {
  dateLabel: string;
  aspects: TransitAspect[];
  score: number;
}

export function calculateTransitReport(input: WesternChartInput, targetDate: Date): TransitReport {
  const natal = calculateWesternChart(input);
  const natalPlanets = natal.planets.map((p) => ({ body: p.body, tropicalLongitude: p.tropicalLongitude }));

  const julianDay = toJulianDay(targetDate);
  const observer = buildTopocentricObserver({
    julianDay,
    latitude: input.latitude,
    longitude: input.longitude,
    altitudeMeters: 0,
  });
  const snapshot = computeTopocentricPlanetarySnapshot(observer) as Array<{ body: string; tropicalLongitude: number }>;

  const aspects: TransitAspect[] = [];
  for (const transit of snapshot) {
    for (const natalPlanet of natalPlanets) {
      const dist = Math.abs(norm(transit.tropicalLongitude - natalPlanet.tropicalLongitude));
      const shortest = Math.min(dist, 360 - dist);
      for (const aspect of MAJOR_ASPECTS) {
        if (Math.abs(shortest - aspect.angle) <= aspect.orb) {
          aspects.push({
            transitBody: transit.body,
            natalBody: natalPlanet.body,
            type: aspect.type,
            orb: Math.abs(shortest - aspect.angle),
          });
        }
      }
    }
  }
  aspects.sort((a, b) => a.orb - b.orb);

  return {
    dateLabel: fromDate(targetDate),
    aspects,
    score: calculateWesternTransitAspects(natalPlanets, snapshot),
  };
}

export interface ProgressionResult {
  progressedDate: Date;
  dateLabel: string;
  ageYears: number;
  chart: WesternChartResult;
}

export function calculateProgressedChart(input: WesternChartInput, targetDate: Date): ProgressionResult {
  const birthDate = input.birthDate instanceof Date ? input.birthDate : new Date(input.birthDate);
  const birthJd = toJulianDay(birthDate);
  const targetJd = toJulianDay(targetDate);
  const ageYears = Math.max(0, (targetJd - birthJd) / 365.2425);
  const progressedJd = birthJd + ageYears;
  const progressedDate = new Date(julianDayToUnixMs(progressedJd));
  return {
    progressedDate,
    dateLabel: fromDate(progressedDate),
    ageYears,
    chart: calculateWesternChartForJulianDay(progressedJd, input.latitude, input.longitude),
  };
}

function trisectQuadrant(start: number, end: number): number[] {
  const span = norm(end - start);
  return [norm(start + span / 3), norm(start + (2 * span) / 3)];
}

function buildCompositeResult(
  compositePlanets: Array<{ body: string; tropicalLongitude: number; midpointType: string }>,
  ascendant: number,
  midheaven: number,
): WesternChartResult {
  const descendant = norm(ascendant + 180);
  const ic = norm(midheaven + 180);
  const cusps = [
    ascendant,
    ...trisectQuadrant(ascendant, ic),
    ic,
    ...trisectQuadrant(ic, descendant),
    descendant,
    ...trisectQuadrant(descendant, midheaven),
    midheaven,
    ...trisectQuadrant(midheaven, ascendant),
  ];

  const assignHouse = (longitude: number): number => {
    const normalized = norm(longitude);
    for (let i = 0; i < 12; i++) {
      const start = cusps[i];
      const end = cusps[(i + 1) % 12];
      if (start <= end) {
        if (normalized >= start && normalized < end) return i + 1;
      } else if (normalized >= start || normalized < end) {
        return i + 1;
      }
    }
    return 1;
  };

  const planets: PlanetPosition[] = compositePlanets.map((p) => {
    const { sign, degree } = signOf(p.tropicalLongitude);
    return {
      body: p.body,
      tropicalLongitude: p.tropicalLongitude,
      siderealLongitude: p.tropicalLongitude,
      sign,
      signIndex: SIGNS.indexOf(sign),
      degreeInSign: degree,
      house: assignHouse(p.tropicalLongitude),
      retrograde: false,
      nakshatra: '',
      pada: 0,
      ra: 0,
      dec: 0,
      distance: 0,
    };
  });

  return {
    planets,
    houses: cusps.map((cusp, index) => ({
      index: index + 1,
      longitude: cusp,
      sign: signOf(cusp).sign,
      signIndex: SIGNS.indexOf(signOf(cusp).sign),
    })),
    dignities: [],
    aspects: detectMajorAspects(planets),
    dispositorTree: null,
    chartShape: null,
    partOfFortune: { longitude: 0, sign: '', signIndex: 0 },
    ascendant,
    midheaven,
  };
}

const midpoint = (lonA: number, lonB: number) => {
  const a = norm(lonA);
  const b = norm(lonB);
  let mid = (a + b) / 2;
  if (Math.abs(a - b) > 180) mid = norm(mid + 180);
  return mid;
};

export function calculateCompositeResult(inputA: WesternChartInput, inputB: WesternChartInput): WesternChartResult {
  const chartA = calculateWesternChart(inputA);
  const chartB = calculateWesternChart(inputB);
  const compositePlanets = computeCompositeChart(
    chartA.planets.map((p) => ({ body: p.body, tropicalLongitude: p.tropicalLongitude })),
    chartB.planets.map((p) => ({ body: p.body, tropicalLongitude: p.tropicalLongitude })),
  );
  return buildCompositeResult(compositePlanets, midpoint(chartA.ascendant, chartB.ascendant), midpoint(chartA.midheaven, chartB.midheaven));
}

export interface DavisonResult {
  midpointDate: Date;
  dateLabel: string;
  latitude: number;
  longitude: number;
  chart: WesternChartResult;
}

export function calculateDavisonResult(inputA: WesternChartInput, inputB: WesternChartInput): DavisonResult {
  const dateA = inputA.birthDate instanceof Date ? inputA.birthDate : new Date(inputA.birthDate);
  const dateB = inputB.birthDate instanceof Date ? inputB.birthDate : new Date(inputB.birthDate);
  const davison = computeDavisonChart(
    { julianDay: toJulianDay(dateA), latitude: inputA.latitude, longitude: inputA.longitude },
    { julianDay: toJulianDay(dateB), latitude: inputB.latitude, longitude: inputB.longitude },
  );
  const midpointDate = new Date(julianDayToUnixMs(davison.julianDay));
  return {
    midpointDate,
    dateLabel: fromDate(midpointDate),
    latitude: davison.latitude,
    longitude: davison.longitude,
    chart: calculateWesternChartForJulianDay(davison.julianDay, davison.latitude, davison.longitude),
  };
}
