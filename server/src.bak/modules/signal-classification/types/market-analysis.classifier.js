/**
 * Market Analysis Classifier
 *
 * Determines whether an incoming message contains market analysis or
 * commentary. Analysis messages typically include words like "looks
 * bullish", "expecting", "bias", "watching", or timeframe analysis
 * without an explicit entry.
 *
 * @module server/modules/signal-classification/types/market-analysis.classifier
 */

import { SIGNAL_CLASSIFICATIONS } from '@signalforge/shared/constants/signal-classifications';

const ANALYSIS_INDICATORS = Object.freeze([
  'analysis',
  'looking',
  'watch',
  'watching',
  'bias',
  'expect',
  'expecting',
  'expectation',
  'outlook',
  'view',
  'perspective',
  'opinion',
  'think',
  'believe',
  'consider',
  'potential',
  'possible',
  'likely',
  'probably',
  'could',
  'might',
  'may',
  'seems',
  'appears',
  'trend',
  'structure',
  'support',
  'resistance',
  'zone',
  'range',
  'breakout',
  'breakdown',
  'retracement',
  'pullback',
  'reversal',
  'consolidation',
  'momentum',
  'volatility',
  'liquid',
  'order block',
  'fair value gap',
  'imbalance',
  'analisis',
  'mirando',
  'observando',
  'bias',
  'esperando',
  'oportunidad',
]);

const STRONG_ANALYSIS_PHRASES = Object.freeze([
  /\bif\s+price\b/i,
  /\bwhen\s+price\b/i,
  /\bexpect(ing)?\s+(a|an)\b/i,
  /\bwatch(ing)?\s+for\b/i,
  /\bwaiting\s+for\b/i,
  /\blooking\s+for\b/i,
  /\bin\s+my\s+(opinion|view)\b/i,
  /\bi\s+think\b/i,
  /\bi\s+believe\b/i,
  /\bmarket\s+update\b/i,
  /\bweek(ly)?\s+(analysis|outlook)\b/i,
  /\bdaily\s+(analysis|bias)\b/i,
]);

function countAnalysisIndicators(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const word of ANALYSIS_INDICATORS) {
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(lower)) {
      count++;
    }
  }
  return count;
}

function countStrongPhrases(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  let count = 0;
  for (const pattern of STRONG_ANALYSIS_PHRASES) {
    if (pattern.test(text)) {
      count++;
    }
  }
  return count;
}

function hasExecutionLanguage(text) {
  if (typeof text !== 'string') {
    return false;
  }
  const executionPatterns = [
    /\benter\s+now\b/i,
    /\bbuy\s+now\b/i,
    /\bsell\s+now\b/i,
    /\bexecut(e|ing)\b/i,
    /\bmarket\s+order\b/i,
    /\bplace\s+(the\s+)?order\b/i,
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
      signals: { indicatorCount: 0, phraseCount: 0 },
    };
  }

  const indicatorCount = countAnalysisIndicators(text);
  const phraseCount = countStrongPhrases(text);
  const hasExecution = hasExecutionLanguage(text);

  if (hasExecution) {
    return {
      classification: SIGNAL_CLASSIFICATIONS.UNKNOWN,
      confidence: 0,
      reason: 'HAS_EXECUTION_LANGUAGE',
      signals: { indicatorCount, phraseCount, hasExecution },
    };
  }

  let confidence = 0;
  const reasons = [];

  if (indicatorCount >= 3) {
    confidence += 0.5;
    reasons.push('MANY_ANALYSIS_INDICATORS');
  } else if (indicatorCount >= 1) {
    confidence += 0.25;
    reasons.push('SOME_ANALYSIS_INDICATORS');
  }

  if (phraseCount >= 2) {
    confidence += 0.4;
    reasons.push('STRONG_ANALYSIS_PHRASES');
  } else if (phraseCount === 1) {
    confidence += 0.2;
    reasons.push('SINGLE_ANALYSIS_PHRASE');
  }

  if (text.length > 200) {
    confidence += 0.1;
    reasons.push('LONG_MESSAGE');
  }

  confidence = Math.min(1, confidence);

  const isAnalysis = confidence >= 0.5;

  return {
    classification: isAnalysis ? SIGNAL_CLASSIFICATIONS.MARKET_ANALYSIS : SIGNAL_CLASSIFICATIONS.UNKNOWN,
    confidence: isAnalysis ? confidence : 0,
    reason: reasons.join(','),
    signals: { indicatorCount, phraseCount, hasExecution },
  };
}

export function supports(message) {
  const result = classify(message);
  return result.classification === SIGNAL_CLASSIFICATIONS.MARKET_ANALYSIS;
}

export const MARKET_ANALYSIS_INDICATORS = ANALYSIS_INDICATORS;