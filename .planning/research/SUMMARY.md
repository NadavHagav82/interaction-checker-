# Project Research Summary

**Project:** Dovetail Joint Calculator
**Domain:** Client-side woodworking geometry calculator (through dovetail, hand-tool, imperial units)
**Researched:** 2026-02-25
**Confidence:** HIGH (stack/architecture); MEDIUM (features/pitfalls domain specifics)

## Executive Summary

This is a pure client-side calculator web app — a single-page form that takes board dimensions and produces all measurements needed to mark and cut a hand-cut through dovetail joint. The expert approach is emphatically simple: three JavaScript modules (calculation engine, formatter, controller), no backend, no framework, no state management library. Research consistently shows that pulling React or similar into a single-form calculator adds bundle weight and lifecycle complexity with zero functional benefit. The canonical architecture is a pure function engine (calculator.js) that produces raw numbers, a pure formatter (formatter.js) that converts decimals to imperial fractions, and a thin wiring layer (app.js) that reads inputs, calls the engine, and writes formatted strings to the DOM.

The recommended stack is Vite 7 + React 19 + TypeScript 5.9 + Tailwind CSS 4, with fraction.js for fraction display and Vitest 4 for unit testing. This is contradicted somewhat by the architecture research, which argues against React for this scale of app — that tension is addressed below. The resolution: use the Vite + React + TypeScript scaffold for its tooling benefits (hot reload, type checking, testing integration), but keep the component tree shallow and the calculation logic completely isolated from React. If team prefers, the calculation engine and formatter can be extracted to vanilla JS files that require no React knowledge to understand or test.

