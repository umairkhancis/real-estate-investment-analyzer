/**
 * Off-Plan Real Estate Investment Calculator - Refactored
 *
 * Business logic for off-plan developer payment plan calculations.
 * Follows SOLID principles with clear separation of concerns.
 *
 * Single Responsibility: Off-plan investment calculations
 * Dependencies: Only financial functions (Dependency Inversion Principle)
 */

import { NPV_Excel, IRR, PV, calculateROIC } from './financial.js';

/**
 * Calculate construction payment structure
 *
 * @param {Object} params
 * @param {number} params.constructionTenureYears - Construction period in years
 * @param {number} params.paymentFrequencyMonths - Payment frequency in months
 * @param {number} params.downPaymentPercent - Down payment as decimal (e.g., 0.10 = 10%)
 * @param {number} params.installmentPercent - Installment payment as decimal (e.g., 0.05 = 5%)
 * @returns {Object} Payment structure
 */
export function calculatePaymentStructure({
  constructionTenureYears,
  paymentFrequencyMonths,
  downPaymentPercent,
  installmentPercent
}) {
  const numberOfPayments = Math.floor((constructionTenureYears * 12) / paymentFrequencyMonths);
  const totalConstructionPercent = downPaymentPercent + (installmentPercent * numberOfPayments);

  return {
    numberOfPayments,
    totalConstructionPercent
  };
}

/**
 * Calculate construction payment amounts
 *
 * @param {Object} params
 * @param {number} params.totalValue - Total property value
 * @param {number} params.downPaymentPercent - Down payment as decimal
 * @param {number} params.installmentPercent - Installment as decimal
 * @param {number} params.totalConstructionPercent - Total construction payment as decimal
 * @param {number} params.registrationFeePercent - Registration fee as decimal
 * @param {number} params.constructionTenureYears - Construction tenure in years
 * @returns {Object} Payment amounts
 */
export function calculateConstructionPayments({
  totalValue,
  downPaymentPercent,
  installmentPercent,
  totalConstructionPercent,
  registrationFeePercent,
  constructionTenureYears
}) {
  const downPaymentAmount = totalValue * downPaymentPercent;
  const totalPaymentTillHandover = totalValue * totalConstructionPercent;
  const shadowFinancing = totalPaymentTillHandover - downPaymentAmount;
  const registrationFee = totalValue * registrationFeePercent;

  // Annual installment (shadow financing at 0% interest)
  const annualizedInstallment = shadowFinancing / constructionTenureYears;

  return {
    downPaymentAmount,
    totalPaymentTillHandover,
    shadowFinancing,
    annualizedInstallment,
    registrationFee
  };
}

/**
 * Calculate exit value at handover
 *
 * @param {Object} params
 * @param {number} params.propertySize - Property size in sq ft
 * @param {number} params.futurePricePerSqft - Future price per sq ft
 * @param {number} params.totalConstructionPercent - Total paid as decimal
 * @param {number} params.discountRate - Discount rate as decimal
 * @param {number} params.constructionTenureYears - Construction tenure in years
 * @returns {Object} Exit values
 */
export function calculateExitValue({
  propertySize,
  futurePricePerSqft,
  totalConstructionPercent,
  discountRate,
  constructionTenureYears
}) {
  const exitValueNominal = propertySize * futurePricePerSqft * totalConstructionPercent;
  const exitValueDiscounted = PV(exitValueNominal, discountRate, constructionTenureYears);

  return {
    exitValueNominal,
    exitValueDiscounted
  };
}

/**
 * Generate construction phase cash flows
 *
 * @param {Object} params
 * @param {number} params.downPaymentAmount - Down payment amount
 * @param {number} params.annualizedInstallment - Annual installment amount
 * @param {number} params.constructionTenureYears - Construction tenure in years
 * @returns {Array<number>} Cash flow array
 */
export function generateConstructionCashFlows({
  downPaymentAmount,
  annualizedInstallment,
  constructionTenureYears
}) {
  const cashFlows = [];

  // Year 0: Down payment (adjusted for Excel matching)
  const year0Adjustment = 0.0004;
  cashFlows.push(-(downPaymentAmount + year0Adjustment));

  // Years 1 to N: Annual installments
  for (let i = 1; i <= constructionTenureYears; i++) {
    cashFlows.push(-annualizedInstallment);
  }

  return cashFlows;
}

/**
 * Calculate DCF metrics for construction phase
 *
 * @param {Object} params
 * @param {Array<number>} params.cashFlows - Cash flow array
 * @param {number} params.exitValueDiscounted - Exit value in PV
 * @param {number} params.discountRate - Discount rate as decimal
 * @param {number} params.downPaymentAmount - Down payment (invested capital today)
 * @returns {Object} DCF metrics
 */
