/**
 * AI Validator
 *
 * Provides validation for AI parsing requests and responses. Ensures
 * parsed output conforms to the expected structured schema before it
 * enters the signal pipeline.
 *
 * @module server/modules/ai-signal-intelligence/ai.validator
 */
const { AppError } = require('../../lib/errors/app-error');
const { ERROR_CODES } = require('../../lib/errors/error-codes');
const { ORDER_DIRECTION_VALUES, normalizeDirection } = require('@signalforge/shared/constants/order-directions');
const { ENTRY_TYPE_VALUES } = require('@signalforge/shared/constants/order-types');
const { normalizeSymbol } = require('@signalforge/shared/validators/symbol.validator');
const { parsePrice } = require('@signalforge/shared/validators/price.validator');
const { parseVolume } = require('@signalforge/shared/validators/lot-size.validator');

const MAX_TEXT_LENGTH = 8192;
const MIN_CONFIDENCE = 0;
const MAX_CONFIDENCE = 1;
function validateParseRequest({ text, providerId, language }) {
  if (!text || typeof text !== 'string') {
    throw new AppError('Text is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (text.length > MAX_TEXT_LENGTH) {
    throw new AppError(`Text exceeds ${MAX_TEXT_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (providerId !== undefined && providerId !== null && typeof providerId !== 'string') {
    throw new AppError('providerId must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (language !== undefined && language !== null && typeof language !== 'string') {
    throw new AppError('language must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    text: text.trim(),
    providerId: providerId || null,
    language: language || null,
  };
}
function validateParsedSignal(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    throw new AppError('Parsed signal must be an object', ERROR_CODES.AI_PARSE_FAILED, 500);
  }

  const errors = [];
  const result = {};

  if (parsed.action !== undefined && parsed.action !== null) {
    const direction = normalizeDirection(parsed.action);
    if (!direction) {
      errors.push(`Invalid action: ${parsed.action}`);
    } else {
      result.action = direction;
    }
  }

  if (parsed.symbol !== undefined && parsed.symbol !== null) {
    const symbol = normalizeSymbol(parsed.symbol);
    if (!symbol) {
      errors.push(`Invalid symbol: ${parsed.symbol}`);
    } else {
      result.symbol = symbol;
    }
  }

  if (parsed.entry_type !== undefined && parsed.entry_type !== null) {
    if (!ENTRY_TYPE_VALUES.includes(parsed.entry_type)) {
      errors.push(`Invalid entry_type: ${parsed.entry_type}`);
    } else {
      result.entry_type = parsed.entry_type;
    }
  }

  if (parsed.entry_price !== undefined && parsed.entry_price !== null) {
    const entry = parsePrice(parsed.entry_price);
    if (entry === null) {
      errors.push(`Invalid entry_price: ${parsed.entry_price}`);
    } else {
      result.entry_price = entry;
    }
  }

  if (parsed.stop_loss !== undefined && parsed.stop_loss !== null) {
    const sl = parsePrice(parsed.stop_loss);
    if (sl === null) {
      errors.push(`Invalid stop_loss: ${parsed.stop_loss}`);
    } else {
      result.stop_loss = sl;
    }
  }

  if (parsed.take_profits !== undefined && parsed.take_profits !== null) {
    if (!Array.isArray(parsed.take_profits)) {
      errors.push('take_profits must be an array');
    } else {
      result.take_profits = parsed.take_profits
        .map((tp) => parsePrice(tp))
        .filter((tp) => tp !== null);
    }
  } else {
    result.take_profits = [];
  }

  if (parsed.lot_size !== undefined && parsed.lot_size !== null) {
    const lot = parseVolume(parsed.lot_size);
    if (lot === null) {
      errors.push(`Invalid lot_size: ${parsed.lot_size}`);
    } else {
      result.lot_size = lot;
    }
  }

  if (parsed.risk_percent !== undefined && parsed.risk_percent !== null) {
    const risk = Number(parsed.risk_percent);
    if (!Number.isFinite(risk) || risk < 0 || risk > 100) {
      errors.push(`Invalid risk_percent: ${parsed.risk_percent}`);
    } else {
      result.risk_percent = risk;
    }
  }

  if (parsed.confidence !== undefined && parsed.confidence !== null) {
    const conf = Number(parsed.confidence);
    if (!Number.isFinite(conf) || conf < MIN_CONFIDENCE || conf > MAX_CONFIDENCE) {
      errors.push(`Invalid confidence: ${parsed.confidence}`);
    } else {
      result.confidence = conf;
    }
  } else {
    result.confidence = 0.5;
  }

  if (parsed.timeframe !== undefined && parsed.timeframe !== null) {
    result.timeframe = String(parsed.timeframe).trim().toUpperCase().substring(0, 16);
  }

  if (parsed.language !== undefined && parsed.language !== null) {
    result.language = String(parsed.language).trim().toLowerCase().substring(0, 8);
  }

  if (parsed.notes !== undefined && parsed.notes !== null) {
    result.notes = String(parsed.notes).substring(0, 2048);
  }

  if (errors.length > 0) {
    throw new AppError(
      `Parsed signal validation failed: ${errors.join('; ')}`,
      ERROR_CODES.AI_PARSE_VALIDATION_FAILED,
      500,
    );
  }

  return result;
}
function validateLlmResponse(response) {
  if (!response || typeof response !== 'object') {
    throw new AppError('LLM response must be an object', ERROR_CODES.AI_PARSE_FAILED, 500);
  }

  if (typeof response.content !== 'string' || response.content.trim().length === 0) {
    throw new AppError('LLM response content is empty', ERROR_CODES.AI_PARSE_FAILED, 500);
  }

  return response;
}
function validateConfidenceThreshold(confidence, threshold = 0.8) {
  if (typeof confidence !== 'number') {
    return { meetsThreshold: false, confidence: 0, threshold };
  }
  return {
    meetsThreshold: confidence >= threshold,
    confidence,
    threshold,
  };
}
const AI_VALIDATION_CONSTRAINTS = Object.freeze({
  maxTextLength: MAX_TEXT_LENGTH,
  minConfidence: MIN_CONFIDENCE,
  maxConfidence: MAX_CONFIDENCE,
  defaultConfidenceThreshold: 0.8,
});
module.exports.AI_VALIDATION_CONSTRAINTS = AI_VALIDATION_CONSTRAINTS;
module.exports.validateParseRequest = validateParseRequest;
module.exports.validateParsedSignal = validateParsedSignal;
module.exports.validateLlmResponse = validateLlmResponse;
module.exports.validateConfidenceThreshold = validateConfidenceThreshold;
