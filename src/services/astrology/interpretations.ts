import { WESTERN_PLANET_IN_SIGN, WESTERN_HOUSES_MEANING, WESTERN_PLANET_IN_HOUSE } from '../../data/astrology/western_interpretations';
import { VEDIC_PLANET_IN_SIGN, VEDIC_BHAVA_MEANING, VEDIC_PLANET_IN_BHAVA } from '../../data/astrology/vedic_interpretations';

// --- WESTERN INTERPRETATIONS ---

export function getSignInterpretation(sign: string): string | undefined {
  return WESTERN_PLANET_IN_SIGN.ascendant?.[sign];
}

export function getPlanetInSignInterpretation(body: string, sign: string): string | undefined {
  return WESTERN_PLANET_IN_SIGN[body]?.[sign];
}

export function getHouseInterpretation(house: number): string | undefined {
  return WESTERN_HOUSES_MEANING[house];
}

export function getPlanetInHouseInterpretation(body: string, house: number): string | undefined {
  return WESTERN_PLANET_IN_HOUSE[body]?.[house];
}

// --- VEDIC INTERPRETATIONS ---

export function getVedicSignInterpretation(sign: string): string | undefined {
  return VEDIC_PLANET_IN_SIGN.lagna?.[sign];
}

export function getVedicPlanetInSignInterpretation(body: string, sign: string): string | undefined {
  return VEDIC_PLANET_IN_SIGN[body]?.[sign];
}

export function getVedicAtmakarakaInterpretation(body: string): string | undefined {
  return VEDIC_PLANET_IN_SIGN.atmakaraka?.[body];
}

export function getVedicBhavaInterpretation(house: number): string | undefined {
  return VEDIC_BHAVA_MEANING[house];
}

export function getVedicPlanetInHouseInterpretation(body: string, house: number): string | undefined {
  return VEDIC_PLANET_IN_BHAVA[body]?.[house];
}
