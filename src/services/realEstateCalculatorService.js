/**
 * Real Estate Calculator Service
 *
 * Service layer that provides a unified interface for all calculator types.
 * Follows SOLID principles:
 * - Single Responsibility: Coordinate calculator operations
 * - Open/Closed: Open for extension (new calculator types), closed for modification
 * - Dependency Inversion: Depends on abstractions (calculator interfaces), not concrete implementations
 *
 * This service acts as a facade and provides dependency injection for calculators.
 */

import { calculateReadyPropertyInvestment } from '../lib/readyPropertyCalculator.js';
import {
  calculateOffplanInvestment,
  calculateMortgageContinuation
} from '../lib/offplanCalculatorRefactored.js';
import Decimal from '../lib/decimalConfig.js';

/**
 * Calculator Service Class
 * Provides a clean API for all real estate calculations
 */
class RealEstateCalculatorService {
  constructor() {
    // Dependencies are injected, making this testable
    this.readyPropertyCalculator = calculateReadyPropertyInvestment;
    this.offplanCalculator = calculateOffplanInvestment;
  }

  /**
   * Calculate ready property investment
   * @param {Object} inputs - Investment parameters
   * @returns {Object} Calculation results
   */
  calculateReadyProperty(inputs) {
    return this.readyPropertyCalculator(inputs);
  }

  /**
   * Calculate off-plan investment
   * @param {Object} inputs - Investment parameters
   * @returns {Object} Calculation results
   */
  calculateOffplan(inputs) {
    return this.offplanCalculator(inputs);
  }

  /**
   * Calculate off-plan with mortgage continuation
   * @param {Object} offplanInputs - Off-plan investment parameters
   * @param {Object} mortgageInputs - Mortgage continuation parameters
   * @returns {Object} Complete analysis with both scenarios
   */
  calculateOffplanWithMortgage(offplanInputs, mortgageInputs) {
    // Calculate off-plan phase
    const offplanResults = this.offplanCalculator(offplanInputs);

    // Calculate mortgage continuation using ready property calculator
    const mortgageResults = calculateMortgageContinuation({
      offplanResults,
      mortgageInputs,
      readyPropertyCalculator: this.readyPropertyCalculator
    });

    // Calculate exit at handover scenario
    const exitAtHandover = {
      investedCapital: offplanResults.investedCapitalToday,
      profit: offplanResults.dcf - offplanResults.investedCapitalToday,
      roic: offplanResults.roic,
      npv: offplanResults.npv,
      irr: offplanResults.irr,
      dcf: offplanResults.dcf,
      timeToExit: offplanResults.constructionTenureYears
    };

    // Calculate continuation scenario
    const continueWithMortgage = {
      investedCapital: mortgageResults.totalInvestment,
      roic: mortgageResults.roic,
      npv: mortgageResults.npv,
      irr: mortgageResults.irr,
      dcf: mortgageResults.dcf,
      timeToExit: mortgageResults.yearsToFullExit,
      monthlyEMI: mortgageResults.monthlyEMI,
      netMonthlyCashFlow: mortgageResults.netMonthlyCashFlow,
      dscr: mortgageResults.dscr,
      annualRental: mortgageResults.annualRental,
      annualServiceCharges: mortgageResults.annualServiceCharges,
      netOperatingIncome: mortgageResults.netOperatingIncome
    };

    return {
      offplanPhase: offplanResults,
      exitAtHandover,
      continueWithMortgage,
      recommendation: this.generateRecommendation(exitAtHandover, continueWithMortgage)
    };
  }

