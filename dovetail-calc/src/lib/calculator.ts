/**
 * Dovetail geometry calculation engine.
 *
 * Pure functions — no DOM, no side effects, no string formatting.
 * The calculator returns raw decimal-inch measurements.
 * All display rounding is handled by formatter.ts (separation of concerns).
 *
 * Requirements: CALC-01 through CALC-07, INP-05
 */

import {
  DovetailInput,
  DovetailResult,
  MIN_PIN_WIDTH_INCHES,
} from '../types/dovetail';

/**
 * Suggest a pin count (number of tails) for a given board width.
 *
 * Rules:
 * - boardWidth < 2"  → 1 tail  (very narrow: single centre tail)
 * - boardWidth < 3"  → 2 tails (2–3" range)
 * - boardWidth < 6"  → Math.max(2, Math.round(boardWidth / 1.5))
 * - boardWidth ≥ 6"  → Math.max(3, Math.round(boardWidth / 2))
 *
 * Satisfies: CALC-01, INP-05
 *
 * @param boardWidth - Board width in decimal inches
 * @returns Recommended number of tails (always ≥ 1)
 */
export function suggestPinCount(boardWidth: number): number {
  if (boardWidth < 2) return 1;
  if (boardWidth < 3) return 2;
  if (boardWidth < 6) return Math.max(2, Math.round(boardWidth / 1.5));
  return Math.max(3, Math.round(boardWidth / 2));
}

/**
 * Calculate dovetail joint geometry from board dimensions.
 *
 * Layout pattern: [half-pin] [tail] [pin] ... [tail] [half-pin]
 * For pinCount tails: 2 half-pins + pinCount tails + (pinCount-1) interior pins.
 *
 * Width distribution uses a 3:2 tail-to-pin face ratio:
 *   tailWide = 1.5 × pinWide
 *   boardWidth = pinCount × (tailWide + pinWide) = pinCount × 2.5 × pinWide
 *   → pinWide = boardWidth / (pinCount × 2.5)
 *   → tailWide = boardWidth / pinCount − pinWide
 *
 * Narrowest-point pin widths (at the baseline):
 *   angle     = Math.atan(1/ratio)            — NEVER hardcode degrees (CALC-06)
 *   pinNarrow = pinWide − 2 × tailDepth × tan(angle)
 *   halfNarrow = halfPinWide − tailDepth × tan(angle)
 *
 * The result fields `pinWidth` and `halfPinWidth` are the narrowest-point values,
 * matching woodworking convention (pin width is quoted at the narrow/baseline end).
 *
 * Satisfies: CALC-01 through CALC-07, INP-05
 *
 * @param input - Board dimensions and ratio
 * @returns Dovetail geometry result with all measurements in decimal inches
 */
export function calculateDovetail(input: DovetailInput): DovetailResult {
  const { boardWidth, boardThickness, ratio } = input;

  // Resolve pin count — user override takes priority (INP-05)
  const pinCount = input.pinCount ?? suggestPinCount(boardWidth);

  // Angle is always derived from ratio — never hardcoded (CALC-06)
  const angle = Math.atan(1 / ratio);
  const tanAngle = Math.tan(angle); // equals exactly 1/ratio (Math.tan(Math.atan(x)) = x)

  // Tail depth equals board thickness (CALC-05)
  const tailDepth = boardThickness;

  // Distribute board width using 3:2 tail-to-pin-face ratio
  const pinWide = boardWidth / (pinCount * 2.5);
  const tailWide = boardWidth / pinCount - pinWide;
  const halfPinWide = pinWide / 2;

  // Narrowest-point widths at the baseline (CALC-03, CALC-04)
  const pinNarrow = pinWide - 2 * tailDepth * tanAngle;
  const halfPinNarrow = halfPinWide - tailDepth * tanAngle;

  return {
    pinCount,
    tailWidth: tailWide,
    pinWidth: pinNarrow,
    halfPinWidth: halfPinNarrow,
    tailDepth,
    angle,
    // Warn when narrowest pin is below structural minimum (CALC-07)
    pinWidthWarning: pinNarrow < MIN_PIN_WIDTH_INCHES,
  };
}
