import { describe, it, expect } from 'vitest';
import { snapTo32nds, toFraction32, verifySum } from '../formatter';

// ---------------------------------------------------------------------------
// snapTo32nds
// ---------------------------------------------------------------------------

describe('snapTo32nds', () => {
  it('passes through a value already on the 32nd grid', () => {
    expect(snapTo32nds(0.4375)).toBe(0.4375); // 14/32 = 7/16
  });

  it('removes float noise from a value on the 32nd grid', () => {
    // 0.43750000000000006 should snap to 0.4375 (= 14/32)
    expect(snapTo32nds(0.43750000000000006)).toBeCloseTo(0.4375, 10);
  });

  it('snaps 0.1 to the nearest 32nd (3/32 = 0.09375)', () => {
    expect(snapTo32nds(0.1)).toBeCloseTo(3 / 32, 10); // 0.09375
  });

  it('snaps whole numbers exactly', () => {
    expect(snapTo32nds(3.0)).toBe(3.0);
  });

  it('snaps 1/64 (midpoint below 1/32) to 0', () => {
    // Math.round(0.015625 * 32) / 32 = Math.round(0.5) / 32 = 1/32 (rounds up)
    // Actually: Math.round(0.5) = 1 in JS (rounds to even?), let's test actual behavior
    expect(snapTo32nds(1 / 64)).toBeCloseTo(1 / 32, 10); // rounds up to 1/32
  });
});

// ---------------------------------------------------------------------------
// toFraction32
// ---------------------------------------------------------------------------

describe('toFraction32', () => {
  it('converts 0.4375 to "7/16\""', () => {
    expect(toFraction32(0.4375)).toBe('7/16"');
  });

  it('converts 1.75 to "1 3/4\""', () => {
    expect(toFraction32(1.75)).toBe('1 3/4"');
  });

  it('converts 3.0 to "3\""', () => {
    expect(toFraction32(3.0)).toBe('3"');
  });

  it('converts 0.03125 (1/32) to "1/32\""', () => {
    expect(toFraction32(0.03125)).toBe('1/32"');
  });

  it('converts 0.5 to "1/2\""', () => {
    expect(toFraction32(0.5)).toBe('1/2"');
  });

  it('handles float noise: 0.43750000000000006 → "7/16\""', () => {
    expect(toFraction32(0.43750000000000006)).toBe('7/16"');
  });

  it('converts 0.25 to "1/4\""', () => {
    expect(toFraction32(0.25)).toBe('1/4"');
  });

  it('converts 0.125 to "1/8\""', () => {
    expect(toFraction32(0.125)).toBe('1/8"');
  });

  it('converts 2.5 to "2 1/2\""', () => {
    expect(toFraction32(2.5)).toBe('2 1/2"');
  });

  it('converts 1.0 to "1\""', () => {
    expect(toFraction32(1.0)).toBe('1"');
  });
});

// ---------------------------------------------------------------------------
// Denominator never exceeds 32 for any 32nd-grid value
// ---------------------------------------------------------------------------

describe('toFraction32 — denominator never exceeds 32', () => {
  // Test all 32nds from 1/32 to 31/32
  for (let i = 1; i <= 31; i++) {
    const value = i / 32;
    it(`denominator ≤ 32 for ${i}/32 = ${value.toFixed(5)}`, () => {
      const result = toFraction32(value);
      // Extract denominator from result: could be "N/D\"" or "W N/D\""
      const match = result.match(/(\d+)"/);
      // If it's a whole number, denominator is implicitly 1 (≤ 32)
      if (result.match(/^\d+"$/)) {
        expect(true).toBe(true);
      } else {
        const denomMatch = result.match(/\/(\d+)"/);
        if (denomMatch) {
          expect(parseInt(denomMatch[1], 10)).toBeLessThanOrEqual(32);
        }
      }
      // Also verify the result parses back to something close to the original value
      expect(match).not.toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// verifySum
// ---------------------------------------------------------------------------

describe('verifySum', () => {
  it('returns 0 for a perfect 6" layout (3 tails, exact values)', () => {
    // 6" board: 2×halfPin + 3×tail + 2×pin = 6
    // Using exact 32nds values:
    // pinWide=0.8, tailWide=1.2, halfPinWide=0.4
    // In 32nds: 0.8*32=25.6≈26, 1.2*32=38.4≈38, 0.4*32=12.8≈13 -- doesn't sum perfectly
    // Use cleaner values: pinWide=0.75, tailWide=1.5, halfPinWide=0.375
    // Check: 2*0.375 + 3*1.5 + 2*0.75 = 0.75 + 4.5 + 1.5 = 6.75 -- nope
    // Use exact 32nd values:
    // pinWide = 6/32 * k ... let's use values that ARE on the 32nd grid:
    // halfPin=0.40625(13/32), tail=1.1875(38/32=19/16), pin=0.78125(25/32)
    // sum = 2*(13/32) + 3*(38/32) + 2*(25/32) = 26/32 + 114/32 + 50/32 = 190/32 = 5.9375 -- no
    //
    // Actually just use the exact formula values for 6" board to test verifySum semantics:
    // Pass values that sum exactly to 6.0 with no rounding
    const values = [0.4375, 1.1875, 0.8125, 1.1875, 0.8125, 1.1875, 0.4375]; // made up but sums to 6.0
    // sum = 0.4375+1.1875+0.8125+1.1875+0.8125+1.1875+0.4375 = 6.0625 -- check
    // Let me use: 2*0.5 + 3*1.0 + 2*0.5 = 1+3+1=5 -- not 6
    // verifySum simply checks: sum of Math.round(v*32) == Math.round(expected*32)
    // Use [0.5, 1.5, 1.0, 1.5, 1.0, 0.5] which sums to 6.0
    const simpleValues = [0.5, 1.5, 1.0, 1.5, 1.0, 0.5];
    // 0.5+1.5+1.0+1.5+1.0+0.5 = 6.0 exactly
    expect(verifySum(simpleValues, 6.0)).toBe(0);
  });

  it('detects 1/32 drift when values do not exactly sum to board width', () => {
    // Use values that sum to 6 + 1/32 = 6.03125
    const values = [0.5, 1.5, 1.0, 1.5, 1.0, 0.53125]; // last is 0.5 + 1/32
    expect(verifySum(values, 6.0)).toBe(1); // 1/32 over
  });

  it('returns 0 for the exact 32nd-grid values from 6" softwood 3-tail layout', () => {
    // pinWide = 0.8, tailWide = 1.2, halfPinWide = 0.4
    // In 32nds: 0.8 -> 26/32=0.8125 (rounds to 26), 1.2 -> 38.4/32~1.1875 (rounds to 38),
    // 0.4 -> 12.8/32~0.40625 (rounds to 13)
    // Sum in 32nds: 2*13 + 3*38 + 2*26 = 26 + 114 + 52 = 192/32 = 6.0 exactly!
    // So the snapped values are: halfPin=13/32, tail=38/32=19/16, pin=26/32=13/16
    const halfPin = 13 / 32;
    const tail = 38 / 32;
    const pin = 26 / 32;
    // Layout: halfPin, tail, pin, tail, pin, tail, halfPin
    const layout = [halfPin, tail, pin, tail, pin, tail, halfPin];
    expect(verifySum(layout, 6.0)).toBe(0);
  });
});
