import { z } from 'zod';

export const HouseSystemSchema = z.enum([
  'placidus',
  'wholesign',
  'koch',
  'equal',
  'regiomontanus',
  'campanus',
  'porphyry',
  'morinus',
]);
export type HouseSystem = z.infer<typeof HouseSystemSchema>;

export const ZodiacModeSchema = z.enum(['tropical', 'draconic', 'sidereal']);
export type ZodiacMode = z.infer<typeof ZodiacModeSchema>;

export const WesternChartInputSchema = z.object({
  name: z.string().optional(),
  birthDate: z.string(), // ISO string or YYYY-MM-DD
  birthHour: z.number().int().min(0).max(23),
  birthMinute: z.number().int().min(0).max(59).default(0),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.number().default(7),
  locationName: z.string().optional(),
  countryCode: z.string().optional(),
  countryName: z.string().optional(),
  gender: z.enum(['nam', 'nu', 'male', 'female']).optional(),
  houseSystem: HouseSystemSchema.default('placidus'),
  zodiacMode: ZodiacModeSchema.default('tropical'),
});
export type WesternChartInput = z.infer<typeof WesternChartInputSchema>;

export const VedicChartInputSchema = WesternChartInputSchema.extend({
  ayanamsa: z.enum(['lahiri', 'krishnamurti']).default('lahiri'),
});
export type VedicChartInput = z.infer<typeof VedicChartInputSchema>;

export const SynastryInputSchema = z.object({
  profileA: WesternChartInputSchema.extend({ name: z.string() }),
  profileB: WesternChartInputSchema.extend({ name: z.string() }),
});
export type SynastryInput = z.infer<typeof SynastryInputSchema>;

export interface PlanetPositionDto {
  name: string;
  symbol: string;
  tropicalLongitude: number;
  sign: string;
  degreeInSign: number;
  house: number;
  speed: number;
  isRetrograde: boolean;
}

export interface HouseCuspDto {
  house: number;
  sign: string;
  degreeInSign: number;
  cuspLongitude: number;
}

export interface AspectDto {
  planetA: string;
  planetB: string;
  type: string;
  symbol: string;
  angle: number;
  orb: number;
  nature: 'cat' | 'hung' | 'trung' | 'hop';
}

export interface WesternNatalChartDto {
  ascendant: number;
  midheaven: number;
  planets: PlanetPositionDto[];
  houses: HouseCuspDto[];
  aspects: AspectDto[];
}
