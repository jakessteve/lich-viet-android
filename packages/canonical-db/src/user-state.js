import { ENTITY_ONTOLOGY_MAPPING } from "../seeds/entity-ontology-mapping.js";

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${fieldName} must be a non-empty string`);
  }
}

function assertOptionalNumber(value, fieldName) {
  if (value !== undefined && !Number.isFinite(value)) {
    throw new TypeError(`${fieldName} must be a finite number when provided`);
  }
}

function assertObject(value, fieldName) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${fieldName} must be an object`);
  }
}

export function createUserOverrideRecord(input, now = () => new Date().toISOString()) {
  assertObject(input, "input");
  assertNonEmptyString(input.school_id, "school_id");
  assertNonEmptyString(input.entity_id, "entity_id");
  assertOptionalNumber(input.custom_weight, "custom_weight");

  if (input.custom_element !== undefined) {
    assertNonEmptyString(input.custom_element, "custom_element");
  }

  const timestamp = now();

  return {
    school_id: input.school_id,
    entity_id: input.entity_id,
    ...(input.custom_element ? { custom_element: input.custom_element } : {}),
    ...(input.custom_weight !== undefined ? { custom_weight: input.custom_weight } : {}),
    updated_at: timestamp
  };
}

export function createOverrideAuditEntry(
  { school_id, entity_id, previous, next, reason },
  now = () => new Date().toISOString()
) {
  assertNonEmptyString(school_id, "school_id");
  assertNonEmptyString(entity_id, "entity_id");
  assertNonEmptyString(reason, "reason");

  const timestamp = now();

  return {
    audit_id: `${school_id}:${entity_id}:${timestamp}`,
    school_id,
    entity_id,
    previous_element: previous?.element_attribute,
    previous_weight: previous?.weight_modifier,
    next_element: next?.element_attribute,
    next_weight: next?.weight_modifier,
    reason,
    created_at: timestamp
  };
}

export function applyUserOverrides(overrides, now = () => new Date().toISOString()) {
  if (!Array.isArray(overrides)) {
    throw new TypeError("overrides must be an array");
  }

  const records = overrides.map((override) => createUserOverrideRecord(override, now));
  const auditLog = [];
  const mapping = ENTITY_ONTOLOGY_MAPPING.map((row) => ({ ...row }));

  for (const override of records) {
    const target = mapping.find(
      (row) =>
        row.school_id === override.school_id &&
        row.entity_id === override.entity_id
    );

    if (!target) {
      throw new RangeError(
        `No canonical mapping found for ${override.school_id}/${override.entity_id}`
      );
    }

    const previous = { ...target };

    if (override.custom_element) {
      target.element_attribute = override.custom_element;
    }

    if (override.custom_weight !== undefined) {
      target.weight_modifier = override.custom_weight;
    }

    auditLog.push(
      createOverrideAuditEntry({
        school_id: override.school_id,
        entity_id: override.entity_id,
        previous,
        next: target,
        reason: "user_override_applied"
      }, now)
    );
  }

  return {
    records,
    auditLog,
    appliedMapping: mapping
  };
}
