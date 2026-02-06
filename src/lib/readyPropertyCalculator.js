/**
 * Ready Property Calculator - Business Logic (Decimal.js Version)
 *
 * Calculates investment metrics for ready properties with mortgage financing.
 * All calculations now use Decimal.js for exact precision.
 *
 * IMPORTANT: All functions now return Decimal objects for numerical values.
 * Convert to Number using .toNumber() at display/UI boundaries only.
 *
 * Single Responsibility: Ready property investment calculations
 * Dependencies: Only financial functions (Dependency Inversion Principle)
 */

import { PMT, NPV_Excel, IRR, PV, calculateDSCR, calculateROIC } from './financial.js';
import Decimal from './decimalConfig.js';
import { ZERO } from './decimalConfig.js';
import { determineInvestmentRecommendation } from './investmentRecommendation.js';

/**
 * Calculate rental metrics with exact precision
 *
 * @param {Object} params
 * @param {number|Decimal} params.totalValue - Total property value
 * @param {number|Decimal} params.propertySize - Property size in sq ft
 * @param {number|Decimal} params.rentalROI - Rental ROI as decimal (e.g., 0.07 = 7%)
 * @param {number|Decimal} params.serviceChargesPerSqFt - Annual service charges per sq ft
 * @returns {Object} Rental metrics (all Decimal values)
 */
export function calculateRentalMetrics({ totalValue, propertySize, rentalROI, serviceChargesPerSqFt }) {
  const totalValueDecimal = new Decimal(totalValue);
  const propertySizeDecimal = new Decimal(propertySize);
  const rentalROIDecimal = new Decimal(rentalROI);
  const serviceChargesDecimal = new Decimal(serviceChargesPerSqFt);

  const annualRental = totalValueDecimal.times(rentalROIDecimal);
  const annualServiceCharges = serviceChargesDecimal.times(propertySizeDecimal);
  const netOperatingIncome = annualRental.minus(annualServiceCharges);

  return {
    annualRental,
    annualServiceCharges,
    netOperatingIncome,
    monthlyRental: annualRental.div(12),
    monthlyServiceCharges: annualServiceCharges.div(12),
    netMonthlyIncome: netOperatingIncome.div(12)
  };
}

/**
 * Calculate investment costs with exact precision
 *
 * @param {Object} params
 * @param {number|Decimal} params.totalValue - Total property value
 * @param {number|Decimal} params.downPaymentPercent - Down payment as decimal (e.g., 0.25 = 25%)
 * @param {number|Decimal} params.registrationFeePercent - Registration fee as decimal (e.g., 0.04 = 4%)
 * @param {number|Decimal} params.agentCommissionPercent - Agent commission as decimal (default 0.02 = 2%)
 * @returns {Object} Investment costs (all Decimal values)
 */
export function calculateInvestmentCosts({
  totalValue,
  downPaymentPercent,
  registrationFeePercent,
  agentCommissionPercent = 0.02
}) {
  const totalValueDecimal = new Decimal(totalValue);
  const downPaymentPctDecimal = new Decimal(downPaymentPercent);
  const registrationFeePctDecimal = new Decimal(registrationFeePercent);
  const agentCommissionPctDecimal = new Decimal(agentCommissionPercent);

  const downPaymentAmt = totalValueDecimal.times(downPaymentPctDecimal);
  const registrationFee = totalValueDecimal.times(registrationFeePctDecimal);
  const agentFee = totalValueDecimal.times(agentCommissionPctDecimal);
  const investedCapital = downPaymentAmt.plus(registrationFee).plus(agentFee);
  const financingAmount = totalValueDecimal.times(
    new Decimal(1).minus(downPaymentPctDecimal)
  );

  return {
    downPaymentAmt,
    registrationFee,
    agentFee,
    investedCapital,
    financingAmount
  };
}

/**
 * Calculate mortgage metrics with exact precision
 *
 * @param {Object} params
 * @param {number|Decimal} params.financingAmount - Amount to finance
 * @param {number|Decimal} params.discountRate - Annual discount rate as decimal
 * @param {number|Decimal} params.tenure - Loan tenure in years
 * @returns {Object} Mortgage metrics (all Decimal values)
 */
