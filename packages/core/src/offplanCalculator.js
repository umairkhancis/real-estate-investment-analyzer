/**
 * Off-Plan Real Estate Investment Calculator - Refactored (Decimal.js Version)
 *
 * Business logic for off-plan developer payment plan calculations.
 * All calculations now use Decimal.js for exact precision.
 *
 * IMPORTANT: All functions now return Decimal objects for numerical values.
 * The mysterious 0.0004 adjustment has been REMOVED - proper Decimal precision makes it unnecessary.
 *
 * Single Responsibility: Off-plan investment calculations
 * Dependencies: Only financial functions (Dependency Inversion Principle)
 */

import { NPV_Excel, IRR, PV, calculateROIC } from './financial.js';
import Decimal from './decimalConfig.js';

/**
 * Calculate construction payment structure with exact precision
 *
 * @param {Object} params
 * @param {number|Decimal} params.constructionTenureYears - Construction period in years
 * @param {number|Decimal} params.paymentFrequencyMonths - Payment frequency in months
 * @param {number|Decimal} params.downPaymentPercent - Down payment as decimal (e.g., 0.10 = 10%)
 * @param {number|Decimal} params.installmentPercent - Installment payment as decimal (e.g., 0.05 = 5%)
 * @returns {Object} Payment structure (numberOfPayments: number, totalConstructionPercent: Decimal)
 */
export function calculatePaymentStructure({
  constructionTenureYears,
  paymentFrequencyMonths,
  downPaymentPercent,
  installmentPercent
}) {
  const constructionTenureDecimal = new Decimal(constructionTenureYears);
  const paymentFrequencyDecimal = new Decimal(paymentFrequencyMonths);
  const downPaymentPctDecimal = new Decimal(downPaymentPercent);
  const installmentPctDecimal = new Decimal(installmentPercent);

  // Calculate number of payments (integer)
  const numberOfPayments = Math.floor(
    constructionTenureDecimal.times(12).div(paymentFrequencyDecimal).toNumber()
  );

  // Total construction payment percentage with exact precision
  const totalConstructionPercent = downPaymentPctDecimal.plus(
    installmentPctDecimal.times(numberOfPayments)
  );

  return {
    numberOfPayments,
    totalConstructionPercent
  };
}

/**
 * Calculate construction payment amounts with exact precision
 *
 * @param {Object} params
 * @param {number|Decimal} params.totalValue - Total property value
 * @param {number|Decimal} params.downPaymentPercent - Down payment as decimal
 * @param {number|Decimal} params.installmentPercent - Installment as decimal
 * @param {number|Decimal} params.totalConstructionPercent - Total construction payment as decimal
 * @param {number|Decimal} params.registrationFeePercent - Registration fee as decimal
 * @param {number|Decimal} params.constructionTenureYears - Construction tenure in years
 * @returns {Object} Payment amounts (all Decimal values)
 */
export function calculateConstructionPayments({
  totalValue,
  downPaymentPercent,
  installmentPercent,
  totalConstructionPercent,
  registrationFeePercent,
  constructionTenureYears
}) {
  const totalValueDecimal = new Decimal(totalValue);
  const downPaymentPctDecimal = new Decimal(downPaymentPercent);
  const totalConstructionPctDecimal = new Decimal(totalConstructionPercent);
  const registrationFeePctDecimal = new Decimal(registrationFeePercent);
  const constructionTenureDecimal = new Decimal(constructionTenureYears);

  const downPaymentAmount = totalValueDecimal.times(downPaymentPctDecimal);
  const totalPaymentTillHandover = totalValueDecimal.times(totalConstructionPctDecimal);
  const shadowFinancing = totalPaymentTillHandover.minus(downPaymentAmount);
  const registrationFee = totalValueDecimal.times(registrationFeePctDecimal);

  // Annual installment (shadow financing at 0% interest)
  const annualizedInstallment = shadowFinancing.div(constructionTenureDecimal);

  return {
    downPaymentAmount,
    totalPaymentTillHandover,
    shadowFinancing,
    annualizedInstallment,
    registrationFee
  };
}

/**
 * Calculate exit value at handover with exact precision
 *
 * @param {Object} params
 * @param {number|Decimal} params.propertySize - Property size in sq ft
 * @param {number|Decimal} params.futurePricePerSqft - Future price per sq ft
 * @param {number|Decimal} params.totalConstructionPercent - Total paid as decimal
 * @param {number|Decimal} params.discountRate - Discount rate as decimal
 * @param {number|Decimal} params.constructionTenureYears - Construction tenure in years
 * @returns {Object} Exit values (both Decimal)
 */
