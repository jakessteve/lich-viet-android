import { describe, expect, it } from 'vitest';
import {
  detectVedicYogasAndDoshas,
  type VedicPlanetPosition,
} from '@/services/astrology/vedicYogas';

describe('detectVedicYogasAndDoshas', () => {
  it('detects Gaja Kesari Yoga with Kendra Bhava classification', () => {
    const planets: VedicPlanetPosition[] = [
      { body: 'moon', siderealLongitude: 30, house: 1, signIndex: 1 }, // Moon in 1st house Taurus
      { body: 'jupiter', siderealLongitude: 120, house: 4, signIndex: 4 }, // Jupiter in 4th house Leo (Kendra from Moon)
    ];

    const yogas = detectVedicYogasAndDoshas(planets, 30);
    const gk = yogas.find((y) => y.id === 'gaja_kesari_yoga');

    expect(gk).toBeDefined();
    expect(gk?.type).toBe('yoga');
    expect(gk?.bhavaHouses).toEqual([1, 4]);
    expect(gk?.bhavaClassificationVi).toContain('Kendra');
    expect(gk?.dashaActivationVi).toContain('Mahadasha');
    expect(gk?.personalizedSynthesisVi).toContain('Nhà 1');
    expect(gk?.remedyOrAdviceVi).toBeDefined();
  });

  it('detects Budhaditya Yoga and identifies combustion when Sun & Mercury are within 3 degrees', () => {
    const planets: VedicPlanetPosition[] = [
      { body: 'sun', siderealLongitude: 15, house: 10, signIndex: 0 }, // Sun at 15° Aries in 10th house
      { body: 'mercury', siderealLongitude: 16.5, house: 10, signIndex: 0 }, // Mercury at 16.5° Aries (1.5° difference -> Combust)
    ];

    const yogas = detectVedicYogasAndDoshas(planets, 0);
    const budha = yogas.find((y) => y.id === 'budhaditya_yoga');

    expect(budha).toBeDefined();
    expect(budha?.isCombust).toBe(true);
    expect(budha?.severityOrStrength).toBe('Trung Bình');
    expect(budha?.personalizedSynthesisVi).toContain('Astangata');
    expect(budha?.bhavaClassificationVi).toContain('Kendra');
  });

  it('detects Manglik Dosha with house placement analysis', () => {
    const planets: VedicPlanetPosition[] = [
      { body: 'mars', siderealLongitude: 200, house: 7, signIndex: 6 }, // Mars in 7th house (Marriage house)
    ];

    const yogas = detectVedicYogasAndDoshas(planets, 0);
    const manglik = yogas.find((y) => y.id === 'manglik_dosha');

    expect(manglik).toBeDefined();
    expect(manglik?.type).toBe('dosha');
    expect(manglik?.severityOrStrength).toBe('Cao');
    expect(manglik?.bhavaHouses).toEqual([7]);
    expect(manglik?.personalizedSynthesisVi).toContain('Nhà 7');
    expect(manglik?.remedyOrAdviceVi).toBeDefined();
  });
});
