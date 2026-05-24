---
description: Codebase-first discussion mode — shows assumptions instead of asking questions for faster intake on brownfield projects
---

# Workflow: /discuss-assumptions

**Trigger:** User invokes `/discuss-assumptions` or uses `--assumptions` flag on `/hc-sdlc` discuss step.

**Goal:** Instead of interviewing the user, analyze the codebase and present what you *would* do and why. User corrects what is wrong. Faster intake for brownfield projects.

## Steps

### 1. Analyze Codebase

Read the relevant source files, existing patterns, and conventions:

- Folder structure and naming conventions
- Existing component/module patterns
- Data models and API contracts
- Test patterns and coverage
- Technology choices and versions

### 2. Generate Assumptions Document

For each decision area related to the feature, present:

```markdown
## [Decision Area]

**I would:** [What the agent plans to do]
**Because:** [Rationale based on codebase patterns]
**Risk if wrong:** [LOW/MEDIUM/HIGH — what breaks if this assumption is incorrect]

Agree? [Y/correct me]
```

### 3. User Corrections

Present all assumptions at once. User marks corrections using:
- **Agree** (default) — assumption is locked.
- **Correction:** [user's alternative] — agent updates.

### 4. Output Context File

Same output as `/hc-sdlc` discuss step: `.hc/context/[feature]-CONTEXT.md`

Locked decisions feed into planning. Corrections are recorded explicitly so the planning/research phases know what NOT to assume.

## When to Use

- **Brownfield** projects where the codebase itself answers most design questions.
- **Experienced users** who prefer correcting errors over answering questions from scratch.
- **Time pressure** where interview-style discussion is too slow.

## When NOT to Use

- **Greenfield** projects with no existing codebase to analyze.
- **Ambiguous requirements** where the user hasn't formed strong opinions yet.
