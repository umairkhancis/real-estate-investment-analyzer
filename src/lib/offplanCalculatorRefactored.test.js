/**
 * Unit Tests for Off-Plan Calculator (Decimal.js Version)
 *
 * Tests all business logic for off-plan developer payment plans with exact precision.
 * All functions now return Decimal objects, not Numbers.
 * Tests use exact Decimal comparisons instead of floating-point tolerances.
 * CRITICAL: The 0.0004 adjustment has been REMOVED from implementation.
 */

import { describe, test, expect } from 'vitest';
import {
  calculatePaymentStructure,
  calculateConstructionPayments,
  calculateExitValue,
  generateConstructionCashFlows,
  calculateConstructionDCF,
  calculateOffplanInvestment,
  calculateMortgageContinuation
} from './offplanCalculatorRefactored.js';
import Decimal from './decimalConfig.js';

describe('Off-Plan Calculator (Refactored)', () => {
  describe('calculatePaymentStructure', () => {
    test('calculates payment structure correctly', () => {
      const params = {
        constructionTenureYears: 3,
        paymentFrequencyMonths: 6,
        downPaymentPercent: 0.10,
        installmentPercent: 0.05
      };

      const result = calculatePaymentStructure(params);

      // Exact Decimal comparisons
      expect(result.numberOfPayments).toBe(6); // (3 * 12) / 6 = 6 (integer)
      expect(result.totalConstructionPercent.equals(new Decimal('0.40'))).toBe(true); // 0.10 + (0.05 * 6)
    });

    test('handles monthly payments', () => {
      const params = {
        constructionTenureYears: 2,
        paymentFrequencyMonths: 1,
        downPaymentPercent: 0.15,
        installmentPercent: 0.03
      };

      const result = calculatePaymentStructure(params);

      // Exact Decimal comparisons
      expect(result.numberOfPayments).toBe(24); // (2 * 12) / 1 (integer)
      expect(result.totalConstructionPercent.equals(new Decimal('0.87'))).toBe(true); // 0.15 + (0.03 * 24)
    });

    test('handles annual payments', () => {
      const params = {
        constructionTenureYears: 4,
        paymentFrequencyMonths: 12,
        downPaymentPercent: 0.20,
        installmentPercent: 0.10
      };

      const result = calculatePaymentStructure(params);

      // Exact Decimal comparisons (no floating point issues with Decimal)
      expect(result.numberOfPayments).toBe(4); // (4 * 12) / 12 (integer)
      expect(result.totalConstructionPercent.equals(new Decimal('0.60'))).toBe(true); // 0.20 + (0.10 * 4)
    });
  });

  describe('calculateConstructionPayments', () => {
    test('calculates construction payment amounts correctly', () => {
      const params = {
        totalValue: 850000,
        downPaymentPercent: 0.10,
        installmentPercent: 0.05,
        totalConstructionPercent: 0.40,
        registrationFeePercent: 0.04,
        constructionTenureYears: 3
      };

      const result = calculateConstructionPayments(params);

      // Exact Decimal comparisons
      expect(result.downPaymentAmount.equals(new Decimal(85000))).toBe(true); // 850000 * 0.10
      expect(result.totalPaymentTillHandover.equals(new Decimal(340000))).toBe(true); // 850000 * 0.40
      expect(result.shadowFinancing.equals(new Decimal(255000))).toBe(true); // 340000 - 85000
      expect(result.annualizedInstallment.equals(new Decimal(85000))).toBe(true); // 255000 / 3
      expect(result.registrationFee.equals(new Decimal(34000))).toBe(true); // 850000 * 0.04
    });

    test('handles zero down payment with full installments', () => {
      const params = {
        totalValue: 1000000,
        downPaymentPercent: 0,
        installmentPercent: 0.10,
        totalConstructionPercent: 0.50,
        registrationFeePercent: 0.04,
        constructionTenureYears: 5
      };

      const result = calculateConstructionPayments(params);

      // Exact Decimal comparisons
      expect(result.downPaymentAmount.equals(new Decimal(0))).toBe(true);
      expect(result.totalPaymentTillHandover.equals(new Decimal(500000))).toBe(true);
      expect(result.shadowFinancing.equals(new Decimal(500000))).toBe(true);
      expect(result.annualizedInstallment.equals(new Decimal(100000))).toBe(true); // 500000 / 5
    });
  });

  describe('calculateExitValue', () => {
    test('calculates exit value correctly', () => {
      const params = {
        propertySize: 850,
        futurePricePerSqft: 1200,
        totalConstructionPercent: 0.40,
        discountRate: 0.04,
        constructionTenureYears: 3
      };

      const result = calculateExitValue(params);

      // Exact Decimal comparisons
      expect(result.exitValueNominal.equals(new Decimal(408000))).toBe(true); // 850 * 1200 * 0.40
      expect(result.exitValueDiscounted.toFixed(2)).toBe('362710.51');
    });

    test('handles zero discount rate', () => {
      const params = {
        propertySize: 1000,
        futurePricePerSqft: 1500,
        totalConstructionPercent: 0.50,
        discountRate: 0,
        constructionTenureYears: 5
      };

      const result = calculateExitValue(params);

      // Exact Decimal comparisons
      expect(result.exitValueNominal.equals(new Decimal(750000))).toBe(true);
      expect(result.exitValueDiscounted.equals(new Decimal(750000))).toBe(true); // No discounting at 0%
    });
  });

  describe('generateConstructionCashFlows', () => {
    test('generates cash flows correctly', () => {
      const params = {
        downPaymentAmount: 85000,
        annualizedInstallment: 85000,
        constructionTenureYears: 3
      };

      const result = generateConstructionCashFlows(params);

      // CRITICAL: 0.0004 adjustment REMOVED with Decimal precision
      expect(result.length).toBe(4); // Year 0 + 3 years
      expect(result[0]).toBe(-85000); // Year 0 (NO adjustment needed with Decimal)
      expect(result[1]).toBe(-85000); // Year 1
      expect(result[2]).toBe(-85000); // Year 2
      expect(result[3]).toBe(-85000); // Year 3
    });

    test('handles single year construction', () => {
      const params = {
        downPaymentAmount: 100000,
        annualizedInstallment: 50000,
        constructionTenureYears: 1
      };

      const result = generateConstructionCashFlows(params);

      // CRITICAL: 0.0004 adjustment REMOVED with Decimal precision
      expect(result.length).toBe(2);
      expect(result[0]).toBe(-100000); // NO adjustment needed
      expect(result[1]).toBe(-50000);
    });
  });

  describe('calculateConstructionDCF', () => {
    test('calculates DCF metrics correctly', () => {
      const params = {
        cashFlows: [-85000, -85000, -85000, -85000], // NO 0.0004 adjustment
        exitValueDiscounted: 362710.51,
        discountRate: 0.04,
        downPaymentAmount: 85000
      };

      const result = calculateConstructionDCF(params);

      // Exact Decimal assertions (TRUE values with 0.0004 removal)
      expect(result.dcf.toFixed(2)).toBe('126827.77');
      expect(result.npv.toFixed(2)).toBe('41827.77');
      expect(result.irr.toFixed(4)).toBe('0.0260');
      expect(result.roic.toFixed(4)).toBe('0.4921');
      expect(result.investedCapitalToday.equals(new Decimal(85000))).toBe(true);
    });

    test('handles negative NPV scenario', () => {
      const params = {
        cashFlows: [-100000, -50000, -50000],
        exitValueDiscounted: 150000, // Not enough to cover costs
        discountRate: 0.08,
        downPaymentAmount: 100000
      };

      const result = calculateConstructionDCF(params);

      // Decimal comparisons for negative scenarios
      expect(result.npv.lessThan(0)).toBe(true); // Value destroying investment
      expect(result.roic.lessThan(0)).toBe(true); // Negative return
    });
  });

  describe('calculateOffplanInvestment - Integration', () => {
    test('matches Excel model with Decimal precision', () => {
      const inputs = {
        size: 850,
        totalValue: 850000,
        downPaymentPercent: 0.10,
        constructionTenureYears: 3,
        paymentFrequencyMonths: 6,
        installmentPercent: 0.05,
        discountRate: 0.04,
        futurePricePerSqft: 1200,
        registrationFeePercent: 0.04
      };

      const result = calculateOffplanInvestment(inputs);

      // Exact Decimal comparisons (0.0004 adjustment removed)
      expect(result.size).toBe(850); // Integer (input passthrough)
      expect(result.totalValue).toBe(850000); // Number (input passthrough)
      expect(result.numberOfPayments).toBe(6); // Integer
      expect(result.totalConstructionPercent.equals(new Decimal('0.40'))).toBe(true);
      expect(result.downPaymentAmount.equals(new Decimal(85000))).toBe(true);
      expect(result.exitValueNominal.equals(new Decimal(408000))).toBe(true);
      expect(result.exitValueDiscounted.toFixed(2)).toBe('362710.51');
      expect(result.dcf.toFixed(2)).toBe('126827.78'); // Changed due to 0.0004 removal
      expect(result.npv.toFixed(2)).toBe('41827.78'); // Changed due to 0.0004 removal
      expect(result.irr.toFixed(4)).toBe('0.0260');
      expect(result.roic.toFixed(4)).toBe('0.4921');
    });

    test('handles high down payment scenario', () => {
      const inputs = {
        size: 1000,
        totalValue: 1000000,
        downPaymentPercent: 0.30,
        constructionTenureYears: 2,
        paymentFrequencyMonths: 6,
        installmentPercent: 0.05,
        discountRate: 0.05,
        futurePricePerSqft: 1300,
        registrationFeePercent: 0.04
      };

      const result = calculateOffplanInvestment(inputs);

      // Exact Decimal comparisons
      expect(result.downPaymentAmount.equals(new Decimal(300000))).toBe(true);
      expect(result.numberOfPayments).toBe(4); // (2*12)/6 (integer)
      expect(result.totalConstructionPercent.equals(new Decimal('0.50'))).toBe(true); // 0.30 + (0.05*4)
      expect(result.dcf.greaterThan(0)).toBe(true);
      expect(result.npv.greaterThan(0)).toBe(true);
    });

    test('handles monthly payment frequency', () => {
      const inputs = {
        size: 750,
        totalValue: 750000,
        downPaymentPercent: 0.15,
        constructionTenureYears: 2,
        paymentFrequencyMonths: 1,
        installmentPercent: 0.02,
        discountRate: 0.06,
        futurePricePerSqft: 1100,
        registrationFeePercent: 0.04
      };

      const result = calculateOffplanInvestment(inputs);

      // Exact Decimal comparisons
      expect(result.numberOfPayments).toBe(24); // (2*12)/1 (integer)
      expect(result.totalConstructionPercent.equals(new Decimal('0.63'))).toBe(true); // 0.15 + (0.02*24)
      expect(result.cashFlows.length).toBe(3); // Year 0 + 2 years
    });

    test('returns all required fields', () => {
      const inputs = {
        size: 850,
        totalValue: 850000,
        downPaymentPercent: 0.10,
        constructionTenureYears: 3,
        paymentFrequencyMonths: 6,
        installmentPercent: 0.05,
        discountRate: 0.04,
        futurePricePerSqft: 1200,
        registrationFeePercent: 0.04
      };

      const result = calculateOffplanInvestment(inputs);

      const requiredFields = [
        'size',
        'totalValue',
        'constructionTenureYears',
        'numberOfPayments',
        'totalConstructionPercent',
        'downPaymentAmount',
        'totalPaymentTillHandover',
        'shadowFinancing',
        'annualizedInstallment',
        'registrationFee',
        'exitValueNominal',
        'exitValueDiscounted',
        'dcf',
        'npv',
        'irr',
        'roic',
        'investedCapitalToday',
        'cashFlows',
        'discountRate'
      ];

      requiredFields.forEach(field => {
        expect(result).toHaveProperty(field);
      });
    });
  });

  describe('calculateMortgageContinuation', () => {
    test('integrates offplan with ready property calculator', () => {
      const offplanResults = {
        totalValue: new Decimal(850000),
        totalConstructionPercent: new Decimal(0.40),
        totalPaymentTillHandover: new Decimal(340000),
        registrationFee: new Decimal(34000),
        exitValueNominal: new Decimal(408000),
        constructionTenureYears: 3
      };

      const mortgageInputs = {
        size: 850,
        tenure: 25,
        discountRate: 4,
        rentalROI: 6,
        serviceChargesPerSqFt: 10,
        exitValue: 1020000,
        registrationFeePercent: 4
      };

      // Mock ready property calculator (returns Decimal objects)
      const mockReadyPropertyCalculator = (inputs) => ({
        dcf: new Decimal(410695),
        npv: new Decimal(147195),
        irr: new Decimal(0.0523),
        roic: new Decimal(0.5588),
        monthlyEMI: new Decimal(3361.13),
        netMonthlyCashFlow: new Decimal(180.54),
        dscr: new Decimal(1.05),
        annualRental: new Decimal(51000),
        annualServiceCharges: new Decimal(8500),
        netOperatingIncome: new Decimal(42500)
      });

      const result = calculateMortgageContinuation({
        offplanResults,
        mortgageInputs,
        readyPropertyCalculator: mockReadyPropertyCalculator
      });

      // Exact Decimal comparisons
      expect(result.totalInvestment.equals(new Decimal(374000))).toBe(true); // 340000 + 34000
      expect(result.yearsToFullExit).toBe(28); // 3 + 25 (integer)
      expect(result.constructionPhaseYears).toBe(3); // Integer
      expect(result.mortgagePhaseYears).toBe(25); // Integer
      expect(result.dcf.equals(new Decimal(410695))).toBe(true);
      expect(result.npv.equals(new Decimal(147195))).toBe(true);
    });

    test('uses offplan exit value if mortgage exit not provided', () => {
      const offplanResults = {
        totalValue: new Decimal(1000000),
        totalConstructionPercent: new Decimal(0.50),
        totalPaymentTillHandover: new Decimal(500000),
        registrationFee: new Decimal(40000),
        exitValueNominal: new Decimal(600000),
        constructionTenureYears: 4
      };

      const mortgageInputs = {
        size: 1000,
        tenure: 20,
        discountRate: 5,
        rentalROI: 7,
        serviceChargesPerSqFt: 12,
        exitValue: null, // Not provided
        registrationFeePercent: 4
      };

      const mockCalculator = (inputs) => {
        // Should use offplan exit value (converted to Number)
        expect(inputs.exitValue).toBe(600000);
        return {
          dcf: new Decimal(500000),
          npv: new Decimal(100000),
          irr: new Decimal(0.06),
          roic: new Decimal(0.30)
        };
      };

      const result = calculateMortgageContinuation({
        offplanResults,
        mortgageInputs,
        readyPropertyCalculator: mockCalculator
      });

      // Exact Decimal comparisons
      expect(result.totalInvestment.equals(new Decimal(540000))).toBe(true);
      expect(result.yearsToFullExit).toBe(24); // Integer
    });
  });
});
