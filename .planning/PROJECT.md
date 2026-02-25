# Dovetail Joint Calculator

## What This Is

A web app that calculates dovetail joint dimensions for hand-cut woodworking. You enter your board width and thickness, and it gives you the pin sizes, tail sizes, spacing, and angles needed to lay out the joint. Built for use on any device — phone at the bench or desktop for planning.

## Core Value

Accurate dovetail layout math from minimal input — enter board dimensions, get back everything you need to mark and cut.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Calculate through dovetail layout from board width and thickness
- [ ] Output pin count, pin width, tail width, half-pin width, and spacing
- [ ] Smart defaults for pin/tail ratio and angle (1:8 softwood, 1:6 hardwood)
- [ ] Imperial units with fractional display (e.g., 3/4", 7/16")
- [ ] Responsive web interface usable on phone and desktop
- [ ] Clean numerical output — no diagrams or visual layouts

### Out of Scope

- Half-blind dovetails — deferred to v2
- Sliding dovetails — deferred to v2
- Metric units — deferred to v2
- Visual diagrams or interactive previews — not needed, numbers only
- Printable templates — not in scope
- CNC/machine output — hand tool use only
- Power tool jig calculations — hand tool use only

## Context

- Target user is a hand-tool woodworker who needs quick, reliable joint math
- Through dovetails are the most common starting point for hand-cut joinery
- Standard dovetail angles: 1:6 ratio for hardwood, 1:8 for softwood (approximately 9.5 and 7.1 degrees)
- Half-pins at edges are conventional — calculator should always include them
- Board thickness determines tail length (depth of cut)

## Constraints

- **Platform**: Web app — HTML/CSS/JS, no backend required
- **Units**: Imperial only for v1
- **Input**: Minimal — board width and thickness are the primary inputs
- **Output**: Numerical only — dimensions and counts, no graphics

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Through dovetails only for v1 | Focused scope, most common joint type | — Pending |
| Numbers-only output | User wants math, not visuals | — Pending |
| Imperial-only for v1 | User's primary unit system | — Pending |
| No backend | Pure client-side calculation, simpler deployment | — Pending |

---
*Last updated: 2026-02-25 after initialization*
