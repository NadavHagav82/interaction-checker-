import { describe, it, expect } from 'vitest';
import {
  calculateDovetail,
  suggestPinCount,
} from '../calculator';
import {
  SOFTWOOD_RATIO,
  HARDWOOD_RATIO,
  MIN_PIN_WIDTH_INCHES,
} from '../../types/dovetail';

// ---------------------------------------------------------------------------
// suggestPinCount
// ---------------------------------------------------------------------------

describe('suggestPinCount', () => {
  it('returns 1 tail for a very narrow board (1.5")', () => {
    expect(suggestPinCount(1.5)).toBe(1);
  });

  it('returns 2 tails for a 2.5" board', () => {
    expect(suggestPinCount(2.5)).toBe(2);
  });

  it('returns 3 tails for a 6" board (~1 tail per 2 inches)', () => {
    expect(suggestPinCount(6)).toBe(3);
  });

  it('returns 6 tails for a 12" board', () => {
    expect(suggestPinCount(12)).toBe(6);
  });

  it('never returns 0 or negative', () => {
    expect(suggestPinCount(0.5)).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// calculateDovetail — known-good 6" softwood board, 3 tails
//
// Hand-verified values (ratio=8):
//   angle       = Math.atan(1/8)        ≈ 0.12435499...
//   tan(angle)  = 1/8                   = 0.125
//   pinWide     = 6 / (3*2.5)           = 0.8
//   tailWide    = 6/3 - 0.8             = 1.2
//   halfPinWide = 0.8/2                 = 0.4
//   pinNarrow   = 0.8 - 2*0.75*0.125   = 0.6125
//   halfNarrow  = 0.4 - 0.75*0.125     = 0.30625
//   sum (face)  = 2*0.4 + 3*1.2 + 2*0.8 = 6.0  (exact)
// ---------------------------------------------------------------------------

describe('calculateDovetail — 6" softwood board, 3 tails (known-good)', () => {
  const result = calculateDovetail({
    boardWidth: 6,
    boardThickness: 0.75,
    ratio: SOFTWOOD_RATIO,
    pinCount: 3,
  });

  it('returns pinCount 3', () => {
    expect(result.pinCount).toBe(3);
  });

  it('tailDepth equals boardThickness', () => {
    expect(result.tailDepth).toBe(0.75);
  });

  it('angle is derived from ratio (Math.atan(1/8))', () => {
    expect(result.angle).toBeCloseTo(Math.atan(1 / SOFTWOOD_RATIO), 10);
  });

  it('pinWidthWarning is false for a standard 6" board with 3 tails', () => {
    expect(result.pinWidthWarning).toBe(false);
  });

  it('pinWidth (narrowest) ≈ 0.6125"', () => {
    expect(result.pinWidth).toBeCloseTo(0.6125, 6);
  });

  it('halfPinWidth (narrowest) ≈ 0.30625"', () => {
    expect(result.halfPinWidth).toBeCloseTo(0.30625, 6);
  });

  it('tailWidth ≈ 1.2"', () => {
    expect(result.tailWidth).toBeCloseTo(1.2, 6);
  });

  // Sum constraint using face widths (derived from the narrowest-point fields):
  //   pinWide     = pinNarrow + 2*tailDepth*tan(angle)
  //   halfPinWide = halfPinNarrow + tailDepth*tan(angle)
  it('sum constraint: 2×halfPinFace + 3×tailWidth + 2×pinFace = boardWidth', () => {
    const tan = Math.tan(result.angle);
    const pinFace = result.pinWidth + 2 * result.tailDepth * tan;
    const halfPinFace = result.halfPinWidth + result.tailDepth * tan;
    const sum = 2 * halfPinFace + 3 * result.tailWidth + 2 * pinFace;
    expect(sum).toBeCloseTo(6.0, 6);
  });
});

// ---------------------------------------------------------------------------
// calculateDovetail — pinWidthWarning fires for narrow board
// A 1.5" board with 3 tails has very little room for pins.
// ---------------------------------------------------------------------------

describe('calculateDovetail — narrow board triggers pinWidthWarning', () => {
  it('sets pinWidthWarning=true for 1.5" board with 3 tails', () => {
    const result = calculateDovetail({
      boardWidth: 1.5,
      boardThickness: 0.75,
      ratio: SOFTWOOD_RATIO,
      pinCount: 3,
    });
    expect(result.pinWidthWarning).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// calculateDovetail — angle is always derived from ratio (never hardcoded)
// ---------------------------------------------------------------------------

describe('calculateDovetail — angle derivation from ratio', () => {
  it('uses Math.atan(1/8) for softwood ratio=8', () => {
    const r = calculateDovetail({ boardWidth: 6, boardThickness: 0.75, ratio: 8, pinCount: 3 });
    expect(r.angle).toBeCloseTo(Math.atan(1 / 8), 10);
  });

  it('uses Math.atan(1/6) for hardwood ratio=6', () => {
    const r = calculateDovetail({ boardWidth: 6, boardThickness: 0.75, ratio: HARDWOOD_RATIO, pinCount: 3 });
    expect(r.angle).toBeCloseTo(Math.atan(1 / 6), 10);
  });

  it('hardwood angle is larger than softwood angle (steeper slope)', () => {
    const rHard = calculateDovetail({ boardWidth: 6, boardThickness: 0.75, ratio: HARDWOOD_RATIO, pinCount: 3 });
    const rSoft = calculateDovetail({ boardWidth: 6, boardThickness: 0.75, ratio: SOFTWOOD_RATIO, pinCount: 3 });
    expect(rHard.angle).toBeGreaterThan(rSoft.angle);
  });
});

// ---------------------------------------------------------------------------
// calculateDovetail — pinCount override
// ---------------------------------------------------------------------------

describe('calculateDovetail — pinCount override', () => {
  it('uses the provided pinCount=4 rather than suggestPinCount result', () => {
    const result = calculateDovetail({
      boardWidth: 6,
      boardThickness: 0.75,
      ratio: SOFTWOOD_RATIO,
      pinCount: 4,
    });
    expect(result.pinCount).toBe(4);
  });

  it('uses suggestPinCount when pinCount is omitted', () => {
    const result = calculateDovetail({
      boardWidth: 6,
      boardThickness: 0.75,
      ratio: SOFTWOOD_RATIO,
    });
    expect(result.pinCount).toBe(suggestPinCount(6));
  });
});

// ---------------------------------------------------------------------------
// calculateDovetail — tailDepth always equals boardThickness
// ---------------------------------------------------------------------------

describe('calculateDovetail — tailDepth', () => {
  it('tailDepth equals boardThickness for 6" board', () => {
    const r = calculateDovetail({ boardWidth: 6, boardThickness: 0.75, ratio: 8, pinCount: 3 });
    expect(r.tailDepth).toBe(0.75);
  });

  it('tailDepth equals boardThickness for thicker stock (1")', () => {
    const r = calculateDovetail({ boardWidth: 6, boardThickness: 1.0, ratio: 8, pinCount: 3 });
    expect(r.tailDepth).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// MIN_PIN_WIDTH_INCHES constant
// ---------------------------------------------------------------------------

describe('MIN_PIN_WIDTH_INCHES constant', () => {
  it('equals 3/16 = 0.1875', () => {
    expect(MIN_PIN_WIDTH_INCHES).toBeCloseTo(0.1875, 6);
  });
});
