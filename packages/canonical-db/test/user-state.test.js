import test from "node:test";
import assert from "node:assert/strict";

import {
  applyUserOverrides,
  createOverrideAuditEntry,
  createUserOverrideRecord
} from "../src/user-state.js";

const FIXED_TIME = () => "1970-01-01T00:00:00.000Z";

test("createUserOverrideRecord normalizes override input", () => {
  const record = createUserOverrideRecord(
    {
      school_id: "western_electional",
      entity_id: "venus",
      custom_element: "water",
      custom_weight: 1.35
    },
    FIXED_TIME
  );

  assert.deepEqual(record, {
    school_id: "western_electional",
    entity_id: "venus",
    custom_element: "water",
    custom_weight: 1.35,
    updated_at: "1970-01-01T00:00:00.000Z"
  });
});

test("createOverrideAuditEntry captures before/after values", () => {
  const entry = createOverrideAuditEntry(
    {
      school_id: "western_electional",
      entity_id: "venus",
      previous: { element_attribute: "air", weight_modifier: 1.1 },
      next: { element_attribute: "water", weight_modifier: 1.35 },
      reason: "user_override_applied"
    },
    FIXED_TIME
  );

  assert.equal(entry.audit_id, "western_electional:venus:1970-01-01T00:00:00.000Z");
  assert.equal(entry.previous_element, "air");
  assert.equal(entry.next_weight, 1.35);
});

test("applyUserOverrides mutates the targeted canonical mapping and creates audit rows", () => {
  const result = applyUserOverrides([
    {
      school_id: "western_electional",
      entity_id: "venus",
      custom_element: "water",
      custom_weight: 1.35
    }
  ]);

  const venusMapping = result.appliedMapping.find(
    (row) => row.school_id === "western_electional" && row.entity_id === "venus"
  );

  assert.equal(result.records.length, 1);
  assert.equal(result.auditLog.length, 1);
  assert.equal(venusMapping?.element_attribute, "water");
  assert.equal(venusMapping?.weight_modifier, 1.35);
  assert.equal(
    result.appliedMapping.some((row) => row.entity_id.startsWith("calc_")),
    false
  );
});

test("applyUserOverrides rejects malformed override entries", () => {
  assert.throws(
    () =>
      applyUserOverrides([
        null
      ]),
    /input must be an object/
  );
});
