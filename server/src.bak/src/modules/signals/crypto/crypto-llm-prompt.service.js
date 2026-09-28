'use strict';

const {
  CRYPTO_LLM_PROMPT_VERSION,
  CRYPTO_MAX_PROMPT_LENGTH,
} = require('./crypto.constants');

const {
  InvalidLlmResponseError,
} = require('./crypto.errors');

/**
 * SignalForge - Crypto LLM Prompt Service
 *
 * Builds prompts for the LLM gateway when parsing crypto signals
 * from provider messages. Prompts are versioned so that changing the
 * schema does not silently break older parse results.
 */

const SYSTEM_PROMPT = `You are a trading signal parser for a professional trading platform. You convert raw crypto trading messages into a strict JSON structure. You never invent values. You only output JSON. If a field is not present in the message, you return null for that field.`;

const OUTPUT_SCHEMA_DESCRIPTION = `{
  "symbol": "canonical crypto pair like BTC/USDT or SOL/USDC",
  "direction": "BUY or SELL",
  "orderType": "market | limit | stop | stop_limit",
  "entryPrice": number or null,
  "stopLoss": number or null,
  "takeProfits": array of numbers (may be empty),
  "amount": number or null,
  "timeframe": string or null,
  "confidence": number between 0 and 1,
  "notes": short free-text reason for the parse, or null
}`;

function truncateMessage(message) {
  if (!message) {
    return '';
  }
  const trimmed = String(message).trim();
  if (trimmed.length <= CRYPTO_MAX_PROMPT_LENGTH) {
    return trimmed;
  }
  return trimmed.slice(0, CRYPTO_MAX_PROMPT_LENGTH);
}

function buildUserPrompt({ message, provider, hints } = {}) {
  const parts = [];

  if (provider) {
    parts.push(`Provider: ${provider}`);
  }

  if (hints && typeof hints === 'object') {
    parts.push(`Hints: ${JSON.stringify(hints)}`);
  }

  parts.push('Message:');
  parts.push(truncateMessage(message));

  parts.push('');
  parts.push('Return a single JSON object that matches this schema exactly:');
  parts.push(OUTPUT_SCHEMA_DESCRIPTION);

  parts.push('');
  parts.push('Rules:');
  parts.push('- Only output JSON. Do not add commentary.');
  parts.push('- Do not invent prices or symbols.');
  parts.push('- If the message is not a trading signal, return {"symbol": null, "direction": null, "reason": "not_a_signal"}.');
  parts.push('- Use canonical pair format: BASE/QUOTE (e.g., BTC/USDT).');

  return parts.join('\n');
}

function buildPrompt({ message, provider, hints } = {}) {
  return {
    version: CRYPTO_LLM_PROMPT_VERSION,
    system: SYSTEM_PROMPT,
    user: buildUserPrompt({ message, provider, hints }),
  };
}

function extractJsonFromText(text) {
  if (!text || typeof text !== 'string') {
    throw new InvalidLlmResponseError('LLM response is empty');
  }

  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch (_error) {
    // Continue to tolerant parsing.
  }

  const jsonStart = trimmed.indexOf('{');
  const jsonEnd = trimmed.lastIndexOf('}');
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    const slice = trimmed.slice(jsonStart, jsonEnd + 1);
    try {
      return JSON.parse(slice);
    } catch (error) {
      throw new InvalidLlmResponseError('Failed to parse JSON from LLM response', {
        reason: error.message,
      });
    }
  }

  throw new InvalidLlmResponseError('LLM response did not contain a JSON object');
}

function validateLlmResponseShape(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new InvalidLlmResponseError('LLM response must be a JSON object');
  }

  const result = {
    symbol: payload.symbol ?? null,
    direction: payload.direction ?? null,
    orderType: payload.orderType ?? null,
    entryPrice: payload.entryPrice ?? null,
    stopLoss: payload.stopLoss ?? null,
    takeProfits: Array.isArray(payload.takeProfits) ? payload.takeProfits : [],
    amount: payload.amount ?? null,
    timeframe: payload.timeframe ?? null,
    confidence:
      typeof payload.confidence === 'number' ? payload.confidence : Number(payload.confidence) || null,
    notes: payload.notes ?? null,
    reason: payload.reason ?? null,
  };

  return result;
}

function describePrompt(prompt) {
  if (!prompt) {
    return null;
  }
  return {
    version: prompt.version,
    systemLength: prompt.system.length,
    userLength: prompt.user.length,
  };
}

module.exports = {
  SYSTEM_PROMPT,
  OUTPUT_SCHEMA_DESCRIPTION,
  truncateMessage,
  buildUserPrompt,
  buildPrompt,
  extractJsonFromText,
  validateLlmResponseShape,
  describePrompt,
};