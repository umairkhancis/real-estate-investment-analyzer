import { useEffect, useState } from 'react';
import { Hero } from './components/Hero/Hero';
import { EducationalSections } from './components/EducationalSections/EducationalSections';
import { OffplanCalculator } from './components/OffplanCalculator/OffplanCalculator';
import { CurrencySelector } from './components/CurrencySelector/CurrencySelector';
import { AcronymTooltip } from './components/AcronymTooltip/AcronymTooltip';
import { FloatingChatButton } from './components/FloatingChatButton';
import { ChatModal } from './components/ChatModal';
import { useReadyPropertyCalculator } from './hooks/useReadyPropertyCalculator';
import { formatCurrency, formatPercentage } from './utils/formatters';
import { currencies, getCurrencySymbol } from './utils/currencies';
import './App.css';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { inputs, setInputs, results, calculate } = useReadyPropertyCalculator();
  const [isDetailedBreakdownExpanded, setIsDetailedBreakdownExpanded] = useState(true);
  const [activeCalculator, setActiveCalculator] = useState('ready');

  // Auto-calculate on mount
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
    <>
      <div className="app">
        <Hero />
        <EducationalSections />

        {/* Calculator Toggle */}
        <div className="calculator-toggle-wrapper" id="calculator">
          <div className="calculator-toggle-buttons">
            <button
              className={`toggle-btn ${activeCalculator === 'ready' ? 'active' : ''}`}
              onClick={() => setActiveCalculator('ready')}
            >
              🏠 Ready Property (Mortgage)
          </button>
          <button
            className={`toggle-btn ${activeCalculator === 'offplan' ? 'active' : ''}`}
            onClick={() => setActiveCalculator('offplan')}
          >
            🏗️ Off-Plan Property (Developer Plan)
          </button>
        </div>
      </div>

      {activeCalculator === 'ready' ? (
        <section className="calculator-section">
        <div className="container">
          <h2>💰 Investment Calculator</h2>

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
                value={inputs.propertySize}
                onChange={(e) => handleInputChange('propertySize', e.target.value)}
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
              />
            </div>

            <div className="input-group">
              <label>Govt. Registration Fee (%)</label>
              <input
                type="number"
                value={inputs.registrationFeePercent}
                onChange={(e) => handleInputChange('registrationFeePercent', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Tenure (years)</label>
              <input
                type="number"
                value={inputs.tenure}
                onChange={(e) => handleInputChange('tenure', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Discount Rate (%)</label>
              <input
                type="number"
                value={inputs.discountRate}
                onChange={(e) => handleInputChange('discountRate', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Rental ROI (%)</label>
              <input
                type="number"
                value={inputs.rentalROI}
                onChange={(e) => handleInputChange('rentalROI', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Service Charges (per sq ft)</label>
              <input
                type="number"
                value={inputs.serviceChargesPerSqFt}
                onChange={(e) => handleInputChange('serviceChargesPerSqFt', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Exit Value (Expected Sale Price)</label>
              <input
                type="number"
                value={inputs.exitValue}
                onChange={(e) => handleInputChange('exitValue', e.target.value)}
              />
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="results">
              <div className={`investment-status status-${results.status}`}>
                <div className="status-icon">
                  {results.status === 'great' && '🎉'}
                  {results.status === 'marginal' && '⚠️'}
                  {results.status === 'weak' && '❌'}
                </div>
                <h2>
                  {results.status === 'great' && 'Great Investment'}
                  {results.status === 'marginal' && 'Marginal Investment'}
                  {results.status === 'weak' && 'Weak Investment'}
                </h2>
                <p className="status-description">
                  {results.interpretations?.npv?.interpretation || ''}, {results.interpretations?.irr?.interpretation?.toLowerCase() || ''}, {results.interpretations?.dscr?.interpretation?.toLowerCase() || ''}, {results.interpretations?.roic?.interpretation?.toLowerCase() || ''}
                </p>
              </div>

              {/* Key Metrics */}
              <h3>📊 Key Metrics</h3>
              <div className="metrics-grid">
                <div className={`metric-card ${results.interpretations?.npv?.status || ''}`}>
                  <h4><AcronymTooltip acronym="DCF" fullText="Discounted Cash Flow: What your investment is worth in today's dollars after accounting for time value of money" /></h4>
                  <div className="metric-value">{formatCurrency(results.dcf || 0, inputs.currency)}</div>
                  <div className="metric-label">Intrinsic Value</div>
                  <div className="interpretation">
                    Property's true worth in today's terms
                  </div>
                </div>

                <div className={`metric-card ${results.interpretations?.irr?.status || ''}`}>
                  <h4><AcronymTooltip acronym="IRR" fullText="Internal Rate of Return: The annual percentage return you'll earn on your investment. Compare this to your discount rate." /></h4>
                  <div className="metric-value">{formatPercentage(results.irr || 0)}</div>
                  <div className="metric-label">Annual Rate of Return</div>
                  <div className="interpretation">{results.interpretations?.irr?.interpretation || 'Calculating...'}</div>
                </div>

                <div className={`metric-card ${results.interpretations?.dscr?.status || ''}`}>
                  <h4><AcronymTooltip acronym="DSCR" fullText="Debt Service Coverage Ratio: Measures if rental income covers your mortgage payments. Above 1.25 is healthy." /></h4>
                  <div className="metric-value">{results.dscr?.toFixed(2) || 'N/A'}x</div>
                  <div className="metric-label">Debt Service Coverage</div>
                  <div className="interpretation">{results.interpretations?.dscr?.interpretation || 'Calculating...'}</div>
                </div>

                <div className={`metric-card ${results.interpretations?.roic?.status || ''}`}>
                  <h4><AcronymTooltip acronym="ROIC" fullText="Return on Invested Capital: Total return percentage on the money you actually put in. Higher is better." /></h4>
                  <div className="metric-value">{formatPercentage(results.roic || 0)}</div>
                  <div className="metric-label">Return on Invested Capital</div>
                  <div className="interpretation">{results.interpretations?.roic?.interpretation || 'Calculating...'}</div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="additional-metrics">
                <div
                  className="collapsible-header"
                  onClick={() => setIsDetailedBreakdownExpanded(!isDetailedBreakdownExpanded)}
                >
                  <h3>💰 Detailed Breakdown</h3>
                  <button className="toggle-button">
                    {isDetailedBreakdownExpanded ? '▼' : '▶'}
                  </button>
                </div>
                {isDetailedBreakdownExpanded && (
                <div className="detailed-grid">
                  <div className="detail-card">
                    <h4>Price per Sq Ft</h4>
                    <div className="detail-value">
                      {results.pricePerSqFt ? `${getCurrencySymbol(inputs.currency)} ${results.pricePerSqFt.toFixed(2)}` : 'N/A'}
                    </div>
                  </div>
                  <div className="detail-card">
                    <h4>Down Payment Amount</h4>
                    <div className="detail-value">{formatCurrency(results.downPaymentAmt, inputs.currency)}</div>
                  </div>
                  <div className="detail-card">
                    <h4>Govt. Registration Fee</h4>
                    <div className="detail-value">{formatCurrency(results.landDeptFee, inputs.currency)}</div>
                  </div>
                  <div className="detail-card">
                    <h4>Agent Commission: 2%</h4>
                    <div className="detail-value">{formatCurrency(results.agentFee, inputs.currency)}</div>
                  </div>
                  <div className="detail-card">
                    <h4>Invested Capital</h4>
                    <div className="detail-value">{formatCurrency(results.investedCapital, inputs.currency)}</div>
                  </div>
                  <div className="detail-card">
                    <h4>Financing Amount</h4>
                    <div className="detail-value">{formatCurrency(results.financingAmount, inputs.currency)}</div>
                  </div>
                  <div className="detail-card">
                    <h4>Rental Amount (Annual)</h4>
                    <div className="detail-value">{formatCurrency(results.annualRental, inputs.currency)}</div>
                  </div>
                  <div className="detail-card">
                    <h4>Service Charges (Annual)</h4>
                    <div className="detail-value">{formatCurrency(results.annualServiceCharges, inputs.currency)}</div>
                  </div>
                  <div className="detail-card">
                    <h4>Net Operating Profit (Annual)</h4>
                    <div className="detail-value">{formatCurrency(results.netOperatingIncome, inputs.currency)}</div>
                  </div>
                  <div className="detail-card">
                    <h4>EMI (Monthly)</h4>
                    <div className="detail-value">{formatCurrency(results.monthlyEMI, inputs.currency)}</div>
                  </div>
                  <div className="detail-card">
                    <h4>Loan Amount (Annual)</h4>
                    <div className="detail-value">{formatCurrency(results.loanAmountAnnualized, inputs.currency)}</div>
                  </div>
                  <div className="detail-card">
                    <h4>Net Cash Flow (Annual)</h4>
                    <div className="detail-value">{formatCurrency(results.netAnnualCashFlow, inputs.currency)}</div>
                  </div>
                </div>
                )}
              </div>

              {/* Cash Flow Projection */}
              <div className="cash-flow-section">
                <h3>📈 Cash Flow Projection</h3>
                <p className="cash-flow-subtitle">
                  Year 0 (Initial Investment) → Year {results.exitYear || inputs.tenure} (Property Sale + Final Cash Flow)
                </p>
                <div className="cash-flow-grid">
                  {results.cashFlows?.map((cf, index) => (
                    <div key={index} className={`cash-flow-item ${cf < 0 ? 'negative' : 'positive'}`}>
                      <div className="cash-flow-year">Y{index}</div>
                      <div className="cash-flow-arrow">{cf < 0 ? '↓' : '↑'}</div>
                      <div className="cash-flow-amount">{formatCurrency(Math.abs(cf), inputs.currency)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      ) : (
        <OffplanCalculator />
      )}

      <footer className="footer">
        <p>© {new Date().getFullYear()} Umair Khan. All rights reserved.</p>
        <p style={{ opacity: 0.7, fontSize: '0.9em' }}>
          Real Estate Investment Analyzer
        </p>
      </footer>
      </div>

      {/* Floating Chat Button */}
      <FloatingChatButton onClick={() => setIsChatOpen(true)} />

      {/* Chat Modal */}
      {isChatOpen && (
        <ChatModal onClose={() => setIsChatOpen(false)} />
      )}
    </>
  );
}

export default App;
