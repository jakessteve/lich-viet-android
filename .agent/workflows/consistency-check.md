---
description: Cross-artifact consistency check — validate spec, plan, and tasks are aligned before implementation
---

# Workflow: /consistency-check

Validates that feature artifacts (spec, plan, tasks) are internally consistent and complete before implementation begins.

Inspired by spec-kit's `/speckit.analyze` command.

---

## Prerequisites
- Feature spec exists (using `templates/feature-spec-template.md`)
- Implementation plan exists (using `templates/implementation-plan-template.md`)
- Task breakdown exists (using `templates/task-breakdown-template.md`)

## Steps

### Step 1 — Locate Artifacts
1. Identify the active feature's spec, plan, and task files.
2. Read all three artifacts fully.

### Step 2 — Spec Completeness
1. Scan spec for `[NEEDS CLARIFICATION]` markers. If ANY remain, **STOP** — return to @ba for clarification.
2. Verify every user story has acceptance criteria.
3. Verify the Review Checklist is fully checked.

### Step 3 — Plan ↔ Spec Alignment
1. For each user story in spec → verify a corresponding implementation phase exists in the plan.
2. For each phase in the plan → verify it traces back to at least one spec requirement.
3. Flag **orphaned plan items** (plan phases with no spec backing).
4. Flag **uncovered spec items** (spec requirements with no plan coverage).

### Step 4 — Tasks ↔ Plan Alignment
1. For each plan phase → verify corresponding tasks exist in the task breakdown.
2. For each task → verify it has explicit dependencies listed.
3. Check the Traceability Matrix is complete (every spec requirement has >= 1 task).
4. Flag **phantom tasks** (tasks with no plan or spec backing).

### Step 5 — Constitutional Gate Verification
1. Read `.agent/memory/constitution.md`.
2. Verify the plan's Phase -1 gates are all checked (or failures documented).
3. Verify no constitutional violations exist in the plan's tech choices.

### Step 6 — Report
Generate a consistency report:

```markdown
# Consistency Check: [Feature Name]

## Spec Completeness
- Unresolved clarifications: X
- User stories with acceptance criteria: X/Y

## Spec ↔ Plan Coverage
- Covered spec requirements: X/Y
- Orphaned plan items: [list]
- Uncovered spec items: [list]

## Plan ↔ Tasks Coverage
- Plan phases with tasks: X/Y
- Traceability matrix complete: YES/NO
- Phantom tasks: [list]

## Constitutional Compliance
- Phase -1 gates: ALL PASS / [list failures]

## Verdict: READY / NEEDS WORK
[Summary of blocking issues]
```

Present to @pm. If verdict is **NEEDS WORK**, list specific items to fix. Do NOT proceed to implementation until verdict is **READY**.

---

## Chaining
- Trigger this workflow after `/hc-sdlc` Step 7 (before approval gate).
- Can also be triggered manually at any time with `/consistency-check`.
