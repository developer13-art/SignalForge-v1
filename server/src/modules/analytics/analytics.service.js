/**
 * Analytics Service (facade)
 *
 * @module signalforge/server/modules/analytics/service
 */

import { AnalyticsRepository } from './analytics.repository.js';
import { AnalyticsFilterService } from './filters/analytics-filter.service.js';
import { DateRangeService } from './filters/date-range.service.js';

import { EquityCurveService } from './metrics/equity-curve.service.js';
import { DrawdownService } from './metrics/drawdown.service.js';
import { WinRateService } from './metrics/win-rate.service.js';
import { ProfitFactorService } from './metrics/profit-factor.service.js';
import { AverageRrService } from './metrics/average-rr.service.js';
import { SharpeRatioService } from './metrics/sharpe-ratio.service.js';
import { SortinoRatioService } from './metrics/sortino-ratio.service.js';
import { ExecutionLatencyService } from './metrics/execution-latency.service.js';
import { SymbolPerformanceService } from './metrics/symbol-performance.service.js';
import { BehaviorAnalysisService } from './metrics/behavior-analysis.service.js';

import { TradingCalendarService } from './calendar/trading-calendar.service.js';
import { HeatmapService } from './calendar/heatmap.service.js';

import { ReportService } from './reports/report.service.js';

import { METRIC_TYPES } from './analytics.constants.js';
import { emitMetricCalculated, emitMetricsBatchCalculated } from './analytics.events.js';

