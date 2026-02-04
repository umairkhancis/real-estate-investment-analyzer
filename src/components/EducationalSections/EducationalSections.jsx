import './EducationalSections.css';

export function EducationalSections() {
  return (
    <>
      {/* The Problem */}
      <section className="content-section">
        <h2>Here's The Problem...</h2>
        <p>You're excited about a property. The developer shows you beautiful brochures. They promise:</p>
        <ul style={{ fontSize: '1.15em', lineHeight: 2, color: '#555', margin: '20px 0 20px 40px' }}>
          <li>"This area will boom in 5 years!"</li>
          <li>"Rental yields are amazing!"</li>
          <li>"Property values always go up!"</li>
        </ul>
        <p>But here's what they <strong>don't</strong> tell you:</p>
        <p><strong>Money today is not the same as money tomorrow.</strong></p>
        <p>That property they're selling you for $500,000 today, promising it'll be worth $1,000,000 in 20 years? That future million dollars is NOT worth a million in today's terms.</p>
        <p>Before you can make a smart investment decision, you need to understand one fundamental concept...</p>
      </section>

      {/* Understanding Time Value of Money */}
      <section className="content-section bg-light" id="start-learning">
        <h2>💡 Understanding Time Value of Money</h2>
        <p>Let me ask you a simple question:</p>
        <p style={{ fontSize: '1.3em', fontWeight: 600, color: '#667eea', margin: '30px 0' }}>
          Would you rather have $100 today or $100 in 5 years?
        </p>
        <p>Easy answer, right? <strong>Today!</strong> But why?</p>

        <div className="example-box">
          <h4>📊 Here's Why:</h4>
          <p><strong>If you have $100 today:</strong></p>
          <ul style={{ marginLeft: '20px', lineHeight: 1.8 }}>
            <li>You could invest it in a bank at 5% annual interest</li>
            <li>After 5 years: $100 × (1.05)^5 = <strong>$127.63</strong></li>
          </ul>
          <p style={{ marginTop: '15px' }}><strong>If you wait 5 years for $100:</strong></p>
          <ul style={{ marginLeft: '20px', lineHeight: 1.8 }}>
            <li>You get exactly $100</li>
            <li>You've lost the opportunity to grow that money</li>
          </ul>
          <div className="highlight">
            💡 Conclusion: $100 today is worth MORE than $100 in the future
          </div>
        </div>

        <p style={{ marginTop: '30px' }}>This simple principle is called the <strong>Time Value of Money</strong>, and it's the foundation of every smart investment decision.</p>

        <p style={{ fontSize: '1.2em', fontWeight: 600, color: '#667eea', marginTop: '40px' }}>
          So how do we use this to evaluate a property investment?
        </p>
      </section>

      {/* Real Estate Context */}
      <section className="content-section" id="real-estate-context">
        <h2>🏠 Applying This to Real Estate</h2>
        <p>When you buy a property as an investment, you're actually buying a stream of future cash flows:</p>

        <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#2563eb' }}>📋 Off-Plan Property Example:</h3>
        <div className="cash-flow-explanation">
          <div className="cash-flow-item-explain">
            <div className="year">Year 0 (Today)</div>
            <div className="amount negative">-$100,000</div>
            <div className="description">Initial down payment (10-20% of property value)</div>
          </div>

          <div className="cash-flow-item-explain">
            <div className="year">Year 1-3</div>
            <div className="amount negative">-$1,000/month</div>
            <div className="description">Developer payment plan during construction</div>
          </div>

          <div className="cash-flow-item-explain">
            <div className="year">Year 3</div>
            <div className="amount positive">+$200,000</div>
            <div className="description">Sale proceeds at handover (exit value)</div>
          </div>
        </div>

        <div className="key-question">
          <h3>The Key Question:</h3>
          <p style={{ fontSize: '1.2em', lineHeight: 1.8 }}>
            Is paying <strong>$100,000 down</strong> plus <strong>$1,000/month for 3 years</strong> worth getting <strong>$200,000 back</strong> at handover?
          </p>
        </div>

        <h3 style={{ marginTop: '40px', marginBottom: '15px', color: '#059669' }}>🏡 Ready Property with Mortgage Example:</h3>
        <div className="cash-flow-explanation">
          <div className="cash-flow-item-explain">
            <div className="year">Year 0 (Today)</div>
            <div className="amount negative">-$200,000</div>
            <div className="description">Your initial investment (down payment, fees, etc.)</div>
          </div>

          <div className="cash-flow-item-explain">
            <div className="year">Year 1-25</div>
            <div className="amount positive">+$4,000/month</div>
            <div className="description">Rental income (minus mortgage, fees, maintenance)</div>
          </div>

          <div className="cash-flow-item-explain">
            <div className="year">Year 25</div>
            <div className="amount positive">+$15,000,000</div>
            <div className="description">Property sale value</div>
          </div>
        </div>

        <div className="key-question">
          <h3>The Key Question:</h3>
          <p style={{ fontSize: '1.2em', lineHeight: 1.8 }}>
            Is spending <strong>$200,000 today</strong> worth getting <strong>$4,000/month for 25 years</strong> plus <strong>$15,000,000 at the end</strong>?
          </p>
        </div>

        <p>You can't just add up the numbers! Remember: <strong>Money in the future is worth less than money today.</strong></p>
        <p>This is where <strong>Discounted Cash Flow (DCF)</strong> comes in...</p>

        <a href="#dcf-explanation" className="cta-button">Learn About DCF</a>
      </section>

      {/* DCF Explanation */}
      <section className="content-section bg-gradient" id="dcf-explanation">
        <h2 style={{ color: 'white' }}>📉 Discounted Cash Flow (DCF)</h2>
        <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1em' }}>
          DCF is the most accurate way to value ANY investment. Here's how it works:
        </p>

        <div className="dcf-steps">
          <div className="dcf-step">
            <div className="step-number">1</div>
            <h4>List All Cash Flows</h4>
            <p>Every dollar in and out, for the entire investment period</p>
          </div>

          <div className="dcf-step">
            <div className="step-number">2</div>
            <h4>Discount Each Future Dollar</h4>
            <p>Convert future money to today's value using a discount rate</p>
            <div className="formula">
              Present Value = Future Value ÷ (1 + rate)^years
            </div>
          </div>

          <div className="dcf-step">
            <div className="step-number">3</div>
            <h4>Sum Everything Up</h4>
            <p>Add all discounted values = True worth of investment TODAY</p>
          </div>
        </div>

        <div className="example-box" style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)' }}>
          <h4 style={{ color: 'white' }}>📝 Simple Example:</h4>
          <p style={{ color: 'rgba(255,255,255,0.9)' }}>
            You'll get $10,000 in 5 years. At 5% discount rate, what's it worth today?
          </p>
          <div className="formula" style={{ color: 'white', background: 'rgba(0,0,0,0.2)' }}>
            $10,000 ÷ (1.05)^5 = <strong>$7,835</strong>
          </div>
          <p style={{ color: '#ffd700', marginTop: '15px' }}>
            💡 That future $10,000 is only worth $7,835 in today's money!
          </p>
        </div>

        <a href="#other-metrics" className="cta-button" style={{ background: 'white', color: '#667eea' }}>
          What About IRR, NPV & ROIC?
        </a>
      </section>

      {/* Other Metrics */}
      <section className="content-section" id="other-metrics">
        <h2>📊 Other Important Metrics</h2>
        <p>DCF gives you the intrinsic value, but smart investors look at several metrics:</p>

        <div className="metrics-explanation">
          <div className="metric-explain">
            <div className="metric-icon">💰</div>
            <h3>NPV (Net Present Value)</h3>
            <p className="metric-definition">
              <strong>What it is:</strong> DCF minus your initial investment
            </p>
            <p className="metric-interpretation">
              <strong>What it means:</strong><br />
              • Positive NPV = Investment creates value ✅<br />
              • Negative NPV = Investment destroys value ❌
            </p>
            <div className="metric-example">
              <strong>Example:</strong> If property's DCF is $550,000 and you invest $500,000:<br />
              NPV = $550,000 - $500,000 = <strong>$50,000 profit</strong> 🎉
            </div>
          </div>

          <div className="metric-explain">
            <div className="metric-icon">📈</div>
            <h3>IRR (Internal Rate of Return)</h3>
            <p className="metric-definition">
              <strong>What it is:</strong> The annual percentage return on your investment
            </p>
            <p className="metric-interpretation">
              <strong>What it means:</strong><br />
              • 8% IRR = Your money grows 8% per year<br />
              • Compare to alternatives (stocks, bonds, savings)<br />
              • Higher is better (but consider risk!)
            </p>
            <div className="metric-example">
              <strong>Rule of Thumb:</strong><br />
              • IRR &gt; 8% = Great for real estate 🎯<br />
              • IRR 4-8% = Decent, depends on risk<br />
              • IRR &lt; 4% = Probably better options exist
            </div>
          </div>

          <div className="metric-explain">
            <div className="metric-icon">💵</div>
            <h3>DSCR (Debt Service Coverage Ratio)</h3>
            <p className="metric-definition">
              <strong>What it is:</strong> Can rental income cover your mortgage?
            </p>
            <p className="metric-interpretation">
              <strong>What it means:</strong><br />
              • DSCR &gt; 1.25 = Rental easily covers mortgage ✅<br />
              • DSCR 1.0-1.25 = Tight, but manageable ⚠️<br />
              • DSCR &lt; 1.0 = You'll lose money monthly ❌
            </p>
            <div className="metric-example">
              <strong>Example:</strong> Rent = $3,000/month, Mortgage = $2,000/month<br />
              DSCR = $3,000 ÷ $2,000 = <strong>1.5x</strong> (Excellent!)
            </div>
          </div>

          <div className="metric-explain">
            <div className="metric-icon">🚀</div>
            <h3>ROIC (Return on Invested Capital)</h3>
            <p className="metric-definition">
              <strong>What it is:</strong> Total return vs. money you actually put in
            </p>
            <p className="metric-interpretation">
              <strong>What it means:</strong><br />
              • Measures efficiency of your capital<br />
              • Includes rental income + property appreciation<br />
              • Higher = Better use of your money
            </p>
            <div className="metric-example">
              <strong>Example:</strong> Invest $100k, property value grows to $180k<br />
              ROIC = ($180k - $100k) ÷ $100k = <strong>80%</strong> 🎊
            </div>
          </div>
        </div>

        <div className="ready-section">
          <h2 style={{ color: '#667eea', marginTop: '60px' }}>Ready to Analyze YOUR Investment?</h2>
          <p style={{ fontSize: '1.2em', marginBottom: '30px' }}>
            Use our calculator below to see the DCF, NPV, IRR, DSCR, and ROIC for any property investment.
          </p>
          <a href="#calculator" className="cta-button" style={{ fontSize: '1.2em', padding: '20px 50px' }}>
            Calculate My Investment →
          </a>
        </div>
      </section>
    </>
  );
}
