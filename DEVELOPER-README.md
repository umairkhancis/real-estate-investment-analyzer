# Real Estate Investment Calculator - Developer Documentation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Professional-grade real estate investment analysis toolkit** for developers. Calculate NPV, IRR, DCF, DSCR, and ROIC via CLI, REST API, or JavaScript SDK.

## 🚀 Quick Start

Choose your preferred interface:

### 🖥️ CLI Tool
```bash
npm install -g real-estate-calc
real-estate-calc ready --value 850000 --size 850
```

### 🌐 REST API
```bash
npm install @real-estate-calc/api
npm start

curl -H "X-API-Key: demo-key-12345" \
  http://localhost:3000/api/calculate/ready \
  -H "Content-Type: application/json" \
  -d '{"propertySize": 850, "totalValue": 850000}'
```

### 💻 JavaScript SDK
```bash
npm install @real-estate-calc/core
```

```javascript
import { RealEstateCalculator } from '@real-estate-calc/core';

const calculator = new RealEstateCalculator();
const results = calculator.calculateReadyProperty({
  propertySize: 850,
  totalValue: 850000,
  downPaymentPercent: 25
});

console.log(`NPV: $${results.npv}`);
console.log(`IRR: ${(results.irr * 100).toFixed(2)}%`);
```

## 📦 Packages

This project consists of three separate packages that can be used independently or together:

### 1. **@real-estate-calc/core** - Core SDK
The calculation engine. Use this when you want to integrate real estate calculations into your JavaScript/Node.js application.

- ✅ Zero dependencies (except Decimal.js)
- ✅ Pure functions, no side effects
- ✅ Battle-tested (60+ unit tests)
- ✅ High precision calculations
- ✅ TypeScript-ready (JSDoc annotations)

**[📖 Core Documentation](packages/core/README.md)**

### 2. **real-estate-calc** - CLI Tool
Command-line interface for quick calculations. Perfect for terminal users and shell scripts.

- ✅ Simple commands
- ✅ JSON output option
- ✅ Colorized output
- ✅ Scriptable
- ✅ No coding required

**[📖 CLI Documentation](packages/cli/README.md)**

### 3. **@real-estate-calc/api** - REST API Server
Production-ready HTTP API. Deploy your own calculation service.

- ✅ RESTful endpoints
- ✅ API key authentication
- ✅ Rate limiting
- ✅ OpenAPI/Swagger docs
- ✅ CORS & security headers
- ✅ Docker-ready

**[📖 API Documentation](packages/api/README.md)**

## 🎯 Use Cases

### For Developers

**1. Build Investment Apps**
```javascript
import { RealEstateCalculator } from '@real-estate-calc/core';

// Integrate into your React/Vue/Angular app
function PropertyCard({ property }) {
  const calculator = new RealEstateCalculator();
  const results = calculator.calculateReadyProperty(property);

  return (
    <div>
      <h3>{property.name}</h3>
      <p>NPV: ${results.npv.toLocaleString()}</p>
      <p>IRR: {(results.irr * 100).toFixed(2)}%</p>
    </div>
  );
}
```

**2. Build Comparison Tools**
```javascript
const properties = [...];
const calculator = new RealEstateCalculator();

const ranked = properties
  .map(p => ({
    ...p,
    results: calculator.calculateReadyProperty(p)
  }))
  .sort((a, b) => b.results.npv - a.results.npv);
```

**3. API Integration**
```python
import requests

response = requests.post(
    'http://localhost:3000/api/calculate/ready',
    headers={'X-API-Key': 'your-key'},
    json={'propertySize': 850, 'totalValue': 850000}
)

results = response.json()['results']
print(f"NPV: ${results['npv']}")
```

### For Data Scientists

**Monte Carlo Simulation**
```javascript
// Run 10,000 simulations with variable inputs
const results = [];
for (let i = 0; i < 10000; i++) {
  results.push(calculator.calculateReadyProperty({
    propertySize: 850,
    totalValue: 850000,
    rentalROI: randomBetween(4, 8),
    exitValue: randomBetween(900000, 1100000)
  }));
}

const avgNPV = mean(results.map(r => r.npv));
const stdNPV = std(results.map(r => r.npv));
```

### For DevOps/Automation

**Batch Processing**
```bash
#!/bin/bash
for value in 750000 850000 950000; do
  real-estate-calc ready --value $value --size 850 --json \
    | jq '{value: .inputs.totalValue, npv: .results.npv}'
done
```

**CI/CD Integration**
```yaml
# .github/workflows/analysis.yml
- name: Analyze Properties
  run: |
    real-estate-calc ready --value 850000 --size 850 --json > results.json
    if [ $(jq '.results.npv' results.json) -lt 0 ]; then
      echo "Investment fails NPV test"
      exit 1
    fi
```

## 📊 What Can You Calculate?

