export declare const DEFAULT_TOPSIS_WEIGHTS: Readonly<{
  eastern: number;
  western: number;
  vedic: number;
}>;

export declare function normalizeVedicScore(vedicScore: number, maxScore?: number): number;
export declare function computeWeightedScore(
  input: {
    easternScore: number;
    westernScore: number;
    vedicScore: number;
    isShortCircuited?: boolean;
    reason?: string;
  },
  options?: {
    vedicScaleMax?: number;
    weights?: Partial<{
      eastern: number;
      western: number;
      vedic: number;
    }>;
  }
): {
  totalScore: number;
  easternScore: number;
  westernScore: number;
  vedicScore: number;
  isShortCircuited: boolean;
  reason?: string;
};

export declare function createCoarseWindows(input: {
  startTimestamp: number;
  endTimestamp: number;
  stepMinutes?: number;
}): Array<{
  timestampStart: number;
  timestampEnd: number;
}>;

export declare function expandFineWindow(input: {
  centerTimestamp: number;
  radiusMinutes?: number;
  stepMinutes?: number;
}): number[];

export declare function rankCandidateWindows<
  T extends {
    timestampStart: number;
    metrics: {
      totalScore: number;
    };
  }
>(
  candidates: T[],
  options?: {
    limit?: number;
  }
): T[];

export declare function summarizeChunkCandidates<
  T extends {
    timestampStart: number;
    timestampEnd: number;
    metrics: {
      totalScore: number;
      isShortCircuited: boolean;
    };
  }
>(input: {
  chunkPlan: Array<{
    chunkIndex: number;
    totalChunks: number;
    timestampStart: number;
    timestampEnd: number;
  }>;
  candidates: T[];
  passingScore?: number;
}): Array<{
  chunkIndex: number;
  totalChunks: number;
  timestampStart: number;
  timestampEnd: number;
  candidateCount: number;
}>;

export declare function isLatitudeGuardTriggered(latitude: number): boolean;
export declare function estimateTimelineTransferBytes(entryCount: number): number;
export declare function downsampleTimelineEntries<T>(
  entries: T[],
  options?: {
    maxEntries?: number;
  }
): {
  entries: T[];
  downsampled: boolean;
  originalCount: number;
  finalCount: number;
};
export declare function applyTimelineGuardrails<T>(
  entries: T[],
  options?: {
    maxEntries?: number;
    maxTransferBytes?: number;
  }
): {
  entries: T[];
  diagnostics: {
    memoryGuardTriggered: boolean;
    timelineDownsampled: boolean;
    shortCircuited: boolean;
    reason?: string;
    originalTimelineCount: number;
    finalTimelineCount: number;
    maxTimelineEntries: number;
    maxTransferBytes: number;
    allowedEntriesByBytes: number;
    estimatedTransferBytes: number;
  };
};

export declare function julianDayToUnixMs(julianDay: number): number;
export declare function unixMsToJulianDay(unixMs: number): number;

export declare function normalizeDegrees(angle: number): number;
export declare function computeJulianCentury(julianDay: number): number;
export declare function computeSolarLongitude(julianDay: number): number;
export declare function solveSolarTermBoundary(input: {
  targetLongitude: number;
  startJulianDay: number;
  toleranceDegrees?: number;
  maxIterations?: number;
}): {
  julianDay: number;
  longitude: number;
  iterations: number;
};
export declare function computeDynamicRefraction(input: {
  elevationMeters: number;
  pressureMbar?: number;
  temperatureC?: number;
}): {
  pressureMbar: number;
  temperatureC: number;
  correctionArcMinutes: number;
  correctionDegrees: number;
};
export declare function computeLahiriAyanamsa(julianDay: number): number;
export declare function convertTropicalToSidereal(longitude: number, julianDay: number): number;
export declare function buildTopocentricObserver(input: {
  julianDay: number;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
}): {
  julianDay: number;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
};
export declare function computeTopocentricPlanetarySnapshot(observer: {
  julianDay: number;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
}): Array<{
  body: string;
  tropicalLongitude: number;
  siderealLongitude: number;
}>;
export declare function computeSunriseSunsetApprox(observer: {
  julianDay: number;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
}): {
  sunriseUnixMs: number;
  sunsetUnixMs: number;
  refraction: {
    pressureMbar: number;
    temperatureC: number;
    correctionArcMinutes: number;
    correctionDegrees: number;
  };
};

