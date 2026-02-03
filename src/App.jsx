import { useEffect } from 'react';
import { Hero } from './components/Hero/Hero';
import { useCalculator } from './hooks/useCalculator';
import { formatCurrency, formatPercentage } from './utils/formatters';
import './App.css';

function App() {
  const { inputs, setInputs, results, calculate } = useCalculator();

  // Auto-calculate on mount
  useEffect(() => {
    calculate();
  }, []);

  const handleInputChange = (field, value) => {
    const newInputs = { ...inputs, [field]: parseFloat(value) || 0 };
    setInputs(newInputs);
    calculate(newInputs);
  };

  return (
    <div className="app">
      <Hero />

      <section className="calculator-section" id="calculator">
        <div className="container">
          <h2>💰 Investment Calculator</h2>

          {/* Input Form */}
          <div className="input-grid">
            <div className="input-group">
              <label>Property Size (sq ft)</label>
              <input
                type="number"
                value={inputs.propertySize}
                onChange={(e) => handleInputChange('propertySize', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Total Property Value (AED)</label>
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
              <label>Exit Value (AED)</label>
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
                  {results.interpretations.npv.interpretation}, {results.interpretations.irr.interpretation.toLowerCase()}, {results.interpretations.dscr.interpretation.toLowerCase()}, {results.interpretations.roic.interpretation.toLowerCase()}
                </p>
              </div>

              {/* Key Metrics */}
              <h3>📊 Key Metrics</h3>
              <div className="metrics-grid">
                <div className={`metric-card ${results.interpretations.npv.status}`}>
                  <h4>DCF</h4>
                  <div className="metric-value">{formatCurrency(results.dcf)}</div>
                  <div className="metric-label">Intrinsic Value</div>
                  <div className="interpretation">
                    {results.npv > 0 ? 'Creates value' : 'Destroys value'}
                  </div>
                </div>

                <div className={`metric-card ${results.interpretations.irr.status}`}>
                  <h4>IRR</h4>
                  <div className="metric-value">{formatPercentage(results.irr)}</div>
                  <div className="metric-label">Annual Rate of Return</div>
                  <div className="interpretation">{results.interpretations.irr.interpretation}</div>
                </div>

                <div className={`metric-card ${results.interpretations.dscr.status}`}>
                  <h4>DSCR</h4>
                  <div className="metric-value">{results.dscr.toFixed(2)}x</div>
                  <div className="metric-label">Debt Service Coverage</div>
                  <div className="interpretation">{results.interpretations.dscr.interpretation}</div>
                </div>

                <div className={`metric-card ${results.interpretations.roic.status}`}>
                  <h4>ROIC</h4>
                  <div className="metric-value">{formatPercentage(results.roic)}</div>
                  <div className="metric-label">Return on Invested Capital</div>
                  <div className="interpretation">{results.interpretations.roic.interpretation}</div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="additional-metrics">
                <h3>📋 Detailed Breakdown</h3>
                <div className="metrics-list">
                  <div className="metric-item">
                    <span>NPV (Net Present Value):</span>
                    <strong>{formatCurrency(results.npv)}</strong>
                  </div>
                  <div className="metric-item">
                    <span>Invested Capital:</span>
                    <strong>{formatCurrency(results.investedCapital)}</strong>
                  </div>
                  <div className="metric-item">
                    <span>Annual Rental Income:</span>
                    <strong>{formatCurrency(results.annualRental)}</strong>
                  </div>
                  <div className="metric-item">
                    <span>Monthly EMI:</span>
                    <strong>{formatCurrency(results.monthlyEMI)}</strong>
                  </div>
                  <div className="metric-item">
                    <span>Net Annual Cash Flow:</span>
                    <strong>{formatCurrency(results.netAnnualCashFlow)}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <p>Real Estate Investment Analyzer - Built with React + Vite + Firebase</p>
        <p style={{ opacity: 0.7, fontSize: '0.9em' }}>
          🔥 Analytics & Data Storage Enabled
        </p>
      </footer>
    </div>
  );
}

export default App;
