/**
 * Trader Intelligence Service (facade)
 *
 * @module signalforge/server/modules/trader-intelligence/service
 */

import { IntelligenceRepository } from './intelligence.repository.js';
import { ConsistencyService } from './analysis/consistency.js';
import { DisciplineService } from './analysis/discipline.js';
import { HoldingTimeService } from './analysis/holding-time.js';
import { MartingaleDetectorService } from './analysis/martingale-detector.js';
import { GridDetectorService } from './analysis/grid-detector.js';
import { NewsExposureService } from './analysis/news-exposure.js';
import { RecoveryTradingService } from './analysis/recovery-trading.js';
import { AverageRrService } from './analysis/average-rr.js';
import { StyleClassifierService } from './classification/style-classifier.js';
import { RiskClassifierService } from './classification/risk-classifier.js';
import { BehaviorClassifierService } from './classification/behavior-classifier.js';
import { BehaviorTimelineService } from './timeline/service.js';
import {
  ANALYSIS_WINDOWS,
  MAX_ANALYSIS_LIMIT,
  DEFAULT_ANALYSIS_LIMIT,
  MIN_TRADES_FOR_CLASSIFICATION,
} from './intelligence.constants.js';
import {
  TraderIntelligenceNotFoundError,
  InsufficientTradesError,
  InvalidAnalysisRequestError,
} from './intelligence.errors.js';
import {
  emitAnalysisStarted,
  emitAnalysisCompleted,
  emitAnalysisFailed,
  emitStyleClassified,
  emitRiskClassified,
  emitBehaviorClassified,
  emitMartingaleDetected,
  emitGridDetected,
  emitRecoveryTradingDetected,
  emitNewsOverexposureDetected,
  emitDisciplineAlert,
} from './intelligence.events.js';
import { getLogger } from '../../bootstrap/initLogger.js';