export declare const STRICT_MODE_LOCKED_ENTITY_IDS: readonly string[];

export declare function resolveStrictModeOverrides(input?: {
  overrides?: Array<{
    school_id: string;
    entity_id: string;
    custom_element?: string;
    custom_weight?: number;
  }>;
  strictMode?: boolean;
  lockedEntityIds?: readonly string[];
}): {
  strictMode: boolean;
  allowedOverrides: Array<{
    school_id: string;
    entity_id: string;
    custom_element?: string;
    custom_weight?: number;
  }>;
  blockedOverrides: Array<{
    school_id: string;
    entity_id: string;
    custom_element?: string;
    custom_weight?: number;
    reason: string;
  }>;
};

export declare function deriveKyMonChietBoState(input: {
  timestamp: number;
  solarTermBoundaryTimestamp: number;
  timezoneOffsetHours?: number;
}): {
  minuteIndex: number;
  boundaryMinuteIndex: number;
  deltaMinutes: number;
  isPostBoundary: boolean;
  minuteSwitchActive: boolean;
  phase: "new_cycle" | "previous_cycle";
};

export declare function deriveDaiLucNhamMonthlyGeneral(input: {
  solarLongitude: number;
}): {
  monthIndex: number;
  branch: string;
  label: string;
  weightBonus: number;
};

export declare function evaluateVoidOfCourseGuard(input: {
  planetarySnapshot: Array<{
    body: string;
    tropicalLongitude: number;
    siderealLongitude: number;
  }>;
  orbDegrees?: number;
}): {
  isVoidOfCourse: boolean;
  remainingDegreesInSign: number;
  closestAspectDelta: number | null;
  closestAspect: number | null;
  closestBody: string | null;
};

export declare function evaluateElectionCandidate(input: {
  timestamp: number;
  astronomy: {
    timezone:
      {
        ruleId: string;
        offsetHours: number;
        ambiguous: false;
        shiftedTimestamp: number;
      };
    solarTerm: {
      targetLongitude: number;
      julianDay: number;
      longitude: number;
      iterations: number;
    };
    sunriseSunset: {
      sunriseUnixMs: number;
      sunsetUnixMs: number;
      refraction: {
        pressureMbar: number;
        temperatureC: number;
        correctionArcMinutes: number;
        correctionDegrees: number;
      };
    };
    planetarySnapshot: Array<{
      body: string;
      tropicalLongitude: number;
      siderealLongitude: number;
    }>;
  };
  latitudeGuardTriggered?: boolean;
  overrideMapping?: Array<{
    school_id: string;
    entity_id: string;
    element_attribute: string;
    is_enabled: boolean;
    weight_modifier: number;
  }>;
  strictMode?: boolean;
}): {
  timestamp: number;
  metrics: {
    totalScore: number;
    easternScore: number;
    westernScore: number;
    vedicScore: number;
    isShortCircuited: boolean;
    reason?: string;
  };
  ruleSignals: {
    kyMonState: {
      minuteIndex: number;
      boundaryMinuteIndex: number;
      deltaMinutes: number;
      isPostBoundary: boolean;
      minuteSwitchActive: boolean;
      phase: "new_cycle" | "previous_cycle";
    };
    monthlyGeneral: {
      monthIndex: number;
      branch: string;
      label: string;
      weightBonus: number;
    };
    voidOfCourse: {
      isVoidOfCourse: boolean;
      remainingDegreesInSign: number;
      closestAspectDelta: number | null;
      closestAspect: number | null;
      closestBody: string | null;
    };
    overrideWeightModifier: number;
    sunriseDistanceMinutes: number;
    solarTermDistance: number;
  };
};

