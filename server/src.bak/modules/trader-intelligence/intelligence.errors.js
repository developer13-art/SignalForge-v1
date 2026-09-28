/**
 * Trader Intelligence Module Errors
 *
 * @module signalforge/server/modules/trader-intelligence/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class TraderIntelligenceNotFoundError extends NotFoundError {
  constructor(message = 'Trader intelligence record not found', details = {}) {
    super(message, { code: 'TRADER_INTELLIGENCE_NOT_FOUND', details });
    this.name = 'TraderIntelligenceNotFoundError';
  }
}

export class TimelineNotFoundError extends NotFoundError {
  constructor(message = 'Behavior timeline not found', details = {}) {
    super(message, { code: 'TIMELINE_NOT_FOUND', details });
    this.name = 'TimelineNotFoundError';
  }
}

export class InsufficientTradesError extends ValidationError {
  constructor(message = 'Insufficient trades for intelligence analysis', details = {}) {
    super(message, { code: 'INSUFFICIENT_TRADES', details });
    this.name = 'InsufficientTradesError';
  }
}

export class AnalysisFailedError extends Error {
  constructor(message = 'Trader intelligence analysis failed', details = {}) {
    super(message);
    this.name = 'AnalysisFailedError';
    this.code = 'ANALYSIS_FAILED';
    this.details = details;
  }
}

export class InvalidAnalysisRequestError extends ValidationError {
  constructor(message = 'Analysis request is invalid', details = {}) {
    super(message, { code: 'INVALID_ANALYSIS_REQUEST', details });
    this.name = 'InvalidAnalysisRequestError';
  }
}

export class ClassificationFailedError extends Error {
  constructor(message = 'Classification failed', details = {}) {
    super(message);
    this.name = 'ClassificationFailedError';
    this.code = 'CLASSIFICATION_FAILED';
    this.details = details;
  }
}