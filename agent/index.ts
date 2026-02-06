/**
 * Real Estate Investment Agent
 *
 * A conversational AI agent that helps investors analyze property deals in Dubai
 * using Claude Agent SDK and the existing financial calculation APIs.
 *
 * The agent is a DISPLAY LAYER ONLY. All business logic, calculations, and
 * recommendations come from the business logic layer.
 */

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import * as readline from 'readline';
import { calculateReadyPropertyInvestment } from '../src/lib/readyPropertyCalculator.js';
import Decimal from '../src/lib/decimalConfig.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

// Tool definition - Financial Feasibility Assessment
const tools: Anthropic.Tool[] = [
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
  },
];

/**
 * Convert Decimal objects to JavaScript numbers recursively
 * This is used at the display boundary only
 */
function convertDecimalsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  // Use instanceof check with Decimal.js
  if (obj instanceof Decimal) {
    return obj.toNumber();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => convertDecimalsToNumbers(item));
  }

  // Handle plain objects
  if (obj && typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertDecimalsToNumbers(obj[key]);
    }
    return converted;
  }

  return obj;
}

/**
 * Assess property financial feasibility using business logic layer
 * This function is a thin wrapper that only:
 * 1. Calls the calculator API
 * 2. Converts Decimals to numbers for display
 * 3. Returns the recommendation from the business logic
 */
function assessFinancialFeasibility(params: {
  propertyPrice: number;
  propertySize: number;
  downPaymentPercent?: number;
  rentalROI?: number;
  tenure?: number;
}) {
  // Prepare inputs for calculator (with Dubai market defaults)
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

  // Call business logic layer - this handles ALL calculations and recommendations
  const results = calculateReadyPropertyInvestment(inputs);

  // Convert Decimal objects to numbers for display
  const clean = convertDecimalsToNumbers(results);

  // Extract recommendation from business logic
  const { recommendation, summary, reasoning, metrics } = clean.recommendation;

  // Format for conversational display
  return {
    recommendation: recommendation,
    summary: summary,
    reasoning: reasoning,
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
  };
}

/**
 * Process tool calls - routes to appropriate handler
 */
function processToolCall(toolName: string, toolInput: any): string {
  if (toolName === 'assess_financial_feasibility') {
    return JSON.stringify(assessFinancialFeasibility(toolInput), null, 2);
  }
  return 'Unknown tool';
}

/**
 * Main conversation loop
 */
async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set');
    console.error('Please create a .env file with your Anthropic API key');
    process.exit(1);
  }

  const conversationHistory: Anthropic.MessageParam[] = [];
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('🏠 Real Estate Investment Agent');
  console.log('💬 Powered by Claude Agent SDK\n');
  console.log('I can analyze property investments in Dubai!');
  console.log('Tell me about a property and I\'ll assess its financial feasibility.\n');
  console.log('Type "exit" to quit.\n');

  const systemPrompt = `You are a professional real estate investment advisor for Dubai properties.

Your role is to help investors assess financial feasibility of property investments.

When a user mentions a property, ask for:
- Property acquisition price (in AED)
- Property size (in square feet)

Use the assess_financial_feasibility tool with these inputs. The tool will:
- Calculate all financial metrics (NPV, IRR, ROIC, DSCR)
- Determine the investment recommendation (STRONG_BUY, BUY, MARGINAL, or DONT_BUY)
- Provide reasoning based on the metrics

Present the recommendation naturally:
- For STRONG_BUY: "This property is a strong buy" or "Excellent investment opportunity"
- For BUY: "This property is a good buy" or "Solid investment opportunity"
- For MARGINAL: "This property is marginally viable" or "Borderline investment"
- For DONT_BUY: "I don't recommend buying this property" or "This investment is not viable"

Then explain the reasoning and show key metrics in a conversational way.

Remember: The tool provides ALL analysis and recommendations. Your job is to present them clearly.`;

  const prompt = (q: string): Promise<string> =>
    new Promise((resolve) => rl.question(q, resolve));

  while (true) {
    const userInput = await prompt('You: ');

    if (userInput.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      rl.close();
      break;
    }

    conversationHistory.push({ role: 'user', content: userInput });

    let continueLoop = true;
    while (continueLoop) {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: systemPrompt,
        messages: conversationHistory,
        tools: tools,
      });

      conversationHistory.push({ role: 'assistant', content: response.content });

      if (response.stop_reason === 'tool_use') {
        const toolUses = response.content.filter((b) => b.type === 'tool_use') as Anthropic.ToolUseBlock[];
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const toolUse of toolUses) {
          console.log(`\n🔧 Assessing financial feasibility...`);
          const result = processToolCall(toolUse.name, toolUse.input);
          toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: result });
        }

        conversationHistory.push({ role: 'user', content: toolResults });
      } else {
        const textBlocks = response.content.filter((b) => b.type === 'text') as Anthropic.TextBlock[];
        for (const text of textBlocks) {
          console.log('\nAgent:', text.text);
        }
        continueLoop = false;
      }
    }
    console.log('\n');
  }
}

main().catch(console.error);