export interface DungSuEventScore {
  eventId: string;
  auspiciousnessPercent: number;
  accuracyTier: "complete" | "bounded_specialist_ready" | "specialist_required";
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

export declare function calculateDungSuEventScore(input: {
  eventProfile: {
    event_id: string;
    category: string;
    accuracy_tier: "complete" | "bounded_specialist_ready" | "specialist_required";
    source_coverage_percent: number;
    generic_weight: number;
    cross_system_weight: number;
    specialist_weight: number;
    hard_cap_missing_specialist: number | null;
    source_ref: string;
    specialist_ref: string | null;
  };
  baseMetrics: {
    totalScore: number;
    easternScore: number;
    westernScore: number;
    vedicScore: number;
    isShortCircuited: boolean;
    reason?: string;
  };
  ruleSignals?: Record<string, unknown>;
}): DungSuEventScore;

export declare const STAR_COLORS: Readonly<{
  kim: string;
  moc: string;
  thuy: string;
  hoa: string;
  tho: string;
}>;

export declare function getStarColor(element: string): string | null;

export declare function getTrietPositions(yearCan: string | number): [number, number];

export declare function getTuanPositions(yearCan: string | number, yearChi: string | number): [number, number];

export declare function calculateDaiHanAgeRanges(input: {
  cucNumber: number;
  gender: string;
  yearCan: string | number;
  menhPalaceIndex: number;
}): Array<{
  startAge: number;
  endAge: number;
  rangeString: string;
}>;

export declare function calculateTieuHanPalaceIndex(input: {
  birthYearChi: string | number;
  gender: string;
  viewYear: number;
}): number;

export declare function calculateTieuHanAgesForPalace(input: {
  birthYearChi: string | number;
  gender: string;
  palaceIndex: number;
  maxAge?: number;
}): number[];

export declare function calculateNguyetHanPalaces(input: {
  tieuHanPalaceIndex: number;
  birthMonth: number;
  birthHour: number;
}): number[];

export declare function getHourBranch(hour: number): number;

export declare function calculateMenhCanIndex(yearCanIndex: number, menhPalaceIndex: number): number;

export declare function calculateTuViCucNumber(yearCanIndex: number, menhPalaceIndex: number): number;

export declare function calculateMenhCungPosition(lunarMonth: number, birthHourBranch: number): number;

export declare function calculateThanCungPosition(menhPosition: number, birthMonth: number, birthHourBranch?: number): number;

export declare function placeTuViStar(cucNumber: number, lunarDay: number): number;

export declare function placeChinhTinh(tuViPosition: number): Record<string, number[]>;

export declare function placePhuTinh(input: {
  yearCanIndex: number;
  yearChiIndex: number;
  lunarMonth: number;
  lunarDay: number;
  hourBranch: number;
  menhPosition: number;
  thanPosition: number;
  thuanNghich?: "Thuận" | "Nghịch";
}): Record<string, number>;

export declare function createTuViStarChart(input: {
  yearCanIndex: number;
  yearChiIndex: number;
  lunarMonth: number;
  lunarDay: number;
  birthHour: number;
  gender?: string;
  menhPalaceIndex?: number;
  thanPalaceIndex?: number;
  cucNumber?: number;
}): {
  status: "v1_backed_star_chart_ready";
  lineageProfile: {
    id: string;
    label: string;
    claimScope: string;
    synthesisStatus: "bounded_lineage_profile_ready";
  };
  amDuong: "Dương" | "Âm";
  thuanNghich: "Thuận" | "Nghịch";
  menhPalaceIndex: number;
  thanPalaceIndex: number;
  menhCanIndex: number;
  cucNumber: number;
  tuViPosition: number;
  trietPositions: [number, number];
  tuanPositions: [number, number];
  daiHanAgeRanges: Array<{ startAge: number; endAge: number; rangeString: string }>;
  palaces: Array<Record<string, unknown>>;
  combinations: Array<Record<string, unknown>>;
  sourceRefs: string[];
};

export declare function resolveTuViBirthContext(input: {
  solarDate: Date | string;
  birthClockHour?: number;
  birthMinute?: number;
  gender: string;
  birthLocation?: {
    locationName?: string;
    lat?: number;
    lng?: number;
    timezone?: number;
    countryCode?: string;
    countryName?: string;
    historicalRegion?: "north" | "south";
  };
  timePolicy?: "civil" | "historical-vietnam" | "true-solar";
}): {
  correctedDate: Date;
  metaphysicalDate: Date;
  hourBranchIndex: number;
  isDayShifted: boolean;
  offsetHours: number;
  trueSolarCorrectionMinutes: number;
};

export declare function getBranchRelationship(branchA: string | number, branchB: string | number): "xung" | "hai" | "hop_tam" | "hop_luc" | "tu_hinh" | "binh_hoa";

export declare function calculateTarabala(natalNakshatraIndex: number, transitNakshatraIndex: number): {
  tarabala: number;
  scoreDelta: number;
};

export declare function calculateWesternTransitAspects(
  natalPlanets: Array<{ body: string; tropicalLongitude: number }>,
  transitPlanets: Array<{ body: string; tropicalLongitude: number }>
): number;

export declare function getLunarDate(
  date: Date,
  location?: {
    latitude?: number;
    longitude?: number;
    countryCode?: string;
    timezone?: number;
    historicalRegion?: "north" | "south";
  } | null,
  fallbackTimezoneOffset?: number
): {
  day: number;
  month: number;
  year: number;
  isLeapMonth: boolean;
};

export interface UnifiedBirthProfile {
  profileId: string;
  birthTimestamp: number;
  latitude: number;
  longitude: number;
  gender: string;
  tuViContext: {
    lunarDate: { day: number; month: number; year: number; isLeapMonth: boolean };
    hourBranchIndex: number;
    isDayShifted: boolean;
  };
  vedicContext: unknown | null;
  westernContext: unknown | null;
}

export declare function generateUnifiedBirthProfile(input: {
  profileId?: string;
  birthTimestamp: number;
  latitude: number;
  longitude: number;
  gender: string;
  timezone?: number;
}): UnifiedBirthProfile;

export declare function calculateTraditionalMaiHoa(params: {
  yearChi: string | number;
  lunarMonth: number;
  lunarDay: number;
  hourChi: string | number;
  customNumbers?: number[];
}): any;

export declare function evaluateTamThucScore(params: {
  solarTermLongitude: number;
  dayChi: string | number;
  hourChi: string | number;
  monthChi: string | number;
}): any;
export declare function sunLongitudeIndex(jdn: number, timeZone: number): number;
export declare function jdFromDate(dd: number, mm: number, yy: number): number;
export declare function getBranchRelationship(branchA: number | string, branchB: number | string): string;
export declare function computeNavamsha(siderealLongitude: number): string;
export declare function computeVimshottariDasha(moonSidereal: number, birthJulianDay: number, birthYear: number): any;
export declare function computeAshtakoot(maleMoon: number, femaleMoon: number): any;

// Western-enhanced astrology functions (from western-enhanced.js)
export function computeDignity(body: string, tropicalLongitude: number): any;
export function detectMinorAspects(planets: any[], orbMultiplier?: number): any[];
export function computePorphyryCusps(observer: any): { system: string; cusps: number[]; ascendant: number; midheaven: number };
export function computeDispositorTree(planets: any[]): any;
export function detectChartShape(planets: any[]): any;
export function computePartOfFortune(sunLongitude: number, moonLongitude: number, ascendantLongitude: number, isDayBirth?: boolean): number;
export function computeTrueLunarPosition(julianDay: number): {
  longitude: number;
  latitude: number;
  distanceKm: number;
  distanceAU: number;
};
export function computeSolarReturn(
  birthSunLongitude: number,
  year: number,
  startJulianDay: number
): {
  solarReturnJulianDay: number;
  solarReturnLongitude: number;
  birthLongitude: number;
  orb: number;
} | null;
export function computeLunarReturn(
  birthMoonLongitude: number,
  startJulianDay: number
): {
  lunarReturnJulianDay: number;
  lunarReturnLongitude: number;
  birthLongitude: number;
  orb: number;
} | null;
export function computeProgressedDate(birthJulianDay: number, ageYears: number): number;
export function computeProgressedPlanets(
  observer: any,
  birthObserver: any,
  ageYears: number
): { progressedDate: number; progressedObserver: any; note: string };
export function computeCompositeChart(
  planetsA: Array<{ body: string; tropicalLongitude: number }>,
  planetsB: Array<{ body: string; tropicalLongitude: number }>
): Array<{ body: string; tropicalLongitude: number; midpointType: string }>;
export function computeDavisonChart(
  birthA: { julianDay: number; latitude: number; longitude: number },
  birthB: { julianDay: number; latitude: number; longitude: number }
): { julianDay: number; latitude: number; longitude: number; note: string };
export function calculateSynastry(
  profileA: any,
  profileB: any,
  westernSynastryData?: any,
  vedicSynastryData?: any
): {
  combinedScore: number;
  engines: {
    tuVi: { score: number; insights: string[] };
    western: { score: number; insights: string[] };
    vedic: { score: number; insights: string[]; rawBreakdown: Record<string, number> };
  };
};