export function calculateExitValue({
  propertySize,
  futurePricePerSqft,
  totalConstructionPercent,
  discountRate,
  constructionTenureYears
}) {
  const propertySizeDecimal = new Decimal(propertySize);
  const futurePriceDecimal = new Decimal(futurePricePerSqft);
  const totalConstructionPctDecimal = new Decimal(totalConstructionPercent);
  const discountRateDecimal = new Decimal(discountRate);
  const constructionTenureDecimal = new Decimal(constructionTenureYears);

  const exitValueNominal = propertySizeDecimal
    .times(futurePriceDecimal)
    .times(totalConstructionPctDecimal);

  // PV now returns Decimal
  const exitValueDiscounted = PV(exitValueNominal, discountRateDecimal, constructionTenureDecimal);

  return {
    exitValueNominal,
    exitValueDiscounted
  };
}

/**
 * Generate construction phase cash flows
 *
 * CRITICAL CHANGE: The 0.0004 adjustment has been REMOVED.
 * With proper Decimal precision, this compensation for floating-point errors is unnecessary.
 *
 * @param {Object} params
 * @param {number|Decimal} params.downPaymentAmount - Down payment amount
 * @param {number|Decimal} params.annualizedInstallment - Annual installment amount
 * @param {number|Decimal} params.constructionTenureYears - Construction tenure in years
 * @returns {Array<number>} Cash flow array (as Numbers for IRR calculation)
 */
export function generateConstructionCashFlows({
  downPaymentAmount,
  annualizedInstallment,
  constructionTenureYears
}) {
  const downPaymentDecimal = new Decimal(downPaymentAmount);
  const annualizedInstallmentDecimal = new Decimal(annualizedInstallment);
  const tenureNum = Number(constructionTenureYears);

  const cashFlows = [];

  // Year 0: Down payment (NO ADJUSTMENT - Decimal precision handles it correctly)
  cashFlows.push(-downPaymentDecimal.toNumber());

  // Years 1 to N: Annual installments
  for (let i = 1; i <= tenureNum; i++) {
    cashFlows.push(-annualizedInstallmentDecimal.toNumber());
  }

  return cashFlows;
}

/**
 * Calculate DCF metrics for construction phase with exact precision
 *
 * @param {Object} params
 * @param {Array<number>} params.cashFlows - Cash flow array
 * @param {number|Decimal} params.exitValueDiscounted - Exit value in PV
 * @param {number|Decimal} params.discountRate - Discount rate as decimal
 * @param {number|Decimal} params.downPaymentAmount - Down payment (invested capital today)
 * @returns {Object} DCF metrics (all Decimal values)
 */
export function calculateConstructionDCF({
  cashFlows,
  exitValueDiscounted,
  discountRate,
  downPaymentAmount
}) {
  const exitValueDecimal = new Decimal(exitValueDiscounted);
  const discountRateDecimal = new Decimal(discountRate);
  const downPaymentDecimal = new Decimal(downPaymentAmount);

  // Exclude year 0 for NPV_Excel
  const futureCashFlows = cashFlows.slice(1);

  // NPV_Excel returns Decimal
  const npvFuture = NPV_Excel(discountRateDecimal, futureCashFlows);
  const dcf = npvFuture.plus(exitValueDecimal);

  // NPV includes initial investment
  const cashFlow0 = new Decimal(cashFlows[0]);
  const npv = cashFlow0.plus(dcf);

  // IRR calculation
  const cashFlowsWithExit = [...cashFlows, exitValueDecimal.toNumber()];
  const irr = IRR(cashFlowsWithExit); // Returns Decimal

  // ROIC based on down payment only (invested capital today)
  const investedCapitalToday = downPaymentDecimal;
  const roic = calculateROIC(dcf, investedCapitalToday); // Returns Decimal

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
 * @returns {Object} Complete investment analysis results (most values are Decimal objects)
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

  // Return comprehensive results (most values are Decimal objects)
  return {
    // Input echoes for reference
    size,
    totalValue,
    constructionTenureYears,

    // Payment structure
    ...paymentStructure,

    // Payment amounts (all Decimal)
    ...payments,

    // Exit values (all Decimal)
    ...exitValues,

    // DCF metrics (all Decimal)
    ...dcfMetrics,

    // Cash flows for visualization (Array of Numbers)
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
  // totalConstructionPercent is now a Decimal, need to convert to percentage
  const totalConstructionPct = new Decimal(offplanResults.totalConstructionPercent);
  const downPaymentPercent = totalConstructionPct.times(100).toNumber();

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
    exitValue: mortgageInputs.exitValue || new Decimal(offplanResults.exitValueNominal).toNumber()
  };

  // Calculate using ready property calculator (returns Decimal values)
  const mortgageResults = readyPropertyCalculator(readyPropertyInputs);

  // Calculate total investment (construction + registration)
  const totalPaymentDecimal = new Decimal(offplanResults.totalPaymentTillHandover);
  const registrationFeeDecimal = new Decimal(offplanResults.registrationFee);
  const totalInvestment = totalPaymentDecimal.plus(registrationFeeDecimal);

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
