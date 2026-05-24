---
description: Persistent context threads for cross-session knowledge on specific topics
---

# Workflow: /thread

**Trigger:** User or agent needs to maintain focused context on a specific topic across multiple sessions.

**Goal:** Create or update named threads in `.hc/threads/`. Threads are lightweight markdown files — more focused than KIs, more persistent than conversation context.

## Usage

```
/thread create [name]    — Start a new thread
/thread update [name]    — Append to existing thread
/thread list             — Show all active threads
/thread close [name]     — Archive a thread
/thread show [name]      — Display thread contents
```

## Thread Format

`.hc/threads/[name].md`:

```markdown
# Thread: [Name]

## Status: ACTIVE | CLOSED
## Created: [YYYY-MM-DD]
## Last Updated: [YYYY-MM-DD]

---

### [YYYY-MM-DD] Entry Title
[Content — decisions, findings, context, links to files]

### [YYYY-MM-DD] Entry Title
[Content — subsequent updates appended chronologically]
```

## Integration with spawn-agent

When composing a spawn-agent prompt, check `.hc/threads/` for threads relevant to the task. If found, include thread content in the worker prompt under a `## Background Context` section.

## Rules

- Thread names must be kebab-case (e.g., `auth-migration`, `engine-accuracy`).
- Max 50 lines per entry. If longer, summarize and link to full artifact.
- Threads auto-close after 30 days of inactivity (can be reopened).
- Max 10 active threads. If exceeded, prompt user to close or merge oldest.
