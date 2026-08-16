export interface ScoringMetrics {
  totalScore: number;
  easternScore: number;
  westernScore: number;
  vedicScore: number;
  isShortCircuited: boolean;
  reason?: string;
}

export interface DungSuEventScore {
  eventId: string;
  auspiciousnessPercent: number;
  accuracyTier: 'complete' | 'bounded_specialist_ready' | 'specialist_required';
  sourceCoveragePercent: number;
  componentScores: {
    genericHkbfsScore: number;
    crossSystemScore: number;
    specialistScore: number;
    genericWeight: number;
    crossSystemWeight: number;
    specialistWeight: number;
  };
  blockingReasons: string[];
  sourceRefs: string[];
}

export interface HybridElectionTimeline {
  timestampStart: number;
  timestampEnd: number;
  metrics: ScoringMetrics;
  termName: string;
  lunarDayStr: string;
  eventScore?: DungSuEventScore;
}

export interface AsyncCalculationRequest {
  taskId: string;
  dungSuEventId?: string;
  userBirthData: {
    jd: number;
    lat: number;
    lng: number;
    alt: number;
  };
  searchWindow: {
    startJd: number;
    endJd: number;
  };
}

export declare function createScoringMetrics(input: ScoringMetrics): ScoringMetrics;
export declare function createHybridElectionTimeline(input: HybridElectionTimeline): HybridElectionTimeline;
export declare function createAsyncCalculationRequest(input: AsyncCalculationRequest): AsyncCalculationRequest;
