---
phase: 01-calculation-engine
plan: "02"
subsystem: calculation-engine
tags: [calculator, formatter, tdd, vitest, fraction.js, typescript, geometry]

# Dependency graph
requires:
  - 01-01 (DovetailInput, DovetailResult, MIN_PIN_WIDTH_INCHES, SOFTWOOD_RATIO, HARDWOOD_RATIO from types/dovetail.ts)
provides:
  - calculateDovetail() pure function — dovetail geometry engine with 3:2 tail-to-pin ratio
  - suggestPinCount() — width-based heuristic returning recommended tail count
  - snapTo32nds() — 1/32" grid snap eliminating float noise before fraction conversion
  - toFraction32() — decimal-inch to imperial fraction string with mixed-number support
  - verifySum() — 32nd-grid drift checker for layout sum constraint
  - 22 calculator tests, 49 formatter tests all passing
affects:
  - 01-03 (inputParser connects to calculator — calculator is the entry point for parsed values)
  - Phase 2 UI (React components call calculateDovetail and toFraction32)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD (RED/GREEN/REFACTOR) — tests written and committed before implementation
    - 3:2 tail-to-pin face ratio — boardWidth = pinCount * 2.5 * pinWide (canonical auto-layout default)
    - Snap-before-fraction pattern — snapTo32nds() before new Fraction() eliminates float noise
    - fraction.js v5 BigInt extraction — Number(f.n), Number(f.d), Number(f.s) for arithmetic
    - Angle-from-ratio derivation — Math.atan(1/ratio) everywhere; zero hardcoded degree values

key-files:
  created:
    - dovetail-calc/src/lib/calculator.ts
    - dovetail-calc/src/lib/formatter.ts
    - dovetail-calc/src/lib/__tests__/calculator.test.ts
    - dovetail-calc/src/lib/__tests__/formatter.test.ts
  modified: []

key-decisions:
  - "3:2 tail-to-pin face ratio chosen as canonical default — tailWide = 1.5*pinWide gives pinWide = boardWidth/(pinCount*2.5); validated against hand calculation for 6\" softwood 3-tail case"
  - "pinWidth and halfPinWidth in DovetailResult are narrowest-point (baseline) values, not face widths — sum constraint test reconstructs face widths by adding back 2*tailDepth*tan(angle)"
  - "Math.tan(Math.atan(1/ratio)) == 1/ratio (exact identity), so tanAngle is computed once and equals 1/ratio without floating-point error accumulation"

requirements-completed: [INP-05, CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, CALC-07]

# Metrics
duration: 3min
completed: 2026-02-25
---

# Phase 1 Plan 02: Dovetail Geometry Calculator + Fraction Formatter Summary

**Dovetail geometry engine (calculateDovetail, suggestPinCount) and imperial fraction formatter (toFraction32, snapTo32nds, verifySum) implemented with TDD — hand-verified against 6" softwood 3-tail known-good case, 108 tests passing**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-25T13:31:50Z
- **Completed:** 2026-02-25T13:34:44Z
- **Tasks:** 3 of 3 (RED, GREEN, REFACTOR)
- **Files modified:** 2 created (implementation), 2 created (tests)

## Accomplishments

