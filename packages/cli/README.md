# Real Estate Investment Calculator - CLI Tool

[![npm version](https://badge.fury.io/js/real-estate-calc.svg)](https://www.npmjs.com/package/real-estate-calc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Analyze real estate investments from your command line** - Calculate NPV, IRR, DCF, DSCR, and ROIC instantly.

## 🚀 Quick Start

### Installation

```bash
# Global installation (recommended)
npm install -g real-estate-calc

# Or use npx (no installation required)
npx real-estate-calc ready --value 850000 --size 850
```

### Basic Usage

```bash
# Ready property with mortgage
real-estate-calc ready --value 850000 --size 850 --down-payment 25

# Off-plan property
real-estate-calc offplan --value 500000 --size 500 --construction 3

# Show examples
real-estate-calc examples
```

## 📖 Commands

### `ready` - Ready Property Calculator

Calculate investment metrics for a ready property with mortgage financing.

**Syntax:**
```bash
real-estate-calc ready [options]
```

**Required Options:**
- `-v, --value <number>` - Total property value
- `-s, --size <number>` - Property size in square feet

**Optional Parameters:**
| Option | Description | Default |
|--------|-------------|---------|
| `-d, --down-payment <percent>` | Down payment percentage | 25 |
| `-r, --registration <percent>` | Registration fee percentage | 4 |
| `-t, --tenure <years>` | Loan tenure in years | 25 |
| `--discount <percent>` | Discount rate (hurdle rate) | 4 |
| `--rental <percent>` | Rental ROI percentage | 6 |
| `--service <amount>` | Service charges per sq ft | 10 |
| `-e, --exit <value>` | Expected exit value | 120% of value |
| `-j, --json` | Output as JSON | false |

**Examples:**

```bash
# Basic calculation with defaults
real-estate-calc ready --value 850000 --size 850

# Custom parameters
real-estate-calc ready \
  --value 1000000 \
  --size 1000 \
  --down-payment 30 \
  --tenure 20 \
  --rental 7 \
  --discount 5 \
  --exit 1500000

# JSON output for scripting
real-estate-calc ready --value 850000 --size 850 --json
```

**Output:**

```
📊 Investment Analysis Results

═══════════════════════════════════════════════════════════

💰 Key Financial Metrics:

DCF (Discounted Cash Flow):
  $1,234,567.89

NPV (Net Present Value):
  $234,567.89 ✓ Creates Value

IRR (Internal Rate of Return):
  8.50%

ROIC (Return on Invested Capital):
  45.20%

DSCR (Debt Service Coverage Ratio):
  1.35 ✓ Healthy

💵 Investment Breakdown:

Invested Capital: $255,000.00
Monthly EMI: $3,456.78
Net Annual Cash Flow: $8,901.23

═══════════════════════════════════════════════════════════
```

---

### `offplan` - Off-Plan Property Calculator

Calculate investment metrics for off-plan properties with developer payment plans.

**Syntax:**
```bash
real-estate-calc offplan [options]
```

**Required Options:**
- `-v, --value <number>` - Total property value
- `-s, --size <number>` - Property size in square feet

**Optional Parameters:**
| Option | Description | Default |
|--------|-------------|---------|
| `-d, --down-payment <percent>` | Down payment percentage | 10 |
| `-i, --installment <percent>` | Installment payment percentage | 1 |
| `-f, --frequency <months>` | Payment frequency (1,3,6,12) | 3 |
| `-c, --construction <years>` | Construction period in years | 3 |
| `-h, --handover <percent>` | Handover payment percentage | 10 |
| `-e, --expected <value>` | Expected value at handover | 120% of value |
| `--discount <percent>` | Discount rate | 4 |
| `-j, --json` | Output as JSON | false |

**Examples:**

```bash
# Basic off-plan calculation
real-estate-calc offplan --value 500000 --size 500

# Custom payment plan
real-estate-calc offplan \
  --value 500000 \
  --size 500 \
  --down-payment 15 \
  --installment 2 \
  --frequency 3 \
  --construction 2.5 \
  --handover 5

# JSON output
real-estate-calc offplan --value 500000 --size 500 --json
```

---

### `examples` - Show Example Commands

Display example commands for quick reference.

```bash
real-estate-calc examples
```

## 🎯 Use Cases

### 1. Quick Property Evaluation

```bash
# Evaluate a property you're considering
real-estate-calc ready --value 750000 --size 800 --down-payment 20
```

### 2. Compare Different Scenarios

```bash
# Conservative approach (higher down payment, longer tenure)
real-estate-calc ready --value 850000 --size 850 --down-payment 35 --tenure 30

# Aggressive approach (lower down payment, shorter tenure)
real-estate-calc ready --value 850000 --size 850 --down-payment 20 --tenure 15
```

### 3. Developer Plan Analysis

```bash
# Analyze off-plan property with typical 3-year construction
real-estate-calc offplan \
  --value 600000 \
  --size 650 \
  --down-payment 10 \
  --installment 1 \
  --construction 3
```

### 4. Script Integration

```bash
# Use JSON output in scripts
result=$(real-estate-calc ready --value 850000 --size 850 --json)
npv=$(echo $result | jq '.results.npv')
echo "NPV: $npv"
```

## 📊 Understanding the Metrics

### DCF (Discounted Cash Flow)
The present value of all future cash flows. Tells you what the investment is worth in today's dollars.

### NPV (Net Present Value)
Profit/loss in today's dollars. **Positive = good investment**, negative = avoid.

### IRR (Internal Rate of Return)
The annual percentage return you'll earn. **Compare this to your discount rate** (hurdle rate).

- **IRR > Discount Rate** ✓ Good investment
- **IRR < Discount Rate** ✗ Poor investment

### DSCR (Debt Service Coverage Ratio)
Measures if rental income covers mortgage payments.

- **≥ 1.25** ✓ Healthy
- **1.0 - 1.25** ⚠️ Marginal
- **< 1.0** ✗ Insufficient income

### ROIC (Return on Invested Capital)
Total return percentage on the money you put in. **Higher is better.**

## 🔧 Advanced Usage

### Environment Variables

```bash
# Set default values
export RE_CALC_DISCOUNT_RATE=5
export RE_CALC_RENTAL_ROI=7

real-estate-calc ready --value 850000 --size 850
```

### Piping and Automation

```bash
# Calculate multiple properties
for value in 800000 850000 900000; do
  echo "Property Value: $value"
  real-estate-calc ready --value $value --size 850 --json | jq '.results.npv'
done
```

### Integration with Other Tools

```bash
# Export to CSV
real-estate-calc ready --value 850000 --size 850 --json | \
  jq -r '[.results.npv, .results.irr, .results.roic] | @csv' > results.csv
```

## 🆘 Getting Help

```bash
# Show all commands
real-estate-calc --help

# Show command-specific help
real-estate-calc ready --help
real-estate-calc offplan --help

# Show version
real-estate-calc --version
```

## 📚 Additional Resources

- **API Documentation**: See `@real-estate-calc/api` package
- **Core SDK**: See `@real-estate-calc/core` package for programmatic usage
- **Web Application**: Full web-based calculator with UI

## 🐛 Troubleshooting

### Command not found

```bash
# Make sure it's installed globally
npm install -g real-estate-calc

# Or use npx
npx real-estate-calc ready --value 850000 --size 850
```

### Invalid calculations

- Ensure all numeric values are positive
- Check that percentages are between 0-100
- Verify property size matches value (price per sq ft should be reasonable)

## 📄 License

MIT © Umair Khan

## 🤝 Contributing

Issues and pull requests welcome! Visit our [GitHub repository](https://github.com/yourusername/real-estate-calc).

---

**Made with ❤️ for real estate investors**
