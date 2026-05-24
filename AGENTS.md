# Agent Skills Index

> Auto-generated index for AI agent skill discovery. Read `instructions.md` first.

## ⚠️ Conversation Entry Rule

**Always begin as @pm.** Run the Pre-Delegation Pipeline (`@pm.md` §3.1) and Mandatory Spawn Gate (`@pm.md` §3.1.8) before touching any source files — even for seemingly simple requests like "fix this bug". Estimate file count first, then route. See `instructions.md` §Conversation Entry Protocol.

## Roles (`.agent/roles/`)

| Role | Trigger Context | Key Skills |
|---|---|---|
| `@pm` | Planning, prioritization, delegation, orchestration, facilitation, idea validation | `task-router`, `roadmap-architect`, `model-selector`, `context-management`, `conflict-resolver`, `facilitation`, `red-team-ideas`, `idea-validation`, `implementation-debate`, `requirement-enrichment`, `critical-thinking-models`, `opportunity-cost-analysis`, `amateur-proof-plans`, `cli-worker-lifecycle` |
| `@pm-extended` | Advanced orchestration, facilitation, dialectical development, sprint management | Extends `@pm` — product management details, facilitation mode, conflict resolution, model handoffs, SOT/SPARC gates, sprint reviews |
| `@biz` | Business strategy, marketing, GTM, market research, monetization, partnerships, brand, growth | `competitive-landscape`, `market-sizing`, `financial-modeling`, `content-and-brand`, `launch-strategy`, `investor-pitch-writer`, `analytics-and-feedback`, `business-writing`, `monetization-strategy`, `partnership-development`, `customer-acquisition` |
| `@ba` | Research, requirements, PRD, technical writing, deep analysis | `prd-architect`, `requirement-interviewer`, `research-analysis`, `technical-writing` |
| `@sa` | Architecture, API design, data models, DDD | `senior-architect`, `c4-architecture`, `architecture-patterns`, `domain-driven-design`, `architecture-decision-records`, `microservices-patterns`, `api-design-principles` |
| `@dev` | **Router stub** — detects `fe:` vs `be:` story prefix and delegates to `@dev-fe` or `@dev-be`. No implementation rules of its own. | — |
| `@dev-fe` | Frontend implementation — creative UI, animations, client-side logic, visual quality gates | `react-patterns`, `typescript-expert`, `animation-choreography`, `mobile-ux-patterns`, `premium-taste-ui`, `anti-lazy-output`, `performance-optimization`, `context7-integration`, `test-driven-development` |
| `@dev-be` | Backend implementation — strict sequential, TDD-first, API/service/DB layer, auth, security | Rule `backend-standards`, `typescript-expert`, `test-driven-development`, `api-design-principles`, `architecture-patterns`, `systematic-debugging`, `refactoring-patterns`, `event-sourcing-cqrs`, `context7-integration` |
| `@qc` | Testing, verification, quality, test design | `playwright-testing`, `verification-before-completion`, `test-case-design`, `test-fixing`, `regression-strategy`, `performance-testing`, `mutation-testing` |
| `@devops` | Security, CI/CD, deployment, observability, incident response | `security-audit`, `cicd-pipeline`, `dependency-upgrade`, `devops-operations`, `docker-containerization`, `infrastructure-as-code` |
| `@designer` | UI/UX, styling, visual design, motion, tokens. Prototyping via **Stitch MCP** mandatory for new screens. Taste-score gate ≥ 8 before ship. | `design-system-uiux`, `browser-visual-testing`, `mobile-ux-patterns`, `animation-choreography`, `design-token-pipeline`, `premium-taste-ui`, `anti-lazy-output` |
| `@user-tester` | User experience testing, UX feedback | `user-experience-testing`, `accessibility-empathy`, `browser-visual-testing` |
| `@whitehat-hacker` | Offensive security, penetration testing, API security, social engineering | `penetration-testing`, `attack-simulation`, `security-audit`, `api-security-testing`, `social-engineering-testing` |

---

> For rules, guidelines, skills, and workflows see `instructions.md` §Context Optimization Protocol. Use `list_dir` and `view_file` on-demand — do NOT pre-load.
