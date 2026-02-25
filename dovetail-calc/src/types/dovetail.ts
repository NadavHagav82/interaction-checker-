/**
 * Shared TypeScript interfaces and constants for the dovetail calculator.
 *
 * Units: all measurements are decimal inches unless stated otherwise.
 * Angles: all angles are radians derived from Math.atan(1/ratio).
 *
 * Requirements addressed:
 * - INP-03: ratio field accepts hardwood/softwood selection via SOFTWOOD_RATIO/HARDWOOD_RATIO
 * - INP-04: ratio field accepts user override (any positive numeric value)
 * - CALC-06: angle is always Math.atan(1/ratio), never a hardcoded degree value
 */

/** 1:8 dovetail slope for softwood — atan(1/8) = 7.125° */
export const SOFTWOOD_RATIO = 8;

/** 1:6 dovetail slope for hardwood — atan(1/6) = 9.46° */
export const HARDWOOD_RATIO = 6;

/**
 * Structural minimum pin width at the narrowest point (baseline).
 * Below this threshold, the pin is too weak for a durable joint.
 * Value: 3/16" = 0.1875 inches.
 * Source: Fine Woodworking, Paul Sellers, Axminster Tools — consistent across sources.
 */
export const MIN_PIN_WIDTH_INCHES = 3 / 16;

/**
 * Input parameters for the dovetail calculator.
 * All measurements in decimal inches.
 */
export interface DovetailInput {
  /** Board width in decimal inches (e.g., 6.0 for a 6" board, 6.75 for 6 3/4") */
  boardWidth: number;

  /** Board thickness in decimal inches (e.g., 0.75 for standard 3/4" stock) */
  boardThickness: number;

  /**
   * Dovetail slope ratio — the "N" in the 1:N slope convention.
   * Use SOFTWOOD_RATIO (8) for softwood, HARDWOOD_RATIO (6) for hardwood.
   * Accepts user override for any positive numeric value (INP-04).
   * Angle is computed as Math.atan(1/ratio) — never hardcode degrees (CALC-06).
   */
  ratio: number;

  /**
   * Number of tails (optional).
   * If omitted, the calculator calls suggestPinCount(boardWidth) to choose automatically.
   * Accepts user override (INP-05).
   */
  pinCount?: number;
}

/**
 * Output from the dovetail calculator.
 * All measurements are raw decimal inches — no rounding applied.
 * The formatter (src/lib/formatter.ts) handles display rounding to nearest 1/32".
 */
export interface DovetailResult {
  /** Number of tails in the layout */
  pinCount: number;

  /**
   * Width of each tail at the face (widest point), in decimal inches.
   * This is the measurement marked on the board face for laying out tails.
   */
  tailWidth: number;

  /**
   * Width of each interior pin at its narrowest point (baseline), in decimal inches.
   * Derived from: pinWide - 2 * tailDepth * tan(atan(1/ratio))
   * Compare against MIN_PIN_WIDTH_INCHES to check structural validity.
   */
  pinWidth: number;

  /**
   * Width of each edge half-pin at its narrowest point (baseline), in decimal inches.
   * Woodworking convention: half-pins appear at both edges of the board.
   * Derived from: halfPinWide - tailDepth * tan(atan(1/ratio))
   */
  halfPinWidth: number;

  /**
   * Tail depth in decimal inches.
   * Equals boardThickness — the tails cut to the full thickness of the mating board.
   */
  tailDepth: number;

  /**
   * Dovetail slope angle in radians.
   * Always derived as Math.atan(1/ratio) — never a hardcoded degree value (CALC-06).
   * For softwood (1:8): ~0.12435 rad = 7.125°
   * For hardwood (1:6): ~0.16514 rad = 9.46°
   */
  angle: number;

  /**
   * True when pinWidth (narrowest point) is below MIN_PIN_WIDTH_INCHES (3/16").
   * A true value indicates the joint may be structurally weak.
   * The caller should warn the user and suggest reducing pin count.
   */
  pinWidthWarning: boolean;
}
