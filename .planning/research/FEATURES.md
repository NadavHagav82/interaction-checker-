# Feature Research

**Domain:** Woodworking joint calculator — through dovetail, hand-tool, imperial units
**Researched:** 2026-02-25
**Confidence:** MEDIUM (competitor analysis via WebSearch + WebFetch; woodworking domain knowledge verified against multiple sources)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Board width and thickness as primary inputs | Every dovetail calculator starts here; these two values drive all output | LOW | Width determines spacing; thickness determines tail depth and half-pin convention |
| Pin count output | Users need to know how many pins/tails to mark | LOW | Derive from board width with sensible defaults (1 tail per ~25mm / ~1") |
| Pin width output | Core measurement needed before picking up a marking gauge | LOW | Narrowest part of pin; minimum 3/16" for structural integrity |
| Tail width output | The visible face of the joint; users need this to mark the tails | LOW | Typically wider than pins for hand-cut aesthetics |
| Half-pin width at edges | Convention for through dovetails; skipping looks wrong | LOW | Industry standard: half-pins always appear at board edges on drawers/case sides |
| Tail depth output | Equals board thickness for through dovetails; users need the value explicitly | LOW | User should not have to do this math themselves — output it |
| Dovetail angle or ratio | Users set their sliding bevel from this | LOW | 1:8 for softwood (7.1°), 1:6 for hardwood (9.5°) — must be a selectable default, not just a field |
| Fractional imperial display | Hand-tool woodworkers work in fractions, not decimals | MEDIUM | Output must show e.g. "7/16"" not "0.4375""; round to nearest 1/64" or 1/32" |
| Responsive mobile layout | Woodworkers use phones at the bench | LOW | Layout must work on a phone screen without horizontal scrolling |
| Instant recalculation | Users iterate — change one input, see updated output immediately | LOW | No "submit" button; reactive as inputs change |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Smart pin-count recommendation based on board width | Existing tools require user to guess pin count; smart defaults reduce decision fatigue | LOW | Guidelines: 2-3 tails for boards up to 6", 3-4 for 6"-12", 4-5 for 12"-18" — surface as a default, not a locked value |
| Wood species toggle (hardwood / softwood) that sets angle default | Users forget which ratio applies to which species; one-tap default switch eliminates the lookup | LOW | "Hardwood (1:6)" and "Softwood (1:8)" as named options rather than raw number fields |
| Explicit "change this?" affordance on angle/count | Most calculators bury advanced inputs; surfacing them as optional overrides keeps the UI simple but flexible | MEDIUM | Primary inputs = board width + thickness + species; everything else is a collapsible override |
| Fractional display with readable notation | Competitors show decimals or use confusing notation; clean "3/4"" display is immediately usable at the bench | MEDIUM | Round to nearest 1/16" or 1/32"; show both the fraction and the nearest standard marking-gauge increment |
| Minimum pin width warning | Pins narrower than 3/16" are structurally weak and hard to cut; most calculators don't warn | LOW | Surface a caution when calculated pin width falls below 3/16" |
| Named preset ratios | "Traditional (1:8)" and "Fine (1:6)" are more intuitive than raw ratio numbers for less experienced users | LOW | Label the presets; still allow numeric override |
| Clear labeling of which face each measurement applies to (tail board vs. pin board) | Beginners confuse tail-board and pin-board measurements; labeling the outputs eliminates a common error | LOW | Two output sections: "Tail board" and "Pin board" with measurements for each |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Visual diagram / joint preview | Looks impressive in demos | Out of scope per PROJECT.md; adds frontend rendering complexity with zero benefit to the target user (experienced hand-tool woodworker who wants numbers) | Output labeled rows of numbers; label them clearly so no diagram is needed |
| Printable template | Users see blocklayer.com templates and ask for them | Template accuracy depends on printer calibration — a miscalibrated print leads to a ruined joint; hand-tool users mark from a ruler anyway | Provide numbers that users can mark with their own tools |
| Metric units (v1) | ~50% of global woodworkers use metric | Scope increases testing burden; fractional imperial and metric require separate display logic | Defer to v2 as a toggle; build display layer cleanly so switching units later is straightforward |
| Half-blind dovetail calculations | Common joint type | Adds different geometry, different input set, different output set — doubles scope | Defer to v2; through dovetail only for v1 |
| Sliding dovetail calculations | Power-tool and jig users ask for it | Different joint type; not relevant to hand-tool through dovetail use case | Defer to v2 |
| Save / share / history | Users want to recall previous calculations | Requires state persistence; localStorage adds complexity; share URL requires parameter serialization | Not needed for MVP — users typically recalculate fresh for each board |
| Step-by-step cutting instructions | Beginners want guidance | Tutorial content is out of scope; target user knows how to cut, just needs numbers | Link externally (e.g., Fine Woodworking) if needed; don't own the instructional content |
| Wood species library | "What species is this?" lookups seem related | Species identification is a separate domain; hardwood/softwood toggle covers the angle-selection use case | Hardwood/softwood toggle is sufficient |
| CNC / machine output (G-code, router offsets) | Power-tool users request it | Hand-tool only per PROJECT.md; machine output requires fundamentally different data model | Out of scope permanently |

---

## Feature Dependencies

```
[Board Width + Thickness] (primary inputs)
    └──required for──> [Pin Count Recommendation]
    └──required for──> [Tail Width Calculation]
    └──required for──> [Pin Width Calculation]
    └──required for──> [Half-Pin Width Calculation]
    └──required for──> [Tail Depth Output]

[Wood Species Toggle]
    └──sets default for──> [Dovetail Angle / Ratio]

[Dovetail Angle / Ratio]
    └──required for──> [Tail Width Calculation]
    └──required for──> [Pin Width Calculation]

[Pin Width Calculation]
    └──feeds into──> [Minimum Pin Width Warning]

[Tail Width Calculation]
    └──feeds into──> [Pin Width Calculation]
    (tail-to-pin ratio drives both)

[Pin Count] (user-editable default)
    └──required for──> [All spacing calculations]
```

### Dependency Notes

- **All calculations require board width + thickness:** These are the non-negotiable primary inputs. If either is absent, no output is possible.
- **Wood species toggle sets angle default:** The toggle is a convenience feature that pre-fills the angle field. If the user overrides the angle manually, the species toggle becomes cosmetic.
- **Pin count drives all spacing:** The recommended pin count can be overridden, and any change immediately recalculates all outputs. This is why reactive (not form-submit) UX is required.
- **Tail width and pin width are coupled:** They are both derived from board width minus the two half-pins, divided by pin count and tail-to-pin ratio. Changing one changes the other.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — validates the core value proposition: "enter board dimensions, get back everything you need to mark and cut."

- [ ] **Board width input** — primary input; required before any calculation
- [ ] **Board thickness input** — primary input; required for tail depth
- [ ] **Wood species toggle (hardwood / softwood)** — sets angle default; low effort, high value
- [ ] **Dovetail angle / ratio (overridable default)** — editable, defaulted by species toggle
- [ ] **Recommended pin count with override** — smart default based on board width; user can change
- [ ] **Tail width output (fractional imperial)** — core output; shown per tail
- [ ] **Pin width output (fractional imperial)** — core output; shown at narrowest point
- [ ] **Half-pin width output (fractional imperial)** — core output; shown for edge half-pins
- [ ] **Tail depth output (fractional imperial)** — equals board thickness; make it explicit
- [ ] **Minimum pin width warning** — surface when pin < 3/16"
- [ ] **Labeled output sections (tail board / pin board)** — reduces beginner confusion
- [ ] **Reactive recalculation** — output updates as inputs change; no submit button

### Add After Validation (v1.x)

Features to add once core is proven useful.

- [ ] **Nearest common tool increment note** — show "mark at 3/8" (nearest 1/16")" alongside raw fraction for usability
- [ ] **URL parameter state** — encode inputs in URL so users can bookmark or share a specific calculation

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Metric unit support** — toggle imperial/metric; build display layer cleanly in v1 to support this later
- [ ] **Half-blind dovetail calculator** — different geometry, separate input/output model
- [ ] **Sliding dovetail calculator** — different joint type; wider user base
- [ ] **Multiple board calculations** — calculate for multiple board widths in one session

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Board width + thickness inputs | HIGH | LOW | P1 |
| Fractional imperial output | HIGH | MEDIUM | P1 |
| Pin width / tail width / half-pin outputs | HIGH | LOW | P1 |
| Tail depth output | HIGH | LOW | P1 |
| Wood species toggle (sets angle default) | HIGH | LOW | P1 |
| Smart pin count recommendation | MEDIUM | LOW | P1 |
| Reactive recalculation | HIGH | LOW | P1 |
| Minimum pin width warning | MEDIUM | LOW | P1 |
| Labeled tail-board / pin-board outputs | MEDIUM | LOW | P1 |
| Angle / ratio override input | MEDIUM | LOW | P1 |
| Metric unit support | MEDIUM | MEDIUM | P3 |
| URL parameter state | LOW | LOW | P2 |
| Visual diagram | LOW | HIGH | P3 (anti-feature for v1) |
| Printable template | LOW | HIGH | P3 (anti-feature) |
| Save / history | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | BlockLayer (blocklayer.com) | WoodCalc.net | ShakerCabinets Calculator | Our Approach |
|---------|--------------------------|-------------|--------------------------|--------------|
| Primary inputs | Width, pitch, tail thickness, number of tails | Width, thickness, number of tails, angle | Thickness, width, angle, number of tails, ratio | Width + thickness only required; rest are smart defaults |
| Unit support | Imperial + metric | Imperial + metric | Imperial + metric | Imperial only for v1 |
| Angle input | Ratio dropdown (1:4, 1:6, 1:7, 1:8) | Degrees or slope ratio | Degrees (6, 8, 10, 12, 14) | Named presets (hardwood/softwood) with override |
| Output format | Visual template + dimensions | Visual diagram + cutting measurements | Listed dimensions | Numbers only; no diagram |
| Fraction display | Yes (1/8 to 1/64 selectable) | Unknown | Unknown | Yes, to nearest 1/32" or 1/64" |
| Mobile usability | Desktop-oriented; template printing focus | Unknown | Unknown | Mobile-first; bench-usable |
| Smart defaults | No | No | No | Yes — pin count and angle default from species |
| Pin width warning | No | No | No | Yes — warn if < 3/16" |
| Reactive UX | No (calculate button) | Unknown | Unknown | Yes — instant recalculation |
| Labeled outputs | Partial | Yes (tail board / pin board labels) | Partial | Yes — explicit tail-board / pin-board sections |

---

## Sources

- BlockLayer Dovetail Calculator (imperial): https://www.blocklayer.com/woodjoints/dovetaileng — MEDIUM confidence (direct inspection)
- WoodCalc.net Dovetail Calculator: https://woodcalc.net/en/calculators/dovetail — MEDIUM confidence (direct inspection)
- ShakerCabinets Dovetail Calculator: https://shakercabinets.com/tools/dovetail-joint-calculator — MEDIUM confidence (direct inspection)
- Pete Olson Dovetail Calculator: https://pete-olson.com/apps/calculators/dovetail.php — MEDIUM confidence (direct inspection)
- Woodworking-Calculators.com Dovetail: https://woodworking-calculators.com/dovetail-joint-calculator — LOW confidence (WebSearch summary only)
- Paul Sellers blog on dovetail sizing: https://paulsellers.com/2018/01/dovetail-sizing-keep-simple/ — MEDIUM confidence (multiple corroborating sources)
- TailSpin Tools on layout: https://www.tailspintools.com/dovetail-standard-sizes-and-dimensions-a-guide-to-crafting-beautiful-joints/ — LOW confidence (page not accessible)
- Fine Woodworking dovetail layout: https://www.finewoodworking.com/project-guides/boxes/how-to-lay-out-and-cut-dovetails-for-a-box — MEDIUM confidence (direct inspection)
- Sawmill Creek community thread on dovetail calculators: https://sawmillcreek.org/threads/dovetail-layout-calculator.158407/ — LOW confidence (403 blocked)
- Home Improvement Way dovetail calculator overview: https://homeimprovementway.com/dovetail-calculator/ — LOW confidence (WebSearch summary)
- Standard pin width ranges and structural minimums: multiple woodworking sources agree on 3/16" minimum — MEDIUM confidence

---
*Feature research for: Dovetail Joint Calculator — through dovetail, hand-tool, imperial*
*Researched: 2026-02-25*
