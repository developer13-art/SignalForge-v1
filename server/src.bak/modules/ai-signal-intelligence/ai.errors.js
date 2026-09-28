/**
 * AI Signal Intelligence Errors
 *
 * @module signalforge/server/modules/ai-signal-intelligence/errors
 */

import { ValidationError } from '../../lib/errors/validation-error.js';

export class AiParsingError extends Error {
  constructor(message = 'AI parsing failed', details = {}) {
    super(message);
    this.name = 'AiParsingError';
    this.code = 'AI_PARSING_ERROR';
    this.details = details;
  }
}

export class AiParsingTimeoutError extends Error {
  constructor(message = 'AI parsing timed out', details = {}) {
    super(message);
    this.name = 'AiParsingTimeoutError';
    this.code = 'AI_PARSING_TIMEOUT';
    this.details = details;
  }
}

export class AiParsingInvalidResponseError extends ValidationError {
  constructor(message = 'AI returned an invalid response', details = {}) {
    super(message, { code: 'AI_INVALID_RESPONSE', details });
    this.name = 'AiParsingInvalidResponseError';
  }
}

export class AiLowConfidenceError extends ValidationError {
  constructor(message = 'AI parsing confidence is below the required threshold', details = {}) {
    super(message, { code: 'AI_LOW_CONFIDENCE', details });
    this.name = 'AiLowConfidenceError';
  }
}

export class LlmProviderError extends Error {
  constructor(message = 'LLM provider error', details = {}) {
    super(message);
    this.name = 'LlmProviderError';
    this.code = 'LLM_PROVIDER_ERROR';
    this.details = details;
  }
}

export class LlmProviderNotConfiguredError extends Error {
  constructor(message = 'LLM provider is not configured', details = {}) {
    super(message);
    this.name = 'LlmProviderNotConfiguredError';
    this.code = 'LLM_PROVIDER_NOT_CONFIGURED';
    this.details = details;
  }
}

export class LlmRateLimitError extends Error {
  constructor(message = 'LLM rate limit exceeded', details = {}) {
    super(message);
    this.name = 'LlmRateLimitError';
    this.code = 'LLM_RATE_LIMIT_EXCEEDED';
    this.details = details;
  }
}

export class LlmTimeoutError extends Error {
  constructor(message = 'LLM request timed out', details = {}) {
    super(message);
    this.name = 'LlmTimeoutError';
    this.code = 'LLM_TIMEOUT';
    this.details = details;
  }
}

export class PromptInjectionError extends ValidationError {
  constructor(message = 'Potential prompt injection detected', details = {}) {
    super(message, { code: 'PROMPT_INJECTION_DETECTED', details });
    this.name = 'PromptInjectionError';
  }
}

export class SafetyFilterError extends ValidationError {
  constructor(message = 'Content blocked by safety filter', details = {}) {
    super(message, { code: 'SAFETY_FILTER_TRIGGERED', details });
    this.name = 'SafetyFilterError';
  }
}

export class NormalizationError extends ValidationError {
  constructor(message = 'Normalization failed', details = {}) {
    super(message, { code: 'NORMALIZATION_FAILED', details });
    this.name = 'NormalizationError';
  }
}