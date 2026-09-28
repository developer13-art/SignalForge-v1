/**
 * Currency Utilities
 *
 * @module server/utils/currency.util
 */

const CURRENCY_DECIMALS = Object.freeze({
  USD: 2,
  EUR: 2,
  GBP: 2,
  NGN: 2,
  GHS: 2,
  ZAR: 2,
  KES: 2,
  JPY: 0,
  CNY: 2,
  INR: 2,
  AUD: 2,
  CAD: 2,
  CHF: 2,
  BTC: 8,
  ETH: 8,
  SOL: 8,
  USDC: 6,
  USDT: 6,
});

export function getDecimals(currency) {
  if (!currency || typeof currency !== 'string') {
    return 2;
  }
  return CURRENCY_DECIMALS[currency.toUpperCase()] ?? 2;
}

export function roundAmount(amount, currency = 'USD') {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return null;
  }
  const decimals = getDecimals(currency);
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor) / factor;
}

export function sumAmounts(amounts, currency = 'USD') {
  if (!Array.isArray(amounts)) {
    return 0;
  }
  const total = amounts.reduce((acc, val) => {
    if (typeof val === 'number' && Number.isFinite(val)) {
      return acc + val;
    }
    return acc;
  }, 0);
  return roundAmount(total, currency);
}

export function isCryptoCurrency(currency) {
  if (!currency || typeof currency !== 'string') {
    return false;
  }
  return ['BTC', 'ETH', 'SOL', 'USDC', 'USDT'].includes(currency.toUpperCase());
}

export function formatAmount(amount, currency = 'USD') {
  const rounded = roundAmount(amount, currency);
  if (rounded === null) {
    return null;
  }
  const decimals = getDecimals(currency);
  return rounded.toFixed(decimals);
}

export function convertToUsd(amount, rate) {
  if (typeof amount !== 'number' || typeof rate !== 'number') {
    return null;
  }
  return roundAmount(amount * rate, 'USD');
}

export const currencyUtil = {
  getDecimals,
  roundAmount,
  sumAmounts,
  isCryptoCurrency,
  formatAmount,
  convertToUsd,
  CURRENCY_DECIMALS,
};