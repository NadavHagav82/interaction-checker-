# Pitfalls Research

**Domain:** Woodworking joint calculator web app (dovetail, imperial, hand-tool)
**Researched:** 2026-02-25
**Confidence:** MEDIUM (domain math: HIGH from authoritative woodworking sources; JS behavior: HIGH from MDN/official; UX patterns: MEDIUM from multiple community sources)

---

## Critical Pitfalls

### Pitfall 1: Floating-Point Arithmetic Corrupts Fraction Display

**What goes wrong:**
JavaScript's IEEE 754 double-precision floats cannot exactly represent many decimal values. A dovetail layout calculation that divides board width by pin count will produce results like `0.43750000000000006` instead of `0.4375` (7/16"). When this is fed into the fraction-display function, it converts to the wrong fraction or to an ugly decimal that defeats the entire purpose of imperial output.

**Why it happens:**
The internal geometry math (board_width / (2 * num_half_pins + num_tails)) produces a floating-point decimal that the developer then passes directly to a decimal-to-fraction converter. The converter rounds to the nearest 1/16 or 1/32, but tiny floating-point residue can push the value to the wrong bucket. Compounding is worse: if you display 7 individual spacing values and each is rounded independently from floats, the total of the displayed values will not equal the board width. A woodworker who adds up the numbers to cross-check will get a wrong sum.

**How to avoid:**
Do all internal math with integer arithmetic scaled to the precision denominator. Represent every measurement as an integer number of 1/32-inch units (the smallest practical woodworking division). Convert inputs from fractional string to 32nds immediately at the boundary, compute entirely in integers, and convert back to fractions only for display. Never let floating-point intermediate results reach the fraction formatter.

If integer arithmetic is not feasible for trigonometric steps (angle calculations), use a validated decimal-to-fraction function that operates on `Math.round(value * 32) / 32` before converting — snap to the grid first, then convert.

**Warning signs:**
- Displayed spacing values don't sum to board width
- Test: enter exactly 6" board width, expect outputs with clean fractions; any decimal leak is the bug
- `0.xxx0000000001` values appearing in console logs

**Phase to address:**
Core calculation engine (Phase 1). This must be solved before any UI is built. Define the integer representation and the decimal-to-fraction display function as foundational primitives, with unit tests proving 6" / 4 = 1-1/2" exactly.

---

### Pitfall 2: Pin Count Algorithm Produces Geometrically Invalid Layouts

**What goes wrong:**
The algorithm picks a pin count that results in pins or tails narrower than physically cuttable, or half-pins at the edges that are less than 1/4" (too weak to function). Alternatively, the algorithm picks a count that is mathematically valid but produces aesthetically wrong output — e.g., a 3" board with 5 tails where each tail is 1/4" wide and pins are 1/8" wide. The output is "correct" numbers but nonsensical for a woodworker.

