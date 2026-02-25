# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Accurate dovetail layout math from minimal input — enter board dimensions, get back everything you need to mark and cut.
**Current focus:** Phase 1 - Calculation Engine

## Current Position

Phase: 1 of 3 (Calculation Engine)
Plan: 0 of 3 in current phase
Status: Ready to plan
Last activity: 2026-02-25 — Roadmap created, phases derived from requirements

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: none yet
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Math-before-UI ordering — all 5 critical pitfalls (floating-point fraction corruption, invalid pin layout, mobile input, fraction precision, angle convention) are in the calculation layer; engine must be verified in isolation before any UI is built
- [Roadmap]: fraction.js as arithmetic backend, wrapped in custom toFraction32() that enforces 1/32" grid — resolves tension between STACK.md and PITFALLS.md recommendations
- [Roadmap]: No separate scaffold phase — `npm create vite@latest` is one command, not a phase; included as first plan within Phase 1

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: Exact dovetail geometry formula not fully canonicalized — must validate against at least one hand-calculated known-good layout (e.g., 6" board, softwood 1:8, 3 tails) before Phase 1 is complete
- [Phase 1]: Fraction display precision (1/16" vs 1/32") should be confirmed before formatter is written; recommendation is 1/32"

## Session Continuity

Last session: 2026-02-25
Stopped at: Roadmap created, STATE.md initialized — ready to plan Phase 1
Resume file: None
