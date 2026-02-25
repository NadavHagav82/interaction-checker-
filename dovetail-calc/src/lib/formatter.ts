/**
 * Imperial fraction formatter with 1/32" grid snap.
 *
 * Pure functions — no DOM, no side effects.
 * Converts decimal-inch measurements to human-readable imperial fraction strings.
 *
 * Key invariant: ALL values must be snapped to the nearest 1/32" BEFORE any
 * fraction conversion. This eliminates floating-point noise that would cause
 * fraction.js to produce grotesque denominators (e.g. 0.43750000000000006 → 7/16
 * not 78125/178571 or similar).
 *
 * PITFALL: fraction.js v5.x properties (n, d, s) are BigInt — use Number() to
 * convert them to ordinary numbers before arithmetic or comparison.
 */

import Fraction from 'fraction.js';

/** Finest grid we display — 1/32 inch */
const GRID = 32;

/**
 * Snap a decimal-inch value to the nearest 1/32" grid.
 *
 * This MUST be called before any fraction conversion to eliminate float noise.
 * Example: Math.round(0.43750000000000006 * 32) / 32 = Math.round(14.000...) / 32 = 14/32 = 0.4375
 *
 * @param decimalInches - Value in decimal inches
 * @returns Value snapped to nearest 1/32"
 */
export function snapTo32nds(decimalInches: number): number {
  return Math.round(decimalInches * GRID) / GRID;
}

/**
 * Convert a decimal-inch value to an imperial fraction string.
 *
 * Always snaps to nearest 1/32" first. The denominator never exceeds 32
 * because the input is pre-snapped to the 32nd grid before fraction.js reduces it.
 *
 * Output format:
 * - Whole number:   `3"`
 * - Fraction only:  `7/16"`
 * - Mixed number:   `1 3/4"`
 *
 * @param decimalInches - Value in decimal inches (raw float OK — snap happens internally)
 * @returns Formatted imperial fraction string with inch mark
 */
export function toFraction32(decimalInches: number): string {
  // Snap first to eliminate float noise (PITFALLS.md pitfall #5)
  const snapped = snapTo32nds(decimalInches);

  const f = new Fraction(snapped);

  // fraction.js v5 uses BigInt for n/d/s — convert to Number for arithmetic
  const sign = Number(f.s);
  const numerator = sign * Number(f.n);   // full numerator (may be larger than denominator)
  const denominator = Number(f.d);

  const wholeAbs = Math.floor(Math.abs(numerator) / denominator);
  const remNum = Math.abs(numerator) - wholeAbs * denominator;

  if (remNum === 0) {
    // Pure whole number (e.g. 3.0 → "3\"")
    return `${wholeAbs}"`;
  }

  if (wholeAbs === 0) {
    // Pure fraction (e.g. 0.4375 → "7/16\"")
    return `${remNum}/${denominator}"`;
  }

  // Mixed number (e.g. 1.75 → "1 3/4\"")
  return `${wholeAbs} ${remNum}/${denominator}"`;
}

/**
 * Verify that a set of displayed measurements sum to the expected board width.
 *
 * Each value is rounded to the nearest 32nd independently, then the integer
 * 32nd counts are summed and compared to the expected value (also in 32nds).
 *
 * Returns 0 when the displayed measurements sum exactly to the board width.
 * Returns ±N for N/32" of drift.
 *
 * @param values   - Array of decimal-inch measurements (layout values)
 * @param expected - Expected total in decimal inches (board width)
 * @returns Rounding error in 32nds (0 means no drift)
 */
export function verifySum(values: number[], expected: number): number {
  const sumOf32nds = values.reduce((acc, v) => acc + Math.round(v * GRID), 0);
  const expected32nds = Math.round(expected * GRID);
  return sumOf32nds - expected32nds;
}
