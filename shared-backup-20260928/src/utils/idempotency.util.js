/**
 * Idempotency Utilities
 *
 * Provides helpers for generating and validating idempotency keys to
 * prevent duplicate processing of messages, signals, and financial
 * operations.
 *
 * @module @signalforge/shared/utils/idempotency
 */const crypto = require('node:crypto');
const DEFAULT_SEPARATOR = ':';function buildIdempotencyKey(...parts) {
  if (parts.length === 0) {
    throw new Error('At least one part is required to build an idempotency key');
  }

  const normalized = parts.map((part) => {
    if (part === null || part === undefined) {
      return '';
    }
    return String(part).trim();
  });

  return normalized.join(DEFAULT_SEPARATOR);
}function buildSourceMessageKey(sourceType, sourceId, messageId) {
  if (!sourceType || !sourceId || !messageId) {
    throw new Error('sourceType, sourceId, and messageId are required');
  }
  return buildIdempotencyKey(
    String(sourceType).toLowerCase(),
    sourceId,
    messageId,
  );
}function buildTelegramMessageKey(channelId, messageId) {
  if (!channelId || !messageId) {
    throw new Error('channelId and messageId are required');
  }
  return `telegram:${channelId}:${messageId}`;
}function buildDiscordMessageKey(guildId, channelId, messageId) {
  if (!guildId || !channelId || !messageId) {
    throw new Error('guildId, channelId, and messageId are required');
  }
  return `discord:${guildId}:${channelId}:${messageId}`;
}function buildWhatsAppMessageKey(phoneNumberId, messageId) {
  if (!phoneNumberId || !messageId) {
    throw new Error('phoneNumberId and messageId are required');
  }
  return `whatsapp:${phoneNumberId}:${messageId}`;
}function buildEmailMessageKey(mailbox, messageId) {
  if (!mailbox || !messageId) {
    throw new Error('mailbox and messageId are required');
  }
  return `email:${mailbox}:${messageId}`;
}function buildTradingViewWebhookKey(alertId, timestamp) {
  if (!alertId || !timestamp) {
    throw new Error('alertId and timestamp are required');
  }
  return `tradingview:${alertId}:${timestamp}`;
}function buildExecutionIdempotencyKey(tradeId, attempt) {
  if (!tradeId) {
    throw new Error('tradeId is required');
  }
  return `execution:${tradeId}:${attempt || 1}`;
}function buildPaymentIdempotencyKey(userId, subscriptionId, period) {
  if (!userId || !subscriptionId || !period) {
    throw new Error('userId, subscriptionId, and period are required');
  }
  return `payment:${userId}:${subscriptionId}:${period}`;
}function buildReferralRewardKey(referrerId, referredUserId, period) {
  if (!referrerId || !referredUserId || !period) {
    throw new Error('referrerId, referredUserId, and period are required');
  }
  return `referral:${referrerId}:${referredUserId}:${period}`;
}function buildProvenanceKey(signalId, aiVersion) {
  if (!signalId || !aiVersion) {
    throw new Error('signalId and aiVersion are required');
  }
  return `provenance:${signalId}:${aiVersion}`;
}function buildAttestationKey(subjectType, subjectId, attestationType) {
  if (!subjectType || !subjectId || !attestationType) {
    throw new Error('subjectType, subjectId, and attestationType are required');
  }
  return `attestation:${subjectType}:${subjectId}:${attestationType}`;
}function parseIdempotencyKey(key) {
  if (typeof key !== 'string' || key.length === 0) {
    return null;
  }

  const parts = key.split(DEFAULT_SEPARATOR);
  if (parts.length < 2) {
    return null;
  }

  return {
    prefix: parts[0],
    parts: parts.slice(1),
    full: key,
  };
}function hashIdempotencyKey(key) {
  if (typeof key !== 'string' || key.length === 0) {
    throw new Error('Idempotency key must be a non-empty string');
  }
  return crypto.createHash('sha256').update(key).digest('hex');
}function shortenIdempotencyKey(key, maxLength = 64) {
  if (typeof key !== 'string') {
    return null;
  }
  if (key.length <= maxLength) {
    return key;
  }
  const hash = crypto.createHash('sha256').update(key).digest('hex').substring(0, 8);
  return `${key.substring(0, maxLength - 9)}-${hash}`;
}function generateIdempotencyToken() {
  return crypto.randomBytes(16).toString('hex');
}function isSameIdempotencyKey(keyA, keyB) {
  if (typeof keyA !== 'string' || typeof keyB !== 'string') {
    return false;
  }
  const bufferA = Buffer.from(keyA);
  const bufferB = Buffer.from(keyB);
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
}function isValidIdempotencyKey(key) {
  if (typeof key !== 'string') {
    return false;
  }
  if (key.length === 0 || key.length > 512) {
    return false;
  }
  return /^[a-zA-Z0-9:_\-./]+$/.test(key);
}const IDEMPOTENCY_CONSTRAINTS = Object.freeze({
  separator: DEFAULT_SEPARATOR,
  maxKeyLength: 512,
  tokenBytes: 16,
});

module.exports.buildIdempotencyKey = buildIdempotencyKey;
module.exports.buildSourceMessageKey = buildSourceMessageKey;
module.exports.buildTelegramMessageKey = buildTelegramMessageKey;
module.exports.buildDiscordMessageKey = buildDiscordMessageKey;
module.exports.buildWhatsAppMessageKey = buildWhatsAppMessageKey;
module.exports.buildEmailMessageKey = buildEmailMessageKey;
module.exports.buildTradingViewWebhookKey = buildTradingViewWebhookKey;
module.exports.buildExecutionIdempotencyKey = buildExecutionIdempotencyKey;
module.exports.buildPaymentIdempotencyKey = buildPaymentIdempotencyKey;
module.exports.buildReferralRewardKey = buildReferralRewardKey;
module.exports.buildProvenanceKey = buildProvenanceKey;
module.exports.buildAttestationKey = buildAttestationKey;
module.exports.parseIdempotencyKey = parseIdempotencyKey;
module.exports.hashIdempotencyKey = hashIdempotencyKey;
module.exports.shortenIdempotencyKey = shortenIdempotencyKey;
module.exports.generateIdempotencyToken = generateIdempotencyToken;
module.exports.isSameIdempotencyKey = isSameIdempotencyKey;
module.exports.isValidIdempotencyKey = isValidIdempotencyKey;
module.exports.crypto = crypto;
module.exports.DEFAULT_SEPARATOR = DEFAULT_SEPARATOR;
module.exports.IDEMPOTENCY_CONSTRAINTS = IDEMPOTENCY_CONSTRAINTS;
