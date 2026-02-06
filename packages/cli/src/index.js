#!/usr/bin/env node

/**
 * Real Estate Investment Calculator - CLI Tool
 *
 * Command-line interface for real estate investment calculations
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { RealEstateCalculator } from '@real-estate-calc/core';

const program = new Command();
const calculator = new RealEstateCalculator();

// Helper function to format results
function formatResults(results, type) {
  console.log(chalk.bold.cyan('\n📊 Investment Analysis Results\n'));
  console.log(chalk.bold('═'.repeat(60)));

  if (type === 'ready' || type === 'offplan') {
    // Key Metrics
    console.log(chalk.bold.green('\n💰 Key Financial Metrics:\n'));

    console.log(chalk.bold('DCF (Discounted Cash Flow):'));
    console.log(`  ${chalk.yellow('$' + (results.dcf?.toFixed?.(2) || results.dcf))}`);

    console.log(chalk.bold('\nNPV (Net Present Value):'));
    const npv = results.npv?.toFixed?.(2) || results.npv;
    const npvColor = results.npv > 0 ? chalk.green : chalk.red;
    console.log(`  ${npvColor('$' + npv)} ${results.npv > 0 ? '✓ Creates Value' : '✗ Destroys Value'}`);

    console.log(chalk.bold('\nIRR (Internal Rate of Return):'));
    const irr = ((results.irr?.toFixed?.(4) || results.irr) * 100).toFixed(2);
    console.log(`  ${chalk.yellow(irr + '%')}`);

    if (results.roic !== undefined) {
      console.log(chalk.bold('\nROIC (Return on Invested Capital):'));
      const roic = ((results.roic?.toFixed?.(4) || results.roic) * 100).toFixed(2);
      console.log(`  ${chalk.yellow(roic + '%')}`);
    }

    if (results.dscr !== undefined) {
      console.log(chalk.bold('\nDSCR (Debt Service Coverage Ratio):'));
      const dscr = results.dscr?.toFixed?.(2) || results.dscr;
      const dscrColor = results.dscr >= 1.25 ? chalk.green : chalk.red;
      console.log(`  ${dscrColor(dscr)} ${results.dscr >= 1.25 ? '✓ Healthy' : '✗ Risky'}`);
    }
  }

  // Additional details based on type
  if (type === 'ready' && results.investedCapital) {
    console.log(chalk.bold.blue('\n💵 Investment Breakdown:\n'));
    console.log(`Invested Capital: ${chalk.yellow('$' + (results.investedCapital?.toFixed?.(2) || results.investedCapital))}`);
    console.log(`Monthly EMI: ${chalk.yellow('$' + (results.monthlyEMI?.toFixed?.(2) || results.monthlyEMI))}`);
    console.log(`Net Annual Cash Flow: ${chalk.yellow('$' + (results.netAnnualCashFlow?.toFixed?.(2) || results.netAnnualCashFlow))}`);
  }

  if (type === 'offplan' && results.totalPaidDuringConstruction) {
    console.log(chalk.bold.blue('\n💵 Payment Schedule:\n'));
    console.log(`Total Paid During Construction: ${chalk.yellow('$' + (results.totalPaidDuringConstruction?.toFixed?.(2) || results.totalPaidDuringConstruction))}`);
    console.log(`Invested Capital (Today's Value): ${chalk.yellow('$' + (results.investedCapitalToday?.toFixed?.(2) || results.investedCapitalToday))}`);
  }

  console.log(chalk.bold('\n' + '═'.repeat(60) + '\n'));
}

// Helper to parse number with fallback
function parseNum(value, defaultValue = 0) {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

// Ready Property Command
program
  .command('ready')
  .description('Calculate ready property investment with mortgage')
  .requiredOption('-v, --value <number>', 'Total property value')
  .requiredOption('-s, --size <number>', 'Property size (sq ft)')
  .option('-d, --down-payment <percent>', 'Down payment percentage', '25')
  .option('-r, --registration <percent>', 'Registration fee percentage', '4')
  .option('-t, --tenure <years>', 'Loan tenure in years', '25')
  .option('--discount <percent>', 'Discount rate (hurdle rate)', '4')
  .option('--rental <percent>', 'Rental ROI percentage', '6')
  .option('--service <amount>', 'Service charges per sq ft', '10')
  .option('-e, --exit <value>', 'Expected exit value')
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    try {
      const inputs = {
        propertySize: parseNum(options.size),
        totalValue: parseNum(options.value),
        downPaymentPercent: parseNum(options.downPayment),
        registrationFeePercent: parseNum(options.registration),
        tenure: parseNum(options.tenure),
        discountRate: parseNum(options.discount),
        rentalROI: parseNum(options.rental),
        serviceChargesPerSqFt: parseNum(options.service),
        exitValue: parseNum(options.exit || options.value * 1.2)
      };

      const results = calculator.calculateReadyProperty(inputs);

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        formatResults(results, 'ready');
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Off-Plan Property Command
program
  .command('offplan')
  .description('Calculate off-plan property investment with developer payment plan')
  .requiredOption('-v, --value <number>', 'Total property value')
  .requiredOption('-s, --size <number>', 'Property size (sq ft)')
  .option('-d, --down-payment <percent>', 'Down payment percentage', '10')
  .option('-i, --installment <percent>', 'Installment payment percentage', '1')
  .option('-f, --frequency <months>', 'Payment frequency in months (1,3,6,12)', '3')
  .option('-c, --construction <years>', 'Construction period in years', '3')
  .option('-h, --handover <percent>', 'Handover payment percentage', '10')
  .option('-e, --expected <value>', 'Expected value at handover')
  .option('--discount <percent>', 'Discount rate (hurdle rate)', '4')
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    try {
      const totalValue = parseNum(options.value);
      const inputs = {
        size: parseNum(options.size),
        totalValue,
        downPaymentPercent: parseNum(options.downPayment),
        installmentPercent: parseNum(options.installment),
        paymentFrequencyMonths: parseNum(options.frequency),
        constructionTenureYears: parseNum(options.construction),
        handoverPaymentPercent: parseNum(options.handover),
        expectedValue: parseNum(options.expected || totalValue * 1.2),
        discountRate: parseNum(options.discount)
      };

      const results = calculator.calculateOffplan(inputs);

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        formatResults(results, 'offplan');
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Example Commands
program
  .command('examples')
  .description('Show example commands')
  .action(() => {
    console.log(chalk.bold.cyan('\n📚 Example Commands:\n'));

    console.log(chalk.bold('Ready Property (Mortgage):'));
    console.log(chalk.gray('  $ real-estate-calc ready --value 850000 --size 850 --down-payment 25\n'));

    console.log(chalk.bold('Off-Plan Property:'));
    console.log(chalk.gray('  $ real-estate-calc offplan --value 500000 --size 500 --down-payment 10 --construction 3\n'));

    console.log(chalk.bold('With JSON Output:'));
    console.log(chalk.gray('  $ real-estate-calc ready --value 850000 --size 850 -j\n'));

    console.log(chalk.bold('Custom Parameters:'));
    console.log(chalk.gray('  $ real-estate-calc ready --value 1000000 --size 1000 \\\n'));
    console.log(chalk.gray('      --down-payment 30 --tenure 20 --rental 7 --discount 5\n'));
  });

// Configure program
program
  .name('real-estate-calc')
  .description('Real Estate Investment Calculator - Analyze property investments with DCF, NPV, IRR')
  .version('1.0.0');

program.parse();
