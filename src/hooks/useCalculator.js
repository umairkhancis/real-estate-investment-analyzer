import { useState, useCallback } from 'react';
import { useAnalytics } from './useAnalytics';
import { useFirestore } from './useFirestore';

export function useCalculator() {
  const [results, setResults] = useState(null);
  const [inputs, setInputs] = useState({
    propertySize: 1189,
    totalValue: 1560000,
    downPaymentPercent: 20,
    registrationFeePercent: 4,
    tenure: 25,
    discountRate: 4,
    rentalROI: 6,
    serviceChargesPerSqFt: 10,
    exitValue: 1664600,
    currency: 'AED'
  });

  const { trackCalculation } = useAnalytics();
  const { saveCalculation } = useFirestore();

  const calculate = useCallback((newInputs) => {
    const calculationInputs = newInputs || inputs;

    // Check if calculator is loaded
    if (!window.RealEstateCalculator) {
      console.error('RealEstateCalculator not loaded yet');
      return null;
    }

    // Calculate results using the existing calculator module
    const calculatedResults = window.RealEstateCalculator.calculateInvestment(calculationInputs);

    // Validate results
    if (!calculatedResults || typeof calculatedResults.npv === 'undefined') {
      console.error('Calculator returned invalid results');
      return null;
    }

    // Determine interpretations
    const npvPositive = calculatedResults.npv > 0;
    const irrPercent = calculatedResults.irr * 100;
    const roicPercent = calculatedResults.roic * 100;
    const riskFreeRate = 4.0;

    const interpretations = {
      npv: {
        interpretation: npvPositive ? 'Creates value over time' : 'Erodes value over time',
        status: npvPositive ? 'positive' : 'negative',
        isStrong: npvPositive && calculatedResults.npv > 100000,
        isAcceptable: npvPositive
      },
      irr: {
        interpretation: irrPercent > 6
          ? 'Strongly beats risk-free return'
          : irrPercent > riskFreeRate
            ? 'Marginally beats risk-free return'
            : irrPercent > 0
              ? 'Below risk-free return'
              : 'Negative return',
        status: irrPercent > 6 ? 'positive' : irrPercent > riskFreeRate ? 'acceptable' : 'negative',
        isStrong: irrPercent > 6,
        isAcceptable: irrPercent > riskFreeRate
      },
      dscr: {
        interpretation: calculatedResults.dscr > 1.25
          ? 'Highly self-sustainable'
          : calculatedResults.dscr >= 1.0
            ? 'Minimally self-sustainable'
            : 'Requires additional capital',
        status: calculatedResults.dscr > 1.25 ? 'positive' : calculatedResults.dscr >= 1.0 ? 'acceptable' : 'negative',
        isStrong: calculatedResults.dscr > 1.25,
        isAcceptable: calculatedResults.dscr >= 1.0
      },
      roic: {
        interpretation: roicPercent > 50
          ? 'Strong capital growth'
          : roicPercent > 20
            ? 'Moderate capital growth'
            : roicPercent > 0
              ? 'Weak capital growth'
              : 'Capital loss',
        status: roicPercent > 50 ? 'positive' : roicPercent > 20 ? 'acceptable' : 'negative',
        isStrong: roicPercent > 50,
        isAcceptable: roicPercent > 20
      }
    };

    // Determine status
    const strongCount = Object.values(interpretations).filter(m => m.isStrong).length;
    const acceptableCount = Object.values(interpretations).filter(m => m.isAcceptable).length;

    let status = 'weak';
    if (strongCount === 4) {
      status = 'great';
    } else if (acceptableCount >= 3) {
      status = 'marginal';
    }

    const finalResults = {
      ...calculatedResults,
      status,
      interpretations,
      strongCount,
      acceptableCount
    };

    setResults(finalResults);

    // Track with Firebase
    try {
      trackCalculation(finalResults, interpretations, strongCount, acceptableCount);
      saveCalculation(calculationInputs, finalResults, interpretations, strongCount, acceptableCount);
    } catch (error) {
      console.error('Firebase tracking error:', error);
    }

    return finalResults;
  }, [inputs, trackCalculation, saveCalculation]);

  return {
    inputs,
    setInputs,
    results,
    calculate
  };
}
