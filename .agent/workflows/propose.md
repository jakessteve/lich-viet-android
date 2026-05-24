---
description: Spec-driven feature proposal — creates a structured change folder with proposal, specs, design, and tasks
---
Inspired by OpenSpec's SDD methodology. Creates a persistent, per-change artifact folder that survives across sessions.

## When to Use
- Any new feature, significant refactoring, or architectural change
- When the user describes a new piece of work (even if it sounds small — specs prevent scope creep)

## Steps

1. **Create the change folder**

Create `.hc/changes/[change-name]/` with the following structure:
```
.hc/changes/[change-name]/
  proposal.md   <- why + scope + approach (written by @ba/@pm)
  specs/        <- delta specs: what changes (written by @ba)
  design.md     <- technical approach + architecture decisions (written by @sa)
  tasks.md      <- implementation checklist with checkboxes (written by @pm)
```

2. **Write `proposal.md`** (as @ba or @pm)

Use this template:
```markdown
# Proposal: [Feature Name]

## Intent
[Why are we building this? What user problem does it solve?]

## Scope
**In scope:**
- [Specific deliverable 1]
- [Specific deliverable 2]

**Out of scope:**
- [Explicitly excluded items]

## Approach
[High-level approach — 2-3 sentences]
```

3. **Write delta specs** in `specs/` (as @ba)

Create one spec file per logical unit of change. Each spec describes WHAT changes relative to current behavior, not the full system spec.

4. **Write `design.md`** (as @sa)

Cover: technical approach, architecture decisions (with rationale), data flow, file changes.

5. **Write `tasks.md`** (as @pm)

Break into numbered, checkbox-tracked implementation steps. Group by component. Each task should be completable in one session.

6. **Present for review**

Show the user the complete change folder for approval before any implementation begins.

7. **Implement** (as @dev)

Work through `tasks.md` checking off items. Update artifacts if scope/design changes during implementation.

---

## Archiving (after merge/completion)

When the change is complete, move the folder to `.hc/changes/_archive/[date]-[change-name]/`.
This is equivalent to running `/close-phase`.
