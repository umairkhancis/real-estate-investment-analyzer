/**
 * API Client Example
 *
 * Demonstrates how to use the REST API from Node.js
 */

// Using native fetch (Node 18+) or install node-fetch for older versions

const API_BASE_URL = 'http://localhost:3000';
const API_KEY = 'demo-key-12345';

async function calculateReadyProperty(inputs) {
  const response = await fetch(`${API_BASE_URL}/api/calculate/ready`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify(inputs)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.message}`);
  }

  return response.json();
}

async function calculateOffplan(inputs) {
  const response = await fetch(`${API_BASE_URL}/api/calculate/offplan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify(inputs)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.message}`);
  }

  return response.json();
}

async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('Real Estate Calculator - API Client Example');
  console.log('='.repeat(60));
  console.log();

  try {
    // Check API health
    console.log('Checking API health...');
    const health = await checkHealth();
    console.log(`✅ API Status: ${health.status}`);
    console.log();

    // Example 1: Ready Property
    console.log('📊 Calculating Ready Property...\n');

    const readyInputs = {
      propertySize: 850,
      totalValue: 850000,
      downPaymentPercent: 25,
      tenure: 25,
      rentalROI: 6,
      exitValue: 1020000
    };

    const readyResult = await calculateReadyProperty(readyInputs);
    const ready = readyResult.results;

    console.log('Results:');
    console.log(`  NPV: $${ready.npv.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
    console.log(`  IRR: ${(ready.irr * 100).toFixed(2)}%`);
    console.log(`  DSCR: ${ready.dscr.toFixed(2)}`);
    console.log(`  ROIC: ${(ready.roic * 100).toFixed(2)}%`);
    console.log();

    // Example 2: Off-Plan Property
    console.log('🏗️  Calculating Off-Plan Property...\n');

    const offplanInputs = {
      size: 500,
      totalValue: 500000,
      downPaymentPercent: 10,
      constructionTenureYears: 3,
      expectedValue: 600000
    };

    const offplanResult = await calculateOffplan(offplanInputs);
    const offplan = offplanResult.results;

    console.log('Results:');
    console.log(`  Total Paid: $${offplan.totalPaidDuringConstruction.toLocaleString()}`);
    console.log(`  NPV: $${offplan.npv.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
    console.log(`  IRR: ${(offplan.irr * 100).toFixed(2)}%`);
    console.log(`  ROIC: ${(offplan.roic * 100).toFixed(2)}%`);
    console.log();

    console.log('='.repeat(60));
    console.log('✅ All calculations completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error();
    console.error('Make sure the API server is running:');
    console.error('  cd packages/api && npm start');
    process.exit(1);
  }
}

main();
