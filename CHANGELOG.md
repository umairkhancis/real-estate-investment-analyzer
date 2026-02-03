# Changelog

## Latest Changes

### Changed Exit Value Input (Current)

**What Changed:**
- Input field changed from "Future Price per Sq Ft" to "Exit Value (Expected Sale Price)"
- Now accepts the total expected sale price directly instead of calculating it

**Why:**
- More intuitive - users typically think about exit price in total value, not per sq ft
- More flexible - works for properties where per-sq-ft pricing doesn't apply
- More direct - one less calculation step for users

**Before:**
```javascript
Input: Future Price per Sq Ft = 1400
Calculation: Exit Value = 1189 sq ft × 1400 = 1,664,600
```

**After:**
```javascript
Input: Exit Value = 1,664,600
Direct use: Terminal Value FV = 1,664,600
```

**Impact:**
- All calculations remain accurate
- All tests still pass (18/18)
- More user-friendly interface

---

## Previous Changes

### Fixed ROIC Calculation

**Date:** Earlier in session

**What Changed:**
- ROIC now includes rental income + property appreciation (was only property appreciation)
- New formula: `ROIC = (DCF / Invested Capital) - 1`
- Old formula: `ROIC = (Terminal PV - Invested Capital) / Invested Capital`

**Impact:**
- ROIC now properly responds to rental ROI changes
- More accurate representation of total investment return
- ROIC increased from 53.95% to 62.87% for test data

---

### Fixed Investment Status Logic

**Date:** Earlier in session

**What Changed:**
- Investment status now uses scoring system (3 out of 4 criteria)
- Fixed issue where good investments showed as "Poor"

**Before:**
- Marginal required exact ranges (e.g., DSCR 1.0-1.2)
- Investments between ranges defaulted to "Poor"

**After:**
- Great: All 4 criteria meet high standards
- Marginal: At least 3 out of 4 criteria meet minimum standards
- Poor: Less than 3 criteria meet minimum standards

---

### Added Acronym Descriptions

**Date:** Earlier in session

**What Changed:**
- All metric acronyms now show full descriptions
- NPV → NPV: Net Present Value
- DCF → DCF: Intrinsic Value
- IRR → IRR: Annual Rate of Return
- ROIC → ROIC: Return on Invested Capital
- DSCR → DSCR: Debt Service Coverage Ratio

---

### Fixed Cash Flow Visualization

**Date:** Earlier in session

**What Changed:**
- Exit year (Year 25) now shows nominal terminal value instead of discounted
- Visualization shows actual dollars received
- DCF calculations still use discounted values correctly

---

### Created Modular Architecture

**Date:** Earlier in session

**What Changed:**
- Separated business logic into `calculator.js`
- UI logic remains in `index.html`
- Created comprehensive test suite

**Benefits:**
- Easy to modify design without affecting calculations
- Easy to update formulas without affecting UI
- Reusable calculator module
- Fully tested and verified

---

## All Current Features

✅ 18 computation fields displayed
✅ All calculations verified against Excel
✅ 100% test coverage (18/18 tests passing)
✅ Investment status indicator with criteria breakdown
✅ Cash flow visualization (nominal values)
✅ Modular architecture (business logic separate from UI)
✅ Real-time calculations on input change
✅ Color-coded results
✅ Full metric descriptions
✅ Responsive design
✅ Direct exit value input
