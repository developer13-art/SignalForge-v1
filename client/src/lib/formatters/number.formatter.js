/**
 * Number Formatter
 *
 * @module client/src/lib/formatters/number.formatter
 */

const DEFAULT_LOCALE = 'en-US';

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function formatNumber(value, options = {}) {
  const num = toNumber(value);
  if (num === null) {
    return '—';
  }

  const decimals = options.decimals ?? 2;
  const locale = options.locale || DEFAULT_LOCALE;
  const useGrouping = options.useGrouping !== false;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping,
  }).format(num);
}

export function formatCompactNumber(value, options = {}) {
  const num = toNumber(value);
  if (num === null) {
    return '—';
  }
  const locale = options.locale || DEFAULT_LOCALE;
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: options.decimals ?? 1,
  }).format(num);
}

export function formatPercent(value, options = {}) {
  const num = toNumber(value);
  if (num === null) {
    return '—';
  }

  const decimals = options.decimals ?? 2;
  const showSign = options.showSign !== false;
  const prefix = showSign && num > 0 ? '+' : '';
  return `${prefix}${num.toFixed(decimals)}%`;
}

export function formatRatio(value, options = {}) {
  const num = toNumber(value);
  if (num === null) {
    return '—';
  }
  const decimals = options.decimals ?? 2;
  return `${num.toFixed(decimals)} : 1`;
}

export function formatLatency(ms) {
  const num = toNumber(ms);
  if (num === null) {
    return '—';
  }
  if (num < 1000) {
    return `${Math.round(num)}ms`;
  }
  return `${(num / 1000).toFixed(2)}s`;
}

export function formatVolume(value) {
  const num = toNumber(value);
  if (num === null) {
    return '—';
  }
  return num.toFixed(2);
}

export function formatPrice(value, decimals = 5) {
  const num = toNumber(value);
  if (num === null) {
    return '—';
  }
  return num.toFixed(decimals);
}

export const numberFormatter = {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatRatio,
  formatLatency,
  formatVolume,
  formatPrice,
};