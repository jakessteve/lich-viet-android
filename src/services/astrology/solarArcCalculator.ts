import { unixMsToJulianDay } from '@omce/core-logic';
import { calculateWesternChart, calculateWesternChartForJulianDay } from './westernCalculator';
import type { WesternChartInput } from '../../types/astrology';

const norm = (v: number) => ((v % 360) + 360) % 360;

export interface SolarArcAspect {
  directedPlanet: string;
  natalPlanet: string;
  aspectType: string;
  orb: number;
  exactHitAge: number;
  description: string;
}

export interface SolarArcResult {
  targetYear: number;
  ageYears: number;
  solarArcDegree: number;
  directedPlanets: Array<{
    body: string;
    directedLongitude: number;
    natalLongitude: number;
  }>;
  activeAspects: SolarArcAspect[];
}

export function calculateSolarArcDirections(input: WesternChartInput, targetYear: number): SolarArcResult {
  const birthDate = input.birthDate instanceof Date ? input.birthDate : new Date(input.birthDate);
  const birthYear = birthDate.getFullYear();
  const ageYears = Math.max(0, targetYear - birthYear);

  const natal = calculateWesternChart(input);
  const birthJd = unixMsToJulianDay(birthDate.getTime());

  // Solar Arc direction: arc = distance progressed sun moved in longitude
  // (Secondary progression: 1 day = 1 year)
  const progressedJd = birthJd + ageYears;
  const progressedChart = calculateWesternChartForJulianDay(progressedJd, input.latitude, input.longitude);

  const natalSun = natal.planets.find((p) => p.body === 'sun')?.tropicalLongitude ?? 0;
  const progSun =
    progressedChart.planets.find((p) => p.body === 'sun')?.tropicalLongitude ?? natalSun + ageYears * 0.9856;

  const solarArcDelta = norm(progSun - natalSun);

  const directedPlanets = natal.planets.map((p) => ({
    body: p.body,
    directedLongitude: norm(p.tropicalLongitude + solarArcDelta),
    natalLongitude: p.tropicalLongitude,
  }));

  // Detect hard solar arc aspects to natal planets (Conjunction 0°, Square 90°, Opposition 180°, Semi-square 45°, Sesquiquadrate 135°)
  // Orb: 1.0 degree
  const HARD_ASPECTS = [
    { type: 'conjunction', angle: 0, orb: 1.0, label: 'Trùng (0°)' },
    { type: 'square', angle: 90, orb: 1.0, label: 'Vuông (90°)' },
    { type: 'opposition', angle: 180, orb: 1.0, label: 'Xung (180°)' },
    { type: 'semi-square', angle: 45, orb: 0.8, label: 'Bán vuông (45°)' },
    { type: 'sesquiquadrate', angle: 135, orb: 0.8, label: 'Góc 135°' },
  ];

  const activeAspects: SolarArcAspect[] = [];

  for (const directed of directedPlanets) {
    for (const natalP of natal.planets) {
      const dist = Math.abs(norm(directed.directedLongitude - natalP.tropicalLongitude));
      const shortest = Math.min(dist, 360 - dist);

      for (const asp of HARD_ASPECTS) {
        if (Math.abs(shortest - asp.angle) <= asp.orb) {
          const orbDiff = Math.abs(shortest - asp.angle);
          activeAspects.push({
            directedPlanet: directed.body,
            natalPlanet: natalP.body,
            aspectType: asp.label,
            orb: Math.round(orbDiff * 100) / 100,
            exactHitAge:
              Math.round(
                (ageYears + (directed.directedLongitude > natalP.tropicalLongitude ? -orbDiff : orbDiff)) * 10,
              ) / 10,
            description: `${directed.body} khai vận tạo góc ${asp.label} với ${natalP.body} gốc: biến cố và cột mốc bước ngoặt mạnh mẽ.`,
          });
        }
      }
    }
  }

  activeAspects.sort((a, b) => a.orb - b.orb);

  return {
    targetYear,
    ageYears,
    solarArcDegree: Math.round(solarArcDelta * 100) / 100,
    directedPlanets,
    activeAspects,
  };
}
