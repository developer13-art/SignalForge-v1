/**
 * Analytics Module Constants
 *
 * @module signalforge/server/modules/analytics/constants
 */

export const ANALYTICS_EVENTS = Object.freeze({
  METRIC_CALCULATED: 'analytics.metric.calculated',
  METRICS_BATCH_CALCULATED: 'analytics.metrics.batch_calculated',
  REPORT_REQUESTED: 'analytics.report.requested',
  REPORT_GENERATED: 'analytics.report.generated',
  REPORT_FAILED: 'analytics.report.failed',
  REPORT_EXPORTED: 'analytics.report.exported',
  REPORT_SCHEDULED: 'analytics.report.scheduled',
  CACHE_INVALIDATED: 'analytics.cache.invalidated',
});

export const METRIC_TYPES = Object.freeze({
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

export const METRIC_TYPE_VALUES = Object.freeze(Object.values(METRIC_TYPES));

export const REPORT_TYPES = Object.freeze({
  PERFORMANCE: 'PERFORMANCE',
  RISK: 'RISK',
  TRADES: 'TRADES',
  PROVIDERS: 'PROVIDERS',
  SYMBOLS: 'SYMBOLS',
  TAX: 'TAX',
  CUSTOM: 'CUSTOM',
});

export const REPORT_TYPE_VALUES = Object.freeze(Object.values(REPORT_TYPES));

export const REPORT_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  GENERATING: 'GENERATING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
});

export const REPORT_STATUS_VALUES = Object.freeze(Object.values(REPORT_STATUSES));

export const REPORT_FORMATS = Object.freeze({
  JSON: 'JSON',
  CSV: 'CSV',
  PDF: 'PDF',
});

export const REPORT_FORMAT_VALUES = Object.freeze(Object.values(REPORT_FORMATS));

export const DATE_RANGES = Object.freeze({
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

export const DATE_RANGE_VALUES = Object.freeze(Object.values(DATE_RANGES));

export const DEFAULT_METRIC_CACHE_TTL_SECONDS = 300;
export const DEFAULT_REPORT_RETENTION_DAYS = 30;
export const DEFAULT_EQUITY_CURVE_POINTS = 500;
export const DEFAULT_HEATMAP_DAYS = 90;

export const RISK_FREE_RATE_ANNUAL = 0.02;
export const TRADING_DAYS_PER_YEAR = 252;

export function isValidMetricType(type) {
  return METRIC_TYPE_VALUES.includes(type);
}

export function isValidReportType(type) {
  return REPORT_TYPE_VALUES.includes(type);
}

export function isValidReportStatus(status) {
  return REPORT_STATUS_VALUES.includes(status);
}

export function isValidReportFormat(format) {
  return REPORT_FORMAT_VALUES.includes(format);
}

export function isValidDateRange(range) {
  return DATE_RANGE_VALUES.includes(range);
}