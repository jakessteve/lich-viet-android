---
description: Auto-detect project state and route to the next logical workflow step in the SDLC pipeline
---

# Workflow: /next

**Trigger:** User invokes `/next` or agent needs to determine what comes next.

**Goal:** Read `.hc/` state, determine which SDLC step is appropriate, and route automatically.

## Detection Logic

Read these files in order to determine current state:

| Check | If Found | Route To |
|-------|----------|----------|
| No `.hc/` directory | Project not initialized | `/hc-sdlc` (start from RESEARCH) |
| `.hc/stories/` empty, no PRD | Specification phase incomplete | `/hc-sdlc` step 1-5 (RESEARCH → REQUIREMENTS) |
| PRD exists, no `.hc/pseudocode/` | Planning needed | `/hc-sdlc` step 6 (PSEUDOCODE) |
| Pseudocode exists, no ARCHITECTURE | Architecture needed | `/hc-sdlc` step 7 (ARCHITECTURE) |
| Architecture exists, no security review | Security gate pending | `/hc-sdlc` step 8 (SECURITY REVIEW) |
| Security done, no tests | TDD scaffolding needed | `/hc-sdlc` step 9 (TEST SCAFFOLDING) |
| Tests exist, failing | Implementation needed | `/hc-sdlc` step 10 (IMPLEMENTATION) |
| Tests passing | Verification needed | `/hc-sdlc` step 11 (VERIFICATION) |
| Verification done | Deployment/completion | `/hc-sdlc` step 12 (COMPLETION) |
| All done | Maintenance or new milestone | `/close-phase` or `/new-milestone` |

## Priority Overrides

Check these before normal routing:

1. **Seeds with met triggers** → Surface via `/review-backlog` first.
2. **Active threads needing attention** → Mention in output.
3. **Handoff pending** → Resume from handoff.
4. **Guardrail hits logged** → Mention as warning.

## Output

Report to user:

```
Current state: [phase/step]
Next action: [what will happen]
Estimated complexity: [Simple/Medium/Large]
Proceed? [auto-proceed if Simple, ask for Medium+]
```
