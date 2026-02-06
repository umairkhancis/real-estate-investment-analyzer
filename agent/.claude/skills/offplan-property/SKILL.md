---
name: offplan-property-analysis
description: Assess financial feasibility of off-plan (under construction) Dubai property investments with developer payment plans. Use when user mentions off-plan, under construction, pre-launch properties, construction phase, handover, or completion timeline. Analyzes BOTH scenarios (exit at handover vs continue with mortgage) to help with the critical handover decision. Calculates NPV, IRR, ROIC and provides buy/don't buy recommendations.
---

# Off-Plan Property Financial Feasibility Analysis Skill

## Purpose
This skill enables conversational assessment of Dubai **off-plan property investments** (properties under construction with developer payment plans) using comprehensive financial analysis.

**Critical Feature**: The skill analyzes **BOTH scenarios at handover**:
1. **Exit at Handover**: Sell the property and realize construction phase profits
2. **Continue with Mortgage**: Hold the property with mortgage financing for rental income

This helps investors make the critical decision at property handover based on comprehensive financial analysis from the business logic layer.

## When to Use This Skill

**MANDATORY TRIGGERS:**
- User mentions off-plan, under construction, or pre-launch properties
- User mentions developer payment plans or construction phase
- User provides property details with construction timeline
- User asks about investment in properties that aren't ready yet
- User mentions terms like "handover", "completion", "construction period"

**Examples:**
- "I'm looking at an off-plan property for 2 million AED, 1200 sqft, 3-year construction"
- "Should I buy this apartment under construction? 1.5M, 1000 sqft, handover in 2 years"
- "Help me analyze this pre-launch investment with developer payment plan"
- "Is this off-plan property worth it? Construction finishes in 2027"

## The Handover Decision Point

At property handover (construction completion), investors face a critical decision:

### Option 1: Exit at Handover
- **Action**: Sell the property immediately
- **Profit**: Construction phase appreciation (exit value - payments made)
- **Metrics**: NPV, IRR, ROIC based on construction phase only
- **Risk**: Market timing, buyer availability
- **Timeline**: Short (construction period only)

### Option 2: Continue with Mortgage
- **Action**: Take mortgage and hold for rental income
- **Payment**: Construction payments become effective "down payment"
- **Metrics**: NPV, IRR, ROIC, DSCR based on entire investment horizon
- **Risk**: Rental market, tenant risk, longer capital lock-in
- **Timeline**: Long (construction + mortgage period)

**The tool analyzes BOTH scenarios and provides a comparison to inform this decision.**

## Off-Plan vs Ready Properties

### Off-Plan Properties (Use This Skill):
- Under construction or pre-launch
- Developer payment plans (10-20% down, installments during construction)
- No immediate rental income during construction
- Higher ROI potential due to appreciation and leverage
- Construction risk and time horizon
- **Critical decision at handover: exit or continue with mortgage**

### Ready Properties (Use Ready Property Skill):
- Move-in ready, completed
- Immediate rental income
- Mortgage financing
- DSCR evaluation with cash flow
- Lower risk profile
- No handover decision (property is already ready)

## How to Use This Skill

### 1. Required Inputs
The skill requires TWO mandatory inputs from the user:
- **Property Price**: Total purchase price in AED
- **Property Size**: Property size in square feet

### 2. Optional Inputs (with Defaults)
- **Construction Tenure**: Construction period in years (default: 3 years)
- **Future Price**: Expected price per sqft at handover (default: 1.2x current price)
- **Down Payment**: Down payment percentage (default: 10%)
- **Installment**: Installment percentage per payment period (default: 5%)
- **Payment Frequency**: Payment frequency in months (default: 6 months)

### 3. Default Parameters
The skill uses Dubai off-plan market standard defaults:
- Construction Tenure: 3 years
- Down Payment: 10%
- Installment Percent: 5% per payment
- Payment Frequency: 6 months (bi-annual)
- Discount Rate: 4%
- Registration Fee: 4%
- Future Price Appreciation: 20% (1.2x multiplier)

### 4. Tool Definition

The agent exposes a tool called `assess_offplan_property_feasibility` with the following schema:

