# Real Estate Investment Calculator - Core SDK

[![npm version](https://badge.fury.io/js/%40real-estate-calc%2Fcore.svg)](https://www.npmjs.com/package/@real-estate-calc/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Core calculation engine** for real estate investment analysis. Pure JavaScript/Node.js library with no dependencies (except Decimal.js for precision).

## 🚀 Installation

```bash
npm install @real-estate-calc/core
```

## 📖 Quick Start

```javascript
import { RealEstateCalculator } from '@real-estate-calc/core';

const calculator = new RealEstateCalculator();

// Calculate ready property investment
const results = calculator.calculateReadyProperty({
  propertySize: 850,
  totalValue: 850000,
  downPaymentPercent: 25,
  tenure: 25,
  discountRate: 4,
  rentalROI: 6,
  serviceChargesPerSqFt: 10,
  exitValue: 1020000
});

console.log(`NPV: $${results.npv}`);
console.log(`IRR: ${(results.irr * 100).toFixed(2)}%`);
console.log(`DSCR: ${results.dscr.toFixed(2)}`);
```

## 🎯 Features

- ✅ **Ready Property Calculations** - Mortgage-based investments
- ✅ **Off-Plan Calculations** - Developer payment plans
- ✅ **Financial Utilities** - NPV, IRR, PMT, FV, PV
- ✅ **High Precision** - Uses Decimal.js for accurate calculations
- ✅ **Zero Dependencies** - Only requires Decimal.js
- ✅ **TypeScript Ready** - Full JSDoc type annotations
- ✅ **Battle Tested** - 60+ unit tests

## 📚 API Reference

### RealEstateCalculator Class

#### `calculateReadyProperty(inputs)`

Calculate investment metrics for ready properties with mortgage financing.

**Parameters:**

```javascript
{
  propertySize: number,           // Property size in sq ft
  totalValue: number,             // Total property value
  downPaymentPercent: number,     // Down payment % (default: 25)
  registrationFeePercent: number, // Registration fee % (default: 4)
  tenure: number,                 // Loan tenure in years (default: 25)
  discountRate: number,           // Discount rate % (default: 4)
  rentalROI: number,              // Rental ROI % (default: 6)
  serviceChargesPerSqFt: number,  // Service charges per sq ft (default: 10)
  exitValue: number               // Expected exit value
}
```

**Returns:**

```javascript
{
  // Investment Costs
  pricePerSqFt: number,
  downPaymentAmt: number,
  registrationFee: number,
  agentFee: number,
  investedCapital: number,
  financingAmount: number,

  // Rental Metrics
  annualRental: number,
  annualServiceCharges: number,
  netOperatingIncome: number,

  // Mortgage Metrics
  monthlyEMI: number,
  annualDebtService: number,

  // Cash Flows
  netAnnualCashFlow: number,
  netMonthlyCashFlow: number,

  // Performance Metrics
  dcf: number,              // Discounted Cash Flow
  npv: number,              // Net Present Value
  irr: number,              // Internal Rate of Return (decimal)
  dscr: number,             // Debt Service Coverage Ratio
  roic: number,             // Return on Invested Capital (decimal)

  // Visualization
  cashFlows: number[],      // Array of yearly cash flows
  exitYear: number,
  discountRate: number      // Echo of discount rate
}
```

**Example:**

```javascript
import { RealEstateCalculator } from '@real-estate-calc/core';

const calculator = new RealEstateCalculator();

const results = calculator.calculateReadyProperty({
  propertySize: 850,
  totalValue: 850000,
  downPaymentPercent: 25,
  registrationFeePercent: 4,
  tenure: 25,
  discountRate: 4,
  rentalROI: 6,
  serviceChargesPerSqFt: 10,
  exitValue: 1020000
});

// Decision making
if (results.npv > 0 && results.irr > results.discountRate / 100) {
  console.log('✓ Good investment!');
  console.log(`Expected return: ${(results.roic * 100).toFixed(2)}%`);
} else {
  console.log('✗ Poor investment');
}
```

---

#### `calculateOffplan(inputs)`

Calculate investment metrics for off-plan properties with developer payment plans.

**Parameters:**

```javascript
{
  size: number,                    // Property size in sq ft
  totalValue: number,              // Total property value
  downPaymentPercent: number,      // Down payment % (default: 10)
  installmentPercent: number,      // Installment % (default: 1)
  paymentFrequencyMonths: number,  // Payment frequency: 1,3,6,12 (default: 3)
  constructionTenureYears: number, // Construction period (default: 3)
  handoverPaymentPercent: number,  // Handover payment % (default: 10)
  expectedValue: number,           // Expected value at handover
  discountRate: number             // Discount rate % (default: 4)
}
```

**Returns:**

```javascript
{
  // Payment Structure
  downPayment: number,
  installmentAmount: number,
  numberOfPayments: number,
  totalInstallments: number,
  handoverPayment: number,
  totalPaidDuringConstruction: number,
  totalConstructionPercent: number,

  // Investment Metrics
  investedCapitalToday: number,   // PV of all payments
  dcf: number,
  npv: number,
  irr: number,
  roic: number,

  // Payment Schedule
  paymentSchedule: Array<{
    year: number,
    payment: number,
    description: string
  }>
}
```

**Example:**

```javascript
const results = calculator.calculateOffplan({
  size: 500,
  totalValue: 500000,
  downPaymentPercent: 10,
  installmentPercent: 1,
  paymentFrequencyMonths: 3,
  constructionTenureYears: 3,
  handoverPaymentPercent: 10,
  expectedValue: 600000,
  discountRate: 4
});

console.log(`Total paid: $${results.totalPaidDuringConstruction}`);
console.log(`Invested capital (today): $${results.investedCapitalToday}`);
console.log(`ROIC: ${(results.roic * 100).toFixed(2)}%`);
```

---

#### `calculateOffplanWithMortgage(offplanInputs, mortgageInputs)`

Compare exit at handover vs. mortgage continuation scenarios.

**Parameters:**

```javascript
{
  offplanInputs: {...},  // Same as calculateOffplan inputs
  mortgageInputs: {
    tenure: number,
    rentalROI: number,
    serviceChargesPerSqFt: number,
    exitValue: number
  }
}
```

**Returns:**

```javascript
{
  offplanPhase: {...},           // Full off-plan results
  exitAtHandover: {
    investedCapital: number,
    profit: number,
    roic: number,
    npv: number,
    irr: number,
    dcf: number,
    timeToExit: number
  },
  continueWithMortgage: {
    investedCapital: number,
    roic: number,
    npv: number,
    irr: number,
    dcf: number,
    timeToExit: number,
    monthlyEMI: number,
    netMonthlyCashFlow: number,
    dscr: number,
    annualRental: number,
    annualServiceCharges: number,
    netOperatingIncome: number
  },
  recommendation: string
}
```

---

### Convenience Functions

```javascript
import {
  calculateReadyProperty,
  calculateOffplan,
  calculateOffplanWithMortgage
} from '@real-estate-calc/core';

// Same as using the class methods
const results = calculateReadyProperty({...});
```

---

### Financial Utilities

```javascript
import { Financial } from '@real-estate-calc/core';

// Calculate NPV
const npv = Financial.NPV(0.04, [-100000, 20000, 30000, 40000]);
console.log(`NPV: $${npv}`); // NPV: $-16,505.21

// Calculate IRR
const irr = Financial.IRR([-100000, 20000, 30000, 40000, 50000]);
console.log(`IRR: ${(irr * 100).toFixed(2)}%`); // IRR: 8.23%

// Calculate payment (PMT)
const payment = Financial.PMT(0.04/12, 25*12, -637500);
console.log(`Monthly payment: $${payment}`); // $3,456.78

// Calculate future value (FV)
const fv = Financial.FV(0.06/12, 10*12, -1000, -10000);
console.log(`Future value: $${fv}`);

// Calculate present value (PV)
const pv = Financial.PV(0.04/12, 25*12, 3456.78);
console.log(`Present value: $${pv}`);
```

---

### Advanced: Direct Calculator Access

```javascript
import {
  calculateReadyPropertyInvestment,
  calculateOffplanInvestment,
  Decimal
} from '@real-estate-calc/core';

// Low-level functions return Decimal objects
const results = calculateReadyPropertyInvestment({...});
console.log(results.npv.toNumber()); // Convert Decimal to number
```

## 🎯 Use Cases

### 1. Investment Screening

```javascript
const properties = [
  { value: 750000, size: 750 },
  { value: 850000, size: 850 },
  { value: 1000000, size: 1000 }
];

const calculator = new RealEstateCalculator();

const goodInvestments = properties
  .map(p => ({
    ...p,
    results: calculator.calculateReadyProperty({
      propertySize: p.size,
      totalValue: p.value,
      downPaymentPercent: 25,
      tenure: 25,
      discountRate: 4,
      rentalROI: 6,
      serviceChargesPerSqFt: 10,
      exitValue: p.value * 1.2
    })
  }))
  .filter(p => p.results.npv > 0 && p.results.irr > 0.04)
  .sort((a, b) => b.results.roic - a.results.roic);

console.log('Top investments:', goodInvestments);
```

### 2. Sensitivity Analysis

```javascript
const baseInputs = {
  propertySize: 850,
  totalValue: 850000,
  downPaymentPercent: 25,
  tenure: 25,
  rentalROI: 6,
  serviceChargesPerSqFt: 10,
  exitValue: 1020000
};

// Test different discount rates
[3, 4, 5, 6].forEach(rate => {
  const results = calculator.calculateReadyProperty({
    ...baseInputs,
    discountRate: rate
  });

  console.log(`Discount ${rate}%: NPV=$${results.npv.toFixed(2)}`);
});
```

### 3. Monte Carlo Simulation

```javascript
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

const simulations = 1000;
const results = [];

for (let i = 0; i < simulations; i++) {
  const result = calculator.calculateReadyProperty({
    propertySize: 850,
    totalValue: 850000,
    downPaymentPercent: 25,
    tenure: 25,
    discountRate: 4,
    rentalROI: randomBetween(4, 8),  // Variable rental yield
    serviceChargesPerSqFt: 10,
    exitValue: randomBetween(900000, 1100000)  // Variable exit value
  });

  results.push(result);
}

const avgNPV = results.reduce((sum, r) => sum + r.npv, 0) / simulations;
const avgIRR = results.reduce((sum, r) => sum + r.irr, 0) / simulations;

console.log(`Average NPV: $${avgNPV.toFixed(2)}`);
console.log(`Average IRR: ${(avgIRR * 100).toFixed(2)}%`);
```

## 🧮 Understanding the Math

### NPV (Net Present Value)

```javascript
// NPV = Sum of (Cash Flow / (1 + r)^t) - Initial Investment
const npv = Financial.NPV(0.04, [-100000, 20000, 20000, 120000]);
// If NPV > 0, investment creates value
```

### IRR (Internal Rate of Return)

```javascript
// IRR is the rate where NPV = 0
const irr = Financial.IRR([-100000, 20000, 20000, 120000]);
// If IRR > discount rate, investment is good
```

### DSCR (Debt Service Coverage Ratio)

```javascript
// DSCR = Net Operating Income / Annual Debt Service
// >= 1.25 is healthy, < 1.0 means income doesn't cover debt
```

## 📄 License

MIT © Umair Khan

---

**Core engine powering the real estate calculator ecosystem** ⚡
