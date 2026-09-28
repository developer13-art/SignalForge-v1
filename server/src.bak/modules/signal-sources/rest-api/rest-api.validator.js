/**
 * REST API Validator
 *
 * Provides validation for direct provider signal submissions via the
 * REST API source. Validates API keys, payload sizes, and required
 * signal fields before the message is accepted into the pipeline.
 *
 * @module server/modules/signal-sources/rest-api/rest-api.validator
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { normalizeSymbol } from '@signalforge/shared/validators/symbol.validator';
import { normalizeDirection } from '@signalforge/shared/constants/order-directions';
import { parsePrice } from '@signalforge/shared/validators/price.validator';
import { ENTRY_TYPE_VALUES } from '@signalforge/shared/constants/order-types';

const MAX_PAYLOAD_BYTES = 128 * 1024;
const MAX_NOTES_LENGTH = 4096;
const MAX_PROVIDER_REFERENCE_LENGTH = 128;

export function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new AppError('API key is required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const trimmed = apiKey.trim();

  if (trimmed.length < 16 || trimmed.length > 256) {
    throw new AppError('API key format is invalid', ERROR_CODES.AUTHENTICATION_FAILED, 401);
  }

  return trimmed;
}

export function validatePayloadSize(rawBody) {
  if (!rawBody) {
    throw new AppError('Payload is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const size = Buffer.isBuffer(rawBody)
    ? rawBody.length
    : Buffer.byteLength(String(rawBody), 'utf8');

  if (size > MAX_PAYLOAD_BYTES) {
    throw new AppError(`Payload exceeds ${MAX_PAYLOAD_BYTES} bytes`, ERROR_CODES.REST_API_PAYLOAD_TOO_LARGE, 413);
  }

  return size;
}

export function validateProviderReference(reference) {
  if (reference === undefined || reference === null) {
    return null;
  }
  if (typeof reference !== 'string') {
    throw new AppError('Provider reference must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const trimmed = reference.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_PROVIDER_REFERENCE_LENGTH) {
    throw new AppError('Provider reference is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return trimmed;
}

export function validateSignalPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Signal payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.symbol || typeof payload.symbol !== 'string') {
    throw new AppError('Symbol is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const symbol = normalizeSymbol(payload.symbol);

  if (!symbol) {
    throw new AppError(`Symbol "${payload.symbol}" is invalid`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.direction || typeof payload.direction !== 'string') {
    throw new AppError('Direction is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const direction = normalizeDirection(payload.direction);

  if (!direction) {
    throw new AppError(`Direction "${payload.direction}" is invalid`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const entryType = payload.entryType || payload.entry_type || 'MARKET';

  if (!ENTRY_TYPE_VALUES.includes(entryType)) {
    throw new AppError(`Entry type "${entryType}" is invalid`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const entryPrice =
    payload.entryPrice !== undefined && payload.entryPrice !== null
      ? parsePrice(payload.entryPrice)
      : null;

  const stopLoss =
    payload.stopLoss !== undefined && payload.stopLoss !== null
      ? parsePrice(payload.stopLoss)
      : null;

  let takeProfits = [];

  if (Array.isArray(payload.takeProfits)) {
    takeProfits = payload.takeProfits
      .map((tp) => parsePrice(tp))
      .filter((tp) => tp !== null);
  } else if (payload.takeProfit !== undefined && payload.takeProfit !== null) {
    const tp = parsePrice(payload.takeProfit);
    if (tp !== null) {
      takeProfits = [tp];
    }
  }

  if (entryType !== 'MARKET' && entryPrice === null) {
    throw new AppError('entryPrice is required for non-market orders', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (payload.notes !== undefined && payload.notes !== null) {
    if (typeof payload.notes !== 'string') {
      throw new AppError('Notes must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    if (payload.notes.length > MAX_NOTES_LENGTH) {
      throw new AppError(`Notes exceed ${MAX_NOTES_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
  }

  return {
    symbol,
    direction,
    entryType,
    entryPrice,
    stopLoss,
    takeProfits,
    timeframe: payload.timeframe || null,
    notes: payload.notes || null,
    providerReference: validateProviderReference(payload.providerReference || payload.reference),
    timestamp: payload.timestamp || new Date().toISOString(),
    metadata: payload.metadata || null,
  };
}

export function validateRestApiSubmission(payload) {
  const validated = validateSignalPayload(payload);
  return validated;
}

export const REST_API_VALIDATION_CONSTRAINTS = Object.freeze({
  maxPayloadBytes: MAX_PAYLOAD_BYTES,
  maxNotesLength: MAX_NOTES_LENGTH,
  maxProviderReferenceLength: MAX_PROVIDER_REFERENCE_LENGTH,
});