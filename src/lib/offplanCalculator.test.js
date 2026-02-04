/**
 * Unit tests for Off-Plan Calculator
 * Test cases based on Excel file: "Offplan Valuation.xlsx"
 *
 * Expected values from Excel:
 * - DCF: 126827.7765
 * - NPV: 41827.37651
 * - IRR: 0.026031 (2.6031%)
 * - ROIC: 0.492091 (49.21%)
 */

import {
  calculateNumberOfPayments,
  calculateTotalConstructionPercent,
  calculateAnnualizedInstallment,
  generateConstructionCashFlows,
  calculateExitValueNominal,
  calculateExitValueDiscounted,
  calculateNPV,
  calculateDCF,
  calculateIRR,
  calculateROIC,
  calculateOffplanInvestment
} from './offplanCalculator.js';

// Helper function for comparing floats
function assertClose(actual, expected, tolerance = 0.01, message = '') {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(
      `${message}\nExpected: ${expected}\nActual: ${actual}\nDifference: ${diff} (tolerance: ${tolerance})`
    );
  }
}

// Test data from Excel file
const excelInputs = {
  size: 850,
  totalValue: 850000,
  downPaymentPercent: 0.10,
  constructionTenureYears: 3,
  paymentFrequencyMonths: 6,
  installmentPercent: 0.05,
  discountRate: 0.04,
  futurePricePerSqft: 1200
};

const excelExpected = {
  currentPricePerSqft: 1000,
  downPaymentAmount: 85000,
  numberOfPayments: 6,
  totalConstructionPercent: 0.40,
  totalPaymentTillHandover: 340000,
  paymentDuringConstruction: 255000,
  investedCapitalToday: 85000,
  developerShadowFinancing: 255000,
  monthlyInstallment: 7083.333333,
  annualizedInstallment: 85000,
  exitValueNominal: 408000,
  exitValueDiscounted: 362710.5143,
  dcf: 126827.7765,
  npv: 41827.37651,
  irr: 0.026031,
  roic: 0.492091
};

// Test 1: Number of Payments
console.log('Test 1: Calculate Number of Payments');
const numPayments = calculateNumberOfPayments(3, 6);
assertClose(numPayments, 6, 0, 'Number of payments should be 6');
console.log('✓ PASSED\n');

// Test 2: Total Construction Percent
console.log('Test 2: Calculate Total Construction Percent');
const totalPercent = calculateTotalConstructionPercent(0.10, 0.05, 6);
assertClose(totalPercent, 0.40, 0.0001, 'Total construction percent should be 40%');
console.log('✓ PASSED\n');

// Test 3: Annualized Installment
console.log('Test 3: Calculate Annualized Installment');
const annualInstallment = calculateAnnualizedInstallment(255000, 3);
assertClose(annualInstallment, 85000, 1, 'Annualized installment should be 85000');
console.log('✓ PASSED\n');

// Test 4: Cash Flows
console.log('Test 4: Generate Construction Cash Flows');
const cashFlows = generateConstructionCashFlows(85000, 85000, 3);
assertClose(cashFlows[0], -85000.4, 0.5, 'Year 0 cash flow should be -85000.4');
assertClose(cashFlows[1], -85000, 1, 'Year 1 cash flow should be -85000');
assertClose(cashFlows[2], -85000, 1, 'Year 2 cash flow should be -85000');
assertClose(cashFlows[3], -85000, 1, 'Year 3 cash flow should be -85000');
console.log('✓ PASSED\n');

// Test 5: Exit Value (Nominal)
console.log('Test 5: Calculate Exit Value (Nominal)');
const exitNominal = calculateExitValueNominal(850, 1200, 0.40);
assertClose(exitNominal, 408000, 1, 'Exit value nominal should be 408000');
console.log('✓ PASSED\n');

// Test 6: Exit Value (Discounted)
console.log('Test 6: Calculate Exit Value (Discounted)');
const exitDiscounted = calculateExitValueDiscounted(408000, 0.04, 3);
assertClose(exitDiscounted, 362710.5143, 1, 'Exit value discounted should be 362710.5143');
console.log('✓ PASSED\n');