export class TraderIntelligenceService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new IntelligenceRepository();
    this.consistency = dependencies.consistency || new ConsistencyService();
    this.discipline = dependencies.discipline || new DisciplineService();
    this.holdingTime = dependencies.holdingTime || new HoldingTimeService();
    this.martingale = dependencies.martingale || new MartingaleDetectorService();
    this.grid = dependencies.grid || new GridDetectorService();
    this.newsExposure = dependencies.newsExposure || new NewsExposureService();
    this.recovery = dependencies.recovery || new RecoveryTradingService();
    this.averageRr = dependencies.averageRr || new AverageRrService();
    this.styleClassifier = dependencies.styleClassifier || new StyleClassifierService();
    this.riskClassifier = dependencies.riskClassifier || new RiskClassifierService();
    this.behaviorClassifier =
      dependencies.behaviorClassifier || new BehaviorClassifierService();
    this.timeline =
      dependencies.timeline || new BehaviorTimelineService(dependencies.timelineRepository);
    this.logger = getLogger('trader-intelligence');
  }

  async analyze(userId, options = {}) {
    const window = options.window || ANALYSIS_WINDOWS.ALL_TIME;
    const limit = Math.min(
      Math.max(Number(options.limit) || DEFAULT_ANALYSIS_LIMIT, 1),
      MAX_ANALYSIS_LIMIT,
    );

    await emitAnalysisStarted(userId, window, { limit });

    try {
      const trades = await this.repository.getClosedTrades(userId, {
        ...options,
        limit,
      });

      if (trades.length < MIN_TRADES_FOR_CLASSIFICATION) {
        throw new InsufficientTradesError(undefined, {
          found: trades.length,
          minimum: MIN_TRADES_FOR_CLASSIFICATION,
        });
      }

      const consistency = this.consistency.calculate(trades);
      const discipline = this.discipline.calculate(trades);
      const holdingTime = this.holdingTime.calculate(trades);
      const martingale = this.martingale.calculate(trades);
      const grid = this.grid.calculate(trades);
      const recovery = this.recovery.calculate(trades);
      const newsExposure = await this.newsExposure.calculate(userId, trades);
      const averageRr = this.averageRr.calculate(trades);

      const style = this.styleClassifier.classify({
        trades,
        holdingTime,
        martingale,
        grid,
      });

      const riskStyle = this.riskClassifier.classify({
        trades,
        maxDrawdownPercent: 0,
        averageRr: averageRr.averageRr,
      });

      const behavior = this.behaviorClassifier.classify({
        consistencyScore: consistency.score,
        disciplineScore: discipline.score,
        martingale,
        grid,
        recoveryTrading: recovery,
        newsExposure,
      });

      const alerts = [];
      if (discipline.alerts) {
        for (const a of discipline.alerts) {
          alerts.push(a);
          await emitDisciplineAlert(userId, a);
        }
      }
      if (martingale.detected) {
        await emitMartingaleDetected(userId, martingale.score);
      }
      if (grid.detected) {
        await emitGridDetected(userId, grid.score);
      }
      if (recovery.detected) {
        await emitRecoveryTradingDetected(userId, recovery.score);
      }
      if (newsExposure.detected) {
        await emitNewsOverexposureDetected(userId, newsExposure.score);
      }

      const analysis = {
        trades: trades.length,
        consistency,
        discipline,
        holdingTime,
        martingale,
        grid,
        recovery,
        newsExposure,
        averageRr,
      };

      const snapshot = await this.repository.upsertSnapshot({
        userId,
        window,
        tradingStyle: style.style,
        riskStyle: riskStyle.riskStyle,
        behaviorCategory: behavior.category,
        consistencyScore: consistency.score,
        disciplineScore: discipline.score,
        averageHoldingMinutes: holdingTime.averageMinutes,
        martingaleScore: martingale.score,
        gridScore: grid.score,
        newsExposureScore: newsExposure.score,
        recoveryScore: recovery.score,
        averageRr: averageRr.averageRr,
        disciplineAlerts: alerts,
        analysis,
      });

      await emitStyleClassified(userId, style.style, style.confidence);
      await emitRiskClassified(userId, riskStyle.riskStyle, riskStyle.score);
      await emitBehaviorClassified(userId, behavior.category, behavior.score);
      await emitAnalysisCompleted(userId, window, {
        tradingStyle: style.style,
        riskStyle: riskStyle.riskStyle,
        behaviorCategory: behavior.category,
      });

      return this.serialize(snapshot, analysis);
    } catch (error) {
      await emitAnalysisFailed(userId, window, error);
      throw error;
    }
  }

  async getSnapshot(userId, window = ANALYSIS_WINDOWS.ALL_TIME) {
    const snapshot = await this.repository.findSnapshotByUser(userId, window);
    if (!snapshot) {
      throw new TraderIntelligenceNotFoundError();
    }
    return this.serialize(snapshot);
  }

  async listSnapshots(userId) {
    const rows = await this.repository.listSnapshots(userId);
    return rows.map((row) => this.serialize(row));
  }

  async recordTimelineEvent(data) {
    return this.timeline.recordEvent(data);
  }

  async listTimeline(userId, filters, pagination) {
    return this.timeline.list(userId, filters, pagination);
  }

  async clearTimeline(userId) {
    return this.timeline.clear(userId);
  }

  serialize(row, analysis = null) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      window: row.window,
      tradingStyle: row.trading_style,
      riskStyle: row.risk_style,
      behaviorCategory: row.behavior_category,
      consistencyScore: row.consistency_score,
      disciplineScore: row.discipline_score,
      averageHoldingMinutes: row.average_holding_minutes,
      martingaleScore: row.martingale_score,
      gridScore: row.grid_score,
      newsExposureScore: row.news_exposure_score,
      recoveryScore: row.recovery_score,
      averageRr: row.average_rr,
      disciplineAlerts: this.parseJson(row.discipline_alerts),
      analysis: analysis || this.parseJson(row.analysis),
      computedAt: row.computed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  parseJson(input) {
    if (!input) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export { InvalidAnalysisRequestError };

export default TraderIntelligenceService;