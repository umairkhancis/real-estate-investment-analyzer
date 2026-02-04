import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Initialize refactored calculator service (provides backward compatibility via window.RealEstateCalculator)
import { createGlobalCalculator } from './services/realEstateCalculatorService.js'

// Initialize calculator service once
createGlobalCalculator();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
