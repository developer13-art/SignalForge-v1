/**
 * Currency Utilities
 *
 * Provides currency formatting, conversion, and validation helpers used
 * across wallets, payments, and referral calculations.
 *
 * @module @signalforge/shared/utils/currency
 */

const DEFAULT_CURRENCY = 'USD';

const CURRENCY_SYMBOLS = Object.freeze({
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  GHS: '₵',
  ZAR: 'R',
  KES: 'KSh',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  BTC: '₿',
  ETH: 'Ξ',
  SOL: '◎',
});

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

const CRYPTO_CURRENCIES = Object.freeze(['BTC', 'ETH', 'SOL', 'USDC', 'USDT']);

export function isValidCurrency(currency) {
  if (typeof currency !== 'string') {
    return false;
  }
  const upper = currency.trim().toUpperCase();
  return /^[A-Z]{3,4}$/.test(upper);
}

export function normalizeCurrency(currency) {
  if (!isValidCurrency(currency)) {
    return null;
  }
  return currency.trim().toUpperCase();
}

export function getCurrencySymbol(currency) {
  const normalized = normalizeCurrency(currency);
  if (!normalized) {
    return null;
  }
  return CURRENCY_SYMBOLS[normalized] || normalized;
}

export function getCurrencyDecimals(currency) {
  const normalized = normalizeCurrency(currency);
  if (!normalized) {
    return 2;
  }
  return CURRENCY_DECIMALS[normalized] ?? 2;
}

export function isCryptoCurrency(currency) {
  const normalized = normalizeCurrency(currency);
  if (!normalized) {
    return false;
  }
  return CRYPTO_CURRENCIES.includes(normalized);
}

export function formatCurrency(amount, currency = DEFAULT_CURRENCY, options = {}) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return null;
  }

  const normalized = normalizeCurrency(currency);
  if (!normalized) {
    return null;
  }

  const decimals = options.decimals ?? getCurrencyDecimals(normalized);
  const symbol = options.showSymbol !== false ? getCurrencySymbol(normalized) : '';
  const locale = options.locale || 'en-US';
  const sign = options.showSign && amount > 0 ? '+' : '';

  const formatted = Math.abs(amount).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const prefix = amount < 0 ? '-' : sign;
  const suffix = options.showCode ? ` ${normalized}` : '';

  if (symbol.length <= 1) {
    return `${prefix}${symbol}${formatted}${suffix}`;
  }

  return `${prefix}${formatted} ${symbol}${suffix}`;
}

export function parseCurrencyAmount(input) {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : null;
  }

  if (typeof input !== 'string') {
    return null;
  }

  const cleaned = input.replace(/[^\d.,\-+]/g, '').trim();
  if (cleaned === '') {
    return null;
  }

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  let normalized = cleaned;
  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = cleaned.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    normalized = cleaned.replace(',', '.');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function roundCurrency(amount, currency = DEFAULT_CURRENCY) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return null;
  }
  const decimals = getCurrencyDecimals(currency);
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor) / factor;
}

export function sumCurrencyAmounts(amounts, currency = DEFAULT_CURRENCY) {
  if (!Array.isArray(amounts)) {
    return null;
  }
  const sum = amounts.reduce((acc, val) => {
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      return acc;
    }
    return acc + val;
  }, 0);
  return roundCurrency(sum, currency);
}

export function convertCurrency(amount, rate) {
  if (typeof amount !== 'number' || typeof rate !== 'number') {
    return null;
  }
  if (!Number.isFinite(amount) || !Number.isFinite(rate)) {
    return null;
  }
  return amount * rate;
}

export function calculatePercentage(amount, percentage) {
  if (typeof amount !== 'number' || typeof percentage !== 'number') {
    return null;
  }
  if (!Number.isFinite(amount) || !Number.isFinite(percentage)) {
    return null;
  }
  return (amount * percentage) / 100;
}

export function calculateFee(amount, feePercent) {
  return calculatePercentage(amount, feePercent);
}

export function calculateNetAmount(amount, feePercent) {
  const fee = calculateFee(amount, feePercent);
  if (fee === null) {
    return null;
  }
  return amount - fee;
}

export function allocateProportional(totalAmount, weights) {
  if (!Array.isArray(weights) || weights.length === 0) {
    return [];
  }

  const sum = weights.reduce((acc, w) => acc + (Number.isFinite(w) ? w : 0), 0);
  if (sum === 0) {
    const share = totalAmount / weights.length;
    return weights.map(() => share);
  }

  return weights.map((w) => (totalAmount * w) / sum);
}

export const CURRENCY_CONSTRAINTS = Object.freeze({
  defaultCurrency: DEFAULT_CURRENCY,
  supportedFiat: ['USD', 'EUR', 'GBP', 'NGN', 'GHS', 'ZAR', 'KES', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF'],
  supportedCrypto: ['SOL', 'USDC', 'USDT', 'BTC', 'ETH'],
  decimals: CURRENCY_DECIMALS,
  symbols: CURRENCY_SYMBOLS,
});