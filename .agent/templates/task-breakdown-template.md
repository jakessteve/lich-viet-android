# Task Breakdown: [FEATURE_NAME]

> **Plan:** [link to implementation plan]
> **Author:** @pm
> **Status:** Draft | Approved | In Progress | Done

---

## Legend

- `[ ]` — Not started
- `[/]` — In progress
- `[x]` — Done
- `[P]` — Can run in **parallel** with other `[P]` tasks in the same group
- `[B]` — **Blocked** on a preceding task or external dependency
- `[NEEDS CLARIFICATION]` — Cannot proceed without clarification

---

## Phase 1: [Phase Name from Plan]

**Checkpoint:** [What should be independently verifiable after this phase]

### 1.1 Types & Interfaces
- [ ] Create `[path/to/types.ts]` — define [interfaces]
  - Dependencies: None

### 1.2 Tests (TDD Red)
- [ ] Create `[path/to/feature.test.ts]` — test [behavior]
  - Dependencies: 1.1
  - Expected: Tests FAIL (Red phase)

### 1.3 Implementation (TDD Green)
- [ ] [P] Implement `[path/to/service.ts]` — [purpose]
  - Dependencies: 1.1, 1.2
- [ ] [P] Implement `[path/to/util.ts]` — [purpose]
  - Dependencies: 1.1

### 1.4 Phase Checkpoint
- [ ] All Phase 1 tests pass
- [ ] `npx tsc --noEmit` — zero type errors
- [ ] Lint clean

---

## Phase 2: [Phase Name from Plan]

**Checkpoint:** [...]

### 2.1 [Task Group]
- [ ] [Task description]
  - Dependencies: Phase 1
- [ ] [Task description]
  - Dependencies: 2.1.1

---

## Final Verification

- [ ] Full test suite passes (`npm test`)
- [ ] Type check passes (`npx tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)
- [ ] Visual verification (light + dark mode, mobile viewport)
- [ ] All acceptance criteria from spec checked off
- [ ] No `[NEEDS CLARIFICATION]` markers remain

---

## Traceability Matrix

> Every task must trace to a spec requirement. Every spec requirement must have at least one task.

| Spec Requirement | Task(s) | Status |
|-----------------|---------|--------|
| US-1 AC-1 | 1.3.1 | |
| US-1 AC-2 | 1.3.2 | |
| US-2 AC-1 | 2.1.1 | |

---

> **Instructions for @pm / LLM:**
> - Derive tasks directly from the implementation plan phases
> - Mark parallel-safe tasks with `[P]`
> - Include explicit dependencies for every task
> - Each phase MUST have a checkpoint that validates independent functionality
> - Fill in the Traceability Matrix — every spec requirement needs >=1 task
> - If a task cannot be defined clearly, mark it `[NEEDS CLARIFICATION]`
