CREATE TABLE canonical_entities (
    entity_id VARCHAR(50) PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL
);

CREATE TABLE metaphysical_schools (
    school_id VARCHAR(30) PRIMARY KEY,
    parent_system VARCHAR(20) NOT NULL
);

CREATE TABLE entity_ontology_mapping (
    school_id VARCHAR(30),
    entity_id VARCHAR(50),
    element_attribute VARCHAR(10),
    is_enabled BOOLEAN DEFAULT 1,
    weight_modifier REAL DEFAULT 1.0,
    PRIMARY KEY (school_id, entity_id),
    FOREIGN KEY (school_id) REFERENCES metaphysical_schools(school_id),
    FOREIGN KEY (entity_id) REFERENCES canonical_entities(entity_id)
);

CREATE INDEX idx_ontology_search ON entity_ontology_mapping (school_id, is_enabled);

CREATE TABLE dung_su_events (
    event_id VARCHAR(50) PRIMARY KEY,
    label_vi VARCHAR(80) NOT NULL,
    classical_label VARCHAR(20) NOT NULL,
    category VARCHAR(20) NOT NULL,
    source_ref VARCHAR(40) NOT NULL,
    FOREIGN KEY (event_id) REFERENCES canonical_entities(entity_id)
);

CREATE INDEX idx_dung_su_events_category ON dung_su_events (category);

CREATE TABLE dung_su_scoring_profiles (
    scoring_profile_id VARCHAR(70) PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    accuracy_tier VARCHAR(30) NOT NULL,
    source_coverage_percent REAL NOT NULL,
    generic_weight REAL NOT NULL,
    cross_system_weight REAL NOT NULL,
    specialist_weight REAL NOT NULL,
    hard_cap_missing_specialist REAL,
    source_ref VARCHAR(40) NOT NULL,
    specialist_ref VARCHAR(50),
    FOREIGN KEY (event_id) REFERENCES dung_su_events(event_id)
);

CREATE INDEX idx_dung_su_scoring_profiles_event ON dung_su_scoring_profiles (event_id, accuracy_tier);

CREATE TABLE astrology_concepts (
    concept_id VARCHAR(50) PRIMARY KEY,
    tradition VARCHAR(20) NOT NULL,
    label VARCHAR(80) NOT NULL,
    category VARCHAR(20) NOT NULL,
    source_ref VARCHAR(40) NOT NULL,
    FOREIGN KEY (concept_id) REFERENCES canonical_entities(entity_id)
);

CREATE INDEX idx_astrology_concepts_tradition ON astrology_concepts (tradition, category);

CREATE TABLE calculation_sources (
    source_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    source_type VARCHAR(30) NOT NULL,
    url VARCHAR(255) NOT NULL
);

CREATE TABLE calculation_methods (
    method_id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    domain VARCHAR(20) NOT NULL,
    school_id VARCHAR(30) NOT NULL,
    source_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (method_id) REFERENCES canonical_entities(entity_id),
    FOREIGN KEY (school_id) REFERENCES metaphysical_schools(school_id),
    FOREIGN KEY (source_id) REFERENCES calculation_sources(source_id)
);

CREATE INDEX idx_calculation_methods_domain ON calculation_methods (domain, school_id, source_id);
