import Decimal from './decimalConfig.js';

/**
 * Determines investment recommendation for off-plan properties based on calculated financial metrics
 *
 * Off-plan properties are evaluated differently from ready properties:
 * - Focus on NPV, IRR, and ROIC
 * - No DSCR evaluation (no rental income during construction)
 * - Higher risk tolerance due to longer time horizon
 *
 * @param {Object} metrics - Financial metrics from off-plan calculator
 * @param {Decimal} metrics.npv - Net Present Value in AED
 * @param {Decimal} metrics.irr - Internal Rate of Return as decimal (e.g., 0.08 = 8%)
 * @param {Decimal} metrics.roic - Return on Invested Capital as decimal (e.g., 0.15 = 15%)
 * @returns {Object} Recommendation with category, reasoning, and summary
 */
export function determineOffplanRecommendation(metrics) {
  const npv = metrics.npv.toNumber();
  const irr = metrics.irr.toNumber();
  const roic = metrics.roic.toNumber();

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
  // Off-plan typically has higher IRR thresholds due to construction risk
  if (irr > 0.12) {
    reasoning.push(`Excellent IRR of ${(irr * 100).toFixed(2)}% justifies construction phase risk`);
  } else if (irr > 0.08) {
    reasoning.push(`IRR of ${(irr * 100).toFixed(2)}% is solid for off-plan investment`);
  } else if (irr > 0) {
    reasoning.push(`IRR of ${(irr * 100).toFixed(2)}% is below expectations for off-plan risk profile`);
  } else {
    reasoning.push(`Negative IRR of ${(irr * 100).toFixed(2)}% indicates poor returns`);
  }

  // Evaluate ROIC (as decimal, e.g., 0.15 = 15%)
  // Off-plan ROIC is typically higher due to leveraged developer payment plans
  if (roic > 0.25) {
    reasoning.push(`Outstanding ROIC of ${(roic * 100).toFixed(2)}% shows exceptional capital efficiency from developer payment plan`);
  } else if (roic > 0.15) {
    reasoning.push(`Strong ROIC of ${(roic * 100).toFixed(2)}% demonstrates good leverage of developer financing`);
  } else if (roic > 0) {
    reasoning.push(`ROIC of ${(roic * 100).toFixed(2)}% is modest for off-plan investment`);
  } else {
    reasoning.push(`Negative ROIC of ${(roic * 100).toFixed(2)}% shows capital inefficiency`);
  }

  // Determine recommendation category (IRR and ROIC are decimals: 0.12 = 12%, 0.25 = 25%)
  // Off-plan thresholds are higher than ready properties due to construction risk and time horizon
  if (npv > 0 && irr > 0.12 && roic > 0.25) {
    recommendation = 'STRONG_BUY';
    summary = 'This off-plan property shows exceptional metrics that justify the construction phase risk. Outstanding returns with excellent capital efficiency from developer payment plan.';
  } else if (npv > 0 && irr > 0.08 && roic > 0.15) {
    recommendation = 'BUY';
    summary = 'This off-plan property demonstrates solid fundamentals. Good investment opportunity with acceptable risk-adjusted returns during construction phase.';
  } else if (npv > 0) {
    recommendation = 'MARGINAL';
    summary = 'This off-plan property creates some value but returns may not adequately compensate for construction risk and time horizon. Consider negotiating better payment terms or waiting for ready property alternatives.';
  } else {
    recommendation = 'DONT_BUY';
    summary = 'This off-plan property does not meet minimum financial viability criteria. The investment is likely to destroy value and the construction risk is not justified.';
  }

  return {
    recommendation,
    summary,
    reasoning,
    metrics: {
      npv: npv,
      irr: irr,
      roic: roic,
    }
  };
}
