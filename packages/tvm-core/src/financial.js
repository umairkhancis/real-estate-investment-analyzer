/**
 * Financial Functions Library (Decimal.js Version)
 *
 * Pure financial calculation functions following Excel formulas with arbitrary precision.
 * All functions use Decimal.js to eliminate floating-point arithmetic errors.
 *
 * IMPORTANT: All functions now return Decimal objects, not JavaScript Numbers.
 * Convert to Number using .toNumber() at display/UI boundaries only.
 *
 * Single Responsibility: Only financial mathematics, no domain logic.
 */

import Decimal from './decimalConfig.js';
import { ZERO, ONE } from './decimalConfig.js';

/**
 * Calculate PMT (Equated Monthly/Annual Installment)
 * Excel PMT function equivalent with exact precision
 *
 * @param {number|string|Decimal} rate - Interest rate per period
 * @param {number|string|Decimal} nper - Total number of payment periods
 * @param {number|string|Decimal} pv - Present value (loan amount)
 * @returns {Decimal} Payment amount per period as Decimal object
 *
 * @example
 * PMT(0.04/12, 300, 637500)  // Returns Decimal representing monthly payment
 */
export function PMT(rate, nper, pv) {
  const rateDecimal = new Decimal(rate);
  const nperDecimal = new Decimal(nper);
  const pvDecimal = new Decimal(pv);

  // Special case: zero interest rate
  if (rateDecimal.isZero()) {
    return pvDecimal.neg().div(nperDecimal);
  }

  // PMT formula: rate / (pvif - 1) * -(pv * pvif)
  // where pvif = (1 + rate)^nper
  const pvif = ONE.plus(rateDecimal).pow(nperDecimal);
  const payment = rateDecimal
    .div(pvif.minus(ONE))
    .times(pvDecimal.neg().times(pvif));

  return payment;
}

/**
 * Calculate NPV using Excel's NPV function behavior
 * Excel NPV discounts from period 1 (not period 0)
 *
 * @param {number|string|Decimal} rate - Discount rate
 * @param {Array<number>} futureCashFlows - Array of future cash flows (starting from year 1)
 * @returns {Decimal} Net Present Value of future cash flows as Decimal object
 *
 * @example
 * NPV_Excel(0.04, [1000, 1000, 1000])  // Returns Decimal representing NPV
 */
export function NPV_Excel(rate, futureCashFlows) {
  const rateDecimal = new Decimal(rate);
  let npv = ZERO;

  for (let i = 0; i < futureCashFlows.length; i++) {
    const cashFlow = new Decimal(futureCashFlows[i]);
    const discountFactor = ONE.plus(rateDecimal).pow(i + 1);
    npv = npv.plus(cashFlow.div(discountFactor));
  }

  return npv;
}

/**
 * Calculate Internal Rate of Return using Newton-Raphson method
 * Uses Decimal.js for stable convergence and precise results
 *
 * @param {Array<number>} cashFlows - Complete cash flow array (including period 0)
 * @param {number|string|Decimal} guess - Initial guess for IRR (default 0.1 = 10%)
 * @returns {Decimal} Internal Rate of Return as Decimal (e.g., Decimal(0.08) = 8%)
 *
 * @example
 * IRR([-100000, 20000, 30000, 40000, 50000])  // Returns Decimal representing IRR
 */
export function IRR(cashFlows, guess = 0.1) {
  const maxIterations = 100;
  const tolerance = new Decimal('0.000001'); // 6 decimal places precision

  let rate = new Decimal(guess);

  for (let i = 0; i < maxIterations; i++) {
    let npv = ZERO;
    let dnpv = ZERO;

    // Calculate NPV and its derivative
    for (let j = 0; j < cashFlows.length; j++) {
      const cashFlow = new Decimal(cashFlows[j]);
      const discountFactor = ONE.plus(rate).pow(j);

      // NPV: sum of CF_j / (1 + rate)^j
      npv = npv.plus(cashFlow.div(discountFactor));

      // Derivative of NPV: sum of -j * CF_j / (1 + rate)^(j+1)
      if (j > 0) {
        const derivativeTerm = cashFlow
          .times(-j)
          .div(ONE.plus(rate).pow(j + 1));
        dnpv = dnpv.plus(derivativeTerm);
      }
    }

    // Newton-Raphson: new_rate = rate - NPV / dNPV
    if (dnpv.isZero()) {
      break; // Avoid division by zero
    }

    const newRate = rate.minus(npv.div(dnpv));

    // Check convergence
    if (newRate.minus(rate).abs().lessThan(tolerance)) {
      return newRate;
    }

    rate = newRate;
  }

  return rate;
}

/**
 * Calculate Present Value with exact precision
 *
 * @param {number|string|Decimal} futureValue - Future value amount
 * @param {number|string|Decimal} rate - Discount rate
 * @param {number|string|Decimal} periods - Number of periods
 * @returns {Decimal} Present value as Decimal object
 *
 * @example
 * PV(1000000, 0.04, 25)  // Returns Decimal representing PV
 */
export function PV(futureValue, rate, periods) {
  const futureValueDecimal = new Decimal(futureValue);
  const rateDecimal = new Decimal(rate);
  const periodsDecimal = new Decimal(periods);

  const discountFactor = ONE.plus(rateDecimal).pow(periodsDecimal);
  return futureValueDecimal.div(discountFactor);
}

/**
 * Calculate Future Value with exact precision
 *
 * @param {number|string|Decimal} presentValue - Present value amount
 * @param {number|string|Decimal} rate - Growth/discount rate
 * @param {number|string|Decimal} periods - Number of periods
 * @returns {Decimal} Future value as Decimal object
 *
 * @example
 * FV(100000, 0.04, 25)  // Returns Decimal representing FV
 */
export function FV(presentValue, rate, periods) {
  const presentValueDecimal = new Decimal(presentValue);
  const rateDecimal = new Decimal(rate);
  const periodsDecimal = new Decimal(periods);

  const growthFactor = ONE.plus(rateDecimal).pow(periodsDecimal);
  return presentValueDecimal.times(growthFactor);
}

/**
 * Calculate Debt Service Coverage Ratio with exact precision
 *
 * @param {number|string|Decimal} netOperatingIncome - Annual net operating income
 * @param {number|string|Decimal} annualDebtService - Annual debt service (loan payments)
 * @returns {Decimal} DSCR ratio as Decimal object
 *
 * @example
 * calculateDSCR(50000, 40000)  // Returns Decimal(1.25)
 */
export function calculateDSCR(netOperatingIncome, annualDebtService) {
  const noiDecimal = new Decimal(netOperatingIncome);
  const adsDecimal = new Decimal(annualDebtService);

  if (adsDecimal.isZero()) {
    return ZERO;
  }

  return noiDecimal.div(adsDecimal);
}

/**
 * Calculate Return on Invested Capital with exact precision
 *
 * @param {number|string|Decimal} totalReturn - Total return value
 * @param {number|string|Decimal} investedCapital - Initial invested capital
 * @returns {Decimal} ROIC as Decimal (e.g., Decimal(0.25) = 25%)
 *
 * @example
 * calculateROIC(125000, 100000)  // Returns Decimal(0.25) = 25% ROIC
 */
export function calculateROIC(totalReturn, investedCapital) {
  const totalReturnDecimal = new Decimal(totalReturn);
  const investedCapitalDecimal = new Decimal(investedCapital);

  if (investedCapitalDecimal.isZero()) {
    return ZERO;
  }

  return totalReturnDecimal.div(investedCapitalDecimal).minus(ONE);
}
