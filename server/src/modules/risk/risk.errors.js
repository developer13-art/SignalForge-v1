/**
 * Risk Module Errors
 *
 * @module signalforge/server/modules/risk/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
class RiskProfileNotFoundError extends NotFoundError {
  constructor(message = 'Risk profile not found', details = {}) {
    super(message, { code: 'RISK_PROFILE_NOT_FOUND', details });
    this.name = 'RiskProfileNotFoundError';
  }
}
class RiskDecisionNotFoundError extends NotFoundError {
  constructor(message = 'Risk decision not found', details = {}) {
    super(message, { code: 'RISK_DECISION_NOT_FOUND', details });
    this.name = 'RiskDecisionNotFoundError';
  }
}
class RiskLimitExceededError extends AuthorizationError {
  constructor(message = 'Risk limit exceeded', details = {}) {
    super(message, { code: 'RISK_LIMIT_EXCEEDED', details });
    this.name = 'RiskLimitExceededError';
  }
}
class RiskCheckFailedError extends ValidationError {
  constructor(message = 'Risk check failed', details = {}) {
    super(message, { code: 'RISK_CHECK_FAILED', details });
    this.name = 'RiskCheckFailedError';
  }
}
class EmergencyStopActiveError extends AuthorizationError {
  constructor(message = 'Emergency stop is active on this account', details = {}) {
    super(message, { code: 'EMERGENCY_STOP_ACTIVE', details });
    this.name = 'EmergencyStopActiveError';
  }
}
class InvalidRiskProfileError extends ValidationError {
  constructor(message = 'Risk profile is invalid', details = {}) {
    super(message, { code: 'INVALID_RISK_PROFILE', details });
    this.name = 'InvalidRiskProfileError';
  }
}
class InsufficientMarginError extends AuthorizationError {
  constructor(message = 'Insufficient margin for the requested trade', details = {}) {
    super(message, { code: 'INSUFFICIENT_MARGIN', details });
    this.name = 'InsufficientMarginError';
  }
}
class SpreadTooWideError extends AuthorizationError {
  constructor(message = 'Current spread exceeds the allowed limit', details = {}) {
    super(message, { code: 'SPREAD_TOO_WIDE', details });
    this.name = 'SpreadTooWideError';
  }
}
class SlippageExceededError extends AuthorizationError {
  constructor(message = 'Estimated slippage exceeds the allowed limit', details = {}) {
    super(message, { code: 'SLIPPAGE_EXCEEDED', details });
    this.name = 'SlippageExceededError';
  }
}
class NewsFilterBlockedError extends AuthorizationError {
  constructor(message = 'Trade blocked by news filter', details = {}) {
    super(message, { code: 'NEWS_FILTER_BLOCKED', details });
    this.name = 'NewsFilterBlockedError';
  }
}
class SessionBlockedError extends AuthorizationError {
  constructor(message = 'Trade blocked outside allowed trading sessions', details = {}) {
    super(message, { code: 'SESSION_BLOCKED', details });
    this.name = 'SessionBlockedError';
  }
}
class CorrelationBlockedError extends AuthorizationError {
  constructor(message = 'Trade blocked by correlation exposure limits', details = {}) {
    super(message, { code: 'CORRELATION_BLOCKED', details });
    this.name = 'CorrelationBlockedError';
  }
}
module.exports.RiskProfileNotFoundError = RiskProfileNotFoundError;
module.exports.RiskDecisionNotFoundError = RiskDecisionNotFoundError;
module.exports.RiskLimitExceededError = RiskLimitExceededError;
module.exports.RiskCheckFailedError = RiskCheckFailedError;
module.exports.EmergencyStopActiveError = EmergencyStopActiveError;
module.exports.InvalidRiskProfileError = InvalidRiskProfileError;
module.exports.InsufficientMarginError = InsufficientMarginError;
module.exports.SpreadTooWideError = SpreadTooWideError;
module.exports.SlippageExceededError = SlippageExceededError;
module.exports.NewsFilterBlockedError = NewsFilterBlockedError;
module.exports.SessionBlockedError = SessionBlockedError;
module.exports.CorrelationBlockedError = CorrelationBlockedError;
