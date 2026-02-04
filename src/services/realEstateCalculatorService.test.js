/**
 * Unit Tests for Real Estate Calculator Service (Decimal.js Version)
 *
 * Tests service layer orchestration, integration, and recommendation logic with Decimal precision.
 * All calculators now return Decimal objects, not Numbers.
 * Mock calculators updated to return Decimal objects for accurate testing.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { RealEstateCalculatorService, calculatorService } from './realEstateCalculatorService.js';
import Decimal from '../lib/decimalConfig.js';

describe('Real Estate Calculator Service', () => {
  describe('Service Initialization', () => {
    test('creates service instance with default calculators', () => {
      const service = new RealEstateCalculatorService();

      expect(service.readyPropertyCalculator).toBeDefined();
      expect(service.offplanCalculator).toBeDefined();
      expect(typeof service.calculateReadyProperty).toBe('function');
      expect(typeof service.calculateOffplan).toBe('function');
    });

    test('exports singleton instance', () => {
      expect(calculatorService).toBeInstanceOf(RealEstateCalculatorService);
    });
  });

  describe('Dependency Injection', () => {
    test('allows custom calculator injection', () => {
      const service = new RealEstateCalculatorService();
      const mockReadyProperty = vi.fn(() => ({ dcf: 100000, npv: 50000 }));
      const mockOffplan = vi.fn(() => ({ dcf: 80000, npv: 30000 }));

      service.setCalculators({
        readyProperty: mockReadyProperty,
        offplan: mockOffplan
      });

      service.calculateReadyProperty({ test: 'input' });
      service.calculateOffplan({ test: 'input' });

      expect(mockReadyProperty).toHaveBeenCalledWith({ test: 'input' });
      expect(mockOffplan).toHaveBeenCalledWith({ test: 'input' });
    });

    test('partially updates calculators', () => {
      const service = new RealEstateCalculatorService();
      const originalOffplan = service.offplanCalculator;
      const mockReadyProperty = vi.fn(() => ({ dcf: 100000 }));

      service.setCalculators({ readyProperty: mockReadyProperty });

      expect(service.readyPropertyCalculator).toBe(mockReadyProperty);
      expect(service.offplanCalculator).toBe(originalOffplan); // Unchanged
    });
  });

  describe('calculateReadyProperty', () => {
    test('delegates to ready property calculator', () => {
      const service = new RealEstateCalculatorService();
      const mockCalculator = vi.fn(() => ({
        dcf: 410695,
        npv: 147195,
        irr: 0.0523,
        roic: 0.5588
      }));

      service.setCalculators({ readyProperty: mockCalculator });

      const inputs = {
        propertySize: 850,
        totalValue: 850000,
        downPaymentPercent: 25
      };

      const result = service.calculateReadyProperty(inputs);

      expect(mockCalculator).toHaveBeenCalledWith(inputs);
      expect(result.dcf).toBe(410695);
      expect(result.npv).toBe(147195);
    });
  });

  describe('calculateOffplan', () => {
    test('delegates to offplan calculator', () => {
      const service = new RealEstateCalculatorService();
      const mockCalculator = vi.fn(() => ({
        dcf: 126827.78,
        npv: 41827.38,
        irr: 0.0260,
        roic: 0.4921
      }));

      service.setCalculators({ offplan: mockCalculator });

      const inputs = {
        size: 850,
        totalValue: 850000,
        downPaymentPercent: 0.10
      };

      const result = service.calculateOffplan(inputs);

      expect(mockCalculator).toHaveBeenCalledWith(inputs);
      expect(result.dcf).toBe(126827.78);
    });
  });

  describe('calculateOffplanWithMortgage', () => {
    test('calculates both exit scenarios', () => {
      const service = new RealEstateCalculatorService();

      // Mock calculators return Decimal objects
      const mockOffplan = vi.fn(() => ({
        totalValue: new Decimal(850000),
        totalConstructionPercent: new Decimal(0.40),
        totalPaymentTillHandover: new Decimal(340000),
        registrationFee: new Decimal(34000),
        exitValueNominal: new Decimal(408000),
        constructionTenureYears: 3,
        investedCapitalToday: new Decimal(85000),
        dcf: new Decimal(126827.78),
        npv: new Decimal(41827.38),
        irr: new Decimal(0.0260),
        roic: new Decimal(0.4921)
      }));

      const mockReadyProperty = vi.fn(() => ({
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
      }));

      service.setCalculators({
        offplan: mockOffplan,
        readyProperty: mockReadyProperty
      });

      const offplanInputs = {
        size: 850,
        totalValue: 850000,
        downPaymentPercent: 0.10
      };

      const mortgageInputs = {
        size: 850,
        tenure: 25,
        discountRate: 4
      };

      const result = service.calculateOffplanWithMortgage(offplanInputs, mortgageInputs);

      // Verify structure
      expect(result).toHaveProperty('offplanPhase');
      expect(result).toHaveProperty('exitAtHandover');
      expect(result).toHaveProperty('continueWithMortgage');
      expect(result).toHaveProperty('recommendation');

      // Verify exit at handover scenario (Decimal objects in results)
      expect(result.exitAtHandover.investedCapital.equals(new Decimal(85000))).toBe(true);
      expect(result.exitAtHandover.roic.toNumber()).toBeCloseTo(0.4921, 4);
      expect(result.exitAtHandover.timeToExit).toBe(3);

      // Verify continue with mortgage scenario (Decimal objects in results)
      expect(result.continueWithMortgage.investedCapital.equals(new Decimal(374000))).toBe(true);
      expect(result.continueWithMortgage.roic.toNumber()).toBeCloseTo(0.5588, 4);
      expect(result.continueWithMortgage.timeToExit).toBe(28);
    });

    test('passes correct inputs to ready property calculator', () => {
      const service = new RealEstateCalculatorService();

      // Mock calculators return Decimal objects
      const mockOffplan = vi.fn(() => ({
        totalValue: new Decimal(1000000),
        totalConstructionPercent: new Decimal(0.50),
        totalPaymentTillHandover: new Decimal(500000),
        registrationFee: new Decimal(40000),
        exitValueNominal: new Decimal(600000),
        constructionTenureYears: 4,
        investedCapitalToday: new Decimal(200000),
        dcf: new Decimal(300000),
        npv: new Decimal(100000),
        irr: new Decimal(0.05),
        roic: new Decimal(0.50)
      }));

      const mockReadyProperty = vi.fn(() => ({
        dcf: new Decimal(500000),
        npv: new Decimal(200000),
        irr: new Decimal(0.06),
        roic: new Decimal(0.40),
        netMonthlyCashFlow: new Decimal(500),
        dscr: new Decimal(1.2)
      }));

      service.setCalculators({
        offplan: mockOffplan,
        readyProperty: mockReadyProperty
      });

      const result = service.calculateOffplanWithMortgage(
        { size: 1000, totalValue: 1000000 },
        {
          size: 1000,
          tenure: 20,
          discountRate: 5,
          rentalROI: 7,
          serviceChargesPerSqFt: 10,
          exitValue: 1200000,
          registrationFeePercent: 4
        }
      );

      // Verify ready property was called with correct down payment %
      expect(mockReadyProperty).toHaveBeenCalled();
      const callArgs = mockReadyProperty.mock.calls[0][0];
      expect(callArgs.downPaymentPercent).toBe(50); // 0.50 * 100 (key assertion)
      expect(callArgs.propertySize).toBe(1000);
      expect(callArgs.tenure).toBe(20);
      expect(callArgs.discountRate).toBe(5);
      expect(callArgs.rentalROI).toBe(7);
      expect(callArgs.serviceChargesPerSqFt).toBe(10);
      expect(callArgs.exitValue).toBe(1200000);
      expect(callArgs.registrationFeePercent).toBe(4);
    });
  });

  describe('generateRecommendation', () => {
    let service;

    beforeEach(() => {
      service = new RealEstateCalculatorService();
    });

    test('recommends continue with strong positive indicators', () => {
      const exitScenario = {
        roic: 0.30,
        npv: 50000,
        timeToExit: 3
      };

      const continueScenario = {
        roic: 0.50, // 66% higher than exit
        npv: 150000,
        timeToExit: 25,
        netMonthlyCashFlow: 500, // Positive
        dscr: 1.5
      };

      const recommendation = service.generateRecommendation(exitScenario, continueScenario);

      expect(recommendation.action).toBe('continue');
      expect(recommendation.strength).toBe('strong');
      expect(recommendation.reasons.some(r => r.includes('Higher returns'))).toBe(true);
      expect(recommendation.reasons.some(r => r.includes('Positive cash flow'))).toBe(true);
      expect(recommendation.comparison.roicDifference).toBeCloseTo(20, 0);
      expect(recommendation.comparison.cashFlowStatus).toBe('positive');
    });

    test('recommends continue with moderate confidence', () => {
      const exitScenario = {
        roic: 0.40,
        npv: 50000,
        timeToExit: 3
      };

      const continueScenario = {
        roic: 0.45, // Only 12.5% higher
        npv: 80000,
        timeToExit: 20,
        netMonthlyCashFlow: -200, // Negative
        dscr: 0.95
      };

      const recommendation = service.generateRecommendation(exitScenario, continueScenario);

      expect(recommendation.action).toBe('continue');
      expect(recommendation.strength).toBe('moderate');
      expect(recommendation.reasons.some(r => r.includes('Better ROIC'))).toBe(true);
      expect(recommendation.reasons.some(r => r.includes('Negative cash flow'))).toBe(true);
    });

    test('recommends exit when returns are better', () => {
      const exitScenario = {
        roic: 0.50,
        npv: 100000,
        timeToExit: 3
      };

      const continueScenario = {
        roic: 0.40, // Lower than exit
        npv: 80000,
        timeToExit: 25,
        netMonthlyCashFlow: -500,
        dscr: 0.8
      };

      const recommendation = service.generateRecommendation(exitScenario, continueScenario);

      expect(recommendation.action).toBe('exit');
      expect(recommendation.strength).toBe('strong');
      expect(recommendation.reasons.some(r => r.includes('Better return per year'))).toBe(true);
      expect(recommendation.reasons.some(r => r.includes('Faster capital return'))).toBe(true);
      expect(recommendation.comparison.roicDifference).toBeLessThan(0);
    });

    test('calculates comparison metrics correctly', () => {
      const exitScenario = {
        roic: 0.30,
        npv: 50000,
        timeToExit: 3
      };

      const continueScenario = {
        roic: 0.45,
        npv: 120000,
        timeToExit: 20,
        netMonthlyCashFlow: 300,
        dscr: 1.2
      };

      const recommendation = service.generateRecommendation(exitScenario, continueScenario);

      expect(recommendation.comparison.roicDifference).toBeCloseTo(15, 0); // 45% - 30%
      expect(recommendation.comparison.npvDifference).toBe(70000); // 120000 - 50000
      expect(recommendation.comparison.timeDifference).toBe(17); // 20 - 3
      expect(recommendation.comparison.cashFlowStatus).toBe('positive');
      expect(recommendation.comparison.dscr).toBe(1.2);
    });

    test('handles edge case with zero DSCR', () => {
      const exitScenario = {
        roic: 0.30,
        npv: 50000,
        timeToExit: 3
      };

      const continueScenario = {
        roic: 0.50,
        npv: 150000,
        timeToExit: 25,
        netMonthlyCashFlow: 500,
        dscr: 0
      };

      const recommendation = service.generateRecommendation(exitScenario, continueScenario);

      expect(recommendation.comparison.dscr).toBe(0);
      expect(recommendation.action).toBe('continue'); // Still recommends due to good ROIC
    });
  });
});
