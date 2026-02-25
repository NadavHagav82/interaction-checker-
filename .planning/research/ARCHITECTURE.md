# Architecture Research

**Domain:** Client-side calculator web app (woodworking geometry tool)
**Researched:** 2026-02-25
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     UI Layer (HTML/CSS)                      │
├──────────────┬──────────────────────────────────────────────┤
│  Input Form  │             Results Display                   │
│  (board dims)│  (pin count, widths, half-pin, spacing)      │
└──────┬───────┴──────────────────────────────────────────────┘
       │ user input events
       ▼
┌─────────────────────────────────────────────────────────────┐
│                 Controller Layer (app.js)                     │
│  - Reads form values                                         │
│  - Validates input                                           │
│  - Calls calculation engine                                  │
│  - Formats output                                            │
│  - Updates DOM                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ validated numbers
                       ▼
┌─────────────────────────────────────────────────────────────┐
│             Calculation Engine (calculator.js)               │
│  - Pure functions only                                       │
│  - No DOM access, no side effects                            │
│  - Input: { boardWidth, boardThickness, ratio, anglePreset } │
│  - Output: { pinCount, pinWidth, tailWidth, halfPinWidth,    │
│              spacing, angle, tailDepth }                     │
└─────────────────────────────────────────────────────────────┘
                       │ decimal numbers
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Formatter Layer (formatter.js)                  │
│  - Converts decimals to nearest 1/16" fractions             │
│  - Returns human-readable strings: "3/4\"", "7/16\""        │
│  - Stateless pure functions                                  │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| index.html | Page structure, form inputs, results container | Semantic HTML, data-* attributes |
| styles.css | Responsive layout, mobile-first grid | CSS Grid/Flexbox, no JS |
| app.js | Event wiring, input validation, DOM updates | Event listeners, DOM manipulation |
| calculator.js | Dovetail geometry math, pure functions only | ES module exports, no DOM |
| formatter.js | Decimal-to-fraction conversion, unit display | Pure functions, string formatting |

## Recommended Project Structure

```
src/
├── index.html          # Single page, form + results
├── styles.css          # All styling
└── js/
    ├── app.js          # Entry point — wires events, updates DOM
    ├── calculator.js   # Pure math: dovetail geometry engine
    └── formatter.js    # Pure formatting: decimal → fraction strings
```

### Structure Rationale

- **Flat src/ with js/ subfolder:** Three JS files is the correct scope. No need for deeper nesting — keep it discoverable.
- **calculator.js isolated:** The most important architectural decision. Calculation logic must have zero DOM imports. This enables testing without a browser and makes the math auditable in isolation.
- **formatter.js separate from calculator.js:** Formatting (3/4") is a display concern, not a math concern. Calculator outputs raw decimals. Formatter converts them. This boundary prevents the math from becoming entangled with display logic.
- **No build step:** This is a three-file JS app. Native ES modules (`type="module"`) work in all modern browsers without Webpack/Vite. A bundler adds complexity with no benefit at this scale.

## Architectural Patterns

### Pattern 1: Pure Calculation Engine

**What:** calculator.js exports only pure functions — given the same inputs, always return the same outputs, with no side effects. No `document`, no `window`, no fetch.

**When to use:** Always, for any math module. This is non-negotiable for a calculator.

**Trade-offs:** Slightly more wiring in app.js (must explicitly pass values), but gains testability and auditability. Worth it unconditionally.

**Example:**
```javascript
// calculator.js — pure, no DOM
export function calculateDovetail({ boardWidth, boardThickness, ratio, pinCount }) {
  const tailDepth = boardThickness;
  const totalSpace = boardWidth;
  const halfPinWidth = /* geometry formula */;
  const tailWidth = /* geometry formula based on ratio */;
  const pinWidth = /* derived from ratio */;
  const spacing = /* derived */;
  const angle = Math.atan(1 / ratio) * (180 / Math.PI);

  return { pinCount, pinWidth, tailWidth, halfPinWidth, spacing, angle, tailDepth };
}

export function suggestPinCount(boardWidth) {
  // Returns a sensible default pin count for a given board width
  // Standard rule: roughly 1 pin per inch of board width, minimum 2
  return Math.max(2, Math.round(boardWidth));
}
```

### Pattern 2: Formatter as a Separate Pure Module

**What:** A separate module handles all decimal-to-fraction conversion. The calculator never produces strings — it produces numbers. The formatter never does math — it formats numbers.

**When to use:** Whenever you have a domain (math) with a distinct display requirement (fractions).

**Trade-offs:** Two files instead of one. Tradeoff is worth it — mixing fraction string logic into geometry math is a common mistake that creates untestable, unreadable code.

**Example:**
```javascript
// formatter.js — pure, no DOM
export function toFraction(decimal, denominator = 16) {
  const whole = Math.floor(decimal);
  const fractional = decimal - whole;
  const numerator = Math.round(fractional * denominator);

  // Simplify fraction (e.g., 8/16 → 1/2)
  const gcd = greatestCommonDivisor(numerator, denominator);
  const simplifiedNum = numerator / gcd;
  const simplifiedDen = denominator / gcd;

  if (simplifiedNum === 0) return `${whole}"`;
  if (whole === 0) return `${simplifiedNum}/${simplifiedDen}"`;
  return `${whole} ${simplifiedNum}/${simplifiedDen}"`;
}

