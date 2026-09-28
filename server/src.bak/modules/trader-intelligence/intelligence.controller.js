/**
 * Trader Intelligence Controller
 *
 * @module signalforge/server/modules/trader-intelligence/controller
 */

import { TraderIntelligenceService } from './service.js';
import { ANALYSIS_WINDOWS } from './intelligence.constants.js';

export class TraderIntelligenceController {
  constructor(service = null) {
    this.service = service || new TraderIntelligenceService();
  }

  getOverview = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const snapshots = await this.service.listSnapshots(userId);
      res.status(200).json({ snapshots });
    } catch (error) {
      next(error);
    }
  };

  analyze = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const snapshot = await this.service.analyze(userId, {
        window: req.body.window || ANALYSIS_WINDOWS.ALL_TIME,
        limit: req.body.limit,
        since: req.body.since,
        until: req.body.until,
        symbol: req.body.symbol,
      });
      res.status(200).json({ snapshot });
    } catch (error) {
      next(error);
    }
  };

  getSnapshot = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const window = req.query.window || ANALYSIS_WINDOWS.ALL_TIME;
      const snapshot = await this.service.getSnapshot(userId, window);
      res.status(200).json({ snapshot });
    } catch (error) {
      next(error);
    }
  };

  getConsistency = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const snapshot = await this.service.getSnapshot(userId);
      res.status(200).json({
        consistency: snapshot.consistencyScore,
        discipline: snapshot.disciplineScore,
        analysis: snapshot.analysis?.consistency || null,
      });
    } catch (error) {
      next(error);
    }
  };

  getDiscipline = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const snapshot = await this.service.getSnapshot(userId);
      res.status(200).json({
        disciplineScore: snapshot.disciplineScore,
        alerts: snapshot.disciplineAlerts,
        analysis: snapshot.analysis?.discipline || null,
      });
    } catch (error) {
      next(error);
    }
  };

  getHoldingTime = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const snapshot = await this.service.getSnapshot(userId);
      res.status(200).json({
        averageHoldingMinutes: snapshot.averageHoldingMinutes,
        analysis: snapshot.analysis?.holdingTime || null,
      });
    } catch (error) {
      next(error);
    }
  };

  getRiskBehavior = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const snapshot = await this.service.getSnapshot(userId);
      res.status(200).json({
        riskStyle: snapshot.riskStyle,
        martingaleScore: snapshot.martingaleScore,
        gridScore: snapshot.gridScore,
        recoveryScore: snapshot.recoveryScore,
        newsExposureScore: snapshot.newsExposureScore,
        analysis: snapshot.analysis?.riskBehavior || null,
      });
    } catch (error) {
      next(error);
    }
  };

  getMartingaleDetection = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const snapshot = await this.service.getSnapshot(userId);
      res.status(200).json({
        score: snapshot.martingaleScore,
        detected: (snapshot.martingaleScore || 0) >= 0.5,
        analysis: snapshot.analysis?.martingale || null,
      });
    } catch (error) {
      next(error);
    }
  };

  getGridDetection = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const snapshot = await this.service.getSnapshot(userId);
      res.status(200).json({
        score: snapshot.gridScore,
        detected: (snapshot.gridScore || 0) >= 0.5,
        analysis: snapshot.analysis?.grid || null,
      });
    } catch (error) {
      next(error);
    }
  };

  getNewsExposure = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const snapshot = await this.service.getSnapshot(userId);
      res.status(200).json({
        score: snapshot.newsExposureScore,
        detected: (snapshot.newsExposureScore || 0) >= 0.5,
        analysis: snapshot.analysis?.newsExposure || null,
      });
    } catch (error) {
      next(error);
    }
  };

  getRecoveryTrading = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const snapshot = await this.service.getSnapshot(userId);
      res.status(200).json({
        score: snapshot.recoveryScore,
        detected: (snapshot.recoveryScore || 0) >= 0.5,
        analysis: snapshot.analysis?.recovery || null,
      });
    } catch (error) {
      next(error);
    }
  };

  getStyleClassification = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const snapshot = await this.service.getSnapshot(userId);
      res.status(200).json({
        tradingStyle: snapshot.tradingStyle,
        riskStyle: snapshot.riskStyle,
        behaviorCategory: snapshot.behaviorCategory,
      });
    } catch (error) {
      next(error);
    }
  };

  getBehaviorTimeline = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const filters = {
        eventType: req.query.eventType,
        since: req.query.since,
        until: req.query.until,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listTimeline(userId, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  recordTimelineEvent = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const event = await this.service.recordTimelineEvent({
        userId,
        eventType: req.body.eventType,
        referenceId: req.body.referenceId,
        score: req.body.score,
        details: req.body.details,
        metadata: req.body.metadata,
        occurredAt: req.body.occurredAt,
      });
      res.status(201).json({ event });
    } catch (error) {
      next(error);
    }
  };

  clearTimeline = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const result = await this.service.clearTimeline(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default TraderIntelligenceController;