/**
 * Currency Formatter
 *
 * @module client/src/lib/formatters/currency.formatter
 */

const DEFAULT_CURRENCY = 'USD';
const DEFAULT_LOCALE = 'en-US';

const CURRENCY_SYMBOLS = {
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
};

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function formatCurrency(amount, currency = DEFAULT_CURRENCY, options = {}) {
  const num = toNumber(amount);
  if (num === null) {
    return '—';
  }

  const locale = options.locale || DEFAULT_LOCALE;
  const decimals = options.decimals ?? 2;
  const showSymbol = options.showSymbol !== false;
  const showSign = Boolean(options.showSign);
  const compact = Boolean(options.compact);

  const abs = Math.abs(num);
  const formatted = compact && abs >= 1000
    ? new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
      }).format(abs)
    : new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(abs);

  const symbol = showSymbol ? (CURRENCY_SYMBOLS[currency] || '') : '';
  const prefix = num < 0 ? '-' : showSign && num > 0 ? '+' : '';

  if (symbol.length <= 1) {
    return `${prefix}${symbol}${formatted}`;
  }
  return `${prefix}${formatted} ${symbol}`;
}

export function formatCompactCurrency(amount, currency = DEFAULT_CURRENCY) {
  return formatCurrency(amount, currency, { compact: true, decimals: 0 });
}

export function formatSignCurrency(amount, currency = DEFAULT_CURRENCY) {
  return formatCurrency(amount, currency, { showSign: true });
}

export function parseCurrency(input) {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : null;
  }
  if (typeof input !== 'string') {
    return null;
  }
  const cleaned = input.replace(/[^0-9.,\-+]/g, '').trim();
  if (!cleaned) {
    return null;
  }
  const normalized = cleaned.replace(/,/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getCurrencySymbol(currency = DEFAULT_CURRENCY) {
  return CURRENCY_SYMBOLS[currency] || currency;
}

export const currencyFormatter = {
  formatCurrency,
  formatCompactCurrency,
  formatSignCurrency,
  parseCurrency,
  getCurrencySymbol,
};