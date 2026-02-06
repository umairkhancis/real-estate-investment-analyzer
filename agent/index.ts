/**
 * Real Estate Investment Agent - Using Claude Agent SDK
 *
 * This agent uses the Claude Agent SDK to automatically discover and invoke
 * Skills from the filesystem. Skills are loaded from .claude/skills/ directory.
 *
 * Skills:
 * - ready-property: Assess ready property financial feasibility
 * - offplan-property: Assess off-plan property financial feasibility
 */

import 'dotenv/config';
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { calculateReadyPropertyInvestment } from '../src/lib/readyPropertyCalculator.js';
import { calculateOffplanInvestment, calculateMortgageContinuation } from '../src/lib/offplanCalculatorRefactored.js';
import Decimal from '../src/lib/decimalConfig.js';
import * as readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert Decimal objects to JavaScript numbers recursively
 */
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

/**
 * Create MCP Server with custom tools
 */
const realEstateServer = createSdkMcpServer({
  name: 'real-estate-analysis',
  version: '1.0.0',
  tools: [
    tool(
      'assess_ready_property_feasibility',
      'Assess financial feasibility of a READY Dubai property investment (move-in ready, with immediate rental income). Calculates NPV, IRR, ROIC, DSCR and provides investment recommendation with reasoning. Required: property price and size.',
      {
        propertyPrice: z.number().describe('Total property acquisition price in AED'),
        propertySize: z.number().describe('Property size in square feet'),
        downPaymentPercent: z.number().optional().describe('Down payment percentage (default: 25%)'),
        rentalROI: z.number().optional().describe('Expected annual rental ROI percentage (default: 6%)'),
        tenure: z.number().optional().describe('Mortgage tenure in years (default: 25)'),
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

        const result = {
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
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    ),
    tool(
      'assess_offplan_property_feasibility',
      'Assess financial feasibility of an OFF-PLAN Dubai property investment (under construction, with developer payment plan). Analyzes BOTH scenarios (exit at handover vs continue with mortgage). Required: property price and size.',
      {
        propertyPrice: z.number().describe('Total property purchase price in AED'),
        propertySize: z.number().describe('Property size in square feet'),
        constructionTenureYears: z.number().optional().describe('Construction period in years (default: 3)'),
        futurePricePerSqft: z.number().optional().describe('Expected price per sqft at handover in AED'),
        downPaymentPercent: z.number().optional().describe('Down payment percentage for off-plan (default: 10%)'),
        installmentPercent: z.number().optional().describe('Installment percentage per payment period (default: 5%)'),
        paymentFrequencyMonths: z.number().optional().describe('Payment frequency in months (default: 6 months)'),
      },
      async (params: any) => {
        const constructionYears = params.constructionTenureYears ?? 3;
        const currentPricePerSqft = params.propertyPrice / params.propertySize;
        const futurePricePerSqft = params.futurePricePerSqft ?? (currentPricePerSqft * 1.2);

        const inputs = {
          size: params.propertySize,
          totalValue: params.propertyPrice,
          downPaymentPercent: (params.downPaymentPercent ?? 10) / 100,
          constructionTenureYears: constructionYears,
          paymentFrequencyMonths: params.paymentFrequencyMonths ?? 6,
          installmentPercent: (params.installmentPercent ?? 5) / 100,
          discountRate: 0.04,
          futurePricePerSqft: futurePricePerSqft,
          registrationFeePercent: 0.04,
        };

        const constructionResults = calculateOffplanInvestment(inputs);
        const constructionClean = convertDecimalsToNumbers(constructionResults);
        const constructionRec = constructionClean.recommendation;

        const mortgageInputs = {
          size: params.propertySize,
          totalValue: params.propertyPrice,
          registrationFeePercent: 4,
          tenure: 25,
          discountRate: 4,
          rentalROI: 6,
          serviceChargesPerSqFt: 10,
          exitValue: futurePricePerSqft * params.propertySize,
        };

        const mortgageResults = calculateMortgageContinuation({
          offplanResults: constructionResults,
          mortgageInputs: mortgageInputs,
          readyPropertyCalculator: calculateReadyPropertyInvestment,
        });

        const mortgageClean = convertDecimalsToNumbers(mortgageResults);
        const mortgageRec = mortgageClean.recommendation;

        const result = {
          propertyType: 'OFFPLAN',
          exitAtHandover: {
            scenario: 'Exit at Handover',
            recommendation: constructionRec.recommendation,
            summary: constructionRec.summary,
            reasoning: constructionRec.reasoning,
            keyMetrics: {
              npv: `${constructionRec.metrics.npv.toFixed(0)} AED`,
              irr: `${(constructionRec.metrics.irr * 100).toFixed(1)}%`,
              roic: `${(constructionRec.metrics.roic * 100).toFixed(1)}%`,
            },
            constructionDetails: {
              downPayment: `${constructionClean.downPaymentAmount.toFixed(0)} AED`,
              totalPaymentDuringConstruction: `${constructionClean.totalPaymentTillHandover.toFixed(0)} AED`,
              numberOfPayments: constructionClean.numberOfPayments,
              constructionYears: constructionYears,
              exitValueAtHandover: `${constructionClean.exitValueNominal.toFixed(0)} AED`,
            }
          },
          continueWithMortgage: {
            scenario: 'Continue with Mortgage',
            recommendation: mortgageRec.recommendation,
            summary: mortgageRec.summary,
            reasoning: mortgageRec.reasoning,
            keyMetrics: {
              npv: `${mortgageRec.metrics.npv.toFixed(0)} AED`,
              irr: `${(mortgageRec.metrics.irr * 100).toFixed(1)}%`,
              roic: `${(mortgageRec.metrics.roic * 100).toFixed(1)}%`,
              dscr: mortgageRec.metrics.dscr.toFixed(2),
            },
            holdingDetails: {
              totalInvestment: `${mortgageClean.totalInvestment.toFixed(0)} AED`,
              yearsToFullExit: mortgageClean.yearsToFullExit,
              monthlyEMI: `${mortgageClean.monthlyEMI.toFixed(0)} AED`,
              netMonthlyCashFlow: `${mortgageClean.netMonthlyCashFlow.toFixed(0)} AED`,
            }
          },
          decisionPoint: {
            atHandover: `At handover (after ${constructionYears} years), you have two options`,
            exitProfit: `${constructionClean.exitValueNominal.toFixed(0)} AED`,
          }
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    )
  ]
});

/**
 * Main function - Run the agent with Skills
 */
async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set');
    console.error('Please create a .env file with your Anthropic API key');
    process.exit(1);
  }

  console.log('🏠 Real Estate Investment Agent');
  console.log('💬 Powered by Claude Agent SDK\n');
  console.log('📋 Skills loaded from .claude/skills/');
  console.log('  ✅ ready-property: Ready property financial feasibility');
  console.log('  ✅ offplan-property: Off-plan property financial feasibility\n');
  console.log('Type your property details or type "exit" to quit.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const prompt = (q: string): Promise<string> =>
    new Promise((resolve) => rl.question(q, resolve));

  while (true) {
    const userInput = await prompt('You: ');

    if (userInput.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      rl.close();
      break;
    }

    if (!userInput.trim()) {
      continue;
    }

    try {
      console.log();

      // Use the Agent SDK query function with Skills enabled
      // Note: API key is read from ANTHROPIC_API_KEY environment variable
      for await (const message of query({
        prompt: userInput,
        options: {
          model: 'claude-sonnet-4-5',
          cwd: __dirname,  // Project directory containing .claude/skills/
          settingSources: ['project'],  // Load Skills from .claude/skills/
          allowedTools: ['Skill'],
          mcpServers: {
            'real-estate-analysis': realEstateServer  // Add custom MCP server with tools
          },
          systemPrompt: `You are a professional real estate investment advisor for Dubai properties.

Your role is to help investors assess financial feasibility of property investments - both READY and OFF-PLAN properties.

You have access to Skills that provide specialized analysis:
- ready-property: For move-in ready properties with immediate rental income
- offplan-property: For properties under construction with developer payment plans

You also have access to custom tools:
- assess_ready_property_feasibility: Direct tool for ready property analysis
- assess_offplan_property_feasibility: Direct tool for off-plan property analysis

When a user mentions a property:
1. Determine if it's READY or OFF-PLAN
2. Use the appropriate Skill or tool to analyze it automatically
3. Present the recommendations clearly

IMPORTANT: The Skills will invoke the underlying tools automatically. Present the analysis and recommendations that come from the Skills.

For OFF-PLAN properties, the analysis includes BOTH scenarios:
1. Exit at handover (sell immediately)
2. Continue with mortgage (hold and rent)

Provide guidance on which option appears better based on the recommendations.`,
        }
      })) {
        if (typeof message === 'string') {
          console.log(message);
        }
      }

      console.log('\n');
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

main().catch(console.error);
