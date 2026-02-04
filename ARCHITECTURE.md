# Real Estate Calculator - Architecture Documentation

## Overview

This application follows **SOLID principles** and **clean architecture** patterns to ensure maintainability, testability, and reusability.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  React Components (UI) - OffplanCalculator.jsx              │
│  No business logic - only presentation and user interaction  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   State Management Layer                     │
│  React Hooks - useOffplanCalculatorRefactored.js            │
│  Manages state, orchestrates calculations, no business logic │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      Service Layer                           │
│  realEstateCalculatorService.js                              │
│  Coordinates calculators, provides unified API, DI container │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
┌─────────▼──────────┐  ┌────────▼──────────┐
│  Business Logic    │  │  Business Logic   │
│  Ready Property    │  │  Off-Plan         │
│  Calculator        │  │  Calculator       │
└─────────┬──────────┘  └────────┬──────────┘
          │                       │
          └───────────┬───────────┘
                      │
          ┌───────────▼───────────┐
          │  Financial Functions  │
          │  Pure Math/Formulas   │
          │  PMT, NPV, IRR, etc.  │
          └───────────────────────┘
```

## SOLID Principles Implementation

### 1. Single Responsibility Principle (SRP)

Each module has **one reason to change**:

#### `/src/lib/financial.js`
**Responsibility:** Pure financial mathematics
- PMT, NPV, IRR, PV, FV calculations
- No domain knowledge, no side effects
- Reusable across any financial application

#### `/src/lib/readyPropertyCalculator.js`
**Responsibility:** Ready property investment calculations
- Uses financial functions
- Implements ready property domain logic
- Returns structured results

#### `/src/lib/offplanCalculatorRefactored.js`
**Responsibility:** Off-plan investment calculations
- Uses financial functions
- Implements off-plan domain logic
- Handles construction phase calculations

#### `/src/services/realEstateCalculatorService.js`
**Responsibility:** Coordinate and integrate calculators
- Provides unified API
- Handles calculator composition
- Generates recommendations

#### `/src/hooks/useOffplanCalculatorRefactored.js`
**Responsibility:** State management and UI orchestration
- Manages React state
- Coordinates user interactions
- No business logic

### 2. Open/Closed Principle (OCP)

**Open for extension, closed for modification**

#### Adding a New Calculator Type

```javascript
// Add new calculator without modifying existing code
import { calculateCommercialProperty } from '../lib/commercialPropertyCalculator.js';

class RealEstateCalculatorService {
  constructor() {
    this.readyPropertyCalculator = calculateReadyPropertyInvestment;
    this.offplanCalculator = calculateOffplanInvestment;
    // NEW: Add without modifying existing calculators
    this.commercialPropertyCalculator = calculateCommercialProperty;
  }

  // NEW: Add new method without changing existing ones
  calculateCommercialProperty(inputs) {
    return this.commercialPropertyCalculator(inputs);
  }
}
```

### 3. Liskov Substitution Principle (LSP)

All calculator functions follow the same interface contract:

```javascript
// Interface (TypeScript-style documentation)
interface Calculator {
  (inputs: CalculatorInputs): CalculatorResults
}

// All calculators are substitutable
const calculator1 = calculateReadyPropertyInvestment;
const calculator2 = calculateOffplanInvestment;
const calculator3 = calculateCommercialProperty; // Future

// All work the same way
const results = calculator(inputs); // ✓ Works for any calculator
```

### 4. Interface Segregation Principle (ISP)

**Clients should not depend on interfaces they don't use**

#### Focused Function Interfaces

```javascript
// Financial functions are split into focused operations
import { PMT } from './financial.js';           // Only need payment calc
import { NPV_Excel } from './financial.js';     // Only need NPV
import { IRR } from './financial.js';           // Only need IRR

// Calculator functions are also focused
import { calculateRentalMetrics } from './readyPropertyCalculator.js';
import { calculateMortgageMetrics } from './readyPropertyCalculator.js';
import { calculateInvestmentCosts } from './readyPropertyCalculator.js';

// Use only what you need
const rental = calculateRentalMetrics({ totalValue, propertySize, rentalROI, serviceChargesPerSqFt });
```

### 5. Dependency Inversion Principle (DIP)

**Depend on abstractions, not concretions**

#### Before (Tight Coupling)
```javascript
// ❌ BAD: Direct dependency on global variable
const results = window.RealEstateCalculator.calculateInvestment(inputs);
```

#### After (Dependency Injection)
```javascript
// ✓ GOOD: Dependency injected through service
import { calculatorService } from '../services/realEstateCalculatorService.js';

const results = calculatorService.calculateReadyProperty(inputs);

// ✓ GOOD: Can inject mock for testing
const mockService = new RealEstateCalculatorService();
mockService.setCalculators({
  readyProperty: mockCalculator,
  offplan: mockOffplanCalculator
});
```

## File Structure

```
src/
├── lib/                              # Business Logic (Pure Functions)
│   ├── financial.js                  # ✓ Pure financial math functions
│   ├── financial.test.js             # ✓ Unit tests for financial functions
│   ├── readyPropertyCalculator.js    # ✓ Ready property business logic
│   ├── offplanCalculatorRefactored.js# ✓ Off-plan business logic
│   └── offplanCalculator.js          # ⚠️  Legacy (to be replaced)
│
├── services/                         # Service Layer (Orchestration)
│   ├── realEstateCalculatorService.js# ✓ Main service with DI
│   └── calculator.js                 # ⚠️  Legacy (to be replaced)
│
├── hooks/                            # State Management (React Hooks)
│   ├── useOffplanCalculatorRefactored.js # ✓ Clean hook (no business logic)
│   └── useOffplanCalculator.js       # ⚠️  Legacy (has mixed concerns)
│
└── components/                       # Presentation Layer (UI)
    └── OffplanCalculator/
        ├── OffplanCalculator.jsx     # UI component
        └── OffplanCalculator.css     # Styling

