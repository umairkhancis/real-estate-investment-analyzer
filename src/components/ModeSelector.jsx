import { Calculator, MessageSquare } from 'lucide-react';

export function ModeSelector({ onSelectMode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🏠 Dubai Real Estate Investment Analyzer
          </h1>
          <p className="text-xl text-gray-600">
            Choose how you want to analyze your property investment
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Calculator Mode */}
          <button
            onClick={() => onSelectMode('calculator')}
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-left group"
          >
            <div className="flex items-center mb-6">
              <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Calculator className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Financial Calculator
            </h2>

            <p className="text-gray-600 mb-6">
              Use our comprehensive calculator to analyze property investments with detailed metrics like NPV, IRR, ROIC, and DSCR.
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start text-sm text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Instant calculations with 9+ input parameters
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Ready and off-plan property analysis
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Visual investment scoring
              </li>
            </ul>

            <div className="text-blue-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center">
              Open Calculator →
            </div>
          </button>

          {/* AI Agent Mode */}
          <button
            onClick={() => onSelectMode('agent')}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-left group"
          >
            <div className="flex items-center mb-6">
              <div className="p-4 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              AI Investment Advisor ✨
            </h2>

            <p className="text-indigo-100 mb-6">
              Chat with our AI-powered real estate advisor for personalized investment insights and recommendations.
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start text-sm text-indigo-100">
                <span className="text-green-300 mr-2">✓</span>
                Natural language conversations
              </li>
              <li className="flex items-start text-sm text-indigo-100">
                <span className="text-green-300 mr-2">✓</span>
                Collective market intelligence
              </li>
              <li className="flex items-start text-sm text-indigo-100">
                <span className="text-green-300 mr-2">✓</span>
                Personalized buy/don't buy recommendations
              </li>
            </ul>

            <div className="text-white font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center">
              Talk to AI Advisor →
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="text-sm">
            Powered by Claude Agent SDK • Comprehensive Dubai Real Estate Analysis
          </p>
        </div>
      </div>
    </div>
  );
}
