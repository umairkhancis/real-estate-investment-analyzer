/**
 * Complete TVM Functions
 * Provides all standard Time Value of Money calculations
 */

import { PMT as PMT_Original, NPV_Excel, IRR as IRR_Original } from './financial.js';
import Decimal from './decimalConfig.js';

// Re-export existing functions
export { PMT, IRR } from './financial.js';

// Standard NPV function
export function NPV(rate, cashFlows) {
  if (cashFlows.length === 0) return 0;

  const initialInvestment = cashFlows[0];
  const futureCashFlows = cashFlows.slice(1);

  if (futureCashFlows.length === 0) return initialInvestment;

  const npvFuture = NPV_Excel(rate, futureCashFlows);
  return initialInvestment + (npvFuture?.toNumber ? npvFuture.toNumber() : npvFuture);
}

// Standard PV function
export function PV(rate, nper, pmt, fv = 0, type = 0) {
  if (rate === 0) {
    return -(pmt * nper + fv);
  }

  const pvPmt = pmt * ((Math.pow(1 + rate, nper) - 1) / (rate * Math.pow(1 + rate, nper)));
  const pvFv = fv / Math.pow(1 + rate, nper);
  let pv = -(pvPmt + pvFv);

  if (type === 1) {
    pv *= (1 + rate);
  }

  return pv;
}

// Standard FV function
export function FV(rate, nper, pmt, pv = 0, type = 0) {
  if (rate === 0) {
    return -(pv + pmt * nper);
  }

  const fvPv = -pv * Math.pow(1 + rate, nper);
  const fvPmt = pmt * ((Math.pow(1 + rate, nper) - 1) / rate);

  let fv = fvPv + fvPmt;

  if (type === 1) {
    fv *= (1 + rate);
  }

  return fv;
}

// NPER function
export function NPER(rate, pmt, pv, fv = 0, type = 0) {
  if (rate === 0) {
    return -(pv + fv) / pmt;
  }

  let adjustedPmt = pmt;
  if (type === 1) {
    adjustedPmt = pmt / (1 + rate);
  }

  const numerator = adjustedPmt - fv * rate;
  const denominator = pv * rate + adjustedPmt;

  return Math.log(numerator / denominator) / Math.log(1 + rate);
}

// RATE function
export function RATE(nper, pmt, pv, fv = 0, type = 0, guess = 0.1) {
  let rate = guess;
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    const f = PV(rate, nper, pmt, fv, type) + pv;

    if (Math.abs(f) < tolerance) {
      return rate;
    }

    const delta = rate * 0.0001;
    const f1 = PV(rate + delta, nper, pmt, fv, type) + pv;
    const derivative = (f1 - f) / delta;

    if (Math.abs(derivative) < tolerance) {
      break;
    }

    rate = rate - f / derivative;

    if (rate < -1 || rate > 10) {
      return guess;
    }
  }

  return rate;
}

// EFFECT function
export function EFFECT(nominalRate, npery) {
  return Math.pow(1 + nominalRate / npery, npery) - 1;
}

// NOMINAL function
export function NOMINAL(effectiveRate, npery) {
  return npery * (Math.pow(1 + effectiveRate, 1 / npery) - 1);
}