export function formatResult(label, decimalInches) {
  return `${label}: ${toFraction(decimalInches)}`;
}
```

### Pattern 3: Controller as Thin Wiring

**What:** app.js does exactly three things: reads inputs, calls calculator, writes outputs. All logic lives in calculator.js and formatter.js. app.js has no math and no string formatting.

**When to use:** Always for this class of app. The controller is the integration point, not a logic home.

**Trade-offs:** None — this is the correct structure. The anti-pattern is writing math inside event listeners.

**Example:**
```javascript
// app.js — thin wiring only
import { calculateDovetail, suggestPinCount } from './calculator.js';
import { toFraction } from './formatter.js';

document.getElementById('calculate-btn').addEventListener('click', () => {
  const boardWidth = parseFloat(document.getElementById('board-width').value);
  const boardThickness = parseFloat(document.getElementById('board-thickness').value);
  const ratio = parseInt(document.getElementById('ratio').value);

  if (!isValidInput(boardWidth, boardThickness)) {
    showError('Please enter valid board dimensions.');
    return;
  }

  const pinCount = suggestPinCount(boardWidth);
  const result = calculateDovetail({ boardWidth, boardThickness, ratio, pinCount });

  displayResults(result);
});

function displayResults(result) {
  document.getElementById('pin-count').textContent = result.pinCount;
  document.getElementById('pin-width').textContent = toFraction(result.pinWidth);
  document.getElementById('tail-width').textContent = toFraction(result.tailWidth);
  document.getElementById('half-pin-width').textContent = toFraction(result.halfPinWidth);
  document.getElementById('spacing').textContent = toFraction(result.spacing);
  document.getElementById('angle').textContent = `${result.angle.toFixed(1)}°`;
  document.getElementById('tail-depth').textContent = toFraction(result.tailDepth);
}
```

## Data Flow

### Request Flow

```
User enters board width (e.g., 6.25") and thickness (e.g., 0.75")
    ↓
app.js reads form values, parses to floats
    ↓
app.js validates: boardWidth > 0, boardThickness > 0
    ↓
app.js calls calculateDovetail({ boardWidth, boardThickness, ratio })
    ↓
calculator.js returns { pinCount, pinWidth, tailWidth, halfPinWidth, spacing, angle, tailDepth }
    ↓
app.js calls toFraction() on each measurement value
    ↓
app.js writes strings to result DOM elements
    ↓
User sees: "Pin width: 7/16""  "Tail width: 1 3/16""  etc.
```

### State Management

This app has no meaningful state to manage. Inputs are read on button click. There is no persistence requirement, no navigation, and no async operations.

```
Form values (live in DOM) → Read on click → Compute → Write to DOM → Done
```

Do not introduce a state management library. Do not reach for localStorage unless a "remember my last inputs" feature is added later.

### Key Data Flows

1. **Input to calculation:** User submits form → app.js reads and validates raw string inputs → parses to floats → passes structured object to calculator.js
2. **Calculation to display:** calculator.js returns plain number object → app.js passes each number through formatter.js → writes resulting strings to result DOM nodes
3. **Smart defaults flow:** On page load, app.js populates ratio select with "1:8 (softwood)" as default; angle selection changes only the ratio constant passed to calculator, not the algorithm

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| v1 (through dovetails only) | Three JS files, no build tool, pure functions — this is the right approach |
| v2 (half-blind, sliding dovetails) | Add joint-type parameter to calculateDovetail(); add additional pure functions for new joint types; no structural change needed |
| v3 (metric + imperial, visual output) | Add a second formatter module (metricFormatter.js); add a separate rendering module for SVG diagrams; still no state management needed |
| Multiple tools (box joints, finger joints) | At this point, consider splitting calculator.js into joint-specific modules: dovetailCalculator.js, boxJointCalculator.js |

### Scaling Priorities

1. **First bottleneck:** Adding joint types. Solved by keeping calculator.js as pure functions — new joint types add new functions without touching existing ones.
2. **Second bottleneck:** Visual output (diagrams). Solved by keeping the current architecture intact and adding a renderer.js that consumes calculator output independently.

## Anti-Patterns

### Anti-Pattern 1: Math Inside Event Listeners

**What people do:** Write the dovetail formula directly inside the `click` event listener callback in app.js.

**Why it's wrong:** Math and DOM are coupled. You can't test the math without a browser. You can't reuse the math without copy-pasting. When the formula needs to change (and it will), you have to hunt through event handler code.

**Do this instead:** Keep the event listener to three lines: read inputs, call calculator, write outputs. All math lives in calculator.js.

### Anti-Pattern 2: Displaying Decimals Directly

**What people do:** Show `0.4375` instead of `7/16"` in the output.

