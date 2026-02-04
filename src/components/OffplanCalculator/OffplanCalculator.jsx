import { useEffect, useState } from 'react';
// MIGRATED: Using refactored hook with SOLID principles
import { useOffplanCalculatorRefactored as useOffplanCalculator } from '../../hooks/useOffplanCalculatorRefactored';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { currencies, getCurrencySymbol } from '../../utils/currencies';
import { CurrencySelector } from '../CurrencySelector/CurrencySelector';
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

  return (
    <div className="offplan-calculator">
      <div className="calculator-card">
        <h2>🏗️ Off-Plan Developer Payment Plan Calculator</h2>
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
            <div className="collapsible-header" onClick={() => setIsInvestmentExpanded(!isInvestmentExpanded)}>
              <h3>📊 Construction Phase Investment Analysis</h3>
              <button className="toggle-button">
                {isInvestmentExpanded ? '▼' : '▶'}
              </button>
            </div>

            {isInvestmentExpanded && (
              <div className="metrics-section">
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-label">DCF (Discounted Cash Flow)</div>
                    <div className="metric-value">{formatCurrency(results.dcf, inputs.currency)}</div>
                    <div className="metric-hint">Present value of investment</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">NPV (Net Present Value)</div>
                    <div className="metric-value">{formatCurrency(results.npv, inputs.currency)}</div>
                    <div className="metric-hint">Net gain in today's value</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">IRR (Internal Rate of Return)</div>
                    <div className="metric-value">{(results.irr * 100).toFixed(2)}%</div>
                    <div className="metric-hint">Annual return rate</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">ROIC (Return on Invested Capital)</div>
                    <div className="metric-value">{(results.roic * 100).toFixed(2)}%</div>
                    <div className="metric-hint">Total return percentage</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">Total Construction Payments</div>
                    <div className="metric-value">{formatCurrency(results.totalPaymentTillHandover, inputs.currency)}</div>
                    <div className="metric-hint">{(results.totalConstructionPercent * 100).toFixed(1)}% of property value</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">Exit Value at Handover</div>
                    <div className="metric-value">{formatCurrency(results.exitValueNominal, inputs.currency)}</div>
                    <div className="metric-hint">Property value when ready</div>
                  </div>
                </div>

                <div className="payment-breakdown">
                  <h4>Payment Structure</h4>
                  <div className="breakdown-grid">
                    <div className="breakdown-item">
                      <span>Down Payment ({inputs.downPaymentPercent}%)</span>
                      <span>{formatCurrency(results.downPaymentAmount, inputs.currency)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Number of Installments</span>
                      <span>{results.numberOfPayments} payments</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Installment Amount</span>
                      <span>{formatCurrency(results.annualizedInstallment, inputs.currency)}/year</span>
                    </div>
                    <div className="breakdown-item highlight">
                      <span>Total Paid During Construction</span>
                      <span>{formatCurrency(results.totalPaymentTillHandover, inputs.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="recommendation-banner">
              <h4>💡 Investment Decision Analysis</h4>

              <div className="comparison-stats">
                <div className="stat-item">
                  <span>📈 Return on Investment</span>
                  <strong style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                    <span>Exit at Handover: <span style={{ color: '#059669' }}>{results.roiAtHandover?.toFixed(1)}%</span></span>
                    <span>Continue with Mortgage: <span style={{ color: '#2563eb' }}>{(results.mortgageROIC * 100)?.toFixed(1)}%</span></span>
                  </strong>
                </div>
                <div className="stat-item">
                  <span>💵 Net Present Value</span>
                  <strong style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                    <span>Exit: <span style={{ color: results.npv >= 0 ? '#059669' : '#dc2626' }}>{formatCurrency(results.npv, inputs.currency)}</span></span>
                    <span>Continue: <span style={{ color: results.mortgageNPV >= 0 ? '#059669' : '#dc2626' }}>{formatCurrency(results.mortgageNPV, inputs.currency)}</span></span>
                  </strong>
                </div>
                <div className="stat-item">
                  <span>⏱️ Time Commitment</span>
                  <strong style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                    <span>Exit: {results.constructionTenureYears} years</span>
                    <span>Continue: {results.yearsToFullExit} years</span>
                  </strong>
                </div>
                <div className="stat-item">
                  <span>💰 Cash Flow Status</span>
                  <strong style={{ color: results.netMonthlyCashFlow >= 0 ? '#059669' : '#dc2626' }}>
                    {results.netMonthlyCashFlow >= 0 ? '✅ Positive' : '⚠️ Negative'} ({formatCurrency((results.netMonthlyCashFlow || 0) * 12, inputs.currency)}/year)
                  </strong>
                </div>
              </div>

              <div className="recommendation-text">
                {(() => {
                  const roicDifference = (results.mortgageROIC * 100) - results.roiAtHandover;
                  const npvDifference = results.mortgageNPV - results.npv;
                  const isPositiveCashFlow = results.netMonthlyCashFlow >= 0;
                  const dscr = results.dscr || 0;

                  if ((results.mortgageROIC * 100) > results.roiAtHandover * 1.3 && isPositiveCashFlow && dscr >= 1.2) {
                    return (
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#059669', marginBottom: '10px' }}>
                          ✅ Strong Recommendation: Continue with Mortgage
                        </p>
                        <p style={{ lineHeight: '1.6' }}>
                          The numbers strongly favor holding this property long-term. Here's why:
                        </p>
                        <ul style={{ lineHeight: '1.6', marginTop: '10px' }}>
                          <li><strong>Higher Returns:</strong> You'll earn {(results.mortgageROIC * 100)?.toFixed(1)}% ROIC by continuing vs {results.roiAtHandover?.toFixed(1)}% by exiting - that's {roicDifference.toFixed(1)}% more!</li>
                          <li><strong>Positive Cash Flow:</strong> Your rental income covers all expenses with {formatCurrency((results.netMonthlyCashFlow || 0) * 12, inputs.currency)} surplus annually.</li>
                          <li><strong>Healthy DSCR:</strong> Your debt coverage ratio of {dscr.toFixed(2)}x shows strong ability to service the loan.</li>
                          <li><strong>Value Creation:</strong> NPV of {formatCurrency(results.mortgageNPV, inputs.currency)} indicates this investment creates significant value.</li>
                        </ul>
                        <p style={{ lineHeight: '1.6', marginTop: '10px', fontStyle: 'italic', color: '#6b7280' }}>
                          This is a wealth-building opportunity where the property pays for itself while appreciating in value.
                        </p>
                      </div>
                    );
                  } else if ((results.mortgageROIC * 100) > results.roiAtHandover && npvDifference > 0) {
                    return (
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb', marginBottom: '10px' }}>
                          ⚖️ Moderate Recommendation: Continue with Mortgage
                        </p>
                        <p style={{ lineHeight: '1.6' }}>
                          Continuing with the mortgage offers better returns, but requires careful consideration:
                        </p>
                        <ul style={{ lineHeight: '1.6', marginTop: '10px' }}>
                          <li><strong>Better Returns:</strong> ROIC of {(results.mortgageROIC * 100)?.toFixed(1)}% vs {results.roiAtHandover?.toFixed(1)}% - a difference of {roicDifference.toFixed(1)}%.</li>
                          <li><strong>Cash Flow:</strong> {isPositiveCashFlow ?
                            `Positive monthly cash flow of ${formatCurrency(results.netMonthlyCashFlow, inputs.currency)} helps cover expenses.` :
                            `Negative monthly cash flow of ${formatCurrency(Math.abs(results.netMonthlyCashFlow), inputs.currency)} requires additional funding.`
                          }</li>
                          <li><strong>Time Commitment:</strong> You'll need to hold for {inputs.mortgageTenure} years vs quick exit at {results.constructionTenureYears} years.</li>
                          <li><strong>Risk Assessment:</strong> {dscr >= 1 ? `Healthy DSCR of ${dscr.toFixed(2)}x provides a good safety buffer.` : `Lower DSCR of ${dscr.toFixed(2)}x means tighter margins on loan payments.`}</li>
                        </ul>
                        <p style={{ lineHeight: '1.6', marginTop: '10px', fontStyle: 'italic', color: '#6b7280' }}>
                          Consider your liquidity needs, risk tolerance, and market outlook before deciding. If you can afford the holding period, the returns justify continuing.
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#ea580c', marginBottom: '10px' }}>
                          💰 Recommendation: Exit at Handover
                        </p>
                        <p style={{ lineHeight: '1.6' }}>
                          The analysis suggests exiting at handover is the better financial decision:
                        </p>
                        <ul style={{ lineHeight: '1.6', marginTop: '10px' }}>
                          <li><strong>Better Return Per Year:</strong> ROIC of {results.roiAtHandover?.toFixed(1)}% over {results.constructionTenureYears} years vs {(results.mortgageROIC * 100)?.toFixed(1)}% over {results.yearsToFullExit} years.</li>
                          <li><strong>Faster Capital Return:</strong> Get your money back in {results.constructionTenureYears} years instead of waiting {results.yearsToFullExit} years.</li>
                          <li><strong>Opportunity Cost:</strong> The {roicDifference < 0 ? Math.abs(roicDifference).toFixed(1) : roicDifference.toFixed(1)}% difference in returns doesn't justify tying up capital for an additional {inputs.mortgageTenure} years.</li>
                          {!isPositiveCashFlow && <li><strong>Cash Flow Challenge:</strong> Negative monthly cash flow of {formatCurrency(Math.abs(results.netMonthlyCashFlow), inputs.currency)} means you'll need to fund the shortfall monthly.</li>}
                          {dscr < 1 && <li><strong>DSCR Warning:</strong> Ratio of {dscr.toFixed(2)}x indicates rental income doesn't fully cover loan payments.</li>}
                        </ul>
                        <p style={{ lineHeight: '1.6', marginTop: '10px', fontStyle: 'italic', color: '#6b7280' }}>
                          Exit at handover, take your profit of {formatCurrency(results.profitAtHandover, inputs.currency)}, and redeploy the capital into better opportunities.
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
