/**
 * Trade Management Keywords
 *
 * @module signalforge/server/modules/signal-classification/keywords/management
 */

export const STRONG_MANAGEMENT_KEYWORDS = Object.freeze([
  'move stop loss to break even',
  'move sl to be',
  'move sl to breakeven',
  'move stop to breakeven',
  'secure profit',
  'secure profits',
  'close half',
  'close 50%',
  'close 30%',
  'close 70%',
  'partial close',
  'take partials',
  'close some',
  'close all',
  'close now',
  'close position',
  'close the trade',
  'exit now',
  'exit position',
  'trail stop',
  'trailing stop',
  'trail sl',
  'lock profit',
  'lock profits',
  'book profit',
  'book profits',
]);

export const MEDIUM_MANAGEMENT_KEYWORDS = Object.freeze([
  'close',
  'exit',
  'trail',
  'breakeven',
  'break even',
  'secure',
  'partial',
  'lock',
  'book',
  'reduce',
  'trim',
  'scale out',
  'scale in',
  'modify',
  'adjust',
]);

export const WEAK_MANAGEMENT_KEYWORDS = Object.freeze([
  'manage',
  'update',
  'change',
  'move',
  'adjustment',
]);

export function countStrongKeywords(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of STRONG_MANAGEMENT_KEYWORDS) {
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
  for (const keyword of MEDIUM_MANAGEMENT_KEYWORDS) {
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
  for (const keyword of WEAK_MANAGEMENT_KEYWORDS) {
    if (lower.includes(keyword)) {
      count++;
    }
  }
  return count;
}