# Real Estate Investment Analyzer

A comprehensive web-based DCF (Discounted Cash Flow) calculator for real estate investment analysis. This tool helps investors evaluate property investments using developer payment plans and bank mortgage financing across any currency.

## Features

- **DCF Valuation Model**: Calculate intrinsic value using discounted cash flow methodology
- **Complete Financial Metrics**:
  - Net Present Value (NPV)
  - Internal Rate of Return (IRR)
  - Return on Invested Capital (ROIC)
  - Debt Service Coverage Ratio (DSCR)
- **Currency Agnostic**: Works with any currency (USD, AED, EUR, etc.)
- **Terminal Value Discounting**: Properly discounts terminal value to present value
- **Cash Flow Visualization**: Visual representation of 25-year cash flow projection
- **Educational Content**: Step-by-step explanation of time value of money and DCF concepts
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Files

- `real-estate-investment-analyzer.html` - Full landing page with scroll-driven engagement and multiple CTAs
- `real-estate-valuation-calculator.html` - Original calculator with embedded educational content

## How to Use

1. Open either HTML file in a modern web browser (Chrome, Firefox, Safari, Edge)
2. Enter your investment parameters:
   - Property size (sq ft)
   - Price per square foot
   - Down payment percentage
   - Exit year (typically 20-25 years)
   - Annual discount rate
   - Rental ROI percentage
   - Service charges per sq ft
   - Potential future price per sq ft
3. Review the calculated metrics and cash flow visualization
4. Use the insights to make informed investment decisions

## Calculation Methodology

### Key Formulas

**PMT (Monthly Payment)**:
```
PMT = rate / (pvif - 1) * -(pv * pvif)
where pvif = (1 + rate)^nper
```

**NPV (Net Present Value)**:
```
NPV = -Initial Investment + Sum of [Cash Flow / (1 + rate)^year]
```

**Terminal Value (Present Value)**:
```
Terminal PV = (Size × Future Price PSF) / (1 + rate)^years
```

**DCF Value**:
```
DCF = NPV of Future Cash Flows + Terminal Value PV
```

**IRR (Internal Rate of Return)**:
Calculated using Newton-Raphson iterative method to find the rate where NPV = 0

**ROIC (Return on Invested Capital)**:
```
ROIC = (Terminal Value PV - Initial Investment) / Initial Investment × 100%
```

## Technical Details

- Pure HTML/CSS/JavaScript - no dependencies required
- All calculations performed client-side
- Excel-verified formulas (matches Excel DCF model exactly)
- Unit tested for accuracy

## Educational Purpose

This tool is designed to help investors understand:
- Time value of money concepts
- How future cash flows translate to present value
- The impact of discount rates on valuation
- The importance of terminal value in long-term investments
- How leverage (mortgages) affects returns

## Target Audience

Real estate investors who:
- Use developer payment plans
- Finance purchases with bank mortgages
- Want to understand intrinsic value beyond market prices
- Make data-driven investment decisions

## Version History

- v3.0: Properly implemented terminal value discounting (academically correct DCF)
- v2.0: Fixed service charges calculation, added ROIC metric
- v1.0: Initial release with DCF, NPV, and IRR calculations

## License

All rights reserved.

## Author

Created for informed real estate investment analysis.
