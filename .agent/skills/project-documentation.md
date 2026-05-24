---
description: Project Documentation — tiered document generation based on task complexity, producing only what's necessary
---

# SKILL: PROJECT DOCUMENTATION

**Trigger:** When starting any new feature, project, or significant change that requires documentation beyond inline code comments.

---

## When to Use
- New project kickoff — produce foundation docs
- New feature or significant change — produce delta docs
- Sprint/phase completion — produce summary docs
- When @pm or user requests "write docs" or "document this"

---

## Tiered Document Model

Only produce documents matching the task's complexity tier (per `routing.md` Section 2). Higher tiers include lower tier docs.

### Tier 1: Minimal (Trivial/Small — <=3 files, 1 domain)
**Produce:** Nothing beyond code comments and commit messages.
No separate documents needed. Well-written code IS the documentation.

### Tier 2: Brief (Standard — 4-6 files, 1 domain)
**Produce:** One combined document:

```markdown
# [Feature/Change Name]
**Date:** YYYY-MM-DD | **Status:** In Progress / Done

## What & Why
[2-3 sentences: what this changes and why]

## Technical Approach
[Key decisions, patterns used, data flow if relevant]

## Files Changed
- `path/to/file` — [what changed]

## Testing
[How it was verified — commands run, edge cases covered]
```

Save to: `.hc/docs/[feature-name].md`

### Tier 3: Standard (Medium — 7-10 files, 1-2 domains)
**Produce:** Tier 2 doc + these additions:

```markdown
## Risk & Edge Cases
[Known risks, boundary conditions, failure modes]

## Dependencies
[New packages, API changes, breaking changes]
```

### Tier 4: Full (Large/Epic — >10 files, 2+ domains)
**Produce:** Separate documents using the `/propose` workflow:
- `proposal.md` — why + scope + approach
- `specs/` — delta specs per logical unit
- `design.md` — architecture decisions + data flow
- `tasks.md` — implementation checklist

Also produce a **Test Strategy** doc if the change touches critical paths.

---

## Anti-Waste Rules

1. **Never write documents nobody will read.** If the feature is 2 files, a doc is waste.
2. **No separate epics/stories/gap-analyses for Tier 1-2 tasks.** The brief IS the spec.
3. **No duplicate content.** If it's in the code comments, don't repeat it in a doc.
4. **Inline over separate.** Prefer README sections and code comments over standalone docs for small changes.
5. **One doc > many docs.** A single brief beats proposal + spec + design + tasks for Standard tier.
6. **Delta over full.** Document what CHANGED, not the entire system. Full system docs are a separate maintenance task (`/sync-docs` workflow).

---

## Document Quality Checklist

Before finalizing any document:
- [ ] Would a new developer understand the change from this doc alone?
- [ ] Is every sentence adding value? (Remove filler: "In this document we will...")
- [ ] Are there concrete file paths, not vague references?
- [ ] Is the testing section specific enough to reproduce?

---

## Completion Phase Docs (SPARC: Completion)

After feature/phase ships, update (not create new):
1. Update existing README or ARCHITECTURE doc with new patterns
2. Update API contracts if endpoints changed
3. Archive the feature doc to `.hc/docs/_archive/` if no longer active

---

## Rules
- **Tier determines scope.** Never produce Tier 4 docs for a Tier 2 task. This is waste.
- **User can override.** If user asks for full docs on a small task, comply.
- **SOT wins.** If `docs/tech/API_CONTRACTS.md` exists, update it — don't create a parallel doc.