**Why it's wrong:** Woodworkers don't think in decimals. A result of `0.4375` is meaningless at the bench. The tool fails at its only job: giving usable layout numbers.

**Do this instead:** Always pass results through formatter.js before displaying. The formatter converts to nearest 1/16" (or 1/32" as a future precision option).

### Anti-Pattern 3: Using a Framework for a Three-File App

**What people do:** Initialize a React or Vue project for a calculator with one form and one results section.

**Why it's wrong:** Framework overhead (bundle size, build tooling, component lifecycle) adds complexity with no benefit. Real-world evidence: teams that switched financial calculators from React to vanilla JS reported simpler code and faster load times (source: DEV Community case study).

**Do this instead:** Three files, native ES modules (`<script type="module">`), no build step. Browser support for native modules is universal since 2018.

### Anti-Pattern 4: Floating-Point Accumulation in Fraction Display

**What people do:** Compute measurements as floating-point, then try to display them as fractions by naively rounding.

**Why it's wrong:** Floating-point arithmetic produces values like `0.4375000000000001`. String operations on these produce garbage. Fraction rounding logic that doesn't explicitly handle precision loses accuracy across multiple derived values.

**Do this instead:** Round to nearest 1/16" in the formatter, not during calculation. Keep full float precision through the entire calculation chain. Only snap to fractions at the display boundary. Consider using the `Fraction.js` library if fraction arithmetic (not just display) is needed.

## Integration Points

### External Services

None. This is a fully offline-capable, client-side app. No APIs. No analytics required. No CDN dependencies needed (can optionally use CDN for CSS reset, but not required).

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| app.js ↔ calculator.js | Direct function call (ES module import) | calculator.js never imports app.js — one-way dependency |
| app.js ↔ formatter.js | Direct function call (ES module import) | formatter.js never imports app.js — one-way dependency |
| calculator.js ↔ formatter.js | None — no communication | These two modules are independent of each other |
| HTML form ↔ app.js | DOM events and getElementById | app.js owns all DOM interaction |

### Suggested Build Order

1. **calculator.js first** — Build and manually verify the pure math functions before any UI exists. Test by calling functions directly in browser console or Node.js. This is the core of the product.
2. **formatter.js second** — Build fraction conversion independently. Verify `toFraction(0.4375)` returns `"7/16\""`, `toFraction(0.75)` returns `"3/4\""`, etc.
3. **index.html structure third** — Mark up the form and results section with proper IDs before wiring JS. No styling yet.
4. **app.js fourth** — Wire events, validation, and DOM updates. At this point you have a working (if unstyled) calculator.
5. **styles.css last** — Style for mobile-first responsive layout after all functionality is confirmed.

This order means each layer is verifiable before the next is built. The most risk (the math) is resolved first.

## Sources

- [Patterns.dev — Container/Presentational and Module patterns](https://www.patterns.dev/) — MEDIUM confidence (verified with patterns.dev directly)
- [FreeCodeCamp: Build an HTML Calculator from Scratch](https://www.freecodecamp.org/news/how-to-build-an-html-calculator-app-from-scratch-using-javascript-4454b8714b98/) — HIGH confidence (primary source for three-layer pattern: pure result function, state update, visual update)
- [DEV Community: Why We Ditched React for Vanilla JS Financial Calculators](https://dev.to/cnivargi/why-we-ditched-react-and-built-financial-calculators-in-vanilla-javascript-and-how-it-made-2nl) — MEDIUM confidence (real-world case study supporting vanilla over framework for calculators)
- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) — HIGH confidence (official browser module support documentation)
- [GitHub: schwalbenundzinken (dovetail calculator)](https://github.com/hupf/schwalbenundzinken) — MEDIUM confidence (reference implementation showing TypeScript + Lit + Vite for a similar tool; more complex than needed for this project)
- [Fraction.js (rawify)](https://github.com/infusion/Fraction.js/) — MEDIUM confidence (library option for fraction arithmetic if needed)
- [WebSearch: React vs Vanilla JS for calculators, 2025](https://dev.to/purushoth_26/react-vs-vanilla-javascript-what-to-choose-in-2025-5ejb) — LOW confidence (community article, consistent with other sources)

---
*Architecture research for: Dovetail Joint Calculator web app*
*Researched: 2026-02-25*