### Ready Properties (with Mortgage)
- **NPV** - Net Present Value (profit in today's dollars)
- **IRR** - Internal Rate of Return (annual return %)
- **DCF** - Discounted Cash Flow (present value)
- **DSCR** - Debt Service Coverage Ratio (income vs debt)
- **ROIC** - Return on Invested Capital (total return %)
- Cash flows, EMI, rental income, service charges, etc.

### Off-Plan Properties (Developer Plans)
- **NPV, IRR, DCF, ROIC** - Same metrics as ready properties
- Payment schedule with PV calculations
- Invested capital in today's dollars
- Exit vs. continuation scenarios

### Financial Utilities
- **NPV** - Net Present Value
- **IRR** - Internal Rate of Return
- **PMT** - Periodic Payment
- **FV** - Future Value
- **PV** - Present Value

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Layer                         │
├──────────────┬──────────────┬──────────────────────┤
│  CLI Tool    │   REST API   │   Direct SDK Usage   │
│ (Commander)  │  (Express)   │   (import/require)   │
└──────┬───────┴──────┬───────┴───────┬──────────────┘
       │              │               │
       └──────────────┼───────────────┘
                      │
              ┌───────▼────────┐
              │   Core SDK     │
              │ (@real-estate- │
              │  calc/core)    │
              └───────┬────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼───┐   ┌────▼────┐   ┌───▼────┐
   │Ready   │   │Off-Plan │   │Financial│
   │Property│   │Property │   │Utilities│
   │Calc    │   │Calc     │   │(NPV,IRR)│
   └────────┘   └─────────┘   └────────┘
```

## 📚 Examples

See the [packages/examples/](packages/examples/) directory for complete examples:

- **[basic-usage.js](packages/examples/basic-usage.js)** - Simple calculations
- **[comparison.js](packages/examples/comparison.js)** - Compare multiple properties
- **[api-client.js](packages/examples/api-client.js)** - API integration

### Running Examples

```bash
# Core SDK examples
cd packages/examples
node basic-usage.js
node comparison.js

# API client example (requires API server running)
cd packages/api && npm start &
cd packages/examples && node api-client.js
```

## 🛠️ Installation & Setup

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/real-estate-calc.git
cd real-estate-calc

# Install dependencies for all packages
cd packages/core && npm install
cd ../cli && npm install
cd ../api && npm install

# Run tests
cd packages/core
npm test
```

### Publishing Packages

```bash
# Publish core package
cd packages/core
npm publish --access public

# Publish CLI
cd packages/cli
npm publish

# Publish API
cd packages/api
npm publish --access public
```

## 🔐 API Authentication

The REST API uses API key authentication. Set your keys via environment variable:

```bash
# Single key
API_KEYS=your-secret-key npm start

# Multiple keys
API_KEYS=key1,key2,key3 npm start
```

**Default key for development:** `demo-key-12345`

## 📖 API Documentation

### Interactive Swagger UI

Start the API server and visit:
- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: See `packages/api/src/openapi.json`

### Example Requests

**Ready Property:**
```bash
curl -X POST http://localhost:3000/api/calculate/ready \
  -H "X-API-Key: demo-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "propertySize": 850,
    "totalValue": 850000,
    "downPaymentPercent": 25,
    "rentalROI": 6
  }'
```

**Off-Plan Property:**
```bash
curl -X POST http://localhost:3000/api/calculate/offplan \
  -H "X-API-Key: demo-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "size": 500,
    "totalValue": 500000,
    "constructionTenureYears": 3
  }'
```

## 🧪 Testing

All packages include comprehensive tests:

```bash
# Run all tests
cd packages/core
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Test Coverage:** 60+ tests covering all calculation scenarios

## 🚢 Deployment

### Docker Deployment (API)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY packages/api/package*.json ./
COPY packages/core ../core
RUN npm ci --only=production
COPY packages/api .
EXPOSE 3000
ENV API_KEYS=your-production-key
CMD ["npm", "start"]
```

```bash
docker build -t real-estate-api .
docker run -p 3000:3000 \
  -e API_KEYS=your-key \
  real-estate-api
```

### Cloud Deployment

**Heroku:**
```bash
heroku create
heroku config:set API_KEYS=your-key
git push heroku main
```

**AWS/Azure/GCP:**
- Deploy as containerized app
- Set `API_KEYS` environment variable
- Expose port 3000
- Optional: Add load balancer and SSL

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new features
4. Ensure all tests pass (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT © Umair Khan

This means you can:
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Use privately

## 🆘 Support

- **Documentation**: See individual package READMEs
- **Issues**: [GitHub Issues](https://github.com/yourusername/real-estate-calc/issues)
- **Email**: umairkhan.cis@gmail.com

## 🗺️ Roadmap

### Planned Features

- [ ] TypeScript definitions
- [ ] Python SDK
- [ ] GraphQL API
- [ ] Webhook support
- [ ] Database integration
- [ ] Historical data tracking
- [ ] Excel export
- [ ] PDF report generation

### Future Packages

- **@real-estate-calc/reports** - Generate investment reports
- **@real-estate-calc/charts** - Visualization library
- **@real-estate-calc/database** - Data persistence layer

## 📊 Project Stats

- **3 Packages**: Core SDK, CLI, REST API
- **60+ Tests**: Comprehensive test coverage
- **Zero Breaking Changes**: Semantic versioning
- **Production Ready**: Used in real applications

---

**Built with ❤️ for developers and investors**

*Questions? Open an issue or reach out!*
