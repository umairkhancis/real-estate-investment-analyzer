import { useState, useRef, useEffect } from 'react';
import './CurrencySelector.css';

export function CurrencySelector({ value, onChange, currencies }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const selectedCurrency = currencies.find(c => c.code === value);

  const filteredCurrencies = currencies.filter(currency =>
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (currency) => {
    onChange(currency.code);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="currency-selector" ref={dropdownRef}>
      <div
        className="currency-selector-display"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-currency">
          <span className="currency-code">{selectedCurrency?.code}</span>
          <span className="currency-name">{selectedCurrency?.name}</span>
          <span className="currency-symbol">{selectedCurrency?.symbol}</span>
        </div>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="currency-dropdown">
          <input
            type="text"
            className="currency-search"
            placeholder="Search currency or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <div className="currency-list">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <div
                  key={currency.code}
                  className={`currency-option ${currency.code === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(currency)}
                >
                  <div className="currency-option-left">
                    <span className="currency-option-code">{currency.code}</span>
                    <span className="currency-option-name">{currency.name}</span>
                  </div>
                  <span className="currency-option-symbol">{currency.symbol}</span>
                </div>
              ))
            ) : (
              <div className="no-results">No currencies found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
