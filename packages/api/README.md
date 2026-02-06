# Real Estate Investment Calculator - REST API

[![npm version](https://badge.fury.io/js/%40real-estate-calc%2Fapi.svg)](https://www.npmjs.com/package/@real-estate-calc/api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Production-ready REST API** for real estate investment calculations. Calculate NPV, IRR, DCF, DSCR, and ROIC via HTTP endpoints.

## 🚀 Quick Start

### Installation

```bash
npm install @real-estate-calc/api
```

### Running the Server

```bash
# Start the server
npm start

# Development mode with auto-reload
npm run dev

# Custom port
PORT=8080 npm start

# With custom API keys
API_KEYS=key1,key2,key3 npm start
```

The server will start on `http://localhost:3000` by default.

## 📖 API Documentation

### Interactive Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api/docs
- **API Info**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

### OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
- **JSON**: `src/openapi.json`
- **Import into Postman, Insomnia, or any API client**

## 🔐 Authentication

All calculation endpoints require an API key.

### Providing Your API Key

**Option 1: Header (Recommended)**
```bash
curl -H "X-API-Key: demo-key-12345" \
  http://localhost:3000/api/calculate/ready \
  -H "Content-Type: application/json" \
  -d '{"propertySize": 850, "totalValue": 850000}'
```

**Option 2: Query Parameter**
```bash
curl "http://localhost:3000/api/calculate/ready?apiKey=demo-key-12345" \
  -H "Content-Type: application/json" \
  -d '{"propertySize": 850, "totalValue": 850000}'
```

### Default API Key

The server comes with a default demo key: `demo-key-12345`

### Setting Custom API Keys

```bash
# Set via environment variable
export API_KEYS=your-key-1,your-key-2,your-key-3
npm start

# Or in one line
API_KEYS=my-secret-key npm start
```

## 🎯 Endpoints

### System Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-05T10:00:00.000Z",
  "version": "1.0.0"
}
```

#### API Information
```http
GET /api
```

**Response:**
```json
{
  "name": "Real Estate Investment Calculator API",
  "version": "1.0.0",
  "description": "REST API for real estate investment analysis",
  "documentation": "/api/docs",
  "endpoints": { ... }
}
```

---

### Calculation Endpoints

#### 1. Calculate Ready Property

```http
POST /api/calculate/ready
```

Calculate investment metrics for a ready property with mortgage financing.

**Request Body:**
```json
{
  "propertySize": 850,
  "totalValue": 850000,
  "downPaymentPercent": 25,
  "registrationFeePercent": 4,
  "tenure": 25,
  "discountRate": 4,
  "rentalROI": 6,
  "serviceChargesPerSqFt": 10,
  "exitValue": 1020000
}
```

**Required Fields:**
- `propertySize` - Property size in square feet
- `totalValue` - Total property value

**Optional Fields** (with defaults):
- `downPaymentPercent` (25) - Down payment percentage
- `registrationFeePercent` (4) - Registration fee percentage
- `tenure` (25) - Loan tenure in years
- `discountRate` (4) - Annual discount rate percentage
- `rentalROI` (6) - Expected rental ROI percentage
- `serviceChargesPerSqFt` (10) - Service charges per sq ft
- `exitValue` (120% of totalValue) - Expected exit value

**Response:**
```json
{
  "success": true,
  "inputs": { ... },
  "results": {
    "pricePerSqFt": 1000,
    "downPaymentAmt": 212500,
    "registrationFee": 34000,
    "agentFee": 17000,
    "investedCapital": 263500,
    "financingAmount": 637500,
    "annualRental": 51000,
    "annualServiceCharges": 8500,
    "netOperatingIncome": 42500,
    "monthlyEMI": 3456.78,
    "annualDebtService": 41481.36,
    "netAnnualCashFlow": 1018.64,
    "netMonthlyCashFlow": 84.89,
    "dcf": 1234567.89,
    "npv": 234567.89,
    "irr": 0.085,
    "dscr": 1.35,
    "roic": 0.452,
    "cashFlows": [-263500, 1018.64, ...],
    "exitYear": 25,
    "discountRate": 0.04
  },
  "timestamp": "2026-02-05T10:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/calculate/ready \
  -H "X-API-Key: demo-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "propertySize": 850,
    "totalValue": 850000,
    "downPaymentPercent": 25,
    "tenure": 25,
    "rentalROI": 6,
    "exitValue": 1020000
  }'
```

---

#### 2. Calculate Off-Plan Property

```http
POST /api/calculate/offplan
```

Calculate investment metrics for off-plan properties with developer payment plans.

**Request Body:**
```json
{
  "size": 500,
  "totalValue": 500000,
  "downPaymentPercent": 10,
  "installmentPercent": 1,
  "paymentFrequencyMonths": 3,
  "constructionTenureYears": 3,
  "handoverPaymentPercent": 10,
  "expectedValue": 600000,
  "discountRate": 4
}
```

**Required Fields:**
- `size` - Property size in square feet
- `totalValue` - Total property value

**Optional Fields** (with defaults):
- `downPaymentPercent` (10) - Down payment percentage
- `installmentPercent` (1) - Installment payment percentage
- `paymentFrequencyMonths` (3) - Payment frequency: 1, 3, 6, or 12
- `constructionTenureYears` (3) - Construction period in years
- `handoverPaymentPercent` (10) - Payment at handover percentage
- `expectedValue` (120% of totalValue) - Expected value at handover
- `discountRate` (4) - Annual discount rate percentage

**Response:**
```json
{
  "success": true,
  "inputs": { ... },
  "results": {
    "downPayment": 50000,
    "installmentAmount": 5000,
    "numberOfPayments": 12,
    "totalInstallments": 60000,
    "handoverPayment": 50000,
    "totalPaidDuringConstruction": 160000,
    "totalConstructionPercent": 0.32,
    "investedCapitalToday": 154321.76,
    "dcf": 523456.78,
    "npv": 369135.02,
    "irr": 0.187,
    "roic": 2.39,
    "paymentSchedule": [
      { "year": 0, "payment": 50000, "description": "Down payment" },
      { "year": 0.25, "payment": 5000, "description": "Installment 1" },
      ...
    ]
  },
  "timestamp": "2026-02-05T10:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/calculate/offplan \
  -H "X-API-Key: demo-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "size": 500,
    "totalValue": 500000,
    "downPaymentPercent": 10,
    "constructionTenureYears": 3,
    "expectedValue": 600000
  }'
```

---

#### 3. Calculate Off-Plan with Mortgage Continuation

```http
POST /api/calculate/offplan-with-mortgage
```

Compare two scenarios: exit at handover vs. continue with mortgage.

**Request Body:**
```json
{
  "offplanInputs": {
    "size": 500,
    "totalValue": 500000,
    "downPaymentPercent": 10,
    "installmentPercent": 1,
    "paymentFrequencyMonths": 3,
    "constructionTenureYears": 3,
    "handoverPaymentPercent": 10,
    "expectedValue": 600000,
    "discountRate": 4
  },
  "mortgageInputs": {
    "tenure": 25,
    "rentalROI": 6,
    "serviceChargesPerSqFt": 10,
    "exitValue": 750000
  }
}
```

**Response:**
```json
{
  "success": true,
  "inputs": { ... },
  "results": {
    "offplanPhase": { ... },
    "exitAtHandover": {
      "investedCapital": 154321.76,
      "profit": 445678.24,
      "roic": 2.89,
      "npv": 369135.02,
      "irr": 0.187,
      "dcf": 523456.78,
      "timeToExit": 3
    },
    "continueWithMortgage": {
      "investedCapital": 164321.76,
      "roic": 3.56,
      "npv": 485234.12,
      "irr": 0.142,
      "dcf": 649555.88,
      "timeToExit": 28,
      "monthlyEMI": 2345.67,
      "netMonthlyCashFlow": 654.32,
      "dscr": 1.28,
      "annualRental": 36000,
      "annualServiceCharges": 5000,
      "netOperatingIncome": 31000
    },
    "recommendation": "Exit at handover recommended"
  },
  "timestamp": "2026-02-05T10:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/calculate/offplan-with-mortgage \
  -H "X-API-Key: demo-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "offplanInputs": {
      "size": 500,
      "totalValue": 500000,
      "constructionTenureYears": 3
    },
    "mortgageInputs": {
      "tenure": 25,
      "rentalROI": 6,
      "exitValue": 750000
    }
  }'
```

## 📊 Understanding the Response

### Key Metrics Explained

- **DCF (Discounted Cash Flow)**: Present value of all future cash flows
- **NPV (Net Present Value)**: Profit/loss in today's dollars (positive = good)
- **IRR (Internal Rate of Return)**: Annual percentage return (compare to discount rate)
- **DSCR (Debt Service Coverage Ratio)**: Rental income ÷ mortgage payment (>1.25 is healthy)
- **ROIC (Return on Invested Capital)**: Total return on money invested

### Decision Making

```javascript
// Good Investment Criteria
if (npv > 0 && irr > discountRate && dscr >= 1.25) {
  // ✓ Strong investment
}

// Red Flags
if (npv < 0 || irr < discountRate || dscr < 1.0) {
  // ✗ Avoid this investment
}
```

## 🔒 Security Features

- **API Key Authentication**: All endpoints protected
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin access
- **Helmet**: Security headers enabled
- **Input Validation**: All inputs sanitized

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t real-estate-api .
docker run -p 3000:3000 -e API_KEYS=your-secret-key real-estate-api
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `API_KEYS` | Comma-separated API keys | demo-key-12345 |
| `NODE_ENV` | Environment (development/production) | development |

### Production Recommendations

1. **Use Strong API Keys**: Generate secure random keys
2. **Enable HTTPS**: Deploy behind a reverse proxy (nginx, Caddy)
3. **Set Custom Rate Limits**: Adjust based on your needs
4. **Monitor Logs**: Set up logging and monitoring
5. **Database Integration**: Store calculations for auditing

## 💻 Code Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function calculateInvestment() {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/calculate/ready',
      {
        propertySize: 850,
        totalValue: 850000,
        downPaymentPercent: 25
      },
      {
        headers: {
          'X-API-Key': 'demo-key-12345',
          'Content-Type': 'application/json'
        }
      }
    );

    const { results } = response.data;
    console.log(`NPV: $${results.npv.toFixed(2)}`);
    console.log(`IRR: ${(results.irr * 100).toFixed(2)}%`);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

calculateInvestment();
```

### Python

```python
import requests

def calculate_investment():
    url = "http://localhost:3000/api/calculate/ready"
    headers = {
        "X-API-Key": "demo-key-12345",
        "Content-Type": "application/json"
    }
    data = {
        "propertySize": 850,
        "totalValue": 850000,
        "downPaymentPercent": 25
    }

    response = requests.post(url, json=data, headers=headers)
    results = response.json()["results"]

    print(f"NPV: ${results['npv']:.2f}")
    print(f"IRR: {results['irr'] * 100:.2f}%")

calculate_investment()
```

### cURL

```bash
# Store API key in variable
API_KEY="demo-key-12345"

# Make request
curl -X POST http://localhost:3000/api/calculate/ready \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "propertySize": 850,
    "totalValue": 850000,
    "downPaymentPercent": 25
  }' | jq '.results | {npv, irr, dscr, roic}'
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/health

# Test calculation (no auth required for docs)
curl http://localhost:3000/api

# Test with authentication
curl -H "X-API-Key: demo-key-12345" \
  http://localhost:3000/api/calculate/ready \
  -H "Content-Type: application/json" \
  -d '{"propertySize": 850, "totalValue": 850000}'
```

## 🐛 Error Handling

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 401 | Missing API Key | Add `X-API-Key` header |
| 403 | Invalid API Key | Check your API key is correct |
| 400 | Missing parameters | Include required fields |
| 429 | Rate limit exceeded | Wait and retry |
| 500 | Calculation error | Check input values are valid |

## 📚 Additional Resources

- **CLI Tool**: `real-estate-calc` package
- **Core SDK**: `@real-estate-calc/core` for programmatic usage
- **OpenAPI Spec**: Import into Postman/Insomnia
- **Web Application**: Full UI-based calculator

## 📄 License

MIT © Umair Khan

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/real-estate-calc/issues)
- **Email**: umairkhan.cis@gmail.com

---

**Built for developers, by developers** 🚀