  /**
   * Generate investment recommendation
   * Handles Decimal values from calculators
   * @private
   * @param {Object} exitScenario - Exit at handover scenario
   * @param {Object} continueScenario - Continue with mortgage scenario
   * @returns {Object} Recommendation
   */
  generateRecommendation(exitScenario, continueScenario) {
    // Convert Decimal values to Numbers for comparisons
    const continueRoic = new Decimal(continueScenario.roic);
    const exitRoic = new Decimal(exitScenario.roic);
    const continueNpv = new Decimal(continueScenario.npv);
    const exitNpv = new Decimal(exitScenario.npv);
    const netMonthlyCashFlow = new Decimal(continueScenario.netMonthlyCashFlow);
    const dscrDecimal = continueScenario.dscr ? new Decimal(continueScenario.dscr) : new Decimal(0);

    const roicDifference = continueRoic.times(100).minus(exitRoic.times(100)).toNumber();
    const npvDifference = continueNpv.minus(exitNpv).toNumber();
    const isPositiveCashFlow = netMonthlyCashFlow.greaterThanOrEqualTo(0);

    // CRITICAL: DSCR threshold with Decimal precision (prevents 1.1999999 vs 1.2 issues)
    const dscrThreshold = new Decimal('1.2');

    let recommendation = 'exit'; // default
    let strength = 'moderate';
    let reasons = [];

    // Strong recommendation to continue
    if (continueRoic.greaterThan(exitRoic.times(1.3)) &&
        isPositiveCashFlow &&
        dscrDecimal.greaterThanOrEqualTo(dscrThreshold)) {
      recommendation = 'continue';
      strength = 'strong';
      reasons = [
        `Higher returns: ${continueRoic.times(100).toFixed(1)}% vs ${exitRoic.times(100).toFixed(1)}%`,
        'Positive cash flow covers all expenses',
        `Healthy DSCR of ${dscrDecimal.toFixed(2)}x`,
        `Creates ${npvDifference > 0 ? 'more' : ''} value`
      ];
    }
    // Moderate recommendation to continue
    else if (continueRoic.greaterThan(exitRoic) && npvDifference > 0) {
      recommendation = 'continue';
      strength = 'moderate';
      reasons = [
        `Better ROIC: ${continueRoic.times(100).toFixed(1)}% vs ${exitRoic.times(100).toFixed(1)}%`,
        isPositiveCashFlow ? 'Positive monthly cash flow' : 'Negative cash flow requires funding',
        `Longer time commitment: ${continueScenario.timeToExit} years vs ${exitScenario.timeToExit} years`
      ];
    }
    // Recommend exit
    else {
      recommendation = 'exit';
      strength = 'strong';
      reasons = [
        `Better return per year: ${exitRoic.times(100).toFixed(1)}% in ${exitScenario.timeToExit} years`,
        `Faster capital return: ${exitScenario.timeToExit} years vs ${continueScenario.timeToExit} years`,
        roicDifference < 0 ? `${Math.abs(roicDifference).toFixed(1)}% lower returns don't justify extra time` : ''
      ].filter(Boolean);
    }

    return {
      action: recommendation, // 'exit' | 'continue'
      strength, // 'strong' | 'moderate'
      reasons,
      comparison: {
        roicDifference,
        npvDifference,
        timeDifference: continueScenario.timeToExit - exitScenario.timeToExit,
        cashFlowStatus: isPositiveCashFlow ? 'positive' : 'negative',
        dscr: dscrDecimal.toNumber()
      }
    };
  }

  /**
   * Set custom calculator implementations (for testing or alternative implementations)
   * Dependency Injection for better testability
   *
   * @param {Object} calculators - Custom calculator implementations
   */
  setCalculators(calculators) {
    if (calculators.readyProperty) {
      this.readyPropertyCalculator = calculators.readyProperty;
    }
    if (calculators.offplan) {
      this.offplanCalculator = calculators.offplan;
    }
  }
}

// Export singleton instance (can be replaced with factory pattern if needed)
export const calculatorService = new RealEstateCalculatorService();

// Export class for testing and custom instantiation
export { RealEstateCalculatorService };

// Export for backward compatibility with window global
export function createGlobalCalculator() {
  if (typeof window !== 'undefined') {
    window.RealEstateCalculator = {
      calculateInvestment: (inputs) => calculatorService.calculateReadyProperty(inputs),
      calculateOffplan: (inputs) => calculatorService.calculateOffplan(inputs),
      calculateOffplanWithMortgage: (offplanInputs, mortgageInputs) =>
        calculatorService.calculateOffplanWithMortgage(offplanInputs, mortgageInputs)
    };
  }
}
