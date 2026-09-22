/**
 * Number Utilities
 *
 * Provides numeric helpers used across the SignalForge platform for
 * risk calculations, P/L computations, and metric formatting.
 *
 * @module @signalforge/shared/utils/number
 */

const DEFAULT_PRECISION = 8;

export function toNumber(input) {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : null;
  }

  if (typeof input === 'string') {
    const parsed = Number(input.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function round(value, precision = DEFAULT_PRECISION) {
  const num = toNumber(value);
  if (num === null) {
    return null;
  }
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}

export function floor(value, precision = 0) {
  const num = toNumber(value);
  if (num === null) {
    return null;
  }
  const factor = Math.pow(10, precision);
  return Math.floor(num * factor) / factor;
}

export function ceil(value, precision = 0) {
  const num = toNumber(value);
  if (num === null) {
    return null;
  }
  const factor = Math.pow(10, precision);
  return Math.ceil(num * factor) / factor;
}

export function clamp(value, min, max) {
  const num = toNumber(value);
  if (num === null) {
    return null;
  }
  if (num < min) {
    return min;
  }
  if (num > max) {
    return max;
  }
  return num;
}

export function sum(values) {
  if (!Array.isArray(values)) {
    return 0;
  }
  return values.reduce((acc, val) => {
    const num = toNumber(val);
    return acc + (num === null ? 0 : num);
  }, 0);
}

export function average(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const valid = values.filter((v) => toNumber(v) !== null);
  if (valid.length === 0) {
    return null;
  }
  const total = valid.reduce((acc, val) => acc + toNumber(val), 0);
  return total / valid.length;
}

export function median(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const valid = values
    .map((v) => toNumber(v))
    .filter((v) => v !== null)
    .sort((a, b) => a - b);

  if (valid.length === 0) {
    return null;
  }

  const mid = Math.floor(valid.length / 2);
  if (valid.length % 2 === 1) {
    return valid[mid];
  }
  return (valid[mid - 1] + valid[mid]) / 2;
}

export function standardDeviation(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const valid = values.map((v) => toNumber(v)).filter((v) => v !== null);
  if (valid.length === 0) {
    return null;
  }
  const mean = valid.reduce((acc, v) => acc + v, 0) / valid.length;
  const variance =
    valid.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / valid.length;
  return Math.sqrt(variance);
}

export function variance(values) {
  const stdDev = standardDeviation(values);
  return stdDev === null ? null : stdDev * stdDev;
}

export function min(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const valid = values.map((v) => toNumber(v)).filter((v) => v !== null);
  if (valid.length === 0) {
    return null;
  }
  return Math.min(...valid);
}

export function max(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const valid = values.map((v) => toNumber(v)).filter((v) => v !== null);
  if (valid.length === 0) {
    return null;
  }
  return Math.max(...valid);
}

export function percentageChange(from, to) {
  const fromNum = toNumber(from);
  const toNum = toNumber(to);
  if (fromNum === null || toNum === null || fromNum === 0) {
    return null;
  }
  return ((toNum - fromNum) / Math.abs(fromNum)) * 100;
}

export function percentOf(part, total) {
  const partNum = toNumber(part);
  const totalNum = toNumber(total);
  if (partNum === null || totalNum === null || totalNum === 0) {
    return null;
  }
  return (partNum / totalNum) * 100;
}

export function formatNumber(value, options = {}) {
  const num = toNumber(value);
  if (num === null) {
    return null;
  }

  const decimals = options.decimals ?? 2;
  const locale = options.locale || 'en-US';
  const useGrouping = options.useGrouping !== false;

  return num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping,
  });
}

export function formatCompact(value, options = {}) {
  const num = toNumber(value);
  if (num === null) {
    return null;
  }

  const locale = options.locale || 'en-US';

  return num.toLocaleString(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: options.decimals ?? 1,
  });
}

export function formatPercentage(value, options = {}) {
  const num = toNumber(value);
  if (num === null) {
    return null;
  }

  const decimals = options.decimals ?? 2;
  const showSign = options.showSign !== false;

  const prefix = showSign && num > 0 ? '+' : '';
  return `${prefix}${num.toFixed(decimals)}%`;
}

export function safeDivide(numerator, denominator, defaultValue = 0) {
  const num = toNumber(numerator);
  const den = toNumber(denominator);
  if (num === null || den === null || den === 0) {
    return defaultValue;
  }
  return num / den;
}

