---
description: Post-mortem investigation of failed workflow runs — diagnoses stuck loops, missing artifacts, and git anomalies
---

# Workflow: /forensics

**Trigger:** A spawned agent, workflow, or phase execution failed, got stuck, or produced unexpected results.

**Goal:** Systematically diagnose what went wrong without manual debugging. Output a structured diagnosis with root cause and remediation.

## Steps

### 1. Gather Evidence

Collect artifacts from the failed run:

1. **Spawn output logs:** Read `.agent/spawn_agent_tasks/output-*.log` (most recent).
2. **Git state:** `git status`, `git log -5 --oneline`, `git diff --stat`.
3. **Phase files:** Check `.hc/phases/` for incomplete or missing artifacts.
4. **Task files:** Check `task.md` or equivalent for in-progress items.
5. **Anti-pattern log:** Check `.agent/benchmarks/guardrail-hits.md` for recent entries.

### 2. Diagnose

Check for these failure modes (ordered by frequency):

| Failure Mode | Evidence | Root Cause |
|-------------|----------|------------|
| **Stuck loop** | Same error repeated 3+ times in output log | Anti-loop not triggered, or wrong fix applied repeatedly |
| **Missing exit condition** | Task prompt lacks `## Done When` | Verify+Done pattern violation (execution-protocol.md S11) |
| **Context exhaustion** | Long output, degraded quality near end | No `/token-check` triggered |
| **File conflict** | `git status` shows merge conflicts or dirty state | Parallel workers wrote to same file |
| **Missing dependency** | Import errors, module not found | Worker didn't read prerequisites |
| **Prompt injection** | Unexpected behavior, off-topic output | Unsanitized user text in prompt file |
| **Git anomaly** | Uncommitted changes, detached HEAD | Worker crashed before commit |

### 3. Output Diagnosis

Write `.hc/forensics/YYYY-MM-DD-[slug].md`:

```markdown
# Forensics: [Failed Task Name]

## Verdict
[One-line root cause]

## Evidence
- [Key finding 1]
- [Key finding 2]

## Root Cause
[Detailed explanation]

## Remediation
1. [Step to fix the immediate issue]
2. [Step to prevent recurrence]

## Related
- Anti-pattern: [which rule was violated]
- Files affected: [list]
```

### 4. Auto-Remediation (if possible)

If the root cause has a known fix:
- Stuck loop → Propose alternative approach.
- Missing exit condition → Add `## Verify` + `## Done When` and re-run.
- Git anomaly → `git stash` or `git reset --soft HEAD~1` and re-attempt.
- Context exhaustion → Generate `/handoff` for fresh session.

---

## Output Files
| File | Location |
|------|----------|
| Forensics report | `.hc/forensics/YYYY-MM-DD-[slug].md` |
