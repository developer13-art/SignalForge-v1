/**
 * Percentage Formatter
 *
 * @module client/src/lib/formatters/percent.formatter
 */

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
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

export function formatPercentChange(from, to, options = {}) {
  const fromNum = toNumber(from);
  const toNum = toNumber(to);
  if (fromNum === null || toNum === null || fromNum === 0) {
    return '—';
  }
  const change = ((toNum - fromNum) / Math.abs(fromNum)) * 100;
  return formatPercent(change, options);
}

export function formatWinRate(wins, total, options = {}) {
  const w = toNumber(wins);
  const t = toNumber(total);
  if (w === null || t === null || t === 0) {
    return '—';
  }
  const rate = (w / t) * 100;
  return `${rate.toFixed(options.decimals ?? 2)}%`;
}

export function getPercentTone(value) {
  const num = toNumber(value);
  if (num === null) {
    return 'neutral';
  }
  if (num > 0) {
    return 'positive';
  }
  if (num < 0) {
    return 'negative';
  }
  return 'neutral';
}

export const percentFormatter = {
  formatPercent,
  formatPercentChange,
  formatWinRate,
  getPercentTone,
};