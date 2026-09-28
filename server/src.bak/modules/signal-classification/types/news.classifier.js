/**
 * News Classifier
 *
 * Determines whether a message contains market news or economic event
 * announcements. News messages typically mention specific data
 * releases, central banks, or scheduled events.
 *
 * @module server/modules/signal-classification/types/news.classifier
 */

import { SIGNAL_CLASSIFICATIONS } from '@signalforge/shared/constants/signal-classifications';

const NEWS_INDICATORS = Object.freeze([
  'news',
  'breaking',
  'report',
  'released',
  'release',
  'announcement',
  'announced',
  'published',
  'statement',
  'press',
  'forecast',
  'actual',
  'previous',
  'estimates',
  'revised',
  'revised',
  'expected',
  'cpi',
  'ppi',
  'nfp',
  'gdp',
  'pmi',
  'fomc',
  'ecb',
  'boe',
  'boj',
  'rba',
  'fed',
  'federal reserve',
  'non-farm',
  'nonfarm',
  'unemployment',
  'inflation',
  'interest rate',
  'rate decision',
  'rate hike',
  'rate cut',
  'noticia',
  'noticias',
  'reporte',
  'comunicado',
  'inflacion',
  'tasa de interes',
]);

const NEWS_PATTERNS = Object.freeze([
  /\bbreaking\s*(news|:)/i,
  /\baccording\s+to\b/i,
  /\bsources\s+say\b/i,
  /\breported\s+(that|by)\b/i,
  /\bdata\s+shows?\b/i,
  /\beconomic\s+calendar\b/i,
  /\bnews\s+release\b/i,
  /\bpress\s+release\b/i,
  /\bat\s+\d{1,2}:\d{2}\s*(am|pm)?\s*(gmt|utc|est|edt)?/i,
  /\bheadline\b/i,
]);

function countIndicators(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const word of NEWS_INDICATORS) {
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(lower)) {
      count++;
    }
  }
  return count;
}

function countPatterns(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  let count = 0;
  for (const pattern of NEWS_PATTERNS) {
    if (pattern.test(text)) {
      count++;
    }
  }
  return count;
}

function hasTimeReference(text) {
  if (typeof text !== 'string') {
    return false;
  }
  return /\b\d{1,2}:\d{2}\b/.test(text) || /\b(today|tomorrow|this week|next week)\b/i.test(text);
}

export function classify(message) {
  const text = message && typeof message.text === 'string' ? message.text : '';

  if (text.length === 0) {
    return {
      classification: SIGNAL_CLASSIFICATIONS.UNKNOWN,
      confidence: 0,
      reason: 'EMPTY_TEXT',
      signals: { indicatorCount: 0, patternCount: 0 },
    };
  }

  const indicatorCount = countIndicators(text);
  const patternCount = countPatterns(text);
  const hasTime = hasTimeReference(text);

  let confidence = 0;
  const reasons = [];

  if (indicatorCount >= 3) {
    confidence += 0.5;
    reasons.push('MANY_NEWS_INDICATORS');
  } else if (indicatorCount >= 1) {
    confidence += 0.2;
    reasons.push('SOME_NEWS_INDICATORS');
  }

  if (patternCount >= 2) {
    confidence += 0.4;
    reasons.push('MULTIPLE_NEWS_PATTERNS');
  } else if (patternCount === 1) {
    confidence += 0.2;
    reasons.push('SINGLE_NEWS_PATTERN');
  }

  if (hasTime && indicatorCount >= 2) {
    confidence += 0.15;
    reasons.push('TIME_REFERENCE_WITH_INDICATORS');
  }

  confidence = Math.min(1, confidence);

  const isNews = confidence >= 0.5;

  return {
    classification: isNews ? SIGNAL_CLASSIFICATIONS.NEWS : SIGNAL_CLASSIFICATIONS.UNKNOWN,
    confidence: isNews ? confidence : 0,
    reason: reasons.join(','),
    signals: { indicatorCount, patternCount, hasTime },
  };
}

export function supports(message) {
  const result = classify(message);
  return result.classification === SIGNAL_CLASSIFICATIONS.NEWS;
}

export const NEWS_INDICATORS = NEWS_INDICATORS;