The biggest risk in this project is not technical — it is domain correctness. Floating-point arithmetic corrupts imperial fraction display in subtle ways that pass casual testing but fail under real workshop use (displayed values that don't sum to board width, fractions with unusable denominators). The second risk is mobile input handling: woodworkers type "1 3/4" not "1.75", and the default `<input type="number">` rejects fractional notation on iOS. Both risks must be resolved in Phase 1 before any UI is built, using integer arithmetic for the calculation layer and a dedicated fraction input parser.

## Key Findings

### Recommended Stack

See full details: `.planning/research/STACK.md`

The scaffolding choice is straightforward: `npm create vite@latest -- --template react-ts` gives Vite 7 + React 19 + TypeScript 5.9 in one command. Tailwind CSS 4 is added via the `@tailwindcss/vite` plugin (CSS-first, no config file). The only noteworthy supporting library is fraction.js (5.x, 3.5KB, 20M weekly downloads) for decimal-to-fraction display conversion, and Vitest 4 for unit testing the calculation engine.

Critical version constraints: Node 20.19+ required for Vite 7; avoid TypeScript 6.0 beta (still landing breaking changes); avoid Tailwind v3 (v4 is current with better DX). No state management libraries (useState + useMemo is sufficient). No routing (single-page, no navigation). No backend.

**Core technologies:**
- Vite 7.x: Build tool and dev server — one-command scaffold, fast Rolldown builds, shared config with Vitest
- React 19.x: UI rendering — dominant component model, full Vite support, appropriate for reactive input-to-output updates
- TypeScript 5.9.x: Type safety — prevents unit-type errors in calculation logic, catches off-by-one bugs at compile time
- Tailwind CSS 4.x: Styling — mobile-first by default, CSS-first config, fast incremental builds critical for bench-usable layout
- fraction.js 5.x: Fraction display — avoids writing custom GCD/rational-number logic; ships its own TypeScript types
- Vitest 4.x: Unit testing — shares Vite config, zero additional setup, Browser Mode now stable

### Expected Features

See full details: `.planning/research/FEATURES.md`

The feature landscape is clear and well-bounded. Users need: board dimensions in, all layout measurements out, in imperial fractions, instantly, on a phone. Competitors (BlockLayer, WoodCalc.net, ShakerCabinets calculator) all require a "Calculate" button, don't warn about structurally weak pins, and use decimal output or template printing as their value proposition. The differentiation opportunity is reactive UX + smart defaults + fraction output + mobile usability.

**Must have (table stakes):**
- Board width + thickness as primary inputs — nothing calculates without these
- Fractional imperial output (to nearest 1/32") — non-negotiable; decimal output defeats the product's purpose
- Pin width, tail width, half-pin width, tail depth outputs — the four measurements needed at the bench
- Wood species toggle (hardwood 1:6 / softwood 1:8) — sets angle default; eliminates the most common user lookup
- Smart pin count recommendation from board width — removes the primary decision the user would otherwise guess
- Reactive recalculation (no submit button) — workshop use requires instant feedback
- Minimum pin width warning (< 3/16") — unique vs. all competitors; prevents structural failures
- Labeled tail-board / pin-board output sections — eliminates the most common beginner confusion

**Should have (competitive):**
- Angle/ratio override input — surfaced as collapsible override after species toggle sets default
- Named preset ratios ("Traditional 1:8" / "Fine 1:6") — more intuitive than raw numbers
- Explicit precision statement ("dimensions to nearest 1/32"") — addresses workshop user concern about measurement accuracy
- URL parameter state (v1.x) — enables bookmarking and sharing a specific board calculation

**Defer (v2+):**
- Metric unit support — build display layer cleanly in v1 to make this straightforward later
- Half-blind dovetail calculator — different geometry, separate input/output model; doubles scope
- Sliding dovetail calculator — different joint type entirely
- Visual diagram / joint preview — anti-feature for v1; target user (experienced hand-tool woodworker) wants numbers, not diagrams

### Architecture Approach

See full details: `.planning/research/ARCHITECTURE.md`

The architecture is a strict three-layer separation: UI layer (React components reading inputs and displaying outputs), a pure calculation engine (`src/lib/calculator.ts` — no DOM, no React, pure functions only), and a pure formatter (`src/lib/formatter.ts` — converts decimal numbers to imperial fraction strings). The controller role is played by a thin React component that calls the engine on input change and passes results to the display. This separation is non-negotiable: the calculation engine must be testable in isolation without a browser, and the formatter must be testable independently of the math.

Build order matters: calculator.ts first (test pure math in Node), formatter.ts second (verify fraction conversion), then the React component wrapping both.

**Major components:**
1. `src/lib/calculator.ts` — pure dovetail geometry engine; input: board dimensions + ratio + pin count; output: raw decimal measurements; no imports from React or DOM
2. `src/lib/formatter.ts` — decimal-to-fraction converter; rounds to nearest 1/32"; returns human-readable strings ("7/16\""); pure functions only
3. `src/components/DovetailCalculator.tsx` — thin React component; reads inputs via controlled components; calls calculator on change; passes formatter output to display elements; owns all UI state (useState for inputs)
4. `src/lib/inputParser.ts` — imperial fraction string parser; accepts "1 3/4", "3/4", "1-3/4", "0.75" formats; required before any form input is wired

### Critical Pitfalls

See full details: `.planning/research/PITFALLS.md`

All 5 critical pitfalls map to the core calculation engine (Phase 1). None of them are discoverable until the math is tested with real woodworking edge cases. The fraction display problem in particular has HIGH recovery cost if not addressed from the start — it requires redesigning the spacing algorithm to distribute rounding error rather than round each value independently.

1. **Floating-point corruption of fraction display** — Snap all values to nearest 1/32" as integers before any fraction conversion; never round intermediate values independently; verify that displayed outputs sum exactly to board width. Use `Math.round(value * 32) / 32` at the display boundary, or represent all measurements as integers in 1/32" units throughout the calculation.
2. **Pin count algorithm produces invalid layouts** — Encode woodworking domain constraints as explicit constants: always reserve two edge half-pins, minimum half-pin width 1/4", minimum interior pin width 3/16", minimum 1 tail between half-pins. Special-case boards under 2" wide.
3. **Mobile fraction input rejected** — Use `<input type="text" inputmode="decimal">` not `<input type="number">`. Build a dedicated fraction parser that accepts "1 3/4", "1-3/4", "3/4", "0.75", "3". Never use eval() for parsing.
4. **Fraction display rounds to wrong precision** — Output denominator must never exceed 32. Woodworkers cannot set a marking gauge to 13/64" or 31/64". Round to 1/32" grid first, then simplify with GCD reduction.
5. **Angle convention ambiguity (ratio vs. degrees)** — Define angles as ratios only in code (`SOFTWOOD_RATIO = 8`, `HARDWOOD_RATIO = 6`). Use `Math.atan(1 / ratio)` for geometry. Display as "1:8" to the user. Never hardcode 7 or 9.5 as degree constants.

## Implications for Roadmap

Based on combined research, 3 phases are appropriate for v1. All critical work is Phase 1 (the math engine), which is the correct inversion of the usual "UI first" approach.

### Phase 1: Core Calculation Engine

**Rationale:** All 5 critical pitfalls are in the calculation layer. Every UI feature depends on correct math. The architecture research explicitly recommends building and verifying calculator.ts before any UI exists. This phase has the highest density of domain-specific correctness requirements and the highest recovery cost if skipped.

**Delivers:** Fully tested TypeScript calculation engine + fraction formatter + input parser. Can be exercised from the Vitest test suite without any browser. Every output verified to sum to board width.

**Addresses (from FEATURES.md):** Pin count recommendation algorithm, tail/pin/half-pin width calculations, tail depth, dovetail angle from species ratio, minimum pin width warning logic.

**Avoids (from PITFALLS.md):** Floating-point fraction corruption, invalid pin count layouts, angle convention ambiguity, fraction precision exceeding 1/32".

**Key deliverables:**
- `src/lib/calculator.ts` — pure dovetail geometry, all domain constraints encoded
- `src/lib/formatter.ts` — toFraction32() function, verified with known-good layouts
- `src/lib/inputParser.ts` — imperial fraction string parser, all formats tested
- Vitest test suite covering: happy path, narrow boards (<2"), wide boards (>12"), non-standard widths (5-3/8"), sum constraint, angle math, fraction denominator limit

### Phase 2: UI Layer and Input Handling

**Rationale:** Once the engine is correct, wiring it to a React component is low-risk. The React component is a thin controller — it reads inputs, calls the engine, passes outputs to display. The pitfalls at this phase are UX-level (mobile keyboard type, output layout, tap target size) rather than mathematical.

**Delivers:** Working calculator in the browser. All inputs wired to the engine. Outputs displayed in imperial fractions. Mobile-usable at 375px viewport. Reactive recalculation.

**Uses (from STACK.md):** React 19 controlled components, TypeScript, Tailwind CSS 4 for mobile-first layout.

**Implements (from ARCHITECTURE.md):** DovetailCalculator React component as thin controller; labeled output sections (tail board / pin board).

**Addresses (from FEATURES.md):** All P1 features — wood species toggle, angle override, reactive recalculation, minimum pin width warning display, labeled output sections.

**Avoids (from PITFALLS.md):** Mobile fraction input rejection (text + inputmode), output below fold on mobile, dense output layout, small tap targets.

### Phase 3: Polish, Hosting, and v1 Completion

**Rationale:** After core functionality is working and mobile-tested, the remaining work is deployment setup, edge-case UX polish, and any v1.x features that fit before launch.

**Delivers:** Deployed app on Netlify or GitHub Pages. Accessible, polished UI. Precision statement displayed. Any v1.x features (URL parameter state, nearest tool increment note) if time permits.

**Uses (from STACK.md):** Netlify (recommended for simplicity, zero base-path config) or GitHub Pages. ESLint 9 flat config, Prettier + prettier-plugin-tailwindcss.

**Addresses (from FEATURES.md):** URL parameter state (v1.x, low effort), precision statement display, nearest common tool increment note.

**Avoids (from PITFALLS.md):** No state persistence (localStorage for last inputs if included in this phase), no eval() fraction parsing confirmed in code review.

### Phase Ordering Rationale

- **Math before UI** is the single most important ordering decision, driven by PITFALLS.md. All 5 critical pitfalls are in the calculation layer, and the floating-point sum-constraint problem has HIGH recovery cost if addressed after UI is built. Testing the engine in isolation (Phase 1) eliminates the risk before any UI exists.
- **Formatter and parser are Phase 1, not Phase 2,** because they are prerequisites of the engine's outputs and the UI's inputs respectively. A UI built before the parser exists will use wrong input handling from the start.
- **React component is thin by design.** The architecture recommendation to keep the controller as "three lines: read inputs, call calculator, write outputs" means Phase 2 is low-complexity once Phase 1 is complete. This justifies the small Phase 2 scope.
- **No separate "architecture setup" phase** is needed because the stack scaffold (Vite + React + TypeScript + Tailwind) is a one-command operation, not a phase of work.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (calculation engine):** The exact dovetail geometry formula needs domain validation — specifically the relationship between tail-to-pin ratio, half-pin width convention, and board-width distribution. Research identified the constraints (1:8, 1:6, minimum widths, half-pin convention) but the precise formula for distributing board width across tails and pins may need a woodworking domain expert review or comparison against known-good hand-calculated layouts.

Phases with standard patterns (skip research-phase):
- **Phase 2 (React UI):** Controlled components, Tailwind responsive layout, and mobile keyboard configuration are all well-documented with established patterns. No additional research needed.
- **Phase 3 (deploy):** Netlify deployment of a Vite app is a one-page official guide. No research needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against official announcements and npm; version compatibility matrix confirmed; no speculative choices |
| Features | MEDIUM | Competitor analysis via direct inspection of live tools; woodworking domain standards (1:8, 1:6, 3/16" minimum) verified across multiple authoritative sources; some source pages were inaccessible (403 blocks) |
| Architecture | HIGH | Three-layer pattern for calculators is extremely well-documented; vanilla JS vs. framework tradeoff verified with real-world case study; build order recommendation backed by multiple sources |
| Pitfalls | MEDIUM-HIGH | Floating-point and iOS input pitfalls verified against official MDN/Safari documentation; woodworking domain minimums (half-pin 1/4", pin 3/16") corroborated across multiple authoritative woodworking sources |

**Overall confidence:** HIGH — The product is a well-understood domain (imperial fraction calculator) with a clearly correct architecture (pure function engine + thin UI). The risks are known, bounded, and addressable in Phase 1. No research area returned contradictory findings.

### Gaps to Address

- **Exact dovetail geometry formula:** Research established inputs, outputs, and constraints, but did not produce a single canonical formula for distributing board width into half-pins, pins, and tails at a given ratio. The formula is derivable from the constraints, but should be validated against at least one hand-calculated known-good layout (e.g., a 6" board, softwood 1:8 ratio, 3 tails) before Phase 1 is declared complete.
- **fraction.js vs. custom toFraction32():** PITFALLS.md recommends a custom `toFraction32()` that snaps to 1/32" grid before converting; STACK.md recommends fraction.js for fraction arithmetic. Both are valid; the resolution is to use fraction.js as the arithmetic backend but wrap it in a custom display function that enforces the 1/32" precision constraint. This needs an explicit decision at the start of Phase 1.
- **Fraction display precision (1/16" vs. 1/32"):** FEATURES.md mentions both 1/32" and 1/16" as acceptable precision; PITFALLS.md recommends 1/32". The recommendation is 1/32" (finer, more useful, still within hand-tool marking tolerance), but this should be confirmed with target users before Phase 1 formatter is written.

## Sources

### Primary (HIGH confidence)
- https://vite.dev/blog/announcing-vite7 — Vite 7.0 release, Node requirements, Rolldown bundler
- https://react.dev/blog/2025/10/01/react-19-2 — React 19.2 release, version 19.2.4 current
- https://devblogs.microsoft.com/typescript/announcing-typescript-6-0-beta/ — TypeScript 6.0 beta status; 5.9.3 stable
- https://tailwindcss.com/blog/tailwindcss-v4 — Tailwind v4.0 CSS-first config, v4.2.0 current
- https://vitest.dev/blog/vitest-4 — Vitest 4.0 release, 4.0.18 current, Browser Mode stable
- https://vite.dev/guide/static-deploy — Official Netlify and GitHub Pages deploy guide
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules — ES module browser support
- https://css-tricks.com/finger-friendly-numerical-inputs-with-inputmode/ — inputmode="decimal" verified against MDN
- https://soledadpenades.com/posts/2024/safari-ios-input-type-number/ — Safari iOS input[type=number] behavior
- https://www.finewoodworking.com/project-guides/joinery/laying-out-dovetails — Authoritative dovetail layout standards
- https://www.popularwoodworking.com/editors-blog/dovetail-layout-what-ratio-or-degree/ — 1:8 / 1:6 ratio standard
- https://paulsellers.com/2018/01/dovetail-sizing-keep-simple/ — Leading hand-tool authority on dovetail sizing

### Secondary (MEDIUM confidence)
- https://www.blocklayer.com/woodjoints/dovetaileng — Competitor feature analysis (direct inspection)
- https://woodcalc.net/en/calculators/dovetail — Competitor feature analysis
- https://shakercabinets.com/tools/dovetail-joint-calculator — Competitor feature analysis
- https://www.patterns.dev/ — Container/Presentational pattern for calculator architecture
- https://dev.to/cnivargi/why-we-ditched-react-and-built-financial-calculators-in-vanilla-javascript — Real-world case study, framework vs. vanilla for calculators
- https://www.npmjs.com/package/fraction.js — fraction.js official package, 20M weekly downloads
- https://www.heartwoodtools.com/blog/2019/12/20/whats-the-deal-with-dovetail-ratios — Dovetail ratio conventions
- https://npmtrends.com/decimal.js-vs-fraction.js-vs-fractional-vs-numeral — fraction.js popularity vs. alternatives
- WebSearch: "eslint v9 flat config vite react typescript 2025" — flat config as current ESLint standard

### Tertiary (LOW confidence)
- https://woodworking-calculators.com/dovetail-joint-calculator — WebSearch summary only; not directly fetched
- https://homeimprovementway.com/dovetail-calculator/ — WebSearch summary; overview of calculator landscape
- https://sawmillcreek.org/threads/dovetail-layout-calculator.158407/ — Community forum on rounding errors; 403 blocked on fetch

---
*Research completed: 2026-02-25*
*Ready for roadmap: yes*
