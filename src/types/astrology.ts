export interface WesternChartInput {
  birthDate: Date;
  birthHour: number;
  birthMinute: number;
  latitude: number;
  longitude: number;
  timezone: number;
}

export interface VedicChartInput extends WesternChartInput {
  ayanamsa?: 'lahiri' | 'krishnamurti';
}

export interface SynastryInput {
  profileA: WesternChartInput & { name: string };
  profileB: WesternChartInput & { name: string };
}
