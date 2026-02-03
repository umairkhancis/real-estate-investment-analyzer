/**
 * Real Estate Investment Calculator - Business Logic Module
 *
 * This module contains all the financial calculations for real estate DCF analysis.
 * It's completely decoupled from UI/DOM - pure business logic only.
 *
 * @module RealEstateCalculator
 */

const RealEstateCalculator = (function() {
    'use strict';

    /**
     * Calculate PMT (Equated Monthly/Annual Installment)
     * Excel PMT function equivalent
     *
     * @param {number} rate - Interest rate per period
     * @param {number} nper - Total number of payment periods
     * @param {number} pv - Present value (loan amount)
     * @returns {number} Payment amount per period
     */
    function PMT(rate, nper, pv) {
        if (rate === 0) {
            return -pv / nper;
        }
        const pvif = Math.pow(1 + rate, nper);
        return rate / (pvif - 1) * -(pv * pvif);
    }

    /**
     * Calculate NPV using Excel's NPV function behavior
     * Excel NPV discounts from period 1 (not period 0)
     *
     * @param {number} rate - Discount rate
     * @param {Array<number>} futureCashFlows - Array of future cash flows (starting from year 1)
     * @returns {number} Net Present Value of future cash flows
     */
    function NPV_Excel(rate, futureCashFlows) {
        let npv = 0;
        for (let i = 0; i < futureCashFlows.length; i++) {
            npv += futureCashFlows[i] / Math.pow(1 + rate, i + 1);
        }
        return npv;
    }

    /**
     * Calculate Internal Rate of Return using Newton-Raphson method
     *
     * @param {Array<number>} cashFlows - Complete cash flow array (including period 0)
     * @param {number} guess - Initial guess for IRR (default 0.1 = 10%)
     * @returns {number} Internal Rate of Return as decimal (e.g., 0.08 = 8%)
     */
    function IRR(cashFlows, guess = 0.1) {
        const maxIterations = 100;
        const tolerance = 0.0001;

        for (let i = 0; i < maxIterations; i++) {
            let npv = 0;
            let dnpv = 0;

            for (let j = 0; j < cashFlows.length; j++) {
                npv += cashFlows[j] / Math.pow(1 + guess, j);
                dnpv += -j * cashFlows[j] / Math.pow(1 + guess, j + 1);
            }

            const newGuess = guess - npv / dnpv;

            if (Math.abs(newGuess - guess) < tolerance) {
                return newGuess;
            }

            guess = newGuess;
        }

        return guess;
    }

    /**
     * Calculate all real estate investment metrics
     *
     * @param {Object} inputs - Investment parameters
     * @param {number} inputs.propertySize - Property size in square feet
     * @param {number} inputs.totalValue - Total property value/price
     * @param {number} inputs.downPaymentPercent - Down payment as percentage (e.g., 25 for 25%)
     * @param {number} inputs.registrationFeePercent - Land registration fee as percentage (e.g., 4 for 4%)
     * @param {number} inputs.tenure - Loan tenure in years
     * @param {number} inputs.discountRate - Annual discount rate as percentage (e.g., 6 for 6%)
     * @param {number} inputs.rentalROI - Rental ROI as percentage (e.g., 7 for 7%)
     * @param {number} inputs.serviceChargesPerSqFt - Annual service charges per square foot
     * @param {number} inputs.exitValue - Expected property sale price at exit (nominal/future value)
     *
     * @returns {Object} Calculation results including all metrics and intermediate values
     */
    function calculateInvestment(inputs) {
        // Convert percentages to decimals
        const downPaymentPct = inputs.downPaymentPercent / 100;
        const registrationFeePct = inputs.registrationFeePercent / 100;
        const discountRate = inputs.discountRate / 100;
        const rentalROI = inputs.rentalROI / 100;

        const {
            propertySize,
            totalValue,
            tenure,
            serviceChargesPerSqFt,
            exitValue
        } = inputs;

        const exitYear = tenure;

        // Computations - matching Excel formulas exactly

        // B12: Price per sq ft = Total Value / Size
        const pricePerSqFt = totalValue / propertySize;

        // B13: Down Payment Amount = Total Value * Down Payment %
        const downPaymentAmt = totalValue * downPaymentPct;

        // B14: Land Registration Fee = Total Value * Registration Fee %
        const landDeptFee = totalValue * registrationFeePct;

        // B15: Agent Commission: 2% = Total Value * 2%
        const agentFee = totalValue * 0.02;

        // B16: Rental Amount (Annualized) = Total Value * Rental ROI %
        const annualRental = totalValue * rentalROI;

        // B17: Service Charges (Annualized) = Service Charges * Size
        const annualServiceCharges = serviceChargesPerSqFt * propertySize;

        // B18: Net Operating Profit (Annualized) = Rental Amount - Service Charges
        const netOperatingIncome = annualRental - annualServiceCharges;

        // B19: Invested Capital = Down Payment + Land Dept + Agent
        const investedCapital = downPaymentAmt + landDeptFee + agentFee;

        // B20: Financing Amount = Total Value * (1 - Down Payment %)
        const financingAmount = totalValue * (1 - downPaymentPct);

        // B21: EMI = PMT(Discount Rate/12, Tenure*12, -Financing Amount)
        const monthlyEMI = PMT(discountRate / 12, tenure * 12, -financingAmount);

        // B22: Loan Amount (Annualized) = EMI * 12
        const loanAmountAnnualized = monthlyEMI * 12;

        // B23: Net Cash Flow (Annualized) = Rental - Service Charges - Loan Amount
        const netAnnualCashFlow = annualRental - annualServiceCharges - loanAmountAnnualized;

        // B28: Terminal Value = Exit Value / (1 + Discount Rate)^Tenure
        // Terminal Value FV (Future Value) = Expected sale price at exit (user input)
        const terminalValueFV = exitValue;
        // Terminal Value PV (Present Value) = Discounted to today's dollars
        const terminalValuePV = terminalValueFV / Math.pow(1 + discountRate, exitYear);

        // NPV Calculation (using 20 years as per Excel model)
        const npvYears = 20;
        const futureCashFlows = [];
        for (let i = 1; i <= npvYears; i++) {
            futureCashFlows.push(netAnnualCashFlow);
        }

        const npvFuture = NPV_Excel(discountRate, futureCashFlows);
        const dcfValue = npvFuture + terminalValuePV;
        const npvValue = -investedCapital + dcfValue;

        // IRR Calculation
        const cashFlowsIRR = [-investedCapital];
        for (let i = 1; i <= npvYears; i++) {
            cashFlowsIRR.push(netAnnualCashFlow);
        }
        cashFlowsIRR.push(terminalValuePV);
        const irrValue = IRR(cashFlowsIRR);

        // Cash Flows for Visualization (Year 0 through exitYear)
        // NOTE: Visualization uses NOMINAL values (what you actually receive)
        // DCF calculations use DISCOUNTED values (present value)
        const cashFlowsVisualization = [-investedCapital];
        for (let i = 1; i < exitYear; i++) {
            cashFlowsVisualization.push(netAnnualCashFlow);
        }
        // Exit year: show nominal terminal value + cash flow (actual dollars received)
        cashFlowsVisualization.push(netAnnualCashFlow + terminalValueFV);

        // B32: DSCR = Net Operating Profit / Loan Amount (Annualized)
        const dscr = netOperatingIncome / loanAmountAnnualized;

        // B34: ROIC = Total Return / Invested Capital
        // Total Return = DCF Value (includes all cash flows + terminal value)
        // This properly captures both rental income AND property appreciation
        const roic = (dcfValue / investedCapital) - 1;

        // Alternative: Property Appreciation Only (Excel's original approach)
        // const roicPropertyOnly = ((terminalValuePV - investedCapital) / investedCapital);

        // Return all calculated values matching Excel exactly
        return {
            // All Computation Fields (matching Excel order)
            pricePerSqFt: pricePerSqFt,                    // B12
            downPaymentAmt: downPaymentAmt,                 // B13
            landDeptFee: landDeptFee,                       // B14
            agentFee: agentFee,                             // B15
            annualRental: annualRental,                     // B16
            annualServiceCharges: annualServiceCharges,     // B17
            netOperatingIncome: netOperatingIncome,         // B18
            investedCapital: investedCapital,               // B19
            financingAmount: financingAmount,               // B20
            monthlyEMI: monthlyEMI,                         // B21
            loanAmountAnnualized: loanAmountAnnualized,     // B22
            netAnnualCashFlow: netAnnualCashFlow,           // B23

            // Terminal Value
            terminalValueFV: terminalValueFV,
            terminalValuePV: terminalValuePV,               // B28

            // Bottom Line Metrics
            dcf: dcfValue,                                  // B30
            npv: npvValue,                                  // B31
            dscr: dscr,                                     // B32
            irr: irrValue,                                  // B33
            roic: roic,                                     // B34

            // Cash Flows for visualization
            cashFlows: cashFlowsVisualization,

            // Additional Info
            exitYear: exitYear,
            discountRate: discountRate
        };
    }

    // Public API
    return {
        calculateInvestment: calculateInvestment,
        PMT: PMT,
        NPV_Excel: NPV_Excel,
        IRR: IRR
    };
})();

// Export for use in HTML or other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealEstateCalculator;
}
