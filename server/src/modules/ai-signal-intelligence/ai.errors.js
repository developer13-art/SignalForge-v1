/**
 * AI Signal Intelligence Errors
 *
 * @module signalforge/server/modules/ai-signal-intelligence/errors
 */
const { ValidationError } = require('../../lib/errors/validation-error.js');
class AiParsingError extends Error {
  constructor(message = 'AI parsing failed', details = {}) {
    super(message);
    this.name = 'AiParsingError';
    this.code = 'AI_PARSING_ERROR';
    this.details = details;
  }
}
class AiParsingTimeoutError extends Error {
  constructor(message = 'AI parsing timed out', details = {}) {
    super(message);
    this.name = 'AiParsingTimeoutError';
    this.code = 'AI_PARSING_TIMEOUT';
    this.details = details;
  }
}
class AiParsingInvalidResponseError extends ValidationError {
  constructor(message = 'AI returned an invalid response', details = {}) {
    super(message, { code: 'AI_INVALID_RESPONSE', details });
    this.name = 'AiParsingInvalidResponseError';
  }
}
class AiLowConfidenceError extends ValidationError {
  constructor(message = 'AI parsing confidence is below the required threshold', details = {}) {
    super(message, { code: 'AI_LOW_CONFIDENCE', details });
    this.name = 'AiLowConfidenceError';
  }
}
class LlmProviderError extends Error {
  constructor(message = 'LLM provider error', details = {}) {
    super(message);
    this.name = 'LlmProviderError';
    this.code = 'LLM_PROVIDER_ERROR';
    this.details = details;
  }
}
class LlmProviderNotConfiguredError extends Error {
  constructor(message = 'LLM provider is not configured', details = {}) {
    super(message);
    this.name = 'LlmProviderNotConfiguredError';
    this.code = 'LLM_PROVIDER_NOT_CONFIGURED';
    this.details = details;
  }
}
class LlmRateLimitError extends Error {
  constructor(message = 'LLM rate limit exceeded', details = {}) {
    super(message);
    this.name = 'LlmRateLimitError';
    this.code = 'LLM_RATE_LIMIT_EXCEEDED';
    this.details = details;
  }
}
class LlmTimeoutError extends Error {
  constructor(message = 'LLM request timed out', details = {}) {
    super(message);
    this.name = 'LlmTimeoutError';
    this.code = 'LLM_TIMEOUT';
    this.details = details;
  }
}
class PromptInjectionError extends ValidationError {
  constructor(message = 'Potential prompt injection detected', details = {}) {
    super(message, { code: 'PROMPT_INJECTION_DETECTED', details });
    this.name = 'PromptInjectionError';
  }
}
class SafetyFilterError extends ValidationError {
  constructor(message = 'Content blocked by safety filter', details = {}) {
    super(message, { code: 'SAFETY_FILTER_TRIGGERED', details });
    this.name = 'SafetyFilterError';
  }
}
class NormalizationError extends ValidationError {
  constructor(message = 'Normalization failed', details = {}) {
    super(message, { code: 'NORMALIZATION_FAILED', details });
    this.name = 'NormalizationError';
  }
}
module.exports.AiParsingError = AiParsingError;
module.exports.AiParsingTimeoutError = AiParsingTimeoutError;
module.exports.AiParsingInvalidResponseError = AiParsingInvalidResponseError;
module.exports.AiLowConfidenceError = AiLowConfidenceError;
module.exports.LlmProviderError = LlmProviderError;
module.exports.LlmProviderNotConfiguredError = LlmProviderNotConfiguredError;
module.exports.LlmRateLimitError = LlmRateLimitError;
module.exports.LlmTimeoutError = LlmTimeoutError;
module.exports.PromptInjectionError = PromptInjectionError;
module.exports.SafetyFilterError = SafetyFilterError;
module.exports.NormalizationError = NormalizationError;
