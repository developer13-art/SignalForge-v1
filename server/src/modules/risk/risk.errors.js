/**
 * Risk Module Errors
 *
 * @module signalforge/server/modules/risk/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class RiskProfileNotFoundError extends NotFoundError {
  constructor(message = 'Risk profile not found', details = {}) {
    super(message, { code: 'RISK_PROFILE_NOT_FOUND', details });
    this.name = 'RiskProfileNotFoundError';
  }
}

export class RiskDecisionNotFoundError extends NotFoundError {
  constructor(message = 'Risk decision not found', details = {}) {
    super(message, { code: 'RISK_DECISION_NOT_FOUND', details });
    this.name = 'RiskDecisionNotFoundError';
  }
}

export class RiskLimitExceededError extends AuthorizationError {
  constructor(message = 'Risk limit exceeded', details = {}) {
    super(message, { code: 'RISK_LIMIT_EXCEEDED', details });
    this.name = 'RiskLimitExceededError';
  }
}

export class RiskCheckFailedError extends ValidationError {
  constructor(message = 'Risk check failed', details = {}) {
    super(message, { code: 'RISK_CHECK_FAILED', details });
    this.name = 'RiskCheckFailedError';
  }
}

export class EmergencyStopActiveError extends AuthorizationError {
  constructor(message = 'Emergency stop is active on this account', details = {}) {
    super(message, { code: 'EMERGENCY_STOP_ACTIVE', details });
    this.name = 'EmergencyStopActiveError';
  }
}

export class InvalidRiskProfileError extends ValidationError {
  constructor(message = 'Risk profile is invalid', details = {}) {
    super(message, { code: 'INVALID_RISK_PROFILE', details });
    this.name = 'InvalidRiskProfileError';
  }
}

export class InsufficientMarginError extends AuthorizationError {
  constructor(message = 'Insufficient margin for the requested trade', details = {}) {
    super(message, { code: 'INSUFFICIENT_MARGIN', details });
    this.name = 'InsufficientMarginError';
  }
}

export class SpreadTooWideError extends AuthorizationError {
  constructor(message = 'Current spread exceeds the allowed limit', details = {}) {
    super(message, { code: 'SPREAD_TOO_WIDE', details });
    this.name = 'SpreadTooWideError';
  }
}

export class SlippageExceededError extends AuthorizationError {
  constructor(message = 'Estimated slippage exceeds the allowed limit', details = {}) {
    super(message, { code: 'SLIPPAGE_EXCEEDED', details });
    this.name = 'SlippageExceededError';
  }
}

export class NewsFilterBlockedError extends AuthorizationError {
  constructor(message = 'Trade blocked by news filter', details = {}) {
    super(message, { code: 'NEWS_FILTER_BLOCKED', details });
    this.name = 'NewsFilterBlockedError';
  }
}

export class SessionBlockedError extends AuthorizationError {
  constructor(message = 'Trade blocked outside allowed trading sessions', details = {}) {
    super(message, { code: 'SESSION_BLOCKED', details });
    this.name = 'SessionBlockedError';
  }
}

export class CorrelationBlockedError extends AuthorizationError {
  constructor(message = 'Trade blocked by correlation exposure limits', details = {}) {
    super(message, { code: 'CORRELATION_BLOCKED', details });
    this.name = 'CorrelationBlockedError';
  }
}