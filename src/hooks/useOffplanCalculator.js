import { useState, useCallback } from 'react';
import { calculateOffplanInvestment } from '../lib/offplanCalculator';

export function useOffplanCalculator() {
  const [inputs, setInputs] = useState({
    size: 850,
    totalValue: 850000,
    downPaymentPercent: 10, // Store as percentage (10 = 10%)
    constructionTenureYears: 3,
    paymentFrequencyMonths: 6,
    installmentPercent: 5, // Store as percentage (5 = 5%)
    discountRate: 4, // Store as percentage (4 = 4%)
    futurePricePerSqft: 1200,
    currency: 'AED',

    // Post-handover mortgage options (if continuing property)
    mortgageTenure: 25,
    rentalROI: 6,
    serviceChargesPerSqFt: 10,
    registrationFeePercent: 4,
    exitValue: 1020000 // Expected sale price
  });

  const [results, setResults] = useState({});

  const calculate = useCallback((newInputs = inputs) => {
    // Convert percentages to decimals for calculation
    const calcInputs = {
      size: newInputs.size,
      totalValue: newInputs.totalValue,
      downPaymentPercent: newInputs.downPaymentPercent / 100,
      constructionTenureYears: newInputs.constructionTenureYears,
      paymentFrequencyMonths: newInputs.paymentFrequencyMonths,
      installmentPercent: newInputs.installmentPercent / 100,
      discountRate: newInputs.discountRate / 100,
      futurePricePerSqft: newInputs.futurePricePerSqft
    };

    // Calculate offplan investment using verified business logic
    const offplanResults = calculateOffplanInvestment(calcInputs);

    // SCENARIO 1: Exit at Handover (using DCF-based analysis from Excel model)
    const investedCapitalToday = offplanResults.investedCapitalToday;
    const profitAtHandover = offplanResults.dcf - investedCapitalToday;
    const roiAtHandover = (profitAtHandover / investedCapitalToday) * 100;

    // SCENARIO 2: Continue with Mortgage - Use Ready Property Calculator
    // Amount paid to developer becomes the "down payment" for mortgage
    const downPaymentPercentForMortgage = offplanResults.totalConstructionPercent * 100;
    const registrationFee = offplanResults.totalValue * (newInputs.registrationFeePercent / 100);

    let mortgageResults = null;
    if (window.RealEstateCalculator) {
      const mortgageInputs = {
        propertySize: newInputs.size,
        totalValue: offplanResults.totalValue,
        downPaymentPercent: downPaymentPercentForMortgage,
        registrationFeePercent: newInputs.registrationFeePercent,
        tenure: newInputs.mortgageTenure,
        discountRate: newInputs.discountRate,
        rentalROI: newInputs.rentalROI,
        serviceChargesPerSqFt: newInputs.serviceChargesPerSqFt,
        exitValue: newInputs.exitValue || offplanResults.exitValueNominal,
        currency: newInputs.currency
      };

      try {
        mortgageResults = window.RealEstateCalculator.calculateInvestment(mortgageInputs);
      } catch (error) {
        console.error('Error calculating mortgage:', error);
      }
    }

    const remainingAmount = offplanResults.totalValue - offplanResults.totalPaymentTillHandover;
    const monthlyEMI = mortgageResults?.monthlyEMI || 0;
    const totalMortgagePayment = mortgageResults?.totalMortgagePayment || 0;
    const totalInterestPaid = mortgageResults?.totalInterestPaid || 0;

    // Calculate monthly values from annual values returned by Ready Property Calculator
    let annualRental = mortgageResults?.annualRental || 0;
    let annualServiceCharges = mortgageResults?.annualServiceCharges || 0;
    let netOperatingIncome = mortgageResults?.netOperatingIncome || 0;
    let netAnnualCashFlow = mortgageResults?.netAnnualCashFlow || 0;

    // Fallback calculation if Ready Property Calculator didn't return these values
    if (!annualRental && newInputs.rentalROI && offplanResults.totalValue) {
      annualRental = offplanResults.totalValue * (newInputs.rentalROI / 100);
    }
    if (!annualServiceCharges && newInputs.serviceChargesPerSqFt && newInputs.size) {
      annualServiceCharges = newInputs.serviceChargesPerSqFt * newInputs.size;
    }
    if (!netOperatingIncome) {
      netOperatingIncome = annualRental - annualServiceCharges;
    }
    if (!netAnnualCashFlow) {
      netAnnualCashFlow = netOperatingIncome - (monthlyEMI * 12);
    }

    const monthlyRentalIncome = annualRental / 12;
    const monthlyServiceCharges = annualServiceCharges / 12;
    const netMonthlyRentalIncome = netOperatingIncome / 12;
    const netMonthlyCashFlow = netAnnualCashFlow / 12;

    const dscr = mortgageResults?.dscr || 0;
    const mortgageNPV = mortgageResults?.npv || 0;
    const mortgageIRR = mortgageResults?.irr || 0;
    const mortgageDCF = mortgageResults?.dcf || 0;
    const mortgageROIC = mortgageResults?.roic || 0;

    const totalInvestmentWithMortgage = offplanResults.totalPaymentTillHandover + registrationFee;
    const totalRentalIncome = netMonthlyRentalIncome * (newInputs.mortgageTenure * 12);
    const yearsToFullExit = offplanResults.constructionTenureYears + newInputs.mortgageTenure;

    setResults({
      // Original offplan calculations
      ...offplanResults,

      // Store input percentages for display
      downPaymentPercentDisplay: newInputs.downPaymentPercent,
      installmentPercentDisplay: newInputs.installmentPercent,
      discountRateDisplay: newInputs.discountRate,

      // Exit Scenario 1: At Handover
      profitAtHandover,
      roiAtHandover,

      // Exit Scenario 2: Continue with Mortgage (from Ready Property Calculator)
      remainingAmount,
      registrationFee,
      monthlyEMI,
      totalMortgagePayment,
      totalInterestPaid,
      monthlyRentalIncome,
      monthlyServiceCharges,
      netMonthlyRentalIncome,
      netMonthlyCashFlow,
      totalRentalIncome,
      dscr,
      mortgageNPV,
      mortgageIRR,
      mortgageDCF,
      mortgageROIC,
      totalInvestmentWithMortgage,
      yearsToFullExit,
      exitValueForMortgage: newInputs.exitValue || offplanResults.exitValueNominal
    });
  }, [inputs]);

  return {
    inputs,
    setInputs,
    results,
    calculate
  };
}
