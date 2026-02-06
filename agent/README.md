# Real Estate Investment Agent

A conversational AI agent built with Claude Agent SDK that analyzes property investments in Dubai using natural language.

## Features

- 🤖 **Claude Agent SDK** with tool use
- 💰 **Financial Analysis**: NPV, IRR, ROIC, DSCR
- 💬 **Natural Language**: Just describe the property
- 🎯 **Smart Defaults**: Uses typical Dubai parameters
- ✅ **Clear Recommendations**: Buy/Don't Buy with reasoning

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the root directory:
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

## Usage

Run the agent:
```bash
npm run agent
```

Example conversation:
```
You: I'm looking at an apartment for 1.5 million AED, 1000 sq ft

🔧 Analyzing property...

Agent: ✅ STRONG BUY

Excellent investment!

Metrics:
• NPV: 125,430 AED
• IRR: 10.2%
• ROIC: 19.3%
• DSCR: 1.52
• Monthly EMI: 9,043 AED
• Net Cash Flow: 3,245 AED
```

## How It Works

1. User describes a property in natural language
2. Agent asks for required inputs: **price** and **size**
3. Agent calls `analyze_property` tool
4. Tool uses existing calculator APIs from `src/lib/`
5. Agent presents recommendation with financial metrics

## Smart Defaults

When not specified by user:
- Down Payment: 25%
- Rental ROI: 6%
- Service Charges: 10 AED/sqft
- Mortgage Tenure: 25 years
- Registration Fees: 4%
- Discount Rate: 4%

## Recommendation Thresholds

- **✅ STRONG BUY**: NPV > 0, IRR > 8%, ROIC > 15%, DSCR > 1.25
- **👍 BUY**: NPV > 0, IRR > 5%, ROIC > 10%
- **⚠️ MARGINAL**: NPV > 0 but weak returns
- **❌ DON'T BUY**: Negative NPV

## Technical Details

- **Model**: `claude-3-5-sonnet-20241022`
- **Tool**: `analyze_property` with required fields (price, size)
- **Calculator**: Uses `calculateReadyPropertyInvestment` from `src/lib/`
- **Context**: Maintains full conversation history
