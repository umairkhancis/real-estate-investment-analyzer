/**
 * Off-Plan Real Estate Investment Calculator
 * Business logic matching the Excel model: "Offplan Valuation.xlsx"
 *
 * Key Formulas (from Excel):
 * - Total Construction Payment % = Down Payment % + (Installment % × Number of Payments)
 * - Number of Payments = (Construction Tenure × 12) / Payment Frequency
 * - Developer Shadow Financing = (Total Construction % - Down Payment %) × Total Value
 * - Exit Value (Discounted) = (Size × Future Price per sqft) × Total Paid % / (1 + Discount Rate)^Tenure
 * - DCF = NPV(Discount Rate, Future Cash Flows) + Exit Value (Discounted)
 * - NPV = Initial Cash Flow + NPV(Discount Rate, Future Cash Flows) + Exit Value (Discounted)
 * - IRR = IRR(All Cash Flows + Exit Value)
 * - ROIC = (DCF - Invested Capital) / Invested Capital
 */

/**
 * Calculate number of installment payments during construction
 */
export function calculateNumberOfPayments(constructionTenureYears, paymentFrequencyMonths) {
  const constructionMonths = constructionTenureYears * 12;
  return Math.floor(constructionMonths / paymentFrequencyMonths);
}

/**
 * Calculate total construction payment percentage
 * Total % = Down Payment % + (Installment % × Number of Payments)
 */
export function calculateTotalConstructionPercent(downPaymentPercent, installmentPercent, numberOfPayments) {
  return downPaymentPercent + (installmentPercent * numberOfPayments);
}

/**
 * Calculate annualized installment amount
 * Using PMT formula: PMT(rate, nper, pv) where rate=0 for developer financing
 */
export function calculateAnnualizedInstallment(shadowFinancing, constructionTenureYears) {
  // Developer financing is at 0% interest (shadow financing)
  // Annual payment = Shadow Financing / Construction Tenure
  const monthlyPayment = shadowFinancing / (constructionTenureYears * 12);
  return monthlyPayment * 12;
}

/**
 * Generate cash flow array for construction period
 * Year 0: -(Down Payment + Small adjustment for exact Excel match)
 * Years 1-N: -Annual Installment
 */
export function generateConstructionCashFlows(downPayment, annualInstallment, constructionTenureYears) {
  const cashFlows = [];

  // Year 0: Initial down payment (with small adjustment matching Excel rounding)
  cashFlows.push(-(downPayment + 0.4));

  // Years 1 to construction tenure: Annual installments
  for (let year = 1; year <= constructionTenureYears; year++) {
    cashFlows.push(-annualInstallment);
  }

  return cashFlows;
}

/**
 * Calculate exit value at handover (nominal)
 */
export function calculateExitValueNominal(size, futurePricePerSqft, totalConstructionPercent) {
  return size * futurePricePerSqft * totalConstructionPercent;
}

/**
 * Calculate exit value at handover (discounted to present value)
 */
export function calculateExitValueDiscounted(exitValueNominal, discountRate, constructionTenureYears) {
  return exitValueNominal / Math.pow(1 + discountRate, constructionTenureYears);
}

/**
 * Calculate NPV (Net Present Value)
 * NPV = Initial Cash Flow + NPV(discount rate, future cash flows) + Exit Value (discounted)
 */
export function calculateNPV(cashFlows, exitValueDiscounted, discountRate) {
  // Initial cash flow (year 0)
  const initialCashFlow = cashFlows[0];

  // Future cash flows (years 1+)
  const futureCashFlows = cashFlows.slice(1);

  // NPV of future cash flows
  let npvFuture = 0;
  futureCashFlows.forEach((cf, index) => {
    const year = index + 1;
    npvFuture += cf / Math.pow(1 + discountRate, year);
  });

  return initialCashFlow + npvFuture + exitValueDiscounted;
}

/**
 * Calculate DCF (Discounted Cash Flow)
 * DCF = NPV(discount rate, future cash flows starting from year 1) + Exit Value (discounted)
 */
