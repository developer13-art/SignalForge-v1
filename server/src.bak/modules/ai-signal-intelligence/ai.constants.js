/**
 * AI Signal Intelligence Constants
 *
 * @module signalforge/server/modules/ai-signal-intelligence/constants
 */

export const AI_EVENTS = Object.freeze({
  PARSING_STARTED: 'ai.parsing.started',
  PARSING_COMPLETED: 'ai.parsing.completed',
  PARSING_FAILED: 'ai.parsing.failed',
  PARSING_LOW_CONFIDENCE: 'ai.parsing.low_confidence',
  NORMALIZATION_COMPLETED: 'ai.normalization.completed',
  CONFIDENCE_SCORED: 'ai.confidence.scored',
  LLM_REQUEST: 'ai.llm.request',
  LLM_RESPONSE: 'ai.llm.response',
  LLM_ERROR: 'ai.llm.error',
  LLM_RATE_LIMITED: 'ai.llm.rate_limited',
  PROMPT_INJECTION_DETECTED: 'ai.safety.prompt_injection',
  SAFETY_FILTER_TRIGGERED: 'ai.safety.filter_triggered',
});

export const PARSER_TYPES = Object.freeze({
  FAST_PATH: 'FAST_PATH',
  LEARNING_PATH: 'LEARNING_PATH',
  MANUAL: 'MANUAL',
});

export const LLM_PROVIDERS = Object.freeze({
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  LOCAL: 'local',
});

export const CONFIDENCE_LEVELS = Object.freeze({
  VERY_LOW: 'VERY_LOW',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH',
});

export const CONFIDENCE_THRESHOLDS = Object.freeze({
  VERY_LOW: 0,
  LOW: 0.5,
  MEDIUM: 0.7,
  HIGH: 0.85,
  VERY_HIGH: 0.95,
});

export const DEFAULT_MIN_CONFIDENCE = 0.8;
export const DEFAULT_LOW_CONFIDENCE_ACTION = 'REVIEW';
export const DEFAULT_PARSER_TIMEOUT_MS = 30000;

export const SAFETY_FILTER_ACTIONS = Object.freeze({
  BLOCK: 'BLOCK',
  FLAG: 'FLAG',
  ALLOW: 'ALLOW',
});

export const EMBEDDING_DIMENSIONS = 1536;
export const MAX_PROMPT_LENGTH = 8000;
export const MAX_CONTEXT_MESSAGES = 5;

export const INTENT_TYPES = Object.freeze({
  OPEN_POSITION: 'OPEN_POSITION',
  CLOSE_POSITION: 'CLOSE_POSITION',
  MODIFY_POSITION: 'MODIFY_POSITION',
  MOVE_STOP_LOSS: 'MOVE_STOP_LOSS',
  MOVE_TAKE_PROFIT: 'MOVE_TAKE_PROFIT',
  PARTIAL_CLOSE: 'PARTIAL_CLOSE',
  TRAIL_STOP: 'TRAIL_STOP',
  BREAK_EVEN: 'BREAK_EVEN',
  CANCEL_ORDER: 'CANCEL_ORDER',
  ANALYSIS_ONLY: 'ANALYSIS_ONLY',
  INFORMATIONAL: 'INFORMATIONAL',
  UNKNOWN: 'UNKNOWN',
});