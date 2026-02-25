---
phase: 01-calculation-engine
plan: "01"
subsystem: testing
tags: [vite, vitest, typescript, fraction.js, react]

# Dependency graph
requires: []
provides:
  - Vite 7 + React 19 + TypeScript 5.9 project scaffolded at dovetail-calc/
  - Vitest 4 configured with Node environment and passWithNoTests for clean exits
  - fraction.js 5.3.4 installed as runtime dependency
  - DovetailInput interface with boardWidth, boardThickness, ratio, pinCount fields
  - DovetailResult interface with pinCount, tailWidth, pinWidth, halfPinWidth, tailDepth, angle, pinWidthWarning
  - SOFTWOOD_RATIO=8, HARDWOOD_RATIO=6, MIN_PIN_WIDTH_INCHES=3/16 constants exported
  - src/lib/ and src/lib/__tests__/ directories for Plans 02 and 03
affects:
  - 01-02 (calculator and formatter implementation — imports DovetailInput, DovetailResult)
  - 01-03 (inputParser implementation — imports DovetailInput)

# Tech tracking
tech-stack:
  added:
    - vite 7.3.1
    - react 19.2.0
    - typescript 5.9.3
    - vitest 4.0.18
    - "@vitest/coverage-v8 4.0.18"
    - fraction.js 5.3.4
  patterns:
    - Node-environment Vitest (no jsdom) for pure-function engine tests
    - passWithNoTests: true in Vitest config for clean CI behavior before first tests exist
    - Angles stored as radians from Math.atan(1/ratio), never hardcoded degrees (CALC-06)
    - Engine returns raw decimal numbers; formatter handles all rounding (separation of concerns)

key-files:
  created:
    - dovetail-calc/package.json
    - dovetail-calc/vite.config.ts
    - dovetail-calc/tsconfig.json
    - dovetail-calc/tsconfig.app.json
    - dovetail-calc/tsconfig.node.json
    - dovetail-calc/src/types/dovetail.ts
    - dovetail-calc/src/lib/__tests__/.gitkeep
  modified: []

key-decisions:
  - "passWithNoTests: true added to Vitest config — Vitest 4 exits code 1 with no test files, which would break CI; passWithNoTests makes the scaffold phase cleanly exit 0 before any tests exist"
  - "DovetailResult.pinWidth is the narrowest point (baseline), not the face width — matches woodworking measurement convention and PITFALLS.md guidance"
  - "angle field is radians only — JSDoc documents derivation as Math.atan(1/ratio) to prevent future hardcoded-degree pitfall (CALC-06)"

patterns-established:
  - "Pattern: Separation of decimal engine output vs. fraction display — DovetailResult carries raw floats; formatter converts to 1/32\" strings"
  - "Pattern: Ratio as canonical angle representation — always pass ratio=8 or ratio=6, derive angle inline; never store or accept hardcoded degree values"

requirements-completed: [INP-03, INP-04, CALC-06]

# Metrics
duration: 4min
completed: 2026-02-25
---

# Phase 1 Plan 01: Project Scaffold and Shared Types Summary

**Vite 7 + React 19 + TypeScript strict project scaffolded with Vitest 4 (Node environment), fraction.js 5.3.4, and DovetailInput/DovetailResult interfaces exporting angle as radians from Math.atan(1/ratio)**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-25T13:24:23Z
- **Completed:** 2026-02-25T13:27:46Z
- **Tasks:** 2 of 2
- **Files modified:** 7 created, 0 modified

## Accomplishments

- Vite React TypeScript project scaffolded and all dependencies installed (fraction.js, vitest, @vitest/coverage-v8)
- Vitest configured for Node environment with `passWithNoTests: true` so test runner exits 0 before any tests exist
- `src/types/dovetail.ts` exports `DovetailInput`, `DovetailResult`, `SOFTWOOD_RATIO`, `HARDWOOD_RATIO`, `MIN_PIN_WIDTH_INCHES` with full JSDoc
- TypeScript strict mode confirmed active; `tsc --noEmit` passes cleanly
- Directory structure `src/lib/` and `src/lib/__tests__/` created ready for Plans 02 and 03

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Vite project and install dependencies** - `56b9952` (chore)
2. **Task 2: Create shared TypeScript interfaces and constants** - `6d435ef` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `dovetail-calc/package.json` - Project manifest with test scripts (test, test:run, test:coverage) and fraction.js dependency
- `dovetail-calc/vite.config.ts` - Vite + Vitest config with Node environment, globals, passWithNoTests, and test file include patterns
- `dovetail-calc/tsconfig.json` - Project references root tsconfig
- `dovetail-calc/tsconfig.app.json` - App tsconfig with strict:true and all linting flags
- `dovetail-calc/tsconfig.node.json` - Node tsconfig for Vite config files
- `dovetail-calc/src/types/dovetail.ts` - Shared interfaces: DovetailInput, DovetailResult, SOFTWOOD_RATIO, HARDWOOD_RATIO, MIN_PIN_WIDTH_INCHES
- `dovetail-calc/src/lib/__tests__/.gitkeep` - Placeholder to track __tests__ directory in git

## Decisions Made

- Added `passWithNoTests: true` to Vitest config — Vitest 4 exits with code 1 when no test files are found, which would cause the plan's "npm run test:run exits 0" criterion to fail. The passWithNoTests option resolves this without requiring a placeholder test.
- `DovetailResult.pinWidth` represents the narrowest point (at the baseline), not the face width — this matches woodworking measurement convention where pin width is quoted at the narrow end.
- `angle` field typed as `number` in radians, JSDoc explicitly documents `Math.atan(1/ratio)` derivation to prevent future hardcoded-degree errors per CALC-06.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `passWithNoTests: true` to Vitest configuration**
- **Found during:** Task 1 (Scaffold Vite project)
- **Issue:** `npm run test:run` exited with code 1 ("No test files found, exiting with code 1") because Vitest 4 requires at least one test file to exit 0. The plan's verification criterion requires exit 0.
- **Fix:** Added `passWithNoTests: true` to the `test` block in `vite.config.ts`
- **Files modified:** `dovetail-calc/vite.config.ts`
- **Verification:** `npm run test:run` now outputs "No test files found, exiting with code 0" and exits 0
- **Committed in:** `56b9952` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to satisfy the plan's verification criterion. No scope creep — this is a required behavior for the scaffold phase.

## Issues Encountered

None beyond the Vitest no-test-files behavior documented above.

## User Setup Required

None - no external service configuration required. All dependencies install from npm.

## Next Phase Readiness

- Plans 02 and 03 can now import from `src/types/dovetail.ts` and create test files in `src/lib/__tests__/`
- Vitest is wired and ready — any `.test.ts` file added to `src/` will be picked up automatically
- fraction.js is installed and ready for use in `formatter.ts` (Plan 02)
- Open concern from STATE.md: dovetail geometry formula needs validation against a hand-calculated known-good test case (6" board, softwood 1:8, 3 tails) before Phase 1 is complete — this is the primary validation task for Plan 02

---
*Phase: 01-calculation-engine*
*Completed: 2026-02-25*