export function calculateMortgageMetrics({ financingAmount, discountRate, tenure }) {
  const financingAmountDecimal = new Decimal(financingAmount);
  const discountRateDecimal = new Decimal(discountRate);
  const tenureDecimal = new Decimal(tenure);

  // PMT now returns Decimal
  const monthlyEMI = PMT(
    discountRateDecimal.div(12),
    tenureDecimal.times(12),
    financingAmountDecimal.neg()
  );

  const annualDebtService = monthlyEMI.times(12);
  const totalMortgagePayment = monthlyEMI.times(tenureDecimal).times(12);
  const totalInterestPaid = totalMortgagePayment.minus(financingAmountDecimal);

  return {
    monthlyEMI,
    annualDebtService,
    totalMortgagePayment,
    totalInterestPaid
  };
}

/**
 * Calculate DCF and NPV metrics with exact precision
 *
 * @param {Object} params
 * @param {number|Decimal} params.netAnnualCashFlow - Net annual cash flow
 * @param {number|Decimal} params.exitValue - Expected exit value (nominal)
 * @param {number|Decimal} params.discountRate - Annual discount rate as decimal
 * @param {number|Decimal} params.investedCapital - Total invested capital
 * @param {number|Decimal} params.tenure - Investment tenure in years
 * @param {number} params.npvYears - Years to use for NPV calculation (default 20)
 * @returns {Object} DCF and NPV metrics (all Decimal values)
 */
export function calculateDCFMetrics({
  netAnnualCashFlow,
  exitValue,
  discountRate,
  investedCapital,
  tenure,
  npvYears = 20
}) {
  const netAnnualCashFlowDecimal = new Decimal(netAnnualCashFlow);
  const exitValueDecimal = new Decimal(exitValue);
  const discountRateDecimal = new Decimal(discountRate);
  const investedCapitalDecimal = new Decimal(investedCapital);
  const tenureDecimal = new Decimal(tenure);

  // Terminal value discounted to present (PV returns Decimal)
  const terminalValuePV = PV(exitValueDecimal, discountRateDecimal, tenureDecimal);

  // Future cash flows for NPV calculation (convert Decimal to Number for array)
  const futureCashFlows = Array(npvYears).fill(netAnnualCashFlowDecimal.toNumber());

  // NPV_Excel returns Decimal
  const npvFuture = NPV_Excel(discountRateDecimal, futureCashFlows);
  const dcf = npvFuture.plus(terminalValuePV);
  const npv = investedCapitalDecimal.neg().plus(dcf);

  // IRR calculation
  const cashFlowsIRR = [
    -investedCapitalDecimal.toNumber(),
    ...Array(npvYears).fill(netAnnualCashFlowDecimal.toNumber()),
    terminalValuePV.toNumber()
  ];
  const irr = IRR(cashFlowsIRR); // Returns Decimal

  // ROIC (returns Decimal)
  const roic = calculateROIC(dcf, investedCapitalDecimal);

  return {
    terminalValueFV: exitValueDecimal,
    terminalValuePV,
    dcf,
    npv,
    irr,
    roic
  };
}

/**
 * Generate cash flow array for visualization
 *
 * @param {Object} params
 * @param {number|Decimal} params.investedCapital - Initial investment (negative)
 * @param {number|Decimal} params.netAnnualCashFlow - Annual cash flow
 * @param {number|Decimal} params.exitValue - Exit value (nominal)
 * @param {number|Decimal} params.tenure - Investment tenure in years
 * @returns {Array<number>} Cash flow array (as Numbers for visualization)
 */
export function generateCashFlows({ investedCapital, netAnnualCashFlow, exitValue, tenure }) {
  const investedCapitalDecimal = new Decimal(investedCapital);
  const netAnnualCashFlowDecimal = new Decimal(netAnnualCashFlow);
  const exitValueDecimal = new Decimal(exitValue);
  const tenureNum = Number(tenure);

  const cashFlows = [-investedCapitalDecimal.toNumber()];

  for (let i = 1; i < tenureNum; i++) {
    cashFlows.push(netAnnualCashFlowDecimal.toNumber());
  }

  // Final year includes both cash flow and exit value
  const finalYearCashFlow = netAnnualCashFlowDecimal.plus(exitValueDecimal);
  cashFlows.push(finalYearCashFlow.toNumber());

  return cashFlows;
}

