#!/usr/bin/env node

/**
 * Time Value of Money Calculator - CLI Tool
 *
 * Command-line interface for TVM calculations
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { TVMCalculator } from '@tvm-calc/core';

const program = new Command();
const calculator = new TVMCalculator();

// Helper to parse number
function parseNum(value) {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return num;
}

// Helper to parse array of numbers
function parseArray(value) {
  return value.split(',').map(v => parseNum(v.trim()));
}

// NPV Command
program
  .command('npv')
  .description('Calculate Net Present Value')
  .requiredOption('-r, --rate <rate>', 'Discount rate (e.g., 0.1 for 10%)', parseNum)
  .requiredOption('-c, --cash-flows <flows>', 'Comma-separated cash flows (e.g., -1000,300,300,300)')
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    try {
      const cashFlows = parseArray(options.cashFlows);
      const npv = calculator.npv(options.rate, cashFlows);

      if (options.json) {
        console.log(JSON.stringify({ npv, rate: options.rate, cashFlows }, null, 2));
      } else {
        console.log(chalk.bold.cyan('\n💰 Net Present Value (NPV)\n'));
        console.log(`Discount Rate: ${chalk.yellow((options.rate * 100).toFixed(2) + '%')}`);
        console.log(`Cash Flows: ${chalk.gray(cashFlows.join(', '))}`);
        console.log();
        const npvColor = npv > 0 ? chalk.green : chalk.red;
        console.log(`NPV: ${npvColor('$' + npv.toFixed(2))}`);
        console.log(npv > 0 ? chalk.green('✓ Creates Value') : chalk.red('✗ Destroys Value'));
        console.log();
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// IRR Command
program
  .command('irr')
  .description('Calculate Internal Rate of Return')
  .requiredOption('-c, --cash-flows <flows>', 'Comma-separated cash flows')
  .option('-g, --guess <rate>', 'Initial guess for IRR', parseNum, 0.1)
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    try {
      const cashFlows = parseArray(options.cashFlows);
      const irr = calculator.irr(cashFlows, options.guess);

      if (options.json) {
        console.log(JSON.stringify({ irr, irrPercent: irr * 100, cashFlows }, null, 2));
      } else {
        console.log(chalk.bold.cyan('\n📈 Internal Rate of Return (IRR)\n'));
        console.log(`Cash Flows: ${chalk.gray(cashFlows.join(', '))}`);
        console.log();
        console.log(`IRR: ${chalk.yellow((irr * 100).toFixed(2) + '%')}`);
        console.log();
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// PMT Command
program
  .command('pmt')
  .description('Calculate Payment amount (e.g., loan payment)')
  .requiredOption('-r, --rate <rate>', 'Interest rate per period', parseNum)
  .requiredOption('-n, --nper <periods>', 'Number of periods', parseNum)
  .requiredOption('-p, --pv <value>', 'Present value (loan amount)', parseNum)
  .option('-f, --fv <value>', 'Future value', parseNum, 0)
  .option('-t, --type <0|1>', 'Payment timing (0=end, 1=beginning)', parseNum, 0)
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    try {
      const pmt = calculator.pmt(options.rate, options.nper, options.pv, options.fv, options.type);

      if (options.json) {
        console.log(JSON.stringify({ pmt, ...options }, null, 2));
      } else {
        console.log(chalk.bold.cyan('\n💳 Payment Calculation\n'));
        console.log(`Present Value: ${chalk.gray('$' + Math.abs(options.pv).toFixed(2))}`);
        console.log(`Interest Rate: ${chalk.gray((options.rate * 100).toFixed(2) + '% per period')}`);
        console.log(`Periods: ${chalk.gray(options.nper)}`);
        console.log();
        console.log(`Payment: ${chalk.yellow('$' + Math.abs(pmt).toFixed(2) + ' per period')}`);
        console.log();
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// FV Command
program
  .command('fv')
  .description('Calculate Future Value')
  .requiredOption('-r, --rate <rate>', 'Interest rate per period', parseNum)
  .requiredOption('-n, --nper <periods>', 'Number of periods', parseNum)
  .requiredOption('-p, --pmt <payment>', 'Payment per period', parseNum)
  .option('--pv <value>', 'Present value', parseNum, 0)
  .option('-t, --type <0|1>', 'Payment timing (0=end, 1=beginning)', parseNum, 0)
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    try {
      const fv = calculator.fv(options.rate, options.nper, options.pmt, options.pv, options.type);

      if (options.json) {
        console.log(JSON.stringify({ fv, ...options }, null, 2));
      } else {
        console.log(chalk.bold.cyan('\n🚀 Future Value\n'));
        console.log(`Payment: ${chalk.gray('$' + Math.abs(options.pmt).toFixed(2) + ' per period')}`);
        console.log(`Interest Rate: ${chalk.gray((options.rate * 100).toFixed(2) + '% per period')}`);
        console.log(`Periods: ${chalk.gray(options.nper)}`);
        console.log();
        console.log(`Future Value: ${chalk.yellow('$' + fv.toFixed(2))}`);
        console.log();
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// PV Command
program
  .command('pv')
  .description('Calculate Present Value')
  .requiredOption('-r, --rate <rate>', 'Interest rate per period', parseNum)
  .requiredOption('-n, --nper <periods>', 'Number of periods', parseNum)
  .requiredOption('-p, --pmt <payment>', 'Payment per period', parseNum)
  .option('-f, --fv <value>', 'Future value', parseNum, 0)
  .option('-t, --type <0|1>', 'Payment timing (0=end, 1=beginning)', parseNum, 0)
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    try {
      const pv = calculator.pv(options.rate, options.nper, options.pmt, options.fv, options.type);

      if (options.json) {
        console.log(JSON.stringify({ pv, ...options }, null, 2));
      } else {
        console.log(chalk.bold.cyan('\n📊 Present Value\n'));
        console.log(`Payment: ${chalk.gray('$' + Math.abs(options.pmt).toFixed(2) + ' per period')}`);
        console.log(`Interest Rate: ${chalk.gray((options.rate * 100).toFixed(2) + '% per period')}`);
        console.log(`Periods: ${chalk.gray(options.nper)}`);
        console.log();
        console.log(`Present Value: ${chalk.yellow('$' + Math.abs(pv).toFixed(2))}`);
        console.log();
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// NPER Command
program
  .command('nper')
  .description('Calculate Number of Periods')
  .requiredOption('-r, --rate <rate>', 'Interest rate per period', parseNum)
  .requiredOption('-p, --pmt <payment>', 'Payment per period', parseNum)
  .requiredOption('--pv <value>', 'Present value', parseNum)
  .option('-f, --fv <value>', 'Future value', parseNum, 0)
  .option('-t, --type <0|1>', 'Payment timing (0=end, 1=beginning)', parseNum, 0)
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    try {
      const nper = calculator.nper(options.rate, options.pmt, options.pv, options.fv, options.type);

      if (options.json) {
        console.log(JSON.stringify({ nper, ...options }, null, 2));
      } else {
        console.log(chalk.bold.cyan('\n⏱️  Number of Periods\n'));
        console.log(`Present Value: ${chalk.gray('$' + Math.abs(options.pv).toFixed(2))}`);
        console.log(`Payment: ${chalk.gray('$' + Math.abs(options.pmt).toFixed(2) + ' per period')}`);
        console.log(`Interest Rate: ${chalk.gray((options.rate * 100).toFixed(2) + '% per period')}`);
        console.log();
        console.log(`Number of Periods: ${chalk.yellow(nper.toFixed(2))}`);
        console.log();
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// RATE Command
program
  .command('rate')
  .description('Calculate Interest Rate')
  .requiredOption('-n, --nper <periods>', 'Number of periods', parseNum)
  .requiredOption('-p, --pmt <payment>', 'Payment per period', parseNum)
  .requiredOption('--pv <value>', 'Present value', parseNum)
  .option('-f, --fv <value>', 'Future value', parseNum, 0)
  .option('-t, --type <0|1>', 'Payment timing (0=end, 1=beginning)', parseNum, 0)
  .option('-g, --guess <rate>', 'Initial guess', parseNum, 0.1)
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    try {
      const rate = calculator.rate(options.nper, options.pmt, options.pv, options.fv, options.type, options.guess);

      if (options.json) {
        console.log(JSON.stringify({ rate, ratePercent: rate * 100, ...options }, null, 2));
      } else {
        console.log(chalk.bold.cyan('\n💹 Interest Rate\n'));
        console.log(`Present Value: ${chalk.gray('$' + Math.abs(options.pv).toFixed(2))}`);
        console.log(`Payment: ${chalk.gray('$' + Math.abs(options.pmt).toFixed(2) + ' per period')}`);
        console.log(`Periods: ${chalk.gray(options.nper)}`);
        console.log();
        console.log(`Interest Rate: ${chalk.yellow((rate * 100).toFixed(2) + '% per period')}`);
        console.log();
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Examples Command
program
  .command('examples')
  .description('Show example commands')
  .action(() => {
    console.log(chalk.bold.cyan('\n📚 TVM Calculator - Example Commands\n'));

    console.log(chalk.bold('Net Present Value:'));
    console.log(chalk.gray('  $ tvm-calc npv --rate 0.1 --cash-flows "-1000,300,300,300,300"\n'));

    console.log(chalk.bold('Internal Rate of Return:'));
    console.log(chalk.gray('  $ tvm-calc irr --cash-flows "-1000,300,300,300,300"\n'));

    console.log(chalk.bold('Loan Payment:'));
    console.log(chalk.gray('  $ tvm-calc pmt --rate 0.00333 --nper 360 --pv -100000\n'));

    console.log(chalk.bold('Future Value of Investment:'));
    console.log(chalk.gray('  $ tvm-calc fv --rate 0.005 --nper 120 --pmt -1000\n'));

    console.log(chalk.bold('Present Value:'));
    console.log(chalk.gray('  $ tvm-calc pv --rate 0.005 --nper 120 --pmt 1000\n'));

    console.log(chalk.bold('How Many Periods:'));
    console.log(chalk.gray('  $ tvm-calc nper --rate 0.01 --pmt 500 --pv -10000\n'));

    console.log(chalk.bold('What Interest Rate:'));
    console.log(chalk.gray('  $ tvm-calc rate --nper 24 --pmt 500 --pv -10000\n'));

    console.log(chalk.bold('JSON Output:'));
    console.log(chalk.gray('  $ tvm-calc npv --rate 0.1 --cash-flows "-1000,300,300,300" --json\n'));
  });

// Configure program
program
  .name('tvm-calc')
  .description('Time Value of Money Calculator - NPV, IRR, PMT, FV, PV, NPER, RATE')
  .version('1.0.0');

program.parse();