**Why it happens:**
Developers often solve pin count as a pure math division problem: `floor(board_width / target_spacing)`. This ignores:
- The mandatory half-pins at both edges (a woodworking convention, not optional)
- Minimum pin narrowness at the tip (never less than 3/16" for strength)
- The relationship between pin count and board width that keeps proportions pleasing
- Very narrow boards (under 2") where the formula produces 0 or 1 tails

**How to avoid:**
Encode the domain constraints explicitly, not just the math:
1. Always start with two half-pins reserved at edges
2. Minimum half-pin width at narrow end: 1/4" (encode as a constant, not magic number)
3. Minimum interior pin width at narrow end: 3/16"
4. Validate that chosen pin count leaves at least 1 tail between the half-pins
5. For narrow boards (under 2"): special-case to 1 tail, validate manually rather than divide
6. Document the 1:8 (softwood) and 1:6 (hardwood) ratio defaults as the angle for the sloped sides — these are input-independent constants, not derived from pin count

Test with edge cases: 1.5" board (minimum), 12" board (wide), and non-standard widths like 5-3/8".

**Warning signs:**
- A 1.5" board returns 3 tails (impossible proportions)
- Half-pin width output is 1/8" or less
- Sum of all widths (2 × half-pin + tails + interior pins × their width) does not equal board width

**Phase to address:**
Core calculation engine (Phase 1). The validation rules should be encoded as constants and tested before UI exists.

---

### Pitfall 3: Fraction Input Rejected or Mangled on Mobile

**What goes wrong:**
The developer uses `<input type="number">` for board dimensions. On iOS Safari, this brings up a numeric keypad but strips the fractional part of values outside integer range, and the step/min/max attributes cause scroll-wheel bugs. On Android, some browsers accept "3/4" as text but others silently return NaN. The woodworker at the bench types "3/4" or "1 3/4" and gets no result or a wrong calculation.

**Why it happens:**
`type="number"` is designed for numbers, not imperial fractions. Woodworkers naturally express dimensions as "1 3/4" (one and three-quarters), not "1.75". Most woodworking input in the real world is fractional, but the default number input forces decimal thinking. The developer sees the numeric keypad on mobile and thinks the job is done.

**How to avoid:**
Use `<input type="text" inputmode="decimal">` for all measurement inputs. This brings up the numeric keypad on mobile without the type=number baggage. Then write a parser that accepts all common imperial fraction formats:
- `3/4` → 0.75"
- `1 3/4` → 1.75"
- `1-3/4` → 1.75"
- `0.75` → 0.75"
- `3` → 3"

Validate and show a clear error ("Enter a measurement like 6, 6 1/4, or 3/4") rather than silently failing. This parser is a core piece of the project — build it first, test it thoroughly.

**Warning signs:**
- Testing on actual iOS with a real board dimension typed in
- NaN appearing in the output area after entering "6 1/4"
- Output changes unexpectedly when user scrolls while input is focused

**Phase to address:**
Core calculation engine (Phase 1) for the parser. UI layer (Phase 2) for keyboard type and input field configuration.

---

### Pitfall 4: Fraction Display Rounds to Wrong Precision for Workshop Use

**What goes wrong:**
The calculator displays results like "0.4844" (31/64") which is beyond what any hand-tool woodworker can mark accurately. Or it displays "0.5000" instead of "1/2"". Or it rounds to the nearest 1/16" when the actual value is exactly 7/32" and shows "13/64" which is a valid but unusual fraction woodworkers don't think in.

**Why it happens:**
Developers apply generic decimal-to-fraction conversion that finds the mathematically exact fraction (GCD reduction). This is correct for math but wrong for shop use. Woodworkers mark out with a marking gauge and dividers; they think in 1/8", 1/16", 1/32" increments. An output of 13/64" is technically correct but useless — you cannot set a marking gauge to 13/64".

**How to avoid:**
Round all output to the nearest 1/32" first (as integers, see Pitfall 1), then simplify. The output denominator should never exceed 32. Test that the output fractions are in the set woodworkers actually use: 1/32, 1/16, 3/32, 1/8, 5/32, 3/16, 7/32, 1/4, etc. Add a note in the output area stating the precision ("dimensions to nearest 1/32"").

Never display 64ths or 128ths. A result rounded to 1/32" is within 0.016" of the true value — within the kerf of a sharp handsaw and well within hand-tool layout tolerance.

**Warning signs:**
- Fractions appearing with denominators of 64 or 128
- Results that are non-reducible fractions with uncommon denominators
- Workshop testers saying "I can't set my gauge to that"

**Phase to address:**
Core calculation engine (Phase 1) — build the `toFraction32()` display function as a first-class utility, not an afterthought.

---

### Pitfall 5: Angle Convention Ambiguity — Ratio vs. Degrees

**What goes wrong:**
The calculator internally uses degrees for trigonometry (as JavaScript's `Math.tan()` requires) but the UI labels say "1:8 ratio" or "7.1 degrees." These two representations don't match exactly: `atan(1/8) = 7.125°`, not 7°. If the developer picks "7 degrees" as the hardcoded constant for a 1:8 ratio, the output will be geometrically wrong — the tail width at the baseline will not match what a woodworker laying out with a 1:8 sliding bevel gets.

**Why it happens:**
The confusion between slope ratio (1:8 = 1 unit horizontal per 8 units vertical, i.e., rise/run on the slope face) and angle in degrees causes developers to either hardcode the rounded degree value or mix up the tangent direction. Some sources cite the 1:6 ratio as "9.5°" when it is actually `atan(1/6) = 9.46°`.

**How to avoid:**
Define the angle exclusively as a ratio in the code. Use `Math.atan(1/ratio)` in radians for the tail-face slope computation. Never hardcode 7 or 9.5 as degree values. The constants in the code should read:
```js
const SOFTWOOD_RATIO = 8;  // 1:8
const HARDWOOD_RATIO = 6;  // 1:6
const softwoodAngleRad = Math.atan(1 / SOFTWOOD_RATIO);
```
Display the ratio to the user (1:8, 1:6) not the degrees — that's what they'll use with their sliding bevel.

**Warning signs:**
- Hardcoded "7.125" or "9.5" degree values in the calculation code
- Tail width at the baseline doesn't match manual calculation with a 1:8 bevel

**Phase to address:**
Core calculation engine (Phase 1). Define the angle constants in one place, documented, before writing any other geometry.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Use `toFixed(4)` for all display | Fast to implement | Displays "0.4375" not "7/16" — defeats imperial fractions entirely | Never — build fraction display from the start |
| Derive angle from hardcoded degrees (7°, 9.5°) | Avoids trig setup | Geometrically wrong vs. what woodworkers use with a bevel gauge | Never — always derive from ratio |
| Let user type any pin count | Simplest input | Can produce invalid layouts (too narrow, too weak) | Never for v1 — auto-calculate pin count |
| Use `type="number"` for all inputs | Fastest form build | Rejects "1 3/4" on mobile, causes iOS scroll bugs | Never — use text + inputmode |
| Round outputs independently per value | Simple per-value | Sum of outputs ≠ board width; woodworker can't verify layout | Never — preserve sum constraint |
| Skip edge case for narrow boards (<2") | Avoids complexity | Returns nonsensical 0 or negative pin counts | Never — special-case narrow boards explicitly |

---

## Integration Gotchas

This is a pure client-side app with no backend. The "integrations" are the browser APIs.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Mobile keyboard | `type="number"` for fraction inputs | `type="text" inputmode="decimal"` with a fraction parser |
| Clipboard / sharing | No share mechanism means layout lost when user closes browser tab | Add a URL-based state encoding (query params) so the page is shareable/bookmarkable |
| Browser number formatting | Using `Number.toLocaleString()` for display | It formats for the locale (commas in Europe) — build a dedicated `toFraction32()` instead |
| Viewport on mobile | Fixed-width layout not tested on a real phone at arm's length | Test at 375px wide with actual touch interaction from the first iteration |

---

## Performance Traps

This app has trivial scale concerns — calculations are instant, no network, no database. The real "performance" pitfall is perceived performance from the user's perspective in a workshop.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Calculate on button press only | User must tap twice (enter value, then tap Calculate); fumbles in workshop | Calculate on-input with debounce (200ms) for immediate feedback | From day one; workshop users have dirty or gloved hands and want instant feedback |
| No persistence | User refreshes or navigates away, loses entered dimensions | Store last inputs in localStorage; restore on load | Any time user refreshes accidentally |
| Output too dense | Wall of numbers that requires reading to find the key measurement | Lead with the most-used outputs (pin spacing, tail width) in large text; push detail below | As soon as more than 3-4 output values are displayed |

---

## Security Mistakes

This is a calculation-only, no-backend, no-user-data app. Security surface is minimal.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Eval-based fraction parser (parsing "3/4" with eval()) | Code injection if user types `alert(1)` as board dimension | Parse fractions with explicit regex + numeric extraction, never eval() |
| No input sanitization | Garbage in → NaN displayed without explanation | Validate all inputs, show friendly error for non-numeric or impossible values |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Decimal output for imperial inputs | Woodworker cannot use "0.4375" with a marking gauge — must mentally convert | Always display in fractions to nearest 1/32" |
| No explanation of what "half-pin" means | Novice woodworker doesn't understand the output fields | Label outputs with brief explanations: "Half-pin width (at edges): 3/8"" |
| Requiring both board width AND custom pin count | Extra cognitive load for a simple operation | Auto-calculate pin count from board width; let user override if desired |
| Results appear below the fold on mobile | User must scroll to see output after tapping Calculate | Position output immediately below inputs; no content between form and results |
| No visible precision statement | User worries the calculator is giving them 64ths they can't measure | Show "dimensions to nearest 1/32"" prominently near the output |
| Small tap targets for the Calculate button | Workshop use with coarse motor control from tools/gloves | Minimum 48px tap targets; full-width button on mobile |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Fraction display:** Shows correct fractions for "happy path" inputs — verify with a board width that produces irrational intermediate values (e.g., 5-3/8" wide, 4 tails)
- [ ] **Edge constraint:** Half-pins always present at edges — verify no code path can produce a layout starting with a full tail at the edge
- [ ] **Mobile input:** Fraction entry ("1 3/4") works on real iPhone Safari — do not test only on desktop browser with simulated mobile
- [ ] **Sum check:** All output measurements add up to exact board width — verify with a separate calculation
- [ ] **Narrow board:** A 1-1/4" board produces a valid (1-tail) layout, not an error or zero pins
- [ ] **Angle display:** Ratio shown to user (1:8) matches the angle used in geometry math (atan(1/8)), not a rounded degree approximation
- [ ] **No eval:** Fraction parser uses regex/split, not eval() — confirm in code review

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Floating-point fraction display | MEDIUM | Refactor calculation layer to use integer 32nds representation; audit all intermediate values; add regression tests for known-good layouts |
| Wrong angle constant | LOW | Single constant change, but requires re-testing all outputs |
| `type="number"` input on mobile | LOW | Change input attributes and add fraction parser; backward compatible |
| Invalid pin count (no domain constraints) | MEDIUM | Add validation layer on top of existing math; special-case narrow boards |
| No sum constraint preservation | HIGH | May require redesigning the spacing algorithm to distribute rounding error rather than round independently |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Floating-point fraction corruption | Phase 1: Core math engine | Unit test: 5-3/8" / 4 tails = exact fractions that sum to 5-3/8" |
| Invalid pin count (no domain constraints) | Phase 1: Core math engine | Test: 1.5" board → 1 tail layout; 3" board → 2 tail layout |
| Angle ratio vs. degrees confusion | Phase 1: Core math engine | Code review: no hardcoded degree values; only atan(1/ratio) |
| Fraction display precision (>32nds) | Phase 1: Core math engine | Test: no output denominator exceeds 32 |
| Mobile fraction input rejected | Phase 2: UI layer | Device test on iPhone Safari with "1 3/4" entry |
| Outputs don't sum to board width | Phase 1: Core math engine | Automated test: sum(all output widths) === board_width |
| Output below fold on mobile | Phase 2: UI layer | Manual test at 375px: results visible without scrolling |
| No state persistence | Phase 2: UI layer | Refresh after entering values: values restored |

---

## Sources

- [Avoiding Floating-Point Pitfalls in JavaScript - Sling Academy](https://www.slingacademy.com/article/avoiding-floating-point-pitfalls-in-javascript-calculations/) (MEDIUM confidence — verified against MDN IEEE 754 spec)
- [Number().toFixed() Rounding Errors — SitePoint](https://www.sitepoint.com/number-tofixed-rounding-errors-broken-but-fixable/) (MEDIUM confidence)
- [Finger-Friendly Numeric Inputs with inputmode — CSS-Tricks](https://css-tricks.com/finger-friendly-numerical-inputs-with-inputmode/) (HIGH confidence — verified against MDN)
- [Why input[type=number] Hurts UX](https://n8d.at/inputtypenumber-and-why-it-isnt-good-for-your-user-experience/) (MEDIUM confidence)
- [Safari on iOS and input[type=number] — Soledad Penadés 2024](https://soledadpenades.com/posts/2024/safari-ios-input-type-number/) (HIGH confidence — first-party browser testing)
- [Laying Out Dovetails — Fine Woodworking](https://www.finewoodworking.com/project-guides/joinery/laying-out-dovetails) (HIGH confidence — authoritative domain source)
- [Dovetail Layout: What Ratio or Degree? — Popular Woodworking](https://www.popularwoodworking.com/editors-blog/dovetail-layout-what-ratio-or-degree/) (HIGH confidence — authoritative domain source)
- [Dovetail Sizing: Keep It Simple — Paul Sellers](https://paulsellers.com/2018/01/dovetail-sizing-keep-simple/) (HIGH confidence — leading hand-tool woodworking authority)
- [Through Dovetail Joint Mark Out — Axminster Tools](https://knowledge.axminstertools.com/through-dovetail-joint-mark-out/) (HIGH confidence — manufacturer documentation)
- [What's the Deal With Dovetail Ratios — Heartwood Tools](https://www.heartwoodtools.com/blog/2019/12/20/whats-the-deal-with-dovetail-ratios) (MEDIUM confidence — craftsperson blog, corroborates authoritative sources)
- [fraction.js — npm](https://www.npmjs.com/package/fraction.js) (HIGH confidence — official package documentation)
- [Rounding errors in woodworking fraction calculators — Sawmill Creek](https://sawmillcreek.org/threads/dovetail-layout-calculator.158407/) (MEDIUM confidence — community forum, real user experience)

---
*Pitfalls research for: Dovetail Joint Calculator (hand-tool woodworking, imperial, mobile-first web app)*
*Researched: 2026-02-25*
