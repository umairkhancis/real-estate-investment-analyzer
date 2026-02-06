# Real Estate Investment Agent

A conversational AI agent built with Claude Agent SDK that analyzes property investments in Dubai using natural language.

## Architecture

This agent follows a **clean architecture** pattern:
- **Business Logic Layer** (`src/lib/`): All calculations, metrics, and recommendations
- **Agent Layer** (`agent/`): Display and conversation flow ONLY
- **Separation of Concerns**: Agent never implements business rules

## Features

- 🤖 **Claude Agent SDK** with tool use
- 🏢 **Dual Property Analysis**:
  - **Ready Properties**: Move-in ready with rental income (NPV, IRR, ROIC, DSCR)
  - **Off-Plan Properties**: Under construction with developer payment plans (NPV, IRR, ROIC)
- 💰 **Comprehensive Financial Analysis**: Calculated by business logic layer
- 💬 **Natural Language**: Just describe the property
- 🎯 **Smart Defaults**: Uses typical Dubai market parameters for both property types
- ✅ **Clear Recommendations**: From business logic layer with reasoning
- 📋 **Documented Skills**: Separate SKILL.md files for ready and off-plan properties

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the root directory:
```bash
ANTHROPIC_API_KEY=sk-ant-...
# Optional: Use custom API endpoint
# ANTHROPIC_BASE_URL=https://...
```

## Usage

### Run the agent:
```bash
npm run agent
```

The agent uses **Claude Agent SDK** with automatic Skill discovery from `.claude/skills/`. Claude autonomously invokes Skills based on user intent.

### Run tests:
```bash
npm test agent/index.test.ts
```

### Example conversations:

**Ready Property:**
```
You: I'm looking at a ready apartment for 1.5 million AED, 1000 sq ft

🔧 Assessing financial feasibility...

Agent: This is a ready property with immediate rental income. Let me assess
its financial feasibility.

This property is a good buy. The analysis shows solid financial fundamentals
with acceptable returns.

Here's why:
• Positive NPV of 45,234 AED indicates the investment creates value
• IRR of 6.5% is moderate
• ROIC of 12.3% is acceptable
• Healthy DSCR of 1.45 provides comfortable debt coverage

Key Metrics:
• Net Present Value: 45,234 AED
• Internal Rate of Return: 6.5%
• Monthly Cash Flow: 1,250 AED (after mortgage)
• Total Investment Required: 435,000 AED
```

**Off-Plan Property:**
```
You: I'm considering an off-plan property for 2M AED, 1200 sq ft, 3-year construction

🔧 Assessing financial feasibility...

Agent: This is an off-plan property under construction. Let me assess its
financial feasibility during the construction phase.

This off-plan property is a strong buy. The analysis shows exceptional metrics
that justify the construction phase risk.

Here's why:
• Positive NPV of 234,567 AED indicates the investment creates value
• Excellent IRR of 18.5% justifies construction phase risk
• Outstanding ROIC of 32.4% shows exceptional capital efficiency from developer
  payment plan

Construction Details:
• Down Payment: 200,000 AED (10%)
• Total Payment During Construction: 500,000 AED
• Exit Value at Handover: 2,400,000 AED

Key Metrics:
• Net Present Value: 234,567 AED
• Internal Rate of Return: 18.5%
• Return on Invested Capital: 32.4%
```

## How It Works

### Architecture Flow:

1. **User Input**: Describes property in natural language
2. **Agent**: Determines property type (ready vs off-plan), extracts details
3. **Agent**: Calls appropriate tool:
   - **Ready**: `assess_ready_property_feasibility` → `calculateReadyPropertyInvestment()` → `determineInvestmentRecommendation()`
   - **Off-Plan**: `assess_offplan_property_feasibility` → `calculateOffplanInvestment()` → `determineOffplanRecommendation()`
4. **Business Logic**: Computes all metrics and determines recommendation
5. **Agent**: Displays recommendation and metrics conversationally

### Property Types:

**Ready Properties:**
- Move-in ready, immediate rental income
- Mortgage financing with EMI payments
- Metrics: NPV, IRR, ROIC, DSCR
- Lower thresholds (IRR > 8% for STRONG_BUY)
- Focus on cash flow and debt coverage

**Off-Plan Properties:**
- Under construction with developer payment plan
- Shadow financing at 0% during construction
- Metrics: NPV, IRR, ROIC (no DSCR)
- Higher thresholds (IRR > 12% for STRONG_BUY)
- Focus on appreciation and capital efficiency

