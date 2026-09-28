/**
 * Report Generator Service
 *
 * @module signalforge/server/modules/analytics/reports/report-generator
 */
const { EquityCurveService } = require('../metrics/equity-curve.service.js');
const { DrawdownService } = require('../metrics/drawdown.service.js');
const { WinRateService } = require('../metrics/win-rate.service.js');
const { ProfitFactorService } = require('../metrics/profit-factor.service.js');
const { AverageRrService } = require('../metrics/average-rr.service.js');
const { SharpeRatioService } = require('../metrics/sharpe-ratio.service.js');
const { SortinoRatioService } = require('../metrics/sortino-ratio.service.js');
const { SymbolPerformanceService } = require('../metrics/symbol-performance.service.js');
const { BehaviorAnalysisService } = require('../metrics/behavior-analysis.service.js');
const { REPORT_TYPES } = require('../analytics.constants.js');

export class ReportGeneratorService {
  constructor(dependencies = {}) {
    this.equity = dependencies.equity || new EquityCurveService();
    this.drawdown = dependencies.drawdown || new DrawdownService();
    this.winRate = dependencies.winRate || new WinRateService();
    this.profitFactor = dependencies.profitFactor || new ProfitFactorService();
    this.averageRr = dependencies.averageRr || new AverageRrService();
    this.sharpe = dependencies.sharpe || new SharpeRatioService();
    this.sortino = dependencies.sortino || new SortinoRatioService();
    this.symbolPerformance = dependencies.symbolPerformance || new SymbolPerformanceService();
    this.behavior = dependencies.behavior || new BehaviorAnalysisService();
  }

  generate(reportType, trades, options = {}) {
    switch (reportType) {
      case REPORT_TYPES.PERFORMANCE:
        return this.generatePerformanceReport(trades, options);
      case REPORT_TYPES.RISK:
        return this.generateRiskReport(trades, options);
      case REPORT_TYPES.TRADES:
        return this.generateTradesReport(trades, options);
      case REPORT_TYPES.SYMBOLS:
        return this.generateSymbolsReport(trades, options);
      case REPORT_TYPES.PROVIDERS:
        return this.generateProvidersReport(trades, options);
      default:
        return this.generateCustomReport(trades, options);
    }
  }

  generatePerformanceReport(trades, options) {
    return {
      reportType: REPORT_TYPES.PERFORMANCE,
      generatedAt: new Date().toISOString(),
      period: options.period || null,
      summary: {
        totalTrades: trades.length,
        winRate: this.winRate.calculate(trades),
        profitFactor: this.profitFactor.calculate(trades),
        averageRr: this.averageRr.calculate(trades),
        sharpeRatio: this.sharpe.calculate(trades),
        sortinoRatio: this.sortino.calculate(trades),
      },
      equityCurve: this.equity.calculate(trades, options),
      drawdown: this.drawdown.calculate(trades),
      symbols: this.symbolPerformance.calculate(trades),
    };
  }

  generateRiskReport(trades, options) {
    return {
      reportType: REPORT_TYPES.RISK,
      generatedAt: new Date().toISOString(),
      period: options.period || null,
      drawdown: this.drawdown.calculate(trades),
      sharpeRatio: this.sharpe.calculate(trades),
      sortinoRatio: this.sortino.calculate(trades),
      behavior: this.behavior.calculate(trades),
    };
  }

  generateTradesReport(trades) {
    return {
      reportType: REPORT_TYPES.TRADES,
      generatedAt: new Date().toISOString(),
      totalTrades: trades.length,
      trades: trades.map((t) => ({
        id: t.id,
        symbol: t.normalized_symbol,
        direction: t.direction,
        volume: t.volume,
        entryPrice: t.entry_price,
        exitPrice: t.exit_price,
        profit: t.realized_profit,
        commission: t.commission,
        swap: t.swap,
        openedAt: t.opened_at,
        closedAt: t.closed_at,
      })),
    };
  }

  generateSymbolsReport(trades) {
    return {
      reportType: REPORT_TYPES.SYMBOLS,
      generatedAt: new Date().toISOString(),
      symbols: this.symbolPerformance.calculate(trades),
    };
  }

  generateProvidersReport(trades) {
    const buckets = new Map();
    for (const trade of trades) {
      const providerId = trade.provider_id;
      if (!providerId) {
        continue;
      }
      if (!buckets.has(providerId)) {
        buckets.set(providerId, []);
      }
      buckets.get(providerId).push(trade);
    }

    const providers = [];
    for (const [providerId, providerTrades] of buckets.entries()) {
      const totalProfit = providerTrades.reduce(
        (sum, t) => sum + Number(t.realized_profit || 0),
        0,
      );
      providers.push({
        providerId,
        tradeCount: providerTrades.length,
        totalProfit: Number(totalProfit.toFixed(2)),
        winRate: this.winRate.calculate(providerTrades),
      });
    }

    return {
      reportType: REPORT_TYPES.PROVIDERS,
      generatedAt: new Date().toISOString(),
      providers,
    };
  }

  generateCustomReport(trades, options) {
    return {
      reportType: REPORT_TYPES.CUSTOM,
      generatedAt: new Date().toISOString(),
      period: options.period || null,
      totalTrades: trades.length,
      trades,
    };
  }
}
module.exports = ReportGeneratorService;