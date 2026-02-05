import { useEffect, useState } from 'react';
// MIGRATED: Using refactored hook with SOLID principles
import { useOffplanCalculatorRefactored as useOffplanCalculator } from '../../hooks/useOffplanCalculatorRefactored';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { currencies, getCurrencySymbol } from '../../utils/currencies';
import { CurrencySelector } from '../CurrencySelector/CurrencySelector';
import { AcronymTooltip } from '../AcronymTooltip/AcronymTooltip';
import './OffplanCalculator.css';

export function OffplanCalculator() {
  const { inputs, setInputs, results, calculate } = useOffplanCalculator();
  const [isInvestmentExpanded, setIsInvestmentExpanded] = useState(true);
  const [isMortgageExpanded, setIsMortgageExpanded] = useState(true);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleInputChange = (field, value) => {
    const newInputs = {
      ...inputs,
      [field]: field === 'currency' ? value : (parseFloat(value) || 0)
    };
    setInputs(newInputs);
    calculate(newInputs);
  };

  // Calculate interpretations for metric cards
  const npvStatus = results?.npv > 0 ? 'positive' : 'negative';
  const npvInterpretation = results?.npv > 0 ? 'Creates value' : 'Destroys value';

  const irrPercent = (results?.irr || 0) * 100;
  const discountPercent = inputs.discountRate * 100;
  const irrStatus = (results?.irr || 0) > inputs.discountRate ? 'positive' : 'negative';
  const irrInterpretation = irrPercent > discountPercent + 5
    ? `Strong return (${irrPercent.toFixed(1)}% vs ${discountPercent}% hurdle)`
    : irrPercent > discountPercent
    ? `Acceptable return (${irrPercent.toFixed(1)}% vs ${discountPercent}% hurdle)`
    : `Below hurdle rate (${irrPercent.toFixed(1)}% vs ${discountPercent}%)`;

  const roicPercent = (results?.roic || 0) * 100;
  const roicStatus = (results?.roic || 0) > 0.3 ? 'positive' : (results?.roic || 0) > 0.15 ? 'neutral' : 'negative';
  const roicInterpretation = roicPercent > 50
    ? `Excellent return (${roicPercent.toFixed(1)}%)`
    : roicPercent > 30
    ? `Good return (${roicPercent.toFixed(1)}%)`
    : roicPercent > 15
    ? `Fair return (${roicPercent.toFixed(1)}%)`
    : `Poor return (${roicPercent.toFixed(1)}%)`;

  return (
    <div className="offplan-calculator">
      <div className="calculator-card">
        <h2>🏗️ Off-Plan Property (Developer Plan) Calculator</h2>
        <p className="calculator-description">
          Analyze developer payment plans with flexible installments during construction
        </p>

        {/* Input Form */}
        <div className="input-grid">
          <div className="input-group">
            <label>Currency</label>
            <CurrencySelector
              value={inputs.currency}
              onChange={(code) => handleInputChange('currency', code)}
              currencies={currencies}
            />
          </div>

          <div className="input-group">
            <label>Property Size (sq ft)</label>
            <input
              type="number"
              value={inputs.size}
              onChange={(e) => handleInputChange('size', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Total Property Value</label>
            <input
              type="number"
              value={inputs.totalValue}
              onChange={(e) => handleInputChange('totalValue', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Down Payment (%)</label>
            <input
              type="number"
              value={inputs.downPaymentPercent}
              onChange={(e) => handleInputChange('downPaymentPercent', e.target.value)}
              min="0"
              max="100"
            />
          </div>

          <div className="input-group">
            <label>Installment Payment (%)</label>
            <input
              type="number"
              value={inputs.installmentPercent}
              onChange={(e) => handleInputChange('installmentPercent', e.target.value)}
              min="0"
              max="100"
              step="0.5"
            />
          </div>

          <div className="input-group">
            <label>Payment Frequency</label>
            <select
              value={inputs.paymentFrequencyMonths}
              onChange={(e) => handleInputChange('paymentFrequencyMonths', e.target.value)}
            >
              <option value="1">Monthly</option>
              <option value="3">Quarterly (3 months)</option>
              <option value="6">Semi-Annually (6 months)</option>
              <option value="12">Annually (12 months)</option>
            </select>
          </div>

          <div className="input-group">
            <label>Construction Period (years)</label>
            <input
              type="number"
              value={inputs.constructionTenureYears}
              onChange={(e) => handleInputChange('constructionTenureYears', e.target.value)}
              min="1"
              max="10"
              step="0.5"
            />
          </div>

          {results?.totalConstructionPercent && (
            <div className="input-group">
              <label>Total Construction Payment (Calculated)</label>
              <input
                type="text"
                value={`${(results.totalConstructionPercent * 100).toFixed(1)}%`}
                readOnly
                style={{
                  backgroundColor: '#f0fdf4',
                  fontWeight: 'bold',
                  color: '#059669',
                  cursor: 'default'
                }}
              />
            </div>
          )}

          <div className="input-group">
            <label>Future Price per Sq Ft (at handover)</label>
            <input
              type="number"
              value={inputs.futurePricePerSqft}
              onChange={(e) => handleInputChange('futurePricePerSqft', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Discount Rate (%)</label>
            <input
              type="number"
              value={inputs.discountRate}
              onChange={(e) => handleInputChange('discountRate', e.target.value)}
              min="0"
              max="20"
              step="0.1"
            />
          </div>

          <div className="input-group">
            <label>Govt. Registration Fee (%)</label>
            <input
              type="number"
              value={inputs.registrationFeePercent}
              onChange={(e) => handleInputChange('registrationFeePercent', e.target.value)}
              min="0"
              max="10"
              step="0.1"
            />
          </div>
        </div>

        {/* Construction Phase Investment Metrics */}
        {results?.dcf && (
          <>
            <h3 className="section-title">📊 Construction Phase Investment Analysis</h3>
            <div className="metrics-grid">
              <div className={`metric-card ${npvStatus}`}>
                <h4><AcronymTooltip acronym="DCF" fullText="Discounted Cash Flow: What your investment is worth in today's dollars after accounting for time value of money" /></h4>
                <div className="metric-value">{formatCurrency(results.dcf, inputs.currency)}</div>
                <div className="metric-label">Intrinsic Value</div>
                <div className="interpretation">{npvInterpretation}</div>
              </div>

              <div className={`metric-card ${npvStatus}`}>
                <h4><AcronymTooltip acronym="NPV" fullText="Net Present Value: Profit or loss in today's dollars. Positive means good investment, negative means avoid." /></h4>
                <div className="metric-value">{formatCurrency(results.npv, inputs.currency)}</div>
                <div className="metric-label">Net Present Value</div>
                <div className="interpretation">{npvInterpretation}</div>
              </div>

              <div className={`metric-card ${irrStatus}`}>
                <h4><AcronymTooltip acronym="IRR" fullText="Internal Rate of Return: The annual percentage return you'll earn on your investment. Compare this to your discount rate." /></h4>
                <div className="metric-value">{(results.irr * 100).toFixed(2)}%</div>
                <div className="metric-label">Internal Rate of Return</div>
                <div className="interpretation">{irrInterpretation}</div>
              </div>

              <div className={`metric-card ${roicStatus}`}>
                <h4><AcronymTooltip acronym="ROIC" fullText="Return on Invested Capital: Total return percentage on the money you actually put in. Higher is better." /></h4>
                <div className="metric-value">{(results.roic * 100).toFixed(2)}%</div>
                <div className="metric-label">Return on Invested Capital</div>
                <div className="interpretation">{roicInterpretation}</div>
              </div>
            </div>

            <div className="additional-metrics">
              <div
                className="collapsible-header"
                onClick={() => setIsInvestmentExpanded(!isInvestmentExpanded)}
              >
                <h3>💰 Payment Structure</h3>
                <button className="toggle-button">
                  {isInvestmentExpanded ? '▼' : '▶'}
                </button>
              </div>
              {isInvestmentExpanded && (
                <div className="detailed-grid">
                  <div className="detail-card">
                    <h4>Down Payment ({inputs.downPaymentPercent}%)</h4>
                    <div className="detail-value">{formatCurrency(results.downPaymentAmount, inputs.currency)}</div>
                  </div>
                  <div className="detail-card">
                    <h4>Number of Installments</h4>
                    <div className="detail-value">{results.numberOfPayments} payments</div>
                  </div>
                  <div className="detail-card">
                    <h4>Installment Amount</h4>
                    <div className="detail-value">{formatCurrency(results.annualizedInstallment, inputs.currency)}/year</div>
                  </div>
                  <div className="detail-card highlight" style={{ margin: 0 }}>
                    <h4 style={{ fontSize: 'inherit', fontWeight: 'normal' }}>Total Paid During Construction ({(results.totalConstructionPercent * 100).toFixed(1)}% of property value)</h4>
                    <div className="detail-value">{formatCurrency(results.totalPaymentTillHandover, inputs.currency)}</div>
                  </div>
                  <div className="detail-card">
                    <h4>Exit Value</h4>
                    <div className="detail-value">{formatCurrency(results.exitValueNominal, inputs.currency)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Handover Decision Analysis */}
            <h3 className="section-title">🎯 Handover Decision: Exit or Continue?</h3>

            <div className="decision-comparison">
              {/* Option 1: Exit at Handover */}
              <div className="decision-card exit-option">
                <div className="decision-header">
                  <div className="decision-icon">💰</div>
                  <div>
                    <h4>Option 1: Exit at Handover</h4>
                    <p>Sell immediately after construction</p>
                  </div>
                </div>

                <div className="decision-metrics">
                  <div className="decision-metric">
                    <span>Invested Capital (Today)</span>
                    <strong>{formatCurrency(results.investedCapitalToday, inputs.currency)}</strong>
                  </div>
                  <div className="decision-metric full-width">
                    <span>Cash Flow Projection</span>
                    <div className="cash-flow-grid">
                      {results.cashFlows?.map((cf, i) => (
                        <div key={i} className="cash-flow-item">
                          <div className="cash-flow-year">Year {i}</div>
                          <div className="cash-flow-amount negative">
                            {formatCurrency(cf, inputs.currency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="decision-metric">
                    <span>Exit Value (Nominal)</span>
                    <strong>{formatCurrency(results.exitValueNominal, inputs.currency)}</strong>
                  </div>
                  <div className="decision-metric">
                    <span>Exit Value at Handover in Today's Terms</span>
                    <strong>{formatCurrency(results.exitValueDiscounted, inputs.currency)}</strong>
                  </div>
                  <div className="decision-metric">
                    <span>DCF (Present Value of Cash Flows)</span>
                    <strong className="positive">
                      {formatCurrency(results.dcf, inputs.currency)}
                    </strong>
                  </div>
                  <div className="decision-metric">
                    <span>NPV (Creates or Destroys Value)</span>
                    <strong className={results.npv >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(results.npv, inputs.currency)}
                    </strong>
                  </div>
                  <div className="decision-metric">
                    <span>IRR (Annualized Return)</span>
                    <strong className={results.irr >= 0 ? 'positive' : 'negative'}>
                      {(results.irr * 100)?.toFixed(2)}%
                    </strong>
                  </div>
                  <div className="decision-metric">
                    <span>Net Profit (DCF - Invested Capital)</span>
                    <strong className={results.profitAtHandover >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(results.profitAtHandover, inputs.currency)}
                    </strong>
                  </div>
                  <div className="decision-metric">
                    <span>ROIC (Return on Invested Capital)</span>
                    <strong className={results.roiAtHandover >= 0 ? 'positive' : 'negative'}>
                      {results.roiAtHandover?.toFixed(2)}%
                    </strong>
                  </div>
                  <div className="decision-metric">
                    <span>Investment Period</span>
                    <strong>{results.constructionTenureYears} years</strong>
                  </div>
                </div>
              </div>

              {/* Option 2: Continue with Mortgage */}
              <div className="decision-card continue-option">
                <div className="decision-header">
                  <div className="decision-icon">🏠</div>
                  <div>
                    <h4>Option 2: Continue with Mortgage</h4>
                    <p>Finance remaining amount & collect rent</p>
                  </div>
                </div>

                <div className="mortgage-inputs">
                  <div className="inline-input-group">
                    <label>Mortgage Tenure (years)</label>
                    <input
                      type="number"
                      value={inputs.mortgageTenure}
                      onChange={(e) => handleInputChange('mortgageTenure', e.target.value)}
                      min="1"
                      max="30"
                    />
                  </div>

                  <div className="inline-input-group">
                    <label>Expected Rental ROI (%)</label>
                    <input
                      type="number"
                      value={inputs.rentalROI}
                      onChange={(e) => handleInputChange('rentalROI', e.target.value)}
                      min="0"
                      max="20"
                      step="0.1"
                    />
                  </div>

                  <div className="inline-input-group">
                    <label>Service Charges (per sq ft/year)</label>
                    <input
                      type="number"
                      value={inputs.serviceChargesPerSqFt}
                      onChange={(e) => handleInputChange('serviceChargesPerSqFt', e.target.value)}
                      min="0"
                    />
                  </div>

                  <div className="inline-input-group">
                    <label>Expected Sale Price (Exit Value)</label>
                    <input
                      type="number"
                      value={inputs.exitValue}
                      onChange={(e) => handleInputChange('exitValue', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="decision-metrics">
                  <div className="decision-metric">
                    <span>Invested Capital (Construction Payments + {inputs.registrationFeePercent}% Registration Fee)</span>
                    <strong>{formatCurrency(results.totalInvestmentWithMortgage, inputs.currency)}</strong>
                  </div>
                  <div className="decision-metric">
                    <span>Remaining to Finance</span>
                    <strong>{formatCurrency(results.remainingAmount, inputs.currency)}</strong>
                  </div>

                  {/* Investment Returns */}
                  <div className="decision-metric full-width" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #e2e8f0' }}>
                    <span style={{ fontWeight: '600', color: '#2563eb' }}>💰 Investment Returns</span>
                  </div>
                  <div className="decision-metric">
                    <span>Exit Value (Expected Sale Price)</span>
                    <strong>{formatCurrency(results.exitValueForMortgage, inputs.currency)}</strong>
                  </div>
                  <div className="decision-metric">
                    <span>DCF (Present Value of Cash Flows)</span>
                    <strong className="positive">
                      {formatCurrency(results.mortgageDCF, inputs.currency)}
                    </strong>
                  </div>
                  <div className="decision-metric">
                    <span>NPV (Creates or Destroys Value)</span>
                    <strong className={results.mortgageNPV >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(results.mortgageNPV, inputs.currency)}
                    </strong>
                  </div>
                  <div className="decision-metric">
                    <span>IRR (Annualized Return)</span>
                    <strong className={results.mortgageIRR >= 0 ? 'positive' : 'negative'}>
                      {(results.mortgageIRR * 100)?.toFixed(2)}%
                    </strong>
                  </div>
                  <div className="decision-metric">
                    <span>ROIC (Return on Invested Capital)</span>
                    <strong className={results.mortgageROIC >= 0 ? 'positive' : 'negative'}>
                      {(results.mortgageROIC * 100)?.toFixed(2)}%
                    </strong>
                  </div>
                  <div className="decision-metric">
                    <span>Investment Period</span>
                    <strong>{results.yearsToFullExit} years</strong>
                  </div>

                  {/* Annual Operating Metrics */}
                  <div className="decision-metric full-width" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #e2e8f0' }}>
                    <span style={{ fontWeight: '600', color: '#2563eb' }}>📊 Annual Operating Metrics</span>
                  </div>
                  <div className="decision-metric">
                    <span>Rental Amount (Annual)</span>
                    <strong className="positive">{formatCurrency((results.monthlyRentalIncome || 0) * 12, inputs.currency)}</strong>
                  </div>
                  <div className="decision-metric">
                    <span>EMI (Monthly)</span>
                    <strong>{formatCurrency(results.monthlyEMI, inputs.currency)}</strong>
                  </div>
                  <div className="decision-metric">
                    <span>Loan Amount (Annual)</span>
                    <strong>{formatCurrency((results.monthlyEMI || 0) * 12, inputs.currency)}</strong>
                  </div>
                  <div className="decision-metric">
                    <span>Service Charges (Annual)</span>
                    <strong className="negative">{formatCurrency((results.monthlyServiceCharges || 0) * 12, inputs.currency)}</strong>
                  </div>
                  <div className="decision-metric">
                    <span>Net Operating Profit (Annual)</span>
                    <strong className={results.netMonthlyRentalIncome >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency((results.netMonthlyRentalIncome || 0) * 12, inputs.currency)}
                    </strong>
                  </div>
                  <div className="decision-metric">
                    <span>Net Cash Flow (Annual)</span>
                    <strong className={results.netMonthlyCashFlow >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency((results.netMonthlyCashFlow || 0) * 12, inputs.currency)}
                    </strong>
                  </div>
                  <div className="decision-metric">
                    <span>DSCR (Debt Coverage Ratio)</span>
                    <strong className={results.dscr >= 1 ? 'positive' : 'negative'}>{results.dscr?.toFixed(2)}x</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Analysis */}
            <div className="recommendation-banner">
              <h4>💡 Strategic Investment Analysis</h4>
              <p style={{
                color: '#000000',
                backgroundColor: '#f3f4f6',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                lineHeight: '1.6',
                fontWeight: '600',
                fontSize: '15px',
                border: '1px solid #e5e7eb'
              }}>
                Both strategies are financially viable. Your choice depends on your investment goals, liquidity needs, and risk tolerance.
              </p>

              {/* Scenario Comparison Cards - Optimized for Head-to-Head Comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

                {/* Exit at Handover Strategy */}
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '2px solid #059669',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Header - Fixed Height for Alignment */}
                  <h5 style={{ color: '#059669', fontSize: '16px', fontWeight: '600', marginBottom: '12px', minHeight: '24px' }}>
                    🎯 Exit at Handover
                  </h5>

                  {/* ROIC Display - Fixed Height for Alignment */}
                  <div style={{ marginBottom: '15px', minHeight: '62px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669', lineHeight: '1.2' }}>
                      {results.roiAtHandover?.toFixed(1)}% ROIC
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      Over {results.constructionTenureYears} years
                    </div>
                  </div>

                  {/* NPV Box - Fixed Height for Alignment */}
                  <div style={{ marginBottom: '16px', padding: '10px', background: 'white', borderRadius: '8px', minHeight: '66px' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Intrinsic Value of Investment (NPV)</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#059669' }}>
                      {formatCurrency(results.npv, inputs.currency)}
                    </div>
                  </div>

                  {/* Strategy Section - Fixed Height for Alignment */}
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#059669', marginBottom: '8px', minHeight: '23px' }}>
                    ✨ Liquidity Strategy
                  </div>
                  <ul style={{ fontSize: '13px', lineHeight: '1.7', margin: '0 0 16px 0', paddingLeft: '20px', color: '#374151', minHeight: '165px' }}>
                    <li><strong>Capital Flexibility:</strong> Realize profits in {results.constructionTenureYears} years and redeploy into new opportunities</li>
                    <li><strong>Shorter Commitment:</strong> Quick turnaround reduces market exposure and risk</li>
                    <li><strong>Portfolio Velocity:</strong> Faster capital recycling allows for multiple investments over time</li>
                    <li><strong>Opportunity Optionality:</strong> Freedom to pursue higher-yielding investments that may emerge</li>
                  </ul>

                  {/* Bottom Section - Aligned Horizontally */}
                  <div style={{
                    marginTop: 'auto',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#047857'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Best for:</div>
                    <div style={{ fontStyle: 'italic' }}>
                      Investors seeking liquidity, capital recycling, or who anticipate better opportunities
                    </div>
                  </div>
                </div>

                {/* Continue with Mortgage Strategy */}
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '2px solid #2563eb',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Header - Fixed Height for Alignment */}
                  <h5 style={{ color: '#2563eb', fontSize: '16px', fontWeight: '600', marginBottom: '12px', minHeight: '24px' }}>
                    🏠 Continue with Mortgage
                  </h5>

                  {/* ROIC Display - Fixed Height for Alignment */}
                  <div style={{ marginBottom: '15px', minHeight: '62px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb', lineHeight: '1.2' }}>
                      {(results.mortgageROIC * 100)?.toFixed(1)}% ROIC
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      Over {results.yearsToFullExit} years
                    </div>
                  </div>

                  {/* NPV Box - Fixed Height for Alignment */}
                  <div style={{ marginBottom: '16px', padding: '10px', background: 'white', borderRadius: '8px', minHeight: '66px' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Intrinsic Value of Investment (NPV)</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#2563eb' }}>
                      {formatCurrency(results.mortgageNPV, inputs.currency)}
                    </div>
                  </div>

                  {/* Strategy Section - Fixed Height for Alignment */}
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#2563eb', marginBottom: '8px', minHeight: '23px' }}>
                    🏗️ Wealth-Building Strategy
                  </div>
                  <ul style={{ fontSize: '13px', lineHeight: '1.7', margin: '0 0 16px 0', paddingLeft: '20px', color: '#374151', minHeight: '165px' }}>
                    <li><strong>Asset Ownership:</strong> Build equity through mortgage paydown while property appreciates</li>
                    <li><strong>Steady Cash Flow:</strong> {results.netMonthlyCashFlow >= 0 ?
                      `Earn ${formatCurrency((results.netMonthlyCashFlow || 0) * 12, inputs.currency)}/year in net rental income` :
                      `Requires ${formatCurrency(Math.abs(results.netMonthlyCashFlow) * 12, inputs.currency)}/year to cover expenses`}
                    </li>
                    <li><strong>Long-term Returns:</strong> {(results.mortgageROIC * 100) > results.roiAtHandover ?
                      `Higher total ROIC of ${(results.mortgageROIC * 100).toFixed(1)}%` :
                      `Accumulate ${(results.mortgageROIC * 100).toFixed(1)}% returns`} over full holding period</li>
                    <li><strong>Debt Coverage:</strong> DSCR of {(results.dscr || 0).toFixed(2)}x {(results.dscr || 0) >= 1.2 ?
                      'shows strong loan servicing ability' :
                      (results.dscr || 0) >= 1 ? 'covers debt obligations' : 'requires additional cash flow support'}
                    </li>
                  </ul>

                  {/* Bottom Section - Aligned Horizontally */}
                  <div style={{
                    marginTop: 'auto',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#1d4ed8'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Opportunity Cost:</div>
                    <div style={{ fontStyle: 'italic' }}>
                      Capital tied up for {results.yearsToFullExit} years in exchange for property ownership and steady income
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Decision Factors */}
              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '20px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  🎯 Key Decision Factors:
                </div>
                <ul style={{ fontSize: '13px', lineHeight: '1.8', color: '#374151', margin: '0', paddingLeft: '20px' }}>
                  {(() => {
                    const roicDiff = ((results.mortgageROIC * 100) - results.roiAtHandover).toFixed(1);
                    const npvDiff = (results.mortgageNPV - results.npv);

                    return (
                      <>
                        <li>
                          <strong>Return Difference:</strong> Holding generates {Math.abs(roicDiff)}% {roicDiff >= 0 ? 'more' : 'less'} ROIC over {results.yearsToFullExit - results.constructionTenureYears} additional years
                        </li>
                        <li>
                          <strong>Value Gap:</strong> {formatCurrency(Math.abs(npvDiff), inputs.currency)} {npvDiff >= 0 ? 'higher' : 'lower'} intrinsic value by holding long-term
                        </li>
                        <li>
                          <strong>Liquidity Trade-off:</strong> Exit provides capital flexibility in {results.constructionTenureYears} years vs. {results.yearsToFullExit} years locked-in period
                        </li>
                      </>
                    );
                  })()}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
