# Product Constitution

> Immutable architectural principles governing all specification, planning, and implementation work.
> Amendments require explicit rationale, maintainer approval, and backwards-compatibility assessment.

---

## Article I — Engine-First Architecture

Every domain feature MUST begin as a **standalone engine/utility** in `src/services/` or a shared package. No domain logic shall be embedded directly in UI components without first being abstracted into a testable service layer.

**Rationale:** The project contains 11+ calculation engines (Lunar, Bazi, Tu Vi, QMDJ, etc.). Each must remain independently testable, portable, and replaceable.

## Article II — Mobile-First, Vietnamese-First

All UI decisions prioritize **mobile viewport** and **Vietnamese language** as the primary design target. Desktop is an enhancement, not the baseline. All user-facing text defaults to Vietnamese with English as secondary.

## Article III — Specification Before Code

No feature implementation shall begin without a written specification that defines:
1. **WHAT** the feature does (user stories with acceptance criteria)
2. **WHY** it exists (business value / user need)
3. All ambiguities marked with `[NEEDS CLARIFICATION]`

The specification is the **source of truth**. Code serves the specification.

## Article IV — Test-Driven Engines

All calculation engines and business logic MUST follow TDD:
1. Tests written FIRST from acceptance criteria
2. Tests validated to FAIL (Red phase)
3. Implementation to make tests pass (Green phase)
4. Refactor for clarity (Refactor phase)

UI components may use visual testing in lieu of unit tests where appropriate.

## Article V — Simplicity Gate

Before any implementation plan is approved:
- [ ] Using minimal number of new dependencies?
- [ ] No speculative "might need" features?
- [ ] No premature abstraction layers?
- [ ] Could this be simpler and still meet acceptance criteria?

Complexity MUST be justified in writing. Default to the simplest approach.

## Article VI — Theme and Accessibility

Every visual change MUST:
- Support light and dark themes via design tokens
- Meet basic accessibility standards (WCAG AA contrast, keyboard navigable)
- Avoid hardcoded colors, sizes, or strings

## Article VII — Data Integrity

Calculation engines MUST prioritize **academic accuracy** over speed or convenience:
- Astronomical calculations use validated algorithms (JDN, solar terms)
- Cultural/astrological references cite authoritative Vietnamese sources
- Edge cases (year boundaries, leap months) are explicitly handled and tested

## Article VIII — Security by Default

- Zero hardcoded secrets or API keys
- All user inputs validated and sanitized
- CSP policies enforced in both web and Tauri builds
- Environment-specific configuration via env vars only

## Article IX — Modular Independence

Each engine/feature should be deployable and testable **independently**:
- No circular dependencies between engines
- Shared utilities in a common layer, not scattered
- Feature flags preferred over feature branches for long-lived experiments

---

## Amendment Log

| Date | Article | Change | Rationale |
|------|---------|--------|-----------|
| 2026-03-27 | All | Initial constitution created | Adopted spec-kit governance pattern for product-level principles |