export class AnalyticsService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new AnalyticsRepository();
    this.filters = dependencies.filters || new AnalyticsFilterService();
    this.dateRange = dependencies.dateRange || new DateRangeService();

    this.equityCurve = dependencies.equityCurve || new EquityCurveService();
    this.drawdown = dependencies.drawdown || new DrawdownService();
    this.winRate = dependencies.winRate || new WinRateService();
    this.profitFactor = dependencies.profitFactor || new ProfitFactorService();
    this.averageRr = dependencies.averageRr || new AverageRrService();
    this.sharpe = dependencies.sharpe || new SharpeRatioService();
    this.sortino = dependencies.sortino || new SortinoRatioService();
    this.latency = dependencies.latency || new ExecutionLatencyService(this.repository);
    this.symbolPerformance =
      dependencies.symbolPerformance || new SymbolPerformanceService();
    this.behavior = dependencies.behavior || new BehaviorAnalysisService();

    this.tradingCalendar = dependencies.tradingCalendar || new TradingCalendarService();
    this.heatmap = dependencies.heatmap || new HeatmapService();

    this.reports = dependencies.reports || new ReportService({
      analyticsRepository: this.repository,
    });
  }

  async getTradesForAnalysis(userId, filters = {}) {
    const normalized = this.filters.build(filters);
    return this.repository.getClosedTradesForPeriod(userId, normalized);
  }

  async getOverview(userId, filters = {}) {
    const trades = await this.getTradesForAnalysis(userId, filters);
    return {
      totalTrades: trades.length,
      winRate: this.winRate.calculate(trades),
      profitFactor: this.profitFactor.calculate(trades),
      averageRr: this.averageRr.calculate(trades),
      drawdown: this.drawdown.calculate(trades),
      sharpeRatio: this.sharpe.calculate(trades),
      sortinoRatio: this.sortino.calculate(trades),
    };
  }

  async getEquityCurve(userId, filters = {}, options = {}) {
    const trades = await this.getTradesForAnalysis(userId, filters);
    const result = this.equityCurve.calculate(trades, options);
    await emitMetricCalculated(userId, METRIC_TYPES.EQUITY_CURVE, {
      endEquity: result.endEquity,
    });
    return result;
  }

  async getDrawdown(userId, filters = {}) {
    const trades = await this.getTradesForAnalysis(userId, filters);
    const result = this.drawdown.calculate(trades);
    await emitMetricCalculated(userId, METRIC_TYPES.DRAWDOWN, {
      maxDrawdown: result.maxDrawdown,
    });
    return result;
  }

  async getWinRate(userId, filters = {}) {
    const trades = await this.getTradesForAnalysis(userId, filters);
    const result = this.winRate.calculate(trades);
    await emitMetricCalculated(userId, METRIC_TYPES.WIN_RATE, {
      winRate: result.winRate,
    });
    return result;
  }

  async getProfitFactor(userId, filters = {}) {
    const trades = await this.getTradesForAnalysis(userId, filters);
    const result = this.profitFactor.calculate(trades);
    await emitMetricCalculated(userId, METRIC_TYPES.PROFIT_FACTOR, {
      profitFactor: result.profitFactor,
    });
    return result;
  }

  async getAverageRr(userId, filters = {}) {
    const trades = await this.getTradesForAnalysis(userId, filters);
    const result = this.averageRr.calculate(trades);
    await emitMetricCalculated(userId, METRIC_TYPES.AVERAGE_RR, {
      averageRr: result.averageRr,
    });
    return result;
  }

  async getSharpeRatio(userId, filters = {}) {
    const trades = await this.getTradesForAnalysis(userId, filters);
    const result = this.sharpe.calculate(trades);
    await emitMetricCalculated(userId, METRIC_TYPES.SHARPE_RATIO, {
      sharpeRatio: result.sharpeRatio,
    });
    return result;
  }

  async getSortinoRatio(userId, filters = {}) {
    const trades = await this.getTradesForAnalysis(userId, filters);
    const result = this.sortino.calculate(trades);
    await emitMetricCalculated(userId, METRIC_TYPES.SORTINO_RATIO, {
      sortinoRatio: result.sortinoRatio,
    });
    return result;
  }

  async getExecutionLatency(userId, filters = {}) {
    const normalized = this.filters.build(filters);
    const result = await this.latency.calculate(userId, normalized);
    await emitMetricCalculated(userId, METRIC_TYPES.EXECUTION_LATENCY, {
      averageMs: result.averageMs,
    });
    return {
      ...result,
      classification: this.latency.classify(result.averageMs),
    };
  }

  async getSymbolPerformance(userId, filters = {}) {
    const trades = await this.getTradesForAnalysis(userId, filters);
    const result = this.symbolPerformance.calculate(trades);
    await emitMetricCalculated(userId, METRIC_TYPES.SYMBOL_PERFORMANCE, {
      symbolCount: result.symbols.length,
    });
    return result;
  }

  async getBehaviorAnalysis(userId, filters = {}) {
    const trades = await this.getTradesForAnalysis(userId, filters);
    const result = this.behavior.calculate(trades);
    await emitMetricCalculated(userId, METRIC_TYPES.BEHAVIOR_ANALYSIS, null);
    return result;
  }

  async getTradingCalendar(userId, filters = {}) {
    const normalized = this.filters.build(filters);
    const result = await this.tradingCalendar.build(userId, normalized);
    await emitMetricCalculated(userId, METRIC_TYPES.TRADING_CALENDAR, {
      totalDays: result.summary.totalDays,
    });
    return result;
  }

  async getHeatmapByDay(userId, filters = {}) {
    const normalized = this.filters.build(filters);
    return this.heatmap.buildByDay(userId, normalized);
  }

  async getHeatmapBySymbol(userId, filters = {}) {
    const normalized = this.filters.build(filters);
    return this.heatmap.buildBySymbol(userId, normalized);
  }

  async getBatchMetrics(userId, metricTypes, filters = {}) {
    const results = {};
    for (const metricType of metricTypes) {
      try {
        switch (metricType) {
          case METRIC_TYPES.EQUITY_CURVE:
            results[metricType] = await this.getEquityCurve(userId, filters);
            break;
          case METRIC_TYPES.DRAWDOWN:
            results[metricType] = await this.getDrawdown(userId, filters);
            break;
          case METRIC_TYPES.WIN_RATE:
            results[metricType] = await this.getWinRate(userId, filters);
            break;
          case METRIC_TYPES.PROFIT_FACTOR:
            results[metricType] = await this.getProfitFactor(userId, filters);
            break;
          case METRIC_TYPES.AVERAGE_RR:
            results[metricType] = await this.getAverageRr(userId, filters);
            break;
          case METRIC_TYPES.SHARPE_RATIO:
            results[metricType] = await this.getSharpeRatio(userId, filters);
            break;
          case METRIC_TYPES.SORTINO_RATIO:
            results[metricType] = await this.getSortinoRatio(userId, filters);
            break;
          case METRIC_TYPES.EXECUTION_LATENCY:
            results[metricType] = await this.getExecutionLatency(userId, filters);
            break;
          case METRIC_TYPES.SYMBOL_PERFORMANCE:
            results[metricType] = await this.getSymbolPerformance(userId, filters);
            break;
          case METRIC_TYPES.BEHAVIOR_ANALYSIS:
            results[metricType] = await this.getBehaviorAnalysis(userId, filters);
            break;
          case METRIC_TYPES.TRADING_CALENDAR:
            results[metricType] = await this.getTradingCalendar(userId, filters);
            break;
          default:
            results[metricType] = null;
        }
      } catch (error) {
        results[metricType] = { error: error.message };
      }
    }

    await emitMetricsBatchCalculated(userId, Object.keys(results));

    return results;
  }

  async getStatusCounts(userId, filters) {
    return this.repository.countByStatus ? this.repository.countByStatus(userId, filters) : [];
  }

  async requestReport(userId, payload) {
    return this.reports.requestReport(userId, payload);
  }

  async getReport(userId, reportId) {
    return this.reports.getReport(userId, reportId);
  }

  async listReports(userId, filters, pagination) {
    return this.reports.listReports(userId, filters, pagination);
  }

  async exportReport(userId, reportId, format) {
    return this.reports.exportReport(userId, reportId, format);
  }

  async deleteReport(userId, reportId) {
    return this.reports.deleteReport(userId, reportId);
  }
}

export default AnalyticsService;