```typescript
{
  name: 'assess_offplan_property_feasibility',
  description: 'Assess financial feasibility of an OFF-PLAN Dubai property investment (under construction, with developer payment plan). Calculates NPV, IRR, ROIC during construction phase and provides investment recommendation (STRONG_BUY, BUY, MARGINAL, or DONT_BUY) with reasoning. Required: property price, size, construction tenure, and future price.',
  input_schema: {
    type: 'object',
    properties: {
      propertyPrice: {
        type: 'number',
        description: 'Total property purchase price in AED',
      },
      propertySize: {
        type: 'number',
        description: 'Property size in square feet',
      },
      constructionTenureYears: {
        type: 'number',
        description: 'Construction period in years (default: 3)',
        default: 3,
      },
      futurePricePerSqft: {
        type: 'number',
        description: 'Expected price per sqft at handover in AED (default: 1.2x current price per sqft)',
      },
      downPaymentPercent: {
        type: 'number',
        description: 'Down payment percentage for off-plan (default: 10%)',
        default: 10,
      },
      installmentPercent: {
        type: 'number',
        description: 'Installment percentage per payment period (default: 5%)',
        default: 5,
      },
      paymentFrequencyMonths: {
        type: 'number',
        description: 'Payment frequency in months (default: 6 months)',
        default: 6,
      },
    },
    required: ['propertyPrice', 'propertySize'],
  },
}
```

### 5. Invoking the Financial Analysis API

The underlying API is `calculateOffplanInvestment` from `src/lib/offplanCalculatorRefactored.js`.

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
- ✅ Extract property details from natural language
- ✅ Determine if property is off-plan vs ready
- ✅ Call the assessment API with appropriate tool
- ✅ Display the recommendation from the API
- ✅ Present the reasoning provided by the API
- ✅ Format metrics conversationally

### 6. API Response Structure

The calculator returns a recommendation object with:

```javascript
{
  recommendation: 'STRONG_BUY' | 'BUY' | 'MARGINAL' | 'DONT_BUY',
  summary: 'Brief overall assessment',
  reasoning: ['reason 1', 'reason 2', ...],
  metrics: {
    npv: number,
    irr: number,
    roic: number
  }
}
```

Plus detailed construction metrics:
- downPaymentAmount
- totalPaymentTillHandover
- numberOfPayments
- shadowFinancing
- exitValueNominal
- exitValueDiscounted

### 7. Recommendation Categories (From Business Logic)

The business logic layer determines recommendations using these criteria for **off-plan properties**:

- **STRONG_BUY**: NPV > 0 AND IRR > 12% AND ROIC > 25%
- **BUY**: NPV > 0 AND IRR > 8% AND ROIC > 15%
- **MARGINAL**: NPV > 0 but weak returns
- **DON'T BUY**: NPV ≤ 0

**Note**: Off-plan thresholds are **higher** than ready properties because:
- Construction phase risk
- No rental income during construction
- Longer time horizon
- Developer dependency risk
- Market price risk at handover

**Note**: The agent should never implement these rules - they are documented here for understanding only.

### 8. Conversational Response Format

When presenting the assessment, the agent should:

1. **Identify property type first**:
   - "I see this is an off-plan property under construction..."

2. **Lead with the recommendation** (from API):
   - "This off-plan property is a **strong buy**" (for STRONG_BUY)
   - "This off-plan property is a **good buy**" (for BUY)
   - "This off-plan property is **marginally viable**" (for MARGINAL)
   - "I don't recommend buying this off-plan property" (for DONT_BUY)

3. **Provide the summary** (from API)

4. **List the reasoning** (from API)

5. **Show key metrics** in a readable format:
   - NPV: X AED
   - IRR: X%
   - ROIC: X%
   - Down payment: X AED
   - Total payment during construction: X AED
   - Exit value at handover: X AED

## Example Interaction

