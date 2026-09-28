/**
 * Trader Intelligence Routes
 *
 * @module signalforge/server/modules/trader-intelligence/routes
 */

import { Router } from 'express';

import { TraderIntelligenceController } from './intelligence.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';

export function buildTraderIntelligenceRouter(controller = null) {
  const router = Router();
  const intelligenceController =
    controller || new TraderIntelligenceController();

  router.use(authenticationMiddleware());

  router.get('/trader-intelligence', intelligenceController.getOverview);
  router.post('/trader-intelligence/analyze', intelligenceController.analyze);
  router.get('/trader-intelligence/snapshot', intelligenceController.getSnapshot);

  router.get('/trader-intelligence/consistency', intelligenceController.getConsistency);
  router.get('/trader-intelligence/discipline', intelligenceController.getDiscipline);
  router.get('/trader-intelligence/holding-time', intelligenceController.getHoldingTime);
  router.get('/trader-intelligence/risk-behavior', intelligenceController.getRiskBehavior);
  router.get(
    '/trader-intelligence/martingale',
    intelligenceController.getMartingaleDetection,
  );
  router.get('/trader-intelligence/grid', intelligenceController.getGridDetection);
  router.get('/trader-intelligence/news-exposure', intelligenceController.getNewsExposure);
  router.get(
    '/trader-intelligence/recovery-trading',
    intelligenceController.getRecoveryTrading,
  );
  router.get(
    '/trader-intelligence/style-classification',
    intelligenceController.getStyleClassification,
  );

  router.get(
    '/trader-intelligence/timeline',
    intelligenceController.getBehaviorTimeline,
  );
  router.post(
    '/trader-intelligence/timeline',
    intelligenceController.recordTimelineEvent,
  );
  router.delete(
    '/trader-intelligence/timeline',
    intelligenceController.clearTimeline,
  );

  return router;
}

export default buildTraderIntelligenceRouter;