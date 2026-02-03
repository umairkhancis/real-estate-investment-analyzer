/**
 * Format number as currency with AED symbol
 */
export function formatCurrency(amount) {
  return 'AED ' + Math.round(amount).toLocaleString('en-US');
}

/**
 * Format number with commas
 */
export function formatWithCommas(value) {
  const num = value.toString().replace(/,/g, '');
  if (isNaN(num) || num === '') return value;
  return parseFloat(num).toLocaleString('en-US');
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 2) {
  return (value * 100).toFixed(decimals) + '%';
}
