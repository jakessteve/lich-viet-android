---
description: Review, promote, or prune parked ideas from the seeds backlog
---

# Workflow: /review-backlog

**Trigger:** Periodic review (e.g., at milestone boundaries) or manual invocation.

**Goal:** Triage `.hc/seeds/` — promote actionable seeds to active phases, defer others, discard stale ones.

## Steps

### 1. List All Seeds

Read `.hc/seeds/` directory. For each seed, display:
- Title
- Planted date
- Trigger condition
- Whether trigger condition is now met

### 2. Triage Each Seed

For seeds with met trigger conditions, ask user:

| Action | What Happens |
|--------|-------------|
| **Promote** | Create a phase or story from the seed. Move seed to `.hc/seeds/promoted/`. |
| **Defer** | Update trigger condition. Keep in `.hc/seeds/`. |
| **Discard** | Move to `.hc/seeds/discarded/`. |

### 3. Report

Summarize: X promoted, Y deferred, Z discarded, W remaining.

---

## Output Files
| File | Location |
|------|----------|
| Promoted seeds | `.hc/seeds/promoted/` |
| Discarded seeds | `.hc/seeds/discarded/` |
