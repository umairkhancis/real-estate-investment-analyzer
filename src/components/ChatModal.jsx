import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react';
import './ChatModal.css';

export function ChatModal({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! 👋 Welcome to your Real Estate Companion.\n\nI'm built using the collective intelligence of real experts from the real estate market. I can help you assess property investments with comprehensive financial analysis:\n\n🏢 Ready Properties - Move-in ready with rental income\n🏗️ Off-Plan Properties - Construction phase with dual scenarios\n\nJust describe a property you're considering, and I'll provide detailed NPV, IRR, ROIC, and DSCR analysis with clear buy/don't buy recommendations.\n\n💬 How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when modal opens
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Call the agent API endpoint
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }

      const data = await response.json();

      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.result
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or check your connection.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="chat-header-icon">
              <Bot size={20} />
              <Sparkles className="header-sparkle" size={12} />
            </div>
            <div className="chat-header-text">
              <h3>Real Estate Companion</h3>
              <p>Built using collective intelligence of real experts of real estate market</p>
            </div>
          </div>
          <div className="chat-header-actions">
            <button
              onClick={onClose}
              className="header-button close-button"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-wrapper ${message.role === 'user' ? 'user' : 'assistant'}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? (
                  <User size={16} />
                ) : (
                  <Bot size={16} />
                )}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="message-avatar">
                <Bot size={16} />
              </div>
              <div className="message-content">
                <div className="message-loading">
                  <Loader2 className="loading-spinner" size={16} />
                  <span>Analyzing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-container">
          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe a property you're considering..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="chat-send-button"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="loading-spinner" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
          <div className="chat-input-hint">
            Try: "1.5M AED apartment, 1000 sq ft" or "2M off-plan villa"
          </div>
        </div>
      </div>
    </div>
  );
}