### Key Principle:
**The agent is a display layer ONLY.** All business logic, thresholds, and recommendations come from `src/lib/`:
- ✅ Business logic determines: STRONG_BUY, BUY, MARGINAL, DONT_BUY
- ✅ Business logic provides reasoning for each metric
- ✅ Business logic uses different thresholds for ready vs off-plan
- ❌ Agent never implements if/then recommendation logic

## Smart Defaults (Dubai Market Standards)

### Ready Properties:
When not specified by user:
- Down Payment: **25%**
- Rental ROI: **6%** annually
- Service Charges: **10 AED/sqft** annually
- Mortgage Tenure: **25 years**
- Registration Fees: **4%**
- Discount Rate: **4%**
- Exit Value: **1.2x** purchase price

### Off-Plan Properties:
When not specified by user:
- Construction Tenure: **3 years**
- Down Payment: **10%**
- Installment: **5%** per payment period
- Payment Frequency: **6 months** (bi-annual)
- Registration Fees: **4%**
- Discount Rate: **4%**
- Future Price: **1.2x** current price per sqft

## Recommendation Categories

### Ready Properties
Determined by **business logic layer** (`src/lib/investmentRecommendation.js`):

- **STRONG_BUY**: NPV > 0 AND IRR > 8% AND ROIC > 15% AND DSCR > 1.25
- **BUY**: NPV > 0 AND IRR > 5% AND ROIC > 10%
- **MARGINAL**: NPV > 0 but weak returns
- **DONT_BUY**: NPV ≤ 0

### Off-Plan Properties
Determined by **business logic layer** (`src/lib/offplanRecommendation.js`):

- **STRONG_BUY**: NPV > 0 AND IRR > 12% AND ROIC > 25%
- **BUY**: NPV > 0 AND IRR > 8% AND ROIC > 15%
- **MARGINAL**: NPV > 0 but weak returns
- **DONT_BUY**: NPV ≤ 0

**Note**: Off-plan thresholds are higher to compensate for construction risk.

## Technical Details

### Tool Definitions
**Ready Property Tool:**
- **Name**: `assess_ready_property_feasibility`
- **Required**: `propertyPrice`, `propertySize`
- **Optional**: `downPaymentPercent`, `rentalROI`, `tenure`

**Off-Plan Property Tool:**
- **Name**: `assess_offplan_property_feasibility`
- **Required**: `propertyPrice`, `propertySize`
- **Optional**: `constructionTenureYears`, `futurePricePerSqft`, `downPaymentPercent`, `installmentPercent`, `paymentFrequencyMonths`

### Model
- **Model**: `claude-sonnet-4-5`
- **Context**: Maintains full conversation history

### Key Files
- **Agent**: `agent/index.ts` - Conversational interface
- **Skill Docs**:
  - `agent/SKILL.md` - Ready property capability documentation
  - `agent/offplan-SKILL.md` - Off-plan property capability documentation
- **Business Logic**:
  - **Ready**: `src/lib/readyPropertyCalculator.js` - Financial calculations
  - **Ready**: `src/lib/investmentRecommendation.js` - Recommendation logic
  - **Off-Plan**: `src/lib/offplanCalculatorRefactored.js` - Construction phase calculations
  - **Off-Plan**: `src/lib/offplanRecommendation.js` - Off-plan recommendation logic
- **Tests**: `agent/index.test.ts` - Comprehensive testing

### Testing
Tests verify:
1. ✅ Both calculators include recommendations in output
2. ✅ Recommendations come from business logic (not agent)
3. ✅ Agent calculations match web app exactly for both property types
4. ✅ Results are deterministic
5. ✅ Decimal conversion works properly
6. ✅ Off-plan thresholds are higher than ready property thresholds

## Development

The agent uses the existing investment calculator APIs with **zero code duplication**.

### Adding New Features
1. Add business logic to `src/lib/`
2. Update calculator to include new metrics
3. Agent automatically displays new outputs
4. Update tests to verify new logic

### Architecture Rules
- Agent should **never** implement business rules
- All thresholds defined in business logic layer
- Agent displays what calculator returns
- Maintain separation of concerns

## Skill Documentation

**Ready Properties:** See [`ready-property-SKILL.md`](./ready-property-SKILL.md) for detailed documentation on:
- When to use ready property financial feasibility
- How to invoke ready property analysis APIs
- Tool schema and response format
- Architectural constraints
- Example interactions

**Off-Plan Properties:** See [`offplan-property-SKILL.md`](./offplan-property-SKILL.md) for detailed documentation on:
- When to use off-plan property financial feasibility
- How to invoke off-plan analysis APIs
- Developer payment plan structure
- Construction phase metrics
- Comparison with ready properties
- Example interactions
