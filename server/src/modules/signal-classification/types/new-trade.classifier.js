/**
 * New Trade Classifier
 *
 * Determines whether an incoming message contains a new trade signal.
 * Uses a combination of symbol detection, direction keyword matching,
 * and structural heuristics. Returns a classification result with a
 * confidence score.
 *
 * @module server/modules/signal-classification/types/new-trade.classifier
 */

import { SIGNAL_CLASSIFICATIONS } from '@signalforge/shared/constants/signal-classifications';
import { normalizeSymbol, SYMBOL_ALIASES, isForexSymbol, isMetalSymbol, isCryptoSymbol, isIndexSymbol } from '@signalforge/shared/validators/symbol.validator';

const DIRECTION_KEYWORDS = Object.freeze({
  BUY: ['buy', 'long', 'bullish', 'going up', 'upside', 'long position', 'enter long', 'comprar', 'compra', 'compra ya', 'long '],
  SELL: ['sell', 'short', 'bearish', 'going down', 'downside', 'short position', 'enter short', 'vender', 'venta', 'vende', 'short '],
});

const ENTRY_KEYWORDS = Object.freeze([
  'entry',
  'enter',
  'now',
  'market',
  'at',
  '@',
  'price',
  'execute',
  'take',
  'open',
  'abrir',
  'entrada',
]);

const RISK_KEYWORDS = Object.freeze([
  'sl',
  'stop',
  'stop loss',
  'stop-loss',
  'stoploss',
  'tp',
  'take profit',
  'take-profit',
  'takeprofit',
  'target',
  'targets',
  'risk',
  'profit',
]);

function tokenize(text) {
  if (typeof text !== 'string') {
    return [];
  }
  return text
    .toLowerCase()
    .replace(/[^\w\s@$%.,:/\-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function detectSymbols(text) {
  if (typeof text !== 'string') {
    return [];
  }

  const matches = new Set();
  const upper = text.toUpperCase();

  for (const alias of Object.keys(SYMBOL_ALIASES)) {
    const regex = new RegExp(`\\b${alias.replace(/[/\\]/g, '[/\\\\]')}\\b`, 'i');
    if (regex.test(upper)) {
      matches.add(SYMBOL_ALIASES[alias]);
    }
  }

  const forexPattern = /\b([A-Z]{3})[\/\-]?([A-Z]{3})\b/g;
  let match;
  while ((match = forexPattern.exec(upper)) !== null) {
    const candidate = `${match[1]}${match[2]}`;
    const normalized = normalizeSymbol(candidate);
    if (normalized) {
      matches.add(normalized);
    }
  }

  const indexPattern = /\b(US30|NAS100|SPX500|GER40|UK100|JP225|DJI|DAX|FTSE|NIKKEI|NASDAQ)\b/gi;
  while ((match = indexPattern.exec(upper)) !== null) {
    const normalized = normalizeSymbol(match[1]);
    if (normalized) {
      matches.add(normalized);
    }
  }

  return Array.from(matches);
}

function detectDirection(text) {
  if (typeof text !== 'string') {
    return null;
  }

  const lower = ` ${text.toLowerCase()} `;

  for (const [direction, keywords] of Object.entries(DIRECTION_KEYWORDS)) {
    for (const keyword of keywords) {
      const pattern = new RegExp(`\\b${keyword.trim()}\\b`, 'i');
      if (pattern.test(lower)) {
        return direction;
      }
    }
  }

  return null;
}

function countKeywordMatches(text, keywords) {
  if (typeof text !== 'string') {
    return 0;
  }

  const lower = text.toLowerCase();
  let count = 0;

  for (const keyword of keywords) {
    const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(lower)) {
      count++;
    }
  }

  return count;
}

function detectNumberStructure(text) {
  if (typeof text !== 'string') {
    return { hasNumbers: false, numberCount: 0, hasDecimal: false };
  }

  const numbers = text.match(/\b\d+(\.\d+)?\b/g) || [];
  const hasDecimal = numbers.some((n) => n.includes('.'));

  return {
    hasNumbers: numbers.length > 0,
    numberCount: numbers.length,
    hasDecimal,
  };
}

export function classify(message) {
  const text = message && typeof message.text === 'string' ? message.text : '';

  if (text.length === 0) {
    return {
      classification: SIGNAL_CLASSIFICATIONS.UNKNOWN,
      confidence: 0,
      reason: 'EMPTY_TEXT',
      signals: { symbols: [], direction: null, hasEntry: false, hasRisk: false, numberStructure: null },
    };
  }

  const symbols = detectSymbols(text);
  const direction = detectDirection(text);
  const entryMatches = countKeywordMatches(text, ENTRY_KEYWORDS);
  const riskMatches = countKeywordMatches(text, RISK_KEYWORDS);
  const numberStructure = detectNumberStructure(text);

  let confidence = 0;
  const reasons = [];

  if (symbols.length > 0) {
    confidence += 0.35;
    reasons.push('HAS_SYMBOL');
  }

  if (direction) {
    confidence += 0.3;
    reasons.push('HAS_DIRECTION');
  }

  if (entryMatches > 0) {
    confidence += 0.1;
    reasons.push('HAS_ENTRY_HINT');
  }

  if (riskMatches > 0) {
    confidence += 0.1;
    reasons.push('HAS_RISK_HINT');
  }

  if (numberStructure.hasDecimal && numberStructure.numberCount >= 2) {
    confidence += 0.15;
    reasons.push('HAS_PRICE_STRUCTURE');
  }

  confidence = Math.min(1, confidence);

  const isNewTrade =
    symbols.length > 0 &&
    direction !== null &&
    confidence >= 0.6;

  return {
    classification: isNewTrade ? SIGNAL_CLASSIFICATIONS.NEW_TRADE : SIGNAL_CLASSIFICATIONS.UNKNOWN,
    confidence: isNewTrade ? confidence : 0,
    reason: reasons.join(','),
    signals: {
      symbols,
      direction,
      entryMatches,
      riskMatches,
      numberStructure,
    },
  };
}

export function supports(message) {
  const result = classify(message);
  return result.classification === SIGNAL_CLASSIFICATIONS.NEW_TRADE;
}

export const NEW_TRADE_CLASSIFIER_KEYWORDS = Object.freeze({
  DIRECTION_KEYWORDS,
  ENTRY_KEYWORDS,
  RISK_KEYWORDS,
});