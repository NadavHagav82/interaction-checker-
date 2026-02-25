# Requirements: Dovetail Joint Calculator

**Defined:** 2026-02-25
**Core Value:** Accurate dovetail layout math from minimal input — enter board dimensions, get back everything you need to mark and cut.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Input

- [x] **INP-01**: User can enter board width in imperial inches (fractional input accepted, e.g., "6 3/4")
- [x] **INP-02**: User can enter board thickness in imperial inches (fractional input accepted)
- [x] **INP-03**: User can select wood species type (hardwood / softwood) which sets default dovetail angle
- [x] **INP-04**: User can override the dovetail angle/ratio if the species default doesn't suit
- [x] **INP-05**: User can override the auto-recommended pin count

### Calculation

- [x] **CALC-01**: Calculator determines pin count from board width using smart defaults
- [x] **CALC-02**: Calculator computes tail width in fractional imperial (nearest 1/32")
- [x] **CALC-03**: Calculator computes pin width (narrowest point) in fractional imperial
- [x] **CALC-04**: Calculator computes half-pin width in fractional imperial
- [x] **CALC-05**: Calculator computes tail depth (equals board thickness) in fractional imperial
- [x] **CALC-06**: Calculator uses correct angle from ratio (1:6 hardwood = atan(1/6), 1:8 softwood = atan(1/8))
- [x] **CALC-07**: Calculator warns when pin width falls below 3/16" (structurally weak)

### Display

- [ ] **DISP-01**: All measurements display as imperial fractions (e.g., "7/16"") not decimals
- [ ] **DISP-02**: Output is labeled by board context (tail board measurements vs pin board measurements)
- [ ] **DISP-03**: Wood species presets display as named options ("Hardwood (1:6)" / "Softwood (1:8)")
- [ ] **DISP-04**: Output updates reactively as inputs change (no submit button)

### Platform

- [ ] **PLAT-01**: App works in modern browsers (Chrome, Safari, Firefox, Edge)
- [ ] **PLAT-02**: Layout is responsive and usable on phone screens (workshop use)
- [ ] **PLAT-03**: App runs entirely client-side (no backend required)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Units

- **UNIT-01**: User can toggle between imperial and metric units
- **UNIT-02**: Metric output displays in millimeters

### Joint Types

- **JTYP-01**: Calculator supports half-blind dovetail layout
- **JTYP-02**: Calculator supports sliding dovetail layout

### Features

- **FEAT-01**: URL parameter state for bookmarking/sharing calculations
- **FEAT-02**: Output precision toggle (1/16" vs 1/32" vs 1/64")

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Visual diagrams / joint preview | Numbers-only output per user preference; adds rendering complexity with no value for target user |
| Printable templates | Printer calibration issues make templates unreliable; hand-tool users mark from ruler |
| CNC / G-code output | Hand-tool use only |
| Power tool jig calculations | Hand-tool use only |
| Save / history / localStorage | Users recalculate fresh per board; state persistence adds complexity |
| Step-by-step cutting instructions | Tutorial content out of scope; target user knows how to cut |
| Wood species library | Hardwood/softwood toggle sufficient for angle selection |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INP-01 | Phase 1 | Complete |
| INP-02 | Phase 1 | Complete |
| INP-03 | Phase 1 | Complete (01-01) |
| INP-04 | Phase 1 | Complete (01-01) |
| INP-05 | Phase 1 | Complete |
| CALC-01 | Phase 1 | Complete |
| CALC-02 | Phase 1 | Complete |
| CALC-03 | Phase 1 | Complete |
| CALC-04 | Phase 1 | Complete |
| CALC-05 | Phase 1 | Complete |
| CALC-06 | Phase 1 | Complete (01-01) |
| CALC-07 | Phase 1 | Complete |
| DISP-01 | Phase 2 | Pending |
| DISP-02 | Phase 2 | Pending |
| DISP-03 | Phase 2 | Pending |
| DISP-04 | Phase 2 | Pending |
| PLAT-01 | Phase 3 | Pending |
| PLAT-02 | Phase 3 | Pending |
| PLAT-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 after plan 01-01 completion (INP-03, INP-04, CALC-06 complete)*
