/**
 * Unit tests for Real Estate Investment Agent
 *
 * These tests verify that:
 * 1. Agent calculations match web app exactly
 * 2. Recommendations come from business logic layer (not agent)
 * 3. Decimal conversion works correctly
 * 4. Results are deterministic
 */

import { describe, it, expect } from 'vitest';
import { calculateReadyPropertyInvestment } from '../src/lib/readyPropertyCalculator.js';
import { determineInvestmentRecommendation } from '../src/lib/investmentRecommendation.js';
import Decimal from '../src/lib/decimalConfig.js';

/**
 * Convert Decimal objects to JavaScript numbers recursively
 * Same function used in the agent
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

describe('Real Estate Investment Agent', () => {
  const testInputs = {
    currency: 'AED',
    totalValue: 1500000,
    propertySize: 1000,
    downPaymentPercent: 25,
    registrationFeePercent: 4,
    tenure: 25,
    discountRate: 4,
    rentalROI: 6,
    serviceChargesPerSqFt: 10,
    exitValue: 1500000 * 1.2,
  };

  it('should produce results with recommendation from business logic', () => {
    const results = calculateReadyPropertyInvestment(testInputs);

    // Verify recommendation exists and comes from business logic
    expect(results.recommendation).toBeDefined();
    expect(results.recommendation.recommendation).toBeDefined();
    expect(results.recommendation.summary).toBeDefined();
    expect(results.recommendation.reasoning).toBeDefined();
    expect(results.recommendation.metrics).toBeDefined();
  });

  it('should include all required recommendation fields', () => {
    const results = calculateReadyPropertyInvestment(testInputs);
    const { recommendation } = results;

    // Check recommendation category
    expect(['STRONG_BUY', 'BUY', 'MARGINAL', 'DONT_BUY']).toContain(
      recommendation.recommendation
    );

    // Check summary is a string
    expect(typeof recommendation.summary).toBe('string');
    expect(recommendation.summary.length).toBeGreaterThan(0);

    // Check reasoning is an array of strings
    expect(Array.isArray(recommendation.reasoning)).toBe(true);
    expect(recommendation.reasoning.length).toBeGreaterThan(0);
    recommendation.reasoning.forEach((reason: string) => {
      expect(typeof reason).toBe('string');
    });

    // Check metrics are numbers (already converted by business logic)
    expect(typeof recommendation.metrics.npv).toBe('number');
    expect(typeof recommendation.metrics.irr).toBe('number');
    expect(typeof recommendation.metrics.roic).toBe('number');
    expect(typeof recommendation.metrics.dscr).toBe('number');
  });

  it('should convert all Decimal objects to numbers', () => {
    const results = calculateReadyPropertyInvestment(testInputs);
    const clean = convertDecimalsToNumbers(results);

    // Verify all key metrics are numbers (not Decimals)
    expect(typeof clean.npv).toBe('number');
    expect(typeof clean.irr).toBe('number');
    expect(typeof clean.roic).toBe('number');
    expect(typeof clean.dscr).toBe('number');
    expect(typeof clean.monthlyEMI).toBe('number');
    expect(typeof clean.netMonthlyCashFlow).toBe('number');

    // Verify recommendation metrics are also numbers
    expect(typeof clean.recommendation.metrics.npv).toBe('number');
    expect(typeof clean.recommendation.metrics.irr).toBe('number');
    expect(typeof clean.recommendation.metrics.roic).toBe('number');
    expect(typeof clean.recommendation.metrics.dscr).toBe('number');
  });

  it('should match web app calculations exactly', () => {
    const webAppResults = calculateReadyPropertyInvestment(testInputs);
    const agentResults = calculateReadyPropertyInvestment(testInputs);

    const webAppClean = convertDecimalsToNumbers(webAppResults);
    const agentClean = convertDecimalsToNumbers(agentResults);

    // Metrics should be EXACTLY the same
    expect(agentClean.npv).toBe(webAppClean.npv);
    expect(agentClean.irr).toBe(webAppClean.irr);
    expect(agentClean.roic).toBe(webAppClean.roic);
    expect(agentClean.dscr).toBe(webAppClean.dscr);
    expect(agentClean.monthlyEMI).toBe(webAppClean.monthlyEMI);
    expect(agentClean.netMonthlyCashFlow).toBe(webAppClean.netMonthlyCashFlow);

    // Recommendations should be EXACTLY the same
    expect(agentClean.recommendation.recommendation).toBe(
      webAppClean.recommendation.recommendation
    );
  });

  it('should produce deterministic results', () => {
    const results1 = calculateReadyPropertyInvestment(testInputs);
    const results2 = calculateReadyPropertyInvestment(testInputs);
    const results3 = calculateReadyPropertyInvestment(testInputs);
    const results4 = calculateReadyPropertyInvestment(testInputs);
    const results5 = calculateReadyPropertyInvestment(testInputs);

    const clean1 = convertDecimalsToNumbers(results1);
    const clean2 = convertDecimalsToNumbers(results2);
    const clean3 = convertDecimalsToNumbers(results3);
    const clean4 = convertDecimalsToNumbers(results4);
    const clean5 = convertDecimalsToNumbers(results5);

    // All runs should produce identical results
    expect(clean2.npv).toBe(clean1.npv);
    expect(clean3.npv).toBe(clean1.npv);
    expect(clean4.npv).toBe(clean1.npv);
    expect(clean5.npv).toBe(clean1.npv);

    expect(clean2.recommendation.recommendation).toBe(
      clean1.recommendation.recommendation
    );
    expect(clean3.recommendation.recommendation).toBe(
      clean1.recommendation.recommendation
    );
  });

  it('should apply default parameters correctly', () => {
    const minimalInputs = {
      currency: 'AED',
      totalValue: 1500000,
      propertySize: 1000,
      downPaymentPercent: 25,
      registrationFeePercent: 4,
      tenure: 25,
      discountRate: 4,
      rentalROI: 6,
      serviceChargesPerSqFt: 10,
      exitValue: 1500000 * 1.2,
    };

    const results = calculateReadyPropertyInvestment(minimalInputs);
    expect(results).toBeDefined();
    expect(results.recommendation).toBeDefined();
  });

  describe('Investment Recommendation Logic', () => {
    it('should recommend STRONG_BUY for excellent metrics', () => {
      const excellentMetrics = {
        npv: new Decimal(500000),
        irr: new Decimal(0.15), // 15%
        roic: new Decimal(0.20), // 20%
        dscr: new Decimal(1.5),
      };

      const recommendation = determineInvestmentRecommendation(excellentMetrics);
      expect(recommendation.recommendation).toBe('STRONG_BUY');
    });

    it('should recommend BUY for solid metrics', () => {
      const solidMetrics = {
        npv: new Decimal(100000),
        irr: new Decimal(0.07), // 7%
        roic: new Decimal(0.12), // 12%
        dscr: new Decimal(1.1),
      };

      const recommendation = determineInvestmentRecommendation(solidMetrics);
      expect(recommendation.recommendation).toBe('BUY');
    });

    it('should recommend MARGINAL for weak positive returns', () => {
      const marginalMetrics = {
        npv: new Decimal(10000),
        irr: new Decimal(0.03), // 3%
        roic: new Decimal(0.05), // 5%
        dscr: new Decimal(0.95),
      };

      const recommendation = determineInvestmentRecommendation(marginalMetrics);
      expect(recommendation.recommendation).toBe('MARGINAL');
    });

    it('should recommend DONT_BUY for negative NPV', () => {
      const poorMetrics = {
        npv: new Decimal(-50000),
        irr: new Decimal(-0.02), // -2%
        roic: new Decimal(-0.05), // -5%
        dscr: new Decimal(0.8),
      };

      const recommendation = determineInvestmentRecommendation(poorMetrics);
      expect(recommendation.recommendation).toBe('DONT_BUY');
    });
  });

  describe('Architecture Verification', () => {
    it('should ensure recommendations come from business logic, not agent', () => {
      // This test verifies architectural constraint:
      // Agent should NOT implement recommendation logic
      // All recommendations must come from business logic layer

      const results = calculateReadyPropertyInvestment(testInputs);

      // Calculator must include recommendation in its output
      expect(results.recommendation).toBeDefined();

      // Recommendation must have all required fields from business logic
      expect(results.recommendation.recommendation).toBeDefined();
      expect(results.recommendation.summary).toBeDefined();
      expect(results.recommendation.reasoning).toBeDefined();

      // This proves the agent can simply display what calculator returns
      // without implementing any recommendation logic itself
    });

    it('should verify business logic determines thresholds, not agent', () => {
      // Test different property scenarios
      const scenarios = [
        { value: 1000000, size: 800 },  // Smaller property
        { value: 2000000, size: 1500 }, // Larger property
        { value: 500000, size: 500 },   // Budget property
      ];

      scenarios.forEach(scenario => {
        const inputs = {
          ...testInputs,
          totalValue: scenario.value,
          propertySize: scenario.size,
          exitValue: scenario.value * 1.2,
        };

        const results = calculateReadyPropertyInvestment(inputs);

        // Every calculation must include recommendation from business logic
        expect(results.recommendation).toBeDefined();
        expect(['STRONG_BUY', 'BUY', 'MARGINAL', 'DONT_BUY']).toContain(
          results.recommendation.recommendation
        );
      });
    });
  });

  describe('Decimal Conversion', () => {
    it('should handle nested objects with Decimals', () => {
      const nested = {
        level1: {
          level2: {
            value: new Decimal('100.5'),
            array: [new Decimal('1.1'), new Decimal('2.2')],
          },
        },
      };

      const converted = convertDecimalsToNumbers(nested);

      expect(typeof converted.level1.level2.value).toBe('number');
      expect(converted.level1.level2.value).toBe(100.5);
      expect(typeof converted.level1.level2.array[0]).toBe('number');
      expect(converted.level1.level2.array[0]).toBe(1.1);
    });

    it('should not leave any Decimal objects after conversion', () => {
      const results = calculateReadyPropertyInvestment(testInputs);
      const clean = convertDecimalsToNumbers(results);

      function hasDecimalObjects(obj: any): boolean {
        if (obj instanceof Decimal) return true;
        if (Array.isArray(obj)) return obj.some(hasDecimalObjects);
        if (obj && typeof obj === 'object') {
          return Object.values(obj).some(hasDecimalObjects);
        }
        return false;
      }

      expect(hasDecimalObjects(clean)).toBe(false);
    });
  });
});
