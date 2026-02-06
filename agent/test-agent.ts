/**
 * Programmatic test for Real Estate Investment Agent
 */
import 'dotenv/config';
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { calculateReadyPropertyInvestment } from '../src/lib/readyPropertyCalculator.js';
import { calculateOffplanInvestment, calculateMortgageContinuation } from '../src/lib/offplanCalculatorRefactored.js';
import Decimal from '../src/lib/decimalConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function convertDecimalsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (obj instanceof Decimal) {
    return obj.toNumber();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertDecimalsToNumbers(item));
  }

  if (obj && typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertDecimalsToNumbers(obj[key]);
    }
    return converted;
  }

  return obj;
}

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
      async (params: any) => {
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
  ]
});

async function testAgent() {
  console.log('🧪 Testing Real Estate Investment Agent\n');

  const testQuery = "I'm looking at a ready apartment for 1.5 million AED, 1000 sq ft";

  console.log(`📝 Test Query: "${testQuery}"\n`);
  console.log('🤖 Agent Response:');
  console.log('─'.repeat(80));

  try {
    // Note: API key is read from ANTHROPIC_API_KEY environment variable
    for await (const message of query({
      prompt: testQuery,
      options: {
        model: 'claude-sonnet-4-5',
        cwd: __dirname,
        settingSources: ['project'],
        allowedTools: ['Skill'],
        mcpServers: {
          'real-estate-analysis': realEstateServer
        },
        systemPrompt: `You are a professional real estate investment advisor for Dubai properties.

Your role is to help investors assess financial feasibility of property investments.

You have access to Skills that provide specialized analysis:
- ready-property: For move-in ready properties with immediate rental income
- offplan-property: For properties under construction with developer payment plans

When a user mentions a property:
1. Determine if it's READY or OFF-PLAN
2. Use the appropriate Skill to analyze it automatically
3. Present the recommendations clearly

IMPORTANT: The Skills will invoke the underlying tools automatically. Present the analysis and recommendations that come from the Skills.`,
      }
    })) {
      if (typeof message === 'string') {
        console.log(message);
      }
    }

    console.log('─'.repeat(80));
    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAgent().catch(console.error);
