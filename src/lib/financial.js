/**
 * Financial Functions Library
 *
 * Pure financial calculation functions following Excel formulas.
 * These functions are completely independent and reusable across all calculators.
 *
 * Single Responsibility: Only financial mathematics, no domain logic.
 */

/**
 * Calculate PMT (Equated Monthly/Annual Installment)
 * Excel PMT function equivalent
 *
 * @param {number} rate - Interest rate per period
 * @param {number} nper - Total number of payment periods
 * @param {number} pv - Present value (loan amount)
 * @returns {number} Payment amount per period
 */
export function PMT(rate, nper, pv) {
  if (rate === 0) {
    return -pv / nper;
  }
  const pvif = Math.pow(1 + rate, nper);
  return rate / (pvif - 1) * -(pv * pvif);
}

/**
 * Calculate NPV using Excel's NPV function behavior
 * Excel NPV discounts from period 1 (not period 0)
 *
 * @param {number} rate - Discount rate
 * @param {Array<number>} futureCashFlows - Array of future cash flows (starting from year 1)
 * @returns {number} Net Present Value of future cash flows
 */
export function NPV_Excel(rate, futureCashFlows) {
  let npv = 0;
  for (let i = 0; i < futureCashFlows.length; i++) {
    npv += futureCashFlows[i] / Math.pow(1 + rate, i + 1);
  }
  return npv;
}

/**
 * Calculate Internal Rate of Return using Newton-Raphson method
 *
 * @param {Array<number>} cashFlows - Complete cash flow array (including period 0)
 * @param {number} guess - Initial guess for IRR (default 0.1 = 10%)
 * @returns {number} Internal Rate of Return as decimal (e.g., 0.08 = 8%)
 */
export function IRR(cashFlows, guess = 0.1) {
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + guess, j);
      dnpv += -j * cashFlows[j] / Math.pow(1 + guess, j + 1);
    }

    const newGuess = guess - npv / dnpv;

    if (Math.abs(newGuess - guess) < tolerance) {
      return newGuess;
    }

    guess = newGuess;
  }

  return guess;
}

/**
 * Calculate Present Value
 *
 * @param {number} futureValue - Future value amount
 * @param {number} rate - Discount rate
 * @param {number} periods - Number of periods
 * @returns {number} Present value
 */
export function PV(futureValue, rate, periods) {
  return futureValue / Math.pow(1 + rate, periods);
}

/**
 * Calculate Future Value
 *
 * @param {number} presentValue - Present value amount
 * @param {number} rate - Growth/discount rate
 * @param {number} periods - Number of periods
 * @returns {number} Future value
 */
export function FV(presentValue, rate, periods) {
  return presentValue * Math.pow(1 + rate, periods);
}

/**
 * Calculate Debt Service Coverage Ratio
 *
 * @param {number} netOperatingIncome - Annual net operating income
 * @param {number} annualDebtService - Annual debt service (loan payments)
 * @returns {number} DSCR ratio
 */
export function calculateDSCR(netOperatingIncome, annualDebtService) {
  if (annualDebtService === 0) return 0;
  return netOperatingIncome / annualDebtService;
}

/**
 * Calculate Return on Invested Capital
 *
 * @param {number} totalReturn - Total return value
 * @param {number} investedCapital - Initial invested capital
 * @returns {number} ROIC as decimal (e.g., 0.25 = 25%)
 */
export function calculateROIC(totalReturn, investedCapital) {
  if (investedCapital === 0) return 0;
  return (totalReturn / investedCapital) - 1;
}
