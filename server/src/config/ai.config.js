/**
 * AI Configuration
 *
 * Configures the AI signal intelligence pipeline, including
 * classification, parsing, confidence scoring, and Provider DNA
 * learning behaviour.
 *
 * @module signalforge/server/config/ai
 */

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return ['true', '1', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}

const aiConfig = Object.freeze({
  classification: {
    enabled: true,
    minimumConfidence: toNumber(process.env.AI_CLASSIFICATION_MIN_CONFIDENCE, 0.7),
    fallbackToUnknown: toBoolean(process.env.AI_CLASSIFICATION_FALLBACK_UNKNOWN, true),
    ruleBasedFirst: toBoolean(process.env.AI_CLASSIFICATION_RULE_BASED_FIRST, true),
    aiThreshold: toNumber(process.env.AI_CLASSIFICATION_AI_THRESHOLD, 0.6),
  },

  parsing: {
    minimumConfidence: toNumber(
      process.env.AI_PARSING_MIN_CONFIDENCE,
      Number(process.env.SIGNAL_CONFIDENCE_THRESHOLD) || 0.8,
    ),
    lowConfidenceAction: process.env.AI_PARSING_LOW_CONFIDENCE_ACTION || 'REVIEW',
    requireSymbol: true,
    requireDirection: true,
    requireEntryForPending: true,
    allowMissingStopLoss: toBoolean(process.env.AI_PARSING_ALLOW_MISSING_SL, false),
    allowMissingTakeProfit: toBoolean(process.env.AI_PARSING_ALLOW_MISSING_TP, false),
  },

  providerDna: {
    enabled: toBoolean(process.env.PROVIDER_DNA_ENABLED, true),
    fastPathMinConfidence: toNumber(process.env.PROVIDER_DNA_FAST_PATH_MIN_CONFIDENCE, 0.9),
    learningPathMinConfidence: toNumber(process.env.PROVIDER_DNA_LEARNING_PATH_MIN_CONFIDENCE, 0.6),
    maxHistoricalMessages: toNumber(process.env.PROVIDER_DNA_MAX_HISTORICAL_MESSAGES, 1000),
    minHistoricalMessages: toNumber(process.env.PROVIDER_DNA_MIN_HISTORICAL_MESSAGES, 300),
    retrainIntervalHours: toNumber(process.env.PROVIDER_DNA_RETRAIN_INTERVAL_HOURS, 24),
    autoLearnThreshold: toNumber(process.env.PROVIDER_DNA_AUTO_LEARN_THRESHOLD, 5),
    versioning: {
      enabled: true,
      maxVersionsRetained: toNumber(process.env.PROVIDER_DNA_MAX_VERSIONS, 20),
    },
  },

  confidence: {
    defaultThreshold: toNumber(
      process.env.SIGNAL_CONFIDENCE_THRESHOLD,
      0.8,
    ),
    highConfidenceThreshold: toNumber(process.env.AI_HIGH_CONFIDENCE_THRESHOLD, 0.95),
    lowConfidenceThreshold: toNumber(process.env.AI_LOW_CONFIDENCE_THRESHOLD, 0.6),
    manualReviewQueue: toBoolean(process.env.AI_MANUAL_REVIEW_QUEUE, true),
  },

  consensus: {
    enabled: toBoolean(process.env.CONSENSUS_ENABLED, true),
    windowMinutes: toNumber(process.env.CONSENSUS_WINDOW_MINUTES, 5),
    minimumParticipants: toNumber(process.env.CONSENSUS_MIN_PARTICIPANTS, 2),
    minimumAgreement: toNumber(process.env.CONSENSUS_MIN_AGREEMENT, 0.6),
    highConfidenceThreshold: toNumber(process.env.CONSENSUS_HIGH_CONFIDENCE_THRESHOLD, 0.8),
    weighting: process.env.CONSENSUS_WEIGHTING || 'provider_reputation',
  },

  tradeMatching: {
    timeWindowMinutes: toNumber(process.env.TRADE_MATCHING_TIME_WINDOW_MINUTES, 30),
    symbolMatchRequired: true,
    ticketMatchRequired: false,
    replyReferenceWeight: toNumber(process.env.TRADE_MATCHING_REPLY_REFERENCE_WEIGHT, 0.4),
  },

  safety: {
    enabled: true,
    promptInjectionGuard: true,
    contentFilter: true,
    maxInputLength: toNumber(process.env.AI_SAFETY_MAX_INPUT_LENGTH, 8000),
    blocklistPatterns: [
      'ignore previous instructions',
      'system prompt',
      'reveal your prompt',
      'act as',
      'disregard all',
    ],
  },

  embeddings: {
    enabled: toBoolean(process.env.AI_EMBEDDINGS_ENABLED, true),
    model: process.env.AI_EMBEDDINGS_MODEL || 'text-embedding-3-small',
    dimensions: toNumber(process.env.AI_EMBEDDINGS_DIMENSIONS, 1536),
    similarityThreshold: toNumber(process.env.AI_EMBEDDINGS_SIMILARITY_THRESHOLD, 0.85),
  },

  caching: {
    enabled: toBoolean(process.env.AI_CACHE_ENABLED, true),
    ttlSeconds: toNumber(process.env.AI_CACHE_TTL_SECONDS, 3600),
    maxEntries: toNumber(process.env.AI_CACHE_MAX_ENTRIES, 10000),
  },

  metrics: {
    enabled: true,
    trackLatency: true,
    trackTokens: true,
    trackCost: true,
  },
});

export default aiConfig;