/**
 * Calculate complete ready property investment analysis
 * Main entry point for ready property calculations
 *
 * @param {Object} inputs - Investment parameters
 * @param {number} inputs.propertySize - Property size in square feet
 * @param {number} inputs.totalValue - Total property value/price
 * @param {number} inputs.downPaymentPercent - Down payment as percentage (e.g., 25 for 25%)
 * @param {number} inputs.registrationFeePercent - Registration fee as percentage (e.g., 4 for 4%)
 * @param {number} inputs.tenure - Loan tenure in years
 * @param {number} inputs.discountRate - Annual discount rate as percentage (e.g., 6 for 6%)
 * @param {number} inputs.rentalROI - Rental ROI as percentage (e.g., 7 for 7%)
 * @param {number} inputs.serviceChargesPerSqFt - Annual service charges per square foot
 * @param {number} inputs.exitValue - Expected property sale price at exit (nominal/future value)
 *
 * @returns {Object} Complete investment analysis results (most values are Decimal objects)
 */
export function calculateReadyPropertyInvestment(inputs) {
  // Convert percentages to decimals using Decimal for exact precision
  const downPaymentPct = new Decimal(inputs.downPaymentPercent).div(100);
  const registrationFeePct = new Decimal(inputs.registrationFeePercent).div(100);
  const discountRate = new Decimal(inputs.discountRate).div(100);
  const rentalROI = new Decimal(inputs.rentalROI).div(100);

  const {
    propertySize,
    totalValue,
    tenure,
    serviceChargesPerSqFt,
    exitValue
  } = inputs;

  // Calculate all metrics using focused functions
  const totalValueDecimal = new Decimal(totalValue);
  const propertySizeDecimal = new Decimal(propertySize);
  const pricePerSqFt = totalValueDecimal.div(propertySizeDecimal);

  const costs = calculateInvestmentCosts({
    totalValue,
    downPaymentPercent: downPaymentPct,
    registrationFeePercent: registrationFeePct
  });

  const rental = calculateRentalMetrics({
    totalValue,
    propertySize,
    rentalROI,
    serviceChargesPerSqFt
  });

  const mortgage = calculateMortgageMetrics({
    financingAmount: costs.financingAmount,
    discountRate,
    tenure
  });

  const netAnnualCashFlow = rental.netOperatingIncome.minus(mortgage.annualDebtService);
  const netMonthlyCashFlow = netAnnualCashFlow.div(12);

  const dcfMetrics = calculateDCFMetrics({
    netAnnualCashFlow,
    exitValue,
    discountRate,
    investedCapital: costs.investedCapital,
    tenure
  });

  const dscr = calculateDSCR(rental.netOperatingIncome, mortgage.annualDebtService);

  const cashFlows = generateCashFlows({
    investedCapital: costs.investedCapital,
    netAnnualCashFlow,
    exitValue,
    tenure
  });

  // Determine investment recommendation based on calculated metrics
  const recommendation = determineInvestmentRecommendation({
    npv: dcfMetrics.npv,
    irr: dcfMetrics.irr,
    roic: dcfMetrics.roic,
    dscr
  });

  // Return comprehensive results (most values are Decimal objects)
  return {
    // Basic metrics
    pricePerSqFt,

    // Investment costs (all Decimal)
    ...costs,

    // Rental metrics (all Decimal)
    ...rental,

    // Mortgage metrics (all Decimal)
    ...mortgage,

    // Cash flows (Decimal)
    netAnnualCashFlow,
    netMonthlyCashFlow,

    // DCF metrics (all Decimal)
    ...dcfMetrics,

    // Performance metrics (Decimal)
    dscr,

    // Investment recommendation (from business logic)
    recommendation,

    // Visualization (Array of Numbers)
    cashFlows,

    // Metadata
    exitYear: tenure,
    discountRate
  };
}
