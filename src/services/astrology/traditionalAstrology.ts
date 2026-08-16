import {
  calculateChartSect,
  calculateEssentialDignities,
  calculateAccidentalDignities,
  calculateArabicLots,
  calculateAlmutenFiguris,
  calculateFirdaria,
} from '@omce/core-logic';
import type { SwissNatalChartResult } from './swissNatalChart';

export interface TraditionalPlanetAnalysis {
  planet: string;
  nameVi: string;
  symbol: string;
  sign: string;
  signVi: string;
  degree: number;
  minute: number;
  house: number;
  isRetrograde: boolean;
  essentialScore: number;
  accidentalScore: number;
  netScore: number;
  essentialDetails: {
    isDomicile: boolean;
    isExaltation: boolean;
    isTriplicity: boolean;
    isTerm: boolean;
    isDecan: boolean;
    isDetriment: boolean;
    isFall: boolean;
    isPeregrine: boolean;
    domicileRuler: string;
    exaltationRuler: string | null;
    triplicityRuler: string;
    termRuler: string | null;
    decanRuler: string | null;
  };
  accidentalFactors: Array<{ name: string; score: number; type: 'positive' | 'negative' | 'neutral' }>;
}

export interface TraditionalChartAnalysis {
  sect: {
    isDay: boolean;
    sectLabel: string;
    sectLabelVi: string;
    beneficOfSect: string;
    beneficOutOfSect: string;
    maleficOfSect: string;
    outOfSectMalefic: string;
  };
  planets: TraditionalPlanetAnalysis[];
  almutenFiguris: {
    almuten: string;
    almutenScore: number;
    rankings: Array<{ planet: string; score: number }>;
  };
  arabicLots: {
    fortune: { name: string; longitude: number; sign: string; signVi: string; degree: number; minute: number };
    spirit: { name: string; longitude: number; sign: string; signVi: string; degree: number; minute: number };
    eros: { name: string; longitude: number; sign: string; signVi: string; degree: number; minute: number };
    necessity: { name: string; longitude: number; sign: string; signVi: string; degree: number; minute: number };
  };
  firdaria: {
    sect: string;
    periods: Array<{
      ruler: string;
      years: number;
      startAge: number;
      endAge: number;
      startYear: number;
      endYear: number;
      periodLabel: string;
    }>;
  };
}

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
};

const PLANET_NAMES_VI: Record<string, string> = {
  sun: 'Mặt Trời',
  moon: 'Mặt Trăng',
  mercury: 'Sao Thủy',
  venus: 'Sao Kim',
  mars: 'Sao Hỏa',
  jupiter: 'Sao Mộc',
  saturn: 'Sao Thổ',
};

export function analyzeTraditionalChart(natalResult: SwissNatalChartResult, birthDate: Date): TraditionalChartAnalysis {
  const sun = natalResult.objects.find((o) => o.id === 'planet:sun');
  const moon = natalResult.objects.find((o) => o.id === 'planet:moon');
  const venus = natalResult.objects.find((o) => o.id === 'planet:venus');
  const asc = natalResult.angles.Ascendant.longitude;

  const sunLong = sun?.longitude ?? 0;
  const moonLong = moon?.longitude ?? 0;
  const venusLong = venus?.longitude ?? 0;

  // 1. Sect Calculation
  const sect = calculateChartSect(sunLong, asc);

  // 2. Arabic Lots
  const arabicLots = calculateArabicLots(sunLong, moonLong, asc, venusLong, sect.isDay);

  // 3. Traditional Planets Analysis (7 Visible Planets)
  const traditionalBodies = [
    'planet:sun',
    'planet:moon',
    'planet:mercury',
    'planet:venus',
    'planet:mars',
    'planet:jupiter',
    'planet:saturn',
  ];
  const planets: TraditionalPlanetAnalysis[] = [];

  traditionalBodies.forEach((bodyId) => {
    const obj = natalResult.objects.find((o) => o.id === bodyId);
    if (!obj) return;

    const pKey = obj.id.replace('planet:', '');
    const essential = calculateEssentialDignities(pKey, obj.sign, obj.degree + obj.minute / 60, sect.isDay);
    const accidental = calculateAccidentalDignities(pKey, obj.house, sunLong, obj.longitude, obj.retrograde ?? false);

    planets.push({
      planet: pKey,
      nameVi: PLANET_NAMES_VI[pKey] || obj.nameVi,
      symbol: PLANET_SYMBOLS[pKey] || obj.symbol,
      sign: obj.sign,
      signVi: obj.signVi,
      degree: obj.degree,
      minute: obj.minute,
      house: obj.house,
      isRetrograde: obj.retrograde ?? false,
      essentialScore: essential.totalScore,
      accidentalScore: accidental.score,
      netScore: essential.totalScore + accidental.score,
      essentialDetails: {
        isDomicile: essential.isDomicile,
        isExaltation: essential.isExaltation,
        isTriplicity: essential.isTriplicity,
        isTerm: essential.isTerm,
        isDecan: essential.isDecan,
        isDetriment: essential.isDetriment,
        isFall: essential.isFall,
        isPeregrine: essential.isPeregrine,
        domicileRuler: essential.domicileRuler,
        exaltationRuler: essential.exaltationRuler,
        triplicityRuler: essential.triplicityRuler,
        termRuler: essential.termRuler,
        decanRuler: essential.decanRuler,
      },
      accidentalFactors: accidental.factors,
    });
  });

  // 4. Almuten Figuris
  const almutenFiguris = calculateAlmutenFiguris(
    natalResult.objects.map((o) => ({ body: o.name.toLowerCase(), tropicalLongitude: o.longitude })),
    asc,
    arabicLots.fortune.longitude,
    sect.isDay,
  );

  // 5. Firdaria
  const firdaria = calculateFirdaria(birthDate, sect.isDay);

  return {
    sect: {
      ...sect,
      beneficOutOfSect: sect.isDay ? 'venus' : 'jupiter',
    },
    planets,
    almutenFiguris,
    arabicLots,
    firdaria,
  };
}
