/**
 * Decimal.js Configuration for Financial Calculations
 *
 * Configures Decimal.js with optimal settings for real estate financial calculations.
 * This ensures consistent precision across all financial operations and prevents
 * floating-point arithmetic errors.
 *
 * Key Configuration:
 * - Precision: 28 significant digits (vs default 20)
 * - Rounding: ROUND_HALF_UP (matches Excel behavior)
 *
 * Why 28 digits?
 * - Financial calculations typically need 8-12 decimal places
 * - 28 provides safety margin for iterative calculations (IRR convergence)
 * - Accommodates currency values up to 10^20 (far exceeds real estate values)
 * - Still maintains excellent performance
 */

import Decimal from 'decimal.js';

// Configure Decimal.js with precision settings for financial calculations
Decimal.set({
  // Precision: Maximum number of significant digits
  precision: 28,

  // Rounding mode: ROUND_HALF_UP (0.5 rounds up)
  // This matches Excel's default rounding behavior
  rounding: Decimal.ROUND_HALF_UP,

  // Exponential notation format
  toExpNeg: -7,   // Use exponential notation for values < 1e-7
  toExpPos: 21,   // Use exponential notation for values >= 1e+21

  // Maximum/minimum exponent limits
  maxE: 9e15,     // Maximum exponent
  minE: -9e15,    // Minimum exponent

  // Modulo mode for remainder operation
  modulo: Decimal.ROUND_EUCLIDEAN
});

/**
 * Export configured Decimal class
 * All financial modules should import from this file, not from 'decimal.js' directly
 */
export default Decimal;

/**
 * Export common Decimal constants for convenience
 */
export const ZERO = new Decimal(0);
export const ONE = new Decimal(1);
export const HUNDRED = new Decimal(100);
