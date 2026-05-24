---
description: Unified reference for task classification, confidence scoring, decision routing, and AI model selection by task type
---

# RULE: ROUTING (Unified)

Combines task complexity classification, confidence-based decision routing, and model selection into a single reference. All agents reference this file for consistent routing.

---

# PART A: Task Classification & Decision Routing

## 1. Gate 0: Fast Route Bypass (Token Optimization)

> **MANDATORY PRE-CHECK:** Before invoking any Orchestrator LLM, intercept the input using rule-based/regex matching.

- **Trigger:** If the user input is < 50 characters AND matches casual intents (e.g., "ok", "hi", "haha") or static system commands.
- **Action:** Bypass the LLM entirely. Return a static template response.

---

## 2. Task Complexity Classification

| Level | Files | Domains | Gate | Verification | Tool Budget | Delegation Mode |
|---|---|---|---|---|---|---|
| **Trivial** | <=1 | 1 | None | @dev self-verify | 10 | Persona-switch |
| **Small** | <=3 | 1 | Fast-path | @dev + @qc spot-check | 20 | Persona-switch (default) |
| **Standard** | 4-6 | 1 | Fast-path + validate | @dev + @qc novel parts | 30 | Lightweight delegation |
| **Medium** | 7-10 | 1-2 | SPARC lite | Full @dev, @qc, @pm | 40 | CLI workers preferred |
| **Large** | >10 | 2+ | Full SPARC | Full + `/implementation-review` | 60 | CLI workers MANDATORY |
| **Epic** | >20 | 3+ | SPARC + dialectical | Full + review + debate | 80 | CLI workers + multi-worker |

### How to Classify
1. Count **files** expected to change.
2. Count **domains** (UI, engine, API, infra, testing = separate domains).
3. Use the highest matching level.
4. **Novelty override:** Existing pattern extensions may downgrade one level. Novel patterns never downgrade.

### Analysis/Review Task Override
| Signal | Override Level |
|---|---|
| Multi-agent review (3+ domains) | **Large** minimum |
| User amplifier keywords ("exhaustive", "comprehensive") | **+1 level** |
| "Call every agent" / "all agents" | **Epic** |

---

## 3. Confidence-Based Routing

### Score Format
```markdown
**Confidence:** [0-100] | **Flags:** [uncertain areas] | **Evidence:** [basis]
```

### Auto-Routing Table

| Score | Action |
|---|---|
| **>= 85** | Proceed autonomously |
| **75-84** | Proceed, flag for post-hoc review |
| **60-74** | Flag for @pm review before proceeding |
| **< 60** | HALT -- generate 2-3 alternatives, escalate |

### Anti-Pattern: Confidence Theater
Don't always score 85+ to avoid review friction. Don't score low to avoid responsibility.

---

## 4. Progress Tracking

### Monotonicity Rule
Track: tests passing (must >= previous), files completed (must >= previous), errors remaining (must <= previous).
Non-monotonic for **2 consecutive iterations** -- revert to last good state, reassess.

### Checkpoint Rule
At **75% of tool budget**, the agent MUST:
1. Summarize progress in `task.md`.
2. Assess remaining work vs. remaining budget.
3. Run `/token-check` if approaching token limits.
4. Run cognitive bias check (`anti-patterns.md` Section 11) if in swarm mode.
5. If >50% work remains -- trigger Context Reset or `/handoff`.

---

# PART B: Model Routing

## 5. Model Inventory

| Code | Model | Strength | Cost |
|------|-------|----------|------|
| `OPUS/Plan` | Claude Opus (Thinking) | Deep reasoning, architecture, complex planning | $$$ |
| `SONNET/Fast` | Claude Sonnet (Thinking) | Strong coding, multi-file implementation, testing | $$ |
| `GEMINI-H/Plan` | Gemini 3.1 Pro (High) | Massive context, research, reports, multilingual | $$ |

### Modes
- **Plan** -- deep reasoning, exploration, architecture, strategy, research
- **Fast** -- execution tasks, coding, testing, quick fixes

---

## 6. Task Type -> Model Matrix

