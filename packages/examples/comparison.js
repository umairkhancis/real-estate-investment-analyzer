/**
 * Property Comparison Example
 *
 * Compare multiple properties and rank them by different metrics
 */

import { RealEstateCalculator } from '@real-estate-calc/core';

const calculator = new RealEstateCalculator();

console.log('='.repeat(80));
console.log('Property Comparison Analysis');
console.log('='.repeat(80));
console.log();

// Define properties to compare
const properties = [
  {
    name: 'Downtown Apartment',
    propertySize: 750,
    totalValue: 750000,
    rentalROI: 7,
    exitValue: 900000
  },
  {
    name: 'Suburban Villa',
    propertySize: 1200,
    totalValue: 1000000,
    rentalROI: 5,
    exitValue: 1150000
  },
  {
    name: 'Marina Studio',
    propertySize: 500,
    totalValue: 600000,
    rentalROI: 8,
    exitValue: 750000
  },
  {
    name: 'Business Bay Tower',
    propertySize: 850,
    totalValue: 850000,
    rentalROI: 6,
    exitValue: 1020000
  }
];

// Common parameters
const commonParams = {
  downPaymentPercent: 25,
  registrationFeePercent: 4,
  tenure: 25,
  discountRate: 4,
  serviceChargesPerSqFt: 10
};

// Calculate for each property
const results = properties.map(prop => {
  const calc = calculator.calculateReadyProperty({
    ...commonParams,
    propertySize: prop.propertySize,
    totalValue: prop.totalValue,
    rentalROI: prop.rentalROI,
    exitValue: prop.exitValue
  });

  return {
    ...prop,
    ...calc
  };
});

// Display comparison table
console.log('Property Comparison Table:');
console.log('-'.repeat(80));
console.log(
  'Property'.padEnd(25) +
  'NPV'.padEnd(15) +
  'IRR'.padEnd(10) +
  'ROIC'.padEnd(10) +
  'DSCR'.padEnd(10)
);
console.log('-'.repeat(80));

results.forEach(r => {
  console.log(
    r.name.padEnd(25) +
    `$${Math.round(r.npv).toLocaleString()}`.padEnd(15) +
    `${(r.irr * 100).toFixed(2)}%`.padEnd(10) +
    `${(r.roic * 100).toFixed(1)}%`.padEnd(10) +
    `${r.dscr.toFixed(2)}`.padEnd(10)
  );
});

console.log('-'.repeat(80));
console.log();

// Rankings
console.log('📊 Rankings:\n');

// By NPV
console.log('1️⃣  Best NPV (Value Creation):');
const byNPV = [...results].sort((a, b) => b.npv - a.npv);
byNPV.forEach((r, i) => {
  console.log(`   ${i + 1}. ${r.name}: $${Math.round(r.npv).toLocaleString()}`);
});
console.log();

// By IRR
console.log('2️⃣  Best IRR (Return Rate):');
const byIRR = [...results].sort((a, b) => b.irr - a.irr);
byIRR.forEach((r, i) => {
  console.log(`   ${i + 1}. ${r.name}: ${(r.irr * 100).toFixed(2)}%`);
});
console.log();

// By ROIC
console.log('3️⃣  Best ROIC (Return on Capital):');
const byROIC = [...results].sort((a, b) => b.roic - a.roic);
byROIC.forEach((r, i) => {
  console.log(`   ${i + 1}. ${r.name}: ${(r.roic * 100).toFixed(2)}%`);
});
console.log();

// By Cash Flow
console.log('4️⃣  Best Cash Flow (Monthly Income):');
const byCashFlow = [...results].sort((a, b) => b.netMonthlyCashFlow - a.netMonthlyCashFlow);
byCashFlow.forEach((r, i) => {
  console.log(`   ${i + 1}. ${r.name}: $${Math.round(r.netMonthlyCashFlow).toLocaleString()}/month`);
});
console.log();

// Overall recommendation
console.log('🎯 Overall Recommendation:\n');

// Filter viable investments
const viable = results.filter(r => r.npv > 0 && r.irr > 0.04 && r.dscr >= 1.0);

if (viable.length === 0) {
  console.log('   ❌ None of these properties meet minimum investment criteria.');
} else {
  // Score each property (NPV 40%, IRR 30%, ROIC 30%)
  const scored = viable.map(r => {
    const npvScore = (r.npv / Math.max(...viable.map(v => v.npv))) * 0.4;
    const irrScore = (r.irr / Math.max(...viable.map(v => v.irr))) * 0.3;
    const roicScore = (r.roic / Math.max(...viable.map(v => v.roic))) * 0.3;
    const totalScore = npvScore + irrScore + roicScore;

    return { ...r, totalScore };
  }).sort((a, b) => b.totalScore - a.totalScore);

  console.log(`   🏆 TOP PICK: ${scored[0].name}`);
  console.log(`   Reasons:`);
  console.log(`   - NPV: $${Math.round(scored[0].npv).toLocaleString()} (${scored[0].npv > 0 ? 'Creates value' : 'Destroys value'})`);
  console.log(`   - IRR: ${(scored[0].irr * 100).toFixed(2)}% (${scored[0].irr > 0.04 ? 'Above hurdle' : 'Below hurdle'})`);
  console.log(`   - DSCR: ${scored[0].dscr.toFixed(2)} (${scored[0].dscr >= 1.25 ? 'Healthy' : 'Marginal'})`);
  console.log(`   - Monthly Cash Flow: $${Math.round(scored[0].netMonthlyCashFlow).toLocaleString()}`);

  if (scored.length > 1) {
    console.log();
    console.log(`   🥈 RUNNER-UP: ${scored[1].name}`);
    console.log(`   🥉 THIRD: ${scored[2]?.name || 'N/A'}`);
  }
}

console.log();
console.log('='.repeat(80));
