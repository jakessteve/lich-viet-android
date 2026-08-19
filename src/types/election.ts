import type { HourScoreEntry } from '../utils/activityScorer';

export interface ElectionInput {
  startDate: Date;
  endDate: Date;
  activityType: ElectionActivityType;
  birthYear?: number;
  location?: { lat: number; lng: number; timezone: number };
}

export type ElectionActivityType =
  | 'cuoi-hoi'
  | 'khai-truong'
  | 'xay-dung'
  | 'xuat-hanh'
  | 'nhap-trach'
  | 'dong-tho'
  | 'cau-tai'
  | 'giao-dich'
  | 'an-tang'
  | 'khac'
  | (string & {});

export interface ElectionCandidate {
  timestamp: number;
  totalScore: number;
  easternScore: number;
  westernScore: number;
  vedicScore: number;
  isShortCircuited: boolean;
  reason?: string;
  dayLabel: string;
  solarTerm: string;
  bestHours?: HourScoreEntry[];
  scoringMethod?: 'ephemeris_v1' | 'heuristic_legacy';
}
