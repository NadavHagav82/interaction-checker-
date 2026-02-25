# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Accurate dovetail layout math from minimal input — enter board dimensions, get back everything you need to mark and cut.
**Current focus:** Phase 1 - Calculation Engine

## Current Position

Phase: 1 of 3 (Calculation Engine)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-02-25 — Plan 01-01 complete: project scaffold and shared types

Progress: [█░░░░░░░░░] 11%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 4 min
- Total execution time: 0.07 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-calculation-engine | 1 | 4 min | 4 min |

**Recent Trend:**
- Last 5 plans: 01-01 (4 min)
- Trend: baseline established

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Math-before-UI ordering — all 5 critical pitfalls (floating-point fraction corruption, invalid pin layout, mobile input, fraction precision, angle convention) are in the calculation layer; engine must be verified in isolation before any UI is built
- [Roadmap]: fraction.js as arithmetic backend, wrapped in custom toFraction32() that enforces 1/32" grid — resolves tension between STACK.md and PITFALLS.md recommendations
- [Roadmap]: No separate scaffold phase — `npm create vite@latest` is one command, not a phase; included as first plan within Phase 1
- [01-01]: passWithNoTests: true added to Vitest config — Vitest 4 exits code 1 with no test files; flag enables clean exit during scaffold before any tests exist
- [01-01]: DovetailResult.pinWidth represents narrowest point (baseline) not face width — matches woodworking measurement convention per PITFALLS.md
- [01-01]: angle field in DovetailResult is radians from Math.atan(1/ratio) — JSDoc enforces derivation pattern to prevent hardcoded-degree pitfall (CALC-06)

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: Exact dovetail geometry formula not fully canonicalized — must validate against at least one hand-calculated known-good layout (e.g., 6" board, softwood 1:8, 3 tails) before Phase 1 is complete
- [Phase 1]: Fraction display precision (1/16" vs 1/32") should be confirmed before formatter is written; recommendation is 1/32"

## Session Continuity

Last session: 2026-02-25
Stopped at: Completed 01-01-PLAN.md — scaffold and shared types done; ready for Plan 02 (calculator + formatter)
Resume file: None
