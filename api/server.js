import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { calculateReadyPropertyInvestment } from '../src/lib/readyPropertyCalculator.js';
import { calculateOffplanInvestment, calculateMortgageContinuation } from '../src/lib/offplanCalculatorRefactored.js';
import Decimal from '../src/lib/decimalConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to convert Decimal.js to numbers
function convertDecimalsToNumbers(obj) {
  if (obj === null || obj === undefined) return obj;

  if (obj instanceof Decimal) {
    return obj.toNumber();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertDecimalsToNumbers(item));
  }

  if (obj && typeof obj === 'object') {
    const converted = {};
    for (const key in obj) {
      converted[key] = convertDecimalsToNumbers(obj[key]);
    }
    return converted;
  }

  return obj;
}

// Create MCP Server with tools
const realEstateServer = createSdkMcpServer({
  name: 'real-estate-analysis',
  version: '1.0.0',
  tools: [
    tool(
      'assess_ready_property_feasibility',
      'Assess financial feasibility of a READY Dubai property investment',
      {
        propertyPrice: z.number(),
        propertySize: z.number(),
        downPaymentPercent: z.number().optional(),
        rentalROI: z.number().optional(),
        tenure: z.number().optional(),
      },
      async (params) => {
        const inputs = {
          currency: 'AED',
          totalValue: params.propertyPrice,
          propertySize: params.propertySize,
          downPaymentPercent: params.downPaymentPercent ?? 25,
          registrationFeePercent: 4,
          tenure: params.tenure ?? 25,
          discountRate: 4,
          rentalROI: params.rentalROI ?? 6,
          serviceChargesPerSqFt: 10,
          exitValue: params.propertyPrice * 1.2,
        };

        const results = calculateReadyPropertyInvestment(inputs);
        const clean = convertDecimalsToNumbers(results);
        const { recommendation, summary, reasoning, metrics } = clean.recommendation;

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              propertyType: 'READY',
              recommendation,
              summary,
              reasoning,
              keyMetrics: {
                npv: `${metrics.npv.toFixed(0)} AED`,
                irr: `${(metrics.irr * 100).toFixed(1)}%`,
                roic: `${(metrics.roic * 100).toFixed(1)}%`,
                dscr: metrics.dscr.toFixed(2),
              },
              cashFlowDetails: {
                monthlyEMI: `${clean.monthlyEMI.toFixed(0)} AED`,
                netMonthlyCashFlow: `${clean.netMonthlyCashFlow.toFixed(0)} AED`,
                annualRental: `${clean.annualRental.toFixed(0)} AED`,
                investmentRequired: `${clean.investedCapital.toFixed(0)} AED`,
              }
            }, null, 2)
          }]
        };
      }
    ),
    tool(
      'assess_offplan_property_feasibility',
      'Assess financial feasibility of an OFF-PLAN Dubai property investment',
      {
        propertyPrice: z.number(),
        propertySize: z.number(),
        downPaymentPercent: z.number().optional(),
        constructionPeriodYears: z.number().optional(),
        rentalROI: z.number().optional(),
      },
      async (params) => {
        const inputs = {
          currency: 'AED',
          totalValue: params.propertyPrice,
          propertySize: params.propertySize,
          downPaymentPercent: params.downPaymentPercent ?? 25,
          registrationFeePercent: 4,
          constructionPeriodYears: params.constructionPeriodYears ?? 3,
          mortgageTenure: 25,
          discountRate: 4,
          rentalROI: params.rentalROI ?? 6,
          serviceChargesPerSqFt: 10,
          exitValue: params.propertyPrice * 1.2,
        };

        const scenario1 = calculateOffplanInvestment(inputs);
        const scenario2 = calculateMortgageContinuation(inputs, scenario1);

        const clean1 = convertDecimalsToNumbers(scenario1);
        const clean2 = convertDecimalsToNumbers(scenario2);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              propertyType: 'OFF-PLAN',
              scenario1: {
                name: 'Exit at Handover',
                recommendation: clean1.recommendation.recommendation,
                summary: clean1.recommendation.summary,
                keyMetrics: {
                  npv: `${clean1.recommendation.metrics.npv.toFixed(0)} AED`,
                  irr: `${(clean1.recommendation.metrics.irr * 100).toFixed(1)}%`,
                  roic: `${(clean1.recommendation.metrics.roic * 100).toFixed(1)}%`,
                }
              },
              scenario2: {
                name: 'Continue with Mortgage',
                recommendation: clean2.recommendation.recommendation,
                summary: clean2.recommendation.summary,
                keyMetrics: {
                  npv: `${clean2.recommendation.metrics.npv.toFixed(0)} AED`,
                  irr: `${(clean2.recommendation.metrics.irr * 100).toFixed(1)}%`,
                  roic: `${(clean2.recommendation.metrics.roic * 100).toFixed(1)}%`,
                  dscr: clean2.recommendation.metrics.dscr.toFixed(2),
                }
              }
            }, null, 2)
          }]
        };
      }
    )
  ]
});

