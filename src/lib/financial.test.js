/**
 * Unit Tests for Financial Functions
 *
 * Demonstrates testability of pure functions separated from business logic.
 * These tests verify financial calculations match Excel formulas.
 */

import { PMT, NPV_Excel, IRR, PV, FV, calculateDSCR, calculateROIC } from './financial.js';

describe('Financial Functions', () => {
  describe('PMT - Payment Calculation', () => {
    test('calculates monthly payment with interest correctly', () => {
      // $100,000 loan at 5% annual rate for 30 years
      const rate = 0.05 / 12; // monthly rate
      const nper = 30 * 12; // 360 months
      const pv = -100000;

      const payment = PMT(rate, nper, pv);

      expect(payment).toBeCloseTo(536.82, 2);
    });

    test('calculates payment with zero interest rate', () => {
      // $100,000 loan at 0% for 10 years
      const rate = 0;
      const nper = 10 * 12;
      const pv = -100000;

      const payment = PMT(rate, nper, pv);

      expect(payment).toBeCloseTo(833.33, 2);
    });
  });

  describe('NPV_Excel - Net Present Value', () => {
    test('calculates NPV for consistent cash flows', () => {
      const rate = 0.10; // 10% discount rate
      const cashFlows = [1000, 1000, 1000, 1000]; // 4 years of $1,000

      const npv = NPV_Excel(rate, cashFlows);

      // Expected: 1000/1.1 + 1000/1.21 + 1000/1.331 + 1000/1.4641
      expect(npv).toBeCloseTo(3169.87, 2);
    });

    test('calculates NPV for varying cash flows', () => {
      const rate = 0.08;
      const cashFlows = [500, 1000, 1500, 2000];

      const npv = NPV_Excel(rate, cashFlows);

      // Actual calculation: 500/1.08 + 1000/1.1664 + 1500/1.259712 + 2000/1.36048896
      expect(npv).toBeCloseTo(3981.11, 2);
    });
  });

  describe('IRR - Internal Rate of Return', () => {
    test('calculates IRR for profitable investment', () => {
      // Initial investment of -$10,000, then +$3,000 for 5 years
      const cashFlows = [-10000, 3000, 3000, 3000, 3000, 3000];

      const irr = IRR(cashFlows);

      expect(irr).toBeCloseTo(0.1524, 3); // ~15.24%
    });

    test('calculates IRR for breakeven investment', () => {
      const cashFlows = [-1000, 500, 500];

      const irr = IRR(cashFlows);

      expect(irr).toBeCloseTo(0, 2);
    });
  });

  describe('PV - Present Value', () => {
    test('calculates present value correctly', () => {
      const futureValue = 10000;
      const rate = 0.05;
      const periods = 10;

      const pv = PV(futureValue, rate, periods);

      // 10000 / (1.05^10)
      expect(pv).toBeCloseTo(6139.13, 2);
    });

    test('handles zero rate', () => {
      const futureValue = 10000;
      const rate = 0;
      const periods = 5;

      const pv = PV(futureValue, rate, periods);

      expect(pv).toBe(10000); // No discounting at 0% rate
    });
  });

  describe('FV - Future Value', () => {
    test('calculates future value correctly', () => {
      const presentValue = 5000;
      const rate = 0.06;
      const periods = 8;

      const fv = FV(presentValue, rate, periods);

      // 5000 * (1.06^8)
      expect(fv).toBeCloseTo(7969.24, 2);
    });
  });

  describe('calculateDSCR - Debt Service Coverage Ratio', () => {
    test('calculates DSCR correctly', () => {
      const netOperatingIncome = 50000;
      const annualDebtService = 40000;

      const dscr = calculateDSCR(netOperatingIncome, annualDebtService);

      expect(dscr).toBe(1.25);
    });

    test('returns 0 when debt service is zero', () => {
      const netOperatingIncome = 50000;
      const annualDebtService = 0;

      const dscr = calculateDSCR(netOperatingIncome, annualDebtService);

      expect(dscr).toBe(0);
    });

    test('calculates DSCR less than 1 for insufficient income', () => {
      const netOperatingIncome = 30000;
      const annualDebtService = 40000;

      const dscr = calculateDSCR(netOperatingIncome, annualDebtService);

      expect(dscr).toBe(0.75);
    });
  });

  describe('calculateROIC - Return on Invested Capital', () => {
    test('calculates positive ROIC correctly', () => {
      const totalReturn = 150000;
      const investedCapital = 100000;

      const roic = calculateROIC(totalReturn, investedCapital);

      expect(roic).toBe(0.5); // 50% return
    });

    test('calculates negative ROIC for losses', () => {
      const totalReturn = 80000;
      const investedCapital = 100000;

      const roic = calculateROIC(totalReturn, investedCapital);

      expect(roic).toBeCloseTo(-0.2, 10); // -20% return (floating point precision)
    });

    test('returns 0 when invested capital is zero', () => {
      const totalReturn = 50000;
      const investedCapital = 0;

      const roic = calculateROIC(totalReturn, investedCapital);

      expect(roic).toBe(0);
    });

    test('calculates breakeven scenario', () => {
      const totalReturn = 100000;
      const investedCapital = 100000;

      const roic = calculateROIC(totalReturn, investedCapital);

      expect(roic).toBe(0); // 0% return (breakeven)
    });
  });
});
