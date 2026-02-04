/**
 * Ready Property Calculator Hook (Refactored)
 *
 * Clean React hook following SOLID principles:
 * - No business logic (delegated to service layer)
 * - State management only
 * - UI-focused interface
 */

import { useState, useCallback } from 'react';
import { calculatorService } from '../services/realEstateCalculatorService.js';
import Decimal from '../lib/decimalConfig.js';

const defaultInputs = {
  currency: 'AED',
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

/**
 * Convert Decimal objects to Numbers for UI display
 * Recursively processes objects and arrays
 */
function convertDecimalsToNumbers(obj) {
  if (obj instanceof Decimal) {
    return obj.toNumber();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDecimalsToNumbers);
  }

  if (obj && typeof obj === 'object') {
    const converted = {};
    for (const key in obj) {
      converted[key] = convertDecimalsToNumbers(obj[key]);
    }
    return converted;
  }

  return obj;
}

/**
 * Interprets calculation results for UI display
 */
function interpretResults(rawResults, inputs) {
  const { npv, irr, dscr, roic, discountRate } = rawResults;

  // NPV Interpretation
  const npvInterpretation = {
    status: npv > 0 ? 'positive' : npv < 0 ? 'negative' : 'neutral',
    interpretation: npv > 100000
      ? 'Exceptional value creation'
      : npv > 50000
      ? 'Strong positive NPV'
      : npv > 0
      ? 'Marginally profitable'
      : 'Investment destroys value'
  };

  // IRR Interpretation (compare to discount rate)
  const irrPercent = irr * 100;
  const discountPercent = (discountRate || inputs.discountRate) * 100;
  const irrInterpretation = {
    status: irr > (discountRate || inputs.discountRate)
      ? 'positive'
      : irr < (discountRate || inputs.discountRate)
      ? 'negative'
      : 'neutral',
    interpretation: irrPercent > discountPercent + 5
      ? `Strong return (${irrPercent.toFixed(1)}% vs ${discountPercent}% hurdle)`
      : irrPercent > discountPercent
      ? `Acceptable return (${irrPercent.toFixed(1)}% vs ${discountPercent}% hurdle)`
      : `Below hurdle rate (${irrPercent.toFixed(1)}% vs ${discountPercent}%)`
  };

  // DSCR Interpretation
  const dscrInterpretation = {
    status: dscr >= 1.25 ? 'positive' : dscr >= 1.0 ? 'neutral' : 'negative',
    interpretation: dscr >= 1.5
      ? 'Excellent debt coverage'
      : dscr >= 1.25
      ? 'Good debt coverage'
      : dscr >= 1.0
      ? 'Marginal debt coverage'
      : 'Insufficient rental income'
  };

  // ROIC Interpretation
  const roicPercent = roic * 100;
  const roicInterpretation = {
    status: roic > 0.3 ? 'positive' : roic > 0.15 ? 'neutral' : 'negative',
    interpretation: roicPercent > 50
      ? `Excellent return (${roicPercent.toFixed(1)}%)`
      : roicPercent > 30
      ? `Good return (${roicPercent.toFixed(1)}%)`
      : roicPercent > 15
      ? `Fair return (${roicPercent.toFixed(1)}%)`
      : `Poor return (${roicPercent.toFixed(1)}%)`
  };

  // Overall Status
  const positiveCount = [
    npvInterpretation.status === 'positive',
    irrInterpretation.status === 'positive',
    dscrInterpretation.status === 'positive',
    roicInterpretation.status === 'positive'
  ].filter(Boolean).length;

  const status = positiveCount >= 3
    ? 'great'
    : positiveCount >= 2
    ? 'marginal'
    : 'weak';

  return {
    ...rawResults,
    interpretations: {
      npv: npvInterpretation,
      irr: irrInterpretation,
      dscr: dscrInterpretation,
      roic: roicInterpretation
    },
    status
  };
}

/**
 * Custom hook for ready property investment calculation
 *
 * @param {Object} initialInputs - Initial input values (optional)
 * @returns {Object} - { inputs, results, calculate, updateInput, updateInputs, reset, setInputs }
 */
export function useReadyPropertyCalculator(initialInputs = {}) {
  const [inputs, setInputs] = useState({
    ...defaultInputs,
    ...initialInputs
  });
  const [results, setResults] = useState(null);

  /**
   * Calculate ready property investment
   */
  const calculate = useCallback((newInputs = inputs) => {
    try {
      // Prepare inputs for calculator (convert percentages to decimals where needed)
      const calculatorInputs = {
        propertySize: Number(newInputs.propertySize) || 0,
        totalValue: Number(newInputs.totalValue) || 0,
        downPaymentPercent: Number(newInputs.downPaymentPercent) || 0,
        registrationFeePercent: Number(newInputs.registrationFeePercent) || 0,
        tenure: Number(newInputs.tenure) || 0,
        discountRate: Number(newInputs.discountRate) || 0,
        rentalROI: Number(newInputs.rentalROI) || 0,
        serviceChargesPerSqFt: Number(newInputs.serviceChargesPerSqFt) || 0,
        exitValue: Number(newInputs.exitValue) || 0
      };

      // Call service layer
      const rawResults = calculatorService.calculateReadyProperty(calculatorInputs);

      // Add interpretations for UI
      const interpretedResults = interpretResults(rawResults, newInputs);

      // Add aliases for backward compatibility with existing UI
      const transformedResults = {
        ...interpretedResults,
        landDeptFee: interpretedResults.registrationFee,
        loanAmountAnnualized: interpretedResults.annualDebtService
      };

      // Convert all Decimal objects to Numbers for UI display
      const resultsForUI = convertDecimalsToNumbers(transformedResults);

      setResults(resultsForUI);
      return resultsForUI;
    } catch (error) {
      console.error('Calculation error:', error);
      setResults(null);
      return null;
    }
  }, [inputs]);

  /**
   * Update a single input field and recalculate
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
   * Update multiple input fields and recalculate
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
   * Reset to default values
   */
  const reset = useCallback(() => {
    setInputs(defaultInputs);
    setResults(null);
  }, []);

  return {
    inputs,
    results,
    calculate,
    updateInput,
    updateInputs,
    reset,
    setInputs
  };
}
