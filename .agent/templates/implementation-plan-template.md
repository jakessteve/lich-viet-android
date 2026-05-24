# Implementation Plan: [FEATURE_NAME]

> **Spec:** [link to feature spec]
> **Author:** @sa
> **Status:** Draft | Reviewed | Approved

---

## Phase -1: Pre-Implementation Gates

> These gates MUST pass before any implementation begins. If a gate fails, document the justification in the Complexity Tracking section below.

### Simplicity Gate (Constitution Art. V)
- [ ] Using minimal new dependencies?
- [ ] No speculative features?
- [ ] No premature abstraction?
- [ ] Simplest approach that meets acceptance criteria?

### Engine Independence Gate (Constitution Art. IX)
- [ ] No circular dependencies introduced?
- [ ] New engine logic in `src/services/`, not in UI components?
- [ ] Feature independently testable?

### Data Integrity Gate (Constitution Art. VII)
- [ ] Calculation algorithms cite authoritative sources?
- [ ] Edge cases (year boundaries, leap months) explicitly handled?

### Security Gate (Constitution Art. VIII)
- [ ] No hardcoded secrets?
- [ ] All user inputs validated?
- [ ] CSP implications reviewed?

---

## 1. Technical Approach

### Architecture Overview
<!-- High-level description of the approach. Keep it readable. -->

### Technology Choices
| Decision | Choice | Rationale | Alternatives Considered |
|----------|--------|-----------|------------------------|
| | | | |

### Data Model Changes
<!-- New types, modified interfaces, database schema changes -->

---

## 2. Implementation Phases

### Phase 1: [Name]
**Prerequisite:** None
**Deliverable:** [What is independently testable after this phase]
**Files:**
- `[path/to/file]` — [purpose]

### Phase 2: [Name]
**Prerequisite:** Phase 1
**Deliverable:** [...]
**Files:**
- `[path/to/file]` — [purpose]

---

## 3. File Creation Order

> Follow this order to respect dependencies and support TDD.

1. Types/interfaces (`.ts` type files)
2. Test files (TDD Red — tests that fail)
3. Service/engine implementations (TDD Green)
4. UI components (if applicable)
5. Integration wiring

---

## 4. Test Strategy

### Unit Tests
- [ ] Engine logic covered (target: 80%+)
- [ ] Edge cases from spec explicitly tested

### Integration Tests
- [ ] Component + service integration tested
- [ ] API contract tests (if applicable)

### Visual Tests
- [ ] Light/dark mode verified
- [ ] Mobile viewport verified

---

## 5. Complexity Tracking

> Document any gate failures or justified complexity here.

| Gate | Status | Justification (if failed) |
|------|--------|--------------------------|
| Simplicity | PASS/FAIL | |
| Engine Independence | PASS/FAIL | |
| Data Integrity | PASS/FAIL | |
| Security | PASS/FAIL | |

---

## 6. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| | | |

---

## Review Checklist

- [ ] Every phase has clear prerequisites and deliverables
- [ ] All tech choices trace back to spec requirements
- [ ] File creation order supports TDD
- [ ] No over-engineering — each complexity justified
- [ ] Constitution gates all pass (or failures documented)
- [ ] Cross-checked against spec — no orphaned or missing requirements

---

> **Instructions for @sa / LLM:**
> - This plan should remain HIGH-LEVEL and readable
> - Detailed code samples, algorithms, or API contracts go in separate files
> - Every technology choice MUST link to a specific requirement from the spec
> - Run all Phase -1 gates BEFORE writing the implementation phases
> - If a gate fails, document WHY in the Complexity Tracking section
