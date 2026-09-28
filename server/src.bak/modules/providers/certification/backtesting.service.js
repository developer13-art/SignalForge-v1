/**
 * Certification Backtesting Service
 *
 * @module signalforge/server/modules/providers/certification/backtesting
 */

import { AccuracyCalculatorService } from './accuracy.js';
import { ConsistencyScoreService } from './consistency.js';
import { RiskAssessmentService } from './risk.js';
import { emitBacktestCompleted } from '../provider.events.js';

export class BacktestingService {
  constructor(dependencies = {}) {
    this.accuracy = dependencies.accuracy || new AccuracyCalculatorService();
    this.consistency = dependencies.consistency || new ConsistencyScoreService();
    this.risk = dependencies.risk || new RiskAssessmentService();
  }

  async runBacktest(providerId, certificationId, messages, parsedSignals, trades = []) {
    const signalsDetected = parsedSignals.filter((p) => p && p.classification === 'NEW_TRADE').length;
    const signalsParsed = parsedSignals.filter((p) => p && p.symbol && p.direction).length;
    const signalsValidated = parsedSignals.filter((p) => p && p.validated === true).length;
    const managementInstructionsDetected = parsedSignals.filter(
      (p) => p && p.classification === 'TRADE_MANAGEMENT',
    ).length;
    const managementInstructionsMatched = parsedSignals.filter(
      (p) => p && p.classification === 'TRADE_MANAGEMENT' && p.matched === true,
    ).length;

    const accuracySummary = this.accuracy.summarize({
      historicalMessagesImported: messages.length,
      signalsDetected,
      signalsParsed,
      signalsValidated,
      managementInstructionsDetected,
      managementInstructionsMatched,
    });

    const tradeCount = trades.length;
    const winCount = trades.filter((t) => Number(t.realized_profit || 0) > 0).length;
    const lossCount = trades.filter((t) => Number(t.realized_profit || 0) < 0).length;

    const consistencyScore = this.consistency.calculate({
      tradeCount,
      winCount,
      averageRr: tradeCount > 0 ? 2 : 0,
      variance: 0.1,
    });

    const maxDrawdownPercent = 0;
    const averageRiskPercent = 1;
    const riskScore = this.risk.calculate({
      maxDrawdownPercent,
      averageRiskPercent,
      longestLosingStreak: 3,
      martingaleDetected: false,
      newsTradeCount: 0,
      tradeCount,
    });

    const summary = {
      ...accuracySummary,
      tradeCount,
      winCount,
      lossCount,
      consistencyScore,
      riskScore,
      riskLevel: this.risk.classify(riskScore),
      consistencyLevel: this.consistency.classify(consistencyScore),
    };

    await emitBacktestCompleted(providerId, certificationId, summary);

    return summary;
  }
}

export default BacktestingService;