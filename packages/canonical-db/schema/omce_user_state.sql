CREATE TABLE user_overrides (
    school_id VARCHAR(30),
    entity_id VARCHAR(50),
    custom_element VARCHAR(10),
    custom_weight REAL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (school_id, entity_id)
);

CREATE TABLE override_audit_log (
    audit_id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(30) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    previous_element VARCHAR(10),
    previous_weight REAL,
    next_element VARCHAR(10),
    next_weight REAL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    profile_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birth_timestamp INTEGER NOT NULL,
    latitude REAL,
    longitude REAL,
    country_code VARCHAR(10),
    gender VARCHAR(10),
    natal_context_blob TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