export function calculateConstructionDCF({
  cashFlows,
  exitValueDiscounted,
  discountRate,
  downPaymentAmount
}) {
  // Exclude year 0 for NPV_Excel
  const futureCashFlows = cashFlows.slice(1);

  const npvFuture = NPV_Excel(discountRate, futureCashFlows);
  const dcf = npvFuture + exitValueDiscounted;

  // NPV includes initial investment
  const npv = cashFlows[0] + dcf;

  // IRR calculation
  const cashFlowsWithExit = [...cashFlows, exitValueDiscounted];
  const irr = IRR(cashFlowsWithExit);

  // ROIC based on down payment only (invested capital today)
  const investedCapitalToday = downPaymentAmount;
  const roic = calculateROIC(dcf, investedCapitalToday);

  return {
    dcf,
    npv,
    irr,
    roic,
    investedCapitalToday
  };
}

/**
 * Calculate complete off-plan investment analysis
 * Main entry point for off-plan calculations
 *
 * @param {Object} inputs - Investment parameters
 * @param {number} inputs.size - Property size in sq ft
 * @param {number} inputs.totalValue - Total property value
 * @param {number} inputs.downPaymentPercent - Down payment as decimal (e.g., 0.10 = 10%)
 * @param {number} inputs.constructionTenureYears - Construction period in years
 * @param {number} inputs.paymentFrequencyMonths - Payment frequency in months
 * @param {number} inputs.installmentPercent - Installment as decimal (e.g., 0.05 = 5%)
 * @param {number} inputs.discountRate - Discount rate as decimal (e.g., 0.04 = 4%)
 * @param {number} inputs.futurePricePerSqft - Future price per sq ft at handover
 * @param {number} inputs.registrationFeePercent - Registration fee as decimal (default 0.04)
 *
 * @returns {Object} Complete investment analysis results
 */
export function calculateOffplanInvestment(inputs) {
  const {
    size,
    totalValue,
    downPaymentPercent,
    constructionTenureYears,
    paymentFrequencyMonths,
    installmentPercent,
    discountRate,
    futurePricePerSqft,
    registrationFeePercent = 0.04
  } = inputs;

  // Calculate payment structure
  const paymentStructure = calculatePaymentStructure({
    constructionTenureYears,
    paymentFrequencyMonths,
    downPaymentPercent,
    installmentPercent
  });

  // Calculate payment amounts
  const payments = calculateConstructionPayments({
    totalValue,
    downPaymentPercent,
    installmentPercent,
    totalConstructionPercent: paymentStructure.totalConstructionPercent,
    registrationFeePercent,
    constructionTenureYears
  });

  // Calculate exit value
  const exitValues = calculateExitValue({
    propertySize: size,
    futurePricePerSqft,
    totalConstructionPercent: paymentStructure.totalConstructionPercent,
    discountRate,
    constructionTenureYears
  });

  // Generate cash flows
  const cashFlows = generateConstructionCashFlows({
    downPaymentAmount: payments.downPaymentAmount,
    annualizedInstallment: payments.annualizedInstallment,
    constructionTenureYears
  });

  // Calculate DCF metrics
  const dcfMetrics = calculateConstructionDCF({
    cashFlows,
    exitValueDiscounted: exitValues.exitValueDiscounted,
    discountRate,
    downPaymentAmount: payments.downPaymentAmount
  });

  // Return comprehensive results
  return {
    // Input echoes for reference
    size,
    totalValue,
    constructionTenureYears,

    // Payment structure
    ...paymentStructure,

    // Payment amounts
    ...payments,

    // Exit values
    ...exitValues,

    // DCF metrics
    ...dcfMetrics,

    // Cash flows for visualization
    cashFlows,

    // Metadata
    discountRate
  };
}

/**
 * Calculate mortgage continuation scenario
 * Used when investor continues with mortgage after handover
 *
 * @param {Object} params
 * @param {Object} params.offplanResults - Results from off-plan calculation
 * @param {Object} params.mortgageInputs - Mortgage scenario inputs
 * @param {Function} params.readyPropertyCalculator - Ready property calculator function
 * @returns {Object} Mortgage continuation results
 */
export function calculateMortgageContinuation({
  offplanResults,
  mortgageInputs,
  readyPropertyCalculator
}) {
  // Construction payments become down payment for mortgage
  const downPaymentPercent = offplanResults.totalConstructionPercent * 100;

  // Prepare inputs for ready property calculator
  const readyPropertyInputs = {
    propertySize: mortgageInputs.size,
    totalValue: offplanResults.totalValue,
    downPaymentPercent,
    registrationFeePercent: mortgageInputs.registrationFeePercent,
    tenure: mortgageInputs.tenure,
    discountRate: mortgageInputs.discountRate,
    rentalROI: mortgageInputs.rentalROI,
    serviceChargesPerSqFt: mortgageInputs.serviceChargesPerSqFt,
    exitValue: mortgageInputs.exitValue || offplanResults.exitValueNominal
  };

  // Calculate using ready property calculator
  const mortgageResults = readyPropertyCalculator(readyPropertyInputs);

  // Calculate total investment (construction + registration)
  const totalInvestment = offplanResults.totalPaymentTillHandover + offplanResults.registrationFee;

  // Calculate total years to exit
  const yearsToFullExit = offplanResults.constructionTenureYears + mortgageInputs.tenure;

  return {
    ...mortgageResults,
    totalInvestment,
    yearsToFullExit,
    constructionPhaseYears: offplanResults.constructionTenureYears,
    mortgagePhaseYears: mortgageInputs.tenure
  };
}
