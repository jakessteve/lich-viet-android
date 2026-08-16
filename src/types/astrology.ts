export interface WesternChartInput {
  birthDate: Date;
  birthHour: number;
  birthMinute: number;
  latitude: number;
  longitude: number;
  timezone: number;
  locationName?: string;
  countryCode?: string;
  countryName?: string;
  gender?: 'nam' | 'nu' | 'male' | 'female';
  houseSystem?: 'placidus' | 'wholesign' | 'koch' | 'equal' | 'regiomontanus' | 'campanus' | 'porphyry' | 'morinus';
  zodiacMode?: 'tropical' | 'draconic' | 'sidereal';
}

export interface VedicChartInput extends WesternChartInput {
  ayanamsa?: 'lahiri' | 'krishnamurti';
}

export interface SynastryInput {
  profileA: WesternChartInput & { name: string };
  profileB: WesternChartInput & { name: string };
}