- `calculator.ts` implements `suggestPinCount()` (width-based heuristic: 1 tail <2", 2 tails <3", ~1/1.5" for 3-6", ~1/2" for 6"+) and `calculateDovetail()` (3:2 tail-to-pin ratio, angle from `Math.atan(1/ratio)`, `pinWidthWarning` against `MIN_PIN_WIDTH_INCHES`)
- `formatter.ts` implements `snapTo32nds()` (1/32" grid snap), `toFraction32()` (snap-then-fraction.js with BigInt extraction, mixed/whole/fraction output), `verifySum()` (integer 32nd drift detection)
- Hand-verified known-good case: 6" board, softwood (ratio=8), 3 tails — `pinWide=0.8`, `tailWide=1.2`, `halfPinWide=0.4`, face sum = 6.0 exactly, `pinNarrow=0.6125` > `MIN_PIN_WIDTH_INCHES` (0.1875)
- 22 calculator tests + 49 formatter tests pass; all 108 tests across 3 test files pass
- Zero hardcoded degree values in calculator.ts — only `Math.atan(1/ratio)` derivation
- Refactor phase: no changes needed — code was clean and well-documented from GREEN

## Task Commits

Each task was committed atomically:

1. **RED phase: Failing tests** - `d120aa8` (test) — calculator.test.ts + formatter.test.ts (confirmed failing: modules not found)
2. **GREEN phase: Implementation** - `419ac94` (feat) — calculator.ts + formatter.ts (all 108 tests pass)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `dovetail-calc/src/lib/calculator.ts` — Dovetail geometry engine: `calculateDovetail`, `suggestPinCount`, full JSDoc, separation of concerns (raw floats only)
- `dovetail-calc/src/lib/formatter.ts` — Imperial fraction formatter: `snapTo32nds`, `toFraction32`, `verifySum`, fraction.js v5 BigInt handling
- `dovetail-calc/src/lib/__tests__/calculator.test.ts` — 22 tests: suggestPinCount (5 boards), known-good 6" case (7 assertions), pinWidthWarning, angle derivation, pinCount override, tailDepth
- `dovetail-calc/src/lib/__tests__/formatter.test.ts` — 49 tests: snapTo32nds, toFraction32 (10 values), denominator ≤ 32 (31 tests), verifySum (3 cases)

## Hand Calculation Verification (6" Softwood 3-Tail)

The known-good case was computed by hand before writing test assertions:

| Value | Formula | Result |
|-------|---------|--------|
| angle | Math.atan(1/8) | 0.12435... rad |
| tan(angle) | 1/8 | 0.125 (exact) |
| pinWide (face) | 6 / (3 × 2.5) | 0.8" |
| tailWide | 6/3 − 0.8 | 1.2" |
| halfPinWide | 0.8 / 2 | 0.4" |
| pinNarrow | 0.8 − 2×0.75×0.125 | 0.6125" |
| halfPinNarrow | 0.4 − 0.75×0.125 | 0.30625" |
| Face sum | 2×0.4 + 3×1.2 + 2×0.8 | **6.0" (exact)** |

Sum constraint holds with zero drift for this case.

## Decisions Made

- **3:2 tail-to-pin face ratio** selected as canonical default. `tailWide = 1.5 × pinWide` is the most common proportional default in woodworking literature (Paul Sellers, Fine Woodworking). Exposed via formula `pinWide = boardWidth / (pinCount × 2.5)`. This satisfies RESEARCH.md Open Question #1.
- **DovetailResult.pinWidth is narrowest-point, not face width** (carried forward from Plan 01 decision). The sum constraint test reconstructs face widths via `pinFace = pinNarrow + 2*tailDepth*tan(angle)`.
- **Math.tan(Math.atan(1/ratio)) = 1/ratio** (exact mathematical identity) — `tanAngle` computed once and used for both `pinNarrow` and `halfPinNarrow`. No floating-point accumulation.

## Deviations from Plan

None — plan executed exactly as written. RED phase produced module-not-found failures (correct). GREEN phase required no iteration — implementation passed all tests on first run. REFACTOR phase found no improvements needed.

## Issues Encountered

None. The sum constraint test was initially written using exact 32nd-grid layout values (13/32 half-pin, 38/32 tail, 26/32 pin = 192/32 = 6.0) to avoid ambiguity about what values are passed to `verifySum`. The hand calculation was done before writing test assertions to ensure correct expected values.

## User Setup Required

None.

## Next Phase Readiness

- Phase 2 React UI can now import `calculateDovetail` and `toFraction32` and immediately display results
- `verifySum` is available to detect and warn about 1/32" layout drift in the UI
- `pinWidthWarning` flag is ready to drive a structural warning alert in the UI
- Open concern from STATE.md (geometry formula not canonicalized) is now **resolved** — hand-verified 6" softwood 3-tail case passes

## Self-Check: PASSED

- FOUND: dovetail-calc/src/lib/calculator.ts
- FOUND: dovetail-calc/src/lib/formatter.ts
- FOUND: dovetail-calc/src/lib/__tests__/calculator.test.ts
- FOUND: dovetail-calc/src/lib/__tests__/formatter.test.ts
- FOUND: .planning/phases/01-calculation-engine/01-02-SUMMARY.md
- FOUND: d120aa8 test(01-02): add failing tests for calculator and formatter
- FOUND: 419ac94 feat(01-02): implement calculator and formatter

---
*Phase: 01-calculation-engine*
*Completed: 2026-02-25*
