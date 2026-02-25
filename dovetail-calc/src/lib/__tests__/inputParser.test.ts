import { describe, it, expect } from 'vitest';
import { parseImperialFraction, ParseError, isValidMeasurement } from '../inputParser';

describe('parseImperialFraction', () => {
  describe('space-separated mixed number', () => {
    it('parses "1 3/4" to 1.75', () => {
      expect(parseImperialFraction('1 3/4')).toBe(1.75);
    });

    it('parses "6 3/4" to 6.75', () => {
      expect(parseImperialFraction('6 3/4')).toBe(6.75);
    });

    it('parses "2 1/2" to 2.5', () => {
      expect(parseImperialFraction('2 1/2')).toBe(2.5);
    });
  });

  describe('hyphen-separated mixed number', () => {
    it('parses "1-3/4" to 1.75', () => {
      expect(parseImperialFraction('1-3/4')).toBe(1.75);
    });

    it('parses "6-3/4" to 6.75', () => {
      expect(parseImperialFraction('6-3/4')).toBe(6.75);
    });

    it('parses "2-1/2" to 2.5', () => {
      expect(parseImperialFraction('2-1/2')).toBe(2.5);
    });
  });

  describe('fraction only', () => {
    it('parses "3/4" to 0.75', () => {
      expect(parseImperialFraction('3/4')).toBe(0.75);
    });

    it('parses "1/2" to 0.5', () => {
      expect(parseImperialFraction('1/2')).toBe(0.5);
    });

    it('parses "1/8" to 0.125', () => {
      expect(parseImperialFraction('1/8')).toBe(0.125);
    });
  });

  describe('decimal', () => {
    it('parses "0.75" to 0.75', () => {
      expect(parseImperialFraction('0.75')).toBe(0.75);
    });

    it('parses "0.5" to 0.5', () => {
      expect(parseImperialFraction('0.5')).toBe(0.5);
    });

    it('parses "6.25" to 6.25', () => {
      expect(parseImperialFraction('6.25')).toBe(6.25);
    });
  });

  describe('integer', () => {
    it('parses "3" to 3', () => {
      expect(parseImperialFraction('3')).toBe(3);
    });

    it('parses "6" to 6', () => {
      expect(parseImperialFraction('6')).toBe(6);
    });

    it('parses "0" to 0', () => {
      expect(parseImperialFraction('0')).toBe(0);
    });
  });

  describe('whitespace handling', () => {
    it('trims leading and trailing whitespace: "  1 3/4  " -> 1.75', () => {
      expect(parseImperialFraction('  1 3/4  ')).toBe(1.75);
    });

    it('handles extra internal whitespace: "1  3/4" -> 1.75', () => {
      expect(parseImperialFraction('1  3/4')).toBe(1.75);
    });

    it('trims whitespace from decimal: "  0.75  " -> 0.75', () => {
      expect(parseImperialFraction('  0.75  ')).toBe(0.75);
    });

    it('trims whitespace from integer: "  3  " -> 3', () => {
      expect(parseImperialFraction('  3  ')).toBe(3);
    });
  });

  describe('rejection cases — must throw ParseError', () => {
    it('throws for empty string ""', () => {
      expect(() => parseImperialFraction('')).toThrow(ParseError);
    });

    it('throws for non-numeric "abc"', () => {
      expect(() => parseImperialFraction('abc')).toThrow(ParseError);
    });

    it('throws for zero denominator "1/0"', () => {
      expect(() => parseImperialFraction('1/0')).toThrow(ParseError);
    });

    it('throws for trailing text "6 3/4 inches"', () => {
      expect(() => parseImperialFraction('6 3/4 inches')).toThrow(ParseError);
    });

    it('throws for multiple numbers without fraction "1 2 3"', () => {
      expect(() => parseImperialFraction('1 2 3')).toThrow(ParseError);
    });

    it('throws for mixed valid and text "6abc"', () => {
      expect(() => parseImperialFraction('6abc')).toThrow(ParseError);
    });
  });
});

describe('ParseError', () => {
  it('has name property equal to "ParseError"', () => {
    try {
      parseImperialFraction('abc');
    } catch (err) {
      expect((err as ParseError).name).toBe('ParseError');
    }
  });

  it('message includes the invalid input string', () => {
    try {
      parseImperialFraction('abc');
    } catch (err) {
      expect((err as ParseError).message).toContain('abc');
    }
  });

  it('is an instance of Error', () => {
    try {
      parseImperialFraction('bad-input');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('is an instance of ParseError', () => {
    try {
      parseImperialFraction('bad-input');
    } catch (err) {
      expect(err).toBeInstanceOf(ParseError);
    }
  });
});

describe('isValidMeasurement', () => {
  it('returns true for positive decimal 3.5', () => {
    expect(isValidMeasurement(3.5)).toBe(true);
  });

  it('returns true for positive decimal 0.25', () => {
    expect(isValidMeasurement(0.25)).toBe(true);
  });

  it('returns true for positive integer 6', () => {
    expect(isValidMeasurement(6)).toBe(true);
  });

  it('returns false for zero', () => {
    expect(isValidMeasurement(0)).toBe(false);
  });

  it('returns false for negative -1', () => {
    expect(isValidMeasurement(-1)).toBe(false);
  });

  it('returns false for NaN', () => {
    expect(isValidMeasurement(NaN)).toBe(false);
  });

  it('returns false for Infinity', () => {
    expect(isValidMeasurement(Infinity)).toBe(false);
  });

  it('returns false for negative Infinity', () => {
    expect(isValidMeasurement(-Infinity)).toBe(false);
  });
});
