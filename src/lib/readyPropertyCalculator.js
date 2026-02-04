/**
 * Ready Property Calculator - Business Logic
 *
 * Calculates investment metrics for ready properties with mortgage financing.
 * Completely decoupled from UI/DOM - pure business logic only.
 *
 * Single Responsibility: Ready property investment calculations
 * Dependencies: Only financial functions (Dependency Inversion Principle)
 */

import { PMT, NPV_Excel, IRR, PV, calculateDSCR, calculateROIC } from './financial.js';

/**
 * Calculate rental metrics
 *
 * @param {Object} params
 * @param {number} params.totalValue - Total property value
 * @param {number} params.propertySize - Property size in sq ft
 * @param {number} params.rentalROI - Rental ROI as decimal (e.g., 0.07 = 7%)
 * @param {number} params.serviceChargesPerSqFt - Annual service charges per sq ft
 * @returns {Object} Rental metrics
 */
export function calculateRentalMetrics({ totalValue, propertySize, rentalROI, serviceChargesPerSqFt }) {
  const annualRental = totalValue * rentalROI;
  const annualServiceCharges = serviceChargesPerSqFt * propertySize;
  const netOperatingIncome = annualRental - annualServiceCharges;

  return {
    annualRental,
    annualServiceCharges,
    netOperatingIncome,
    monthlyRental: annualRental / 12,
    monthlyServiceCharges: annualServiceCharges / 12,
    netMonthlyIncome: netOperatingIncome / 12
  };
}

/**
 * Calculate investment costs
 *
 * @param {Object} params
 * @param {number} params.totalValue - Total property value
 * @param {number} params.downPaymentPercent - Down payment as decimal (e.g., 0.25 = 25%)
 * @param {number} params.registrationFeePercent - Registration fee as decimal (e.g., 0.04 = 4%)
 * @param {number} params.agentCommissionPercent - Agent commission as decimal (default 0.02 = 2%)
 * @returns {Object} Investment costs
 */
export function calculateInvestmentCosts({
  totalValue,
  downPaymentPercent,
  registrationFeePercent,
  agentCommissionPercent = 0.02
}) {
  const downPaymentAmt = totalValue * downPaymentPercent;
  const registrationFee = totalValue * registrationFeePercent;
  const agentFee = totalValue * agentCommissionPercent;
  const investedCapital = downPaymentAmt + registrationFee + agentFee;
  const financingAmount = totalValue * (1 - downPaymentPercent);

  return {
    downPaymentAmt,
    registrationFee,
    agentFee,
    investedCapital,
    financingAmount
  };
}

/**
 * Calculate mortgage metrics
 *
 * @param {Object} params
 * @param {number} params.financingAmount - Amount to finance
 * @param {number} params.discountRate - Annual discount rate as decimal
 * @param {number} params.tenure - Loan tenure in years
 * @returns {Object} Mortgage metrics
 */
export function calculateMortgageMetrics({ financingAmount, discountRate, tenure }) {
  const monthlyEMI = PMT(discountRate / 12, tenure * 12, -financingAmount);
  const annualDebtService = monthlyEMI * 12;
  const totalMortgagePayment = monthlyEMI * tenure * 12;
  const totalInterestPaid = totalMortgagePayment - financingAmount;

  return {
    monthlyEMI,
    annualDebtService,
    totalMortgagePayment,
    totalInterestPaid
  };
}

/**
 * Calculate DCF and NPV metrics
 *
 * @param {Object} params
 * @param {number} params.netAnnualCashFlow - Net annual cash flow
 * @param {number} params.exitValue - Expected exit value (nominal)
 * @param {number} params.discountRate - Annual discount rate as decimal
 * @param {number} params.investedCapital - Total invested capital
 * @param {number} params.tenure - Investment tenure in years
 * @param {number} params.npvYears - Years to use for NPV calculation (default 20)
 * @returns {Object} DCF and NPV metrics
 */
export function calculateDCFMetrics({
  netAnnualCashFlow,
  exitValue,
  discountRate,
  investedCapital,
  tenure,
  npvYears = 20
}) {
  // Terminal value discounted to present
  const terminalValuePV = PV(exitValue, discountRate, tenure);

  // Future cash flows for NPV calculation
  const futureCashFlows = Array(npvYears).fill(netAnnualCashFlow);

  const npvFuture = NPV_Excel(discountRate, futureCashFlows);
  const dcf = npvFuture + terminalValuePV;
  const npv = -investedCapital + dcf;

  // IRR calculation
  const cashFlowsIRR = [-investedCapital, ...Array(npvYears).fill(netAnnualCashFlow), terminalValuePV];
  const irr = IRR(cashFlowsIRR);

  // ROIC
  const roic = calculateROIC(dcf, investedCapital);

  return {
    terminalValueFV: exitValue,
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
 * @param {number} params.investedCapital - Initial investment (negative)
 * @param {number} params.netAnnualCashFlow - Annual cash flow
 * @param {number} params.exitValue - Exit value (nominal)
 * @param {number} params.tenure - Investment tenure in years
 * @returns {Array<number>} Cash flow array
 */
export function generateCashFlows({ investedCapital, netAnnualCashFlow, exitValue, tenure }) {
  const cashFlows = [-investedCapital];
  for (let i = 1; i < tenure; i++) {
    cashFlows.push(netAnnualCashFlow);
  }
  // Final year includes both cash flow and exit value
  cashFlows.push(netAnnualCashFlow + exitValue);
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
 * @returns {Object} Complete investment analysis results
 */
export function calculateReadyPropertyInvestment(inputs) {
  // Convert percentages to decimals
  const downPaymentPct = inputs.downPaymentPercent / 100;
  const registrationFeePct = inputs.registrationFeePercent / 100;
  const discountRate = inputs.discountRate / 100;
  const rentalROI = inputs.rentalROI / 100;

  const {
    propertySize,
    totalValue,
    tenure,
    serviceChargesPerSqFt,
    exitValue
  } = inputs;

  // Calculate all metrics using focused functions
  const pricePerSqFt = totalValue / propertySize;

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

  const netAnnualCashFlow = rental.netOperatingIncome - mortgage.annualDebtService;
  const netMonthlyCashFlow = netAnnualCashFlow / 12;

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

  // Return comprehensive results
  return {
    // Basic metrics
    pricePerSqFt,

    // Investment costs
    ...costs,

    // Rental metrics
    ...rental,

    // Mortgage metrics
    ...mortgage,

    // Cash flows
    netAnnualCashFlow,
    netMonthlyCashFlow,

    // DCF metrics
    ...dcfMetrics,

    // Performance metrics
    dscr,

    // Visualization
    cashFlows,

    // Metadata
    exitYear: tenure,
    discountRate
  };
}
