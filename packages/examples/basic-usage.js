/**
 * Basic Usage Example
 *
 * Demonstrates how to use the core SDK for simple calculations
 */

import { RealEstateCalculator } from '@real-estate-calc/core';

const calculator = new RealEstateCalculator();

console.log('='.repeat(60));
console.log('Real Estate Investment Calculator - Basic Usage');
console.log('='.repeat(60));
console.log();

// Example 1: Ready Property
console.log('📊 Example 1: Ready Property Investment\n');

const readyInputs = {
  propertySize: 850,
  totalValue: 850000,
  downPaymentPercent: 25,
  registrationFeePercent: 4,
  tenure: 25,
  discountRate: 4,
  rentalROI: 6,
  serviceChargesPerSqFt: 10,
  exitValue: 1020000
};

const readyResults = calculator.calculateReadyProperty(readyInputs);

console.log(`Property Value: $${readyInputs.totalValue.toLocaleString()}`);
console.log(`Property Size: ${readyInputs.propertySize} sq ft`);
console.log(`Down Payment: ${readyInputs.downPaymentPercent}%`);
console.log();
console.log('Results:');
console.log(`  NPV: $${readyResults.npv.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
console.log(`  IRR: ${(readyResults.irr * 100).toFixed(2)}%`);
console.log(`  DSCR: ${readyResults.dscr.toFixed(2)}`);
console.log(`  ROIC: ${(readyResults.roic * 100).toFixed(2)}%`);
console.log(`  Monthly EMI: $${readyResults.monthlyEMI.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
console.log(`  Net Monthly Cash Flow: $${readyResults.netMonthlyCashFlow.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
console.log();

// Investment Decision
if (readyResults.npv > 0 && readyResults.irr > readyResults.discountRate && readyResults.dscr >= 1.25) {
  console.log('✅ RECOMMENDATION: Strong investment opportunity!');
} else if (readyResults.npv > 0) {
  console.log('⚠️  RECOMMENDATION: Marginal investment, proceed with caution');
} else {
  console.log('❌ RECOMMENDATION: Poor investment, avoid');
}

console.log();
console.log('='.repeat(60));
console.log();

// Example 2: Off-Plan Property
console.log('🏗️  Example 2: Off-Plan Property Investment\n');

const offplanInputs = {
  size: 500,
  totalValue: 500000,
  downPaymentPercent: 10,
  installmentPercent: 1,
  paymentFrequencyMonths: 3,
  constructionTenureYears: 3,
  handoverPaymentPercent: 10,
  expectedValue: 600000,
  discountRate: 4
};

const offplanResults = calculator.calculateOffplan(offplanInputs);

console.log(`Property Value: $${offplanInputs.totalValue.toLocaleString()}`);
console.log(`Property Size: ${offplanInputs.size} sq ft`);
console.log(`Construction Period: ${offplanInputs.constructionTenureYears} years`);
console.log();
console.log('Payment Plan:');
console.log(`  Down Payment: $${offplanResults.downPayment.toLocaleString()}`);
console.log(`  ${offplanResults.numberOfPayments} Installments: $${offplanResults.installmentAmount.toLocaleString()} each`);
console.log(`  Handover Payment: $${offplanResults.handoverPayment.toLocaleString()}`);
console.log(`  Total Paid: $${offplanResults.totalPaidDuringConstruction.toLocaleString()}`);
console.log();
console.log('Results:');
console.log(`  Invested Capital (PV): $${offplanResults.investedCapitalToday.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
console.log(`  NPV: $${offplanResults.npv.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
console.log(`  IRR: ${(offplanResults.irr * 100).toFixed(2)}%`);
console.log(`  ROIC: ${(offplanResults.roic * 100).toFixed(2)}%`);
console.log();

// Investment Decision
if (offplanResults.npv > 0 && offplanResults.irr > offplanInputs.discountRate / 100) {
  console.log('✅ RECOMMENDATION: Good off-plan opportunity!');
} else {
  console.log('❌ RECOMMENDATION: Poor investment, avoid');
}

console.log();
console.log('='.repeat(60));
