---
name: ready-property-analysis
description: Assess financial feasibility of ready (move-in ready) Dubai property investments with immediate rental income. Use when user mentions ready properties, completed properties, or properties with rental income. Calculates NPV, IRR, ROIC, DSCR and provides buy/don't buy recommendations.
---

# Ready Property Financial Feasibility Analysis Skill

## Purpose
This skill enables conversational assessment of Dubai **ready property investments** (move-in ready properties with immediate rental income) using comprehensive financial analysis. It determines whether a property is financially viable based on NPV, IRR, ROIC, and DSCR metrics calculated by the underlying business logic layer.

## When to Use This Skill

**MANDATORY TRIGGERS:**
- User mentions property investment analysis, buy/don't buy decisions, or financial feasibility
- User provides property price and size information
- User asks "Should I buy this property?", "Is this a good investment?", or similar questions
- User mentions property metrics in AED (Dubai real estate context)

**Examples:**
- "I'm looking at a property for 1.5 million AED, 1000 square feet"
- "Should I buy this apartment? It's 800k and 750 sqft"
- "Help me analyze this investment - 2.2M AED, 1500 sqft"
- "Is this property worth it financially?"

## How to Use This Skill

### 1. Required Inputs
The skill requires TWO mandatory inputs from the user:
- **Property Price**: Total acquisition price in AED
- **Property Size**: Property size in square feet

### 2. Default Parameters
The skill uses Dubai market standard defaults for other parameters:
- Down Payment: 25%
- Rental ROI: 6% annually
- Mortgage Tenure: 25 years
- Registration Fee: 4%
- Discount Rate: 4%
- Service Charges: 10 AED/sqft annually
- Exit Value: 1.2x purchase price

### 3. Tool Definition

The agent exposes a tool called `assess_financial_feasibility` with the following schema:

```typescript
{
  name: 'assess_financial_feasibility',
  description: 'Assess financial feasibility of a Dubai property investment. Calculates NPV, IRR, ROIC, DSCR and provides investment recommendation (STRONG_BUY, BUY, MARGINAL, or DONT_BUY) with reasoning. Required: property price and size.',
  input_schema: {
    type: 'object',
    properties: {
      propertyPrice: {
        type: 'number',
        description: 'Total property acquisition price in AED',
      },
      propertySize: {
        type: 'number',
        description: 'Property size in square feet',
      },
      downPaymentPercent: {
        type: 'number',
        description: 'Down payment percentage (default: 25%)',
        default: 25,
      },
      rentalROI: {
        type: 'number',
        description: 'Expected annual rental ROI percentage (default: 6%)',
        default: 6,
      },
      tenure: {
        type: 'number',
        description: 'Mortgage tenure in years (default: 25)',
        default: 25,
      },
    },
    required: ['propertyPrice', 'propertySize'],
  },
}
```

### 4. Invoking the Financial Analysis API

The underlying API is `calculateReadyPropertyInvestment` from `src/lib/readyPropertyCalculator.js`.

**Important**: All business logic, metrics calculation, and recommendation determination happens in the business logic layer. The agent should ONLY:
1. Call the API with user inputs
2. Display the recommendation and reasoning returned by the API
3. Present metrics in a conversational format

**What the Agent Should NOT Do:**
- ❌ Implement recommendation logic (e.g., if NPV > 0 then "BUY")
- ❌ Determine thresholds for STRONG_BUY, BUY, etc.
- ❌ Calculate or interpret metrics
- ❌ Make judgments about financial viability

**What the Agent Should Do:**
- ✅ Extract property price and size from natural language
- ✅ Call the assessment API
- ✅ Display the recommendation from the API
- ✅ Present the reasoning provided by the API
- ✅ Format metrics conversationally

### 5. API Response Structure

The calculator returns a recommendation object with:

```javascript
{
  recommendation: 'STRONG_BUY' | 'BUY' | 'MARGINAL' | 'DONT_BUY',
  summary: 'Brief overall assessment',
  reasoning: ['reason 1', 'reason 2', ...],
  metrics: {
    npv: number,
    irr: number,
    roic: number,
    dscr: number
  }
}
```

Plus all detailed financial metrics (monthly cash flow, EMI, etc.)

### 6. Recommendation Categories (From Business Logic)

The business logic layer determines recommendations using these criteria:

- **STRONG_BUY**: NPV > 0 AND IRR > 8% AND ROIC > 15% AND DSCR > 1.25
- **BUY**: NPV > 0 AND IRR > 5% AND ROIC > 10%
- **MARGINAL**: NPV > 0 but weak returns
- **DON'T BUY**: NPV ≤ 0

**Note**: The agent should never implement these rules - they are documented here for understanding only.

### 7. Conversational Response Format

When presenting the assessment, the agent should:

1. **Lead with the recommendation** (from API):
   - "This property is a **strong buy**" (for STRONG_BUY)
   - "This property is a **good buy**" (for BUY)
   - "This property is **marginally viable**" (for MARGINAL)
   - "I don't recommend buying this property" (for DONT_BUY)

2. **Provide the summary** (from API)

3. **List the reasoning** (from API)

4. **Show key metrics** in a readable format:
   - NPV: X AED
   - IRR: X%
   - Monthly cash flow: X AED
   - Debt coverage: X

## Example Interaction

```
User: I'm looking at a property for 1.5 million AED, 1000 square feet

Agent: [calls assess_financial_feasibility with propertyPrice: 1500000, propertySize: 1000]

Agent Response:
"This property is a **good buy**. The analysis shows solid financial fundamentals with acceptable returns.

Here's why:
- Positive NPV of 45,234 AED indicates the investment creates value
- IRR of 6.5% is moderate
- ROIC of 12.3% is acceptable
- Healthy DSCR of 1.45 provides comfortable debt coverage

Key metrics:
- Net Present Value: 45,234 AED
- Internal Rate of Return: 6.5%
- Monthly Cash Flow: 1,250 AED (after mortgage payment)
- Total Investment Required: 435,000 AED (down payment + fees)"
```

## Technical Implementation Notes

### Decimal.js Handling
All calculations use Decimal.js for precision. The agent must convert Decimal objects to numbers before displaying them:

```javascript
import Decimal from '../src/lib/decimalConfig.js';

function convertDecimalsToNumbers(obj) {
  if (obj instanceof Decimal) {
    return obj.toNumber();
  }
  // ... handle arrays and objects recursively
}
```

### Import Path
```javascript
import { calculateReadyPropertyInvestment } from '../src/lib/readyPropertyCalculator.js';
```

### Error Handling
- If property price or size is missing, ask the user for it
- If user provides unrealistic values (e.g., 100 AED property), proceed with calculation and let the recommendation reflect the poor metrics
- If calculation fails, inform the user and ask for clarification

## Testing

Unit tests should verify:
1. Agent calculations match web app exactly
2. Decimal conversion works properly
3. Recommendation comes from business logic (not agent)
4. Deterministic results for same inputs
5. Default parameters are applied correctly

## Related Files

- Business Logic: `src/lib/readyPropertyCalculator.js`
- Recommendation Logic: `src/lib/investmentRecommendation.js`
- Agent Implementation: `agent/index.ts`
- Financial Calculations: `src/lib/financial.js`
- Tests: `agent/index.test.ts`
