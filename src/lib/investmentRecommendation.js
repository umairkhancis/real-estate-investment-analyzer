import Decimal from './decimalConfig.js';

/**
 * Determines investment recommendation based on calculated financial metrics
 * @param {Object} metrics - Financial metrics from calculator
 * @param {Decimal} metrics.npv - Net Present Value in AED
 * @param {Decimal} metrics.irr - Internal Rate of Return as decimal (e.g., 0.08 = 8%)
 * @param {Decimal} metrics.roic - Return on Invested Capital as decimal (e.g., 0.15 = 15%)
 * @param {Decimal} metrics.dscr - Debt Service Coverage Ratio
 * @returns {Object} Recommendation with category, reasoning, and summary
 */
export function determineInvestmentRecommendation(metrics) {
  const npv = metrics.npv.toNumber();
  const irr = metrics.irr.toNumber();
  const roic = metrics.roic.toNumber();
  const dscr = metrics.dscr.toNumber();

  const reasoning = [];
  let recommendation;
  let summary;

  // Evaluate NPV
  if (npv > 0) {
    reasoning.push(`Positive NPV of ${metrics.npv.toFixed(2)} AED indicates the investment creates value`);
  } else {
    reasoning.push(`Negative NPV of ${metrics.npv.toFixed(2)} AED indicates the investment destroys value`);
  }

  // Evaluate IRR (as decimal, e.g., 0.08 = 8%)
  if (irr > 0.08) {
    reasoning.push(`Strong IRR of ${(irr * 100).toFixed(2)}% exceeds typical market returns`);
  } else if (irr > 0.05) {
    reasoning.push(`IRR of ${(irr * 100).toFixed(2)}% is moderate`);
  } else if (irr > 0) {
    reasoning.push(`IRR of ${(irr * 100).toFixed(2)}% is below market expectations`);
  } else {
    reasoning.push(`Negative IRR of ${(irr * 100).toFixed(2)}% indicates poor returns`);
  }

  // Evaluate ROIC (as decimal, e.g., 0.15 = 15%)
  if (roic > 0.15) {
    reasoning.push(`Excellent ROIC of ${(roic * 100).toFixed(2)}% shows strong capital efficiency`);
  } else if (roic > 0.10) {
    reasoning.push(`ROIC of ${(roic * 100).toFixed(2)}% is acceptable`);
  } else if (roic > 0) {
    reasoning.push(`ROIC of ${(roic * 100).toFixed(2)}% is below target threshold`);
  } else {
    reasoning.push(`Negative ROIC of ${(roic * 100).toFixed(2)}% shows capital inefficiency`);
  }

  // Evaluate DSCR
  if (dscr > 1.25) {
    reasoning.push(`Healthy DSCR of ${metrics.dscr.toFixed(2)} provides comfortable debt coverage`);
  } else if (dscr > 1.0) {
    reasoning.push(`DSCR of ${metrics.dscr.toFixed(2)} provides minimal debt coverage`);
  } else {
    reasoning.push(`DSCR of ${metrics.dscr.toFixed(2)} indicates insufficient cash flow to cover debt obligations`);
  }

  // Determine recommendation category (IRR and ROIC are decimals: 0.08 = 8%, 0.15 = 15%)
  if (npv > 0 && irr > 0.08 && roic > 0.15 && dscr > 1.25) {
    recommendation = 'STRONG_BUY';
    summary = 'This property shows excellent financial metrics across all key indicators. Strong value creation potential with robust cash flow coverage.';
  } else if (npv > 0 && irr > 0.05 && roic > 0.10) {
    recommendation = 'BUY';
    summary = 'This property demonstrates solid financial fundamentals. Good investment opportunity with acceptable returns.';
  } else if (npv > 0) {
    recommendation = 'MARGINAL';
    summary = 'This property creates some value but returns are below optimal thresholds. Consider negotiating a better price or terms.';
  } else {
    recommendation = 'DONT_BUY';
    summary = 'This property does not meet minimum financial viability criteria. The investment is likely to destroy value.';
  }

  return {
    recommendation,
    summary,
    reasoning,
    metrics: {
      npv: npv,
      irr: irr,
      roic: roic,
      dscr: dscr,
    }
  };
}
