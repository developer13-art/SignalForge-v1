/**
 * Education Classifier
 *
 * Determines whether a message contains educational or tutorial
 * content. Educational messages typically explain concepts, strategies,
 * or terminology rather than issuing a trade.
 *
 * @module server/modules/signal-classification/types/education.classifier
 */

import { SIGNAL_CLASSIFICATIONS } from '@signalforge/shared/constants/signal-classifications';

const EDUCATION_INDICATORS = Object.freeze([
  'lesson',
  'tutorial',
  'guide',
  'how to',
  'howto',
  'explained',
  'explanation',
  'learn',
  'learning',
  'education',
  'educate',
  'course',
  'training',
  'study',
  'understanding',
  'concept',
  'strategy',
  'technique',
  'method',
  'rule',
  'rules',
  'principle',
  'principles',
  'mistake',
  'mistakes',
  'tip',
  'tips',
  'advice',
  'beginner',
  'advanced',
  'intermediate',
  'basics',
  'fundamentals',
  'aprende',
  'aprender',
  'curso',
  'tutorial',
  'leccion',
  'estrategia',
  'explicacion',
]);

const EDUCATION_PATTERNS = Object.freeze([
  /\bhow\s+to\b/i,
  /\blet\s+me\s+(explain|teach|show)\b/i,
  /\btoday'?s?\s+lesson\b/i,
  /\bin\s+this\s+(lesson|video|guide|post)\b/i,
  /\bremember\s+that\b/i,
  /\bhere\s+is\s+(how|why|what)\b/i,
  /\bimportant\s+to\s+(know|remember|understand)\b/i,
  /\bcommon\s+mistakes?\b/i,
  /\bbeginners?\s+(guide|tip|mistake)\b/i,
  /\bstrategy\s+(guide|explained)\b/i,
]);

function countIndicators(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const word of EDUCATION_INDICATORS) {
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
  for (const pattern of EDUCATION_PATTERNS) {
    if (pattern.test(text)) {
      count++;
    }
  }
  return count;
}

function hasTradeExecution(text) {
  if (typeof text !== 'string') {
    return false;
  }
  const executionPatterns = [
    /\benter\s+now\b/i,
    /\bbuy\s+(at|now|gold|eur|gbp|usd|xau)/i,
    /\bsell\s+(at|now|gold|eur|gbp|usd|xau)/i,
    /\bentry\s*[:=]/i,
    /\bsl\s*[:=]/i,
    /\btp\s*[:=]/i,
  ];
  return executionPatterns.some((p) => p.test(text));
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

  const hasTrade = hasTradeExecution(text);

  if (hasTrade) {
    return {
      classification: SIGNAL_CLASSIFICATIONS.UNKNOWN,
      confidence: 0,
      reason: 'HAS_TRADE_EXECUTION',
      signals: { indicatorCount: 0, patternCount: 0, hasTrade },
    };
  }

  const indicatorCount = countIndicators(text);
  const patternCount = countPatterns(text);

  let confidence = 0;
  const reasons = [];

  if (indicatorCount >= 3) {
    confidence += 0.5;
    reasons.push('MANY_EDUCATION_INDICATORS');
  } else if (indicatorCount >= 1) {
    confidence += 0.2;
    reasons.push('SOME_EDUCATION_INDICATORS');
  }

  if (patternCount >= 2) {
    confidence += 0.4;
    reasons.push('MULTIPLE_EDUCATION_PATTERNS');
  } else if (patternCount === 1) {
    confidence += 0.25;
    reasons.push('SINGLE_EDUCATION_PATTERN');
  }

  if (text.length > 400 && indicatorCount >= 2) {
    confidence += 0.1;
    reasons.push('LONG_EDUCATIONAL_CONTENT');
  }

  confidence = Math.min(1, confidence);

  const isEducation = confidence >= 0.5;

  return {
    classification: isEducation ? SIGNAL_CLASSIFICATIONS.EDUCATION : SIGNAL_CLASSIFICATIONS.UNKNOWN,
    confidence: isEducation ? confidence : 0,
    reason: reasons.join(','),
    signals: { indicatorCount, patternCount, hasTrade },
  };
}

export function supports(message) {
  const result = classify(message);
  return result.classification === SIGNAL_CLASSIFICATIONS.EDUCATION;
}

export const EDUCATION_INDICATORS = EDUCATION_INDICATORS;