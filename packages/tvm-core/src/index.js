/**
 * Time Value of Money (TVM) Calculator - Core SDK
 *
 * A comprehensive toolkit for financial calculations including:
 * - Net Present Value (NPV)
 * - Internal Rate of Return (IRR)
 * - Future Value (FV)
 * - Present Value (PV)
 * - Payment (PMT)
 * - Number of Periods (NPER)
 * - Interest Rate (RATE)
 *
 * Domain-agnostic financial utilities that can be used for:
 * - Investment analysis
 * - Loan calculations
 * - Retirement planning
 * - Project valuation
 * - Any time value of money calculations
 *
 * @module @tvm-calc/core
 */

import * as financial from './tvmFunctions.js';
import Decimal from './decimalConfig.js';

/**
 * Time Value of Money Calculator Class
 * Provides a clean API for all TVM calculations
 */
export class TVMCalculator {
  /**
   * Calculate Net Present Value
   *
   * @param {number} rate - Discount rate per period (as decimal, e.g., 0.1 for 10%)
   * @param {Array<number>} cashFlows - Array of cash flows (negative for outflows, positive for inflows)
   * @returns {number} Net Present Value
   *
   * @example
   * const npv = calculator.npv(0.1, [-1000, 300, 300, 300, 300]);
   * console.log(npv); // 52.89
   */
  npv(rate, cashFlows) {
    return financial.NPV(rate, cashFlows);
  }

  /**
   * Calculate Internal Rate of Return
   *
   * @param {Array<number>} cashFlows - Array of cash flows (must have at least one negative and one positive)
   * @param {number} [guess=0.1] - Initial guess for IRR
   * @returns {number} Internal Rate of Return (as decimal, e.g., 0.12 for 12%)
   *
   * @example
   * const irr = calculator.irr([-1000, 300, 300, 300, 300]);
   * console.log((irr * 100).toFixed(2) + '%'); // 7.71%
   */
  irr(cashFlows, guess = 0.1) {
    return financial.IRR(cashFlows, guess);
  }

  /**
   * Calculate Future Value
   *
   * @param {number} rate - Interest rate per period
   * @param {number} nper - Number of periods
   * @param {number} pmt - Payment per period
   * @param {number} [pv=0] - Present value (default 0)
   * @param {number} [type=0] - When payments are due (0 = end of period, 1 = beginning)
   * @returns {number} Future Value
   *
   * @example
   * // How much will $1000/month grow to in 10 years at 6% annual rate?
   * const fv = calculator.fv(0.06/12, 10*12, -1000, 0);
   * console.log(fv); // $163,879.35
   */
  fv(rate, nper, pmt, pv = 0, type = 0) {
    return financial.FV(rate, nper, pmt, pv, type);
  }

  /**
   * Calculate Present Value
   *
   * @param {number} rate - Interest rate per period
   * @param {number} nper - Number of periods
   * @param {number} pmt - Payment per period
   * @param {number} [fv=0] - Future value (default 0)
   * @param {number} [type=0] - When payments are due (0 = end of period, 1 = beginning)
   * @returns {number} Present Value
   *
   * @example
   * // What's the present value of $1000/month for 10 years at 6%?
   * const pv = calculator.pv(0.06/12, 10*12, 1000);
   * console.log(pv); // -$90,073.45
   */
  pv(rate, nper, pmt, fv = 0, type = 0) {
    return financial.PV(rate, nper, pmt, fv, type);
  }

  /**
   * Calculate Payment
   *
   * @param {number} rate - Interest rate per period
   * @param {number} nper - Number of periods
   * @param {number} pv - Present value (loan amount)
   * @param {number} [fv=0] - Future value (default 0)
   * @param {number} [type=0] - When payments are due (0 = end of period, 1 = beginning)
   * @returns {number} Payment amount
   *
   * @example
   * // Monthly payment on $100,000 loan at 4% for 30 years
   * const pmt = calculator.pmt(0.04/12, 30*12, -100000);
   * console.log(pmt); // $477.42
   */
  pmt(rate, nper, pv, fv = 0, type = 0) {
    return financial.PMT(rate, nper, pv, fv, type);
  }

  /**
   * Calculate Number of Periods
   *
   * @param {number} rate - Interest rate per period
   * @param {number} pmt - Payment per period
   * @param {number} pv - Present value
   * @param {number} [fv=0] - Future value (default 0)
   * @param {number} [type=0] - When payments are due (0 = end of period, 1 = beginning)
   * @returns {number} Number of periods
   *
   * @example
   * // How many months to pay off $10,000 at $500/month with 1% monthly interest?
   * const nper = calculator.nper(0.01, 500, -10000);
   * console.log(nper); // 21.97 months
   */
  nper(rate, pmt, pv, fv = 0, type = 0) {
    return financial.NPER(rate, pmt, pv, fv, type);
  }

  /**
   * Calculate Interest Rate
   *
   * @param {number} nper - Number of periods
   * @param {number} pmt - Payment per period
   * @param {number} pv - Present value
   * @param {number} [fv=0] - Future value (default 0)
   * @param {number} [type=0] - When payments are due (0 = end of period, 1 = beginning)
   * @param {number} [guess=0.1] - Initial guess for rate
   * @returns {number} Interest rate per period
   *
   * @example
   * // What interest rate on a $10,000 loan with $500/month payment for 24 months?
   * const rate = calculator.rate(24, 500, -10000);
   * console.log((rate * 100).toFixed(2) + '%'); // 2.92% per month
   */
  rate(nper, pmt, pv, fv = 0, type = 0, guess = 0.1) {
    return financial.RATE(nper, pmt, pv, fv, type, guess);
  }

  /**
   * Calculate Effect (Effective Annual Rate)
   *
   * @param {number} nominalRate - Nominal annual interest rate
   * @param {number} npery - Number of compounding periods per year
   * @returns {number} Effective annual rate
   *
   * @example
   * // 12% nominal rate compounded monthly
   * const effectiveRate = calculator.effect(0.12, 12);
   * console.log((effectiveRate * 100).toFixed(2) + '%'); // 12.68%
   */
  effect(nominalRate, npery) {
    return financial.EFFECT(nominalRate, npery);
  }

  /**
   * Calculate Nominal Rate
   *
   * @param {number} effectiveRate - Effective annual interest rate
   * @param {number} npery - Number of compounding periods per year
   * @returns {number} Nominal annual rate
   *
   * @example
   * // What nominal rate gives 12.68% effective rate with monthly compounding?
   * const nominalRate = calculator.nominal(0.1268, 12);
   * console.log((nominalRate * 100).toFixed(2) + '%'); // 12.00%
   */
  nominal(effectiveRate, npery) {
    return financial.NOMINAL(effectiveRate, npery);
  }
}

// Export convenience functions (functional API)
export const npv = financial.NPV;
export const irr = financial.IRR;
export const fv = financial.FV;
export const pv = financial.PV;
export const pmt = financial.PMT;
export const nper = financial.NPER;
export const rate = financial.RATE;
export const effect = financial.EFFECT;
export const nominal = financial.NOMINAL;

// Export Decimal for advanced users
export { Decimal };

// Export all financial functions as a namespace
export const TVM = {
  NPV: financial.NPV,
  IRR: financial.IRR,
  FV: financial.FV,
  PV: financial.PV,
  PMT: financial.PMT,
  NPER: financial.NPER,
  RATE: financial.RATE,
  EFFECT: financial.EFFECT,
  NOMINAL: financial.NOMINAL
};

// Default export
export default TVMCalculator;
