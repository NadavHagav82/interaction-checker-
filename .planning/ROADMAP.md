# Roadmap: Dovetail Joint Calculator

## Overview

Three phases build a pure client-side dovetail calculator from the inside out: first a fully-tested calculation engine (the hardest part, all critical pitfalls live here), then a thin React UI that wires inputs to that engine and displays fractional output reactively, then cross-browser and mobile validation before deploying to static hosting. The math is correct before any UI exists; the UI is usable on a phone before shipping.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Calculation Engine** - Pure TypeScript engine for dovetail geometry with fraction formatter and input parser, fully tested
- [ ] **Phase 2: UI Layer** - Reactive React interface wiring inputs to the engine with fractional imperial output display
- [ ] **Phase 3: Polish and Deploy** - Cross-browser and mobile validation, then deployment to static hosting

## Phase Details

### Phase 1: Calculation Engine
**Goal**: A verified TypeScript calculation engine produces correct dovetail layout measurements from board dimensions, with an imperial fraction formatter and input parser, all testable without a browser
**Depends on**: Nothing (first phase)
**Requirements**: INP-01, INP-02, INP-03, INP-04, INP-05, CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, CALC-07
**Success Criteria** (what must be TRUE):
  1. Given a board width and thickness, the engine returns pin count, tail width, pin width, half-pin width, and tail depth — all as decimal values
  2. Displayed fractional outputs (converted from decimals) always sum exactly to the board width with no rounding drift
  3. Fraction display never shows a denominator above 32 (e.g., no 13/64" or 31/64")
  4. The input parser accepts "1 3/4", "1-3/4", "3/4", "0.75", and "3" and rejects non-numeric input
  5. The engine emits a warning flag when any interior pin width falls below 3/16"
**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold Vite + React + TypeScript project, install fraction.js and Vitest, create shared types
- [ ] 01-02-PLAN.md — TDD: Build calculator.ts (geometry engine) and formatter.ts (decimal-to-fraction with 1/32" snap)
- [ ] 01-03-PLAN.md — TDD: Build inputParser.ts (imperial fraction string parser with all 5 input formats)

### Phase 2: UI Layer
**Goal**: A working calculator in the browser — all inputs wired to the engine, fractional output displayed reactively by board section, usable at a workshop bench
**Depends on**: Phase 1
**Requirements**: DISP-01, DISP-02, DISP-03, DISP-04
**Success Criteria** (what must be TRUE):
  1. Changing board width or thickness immediately updates all output values with no submit button
  2. Output is grouped into labeled sections for tail board measurements and pin board measurements
  3. Wood species toggle shows as "Hardwood (1:6)" and "Softwood (1:8)" and changes the angle used in calculations
  4. All output values display as imperial fractions (e.g., "7/16"") not decimals
**Plans**: TBD

Plans:
- [ ] 02-01: Build DovetailCalculator React component — inputs, species toggle, angle override, reactive calculation
- [ ] 02-02: Build output display — labeled tail board / pin board sections, fraction rendering, minimum pin width warning

### Phase 3: Polish and Deploy
**Goal**: The app works correctly on phone and desktop across all major browsers and is accessible at a public URL
**Depends on**: Phase 2
**Requirements**: PLAT-01, PLAT-02, PLAT-03
**Success Criteria** (what must be TRUE):
  1. App loads and calculates correctly in Chrome, Safari, Firefox, and Edge
  2. App is fully usable on a 375px phone screen — inputs are tappable, outputs are readable without horizontal scrolling
  3. Fractional input (e.g., "6 3/4") is accepted on iOS Safari without keyboard rejection
  4. App is deployed and accessible at a public URL with no backend required
**Plans**: TBD

Plans:
- [ ] 03-01: Mobile and cross-browser testing — fix any layout, input, or rendering issues found
- [ ] 03-02: Deploy to Netlify (or GitHub Pages) and verify production build

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Calculation Engine | 0/3 | Not started | - |
| 2. UI Layer | 0/2 | Not started | - |
| 3. Polish and Deploy | 0/2 | Not started | - |
