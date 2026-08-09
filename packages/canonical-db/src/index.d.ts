export declare const HTZC_RULES: ReadonlyArray<{
  id: string;
  startInclusive: number;
  endExclusive: number;
  offsetHours?: number;
}>;

export declare function resolveVietnamHistoricalTimezone(input: {
  timestamp: number;
  latitude?: number;
  controlZone?: "occupied" | "resistance";
}): {
  ruleId: string;
  offsetHours: number;
  ambiguous: false;
};

export declare function shiftTimestampByOffsetHours(timestamp: number, offsetHours: number): number;
export declare function startOfCivilDayUtc(timestamp: number): number;

export declare function buildCanonicalSeedSnapshot(): {
  canonicalEntities: Array<{
    entity_id: string;
    entity_type: string;
  }>;
  astrologyConcepts: Array<{
    concept_id: string;
    tradition: string;
    label: string;
    category: string;
    source_ref: string;
  }>;
  calculationSources: Array<{
    source_id: string;
    title: string;
    source_type: string;
    url: string;
  }>;
  calculationMethods: Array<{
    method_id: string;
    label: string;
    domain: string;
    school_id: string;
    source_id: string;
  }>;
  dungSuEvents: Array<{
    event_id: string;
    label_vi: string;
    classical_label: string;
    category: string;
    source_ref: string;
  }>;
  dungSuScoringProfiles: Array<DungSuScoringProfile>;
  metaphysicalSchools: Array<{
    school_id: string;
    parent_system: string;
  }>;
  entityOntologyMapping: Array<{
    school_id: string;
    entity_id: string;
    element_attribute: string;
    is_enabled: boolean;
    weight_modifier: number;
  }>;
  htzcRegistry: Array<{
    id: string;
    startInclusive: number;
    endExclusive: number;
    offsetHours?: number;
  }>;
};

export declare function listSchoolMappings(schoolId: string): Array<{
  school_id: string;
  entity_id: string;
  element_attribute: string;
  is_enabled: boolean;
  weight_modifier: number;
}>;

export declare function listDungSuEvents(): Array<{
  event_id: string;
  label_vi: string;
  classical_label: string;
  category: string;
  source_ref: string;
}>;

export interface DungSuScoringProfile {
  event_id: string;
  scoring_profile_id: string;
  category: string;
  accuracy_tier: "complete" | "bounded_specialist_ready" | "specialist_required";
  source_coverage_percent: number;
  generic_weight: number;
  cross_system_weight: number;
  specialist_weight: number;
  hard_cap_missing_specialist: number | null;
  source_ref: string;
  specialist_ref: string | null;
}

export declare function listDungSuScoringProfiles(input?: {
  accuracyTier?: string;
}): DungSuScoringProfile[];

export declare function getDungSuScoringProfile(eventId: string): DungSuScoringProfile;

export declare function listAstrologyConcepts(input?: {
  tradition?: string;
}): Array<{
  concept_id: string;
  tradition: string;
  label: string;
  category: string;
  source_ref: string;
}>;

export declare function listCalculationSources(): Array<{
  source_id: string;
  title: string;
  source_type: string;
  url: string;
}>;

export declare function listCalculationMethods(input?: {
  domain?: string;
}): Array<{
  method_id: string;
  label: string;
  domain: string;
  school_id: string;
  source_id: string;
}>;

export declare function getCanonicalSeedSummary(): {
  canonicalEntityCount: number;
  astrologyConceptCount: number;
  calculationMethodCount: number;
  calculationSourceCount: number;
  dungSuEventCount: number;
  dungSuScoringProfileCount: number;
  metaphysicalSchoolCount: number;
  ontologyMappingCount: number;
  htzcRuleCount: number;
};

export declare function createUserOverrideRecord(
  input: {
    school_id: string;
    entity_id: string;
    custom_element?: string;
    custom_weight?: number;
  },
  now?: () => string
): {
  school_id: string;
  entity_id: string;
  custom_element?: string;
  custom_weight?: number;
  updated_at: string;
};

export declare function createOverrideAuditEntry(
  input: {
    school_id: string;
    entity_id: string;
    previous?: {
      element_attribute?: string;
      weight_modifier?: number;
    };
    next?: {
      element_attribute?: string;
      weight_modifier?: number;
    };
    reason: string;
  },
  now?: () => string
): {
  audit_id: string;
  school_id: string;
  entity_id: string;
  previous_element?: string;
  previous_weight?: number;
  next_element?: string;
  next_weight?: number;
  reason: string;
  created_at: string;
};

export declare function applyUserOverrides(overrides: Array<{
  school_id: string;
  entity_id: string;
  custom_element?: string;
  custom_weight?: number;
}>): {
  records: Array<{
    school_id: string;
    entity_id: string;
    custom_element?: string;
    custom_weight?: number;
    updated_at: string;
  }>;
  auditLog: Array<{
    audit_id: string;
    school_id: string;
    entity_id: string;
    previous_element?: string;
    previous_weight?: number;
    next_element?: string;
    next_weight?: number;
    reason: string;
    created_at: string;
  }>;
  appliedMapping: Array<{
    school_id: string;
    entity_id: string;
    element_attribute: string;
    is_enabled: boolean;
    weight_modifier: number;
  }>;
};

export declare function buildPhase2FixtureBundle(): {
  version: number;
  summary: {
    canonicalEntityCount: number;
    astrologyConceptCount: number;
    calculationMethodCount: number;
    calculationSourceCount: number;
    dungSuEventCount: number;
    dungSuScoringProfileCount: number;
    metaphysicalSchoolCount: number;
    ontologyMappingCount: number;
    htzcRuleCount: number;
  };
  canonicalSeed: ReturnType<typeof buildCanonicalSeedSnapshot>;
  htzcFixtures: Array<{
    label: string;
    timestamp: number;
    latitude: number;
    resolved:
      {
        ruleId: string;
        offsetHours: number;
        ambiguous: false;
      };
    shiftedTimestamp: number | null;
  }>;
  overrideFixtures: ReturnType<typeof applyUserOverrides>;
};
