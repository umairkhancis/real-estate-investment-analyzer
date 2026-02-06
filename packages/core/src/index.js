/**
 * Real Estate Investment Calculator - Core SDK
 *
 * A comprehensive toolkit for real estate investment analysis including:
 * - Ready property calculations (mortgage, DCF, NPV, IRR)
 * - Off-plan property calculations (developer payment plans)
 * - Financial utilities (NPV, IRR, DSCR, etc.)
 *
 * @module @real-estate-calc/core
 */

import { calculatorService } from './realEstateCalculatorService.js';
import * as financial from './financial.js';
import { calculateReadyPropertyInvestment } from './readyPropertyCalculator.js';
import { calculateOffplanInvestment, calculateMortgageContinuation } from './offplanCalculator.js';
import Decimal from './decimalConfig.js';

/**
 * Main Calculator Class - Provides a clean API for all calculations
 */
export class RealEstateCalculator {
  /**
   * Calculate ready property investment metrics
   *
   * @param {Object} inputs - Investment parameters
   * @param {number} inputs.propertySize - Property size in sq ft
   * @param {number} inputs.totalValue - Total property value
   * @param {number} inputs.downPaymentPercent - Down payment percentage (e.g., 25 for 25%)
   * @param {number} inputs.registrationFeePercent - Registration fee percentage (e.g., 4 for 4%)
   * @param {number} inputs.tenure - Loan tenure in years
   * @param {number} inputs.discountRate - Annual discount rate percentage (e.g., 4 for 4%)
   * @param {number} inputs.rentalROI - Rental ROI percentage (e.g., 6 for 6%)
   * @param {number} inputs.serviceChargesPerSqFt - Service charges per sq ft
   * @param {number} inputs.exitValue - Expected exit value (sale price)
   * @returns {Object} Calculation results including NPV, IRR, DCF, DSCR, ROIC, cash flows
   */
  calculateReadyProperty(inputs) {
    return calculatorService.calculateReadyProperty(inputs);
  }

  /**
   * Calculate off-plan investment metrics
   *
   * @param {Object} inputs - Investment parameters
   * @param {number} inputs.size - Property size in sq ft
   * @param {number} inputs.totalValue - Total property value
   * @param {number} inputs.downPaymentPercent - Down payment percentage
   * @param {number} inputs.installmentPercent - Installment payment percentage
   * @param {number} inputs.paymentFrequencyMonths - Payment frequency in months (1, 3, 6, 12)
   * @param {number} inputs.constructionTenureYears - Construction period in years
   * @param {number} inputs.handoverPaymentPercent - Handover payment percentage
   * @param {number} inputs.expectedValue - Expected value at handover
   * @param {number} inputs.discountRate - Annual discount rate percentage
   * @returns {Object} Calculation results including NPV, IRR, DCF, ROIC, payment schedule
   */
  calculateOffplan(inputs) {
    return calculatorService.calculateOffplan(inputs);
  }

  /**
   * Calculate off-plan investment with mortgage continuation option
   *
   * @param {Object} offplanInputs - Off-plan investment parameters
   * @param {Object} mortgageInputs - Mortgage continuation parameters
   * @returns {Object} Complete analysis with exit vs continuation scenarios
   */
  calculateOffplanWithMortgage(offplanInputs, mortgageInputs) {
    return calculatorService.calculateOffplanWithMortgage(offplanInputs, mortgageInputs);
  }
}

/**
 * Convenience function - Calculate ready property
 * @param {Object} inputs - Investment parameters
 * @returns {Object} Calculation results
 */
export function calculateReadyProperty(inputs) {
  return calculatorService.calculateReadyProperty(inputs);
}

/**
 * Convenience function - Calculate off-plan property
 * @param {Object} inputs - Investment parameters
 * @returns {Object} Calculation results
 */
export function calculateOffplan(inputs) {
  return calculatorService.calculateOffplan(inputs);
}

/**
 * Convenience function - Calculate off-plan with mortgage
 * @param {Object} offplanInputs - Off-plan investment parameters
 * @param {Object} mortgageInputs - Mortgage continuation parameters
 * @returns {Object} Complete analysis
 */
export function calculateOffplanWithMortgage(offplanInputs, mortgageInputs) {
  return calculatorService.calculateOffplanWithMortgage(offplanInputs, mortgageInputs);
}

// Export financial utilities
export const Financial = {
  /**
   * Calculate Net Present Value
   * @param {number} rate - Discount rate (decimal, e.g., 0.04 for 4%)
   * @param {Array<number>} cashFlows - Array of cash flows
   * @returns {number} NPV value
   */
  NPV: financial.NPV,

  /**
   * Calculate Internal Rate of Return
   * @param {Array<number>} cashFlows - Array of cash flows
   * @param {number} [guess=0.1] - Initial guess for IRR
   * @returns {number} IRR value (decimal, e.g., 0.08 for 8%)
   */
  IRR: financial.IRR,

  /**
   * Calculate Periodic Payment (PMT)
   * @param {number} rate - Interest rate per period
   * @param {number} nper - Number of periods
   * @param {number} pv - Present value
   * @returns {number} Payment amount
   */
  PMT: financial.PMT,

  /**
   * Calculate Future Value
   * @param {number} rate - Interest rate per period
   * @param {number} nper - Number of periods
   * @param {number} pmt - Payment per period
   * @param {number} pv - Present value
   * @returns {number} Future value
   */
  FV: financial.FV,

  /**
   * Calculate Present Value
   * @param {number} rate - Interest rate per period
   * @param {number} nper - Number of periods
   * @param {number} pmt - Payment per period
   * @returns {number} Present value
   */
  PV: financial.PV
};

// Export raw calculation functions for advanced users
export {
  calculateReadyPropertyInvestment,
  calculateOffplanInvestment,
  calculateMortgageContinuation,
  calculatorService,
  Decimal
};

// Default export
export default RealEstateCalculator;
