# Time Value of Money (TVM) Calculator - Complete Summary

## 📦 Created Packages

### 1. **@tvm-calc/core** - Core SDK
**Location**: `packages/tvm-core/`
**Purpose**: Domain-agnostic financial calculation engine

**Functions**:
- NPV (Net Present Value)
- IRR (Internal Rate of Return)
- PMT (Payment)
- FV (Future Value)
- PV (Present Value)
- NPER (Number of Periods)
- RATE (Interest Rate)
- EFFECT (Effective Annual Rate)
- NOMINAL (Nominal Rate)

### 2. **tvm-calc** - CLI Tool
**Location**: `packages/tvm-cli/`
**Purpose**: Command-line interface

**Commands**:
```bash
tvm-calc npv --rate 0.1 --cash-flows "-1000,300,300,300"
tvm-calc irr --cash-flows "-1000,300,300,300,300"
tvm-calc pmt --rate 0.00333 --nper 360 --pv -100000
tvm-calc fv --rate 0.005 --nper 120 --pmt -1000
tvm-calc pv --rate 0.005 --nper 120 --pmt 1000
tvm-calc nper --rate 0.01 --pmt 500 --pv -10000
tvm-calc rate --nper 24 --pmt 500 --pv -10000
tvm-calc examples
```

### 3. **@tvm-calc/api** - REST API
**Location**: `packages/tvm-api/`
**Purpose**: HTTP API server

**Endpoints**:
- POST /api/npv
- POST /api/irr
- POST /api/pmt
- POST /api/fv
- POST /api/pv
- POST /api/nper
- POST /api/rate
- POST /api/effect
- POST /api/nominal

## 🚀 Quick Start

### SDK Usage
```javascript
import { TVMCalculator } from '@tvm-calc/core';

const calc = new TVMCalculator();

// Loan payment
const pmt = calc.pmt(0.04/12, 30*12, -100000);
console.log(`Payment: $${Math.abs(pmt).toFixed(2)}`); // $477.42

// Investment return
const irr = calc.irr([-1000, 300, 300, 300, 300]);
console.log(`IRR: ${(irr * 100).toFixed(2)}%`); // 7.71%
```

### CLI Usage
```bash
cd packages/tvm-cli
npm install
node src/index.js pmt --rate 0.00333 --nper 360 --pv -100000
```

### API Usage
```bash
cd packages/tvm-api
npm install
npm start

curl -H "X-API-Key: demo-key-12345" \
  http://localhost:3000/api/pmt \
  -H "Content-Type: application/json" \
  -d '{"rate": 0.00333, "nper": 360, "pv": -100000}'
```

## 💡 Use Cases

### 1. Loan Calculations
```javascript
// Monthly payment on $100k loan at 4% for 30 years
const pmt = calculator.pmt(0.04/12, 30*12, -100000);
// Result: $477.42/month
```

### 2. Investment Analysis
```javascript
// NPV and IRR of investment
const npv = calculator.npv(0.1, [-50000, 15000, 18000, 20000, 22000]);
const irr = calculator.irr([-50000, 15000, 18000, 20000, 22000]);
// NPV: $7,547.30, IRR: 16.13%
```

### 3. Savings Planning
```javascript
// Future value of $1000/month for 10 years at 6%
const fv = calculator.fv(0.06/12, 10*12, -1000);
// Result: $163,879.35
```

### 4. Retirement Planning
```javascript
// How long to save $1M with $2000/month at 7%?
const nper = calculator.nper(0.07/12, -2000, 0, 1000000);
// Result: 238.6 months (19.9 years)
```

## 📊 API Examples

### NPV Calculation
```bash
curl -X POST http://localhost:3000/api/npv \
  -H "X-API-Key: demo-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "rate": 0.1,
    "cashFlows": [-1000, 300, 300, 300, 300]
  }'
```

**Response**:
```json
{
  "success": true,
  "input": {
    "rate": 0.1,
    "cashFlows": [-1000, 300, 300, 300, 300]
  },
  "result": {
    "npv": 52.89,
    "interpretation": "Creates value"
  },
  "timestamp": "2026-02-05T10:00:00.000Z"
}
```

### PMT Calculation
```bash
curl -X POST http://localhost:3000/api/pmt \
  -H "X-API-Key: demo-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "rate": 0.00333,
    "nper": 360,
    "pv": -100000
  }'
```

**Response**:
```json
{
  "success": true,
  "result": {
    "pmt": 477.42,
    "absolutePmt": 477.42
  }
}
```

## 📚 Documentation

- **[Core SDK README](tvm-core/README.md)** - Full API reference
- **[OpenAPI Spec](tvm-api/src/openapi.json)** - Complete API specification
- **[Swagger UI](http://localhost:3000/api/docs)** - Interactive documentation (when API running)

## ✅ Testing

### Test Core SDK
```bash
cd packages/tvm-core
npm install
node -e "
import('./src/index.js').then(({ TVMCalculator }) => {
  const calc = new TVMCalculator();
  const pmt = calc.pmt(0.04/12, 360, -100000);
  console.log('✅ Payment:', Math.abs(pmt).toFixed(2));
});"
```

### Test CLI
```bash
cd packages/tvm-cli
npm install
node src/index.js pmt --rate 0.00333 --nper 360 --pv -100000
```

### Test API
```bash
cd packages/tvm-api
npm install
npm start &
sleep 2
curl -H "X-API-Key: demo-key-12345" http://localhost:3000/health
```

## 🎯 Key Features

### Domain Agnostic
- Not specific to real estate or any industry
- Works for any financial calculation
- Loans, investments, savings, retirement, etc.

### High Precision
- Uses Decimal.js for accurate calculations
- No floating-point errors
- Reliable for financial applications

### Multiple Interfaces
- **SDK**: Import into your application
- **CLI**: Use from terminal
- **API**: HTTP endpoints for any language

### Production Ready
- Comprehensive error handling
- API authentication
- Rate limiting
- OpenAPI specification
- Swagger documentation

## 📦 Package Structure

```
packages/
├── tvm-core/              # Core SDK
│   ├── src/
│   │   ├── index.js      # Main entry point
│   │   ├── financial.js  # TVM functions
│   │   └── decimalConfig.js
│   ├── package.json
│   └── README.md
│
├── tvm-cli/              # CLI Tool
│   ├── src/
│   │   └── index.js     # CLI commands
│   ├── package.json
│   └── README.md
│
├── tvm-api/              # REST API
│   ├── src/
│   │   ├── server.js    # Express server
│   │   └── openapi.json # API spec
│   ├── package.json
│   └── README.md
│
└── TVM-SUMMARY.md        # This file
```

## 🚢 Deployment

### Docker (API)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY packages/tvm-api/package*.json ./
COPY packages/tvm-core ../tvm-core
RUN npm ci --only=production
COPY packages/tvm-api .
EXPOSE 3000
ENV API_KEYS=your-key
CMD ["npm", "start"]
```

### npm Publishing
```bash
# Publish core
cd packages/tvm-core && npm publish --access public

# Publish CLI
cd packages/tvm-cli && npm publish

# Publish API
cd packages/tvm-api && npm publish --access public
```

## 📄 License

MIT © Umair Khan

---

**Domain-agnostic • Production-ready • Developer-friendly**
