/**
 * Real Estate Investment Agent
 *
 * A conversational AI agent that helps investors analyze property deals in Dubai
 * using Claude Agent SDK and the existing financial calculation APIs.
 */

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import * as readline from 'readline';
import { calculateReadyPropertyInvestment } from '../src/lib/readyPropertyCalculator.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Tool definitions for the agent
const tools: Anthropic.Tool[] = [
  {
    name: 'analyze_property',
    description: 'Analyze a property investment opportunity in Dubai. Calculates NPV, IRR, ROIC, DSCR and provides buy/don\'t buy recommendation. Required inputs: property price and size. Other parameters use sensible defaults.',
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
 * Analyze property using the calculator
 */
function analyzeProperty(params: {
  propertyPrice: number;
  propertySize: number;
  downPaymentPercent?: number;
  rentalROI?: number;
  tenure?: number;
}) {
  const inputs = {
    currency: 'AED',
    totalValue: params.propertyPrice,
    propertySize: params.propertySize,
    downPaymentPercent: params.downPaymentPercent || 25,
    registrationFeePercent: 4,
    tenure: params.tenure || 25,
    discountRate: 4,
    rentalROI: params.rentalROI || 6,
    serviceChargesPerSqFt: 10,
    exitValue: params.propertyPrice * 1.2,
  };

  const results = calculateReadyPropertyInvestment(inputs);

  // Convert Decimal objects to numbers
  const clean = JSON.parse(JSON.stringify(results, (key, value) => {
    if (value && typeof value === 'object' && value.constructor?.name === 'Decimal') {
      return Number(value);
    }
    return value;
  }));

  const npv = clean.npv;
  const irr = clean.irr * 100;
  const roic = clean.roic * 100;
  const dscr = clean.dscr;

  let recommendation = '';
  let reasoning = '';

  if (npv > 0 && irr > 8 && roic > 15 && dscr > 1.25) {
    recommendation = '✅ STRONG BUY';
    reasoning = `Excellent investment. NPV: ${npv.toFixed(0)} AED, IRR: ${irr.toFixed(1)}%, ROIC: ${roic.toFixed(1)}%, DSCR: ${dscr.toFixed(2)}`;
  } else if (npv > 0 && irr > 5 && roic > 10) {
    recommendation = '👍 BUY';
    reasoning = `Viable investment. NPV: ${npv.toFixed(0)} AED, IRR: ${irr.toFixed(1)}%, ROIC: ${roic.toFixed(1)}%`;
  } else if (npv > 0) {
    recommendation = '⚠️ MARGINAL';
    reasoning = `Marginal returns. NPV: ${npv.toFixed(0)} AED, IRR: ${irr.toFixed(1)}%, ROIC: ${roic.toFixed(1)}%`;
  } else {
    recommendation = '❌ DON\'T BUY';
    reasoning = `Negative returns. NPV: ${npv.toFixed(0)} AED, IRR: ${irr.toFixed(1)}%`;
  }

  return {
    recommendation,
    reasoning,
    metrics: {
      npv: `${npv.toFixed(0)} AED`,
      irr: `${irr.toFixed(1)}%`,
      roic: `${roic.toFixed(1)}%`,
      dscr: dscr.toFixed(2),
      monthlyEMI: `${clean.monthlyEMI.toFixed(0)} AED`,
      netMonthlyCashFlow: `${clean.netMonthlyCashFlow.toFixed(0)} AED`,
    },
  };
}

/**
 * Process tool calls
 */
function processToolCall(toolName: string, toolInput: any): string {
  if (toolName === 'analyze_property') {
    return JSON.stringify(analyzeProperty(toolInput), null, 2);
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
  console.log('Tell me about a property and I\'ll ask for price and size.\n');
  console.log('Type "exit" to quit.\n');

  const systemPrompt = `You are a professional real estate investment advisor for Dubai properties.

Ask for: property price (AED) and size (sq ft).
Use defaults for: down payment (25%), rental ROI (6%), service charges (10 AED/sqft), tenure (25 years).

Be conversational and provide clear buy/don't buy recommendations.`;

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
        model: 'claude-3-5-sonnet-20241022',
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
          console.log(`\n🔧 Analyzing property...`);
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
