/**
 * Market Analysis Keywords
 *
 * @module signalforge/server/modules/signal-classification/keywords/analysis
 */

export const STRONG_ANALYSIS_KEYWORDS = Object.freeze([
  'market analysis',
  'technical analysis',
  'fundamental analysis',
  'daily analysis',
  'weekly analysis',
  'monthly analysis',
  'weekly outlook',
  'daily outlook',
  'market outlook',
  'price action analysis',
  'support and resistance',
  'key levels',
  'key zones',
  'breakout watch',
  'range bound',
  'trend analysis',
  'chart analysis',
  'my view',
  'my bias',
  'bias:',
  'bias ',
  'outlook for',
]);

export const MEDIUM_ANALYSIS_KEYWORDS = Object.freeze([
  'analysis',
  'outlook',
  'review',
  'chart',
  'pattern',
  'structure',
  'consolidation',
  'support',
  'resistance',
  'liquidity',
  'imbalance',
  'orderblock',
  'order block',
  'fair value gap',
  'fvg',
  'trend',
  'range',
  'momentum',
  'reversal',
  'pullback',
  'retracement',
]);

export const WEAK_ANALYSIS_KEYWORDS = Object.freeze([
  'watch',
  'watchlist',
  'monitor',
  'consider',
  'think',
  'may',
  'might',
  'could',
]);

export function countStrongKeywords(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of STRONG_ANALYSIS_KEYWORDS) {
    if (lower.includes(keyword)) {
      count++;
    }
  }
  return count;
}

export function countMediumKeywords(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of MEDIUM_ANALYSIS_KEYWORDS) {
    if (lower.includes(keyword)) {
      count++;
    }
  }
  return count;
}

export function countWeakKeywords(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of WEAK_ANALYSIS_KEYWORDS) {
    if (lower.includes(keyword)) {
      count++;
    }
  }
  return count;
}