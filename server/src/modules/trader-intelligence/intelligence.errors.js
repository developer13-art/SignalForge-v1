/**
 * Trader Intelligence Module Errors
 *
 * @module signalforge/server/modules/trader-intelligence/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
class TraderIntelligenceNotFoundError extends NotFoundError {
  constructor(message = 'Trader intelligence record not found', details = {}) {
    super(message, { code: 'TRADER_INTELLIGENCE_NOT_FOUND', details });
    this.name = 'TraderIntelligenceNotFoundError';
  }
}
class TimelineNotFoundError extends NotFoundError {
  constructor(message = 'Behavior timeline not found', details = {}) {
    super(message, { code: 'TIMELINE_NOT_FOUND', details });
    this.name = 'TimelineNotFoundError';
  }
}
class InsufficientTradesError extends ValidationError {
  constructor(message = 'Insufficient trades for intelligence analysis', details = {}) {
    super(message, { code: 'INSUFFICIENT_TRADES', details });
    this.name = 'InsufficientTradesError';
  }
}
class AnalysisFailedError extends Error {
  constructor(message = 'Trader intelligence analysis failed', details = {}) {
    super(message);
    this.name = 'AnalysisFailedError';
    this.code = 'ANALYSIS_FAILED';
    this.details = details;
  }
}
class InvalidAnalysisRequestError extends ValidationError {
  constructor(message = 'Analysis request is invalid', details = {}) {
    super(message, { code: 'INVALID_ANALYSIS_REQUEST', details });
    this.name = 'InvalidAnalysisRequestError';
  }
}
class ClassificationFailedError extends Error {
  constructor(message = 'Classification failed', details = {}) {
    super(message);
    this.name = 'ClassificationFailedError';
    this.code = 'CLASSIFICATION_FAILED';
    this.details = details;
  }
}
module.exports.TraderIntelligenceNotFoundError = TraderIntelligenceNotFoundError;
module.exports.TimelineNotFoundError = TimelineNotFoundError;
module.exports.InsufficientTradesError = InsufficientTradesError;
module.exports.AnalysisFailedError = AnalysisFailedError;
module.exports.InvalidAnalysisRequestError = InvalidAnalysisRequestError;
module.exports.ClassificationFailedError = ClassificationFailedError;