```
User: I'm looking at an off-plan property for 2 million AED, 1200 square feet, 3-year construction

Agent: [calls assess_offplan_property_feasibility with propertyPrice: 2000000, propertySize: 1200, constructionTenureYears: 3]

Agent Response:
"I see this is an off-plan property under construction. Let me analyze both scenarios to help you decide what to do at handover.

**SCENARIO 1: Exit at Handover (after 3 years)**

This exit strategy is a **strong buy**. The construction phase shows exceptional metrics that justify the risk.

Here's why:
- Positive NPV of 234,567 AED indicates the investment creates value
- Excellent IRR of 18.5% justifies construction phase risk
- Outstanding ROIC of 32.4% shows exceptional capital efficiency from developer payment plan

Construction Details:
- Down Payment: 200,000 AED (10%)
- Total Payment During Construction: 500,000 AED
- Number of Payments: 5 installments over 3 years
- Exit Value at Handover: 2,400,000 AED (20% appreciation)

Key Metrics:
- Net Present Value: 234,567 AED
- Internal Rate of Return: 18.5%
- Return on Invested Capital: 32.4%

---

**SCENARIO 2: Continue with Mortgage (hold and rent)**

If you choose to hold the property after handover with mortgage financing, this is a **good buy**.

Here's why:
- Positive NPV of 345,123 AED indicates strong long-term value creation
- IRR of 9.2% exceeds typical market returns
- ROIC of 16.8% shows strong capital efficiency
- Healthy DSCR of 1.38 provides comfortable debt coverage

Holding Details:
- Total Investment: 580,000 AED (construction + registration)
- Years to Full Exit: 28 years (3 construction + 25 mortgage)
- Monthly EMI: 8,500 AED
- Net Monthly Cash Flow: 1,200 AED (after EMI and expenses)

Key Metrics:
- Net Present Value: 345,123 AED
- Internal Rate of Return: 9.2%
- Return on Invested Capital: 16.8%
- Debt Service Coverage Ratio: 1.38

---

**DECISION GUIDANCE:**

At handover, you have two options with an exit value of 2,400,000 AED.

Both options are financially viable, but continuing with mortgage appears better based on higher NPV and the benefit of rental income. However, exiting at handover gives you quicker liquidity with excellent short-term returns (18.5% IRR).

Consider:
- Exit if you need liquidity or want to realize profits quickly
- Continue with mortgage if you want long-term passive income and higher total returns"
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
import { calculateOffplanInvestment } from '../src/lib/offplanCalculatorRefactored.js';
```

### Input Preparation
Convert percentage inputs to decimals:
```javascript
const inputs = {
  size: params.propertySize,
  totalValue: params.propertyPrice,
  downPaymentPercent: (params.downPaymentPercent ?? 10) / 100, // Convert to decimal
  installmentPercent: (params.installmentPercent ?? 5) / 100, // Convert to decimal
  constructionTenureYears: params.constructionTenureYears ?? 3,
  // ... other inputs
};
```

### Error Handling
- If property price or size is missing, ask the user for it
- If construction tenure is unclear, use 3-year default
- If future price is not provided, calculate as 1.2x current price per sqft
- If user provides unrealistic values, proceed with calculation and let the recommendation reflect the poor metrics
- If calculation fails, inform the user and ask for clarification

## Comparison: Off-Plan vs Ready Property

| Aspect | Off-Plan | Ready |
|--------|----------|-------|
| **Status** | Under construction | Move-in ready |
| **Payment** | Developer payment plan | Mortgage |
| **Income** | None during construction | Immediate rental |
| **Metrics** | NPV, IRR, ROIC | NPV, IRR, ROIC, DSCR |
| **Risk** | Construction, developer | Market, tenant |
| **Returns** | Typically higher | Typically moderate |
| **IRR Threshold** | 12% (STRONG_BUY) | 8% (STRONG_BUY) |
| **ROIC Threshold** | 25% (STRONG_BUY) | 15% (STRONG_BUY) |
| **Time Horizon** | 3-5 years | 25+ years |

## Testing

Unit tests should verify:
1. Off-plan calculator includes recommendation in output
2. Recommendations come from business logic (not agent)
3. Decimal conversion works properly
4. Results are deterministic
5. Default parameters are applied correctly
6. Off-plan thresholds are higher than ready property thresholds

## Related Files

- **Business Logic**: `src/lib/offplanCalculatorRefactored.js`
- **Recommendation Logic**: `src/lib/offplanRecommendation.js`
- **Agent Implementation**: `agent/index.ts`
- **Financial Calculations**: `src/lib/financial.js`
- **Ready Property Skill**: `agent/ready-property-SKILL.md` (companion skill for ready properties)

## Key Differences from Ready Property Analysis

1. **No DSCR**: Off-plan has no rental income during construction, so no debt service coverage ratio
2. **Higher Thresholds**: IRR and ROIC thresholds are higher to compensate for construction risk
3. **Developer Payment Plan**: Focus on shadow financing at 0% interest during construction
4. **Exit Value**: Calculated based on expected appreciation and percentage paid
5. **Time Value**: Critical importance of construction tenure and discount rate
6. **Investment Capital**: Only down payment is considered as invested capital today

## When to Use Ready Property Skill Instead

Use the ready property skill (`ready-property-SKILL.md`) when:
- Property is completed and move-in ready
- User mentions rental income or cash flow
- User mentions mortgage or EMI payments
- Property is currently occupied or rentable
- User is evaluating existing buildings
