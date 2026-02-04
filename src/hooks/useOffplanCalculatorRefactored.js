/**
 * Off-Plan Calculator Hook - Refactored
 *
 * React hook for off-plan calculator with clean separation of concerns.
 *
 * Single Responsibility: State management and UI orchestration only
 * No business logic - all calculations delegated to service layer
 *
 * This hook demonstrates Dependency Inversion - it depends on the
 * calculator service abstraction, not concrete implementations.
 */

import { useState, useCallback } from 'react';
import { calculatorService } from '../services/realEstateCalculatorService.js';

/**
 * Custom hook for off-plan investment calculations
 *
 * @param {Object} initialInputs - Initial input values (optional)
 * @returns {Object} Hook state and methods
 */
export function useOffplanCalculatorRefactored(initialInputs = {}) {
  // Default inputs
  const defaultInputs = {
    size: 850,
    totalValue: 850000,
    downPaymentPercent: 10,
    constructionTenureYears: 3,
    paymentFrequencyMonths: 6,
    installmentPercent: 5,
    discountRate: 4,
    futurePricePerSqft: 1200,
    registrationFeePercent: 4,
    currency: 'AED',

    // Mortgage continuation inputs
    mortgageTenure: 25,
    rentalROI: 6,
    serviceChargesPerSqFt: 10,
    exitValue: 1020000,

    ...initialInputs
  };

  // State management
  const [inputs, setInputs] = useState(defaultInputs);
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Calculate investment with both exit scenarios
   * Pure UI orchestration - no business logic
   */
  const calculate = useCallback((newInputs = inputs) => {
    setIsCalculating(true);
    setError(null);

    try {
      // Prepare off-plan inputs (convert percentages to decimals)
      const offplanInputs = {
        size: newInputs.size,
        totalValue: newInputs.totalValue,
        downPaymentPercent: newInputs.downPaymentPercent / 100,
        constructionTenureYears: newInputs.constructionTenureYears,
        paymentFrequencyMonths: newInputs.paymentFrequencyMonths,
        installmentPercent: newInputs.installmentPercent / 100,
        discountRate: newInputs.discountRate / 100,
        futurePricePerSqft: newInputs.futurePricePerSqft,
        registrationFeePercent: newInputs.registrationFeePercent / 100
      };

      // Prepare mortgage continuation inputs
      const mortgageInputs = {
        size: newInputs.size,
        tenure: newInputs.mortgageTenure,
        discountRate: newInputs.discountRate,
        rentalROI: newInputs.rentalROI,
        serviceChargesPerSqFt: newInputs.serviceChargesPerSqFt,
        exitValue: newInputs.exitValue,
        registrationFeePercent: newInputs.registrationFeePercent
      };

      // Delegate all calculations to service layer
      const calculationResults = calculatorService.calculateOffplanWithMortgage(
        offplanInputs,
        mortgageInputs
      );

      // Transform results for UI consumption
      const transformedResults = {
        // Off-plan phase
        ...calculationResults.offplanPhase,

        // Store input percentages for display
        downPaymentPercentDisplay: newInputs.downPaymentPercent,
        installmentPercentDisplay: newInputs.installmentPercent,
        discountRateDisplay: newInputs.discountRate,

        // Exit at handover scenario
        profitAtHandover: calculationResults.exitAtHandover.profit,
        roiAtHandover: calculationResults.exitAtHandover.roic * 100,

        // Continue with mortgage scenario
        monthlyEMI: calculationResults.continueWithMortgage.monthlyEMI,
        monthlyRentalIncome: calculationResults.continueWithMortgage.annualRental / 12,
        monthlyServiceCharges: calculationResults.continueWithMortgage.annualServiceCharges / 12,
        netMonthlyRentalIncome: calculationResults.continueWithMortgage.netOperatingIncome / 12,
        netMonthlyCashFlow: calculationResults.continueWithMortgage.netMonthlyCashFlow,
        dscr: calculationResults.continueWithMortgage.dscr,
        mortgageNPV: calculationResults.continueWithMortgage.npv,
        mortgageIRR: calculationResults.continueWithMortgage.irr,
        mortgageDCF: calculationResults.continueWithMortgage.dcf,
        mortgageROIC: calculationResults.continueWithMortgage.roic,
        totalInvestmentWithMortgage: calculationResults.continueWithMortgage.investedCapital,
        remainingAmount: calculationResults.offplanPhase.totalValue -
                         calculationResults.offplanPhase.totalPaymentTillHandover,
        yearsToFullExit: calculationResults.continueWithMortgage.timeToExit,
        exitValueForMortgage: newInputs.exitValue || calculationResults.offplanPhase.exitValueNominal,

        // Recommendation
        recommendation: calculationResults.recommendation,

        // Currency for formatting
        currency: newInputs.currency
      };

      setResults(transformedResults);
      setIsCalculating(false);
    } catch (err) {
      console.error('Calculation error:', err);
      setError(err.message || 'An error occurred during calculation');
      setIsCalculating(false);
    }
  }, [inputs]);

  /**
   * Update a single input field and recalculate
   *
   * @param {string} field - Input field name
   * @param {*} value - New value
   */
  const updateInput = useCallback((field, value) => {
    const newInputs = {
      ...inputs,
      [field]: value
    };
    setInputs(newInputs);
    calculate(newInputs);
  }, [inputs, calculate]);

  /**
   * Update multiple inputs at once
   *
   * @param {Object} updates - Object with field-value pairs
   */
  const updateInputs = useCallback((updates) => {
    const newInputs = {
      ...inputs,
      ...updates
    };
    setInputs(newInputs);
    calculate(newInputs);
  }, [inputs, calculate]);

  /**
   * Reset to default inputs
   */
  const reset = useCallback(() => {
    setInputs(defaultInputs);
    setResults(null);
    setError(null);
  }, []);

  return {
    // State
    inputs,
    results,
    isCalculating,
    error,

    // Methods
    calculate,
    updateInput,
    updateInputs,
    reset,
    setInputs
  };
}
