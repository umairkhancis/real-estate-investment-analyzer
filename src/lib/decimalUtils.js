/**
 * Decimal Conversion Utilities
 *
 * Helper functions for converting between JavaScript Numbers and Decimal objects.
 * These utilities ensure consistent type handling throughout the application.
 */

import Decimal from './decimalConfig.js';

/**
 * Convert a value to Decimal
 *
 * @param {number|string|Decimal} value - Value to convert
 * @returns {Decimal} Decimal object
 *
 * @example
 * toDecimal(0.1)           // Decimal(0.1)
 * toDecimal('0.1')         // Decimal(0.1)
 * toDecimal(new Decimal(0.1)) // Decimal(0.1)
 */
export function toDecimal(value) {
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(value);
}

/**
 * Convert a Decimal to JavaScript Number
 *
 * @param {Decimal|number} decimalValue - Decimal object to convert
 * @returns {number} JavaScript Number
 *
 * @example
 * const d = new Decimal('0.1');
 * toNumber(d)  // 0.1 (JavaScript number)
 */
export function toNumber(decimalValue) {
  if (decimalValue instanceof Decimal) {
    return decimalValue.toNumber();
  }
  return Number(decimalValue);
}

/**
 * Ensure a value is a Decimal (type guard)
 *
 * @param {number|string|Decimal} value - Value to check
 * @returns {Decimal} Decimal object
 * @throws {TypeError} If value cannot be converted to Decimal
 *
 * @example
 * ensureDecimal(123)       // Decimal(123)
 * ensureDecimal('invalid') // Throws TypeError
 */
export function ensureDecimal(value) {
  try {
    return toDecimal(value);
  } catch (error) {
    throw new TypeError(`Cannot convert value to Decimal: ${value}`);
  }
}

/**
 * Convert an array of values to Decimals
 *
 * @param {Array<number|string|Decimal>} values - Array of values to convert
 * @returns {Array<Decimal>} Array of Decimal objects
 *
 * @example
 * createDecimalArray([1, 2, 3])  // [Decimal(1), Decimal(2), Decimal(3)]
 */
export function createDecimalArray(values) {
  return values.map(toDecimal);
}

/**
 * Convert an array of Decimals to Numbers
 *
 * @param {Array<Decimal|number>} decimals - Array of Decimals to convert
 * @returns {Array<number>} Array of JavaScript Numbers
 *
 * @example
 * const decimals = [new Decimal(1), new Decimal(2)];
 * toNumberArray(decimals)  // [1, 2]
 */
export function toNumberArray(decimals) {
  return decimals.map(toNumber);
}

/**
 * Convert percentage to decimal (divide by 100)
 *
 * @param {number|string|Decimal} percentage - Percentage value (e.g., 4 for 4%)
 * @returns {Decimal} Decimal representation (e.g., Decimal(0.04))
 *
 * @example
 * percentageToDecimal(4)   // Decimal(0.04)
 * percentageToDecimal('4') // Decimal(0.04)
 */
export function percentageToDecimal(percentage) {
  const percentDecimal = toDecimal(percentage);
  return percentDecimal.div(100);
}

/**
 * Convert decimal to percentage (multiply by 100)
 *
 * @param {Decimal|number} decimal - Decimal value (e.g., 0.04)
 * @returns {Decimal} Percentage as Decimal (e.g., Decimal(4))
 *
 * @example
 * decimalToPercentage(new Decimal(0.04))  // Decimal(4)
 */
export function decimalToPercentage(decimal) {
  const decimalValue = toDecimal(decimal);
  return decimalValue.times(100);
}

/**
 * Round a Decimal to specified decimal places
 *
 * @param {Decimal|number} value - Value to round
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {Decimal} Rounded Decimal
 *
 * @example
 * roundToDecimalPlaces(new Decimal('3.14159'), 2)  // Decimal(3.14)
 */
export function roundToDecimalPlaces(value, decimalPlaces) {
  const decimalValue = toDecimal(value);
  return decimalValue.toDecimalPlaces(decimalPlaces);
}

/**
 * Check if a Decimal is zero
 *
 * @param {Decimal|number} value - Value to check
 * @returns {boolean} True if value is zero
 *
 * @example
 * isZero(new Decimal(0))   // true
 * isZero(new Decimal(0.1)) // false
 */
export function isZero(value) {
  const decimalValue = toDecimal(value);
  return decimalValue.isZero();
}

/**
 * Check if a Decimal is negative
 *
 * @param {Decimal|number} value - Value to check
 * @returns {boolean} True if value is negative
 *
 * @example
 * isNegative(new Decimal(-1))  // true
 * isNegative(new Decimal(1))   // false
 */
export function isNegative(value) {
  const decimalValue = toDecimal(value);
  return decimalValue.isNegative();
}

/**
 * Check if a Decimal is positive
 *
 * @param {Decimal|number} value - Value to check
 * @returns {boolean} True if value is positive
 *
 * @example
 * isPositive(new Decimal(1))   // true
 * isPositive(new Decimal(-1))  // false
 */
export function isPositive(value) {
  const decimalValue = toDecimal(value);
  return decimalValue.isPositive();
}
