/**
 * Signal Standardization Constants
 *
 * @module signalforge/server/modules/signal-standardization/constants
 */
const STANDARDIZATION_EVENTS = Object.freeze({
  STANDARDIZATION_STARTED: 'standardization.started',
  STANDARDIZATION_COMPLETED: 'standardization.completed',
  STANDARDIZATION_FAILED: 'standardization.failed',
  FINGERPRINT_COMPUTED: 'standardization.fingerprint.computed',
  DUPLICATE_FINGERPRINT_DETECTED: 'standardization.duplicate.detected',
  CANONICAL_FORM_APPLIED: 'standardization.canonical.applied',
});
const STANDARD_SIGNAL_SCHEMA_VERSION = '1.0.0';
const STANDARD_SIGNAL_REQUIRED_FIELDS = Object.freeze([
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
const STANDARD_SIGNAL_OPTIONAL_FIELDS = Object.freeze([
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
const FINGERPRINT_ALGORITHM = 'sha256';
const FINGERPRINT_LENGTH = 64;
const FINGERPRINT_PREFIX_LENGTH = 16;
const DUPLICATE_WINDOW_SECONDS = 300;
const DUPLICATE_SIMILARITY_THRESHOLD = 0.98;
const MAX_STANDARDIZED_SIGNAL_SIZE_BYTES = 64 * 1024;
module.exports.STANDARDIZATION_EVENTS = STANDARDIZATION_EVENTS;
module.exports.STANDARD_SIGNAL_SCHEMA_VERSION = STANDARD_SIGNAL_SCHEMA_VERSION;
module.exports.STANDARD_SIGNAL_REQUIRED_FIELDS = STANDARD_SIGNAL_REQUIRED_FIELDS;
module.exports.STANDARD_SIGNAL_OPTIONAL_FIELDS = STANDARD_SIGNAL_OPTIONAL_FIELDS;
module.exports.FINGERPRINT_ALGORITHM = FINGERPRINT_ALGORITHM;
module.exports.FINGERPRINT_LENGTH = FINGERPRINT_LENGTH;
module.exports.FINGERPRINT_PREFIX_LENGTH = FINGERPRINT_PREFIX_LENGTH;
module.exports.DUPLICATE_WINDOW_SECONDS = DUPLICATE_WINDOW_SECONDS;
module.exports.DUPLICATE_SIMILARITY_THRESHOLD = DUPLICATE_SIMILARITY_THRESHOLD;
module.exports.MAX_STANDARDIZED_SIGNAL_SIZE_BYTES = MAX_STANDARDIZED_SIGNAL_SIZE_BYTES;
