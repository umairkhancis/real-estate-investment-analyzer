# Real Estate Investment Agent

A conversational AI agent built with Claude Agent SDK that analyzes property investments in Dubai using natural language.

## Architecture

This agent follows a **clean architecture** pattern:
- **Business Logic Layer** (`src/lib/`): All calculations, metrics, and recommendations
- **Agent Layer** (`agent/`): Display and conversation flow ONLY
- **Separation of Concerns**: Agent never implements business rules

## Features

- 🤖 **Claude Agent SDK** with tool use
- 💰 **Financial Analysis**: NPV, IRR, ROIC, DSCR calculated by business logic
- 💬 **Natural Language**: Just describe the property
- 🎯 **Smart Defaults**: Uses typical Dubai market parameters
- ✅ **Clear Recommendations**: From business logic layer with reasoning
- 📋 **Financial Feasibility Skill**: Documented capability with SKILL.md

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

### Run tests:
```bash
npm test agent/index.test.ts
```

### Example conversation:
```
You: I'm looking at an apartment for 1.5 million AED, 1000 sq ft

🔧 Assessing financial feasibility...

Agent: This property is a good buy. The analysis shows solid financial
fundamentals with acceptable returns.

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

## How It Works

### Architecture Flow:

1. **User Input**: Describes property in natural language
2. **Agent**: Extracts price and size, calls `assess_financial_feasibility` tool
3. **Business Logic**:
   - `calculateReadyPropertyInvestment()` computes all metrics
   - `determineInvestmentRecommendation()` determines recommendation
4. **Agent**: Displays recommendation and metrics conversationally

### Key Principle:
**The agent is a display layer ONLY.** All business logic, thresholds, and recommendations come from `src/lib/`:
- ✅ Business logic determines: STRONG_BUY, BUY, MARGINAL, DONT_BUY
- ✅ Business logic provides reasoning for each metric
- ❌ Agent never implements if/then recommendation logic

## Smart Defaults (Dubai Market Standards)

When not specified by user:
- Down Payment: **25%**
- Rental ROI: **6%** annually
- Service Charges: **10 AED/sqft** annually
- Mortgage Tenure: **25 years**
- Registration Fees: **4%**
- Discount Rate: **4%**
- Exit Value: **1.2x** purchase price

## Recommendation Categories

Determined by **business logic layer** (`src/lib/investmentRecommendation.js`):

- **STRONG_BUY**: NPV > 0 AND IRR > 8% AND ROIC > 15% AND DSCR > 1.25
- **BUY**: NPV > 0 AND IRR > 5% AND ROIC > 10%
- **MARGINAL**: NPV > 0 but weak returns
- **DONT_BUY**: NPV ≤ 0

## Technical Details

### Tool Definition
- **Name**: `assess_financial_feasibility`
- **Required**: `propertyPrice`, `propertySize`
- **Optional**: `downPaymentPercent`, `rentalROI`, `tenure`

### Model
- **Model**: `claude-sonnet-4-5`
- **Context**: Maintains full conversation history

### Key Files
- **Agent**: `agent/index.ts` - Conversational interface
- **Skill Doc**: `agent/SKILL.md` - Capability documentation
- **Business Logic**:
  - `src/lib/readyPropertyCalculator.js` - Financial calculations
  - `src/lib/investmentRecommendation.js` - Recommendation logic
- **Tests**: `agent/index.test.ts` - Comprehensive testing

### Testing
Tests verify:
1. ✅ Calculator includes recommendation in output
2. ✅ Recommendations come from business logic (not agent)
3. ✅ Agent calculations match web app exactly
4. ✅ Results are deterministic
5. ✅ Decimal conversion works properly

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

See [`SKILL.md`](./SKILL.md) for detailed documentation on:
- When to use the financial feasibility capability
- How to invoke the underlying APIs
- Tool schema and response format
- Architectural constraints
- Example interactions
