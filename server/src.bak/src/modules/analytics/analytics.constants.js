/**
 * Analytics Module Constants
 *
 * @module signalforge/server/modules/analytics/constants
 */
const ANALYTICS_EVENTS = Object.freeze({
  METRIC_CALCULATED: 'analytics.metric.calculated',
  METRICS_BATCH_CALCULATED: 'analytics.metrics.batch_calculated',
  REPORT_REQUESTED: 'analytics.report.requested',
  REPORT_GENERATED: 'analytics.report.generated',
  REPORT_FAILED: 'analytics.report.failed',
  REPORT_EXPORTED: 'analytics.report.exported',
  REPORT_SCHEDULED: 'analytics.report.scheduled',
  CACHE_INVALIDATED: 'analytics.cache.invalidated',
});
const METRIC_TYPES = Object.freeze({
  EQUITY_CURVE: 'EQUITY_CURVE',
  DRAWDOWN: 'DRAWDOWN',
  SHARPE_RATIO: 'SHARPE_RATIO',
  SORTINO_RATIO: 'SORTINO_RATIO',
  WIN_RATE: 'WIN_RATE',
  PROFIT_FACTOR: 'PROFIT_FACTOR',
  AVERAGE_RR: 'AVERAGE_RR',
  EXECUTION_LATENCY: 'EXECUTION_LATENCY',
  BEHAVIOR_ANALYSIS: 'BEHAVIOR_ANALYSIS',
  SYMBOL_PERFORMANCE: 'SYMBOL_PERFORMANCE',
  TRADING_CALENDAR: 'TRADING_CALENDAR',
  HEATMAP: 'HEATMAP',
});
const METRIC_TYPE_VALUES = Object.freeze(Object.values(METRIC_TYPES));
const REPORT_TYPES = Object.freeze({
  PERFORMANCE: 'PERFORMANCE',
  RISK: 'RISK',
  TRADES: 'TRADES',
  PROVIDERS: 'PROVIDERS',
  SYMBOLS: 'SYMBOLS',
  TAX: 'TAX',
  CUSTOM: 'CUSTOM',
});
const REPORT_TYPE_VALUES = Object.freeze(Object.values(REPORT_TYPES));
const REPORT_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  GENERATING: 'GENERATING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
});
const REPORT_STATUS_VALUES = Object.freeze(Object.values(REPORT_STATUSES));
const REPORT_FORMATS = Object.freeze({
  JSON: 'JSON',
  CSV: 'CSV',
  PDF: 'PDF',
});
const REPORT_FORMAT_VALUES = Object.freeze(Object.values(REPORT_FORMATS));
const DATE_RANGES = Object.freeze({
  TODAY: 'TODAY',
  YESTERDAY: 'YESTERDAY',
  LAST_7_DAYS: 'LAST_7_DAYS',
  LAST_30_DAYS: 'LAST_30_DAYS',
  LAST_90_DAYS: 'LAST_90_DAYS',
  LAST_365_DAYS: 'LAST_365_DAYS',
  MONTH_TO_DATE: 'MONTH_TO_DATE',
  YEAR_TO_DATE: 'YEAR_TO_DATE',
  ALL_TIME: 'ALL_TIME',
  CUSTOM: 'CUSTOM',
});
const DATE_RANGE_VALUES = Object.freeze(Object.values(DATE_RANGES));
const DEFAULT_METRIC_CACHE_TTL_SECONDS = 300;
const DEFAULT_REPORT_RETENTION_DAYS = 30;
const DEFAULT_EQUITY_CURVE_POINTS = 500;
const DEFAULT_HEATMAP_DAYS = 90;
const RISK_FREE_RATE_ANNUAL = 0.02;
const TRADING_DAYS_PER_YEAR = 252;
function isValidMetricType(type) {
  return METRIC_TYPE_VALUES.includes(type);
}
function isValidReportType(type) {
  return REPORT_TYPE_VALUES.includes(type);
}
function isValidReportStatus(status) {
  return REPORT_STATUS_VALUES.includes(status);
}
function isValidReportFormat(format) {
  return REPORT_FORMAT_VALUES.includes(format);
}
function isValidDateRange(range) {
  return DATE_RANGE_VALUES.includes(range);
}
module.exports.ANALYTICS_EVENTS = ANALYTICS_EVENTS;
module.exports.METRIC_TYPES = METRIC_TYPES;
module.exports.METRIC_TYPE_VALUES = METRIC_TYPE_VALUES;
module.exports.REPORT_TYPES = REPORT_TYPES;
module.exports.REPORT_TYPE_VALUES = REPORT_TYPE_VALUES;
module.exports.REPORT_STATUSES = REPORT_STATUSES;
module.exports.REPORT_STATUS_VALUES = REPORT_STATUS_VALUES;
module.exports.REPORT_FORMATS = REPORT_FORMATS;
module.exports.REPORT_FORMAT_VALUES = REPORT_FORMAT_VALUES;
module.exports.DATE_RANGES = DATE_RANGES;
module.exports.DATE_RANGE_VALUES = DATE_RANGE_VALUES;
module.exports.DEFAULT_METRIC_CACHE_TTL_SECONDS = DEFAULT_METRIC_CACHE_TTL_SECONDS;
module.exports.DEFAULT_REPORT_RETENTION_DAYS = DEFAULT_REPORT_RETENTION_DAYS;
module.exports.DEFAULT_EQUITY_CURVE_POINTS = DEFAULT_EQUITY_CURVE_POINTS;
module.exports.DEFAULT_HEATMAP_DAYS = DEFAULT_HEATMAP_DAYS;
module.exports.RISK_FREE_RATE_ANNUAL = RISK_FREE_RATE_ANNUAL;
module.exports.TRADING_DAYS_PER_YEAR = TRADING_DAYS_PER_YEAR;
module.exports.isValidMetricType = isValidMetricType;
module.exports.isValidReportType = isValidReportType;
module.exports.isValidReportStatus = isValidReportStatus;
module.exports.isValidReportFormat = isValidReportFormat;
module.exports.isValidDateRange = isValidDateRange;
