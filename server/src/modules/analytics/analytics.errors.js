/**
 * Analytics Module Errors
 *
 * @module signalforge/server/modules/analytics/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
class AnalyticsNotFoundError extends NotFoundError {
  constructor(message = 'Analytics data not found', details = {}) {
    super(message, { code: 'ANALYTICS_NOT_FOUND', details });
    this.name = 'AnalyticsNotFoundError';
  }
}
class ReportNotFoundError extends NotFoundError {
  constructor(message = 'Report not found', details = {}) {
    super(message, { code: 'REPORT_NOT_FOUND', details });
    this.name = 'ReportNotFoundError';
  }
}
class MetricCalculationError extends Error {
  constructor(message = 'Metric calculation failed', details = {}) {
    super(message);
    this.name = 'MetricCalculationError';
    this.code = 'METRIC_CALCULATION_FAILED';
    this.details = details;
  }
}
class ReportGenerationError extends Error {
  constructor(message = 'Report generation failed', details = {}) {
    super(message);
    this.name = 'ReportGenerationError';
    this.code = 'REPORT_GENERATION_FAILED';
    this.details = details;
  }
}
class ReportExportError extends Error {
  constructor(message = 'Report export failed', details = {}) {
    super(message);
    this.name = 'ReportExportError';
    this.code = 'REPORT_EXPORT_FAILED';
    this.details = details;
  }
}
class InvalidMetricRequestError extends ValidationError {
  constructor(message = 'Metric request is invalid', details = {}) {
    super(message, { code: 'INVALID_METRIC_REQUEST', details });
    this.name = 'InvalidMetricRequestError';
  }
}
class InsufficientDataError extends ValidationError {
  constructor(message = 'Insufficient data to compute metric', details = {}) {
    super(message, { code: 'INSUFFICIENT_DATA', details });
    this.name = 'InsufficientDataError';
  }
}
class ReportAlreadyGeneratingError extends ConflictError {
  constructor(message = 'Report is already being generated') {
    super(message, { code: 'REPORT_ALREADY_GENERATING' });
    this.name = 'ReportAlreadyGeneratingError';
  }
}
module.exports.AnalyticsNotFoundError = AnalyticsNotFoundError;
module.exports.ReportNotFoundError = ReportNotFoundError;
module.exports.MetricCalculationError = MetricCalculationError;
module.exports.ReportGenerationError = ReportGenerationError;
module.exports.ReportExportError = ReportExportError;
module.exports.InvalidMetricRequestError = InvalidMetricRequestError;
module.exports.InsufficientDataError = InsufficientDataError;
module.exports.ReportAlreadyGeneratingError = ReportAlreadyGeneratingError;
