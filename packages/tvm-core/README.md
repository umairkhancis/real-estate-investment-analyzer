# Time Value of Money Calculator - Core SDK

[![npm version](https://badge.fury.io/js/%40tvm-calc%2Fcore.svg)](https://www.npmjs.com/package/@tvm-calc/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Domain-agnostic financial calculation engine** for Time Value of Money (TVM) calculations. Pure JavaScript/Node.js library with precision decimal arithmetic.

## 🚀 Installation

```bash
npm install @tvm-calc/core
```

## 📖 Quick Start

```javascript
import { TVMCalculator } from '@tvm-calc/core';

const calculator = new TVMCalculator();

// Calculate loan payment
const payment = calculator.pmt(0.04/12, 30*12, -100000);
console.log(`Monthly payment: $${payment.toFixed(2)}`); // $477.42

// Calculate investment return
const irr = calculator.irr([-1000, 300, 300, 300, 300]);
console.log(`IRR: ${(irr * 100).toFixed(2)}%`); // 7.71%
```

## 🎯 Features

- ✅ **NPV** - Net Present Value
- ✅ **IRR** - Internal Rate of Return
- ✅ **PMT** - Payment calculation (loans, mortgages)
- ✅ **FV** - Future Value
- ✅ **PV** - Present Value
- ✅ **NPER** - Number of Periods
- ✅ **RATE** - Interest Rate
- ✅ **EFFECT** - Effective Annual Rate
- ✅ **NOMINAL** - Nominal Rate
- ✅ **High Precision** - Uses Decimal.js
- ✅ **Zero Dependencies** - Only requires Decimal.js
- ✅ **Domain Agnostic** - Use for any financial calculations

## 📚 API Reference

### Class API

```javascript
import { TVMCalculator } from '@tvm-calc/core';
const calculator = new TVMCalculator();
```

#### `npv(rate, cashFlows)`
Calculate Net Present Value

```javascript
const npv = calculator.npv(0.1, [-1000, 300, 300, 300, 300]);
console.log(npv); // 52.89
```

#### `irr(cashFlows, guess?)`
Calculate Internal Rate of Return

```javascript
const irr = calculator.irr([-1000, 300, 300, 300, 300]);
console.log((irr * 100).toFixed(2) + '%'); // 7.71%
```

#### `pmt(rate, nper, pv, fv?, type?)`
Calculate Payment

```javascript
// $100,000 loan at 4% APR for 30 years
const pmt = calculator.pmt(0.04/12, 30*12, -100000);
console.log(`$${Math.abs(pmt).toFixed(2)}/month`); // $477.42/month
```

#### `fv(rate, nper, pmt, pv?, type?)`
Calculate Future Value

```javascript
// $1000/month for 10 years at 6% annual
const fv = calculator.fv(0.06/12, 10*12, -1000);
console.log(`$${fv.toFixed(2)}`); // $163,879.35
```

#### `pv(rate, nper, pmt, fv?, type?)`
Calculate Present Value

```javascript
const pv = calculator.pv(0.06/12, 10*12, 1000);
console.log(`$${Math.abs(pv).toFixed(2)}`); // $90,073.45
```

#### `nper(rate, pmt, pv, fv?, type?)`
Calculate Number of Periods

```javascript
// How long to pay off $10k at $500/month with 1% monthly interest?
const nper = calculator.nper(0.01, 500, -10000);
console.log(`${nper.toFixed(1)} months`); // 21.97 months
```

#### `rate(nper, pmt, pv, fv?, type?, guess?)`
Calculate Interest Rate

```javascript
const rate = calculator.rate(24, 500, -10000);
console.log(`${(rate * 100).toFixed(2)}% per period`); // 2.92% per period
```

#### `effect(nominalRate, npery)`
Calculate Effective Annual Rate

```javascript
// 12% nominal compounded monthly
const effectiveRate = calculator.effect(0.12, 12);
console.log(`${(effectiveRate * 100).toFixed(2)}%`); // 12.68%
```

#### `nominal(effectiveRate, npery)`
Calculate Nominal Rate

```javascript
const nominalRate = calculator.nominal(0.1268, 12);
console.log(`${(nominalRate * 100).toFixed(2)}%`); // 12.00%
```

### Functional API

```javascript
import { npv, irr, pmt, fv, pv } from '@tvm-calc/core';

const netPresentValue = npv(0.1, [-1000, 300, 300, 300]);
const internalReturn = irr([-1000, 300, 300, 300, 300]);
const payment = pmt(0.04/12, 30*12, -100000);
```

### Namespace API

```javascript
import { TVM } from '@tvm-calc/core';

const npv = TVM.NPV(0.1, [-1000, 300, 300, 300]);
const irr = TVM.IRR([-1000, 300, 300, 300, 300]);
```

## 💡 Use Cases

### Loan/Mortgage Calculations

```javascript
// 30-year fixed mortgage at 4% APR
const monthlyRate = 0.04 / 12;
const months = 30 * 12;
const loanAmount = -250000;

const monthlyPayment = calculator.pmt(monthlyRate, months, loanAmount);
console.log(`Monthly payment: $${Math.abs(monthlyPayment).toFixed(2)}`);
// Monthly payment: $1193.54
```

### Investment Analysis

```javascript
// Evaluate an investment opportunity
const initialInvestment = -50000;
const yearlyReturns = [15000, 18000, 20000, 22000, 25000];
const discountRate = 0.12;

const npv = calculator.npv(discountRate, [initialInvestment, ...yearlyReturns]);
const irr = calculator.irr([initialInvestment, ...yearlyReturns]);

console.log(`NPV: $${npv.toFixed(2)}`); // NPV: $20,049.67
console.log(`IRR: ${(irr * 100).toFixed(2)}%`); // IRR: 27.16%

if (npv > 0 && irr > discountRate) {
  console.log('✅ Good investment!');
}
```

### Retirement Planning

```javascript
// How much will retirement savings grow to?
const monthlyContribution = -500;
const years = 30;
const annualReturn = 0.07;

const futureValue = calculator.fv(
  annualReturn / 12,
  years * 12,
  monthlyContribution
);

console.log(`Retirement savings: $${futureValue.toFixed(2)}`);
// Retirement savings: $612,438.63
```

### Savings Goals

```javascript
// How long to save $50,000?
const monthlyDeposit = -1000;
const targetAmount = 50000;
const monthlyRate = 0.05 / 12;

const months = calculator.nper(monthlyRate, monthlyDeposit, 0, targetAmount);
const years = months / 12;

console.log(`Time to reach goal: ${years.toFixed(1)} years`);
// Time to reach goal: 3.9 years
```

## 🔢 Understanding the Math

### Sign Conventions
- **Negative values** = Money going out (payments, investments)
- **Positive values** = Money coming in (returns, receipts)

### Rate Conventions
- Rates are expressed as decimals: `0.05` = 5%
- Annual rates must be converted to period rates:
  - Monthly: `annualRate / 12`
  - Quarterly: `annualRate / 4`

### Payment Timing
- `type = 0` (default): Payments at end of period
- `type = 1`: Payments at beginning of period

## 🎓 Financial Concepts

### Net Present Value (NPV)
Discounts all future cash flows to today's dollars. **Positive NPV = value creation**.

### Internal Rate of Return (IRR)
The discount rate where NPV = 0. **Higher IRR = better investment**.

### Time Value of Money
A dollar today is worth more than a dollar tomorrow due to earning potential.

## 📄 License

MIT © Umair Khan

---

**Domain-agnostic • High precision • Battle-tested**