| Task Type | Model Code | Rationale |
|---|---|---|
| Brainstorming & Strategy | `OPUS/Plan` | Deep thinking, creative exploration |
| Research & Analysis | `GEMINI-H/Plan` | Large context window, research synthesis |
| Architecture & System Design | `OPUS/Plan` | Complex structural decisions |
| Data Enrichment & Content | `GEMINI-H/Plan` | Fast multilingual content, large context |
| Coding & Implementation | `SONNET/Fast` | Strong code generation, fast execution |
| DevOps & Infrastructure | `SONNET/Fast` | Infrastructure code + fast execution |
| Testing & QA | `SONNET/Fast` | Precise test logic, code-centric |
| UI/UX Design & Styling | `SONNET/Fast` | Visual code, CSS, component coding |
| Quick Fixes & Triage | `SONNET/Fast` | Fast coding for small changes |
| Reports & Documentation | `GEMINI-H/Plan` | Organized report generation, large output |
| Security Audit / Pentest | `OPUS/Plan` | Deep reasoning + threat analysis |

---

## 7. SPARC Phase -> Model Mapping

| Phase | Agent | Model | Rationale |
|-------|-------|-------|-----------| 
| **S** -- Specification | @ba, @pm | `GEMINI-H/Plan` | Research + content |
| **P** -- Pseudocode | @sa | `OPUS/Plan` | Algorithm design |
| **A** -- Architecture | @sa, @designer | `OPUS/Plan` | API contracts |
| **R** -- Refinement | @dev-fe, @dev-be, @qc | `SONNET/Fast` | Coding + testing |
| **C** -- Completion | @devops, @ba | `GEMINI-H/Plan` | Release notes |

---

## 8. Agent Defaults

| Agent | Default | Primary Task |
|---|---|---|
| @pm | `OPUS/Plan` | Orchestration, planning, strategy |
| @biz | `GEMINI-H/Plan` | Content, marketing, research |
| @ba | `GEMINI-H/Plan` | Research, content |
| @sa | `OPUS/Plan` | Architecture, system design |
| @dev-fe | `SONNET/Fast` | Frontend coding |
| @dev-be | `SONNET/Fast` | Backend coding |
| @qc | `SONNET/Fast` | Testing, verification |
| @devops | `SONNET/Fast` | CI/CD, security code |
| @designer | `SONNET/Fast` | UI/UX, CSS |

---

## 9. Handoff Boundaries

### Worth Switching
| From -> To | Why |
|-----------|-----|
| S (GEMINI) -> P (OPUS) | Research -> deep logic needs stronger reasoning |
| A (OPUS) -> R (SONNET) | Architecture done, coding is Sonnet's strength |
| R (SONNET) -> C (GEMINI) | Coding done, docs are Gemini's strength |

### Not Worth Switching
Same model category, or complex task mid-stream -> context preservation > model benefit.

---

## 10. Cost Optimization

1. **Use the cheapest model that can do the job well.**
2. **Plan/research on Gemini High, think deeply on Opus, code on Sonnet.**
3. **Batch content tasks for Gemini.** 20 texts in one session > one-by-one.
4. **Don't split for <15 minutes of work.** Handoff overhead isn't worth it.
5. **When in doubt, stay.** Preserved context > marginal model advantage.

### CLI Worker Enforcement

| Task Complexity | `-ApprovalMode` | `-Timeout` | Context File |
|----------------|-----------------|-----------|---------------|
| **Mechanical** (lint, typo, <=2 files) | `Yolo` | `60` | `AGENTS-LITE-{role}.md` |
| **Integration** (multi-file impl) | `AutoEdit` | `300` | `AGENTS-LITE-{role}.md` |
| **Architecture/Review** (design, audit) | `AutoEdit` | `600` | `AGENTS-LITE-{role}.md` |

---

## 11. Escalation & Fallback

- Unsure -> default to `OPUS/Plan` (thinking tasks) or `SONNET/Fast` (coding tasks).
- User explicit preference -> respect it over this rule.
- **Quota exhaustion:** Auto-pivot to alternative model. Pause swarms and queue remaining tracks. Trigger Circuit Breaker if PM context hits token ceiling.

---

## 12. Cross-References
- **Verification Tiers** -- `execution-protocol.md` Section 3
- **Dialectical Gate** -- `dialectical-development.md`
- **Iteration Budget** -- `execution-protocol.md` Section 4
