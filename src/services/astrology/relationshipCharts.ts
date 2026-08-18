/**
 * Relationship Charts Engine — Lịch Việt v4
 *
 * Implements:
 * 1. Composite Chart (Midpoint Chart):
 *    - Shortest-arc circular midpoint for every celestial body.
 *    - Resolves 180° near-vs-far ambiguity.
 *    - Guards Mercury and Venus so they stay within astronomical elongation from Composite Sun.
 *    - Midpoint house cusps and Ascendant/MC.
 * 2. Davison Relationship Chart (Time-Space Midpoint Chart):
 *    - Computes exact midpoint moment (UTC) between Partner A and Partner B.
 *    - Computes exact midpoint geodetic latitude and longitude.
 *    - Solves full natal chart at the Davison spacetime coordinate.
 */

import { calculateWesternChart, type WesternChartResult } from './westernCalculator';
import type { WesternChartInput } from '../../types/astrology';

const norm = (v: number) => ((v % 360) + 360) % 360;

/**
 * Calculates shortest-arc midpoint between two angles in degrees (0..360).
 */
export function calculateMidpoint(degA: number, degB: number): number {
  const a = norm(degA);
  const b = norm(degB);
  const diff = Math.abs(a - b);

  if (diff <= 180) {
    return norm((a + b) / 2);
  }
  // When distance > 180, midpoint is on the opposite arc across 0°/360°
  return norm((a + b) / 2 + 180);
}

export interface CompositePlanet {
  body: string;
  sign: string;
  tropicalLongitude: number;
  signIndex: number;
  degreeInSign: number;
  partnerALongitude: number;
  partnerBLongitude: number;
}

export interface CompositeChartResult {
  chartType: 'composite';
  partnerAName?: string;
  partnerBName?: string;
  planets: CompositePlanet[];
  ascendant: number;
  mc: number;
  cusps: number[];
  synastryInsights: string[];
}

export interface DavisonChartResult {
  chartType: 'davison';
  partnerAName?: string;
  partnerBName?: string;
  davisonDate: Date;
  davisonLatitude: number;
  davisonLongitude: number;
  chart: WesternChartResult;
}

/**
 * Computes the Composite Chart between two natal charts.
 */
export function calculateCompositeChart(inputA: WesternChartInput, inputB: WesternChartInput): CompositeChartResult {
  const chartA = calculateWesternChart(inputA);
  const chartB = calculateWesternChart(inputB);

  const compositePlanets: CompositePlanet[] = [];

  // Map each shared planet
  for (const pA of chartA.planets) {
    const pB = chartB.planets.find((p) => p.body === pA.body);
    if (!pB) continue;

    const midLon = calculateMidpoint(pA.tropicalLongitude, pB.tropicalLongitude);

    compositePlanets.push({
      body: pA.body,
      sign: pA.sign,
      tropicalLongitude: midLon,
      signIndex: Math.floor(midLon / 30),
      degreeInSign: midLon % 30,
      partnerALongitude: pA.tropicalLongitude,
      partnerBLongitude: pB.tropicalLongitude,
    });
  }

  // Adjust Mercury and Venus to respect Sun elongation limits if needed
  const compSun = compositePlanets.find((p) => p.body === 'sun');
  if (compSun) {
    const compMerc = compositePlanets.find((p) => p.body === 'mercury');
    if (compMerc) {
      const diff = Math.min(
        Math.abs(norm(compMerc.tropicalLongitude - compSun.tropicalLongitude)),
        360 - Math.abs(norm(compMerc.tropicalLongitude - compSun.tropicalLongitude)),
      );
      // Mercury max elongation is ~28°. If midpoint flipped across the wheel (> 100°), flip back:
      if (diff > 90) {
        compMerc.tropicalLongitude = norm(compMerc.tropicalLongitude + 180);
        compMerc.signIndex = Math.floor(compMerc.tropicalLongitude / 30);
        compMerc.degreeInSign = compMerc.tropicalLongitude % 30;
      }
    }

    const compVenus = compositePlanets.find((p) => p.body === 'venus');
    if (compVenus) {
      const diff = Math.min(
        Math.abs(norm(compVenus.tropicalLongitude - compSun.tropicalLongitude)),
        360 - Math.abs(norm(compVenus.tropicalLongitude - compSun.tropicalLongitude)),
      );
      // Venus max elongation is ~48°. If midpoint flipped (> 100°), flip back:
      if (diff > 90) {
        compVenus.tropicalLongitude = norm(compVenus.tropicalLongitude + 180);
        compVenus.signIndex = Math.floor(compVenus.tropicalLongitude / 30);
        compVenus.degreeInSign = compVenus.tropicalLongitude % 30;
      }
    }
  }

  const compAsc = calculateMidpoint(chartA.ascendant, chartB.ascendant);
  const compMc = calculateMidpoint(chartA.midheaven, chartB.midheaven);
  const compCusps: number[] = [];

  for (let i = 0; i < 12; i++) {
    const cA = chartA.houses?.[i]?.longitude ?? i * 30;
    const cB = chartB.houses?.[i]?.longitude ?? i * 30;
    compCusps.push(calculateMidpoint(cA, cB));
  }

  const synastryInsights: string[] = [
    `Bản đồ Sao Hợp Đỉnh (Composite Chart) phản ánh linh hồn và sứ mệnh chung của mối quan hệ giữa ${inputA.name || 'Đối tác A'} và ${inputB.name || 'Đối tác B'}.`,
    `Mặt Trời Composite: Trọng tâm phát triển và nguồn sáng kết nối của cặp đôi.`,
    `Mặt Trăng Composite: Khả năng thấu hiểu cảm xúc, sự gắn kết nội tâm và mức độ hòa hợp trong đời sống thường nhật.`,
  ];

  return {
    chartType: 'composite',
    partnerAName: inputA.name,
    partnerBName: inputB.name,
    planets: compositePlanets,
    ascendant: compAsc,
    mc: compMc,
    cusps: compCusps,
    synastryInsights,
  };
}

/**
 * Computes the Davison Time-Space Midpoint Chart between two individuals.
 */
export function calculateDavisonChart(inputA: WesternChartInput, inputB: WesternChartInput): DavisonChartResult {
  const dateA = inputA.birthDate instanceof Date ? inputA.birthDate : new Date(inputA.birthDate);
  const dateB = inputB.birthDate instanceof Date ? inputB.birthDate : new Date(inputB.birthDate);

  const midTimeMs = (dateA.getTime() + dateB.getTime()) / 2;
  const davisonDate = new Date(midTimeMs);

  const davisonLat = (inputA.latitude + inputB.latitude) / 2;
  let davisonLng = (inputA.longitude + inputB.longitude) / 2;

  // If longitude diff > 180, take opposite meridian
  if (Math.abs(inputA.longitude - inputB.longitude) > 180) {
    davisonLng = norm(davisonLng + 180);
    if (davisonLng > 180) davisonLng -= 360;
  }

  const davisonInput: WesternChartInput = {
    name: `Davison (${inputA.name || 'A'} & ${inputB.name || 'B'})`,
    birthDate: davisonDate,
    birthHour: davisonDate.getUTCHours(),
    birthMinute: davisonDate.getUTCMinutes(),
    latitude: davisonLat,
    longitude: davisonLng,
    timezone: 0,
    houseSystem: inputA.houseSystem ?? 'placidus',
  };

  const chart = calculateWesternChart(davisonInput);

  return {
    chartType: 'davison',
    partnerAName: inputA.name,
    partnerBName: inputB.name,
    davisonDate,
    davisonLatitude: davisonLat,
    davisonLongitude: davisonLng,
    chart,
  };
}