public/
└── calculator.js                     # ⚠️  Legacy global (to be removed)
```

## Benefits of This Architecture

### 1. **Testability**
```javascript
// Easy to test pure functions
import { PMT } from './financial.js';

test('PMT calculates correctly', () => {
  expect(PMT(0.05/12, 360, -100000)).toBeCloseTo(536.82, 2);
});

// Easy to test with dependency injection
const mockCalculator = jest.fn().mockReturnValue({ dcf: 100000, npv: 50000 });
service.setCalculators({ readyProperty: mockCalculator });
```

### 2. **Reusability**
```javascript
// Financial functions can be used anywhere
import { IRR } from './financial.js';

const myProjectIRR = IRR([-10000, 3000, 4000, 5000]);
const realEstateIRR = IRR(realEstateCashFlows);
```

### 3. **Maintainability**
- **One place to change**: Financial logic changes only in `financial.js`
- **No ripple effects**: Changes don't cascade through layers
- **Clear contracts**: Each function has well-defined inputs/outputs

### 4. **Extensibility**
```javascript
// Add new calculator type without touching existing code
class RealEstateCalculatorService {
  calculateLandInvestment(inputs) {
    return this.landCalculator(inputs);
  }
}
```

## Testing Strategy

### Unit Tests (Isolated)
```javascript
// Test pure functions in isolation
describe('Financial Functions', () => {
  test('PMT calculation', () => { /* ... */ });
  test('NPV calculation', () => { /* ... */ });
  test('IRR calculation', () => { /* ... */ });
});
```

### Integration Tests (Combined)
```javascript
// Test calculator business logic
describe('Ready Property Calculator', () => {
  test('complete investment calculation', () => {
    const results = calculateReadyPropertyInvestment(mockInputs);
    expect(results.dcf).toBeDefined();
    expect(results.npv).toBeDefined();
  });
});
```

### Service Tests (Orchestration)
```javascript
// Test service coordination
describe('Calculator Service', () => {
  test('calculates offplan with mortgage', () => {
    const results = service.calculateOffplanWithMortgage(
      offplanInputs,
      mortgageInputs
    );
    expect(results.recommendation).toBeDefined();
  });
});
```

## Migration Path

### Phase 1: ✅ Create New Architecture
- [x] Create `financial.js` with pure functions
- [x] Create `readyPropertyCalculator.js`
- [x] Create `offplanCalculatorRefactored.js`
- [x] Create `realEstateCalculatorService.js`
- [x] Create `useOffplanCalculatorRefactored.js`
- [x] Add unit tests for financial functions

### Phase 2: Integrate New Architecture
- [ ] Update components to use new hook
- [ ] Update service initialization in main.jsx
- [ ] Add backward compatibility layer

### Phase 3: Remove Legacy Code
- [ ] Remove `public/calculator.js`
- [ ] Remove old `useOffplanCalculator.js`
- [ ] Remove `src/services/calculator.js`
- [ ] Remove `window.RealEstateCalculator` global

### Phase 4: Expand Testing
- [ ] Add integration tests
- [ ] Add E2E tests
- [ ] Add test coverage reporting

## Code Examples

### Example 1: Adding a New Financial Function

```javascript
// src/lib/financial.js
export function calculateAPR(principal, rate, periods, fee) {
  const totalInterest = principal * rate * periods;
  const totalCost = totalInterest + fee;
  return (totalCost / principal) / periods;
}
```

### Example 2: Adding a New Calculator

```javascript
// src/lib/commercialPropertyCalculator.js
import { PMT, NPV_Excel, IRR } from './financial.js';

export function calculateCommercialProperty(inputs) {
  // Commercial property specific logic
  const tripleNetExpenses = calculateTripleNet(inputs);
  const capitalExpenditures = calculateCapEx(inputs);
  // ... rest of commercial logic

  return {
    noi: netOperatingIncome,
    capRate: calculateCapRate(noi, inputs.totalValue),
    // ... more results
  };
}
```

### Example 3: Using Service with Dependency Injection

```javascript
// In tests
import { RealEstateCalculatorService } from './realEstateCalculatorService.js';

const mockReadyProperty = jest.fn().mockReturnValue({
  dcf: 100000,
  npv: 50000
});

const service = new RealEstateCalculatorService();
service.setCalculators({ readyProperty: mockReadyProperty });

const result = service.calculateReadyProperty(inputs);
expect(mockReadyProperty).toHaveBeenCalledWith(inputs);
```

## Best Practices

1. **Keep functions pure**: No side effects, same input → same output
2. **Single purpose**: Each function does one thing well
3. **Dependency injection**: Pass dependencies, don't create them
4. **Interface contracts**: Clear input/output types
5. **Test at every layer**: Unit → Integration → E2E
6. **Documentation**: JSDoc comments for all public functions
7. **Semantic naming**: Function names describe what they do

## Performance Considerations

- **Pure functions** can be memoized for performance
- **Lazy loading** calculators only when needed
- **Parallel calculations** for independent metrics
- **Caching** service results for repeated queries

## Conclusion

This architecture provides a **solid foundation** for:
- ✅ Adding new calculator types
- ✅ Testing every layer independently
- ✅ Reusing financial functions across projects
- ✅ Maintaining code over time
- ✅ Onboarding new developers quickly

The separation of concerns ensures that changes in one layer don't affect others, making the codebase resilient to change.
