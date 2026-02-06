# Quick Start Guide

Get started with the Real Estate Investment Calculator in under 5 minutes!

## Choose Your Interface

### 🖥️ Option 1: CLI Tool (Easiest)

Perfect for: Terminal users, quick calculations, shell scripts

**Install:**
```bash
cd packages/cli
npm install
```

**Use:**
```bash
# Ready property calculation
node src/index.js ready --value 850000 --size 850

# Off-plan property calculation
node src/index.js offplan --value 500000 --size 500 --construction 3

# JSON output for scripting
node src/index.js ready --value 850000 --size 850 --json
```

---

### 🌐 Option 2: REST API (For Applications)

Perfect for: Web apps, mobile apps, microservices

**Install & Start:**
```bash
cd packages/api
npm install
npm start
```

Server runs on http://localhost:3000

**Test:**
```bash
curl -H "X-API-Key: demo-key-12345" \
  http://localhost:3000/api/calculate/ready \
  -H "Content-Type: application/json" \
  -d '{"propertySize": 850, "totalValue": 850000}'
```

**View Docs:**
Open http://localhost:3000/api/docs in your browser

---

### 💻 Option 3: JavaScript SDK (For Developers)

Perfect for: Node.js apps, React/Vue apps, custom integrations

**Install:**
```bash
cd packages/core
npm install
```

**Use:**
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

console.log(`NPV: $${results.npv}`);
console.log(`IRR: ${(results.irr * 100).toFixed(2)}%`);
console.log(`DSCR: ${results.dscr.toFixed(2)}`);
```

---

## Running Examples

We've included several examples to help you get started:

```bash
# Basic usage example
cd packages/examples
node basic-usage.js

# Property comparison
node comparison.js

# API client example (requires API server running)
cd packages/api && npm start &
cd packages/examples && node api-client.js
```

---

## Common Use Cases

### 1. Evaluate a Single Property

**CLI:**
```bash
node src/index.js ready --value 850000 --size 850 --down-payment 25
```

**SDK:**
```javascript
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
```

### 2. Compare Multiple Properties

See [packages/examples/comparison.js](packages/examples/comparison.js)

### 3. API Integration

See [packages/examples/api-client.js](packages/examples/api-client.js)

---

## Understanding the Results

### Key Metrics

- **NPV (Net Present Value)**: Positive = good investment, negative = bad
- **IRR (Internal Rate of Return)**: Compare to your discount rate (hurdle rate)
  - IRR > discount rate = good
  - IRR < discount rate = bad
- **DSCR (Debt Service Coverage Ratio)**:
  - ≥ 1.25 = healthy
  - 1.0 - 1.25 = marginal
  - < 1.0 = risky (income doesn't cover mortgage)
- **ROIC (Return on Invested Capital)**: Higher is better

### Decision Making

```javascript
if (results.npv > 0 &&
    results.irr > results.discountRate &&
    results.dscr >= 1.25) {
  // ✅ Strong investment!
} else if (results.npv > 0) {
  // ⚠️ Marginal investment
} else {
  // ❌ Poor investment, avoid
}
```

---

## Next Steps

1. **Read the documentation:**
   - [Core SDK Documentation](core/README.md)
   - [CLI Documentation](cli/README.md)
   - [API Documentation](api/README.md)

2. **Try the examples:**
   - Run `node packages/examples/basic-usage.js`
   - Modify the inputs and see how results change

3. **Integrate into your project:**
   - Choose the interface that fits your needs
   - Follow the documentation for your chosen package

---

## Need Help?

- **Documentation**: See package READMEs
- **Examples**: Check `packages/examples/`
- **Issues**: Open a GitHub issue
- **Email**: umairkhan.cis@gmail.com

---

**Happy calculating! 🎉**
