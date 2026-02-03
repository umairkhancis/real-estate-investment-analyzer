#!/usr/bin/env python3
"""
Unit tests for Real Estate Investment Calculator
Verifies all calculations match Excel values from Real Estate Valuation (4).xlsx
"""

import subprocess
import json

# Excel test data
EXCEL_INPUTS = {
    'propertySize': 1189,
    'totalValue': 1560000,
    'downPaymentPercent': 20,
    'registrationFeePercent': 4,  # Land registration fee
    'tenure': 25,
    'discountRate': 4,
    'rentalROI': 6,
    'serviceChargesPerSqFt': 10,
    'exitValue': 1664600  # 1189 sq ft × 1400 per sq ft
}

EXCEL_EXPECTED = {
    'pricePerSqFt': 1312.026913,
    'downPaymentAmt': 312000,
    'landDeptFee': 62400,
    'agentFee': 31200,
    'annualRental': 93600,
    'annualServiceCharges': 11890,
    'netOperatingIncome': 81710,
    'investedCapital': 405600,
    'financingAmount': 1248000,
    'monthlyEMI': 6587.403767,
    'loanAmountAnnualized': 79048.8452,
    'netAnnualCashFlow': 2661.154797,
    'terminalValuePV': 624419.429,
    'dcf': 660585.3912,
    'npv': 254985.3912,
    'dscr': 1.033664689,
    'irr': 0.02596572182,
    'roic': 0.6286622071  # Updated: Now includes rental income + property appreciation
}

def run_calculator():
    """Run the calculator using Node.js"""
    # Create a temporary test file
    test_file = '/sessions/eager-jolly-bell/mnt/claude-workspace/real-estate-investment-analyzer/test_run.js'

    js_code = f"""
const RealEstateCalculator = require('./calculator.js');

const inputs = {json.dumps(EXCEL_INPUTS)};
const results = RealEstateCalculator.calculateInvestment(inputs);
console.log(JSON.stringify(results, null, 2));
"""

    with open(test_file, 'w') as f:
        f.write(js_code)

    result = subprocess.run(
        ['node', 'test_run.js'],
        capture_output=True,
        text=True,
        cwd='/sessions/eager-jolly-bell/mnt/claude-workspace/real-estate-investment-analyzer'
    )

    if result.returncode != 0:
        print(f"Error running calculator: {result.stderr}")
        return None

    return json.loads(result.stdout)

def assert_close(actual, expected, tolerance=0.01, field_name=''):
    """Check if actual is within tolerance of expected"""
    diff = abs(actual - expected)
    percent_diff = (diff / abs(expected)) * 100 if expected != 0 else diff
    passed = percent_diff <= tolerance

    return {
        'passed': passed,
        'actual': actual,
        'expected': expected,
        'diff': diff,
        'percent_diff': percent_diff,
        'field': field_name
    }

def run_tests():
    """Run all unit tests"""
    print("=" * 70)
    print("REAL ESTATE CALCULATOR UNIT TESTS")
    print("=" * 70)
    print()

    # Run calculator
    print("Running calculator with Excel inputs...")
    results = run_calculator()

    if not results:
        print("❌ Failed to run calculator")
        return

    print("✅ Calculator executed successfully\n")

    # Test each field
    tests = [
        ('Price per Sq Ft', 'pricePerSqFt'),
        ('Down Payment Amount', 'downPaymentAmt'),
        ('Dubai Land Department: 4%', 'landDeptFee'),
        ('Agent Commission: 2%', 'agentFee'),
        ('Rental Amount (Annualized)', 'annualRental'),
        ('Service Charges (Annualized)', 'annualServiceCharges'),
        ('Net Operating Profit (Annualized)', 'netOperatingIncome'),
        ('Invested Capital', 'investedCapital'),
        ('Financing Amount', 'financingAmount'),
        ('EMI', 'monthlyEMI'),
        ('Loan Amount (Annualized)', 'loanAmountAnnualized'),
        ('Net Cash Flow (Annualized)', 'netAnnualCashFlow'),
        ('Terminal Value (PV)', 'terminalValuePV'),
        ('DCF', 'dcf'),
        ('NPV', 'npv'),
        ('DSCR', 'dscr'),
        ('IRR', 'irr'),
        ('ROIC', 'roic'),
    ]

    passed_count = 0
    failed_count = 0
    failed_tests = []

    print("Running tests...\n")

    for name, key in tests:
        actual = results.get(key)
        expected = EXCEL_EXPECTED[key]

        if actual is None:
            print(f"❌ {name}: Field not found in results")
            failed_count += 1
            continue

        test_result = assert_close(actual, expected, tolerance=0.01, field_name=name)

        if test_result['passed']:
            print(f"✅ {name}")
            passed_count += 1
        else:
            print(f"❌ {name}")
            print(f"   Expected: {expected:.6f}")
            print(f"   Actual:   {actual:.6f}")
            print(f"   Diff:     {test_result['diff']:.6f} ({test_result['percent_diff']:.4f}%)")
            failed_count += 1
            failed_tests.append(test_result)

    # Summary
    print()
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    total = passed_count + failed_count
    print(f"Passed: {passed_count}/{total}")
    print(f"Failed: {failed_count}/{total}")

    if failed_count == 0:
        print("\n🎉 ALL TESTS PASSED!")
    else:
        print(f"\n⚠️  {failed_count} TEST(S) FAILED")
        print("\nFailed tests details:")
        for test in failed_tests:
            print(f"  - {test['field']}: {test['percent_diff']:.4f}% off")

    print()

if __name__ == '__main__':
    run_tests()