export function weightedAverage(values, weights) {
  if (!Array.isArray(values) || !Array.isArray(weights) || values.length !== weights.length) {
    return null;
  }

  const totalWeight = weights.reduce((acc, w) => acc + (toNumber(w) || 0), 0);
  if (totalWeight === 0) {
    return null;
  }

  const weightedSum = values.reduce((acc, v, i) => {
    const num = toNumber(v);
    const weight = toNumber(weights[i]) || 0;
    return acc + (num === null ? 0 : num * weight);
  }, 0);

  return weightedSum / totalWeight;
}

export function normalize(value, minValue, maxValue) {
  const num = toNumber(value);
  const minNum = toNumber(minValue);
  const maxNum = toNumber(maxValue);

  if (num === null || minNum === null || maxNum === null || minNum === maxNum) {
    return null;
  }

  return (num - minNum) / (maxNum - minNum);
}

export function isBetween(value, minValue, maxValue, inclusive = true) {
  const num = toNumber(value);
  if (num === null) {
    return false;
  }
  if (inclusive) {
    return num >= minValue && num <= maxValue;
  }
  return num > minValue && num < maxValue;
}

export function calculateRiskRewardRatio(risk, reward) {
  const riskNum = toNumber(risk);
  const rewardNum = toNumber(reward);
  if (riskNum === null || rewardNum === null || riskNum === 0) {
    return null;
  }
  return Math.abs(rewardNum / riskNum);
}

export function calculateWinRate(wins, total) {
  const winsNum = toNumber(wins);
  const totalNum = toNumber(total);
  if (winsNum === null || totalNum === null || totalNum === 0) {
    return null;
  }
  return (winsNum / totalNum) * 100;
}

export function calculateProfitFactor(grossProfit, grossLoss) {
  const profitNum = toNumber(grossProfit);
  const lossNum = toNumber(grossLoss);
  if (profitNum === null || lossNum === null) {
    return null;
  }
  if (lossNum === 0) {
    return profitNum > 0 ? Infinity : 0;
  }
  return Math.abs(profitNum / lossNum);
}

export function calculateSharpeRatio(returns, riskFreeRate = 0) {
  if (!Array.isArray(returns) || returns.length < 2) {
    return null;
  }

  const validReturns = returns.map((r) => toNumber(r)).filter((r) => r !== null);
  if (validReturns.length < 2) {
    return null;
  }

  const meanReturn = validReturns.reduce((acc, r) => acc + r, 0) / validReturns.length;
  const stdDev = standardDeviation(validReturns);

  if (stdDev === null || stdDev === 0) {
    return null;
  }

  return (meanReturn - riskFreeRate) / stdDev;
}

export function calculateSortinoRatio(returns, riskFreeRate = 0) {
  if (!Array.isArray(returns) || returns.length < 2) {
    return null;
  }

  const validReturns = returns.map((r) => toNumber(r)).filter((r) => r !== null);
  if (validReturns.length < 2) {
    return null;
  }

  const meanReturn = validReturns.reduce((acc, r) => acc + r, 0) / validReturns.length;

  const negativeReturns = validReturns.filter((r) => r < riskFreeRate);
  if (negativeReturns.length === 0) {
    return null;
  }

  const downsideVariance =
    negativeReturns.reduce((acc, r) => acc + Math.pow(r - riskFreeRate, 2), 0) /
    validReturns.length;
  const downsideDeviation = Math.sqrt(downsideVariance);

  if (downsideDeviation === 0) {
    return null;
  }

  return (meanReturn - riskFreeRate) / downsideDeviation;
}

export function calculateMaxDrawdown(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  const valid = values.map((v) => toNumber(v)).filter((v) => v !== null);
  if (valid.length === 0) {
    return null;
  }

  let peak = valid[0];
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;

  for (const value of valid) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = peak - value;
    const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
    if (drawdownPercent > maxDrawdownPercent) {
      maxDrawdownPercent = drawdownPercent;
    }
  }

  return {
    absolute: maxDrawdown,
    percent: maxDrawdownPercent,
  };
}

export const NUMBER_CONSTRAINTS = Object.freeze({
  defaultPrecision: DEFAULT_PRECISION,
  maxSafeInteger: Number.MAX_SAFE_INTEGER,
  minSafeInteger: Number.MIN_SAFE_INTEGER,
});