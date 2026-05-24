---
description: Capture forward-looking ideas with trigger conditions that auto-surface at the right milestone
---

# Workflow: /plant-seed

**Trigger:** User has an idea that isn't ready for active work but should surface later.

**Goal:** Park ideas in `.hc/seeds/` with trigger conditions. Seeds are reviewed when `/hc-sdlc` starts a new milestone or when `/review-backlog` runs.

## Steps

### 1. Capture the Seed

Create `.hc/seeds/NNNN-[slug].md`:

```markdown
# Seed: [Idea Title]

## Idea
[1-3 sentence description of the idea]

## Triggers At
- [ ] [Condition that should cause this seed to surface, e.g. "next frontend milestone", "when auth system exists", "after v2 launch"]

## Context
[Optional — why this idea matters, what inspired it, constraints to keep in mind]

## Planted
- Date: [YYYY-MM-DD]
- Session: [brief context of what was being discussed]
```

Number seeds sequentially (0001, 0002, etc.).

### 2. Confirm to User

Report: "Seed planted: `[slug]`. Will surface when: [trigger condition]."

### 3. Auto-Surfacing

When `/hc-sdlc` runs `/new-milestone` or `/new-project`, scan `.hc/seeds/` and present any seeds whose trigger conditions match the current milestone scope. User decides: promote to phase, defer, or discard.

---

## Output Files
| File | Location |
|------|----------|
| Seed file | `.hc/seeds/NNNN-[slug].md` |
