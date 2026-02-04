/**
 * Unit Tests for Financial Functions (Decimal.js Version)
 *
 * Tests now use exact Decimal comparisons instead of floating-point tolerances.
 * Expected values are calculated with proper precision to match Decimal results.
 *
 * Note: All financial functions now return Decimal objects, not Numbers.
 */

import { PMT, NPV_Excel, IRR, PV, FV, calculateDSCR, calculateROIC } from './financial.js';
import Decimal from './decimalConfig.js';

describe('Financial Functions', () => {
  describe('PMT - Payment Calculation', () => {
    test('calculates monthly payment with interest correctly', () => {
      // $100,000 loan at 5% annual rate for 30 years
      const rate = 0.05 / 12; // monthly rate
      const nper = 30 * 12; // 360 months
      const pv = -100000;

      const payment = PMT(rate, nper, pv);

      // Exact value with Decimal precision
      expect(payment.toFixed(4)).toBe('536.8216');
    });

    test('calculates payment with zero interest rate', () => {
      // $100,000 loan at 0% for 10 years
      const rate = 0;
      const nper = 10 * 12;
      const pv = -100000;

      const payment = PMT(rate, nper, pv);

      // Exact value: 100000 / 120 = 833.333...
      expect(payment.toFixed(4)).toBe('833.3333');
    });
  });

  describe('NPV_Excel - Net Present Value', () => {
    test('calculates NPV for consistent cash flows', () => {
      const rate = 0.10; // 10% discount rate
      const cashFlows = [1000, 1000, 1000, 1000]; // 4 years of $1,000

      const npv = NPV_Excel(rate, cashFlows);

      // Exact calculation with Decimal precision
      // 1000/1.1 + 1000/1.21 + 1000/1.331 + 1000/1.4641
      expect(npv.toFixed(4)).toBe('3169.8654');
    });

    test('calculates NPV for varying cash flows', () => {
      const rate = 0.08;
      const cashFlows = [500, 1000, 1500, 2000];

      const npv = NPV_Excel(rate, cashFlows);

      // Exact calculation with Decimal precision: 500/1.08 + 1000/1.1664 + 1500/1.259712 + 2000/1.36048896
      expect(npv.toFixed(4)).toBe('3981.1099');
    });
  });

  describe('IRR - Internal Rate of Return', () => {
    test('calculates IRR for profitable investment', () => {
      // Initial investment of -$10,000, then +$3,000 for 5 years
      const cashFlows = [-10000, 3000, 3000, 3000, 3000, 3000];

      const irr = IRR(cashFlows);

      // Exact IRR with Decimal precision (Newton-Raphson convergence)
      expect(irr.toFixed(6)).toBe('0.152382');
    });

    test('calculates IRR for breakeven investment', () => {
      const cashFlows = [-1000, 500, 500];

      const irr = IRR(cashFlows);

      // Breakeven IRR should be effectively 0 (handle negative zero)
      expect(irr.abs().toFixed(6)).toBe('0.000000');
    });
  });

  describe('PV - Present Value', () => {
    test('calculates present value correctly', () => {
      const futureValue = 10000;
      const rate = 0.05;
      const periods = 10;

      const pv = PV(futureValue, rate, periods);

      // Exact: 10000 / (1.05^10)
      expect(pv.toFixed(4)).toBe('6139.1325');
    });

    test('handles zero rate', () => {
      const futureValue = 10000;
      const rate = 0;
      const periods = 5;

      const pv = PV(futureValue, rate, periods);

      // At 0% rate, PV = FV (no discounting)
      expect(pv.equals(new Decimal(10000))).toBe(true);
    });
  });

  describe('FV - Future Value', () => {
    test('calculates future value correctly', () => {
      const presentValue = 5000;
      const rate = 0.06;
      const periods = 8;

      const fv = FV(presentValue, rate, periods);

      // Exact with Decimal precision: 5000 * (1.06^8)
      expect(fv.toFixed(4)).toBe('7969.2404');
    });
  });

  describe('calculateDSCR - Debt Service Coverage Ratio', () => {
    test('calculates DSCR correctly', () => {
      const netOperatingIncome = 50000;
      const annualDebtService = 40000;

      const dscr = calculateDSCR(netOperatingIncome, annualDebtService);

      // Exact: 50000 / 40000 = 1.25
      expect(dscr.equals(new Decimal('1.25'))).toBe(true);
    });

    test('returns 0 when debt service is zero', () => {
      const netOperatingIncome = 50000;
      const annualDebtService = 0;

      const dscr = calculateDSCR(netOperatingIncome, annualDebtService);

      // Should return exactly 0
      expect(dscr.equals(new Decimal(0))).toBe(true);
    });

    test('calculates DSCR less than 1 for insufficient income', () => {
      const netOperatingIncome = 30000;
      const annualDebtService = 40000;

      const dscr = calculateDSCR(netOperatingIncome, annualDebtService);

      // Exact: 30000 / 40000 = 0.75
      expect(dscr.equals(new Decimal('0.75'))).toBe(true);
    });
  });

  describe('calculateROIC - Return on Invested Capital', () => {
    test('calculates positive ROIC correctly', () => {
      const totalReturn = 150000;
      const investedCapital = 100000;

      const roic = calculateROIC(totalReturn, investedCapital);

      // Exact: (150000 / 100000) - 1 = 0.5 (50% return)
      expect(roic.equals(new Decimal('0.5'))).toBe(true);
    });

    test('calculates negative ROIC for losses', () => {
      const totalReturn = 80000;
      const investedCapital = 100000;

      const roic = calculateROIC(totalReturn, investedCapital);

      // Exact: (80000 / 100000) - 1 = -0.2 (-20% return)
      expect(roic.equals(new Decimal('-0.2'))).toBe(true);
    });

    test('returns 0 when invested capital is zero', () => {
      const totalReturn = 50000;
      const investedCapital = 0;

      const roic = calculateROIC(totalReturn, investedCapital);

      // Should return exactly 0 (not undefined or NaN)
      expect(roic.equals(new Decimal(0))).toBe(true);
    });

    test('calculates breakeven scenario', () => {
      const totalReturn = 100000;
      const investedCapital = 100000;

      const roic = calculateROIC(totalReturn, investedCapital);

      // Exact: (100000 / 100000) - 1 = 0 (0% return, breakeven)
      expect(roic.equals(new Decimal(0))).toBe(true);
    });
  });
});
