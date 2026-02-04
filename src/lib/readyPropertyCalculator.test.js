/**
 * Unit Tests for Ready Property Calculator (Decimal.js Version)
 *
 * Tests all business logic for ready property investment calculations with exact precision.
 * All functions now return Decimal objects, not Numbers.
 * Tests use exact Decimal comparisons instead of floating-point tolerances.
 */

import { describe, test, expect } from 'vitest';
import {
  calculateRentalMetrics,
  calculateInvestmentCosts,
  calculateMortgageMetrics,
  calculateDCFMetrics,
  generateCashFlows,
  calculateReadyPropertyInvestment
} from './readyPropertyCalculator.js';
import Decimal from './decimalConfig.js';

describe('Ready Property Calculator', () => {
  describe('calculateRentalMetrics', () => {
    test('calculates rental metrics correctly', () => {
      const params = {
        totalValue: 850000,
        propertySize: 850,
        rentalROI: 0.06,
        serviceChargesPerSqFt: 10
      };

      const result = calculateRentalMetrics(params);

      // Exact Decimal comparisons
      expect(result.annualRental.equals(new Decimal(51000))).toBe(true); // 850000 * 0.06
      expect(result.annualServiceCharges.equals(new Decimal(8500))).toBe(true); // 850 * 10
      expect(result.netOperatingIncome.equals(new Decimal(42500))).toBe(true); // 51000 - 8500
      expect(result.monthlyRental.toFixed(4)).toBe('4250.0000'); // 51000 / 12
      expect(result.monthlyServiceCharges.toFixed(4)).toBe('708.3333'); // 8500 / 12
      expect(result.netMonthlyIncome.toFixed(4)).toBe('3541.6667'); // 42500 / 12
    });

    test('handles zero service charges', () => {
      const params = {
        totalValue: 500000,
        propertySize: 1000,
        rentalROI: 0.05,
        serviceChargesPerSqFt: 0
      };

      const result = calculateRentalMetrics(params);

      // Exact Decimal comparisons
      expect(result.annualRental.equals(new Decimal(25000))).toBe(true);
      expect(result.annualServiceCharges.equals(new Decimal(0))).toBe(true);
      expect(result.netOperatingIncome.equals(new Decimal(25000))).toBe(true);
    });
  });

  describe('calculateInvestmentCosts', () => {
    test('calculates investment costs correctly', () => {
      const params = {
        totalValue: 850000,
        downPaymentPercent: 0.25,
        registrationFeePercent: 0.04,
        agentCommissionPercent: 0.02
      };

      const result = calculateInvestmentCosts(params);

      // Exact Decimal comparisons
      expect(result.downPaymentAmt.equals(new Decimal(212500))).toBe(true); // 850000 * 0.25
      expect(result.registrationFee.equals(new Decimal(34000))).toBe(true); // 850000 * 0.04
      expect(result.agentFee.equals(new Decimal(17000))).toBe(true); // 850000 * 0.02
      expect(result.investedCapital.equals(new Decimal(263500))).toBe(true); // sum of above
      expect(result.financingAmount.equals(new Decimal(637500))).toBe(true); // 850000 * 0.75
    });

    test('uses default agent commission if not provided', () => {
      const params = {
        totalValue: 1000000,
        downPaymentPercent: 0.30,
        registrationFeePercent: 0.04
      };

      const result = calculateInvestmentCosts(params);

      // Exact Decimal comparison
      expect(result.agentFee.equals(new Decimal(20000))).toBe(true); // 1000000 * 0.02 (default)
    });

    test('handles 100% down payment', () => {
      const params = {
        totalValue: 500000,
        downPaymentPercent: 1.0,
        registrationFeePercent: 0.04,
        agentCommissionPercent: 0.02
      };

      const result = calculateInvestmentCosts(params);

      // Exact Decimal comparisons
      expect(result.downPaymentAmt.equals(new Decimal(500000))).toBe(true);
      expect(result.financingAmount.equals(new Decimal(0))).toBe(true); // No financing needed
    });
  });

  describe('calculateMortgageMetrics', () => {
    test('calculates mortgage metrics correctly', () => {
      const params = {
        financingAmount: 637500,
        discountRate: 0.04,
        tenure: 25
      };

      const result = calculateMortgageMetrics(params);

      // Exact Decimal assertions (TRUE precise values from Decimal calculations)
      expect(result.monthlyEMI.toFixed(4)).toBe('3364.9599');
      expect(result.annualDebtService.toFixed(4)).toBe('40379.5183');
      expect(result.totalMortgagePayment.toFixed(2)).toBe('1009487.96');
      expect(result.totalInterestPaid.toFixed(2)).toBe('371987.96');
    });

    test('handles zero interest rate', () => {
      const params = {
        financingAmount: 600000,
        discountRate: 0,
        tenure: 20
      };

      const result = calculateMortgageMetrics(params);

      // Exact Decimal assertions
      expect(result.monthlyEMI.toFixed(4)).toBe('2500.0000'); // 600000 / (20*12)
      expect(result.totalInterestPaid.equals(new Decimal(0))).toBe(true);
    });
  });

  describe('calculateDCFMetrics', () => {
    test('calculates DCF metrics correctly', () => {
      const params = {
        netAnnualCashFlow: 2166.44,
        exitValue: 1020000,
        discountRate: 0.04,
        investedCapital: 263500,
        tenure: 25,
        npvYears: 20
      };

      const result = calculateDCFMetrics(params);

      // Exact Decimal assertions (TRUE precise values from Decimal calculations)
      expect(result.terminalValueFV.equals(new Decimal(1020000))).toBe(true);
      expect(result.terminalValuePV.toFixed(2)).toBe('382619.14');
      expect(result.dcf.toFixed(2)).toBe('412061.76');
      expect(result.npv.toFixed(2)).toBe('148561.76');
      expect(result.irr.greaterThan(0)).toBe(true);
      expect(result.roic.greaterThan(0)).toBe(true);
    });

    test('handles negative cash flows', () => {
      const params = {
        netAnnualCashFlow: -5000,
        exitValue: 500000,
        discountRate: 0.06,
        investedCapital: 200000,
        tenure: 10,
        npvYears: 10
      };

      const result = calculateDCFMetrics(params);

      // Decimal comparison for lessThan
      expect(result.dcf.lessThan(result.terminalValuePV)).toBe(true); // DCF reduced by negative flows
      // Note: NPV can still be positive if exit value is high enough to offset negative cash flows
      expect(result.npv).toBeDefined(); // Just verify it calculates
      expect(result.npv instanceof Decimal).toBe(true);
    });
  });

  describe('generateCashFlows', () => {
    test('generates cash flow array correctly', () => {
      const params = {
        investedCapital: 263500,
        netAnnualCashFlow: 2166.44,
        exitValue: 1020000,
        tenure: 25
      };

      const result = generateCashFlows(params);

      // Cash flows are returned as Numbers for IRR/NPV compatibility
      expect(result.length).toBe(26); // Year 0 + 25 years
      expect(result[0]).toBe(-263500); // Initial investment
      expect(result[1]).toBe(2166.44); // Year 1 cash flow
      expect(result[24]).toBe(2166.44); // Year 24 cash flow
      expect(result[25]).toBe(1022166.44); // Year 25: cash flow + exit value
    });

    test('handles single year investment', () => {
      const params = {
        investedCapital: 100000,
        netAnnualCashFlow: 5000,
        exitValue: 150000,
        tenure: 1
      };

      const result = generateCashFlows(params);

      // Cash flows are returned as Numbers for IRR/NPV compatibility
      expect(result.length).toBe(2);
      expect(result[0]).toBe(-100000);
      expect(result[1]).toBe(155000); // 5000 + 150000
    });
  });

  describe('calculateReadyPropertyInvestment - Integration', () => {
    test('calculates complete investment analysis', () => {
      const inputs = {
        propertySize: 850,
        totalValue: 850000,
        downPaymentPercent: 25,
        registrationFeePercent: 4,
        tenure: 25,
        discountRate: 4,
        rentalROI: 6,
        serviceChargesPerSqFt: 10,
        exitValue: 1020000
      };

      const result = calculateReadyPropertyInvestment(inputs);

      // Verify all key metrics are present with Decimal comparisons
      expect(result.pricePerSqFt.equals(new Decimal(1000))).toBe(true);
      expect(result.investedCapital.equals(new Decimal(263500))).toBe(true);
      expect(result.annualRental.equals(new Decimal(51000))).toBe(true);
      expect(result.monthlyEMI.greaterThan(0)).toBe(true);
      expect(result.dcf.greaterThan(0)).toBe(true);
      expect(result.npv.greaterThan(0)).toBe(true);
      expect(result.irr.greaterThan(0)).toBe(true);
      expect(result.roic.greaterThan(0)).toBe(true);
      expect(result.dscr.greaterThan(1)).toBe(true); // Rental covers debt
      expect(result.cashFlows).toHaveLength(26);
    });

    test('handles low rental ROI with negative cash flow', () => {
      const inputs = {
        propertySize: 1000,
        totalValue: 1000000,
        downPaymentPercent: 20,
        registrationFeePercent: 4,
        tenure: 20,
        discountRate: 5,
        rentalROI: 3, // Low rental ROI
        serviceChargesPerSqFt: 15,
        exitValue: 1200000
      };

      const result = calculateReadyPropertyInvestment(inputs);

      // Decimal comparisons for negative scenarios
      expect(result.netAnnualCashFlow.lessThan(0)).toBe(true); // Negative cash flow
      expect(result.dscr.lessThan(1)).toBe(true); // DSCR < 1 indicates stress
      // With very low rental ROI and high negative cash flows, DCF can be negative
      expect(result.dcf).toBeDefined(); // Just verify it calculates
      expect(result.dcf instanceof Decimal).toBe(true);
    });

    test('handles high down payment scenario', () => {
      const inputs = {
        propertySize: 500,
        totalValue: 500000,
        downPaymentPercent: 80, // Very high down payment
        registrationFeePercent: 4,
        tenure: 10,
        discountRate: 4,
        rentalROI: 7,
        serviceChargesPerSqFt: 12,
        exitValue: 600000
      };

      const result = calculateReadyPropertyInvestment(inputs);

      // Decimal comparisons
      expect(result.financingAmount.equals(new Decimal(100000))).toBe(true); // Only 20% financed
      expect(result.monthlyEMI.lessThan(1050)).toBe(true); // Low EMI
      expect(result.netAnnualCashFlow.greaterThan(0)).toBe(true); // Positive cash flow
      expect(result.dscr.greaterThan(2)).toBe(true); // Strong debt coverage
    });

    test('returns all required fields', () => {
      const inputs = {
        propertySize: 850,
        totalValue: 850000,
        downPaymentPercent: 25,
        registrationFeePercent: 4,
        tenure: 25,
        discountRate: 4,
        rentalROI: 6,
        serviceChargesPerSqFt: 10,
        exitValue: 1020000
      };

      const result = calculateReadyPropertyInvestment(inputs);

      // Check all expected fields exist
      const requiredFields = [
        'pricePerSqFt',
        'downPaymentAmt',
        'registrationFee',
        'agentFee',
        'investedCapital',
        'financingAmount',
        'annualRental',
        'annualServiceCharges',
        'netOperatingIncome',
        'monthlyRental',
        'monthlyServiceCharges',
        'netMonthlyIncome',
        'monthlyEMI',
        'annualDebtService',
        'totalMortgagePayment',
        'totalInterestPaid',
        'netAnnualCashFlow',
        'netMonthlyCashFlow',
        'terminalValueFV',
        'terminalValuePV',
        'dcf',
        'npv',
        'irr',
        'roic',
        'dscr',
        'cashFlows',
        'exitYear',
        'discountRate'
      ];

      requiredFields.forEach(field => {
        expect(result).toHaveProperty(field);
      });
    });
  });
});
