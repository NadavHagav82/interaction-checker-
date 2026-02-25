# Phase 2: UI Layer - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Reactive React interface wiring all inputs to the Phase 1 calculation engine, with fractional imperial output displayed by board section. No new calculation logic — this phase is purely UI. Requirements: DISP-01, DISP-02, DISP-03, DISP-04.

</domain>

<decisions>
## Implementation Decisions

### Input Layout
- Stacked vertically, one field per row, full width (mobile-first)
- Simple text fields — no fancy controls, relies on the input parser from Phase 1
- Order top to bottom: Board Width, Board Thickness, Wood Species, then overrides (angle, pin count)
- Short labels above each field (e.g., "Board Width")

### Results Display
- Two labeled sections: "Tail Board" and "Pin Board", each listing its measurements
- Simple "Label: value" rows (e.g., "Tail Width: 7/8"")
- Results section always visible — shows dashes or placeholder when input is incomplete, updates reactively as user types
- Pin width warning: inline red text below the pin width value ("Warning: pins below 3/16"")

### Species Toggle & Overrides
- Two side-by-side buttons for species: "Softwood (1:8)" | "Hardwood (1:6)" — one active at a time
- Angle and pin count override fields always visible below the species toggle (not collapsed)

### Workshop Readability
- Large output numbers — easy to read at arm's length from a phone on the bench
- Minimal and clean visual style: white background, minimal color, just the numbers
- No decorative elements — functional tool, not a showcase

### Claude's Discretion
- Exact spacing and padding values
- Font family choice (something readable)
- How dashes/placeholders look in empty result state
- Mobile breakpoint details

</decisions>

<specifics>
## Specific Ideas

- Outputs should be big and bold enough to read from a phone sitting on a workbench
- The overall feel should be like a clean utility — think calculator app, not marketing site

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-ui-layer*
*Context gathered: 2026-02-25*
