/**
 * Rule-Based Classifier
 *
 * Uses weighted keyword scoring to classify incoming messages without
 * invoking the LLM. Runs in the Fast Path and is used as a pre-filter
 * before falling back to AI.
 *
 * @module signalforge/server/modules/signal-classification/classifiers/rule-based
 */

import { BaseClassifier } from './base.classifier.js';
import { CLASSIFICATION_TYPES, CLASSIFIER_KINDS } from '../classification.constants.js';
import {
  countStrongKeywords as tradeStrong,
  countMediumKeywords as tradeMedium,
  countWeakKeywords as tradeWeak,
  countSymbolHints,
} from '../keywords/trade-keywords.js';
import {
  countStrongKeywords as mgmtStrong,
  countMediumKeywords as mgmtMedium,
  countWeakKeywords as mgmtWeak,
} from '../keywords/management-keywords.js';
import {
  countStrongKeywords as analysisStrong,
  countMediumKeywords as analysisMedium,
  countWeakKeywords as analysisWeak,
} from '../keywords/analysis-keywords.js';
import {
  countConversationKeywords,
  countNewsKeywords,
  countEducationKeywords,
  countAdvertisementKeywords,
} from '../keywords/noise-keywords.js';

const WEIGHTS = Object.freeze({
  strongTrade: 0.35,
  mediumTrade: 0.15,
  weakTrade: 0.05,
  symbolHint: 0.2,
  strongMgmt: 0.35,
  mediumMgmt: 0.15,
  weakMgmt: 0.05,
  strongAnalysis: 0.3,
  mediumAnalysis: 0.15,
  weakAnalysis: 0.05,
  conversation: 0.3,
  news: 0.3,
  education: 0.3,
  advertisement: 0.3,
});

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export class RuleBasedClassifier extends BaseClassifier {
  constructor() {
    super(CLASSIFIER_KINDS.RULE_BASED, '1.0.0');
  }

  scoreTrade(text) {
    const strong = tradeStrong(text);
    const medium = tradeMedium(text);
    const weak = tradeWeak(text);
    const symbols = countSymbolHints(text);

    let score = 0;
    score += Math.min(strong * WEIGHTS.strongTrade, 0.7);
    score += Math.min(medium * WEIGHTS.mediumTrade, 0.35);
    score += Math.min(weak * WEIGHTS.weakTrade, 0.15);
    score += Math.min(symbols * WEIGHTS.symbolHint, 0.4);

    return {
      score: clamp(score),
      signals: { strong, medium, weak, symbols },
    };
  }

  scoreManagement(text) {
    const strong = mgmtStrong(text);
    const medium = mgmtMedium(text);
    const weak = mgmtWeak(text);

    let score = 0;
    score += Math.min(strong * WEIGHTS.strongMgmt, 0.7);
    score += Math.min(medium * WEIGHTS.mediumMgmt, 0.35);
    score += Math.min(weak * WEIGHTS.weakMgmt, 0.15);

    return { score: clamp(score), signals: { strong, medium, weak } };
  }

  scoreAnalysis(text) {
    const strong = analysisStrong(text);
    const medium = analysisMedium(text);
    const weak = analysisWeak(text);

    let score = 0;
    score += Math.min(strong * WEIGHTS.strongAnalysis, 0.6);
    score += Math.min(medium * WEIGHTS.mediumAnalysis, 0.3);
    score += Math.min(weak * WEIGHTS.weakAnalysis, 0.1);

    return { score: clamp(score), signals: { strong, medium, weak } };
  }

  scoreConversation(text) {
    const count = countConversationKeywords(text);
    return { score: clamp(count * WEIGHTS.conversation), signals: { count } };
  }

  scoreNews(text) {
    const count = countNewsKeywords(text);
    return { score: clamp(count * WEIGHTS.news), signals: { count } };
  }

  scoreEducation(text) {
    const count = countEducationKeywords(text);
    return { score: clamp(count * WEIGHTS.education), signals: { count } };
  }

  scoreAdvertisement(text) {
    const count = countAdvertisementKeywords(text);
    return { score: clamp(count * WEIGHTS.advertisement), signals: { count } };
  }

  async classify(message) {
    const start = Date.now();
    const text = message && typeof message.text === 'string' ? message.text : '';

    if (!text || text.trim().length === 0) {
      const result = this.buildResult(
        CLASSIFICATION_TYPES.UNKNOWN,
        0.3,
        null,
        { reason: 'empty_message' },
      );
      result.durationMs = Date.now() - start;
      return result;
    }

    const scores = {
      [CLASSIFICATION_TYPES.NEW_TRADE]: this.scoreTrade(text),
      [CLASSIFICATION_TYPES.TRADE_MANAGEMENT]: this.scoreManagement(text),
      [CLASSIFICATION_TYPES.MARKET_ANALYSIS]: this.scoreAnalysis(text),
      [CLASSIFICATION_TYPES.CONVERSATION]: this.scoreConversation(text),
      [CLASSIFICATION_TYPES.NEWS]: this.scoreNews(text),
      [CLASSIFICATION_TYPES.EDUCATION]: this.scoreEducation(text),
      [CLASSIFICATION_TYPES.ADVERTISEMENT]: this.scoreAdvertisement(text),
    };

    let best = CLASSIFICATION_TYPES.UNKNOWN;
    let bestScore = 0;
    const allScores = {};

    for (const [classification, result] of Object.entries(scores)) {
      allScores[classification] = {
        score: result.score,
        signals: result.signals,
      };
      if (result.score > bestScore) {
        bestScore = result.score;
        best = classification;
      }
    }

    if (bestScore < 0.25) {
      best = CLASSIFICATION_TYPES.UNKNOWN;
      bestScore = 0.3;
    }

    const result = this.buildResult(best, bestScore, allScores, null);
    result.durationMs = Date.now() - start;
    return result;
  }
}

export default RuleBasedClassifier;