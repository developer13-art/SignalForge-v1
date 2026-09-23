/**
 * Analytics Module Errors
 *
 * @module signalforge/server/modules/analytics/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';

export class AnalyticsNotFoundError extends NotFoundError {
  constructor(message = 'Analytics data not found', details = {}) {
    super(message, { code: 'ANALYTICS_NOT_FOUND', details });
    this.name = 'AnalyticsNotFoundError';
  }
}

export class ReportNotFoundError extends NotFoundError {
  constructor(message = 'Report not found', details = {}) {
    super(message, { code: 'REPORT_NOT_FOUND', details });
    this.name = 'ReportNotFoundError';
  }
}

export class MetricCalculationError extends Error {
  constructor(message = 'Metric calculation failed', details = {}) {
    super(message);
    this.name = 'MetricCalculationError';
    this.code = 'METRIC_CALCULATION_FAILED';
    this.details = details;
  }
}

export class ReportGenerationError extends Error {
  constructor(message = 'Report generation failed', details = {}) {
    super(message);
    this.name = 'ReportGenerationError';
    this.code = 'REPORT_GENERATION_FAILED';
    this.details = details;
  }
}

export class ReportExportError extends Error {
  constructor(message = 'Report export failed', details = {}) {
    super(message);
    this.name = 'ReportExportError';
    this.code = 'REPORT_EXPORT_FAILED';
    this.details = details;
  }
}

export class InvalidMetricRequestError extends ValidationError {
  constructor(message = 'Metric request is invalid', details = {}) {
    super(message, { code: 'INVALID_METRIC_REQUEST', details });
    this.name = 'InvalidMetricRequestError';
  }
}

export class InsufficientDataError extends ValidationError {
  constructor(message = 'Insufficient data to compute metric', details = {}) {
    super(message, { code: 'INSUFFICIENT_DATA', details });
    this.name = 'InsufficientDataError';
  }
}

export class ReportAlreadyGeneratingError extends ConflictError {
  constructor(message = 'Report is already being generated') {
    super(message, { code: 'REPORT_ALREADY_GENERATING' });
    this.name = 'ReportAlreadyGeneratingError';
  }
}