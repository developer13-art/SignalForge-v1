/**
 * Signal Type Definitions
 *
 * Provides JSDoc typedefs for signal-related objects used throughout
 * the SignalForge signal pipeline.
 *
 * @module @signalforge/shared/types/signal
 */

/**
 * @typedef {Object} RawMessage
 * @property {string} id - Internal message id
 * @property {string} externalMessageId - Id from the source platform
 * @property {string} sourceType - Source type (TELEGRAM, DISCORD, etc.)
 * @property {string} sourceId - Source connection id
 * @property {string} providerId - Provider id
 * @property {string|null} channelId - Channel or group id
 * @property {string} text - Raw message text
 * @property {Array<{type: string, url: string}>} [media] - Attached media
 * @property {string|null} replyTo - Id of the message being replied to
 * @property {boolean} edited - Whether the message was edited
 * @property {boolean} deleted - Whether the message was deleted
 * @property {string} timestamp - ISO timestamp
 * @property {Object|null} rawPayload - Encrypted raw payload
 */

/**
 * @typedef {Object} ClassificationResult
 * @property {string} classification - One of SIGNAL_CLASSIFICATIONS values
 * @property {number} confidence - Classification confidence 0 to 1
 * @property {string} classifierType - Classifier used (RULE_BASED, AI, HYBRID)
 * @property {string} classifierVersion - Version of the classifier
 * @property {number} durationMs - Time taken in milliseconds
 * @property {Object|null} metadata - Additional classifier metadata
 */

/**
 * @typedef {Object} StandardizedSignal
 * @property {string} signalId
 * @property {string} providerId
 * @property {string} sourceType
 * @property {string} sourceId
 * @property {string} rawMessageId
 * @property {string|null} channelId
 * @property {string} symbol
 * @property {string|null} normalizedSymbol
 * @property {string} direction
 * @property {string} entryType
 * @property {number|null} entryPrice
 * @property {number|null} stopLoss
 * @property {Array<number>} takeProfits
 * @property {number|null} riskPercent
 * @property {number|null} lotSize
 * @property {string|null} timeframe
 * @property {string} classification
 * @property {number} confidence
 * @property {string} parserType
 * @property {string|null} parserVersion
 * @property {string|null} aiModel
 * @property {string|null} dnaVersion
 * @property {string|null} language
 * @property {string|null} originalText
 * @property {Object|null} context
 * @property {string} timestamp
 * @property {string|null} expiresAt
 * @property {string|null} fingerprint
 * @property {Object|null} metadata
 */

/**
 * @typedef {Object} SignalParse
 * @property {string} parseId
 * @property {string} signalId
 * @property {string} parserType
 * @property {string} parserVersion
 * @property {number} confidenceScore
 * @property {string|null} aiModel
 * @property {string|null} aiVersion
 * @property {number} latencyMs
 * @property {Object|null} extractedFields
 * @property {Object|null} metadata
 */

/**
 * @typedef {Object} ProviderDnaRule
 * @property {string} ruleId
 * @property {string} providerId
 * @property {string} ruleType
 * @property {string} matchType
 * @property {string} pattern
 * @property {boolean} caseSensitive
 * @property {number} priority
 * @property {Object} action
 * @property {number} confidence
 * @property {number} usageCount
 * @property {number} successCount
 * @property {boolean} enabled
 */

/**
 * @typedef {Object} SignalFingerprint
 * @property {string} fingerprintId
 * @property {string} signalId
 * @property {string} hash
 * @property {string} providerId
 * @property {string} symbol
 * @property {string} direction
 * @property {string} window
 * @property {string} createdAt
 */

/**
 * @typedef {Object} SignalConsensus
 * @property {string} consensusId
 * @property {string} symbol
 * @property {string} direction
 * @property {number} agreementScore
 * @property {number} confidenceScore
 * @property {string} result
 * @property {number} participantCount
 * @property {string} windowStart
 * @property {string} windowEnd
 * @property {string} createdAt
 */

/**
 * @typedef {Object} SignalConsensusMember
 * @property {string} memberId
 * @property {string} consensusId
 * @property {string} signalId
 * @property {string} providerId
 * @property {string} direction
 * @property {number} weight
 * @property {string} createdAt
 */

export const SIGNAL_TYPES = Object.freeze({
  RawMessage: 'RawMessage',
  ClassificationResult: 'ClassificationResult',
  StandardizedSignal: 'StandardizedSignal',
  SignalParse: 'SignalParse',
  ProviderDnaRule: 'ProviderDnaRule',
  SignalFingerprint: 'SignalFingerprint',
  SignalConsensus: 'SignalConsensus',
  SignalConsensusMember: 'SignalConsensusMember',
});