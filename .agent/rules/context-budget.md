---
description: Always On — context window budget tracking, warning thresholds, and progressive load management
---

# RULE: CONTEXT BUDGET

Prevent runaway token consumption by tracking estimated context size and enforcing load limits.

---

## 1. Per-Session Context Budget

| Session Type | Max Base Context | Warning At |
|---|---|---|
| Orchestrator (interactive) | 100 KB | 75 KB |
| CLI Worker (spawned) | 30 KB | 20 KB |

**Base context** = AGENTS file + rules + skills loaded + workflow + instructions.

---

## 2. Lazy-Load Accounting (Framework Level)

Every `view_file` on a `.agent/` file adds to the running context total. Track estimated load:

```
Context = .agent/indexes/AGENTS-LITE (1-2 KB)
        + Rules loaded (from rules/MANIFEST.md)
        + Skills loaded (from skills/MANIFEST.md)
        + Source files viewed
```

**Before loading a new skill or rule file**, estimate whether it will push past the warning threshold. If yes:
1. Check if a currently-loaded skill is no longer needed and can be mentally deprioritized.
2. If at the warning threshold, log: `[CONTEXT] Warning: ~{X} KB loaded, approaching {MAX} KB budget.`
3. If at the hard cap, STOP loading new .agent/ files and work with what you have.

---

## 2.1 Lazy Memory Injection (User Intent Matrix)

For user context (chat history, RAG databases, memory files):
- **Casual Intent:** If the user sends a casual message ("ok", "hi"), inject ONLY a micro-profile (<50 tokens) to maintain persona. Do NOT retrieve or inject full RAG memory.
- **Deep Query Intent:** Only inject Full RAG / Memory Context when the user asks a deep question requiring personal or project data retrieval.

---

## 3. Worker Context Injection Checklist

When composing a CLI worker spawn prompt, verify context stays under 30 KB:

- [ ] Role-scoped `.agent/indexes/AGENTS-LITE` file (1-2 KB)
- [ ] Rules from rules/MANIFEST.md for this role (5-20 KB)
- [ ] Skills manifest reference only — not full skill files (0 KB — worker loads on-demand)
- [ ] Task-specific files (remainder of budget)

**If the total prompt exceeds 30 KB**, split the task or reduce context.

---

## 4. Output Caps (ENFORCED)

These are **hard limits**, not suggestions:
- `run_command`: Request max 100 lines. Summarize if more.
- `view_file`: Max 500 lines per read. If bigger, use `grep_search`.
- `browser_subagent`: Summarize in ≤5 bullet points per page.
- `npm test`/`tsc`: Summarize error categories if >30 errors.
- **Proactive Context Check:** After every 15 tool calls, or if >8 files read, proactively compress and discard unneeded context.

---

## 4.1 History Compression & Context Caching

- **History Filtering:** Protect the "Middle" zone of chat history from token bloat and hallucination by truncating long bot responses and strictly stripping out all `[ACTION:...]` or `<ctrl94>thought...<ctrl95>` tags from past turns. Retain only the Observation/Result.
- **Context Caching (Gemini):** Push all static `.agent/` rule files and System Prompts into Gemini Context Caching. The orchestrator must prioritize fetching from the cache rather than passing static tokens on every request.

---

## 5. Context Exhaustion (Circuit Breaker)

Token limit exhaustion is a silent failure causing gradual degradation.

**Degradation Signals (ANY -> trigger Reset Focus):**
- Re-reading a file already summarized in this session.
- Producing code that contradicts earlier plans or forgetting decisions.
- Tool outputs feel surprising or hallucinating file paths.
- Exceeding iteration budget checkpoint without completion.
- Loading >5 skill files or >8 rule files.

**Context Reset Protocol (Recovery):**
1. **STOP** all current work immediately.
2. **Summarize** accomplishments in ≤10 bullet points.
3. **Save** checkpoint to `.hc/checkpoints/YYYY-MM-DD-[task-slug].md`.
4. **Report** to User via `notify_user` or UI. Let user approve continuation.
5. Generate `/handoff` artifact. (For Medium+ tasks, resume from `.hc/phases/` if available).

---

## 6. Governance Metrics

At the end of each swarm wave, @pm should estimate:
- Total agents spawned
- Estimated tokens per agent (base context x turns)
- Total wave cost

Compare against the previous wave recorded in `.hc/logs/` and flag if cost increased >20%.

---

## 7. Proactive Context Monitoring

Prevents context rot — the gradual quality degradation as the context window fills.

### 7.1 Mandatory Checkpoints

Every **20 tool calls**, the agent MUST perform a context self-assessment:

1. **Estimate context consumption %** based on: files read, conversation length, rules/skills loaded, artifacts created.
2. **Log assessment:** `[CONTEXT] ~{X}% consumed after {N} tool calls.`
3. **If >60%:** Strongly prefer delegating remaining work via `spawn-agent`. Do NOT continue inline for Medium+ tasks.
4. **If >80%:** Execute Context Reset Protocol (Section 5) immediately. No exceptions.

### 7.2 Degradation Detection Signals

In addition to Section 5 signals, watch for:

- Summarizing information already summarized in this session (redundant compression).
- Generating code that contradicts earlier output from the same session.
- Forgetting file paths, function names, or decisions made earlier in the conversation.
- Asking the user a question that was already answered.

**Any single signal = immediate context audit.** Two or more = mandatory `/token-check`.

### 7.3 Spawn-Agent Offload Protocol

When context hits the 60% threshold during an active task:

1. Save current progress to `.hc/checkpoints/` or `task.md`.
2. Compose a spawn-agent prompt with the remaining work scope.
3. Delegate to a fresh worker agent with clean context.
4. Review the worker output and synthesize results.
