/**
 * Imperial fraction input parser for the dovetail calculator.
 *
 * Accepts 5 measurement formats typed by users:
 *   - "1 3/4"  → 1.75  (space-separated mixed number)
 *   - "1-3/4"  → 1.75  (hyphen-separated mixed number)
 *   - "3/4"    → 0.75  (fraction only)
 *   - "0.75"   → 0.75  (decimal)
 *   - "3"      → 3.0   (integer)
 *
 * Security: no eval() is used anywhere in this module.
 * All regexes are anchored with ^ and $ to prevent partial matches.
 *
 * Requirements: INP-01, INP-02
 */

/**
 * Custom error thrown when an input string cannot be parsed as an imperial measurement.
 * name === 'ParseError' for programmatic error-type detection.
 */
export class ParseError extends Error {
  constructor(input: string, reason?: string) {
    const detail = reason ? `: ${reason}` : '';
    super(`Cannot parse measurement "${input}"${detail}`);
    this.name = 'ParseError';
    // Maintains proper prototype chain in transpiled ES5 environments
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

/**
 * Matches a mixed number with either a space or hyphen separator.
 * Examples: "1 3/4", "1-3/4", "6 3/4", "1  3/4" (extra spaces OK)
 * Groups: [1]=whole, [2]=numerator, [3]=denominator
 *
 * CRITICAL: anchored with ^ and $ to prevent "6 3/4 inches" from matching.
 */
const MIXED_NUMBER_RE = /^\s*(\d+)\s*[-\s]\s*(\d+)\s*\/\s*(\d+)\s*$/;

/**
 * Matches a fraction without a whole number.
 * Examples: "3/4", "1/8", "1/2"
 * Groups: [1]=numerator, [2]=denominator
 *
 * CRITICAL: anchored with ^ and $ to prevent partial matches.
 */
const FRACTION_ONLY_RE = /^\s*(\d+)\s*\/\s*(\d+)\s*$/;

/**
 * Matches a plain integer or decimal number.
 * Examples: "3", "0.75", "6.25"
 * Groups: [1]=full numeric string
 *
 * CRITICAL: anchored with ^ and $ to prevent "6abc" from matching.
 */
const DECIMAL_RE = /^\s*(\d+\.?\d*)\s*$/;

/**
 * Parses an imperial measurement string into a decimal number.
 *
 * Accepts 5 formats: mixed number (space or hyphen), fraction only, decimal, integer.
 * Trims leading/trailing whitespace and tolerates extra internal whitespace.
 *
 * @param input - The user-typed measurement string
 * @returns Decimal representation in inches
 * @throws {ParseError} If the input does not match any accepted format or has zero denominator
 */
export function parseImperialFraction(input: string): number {
  // Check for empty/whitespace-only input before regex matching
  if (input.trim() === '') {
    throw new ParseError(input, 'empty input');
  }

  // Try mixed number: "1 3/4" or "1-3/4"
  const mixedMatch = MIXED_NUMBER_RE.exec(input);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    if (den === 0) {
      throw new ParseError(input, 'zero denominator');
    }
    return whole + num / den;
  }

  // Try fraction only: "3/4"
  const fracMatch = FRACTION_ONLY_RE.exec(input);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    if (den === 0) {
      throw new ParseError(input, 'zero denominator');
    }
    return num / den;
  }

  // Try decimal or integer: "0.75" or "3"
  const decimalMatch = DECIMAL_RE.exec(input);
  if (decimalMatch) {
    return parseFloat(decimalMatch[1]);
  }

  // No format matched
  throw new ParseError(input, 'unrecognized format');
}

/**
 * Validates that a parsed measurement value is usable as a board dimension.
 *
 * A valid measurement must be:
 * - Finite (not NaN or Infinity)
 * - Strictly positive (zero and negative are not valid dimensions)
 *
 * Note: parseImperialFraction("0") returns 0 (valid parse) but isValidMeasurement(0) is false.
 *
 * @param value - The numeric value to validate
 * @returns true if the value is a finite positive number
 */
export function isValidMeasurement(value: number): boolean {
  return isFinite(value) && value > 0;
}