// Agent endpoint
app.post('/api/agent', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let result = '';

    // Query the agent
    for await (const message of query({
      prompt,
      options: {
        model: 'claude-sonnet-4-5',
        cwd: path.join(__dirname, '../agent'),
        settingSources: ['project'],
        allowedTools: ['Skill', 'mcp__real-estate-analysis__assess_ready_property_feasibility', 'mcp__real-estate-analysis__assess_offplan_property_feasibility'],
        mcpServers: {
          'real-estate-analysis': realEstateServer
        },
        systemPrompt: `You are the Real Estate Companion - built using the collective intelligence of real experts from the real estate market. You combine the knowledge and analysis capabilities of Dubai's top real estate investment professionals.

Your role is to help investors assess financial feasibility of property investments - both READY and OFF-PLAN properties - with the wisdom and expertise of experienced advisors.

You have access to Skills that provide specialized analysis:
- ready-property: For move-in ready properties with immediate rental income
- offplan-property: For properties under construction with developer payment plans

When a user mentions a property:
1. Determine if it's READY or OFF-PLAN
2. IMMEDIATELY use the appropriate Skill to analyze it - DO NOT ask for permission
3. Present the recommendations clearly with professional expertise

CRITICAL: You are operating in a web-based chat interface. Users expect immediate analysis. DO NOT ask for permission to run calculations or use tools. ALWAYS execute the analysis automatically and present the results directly. The tools are safe financial calculators - execute them immediately without seeking approval.

IMPORTANT: The Skills will invoke the underlying tools automatically. Present the analysis and recommendations that come from the Skills with the confidence and insight of experienced real estate professionals.

For OFF-PLAN properties, the analysis includes BOTH scenarios:
1. Exit at handover (sell immediately)
2. Continue with mortgage (hold and rent)

Provide guidance on which option appears better based on the recommendations, drawing on collective market intelligence.

RESPONSE FORMATTING RULES - MANDATORY:
Format responses as PLAIN TEXT with visual structure. DO NOT use markdown symbols (**, *, #, etc.).

Use this exact format:

🎯 Investment Verdict
[One clear sentence: STRONG_BUY/BUY/HOLD/CONSIDER/PASS and why]

📊 The Numbers
• NPV: [value] AED
• IRR: [value]%
• ROIC: [value]%
• DSCR: [value]
• Monthly cash flow: [value] AED
• Investment required: [value] AED

💡 What This Means
[2-3 sentences explaining what these numbers tell us about the investment's strength]

🔍 Why It Matters
[2-3 sentences on the practical implications - cash flow reality, risks, opportunities]

✅ Bottom Line
[Clear recommendation with 1-2 specific action items or considerations]

CRITICAL RULES:
- Use bullet character (•) NOT asterisk (*) or dash (-)
- Use emojis + space for section headers, NOT **bold**
- Single line break between sections
- Keep text flowing naturally without markdown formatting`,
      }
    })) {
      // Only extract the final result
      if (message.type === 'result' && message.result) {
        result = message.result;
      }
    }

    res.json({ result });
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Agent API server running on http://localhost:${PORT}`);
  console.log(`📡 Agent endpoint: http://localhost:${PORT}/api/agent`);
});
