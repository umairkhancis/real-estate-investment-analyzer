# 🏠 Real Estate Investment Analyzer

A comprehensive Dubai real estate investment analysis platform with **React Web App** and **AI Agent** powered by Claude Agent SDK.

## 🎉 Dual Interface Available!

### 1. **Web Application** - React + Vite + Firebase
Interactive calculator for real estate investment analysis

### 2. **AI Agent** ✨ - Claude Agent SDK + Skills
Conversational AI agent for natural language property analysis

## 🚀 Quick Start

### 1. Start development server:
```bash
npm run dev
```

### 2. Open in browser:
```
http://localhost:5173
```

## ✅ What Works

- ✅ Hero Section
- ✅ Calculator with 9 inputs
- ✅ Real-time calculations
- ✅ Investment status (Great/Marginal/Weak)
- ✅ Key metrics (DCF, IRR, DSCR, ROIC)
- ✅ Firebase Analytics tracking
- ✅ Firestore data storage
- ✅ Responsive design

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

Live URL: https://realestate-investment-analyzer.web.app

## 🎯 Adding New Features

Create a component in `src/components/` and import in `App.jsx`. That's it!

Example:
```jsx
// src/components/NewFeature.jsx
export function NewFeature() {
  return <div>My Feature!</div>;
}

// src/App.jsx
import { NewFeature } from './components/NewFeature';
```

## 📁 Project Structure

```
src/
├── components/           # React components
├── hooks/               # Custom hooks
├── services/            # Business logic
├── lib/                 # Core calculators
│   ├── financial.js              # Financial functions (NPV, IRR, PMT)
│   ├── readyPropertyCalculator.js    # Ready property analysis
│   ├── offplanCalculatorRefactored.js # Off-plan analysis
│   ├── investmentRecommendation.js   # Ready property recommendations
│   └── offplanRecommendation.js      # Off-plan recommendations
└── utils/               # Utilities

agent/
├── .claude/skills/      # Agent Skills (autodiscovered)
│   ├── ready-property/
│   │   └── SKILL.md     # Ready property analysis skill
│   └── offplan-property/
│       └── SKILL.md     # Off-plan analysis skill
├── index.ts             # Agent SDK implementation
├── test-agent.ts        # Programmatic test
└── README.md            # Agent documentation
```

## 🤖 AI Agent (Claude Agent SDK)

### Start the Agent:
```bash
npm run agent
```

### Example Usage:
```
You: I'm looking at a ready apartment for 1.5 million AED, 1000 sq ft

Agent: This property is a good buy. The analysis shows solid financial
fundamentals with acceptable returns...
```

### Features:
- ✨ **Autonomous Skill Discovery** - Claude discovers and invokes Skills automatically
- 🏠 **Ready Property Analysis** - Move-in ready properties with rental income
- 🏗️ **Off-Plan Analysis** - Construction properties with dual scenarios (exit vs hold)
- 💰 **Comprehensive Metrics** - NPV, IRR, ROIC, DSCR
- 🎯 **Smart Recommendations** - From business logic layer
- 💬 **Natural Language** - Just describe the property

See `agent/README.md` and `AGENT-SDK-MIGRATION-COMPLETE.md` for details.

🚀 **Ready to go!** Run `npm run dev` for web app or `npm run agent` for AI agent!
