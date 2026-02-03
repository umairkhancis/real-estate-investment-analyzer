import { getCurrencySymbol } from './currencies';

/**
 * Format number as currency with selected currency symbol
 */
export function formatCurrency(amount, currencyCode = 'AED') {
  const symbol = getCurrencySymbol(currencyCode);
  return symbol + ' ' + Math.round(amount).toLocaleString('en-US');
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
