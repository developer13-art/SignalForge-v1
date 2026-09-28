/**
 * Discord Validator
 *
 * Provides validation for Discord-related requests including guild
 * identifiers, channel identifiers, OAuth payloads, and webhook
 * signatures.
 *
 * @module server/modules/signal-sources/discord/discord.validator
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';

const SNOWFLAKE_REGEX = /^\d{17,20}$/;
const MAX_CHANNELS_PER_REQUEST = 500;
const MAX_GUILDS_PER_REQUEST = 200;
const MAX_WEBHOOK_URL_LENGTH = 512;
const MAX_SIGNATURE_LENGTH = 256;

export function validateSnowflake(value, fieldName = 'id') {
  if (!value) {
    throw new AppError(`${fieldName} is required`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const asString = String(value).trim();

  if (!SNOWFLAKE_REGEX.test(asString)) {
    throw new AppError(`${fieldName} is not a valid Discord snowflake`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return asString;
}

export function validateGuildId(guildId) {
  return validateSnowflake(guildId, 'guildId');
}

export function validateChannelId(channelId) {
  return validateSnowflake(channelId, 'channelId');
}

export function validateGuildIds(guildIds) {
  if (!Array.isArray(guildIds)) {
    throw new AppError('guildIds must be an array', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (guildIds.length === 0) {
    throw new AppError('At least one guild must be provided', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (guildIds.length > MAX_GUILDS_PER_REQUEST) {
    throw new AppError(`No more than ${MAX_GUILDS_PER_REQUEST} guilds are allowed`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const normalized = guildIds.map((id) => validateGuildId(id));
  return Array.from(new Set(normalized));
}

export function validateChannelIds(channelIds) {
  if (!Array.isArray(channelIds)) {
    throw new AppError('channelIds must be an array', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (channelIds.length === 0) {
    throw new AppError('At least one channel must be provided', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (channelIds.length > MAX_CHANNELS_PER_REQUEST) {
    throw new AppError(`No more than ${MAX_CHANNELS_PER_REQUEST} channels are allowed`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const normalized = channelIds.map((id) => validateChannelId(id));
  return Array.from(new Set(normalized));
}

export function validateOAuthCode(code) {
  if (!code || typeof code !== 'string') {
    throw new AppError('OAuth code is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const trimmed = code.trim();

  if (trimmed.length < 4 || trimmed.length > 512) {
    throw new AppError('OAuth code is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return trimmed;
}

export function validateWebhookUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new AppError('Webhook URL is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const trimmed = url.trim();

  if (trimmed.length === 0 || trimmed.length > MAX_WEBHOOK_URL_LENGTH) {
    throw new AppError('Webhook URL length is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!trimmed.startsWith('https://discord.com/api/webhooks/') && !trimmed.startsWith('https://discordapp.com/api/webhooks/')) {
    throw new AppError('Webhook URL must be a Discord webhook', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return trimmed;
}

export function validateWebhookSignature(signature, timestamp, body, publicKey) {
  if (!signature || typeof signature !== 'string') {
    throw new AppError('Webhook signature is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!timestamp || typeof timestamp !== 'string') {
    throw new AppError('Webhook timestamp is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (signature.length > MAX_SIGNATURE_LENGTH) {
    throw new AppError('Webhook signature is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!publicKey || typeof publicKey !== 'string') {
    throw new AppError('Discord public key is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }

  if (typeof body !== 'string' && !Buffer.isBuffer(body)) {
    throw new AppError('Webhook body is required for verification', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return { signature, timestamp, body, publicKey };
}

export function validateInitiateOAuthPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    code: validateOAuthCode(payload.code),
    state: payload.state ? String(payload.state) : null,
  };
}

export function validateGuildSelectionPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    guildIds: validateGuildIds(payload.guildIds || []),
  };
}

export function validateChannelSelectionPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    channelIds: validateChannelIds(payload.channelIds || []),
  };
}

export const DISCORD_VALIDATION_CONSTRAINTS = Object.freeze({
  snowflakePattern: SNOWFLAKE_REGEX.source,
  maxGuildsPerRequest: MAX_GUILDS_PER_REQUEST,
  maxChannelsPerRequest: MAX_CHANNELS_PER_REQUEST,
  maxWebhookUrlLength: MAX_WEBHOOK_URL_LENGTH,
  maxSignatureLength: MAX_SIGNATURE_LENGTH,
});