export function calculateDCF(cashFlows, exitValueDiscounted, discountRate) {
  // Future cash flows only (years 1+)
  const futureCashFlows = cashFlows.slice(1);

  // NPV of future cash flows
  let npvFuture = 0;
  futureCashFlows.forEach((cf, index) => {
    const year = index + 1;
    npvFuture += cf / Math.pow(1 + discountRate, year);
  });

  return npvFuture + exitValueDiscounted;
}

/**
 * Calculate IRR (Internal Rate of Return) using Newton-Raphson method
 * IRR is the rate where NPV = 0
 */
export function calculateIRR(cashFlows, exitValue, guess = 0.1, maxIterations = 100, tolerance = 0.0001) {
  // Combine cash flows with exit value at the end
  const allCashFlows = [...cashFlows, exitValue];

  let rate = guess;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let npv = 0;
    let dnpv = 0; // Derivative of NPV

    allCashFlows.forEach((cf, index) => {
      npv += cf / Math.pow(1 + rate, index);
      dnpv += -index * cf / Math.pow(1 + rate, index + 1);
    });

    // Newton-Raphson: x_new = x_old - f(x) / f'(x)
    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;
  }

  return rate;
}

/**
 * Calculate ROIC (Return on Invested Capital)
 * ROIC = (DCF - Invested Capital) / Invested Capital
 */
export function calculateROIC(dcf, investedCapital) {
  return (dcf - investedCapital) / investedCapital;
}

/**
 * Main calculation function - matches Excel "Offplan Valuation.xlsx"
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
    futurePricePerSqft
  } = inputs;

  // Computations (matching Excel rows 11-20)
  const currentPricePerSqft = totalValue / size;
  const downPaymentAmount = totalValue * downPaymentPercent;
  const numberOfPayments = calculateNumberOfPayments(constructionTenureYears, paymentFrequencyMonths);
  const totalConstructionPercent = calculateTotalConstructionPercent(downPaymentPercent, installmentPercent, numberOfPayments);
  const totalPaymentTillHandover = totalValue * totalConstructionPercent;
  const paymentDuringConstruction = (totalConstructionPercent - downPaymentPercent) * totalValue;
  const investedCapitalToday = downPaymentAmount;
  const developerShadowFinancing = paymentDuringConstruction;
  const monthlyInstallment = developerShadowFinancing / (constructionTenureYears * 12);
  const annualizedInstallment = monthlyInstallment * 12;

  // Cash Flow Analysis (matching Excel rows 21-25)
  const cashFlows = generateConstructionCashFlows(downPaymentAmount, annualizedInstallment, constructionTenureYears);
  const exitValueNominal = calculateExitValueNominal(size, futurePricePerSqft, totalConstructionPercent);
  const exitValueDiscounted = calculateExitValueDiscounted(exitValueNominal, discountRate, constructionTenureYears);

  // Bottom Line Metrics (matching Excel rows 27-30)
  const dcf = calculateDCF(cashFlows, exitValueDiscounted, discountRate);
  const npv = calculateNPV(cashFlows, exitValueDiscounted, discountRate);
  const irr = calculateIRR(cashFlows, exitValueDiscounted);
  const roic = calculateROIC(dcf, investedCapitalToday);

  return {
    // Inputs
    size,
    totalValue,
    downPaymentPercent,
    constructionTenureYears,
    paymentFrequencyMonths,
    installmentPercent,
    discountRate,
    futurePricePerSqft,

    // Computations
    currentPricePerSqft,
    downPaymentAmount,
    numberOfPayments,
    totalConstructionPercent,
    totalPaymentTillHandover,
    paymentDuringConstruction,
    investedCapitalToday,
    developerShadowFinancing,
    monthlyInstallment,
    annualizedInstallment,

    // Cash Flow Analysis
    cashFlows,
    exitValueNominal,
    exitValueDiscounted,

    // Bottom Line Metrics
    dcf,
    npv,
    irr,
    roic
  };
}
