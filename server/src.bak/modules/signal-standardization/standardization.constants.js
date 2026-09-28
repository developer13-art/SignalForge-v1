/**
 * Signal Standardization Constants
 *
 * @module signalforge/server/modules/signal-standardization/constants
 */

export const STANDARDIZATION_EVENTS = Object.freeze({
  STANDARDIZATION_STARTED: 'standardization.started',
  STANDARDIZATION_COMPLETED: 'standardization.completed',
  STANDARDIZATION_FAILED: 'standardization.failed',
  FINGERPRINT_COMPUTED: 'standardization.fingerprint.computed',
  DUPLICATE_FINGERPRINT_DETECTED: 'standardization.duplicate.detected',
  CANONICAL_FORM_APPLIED: 'standardization.canonical.applied',
});

export const STANDARD_SIGNAL_SCHEMA_VERSION = '1.0.0';

export const STANDARD_SIGNAL_REQUIRED_FIELDS = Object.freeze([
  'signalId',
  'providerId',
  'sourceType',
  'sourceId',
  'rawMessageId',
  'symbol',
  'direction',
  'entryType',
  'classification',
  'confidence',
  'timestamp',
]);

export const STANDARD_SIGNAL_OPTIONAL_FIELDS = Object.freeze([
  'channelId',
  'normalizedSymbol',
  'entryPrice',
  'stopLoss',
  'takeProfits',
  'riskPercent',
  'lotSize',
  'timeframe',
  'parserType',
  'parserVersion',
  'aiModel',
  'dnaVersion',
  'language',
  'originalText',
  'context',
  'expiresAt',
  'fingerprint',
  'metadata',
]);

export const FINGERPRINT_ALGORITHM = 'sha256';
export const FINGERPRINT_LENGTH = 64;
export const FINGERPRINT_PREFIX_LENGTH = 16;

export const DUPLICATE_WINDOW_SECONDS = 300;
export const DUPLICATE_SIMILARITY_THRESHOLD = 0.98;

export const MAX_STANDARDIZED_SIGNAL_SIZE_BYTES = 64 * 1024;