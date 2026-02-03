# Project Architecture

## Overview
The Real Estate Investment Analyzer is now split into separate modules for better maintainability and reusability.

## File Structure

```
real-estate-investment-analyzer/
├── calculator.js           # Pure business logic (no UI dependencies)
├── index.html             # Landing page + UI logic
├── real-estate-investment-analyzer.html  # Original version (backup)
├── real-estate-valuation-calculator.html # Original calculator (backup)
├── ARCHITECTURE.md        # This file
└── README.md             # Project documentation
```

## Module Separation

### `calculator.js` - Business Logic Module

**Purpose:** Pure financial calculations with NO UI dependencies

**Contains:**
- `PMT()` - Calculate loan payment (EMI)
- `NPV_Excel()` - Net Present Value calculation (Excel-compatible)
- `IRR()` - Internal Rate of Return (Newton-Raphson method)
- `calculateInvestment()` - Main calculation function

**Usage:**
```javascript
const inputs = {
    propertySize: 1000,
    totalValue: 1000000,
    downPaymentPercent: 20,
    tenure: 25,
    discountRate: 5,
    rentalROI: 6,
    serviceChargesPerSqFt: 10,
    terminalValue: 1300000
};

const results = RealEstateCalculator.calculateInvestment(inputs);
console.log(results.npv);  // Net Present Value
console.log(results.irr);  // Internal Rate of Return
console.log(results.dcf);  // DCF Value
```

**Returns:**
```javascript
{
    // Primary Metrics
    npv: number,
    dcf: number,
    irr: number,
    roic: number,
    dscr: number,

    // Investment Details
    investedCapital: number,
    downPaymentAmt: number,
    landDeptFee: number,
    agentFee: number,

    // Loan Details
    loanAmount: number,
    monthlyEMI: number,
    annualDebtService: number,

    // Operating Metrics
    annualRental: number,
    annualServiceCharges: number,
    netOperatingIncome: number,
    netAnnualCashFlow: number,
    grossYield: number,

    // Terminal Value
    terminalValueFV: number,
    terminalValuePV: number,

    // Cash Flows
    cashFlows: Array<number>,

    // Additional Info
    exitYear: number,
    discountRate: number
}
```

### `index.html` - UI Layer

**Purpose:** User interface and DOM manipulation only

**Contains:**
- Landing page HTML structure
- Educational content
- Input forms
- Result display logic
- Event listeners
- UI formatting functions

**Key Functions:**
- `calculate()` - Gets inputs from DOM, calls calculator module, updates UI
- `updateResultsDisplay()` - Updates all result cards with calculated values
- `updateCashFlowVisualization()` - Renders cash flow grid
- `formatCurrency()` - Formats numbers for display
- `formatWithCommas()` - Formats input field values

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Business logic is completely independent of UI
- Can change landing page design without touching calculations
- Can change formulas without touching UI code

### 2. **Reusability**
- `calculator.js` can be used in:
  - Different landing page designs
  - Mobile apps
  - API endpoints
  - Node.js backend services
  - Other web applications

### 3. **Testability**
- Business logic can be unit tested independently
- No need for DOM mocking in tests
- Easy to verify formula accuracy

### 4. **Maintainability**
- Clear boundaries between modules
- Easier to debug issues
- Simpler code reviews

## Making Changes

### To Change Landing Page Design:
1. Edit `index.html` only
2. Modify HTML structure, CSS, and UI logic
3. Keep the same input IDs and result element IDs
4. Or update the `calculate()` function to match new IDs

### To Change Calculations:
1. Edit `calculator.js` only
2. Modify formulas in `calculateInvestment()` function
3. No need to touch any HTML or UI code
4. Test calculations independently

### To Add New Metrics:
1. Add calculation in `calculator.js` → `calculateInvestment()`
2. Return new metric in the results object
3. Add display logic in `index.html` → `updateResultsDisplay()`

## Example: Creating a New Landing Page

```html
<!DOCTYPE html>
<html>
<head>
    <title>New Design</title>
</head>
<body>
    <h1>My Custom Design</h1>

    <!-- Your custom HTML -->
    <input type="number" id="size">
    <input type="number" id="totalValue">
    <!-- ... other inputs ... -->

    <button onclick="runCalculation()">Calculate</button>

    <div id="result"></div>

    <!-- Import the calculator module -->
    <script src="calculator.js"></script>

    <!-- Your custom UI logic -->
    <script>
        function runCalculation() {
            const inputs = {
                propertySize: parseFloat(document.getElementById('size').value),
                totalValue: parseFloat(document.getElementById('totalValue').value),
                // ... other inputs ...
            };

            const results = RealEstateCalculator.calculateInvestment(inputs);

            document.getElementById('result').textContent =
                'NPV: ' + results.npv.toFixed(0);
        }
    </script>
</body>
</html>
```

## Testing the Calculator Module

You can test the calculator independently:

```javascript
// Test in browser console or Node.js
const testInputs = {
    propertySize: 832,
    totalValue: 1600000,
    downPaymentPercent: 25,
    tenure: 20,
    discountRate: 6,
    rentalROI: 7,
    serviceChargesPerSqFt: 10,
    terminalValue: 1664600
};

const results = RealEstateCalculator.calculateInvestment(testInputs);

console.log('NPV:', results.npv);        // Should match Excel
console.log('IRR:', results.irr * 100);  // Should match Excel
console.log('DCF:', results.dcf);        // Should match Excel
console.log('ROIC:', results.roic);      // Should match Excel
```

## Version Control

When committing changes:
- If you change calculations, commit `calculator.js`
- If you change design, commit `index.html`
- Keep commits focused on one module when possible
- This makes it easier to track changes and roll back if needed