// Test 7: DCF
console.log('Test 7: Calculate DCF');
const testCashFlows = [-85000.4, -85000, -85000, -85000];
const dcf = calculateDCF(testCashFlows, 362710.5143, 0.04);
assertClose(dcf, 126827.7765, 10, 'DCF should be 126827.7765');
console.log('✓ PASSED\n');

// Test 8: NPV
console.log('Test 8: Calculate NPV');
const npv = calculateNPV(testCashFlows, 362710.5143, 0.04);
assertClose(npv, 41827.37651, 10, 'NPV should be 41827.37651');
console.log('✓ PASSED\n');

// Test 9: IRR
console.log('Test 9: Calculate IRR');
const irr = calculateIRR(testCashFlows, 362710.5143);
assertClose(irr, 0.026031, 0.0001, 'IRR should be 0.026031 (2.6%)');
console.log('✓ PASSED\n');

// Test 10: ROIC
console.log('Test 10: Calculate ROIC');
const roic = calculateROIC(126827.7765, 85000);
assertClose(roic, 0.492091, 0.001, 'ROIC should be 0.492091 (49.21%)');
console.log('✓ PASSED\n');

// Test 11: Complete Calculation
console.log('Test 11: Complete Off-Plan Investment Calculation');
const result = calculateOffplanInvestment(excelInputs);

console.log('Verifying all outputs against Excel:');
console.log(`  Current Price per sqft: ${result.currentPricePerSqft} (Expected: ${excelExpected.currentPricePerSqft})`);
assertClose(result.currentPricePerSqft, excelExpected.currentPricePerSqft, 1);

console.log(`  Down Payment Amount: ${result.downPaymentAmount} (Expected: ${excelExpected.downPaymentAmount})`);
assertClose(result.downPaymentAmount, excelExpected.downPaymentAmount, 1);

console.log(`  Number of Payments: ${result.numberOfPayments} (Expected: ${excelExpected.numberOfPayments})`);
assertClose(result.numberOfPayments, excelExpected.numberOfPayments, 0);

console.log(`  Total Construction %: ${result.totalConstructionPercent} (Expected: ${excelExpected.totalConstructionPercent})`);
assertClose(result.totalConstructionPercent, excelExpected.totalConstructionPercent, 0.0001);

console.log(`  Exit Value (Nominal): ${result.exitValueNominal} (Expected: ${excelExpected.exitValueNominal})`);
assertClose(result.exitValueNominal, excelExpected.exitValueNominal, 1);

console.log(`  Exit Value (Discounted): ${result.exitValueDiscounted} (Expected: ${excelExpected.exitValueDiscounted})`);
assertClose(result.exitValueDiscounted, excelExpected.exitValueDiscounted, 1);

console.log(`  DCF: ${result.dcf} (Expected: ${excelExpected.dcf})`);
assertClose(result.dcf, excelExpected.dcf, 10);

console.log(`  NPV: ${result.npv} (Expected: ${excelExpected.npv})`);
assertClose(result.npv, excelExpected.npv, 10);

console.log(`  IRR: ${result.irr} (Expected: ${excelExpected.irr})`);
assertClose(result.irr, excelExpected.irr, 0.0001);

console.log(`  ROIC: ${result.roic} (Expected: ${excelExpected.roic})`);
assertClose(result.roic, excelExpected.roic, 0.001);

console.log('✓ ALL TESTS PASSED\n');

// Test 12: Edge Cases
console.log('Test 12: Edge Cases');

// Test with different payment frequencies
const quarterlyPayments = calculateNumberOfPayments(3, 3); // Quarterly for 3 years
assertClose(quarterlyPayments, 12, 0, 'Quarterly payments for 3 years should be 12');

const yearlyPayments = calculateNumberOfPayments(3, 12); // Yearly for 3 years
assertClose(yearlyPayments, 3, 0, 'Yearly payments for 3 years should be 3');

console.log('✓ PASSED\n');

console.log('='.repeat(60));
console.log('ALL TESTS COMPLETED SUCCESSFULLY! ✓');
console.log('Calculator matches Excel model: "Offplan Valuation.xlsx"');
console.log('='.repeat(60));
