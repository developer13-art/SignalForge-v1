/**
 * Performance Module Errors
 *
 * @module signalforge/server/modules/performance/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';

export class PerformancePeriodNotFoundError extends NotFoundError {
  constructor(message = 'Performance period not found', details = {}) {
    super(message, { code: 'PERFORMANCE_PERIOD_NOT_FOUND', details });
    this.name = 'PerformancePeriodNotFoundError';
  }
}

export class PerformanceMetricNotFoundError extends NotFoundError {
  constructor(message = 'Performance metric not found', details = {}) {
    super(message, { code: 'PERFORMANCE_METRIC_NOT_FOUND', details });
    this.name = 'PerformanceMetricNotFoundError';
  }
}

export class PeriodAlreadyExistsError extends ConflictError {
  constructor(message = 'Performance period already exists') {
    super(message, { code: 'PERFORMANCE_PERIOD_ALREADY_EXISTS' });
    this.name = 'PeriodAlreadyExistsError';
  }
}

export class PeriodNotEditableError extends ConflictError {
  constructor(message = 'Performance period is not editable', details = {}) {
    super(message, { code: 'PERFORMANCE_PERIOD_NOT_EDITABLE', details });
    this.name = 'PeriodNotEditableError';
  }
}

export class PeriodAlreadyClosedError extends ConflictError {
  constructor(message = 'Performance period is already closed', details = {}) {
    super(message, { code: 'PERFORMANCE_PERIOD_ALREADY_CLOSED', details });
    this.name = 'PeriodAlreadyClosedError';
  }
}

export class PeriodCalculationError extends Error {
  constructor(message = 'Performance calculation failed', details = {}) {
    super(message);
    this.name = 'PeriodCalculationError';
    this.code = 'PERFORMANCE_CALCULATION_FAILED';
    this.details = details;
  }
}

export class EquityReconstructionError extends Error {
  constructor(message = 'Equity reconstruction failed', details = {}) {
    super(message);
    this.name = 'EquityReconstructionError';
    this.code = 'EQUITY_RECONSTRUCTION_FAILED';
    this.details = details;
  }
}

export class InvalidPerformancePeriodError extends ValidationError {
  constructor(message = 'Performance period is invalid', details = {}) {
    super(message, { code: 'INVALID_PERFORMANCE_PERIOD', details });
    this.name = 'InvalidPerformancePeriodError';
  }
}

export class InvalidSettlementPeriodError extends ValidationError {
  constructor(message = 'Settlement period is invalid', details = {}) {
    super(message, { code: 'INVALID_SETTLEMENT_PERIOD', details });
    this.name = 'InvalidSettlementPeriodError';
  }
}